import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  CreditCard,
  Check,
  Shield,
  LockKeyhole,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingCard } from '@/components/customer/BookingCard';
import { useBookingStore, useTableStore } from '@/store';
import { formatDate, formatTime, generateBookingId, findOptimalTable, formatCurrency } from '@/lib/mockData';
import { saveBookingToSupabase } from '@/lib/supabaseBookingApi';
import { sendBookingConfirmationEmail } from '@/lib/bookingEmailApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Mock Stripe key - in production, use environment variable
const stripePromise = loadStripe('pk_test_your_publishable_key');

const PaymentForm = ({ 
  onSuccess, 
  amount 
}: { 
  onSuccess: () => Promise<{ ok: boolean; error?: string }>; 
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    // Simulate payment processing, then persist booking.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await onSuccess();

    if (!result.ok) {
      setError(result.error ?? 'Unable to save your booking. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="booking-light-card p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Label className="text-[#E4EAF3] text-base font-semibold block">Card Details</Label>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300/40 bg-emerald-300/10 text-emerald-200 text-xs uppercase tracking-[0.12em]">
            <LockKeyhole size={12} />
            Encrypted
          </span>
        </div>

        <div className="booking-input p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#EEF2F9',
                  '::placeholder': {
                    color: '#93A0B7',
                  },
                },
              },
            }}
          />
        </div>
        <p className="text-[#9CA8BD] text-xs mt-3">
          Your payment details are processed securely and never stored on our servers.
        </p>
        {error && (
          <p className="text-rose-400 text-sm mt-2">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full btn-gold disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
            Processing secure payment...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={18} />
            Pay {formatCurrency(amount)} deposit
          </span>
        )}
      </Button>

      <div className="grid sm:grid-cols-3 gap-2.5 text-xs">
        <div className="booking-trust-chip">
          <Shield size={13} /> PCI compliant
        </div>
        <div className="booking-trust-chip">
          <LockKeyhole size={13} /> 256-bit SSL
        </div>
        <div className="booking-trust-chip">
          <BadgeCheck size={13} /> Verified checkout
        </div>
      </div>
    </form>
  );
};

export const BookingPage = () => {
  const navigate = useNavigate();
  const { 
    selectedDate, 
    selectedTime, 
    selectedGuests, 
    addBooking 
  } = useBookingStore();
  const { tables } = useTableStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');

  // If no slot is selected yet, present an actionable booking entry point instead of a dead-end state.
  if (!selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen pastel-luxe-bg pt-32 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="booking-shell px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
              <div className="max-w-2xl">
                <span className="pastel-eyebrow block mb-3">Start Your Reservation</span>
                <h1 className="pastel-section-heading text-[clamp(38px,5vw,70px)] leading-[0.92] mb-4">
                  Choose date, time and guests
                </h1>
                <p className="pastel-copy text-lg max-w-xl">
                  Pick your preferred slot below and continue to secure your table with instant confirmation.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button onClick={() => navigate('/')} className="btn-gold btn-gold-glow">
                    Return to Home
                  </Button>
                  <Button onClick={() => navigate('/menu')} className="btn-ghost">
                    View Menu
                  </Button>
                </div>
              </div>

              <div className="lg:justify-self-end w-full max-w-[560px]">
                <BookingCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePaymentSuccess = async (): Promise<{ ok: boolean; error?: string }> => {
    setSaveError('');

    // Find optimal table
    const optimalTable = findOptimalTable(
      selectedGuests,
      tables,
      [],
      selectedDate,
      selectedTime
    );

    // Create booking
    const newBooking = {
      id: `booking-${Date.now()}`,
      bookingId: generateBookingId(),
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      date: selectedDate,
      time: selectedTime,
      guests: selectedGuests,
      tableId: optimalTable?.id,
      tableNumber: optimalTable?.tableNumber,
      status: 'confirmed' as const,
      specialRequests: formData.specialRequests,
      depositAmount: 5,
      paymentStatus: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await saveBookingToSupabase(newBooking);
    if (!saveResult.ok) {
      const errorMessage = saveResult.error ?? 'Unable to save your booking to database.';
      setSaveError(errorMessage);
      console.warn('Supabase booking save failed:', errorMessage);
      return { ok: false, error: errorMessage };
    }

    addBooking(newBooking);

    void sendBookingConfirmationEmail(newBooking).then((result) => {
      if (!result.ok) {
        console.warn('Booking confirmation email was not sent:', result.error);
      }
    });

    setIsConfirmed(true);

    // Navigate to confirmation page after brief delay
    setTimeout(() => {
      navigate('/confirmation', { state: { booking: newBooking } });
    }, 1500);

    return { ok: true };
  };

  const depositAmount = 5;
  const isDetailsValid = Boolean(formData.firstName && formData.lastName && formData.email && formData.phone);

  return (
    <div className="min-h-screen pastel-luxe-bg pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="booking-shell px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#B1B9C8] hover:text-[#F4F6FA] transition-colors mb-8 font-medium"
        >
          <ChevronLeft size={20} />
          Back to home
        </button>

        {/* Header */}
        <div className="mb-10">
          <span className="pastel-eyebrow block mb-3">Complete Your Reservation</span>
          <h1 className="pastel-section-heading text-[clamp(36px,4.6vw,62px)] leading-[0.95]">
            Book a table
          </h1>
          <p className="pastel-copy mt-2 max-w-3xl">
            Share your details once and get instant confirmation with secure payment protection.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="booking-light-card p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-serif text-[34px] text-[#F4F6FA] leading-none">Reservation Details</h3>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-300/35 bg-sky-500/10 text-sky-200 text-xs uppercase tracking-[0.14em]">
              <Shield size={12} /> Booking protected
            </span>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#9EABBF] text-sm">Date</p>
                <p className="text-[#F4F6FA]">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#9EABBF] text-sm">Time</p>
                <p className="text-[#F4F6FA]">{formatTime(selectedTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#9EABBF] text-sm">Guests</p>
                <p className="text-[#F4F6FA]">{selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#D4AF37]' : 'text-[#7F8898]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A3242] text-[#A5AFBF]'}`}>
              1
            </div>
            <span className="text-sm hidden sm:inline">Details</span>
          </div>
          <div className="flex-1 h-px bg-[#394357]" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#D4AF37]' : 'text-[#7F8898]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A3242] text-[#A5AFBF]'}`}>
              2
            </div>
            <span className="text-sm hidden sm:inline">Payment</span>
          </div>
          <div className="flex-1 h-px bg-[#394357]" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4AF37]' : 'text-[#7F8898]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A3242] text-[#A5AFBF]'}`}>
              3
            </div>
            <span className="text-sm hidden sm:inline">Confirm</span>
          </div>
        </div>

        {/* Step 1: Contact Details */}
        {step === 1 && (
          <div className="booking-light-card p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="font-serif text-[36px] text-[#F4F6FA] leading-none">Contact Information</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.06)] text-[#C7D0DF] text-xs uppercase tracking-[0.13em]">
                <LockKeyhole size={12} /> Safe & private
              </span>
            </div>

            <div className="mb-6 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] px-4 py-3 text-sm text-[#A5B0C3]">
              We only use these details for booking confirmation and arrival updates.
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-[#C7D0DF] mb-2 block">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="booking-input"
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[#C7D0DF] mb-2 block">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="booking-input"
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#C7D0DF] mb-2 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="booking-input"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#C7D0DF] mb-2 block">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="booking-input"
                  placeholder="+44 7123 456789"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="specialRequests" className="text-[#C7D0DF] mb-2 block">
                  Special Requests (Optional)
                </Label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="booking-input w-full h-24 resize-none"
                  placeholder="Any dietary requirements or special occasions..."
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!isDetailsValid}
              className="w-full btn-gold mt-8 disabled:opacity-50"
            >
              Continue to Payment
            </Button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div>
            <Elements stripe={stripePromise}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess}
                amount={depositAmount}
              />
            </Elements>
            {saveError && (
              <p className="mt-4 text-center text-sm text-rose-400">{saveError}</p>
            )}
            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-[#B2BDCF] hover:text-[#F4F6FA] transition-colors mt-4 font-medium"
            >
              Back to details
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {isConfirmed && (
          <div className="booking-light-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-emerald-500" />
            </div>
            <h3 className="font-serif text-2xl text-[#F4F6FA] mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-[#A5B0C3] mb-6">
              Redirecting to your confirmation page...
            </p>
          </div>
        )}

        {/* Deposit Info */}
        <div className="mt-8 booking-light-card p-5">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-[#D4A23A] mt-0.5" />
            <div>
              <p className="text-[#F4F6FA] font-semibold mb-1">£5 Deposit Required</p>
              <p className="text-[#A5B0C3] text-sm">
                A small deposit secures your reservation and helps us reduce no-shows. 
                Fully refundable with 24 hours notice.
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
