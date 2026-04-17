import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ChevronLeft, CreditCard, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore, useTableStore } from '@/store';
import { formatDate, formatTime, generateBookingId, findOptimalTable, formatCurrency } from '@/lib/mockData';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Mock Stripe key - in production, use environment variable
const stripePromise = loadStripe('pk_test_your_publishable_key');

const PaymentForm = ({ 
  onSuccess, 
  amount 
}: { 
  onSuccess: () => void; 
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

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-6">
        <Label className="text-[#A9B1BE] mb-2 block">Card Details</Label>
        <div className="input-luxury p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#F4F6FA',
                  '::placeholder': {
                    color: '#A9B1BE',
                  },
                },
              },
            }}
          />
        </div>
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
            Processing...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={18} />
            Pay {formatCurrency(amount)} deposit
          </span>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[#A9B1BE] text-sm">
        <Shield size={16} />
        <span>Secure payment powered by Stripe</span>
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

  // Redirect if no date/time selected
  if (!selectedDate || !selectedTime) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1 className="font-serif text-3xl text-[#F4F6FA] mb-4">
            No Booking Selected
          </h1>
          <p className="text-[#A9B1BE] mb-8">
            Please select a date, time, and number of guests to continue.
          </p>
          <Button onClick={() => navigate('/')} className="btn-gold">
            Return to Home
          </Button>
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

  const handlePaymentSuccess = () => {
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

    addBooking(newBooking);
    setIsConfirmed(true);

    // Navigate to confirmation page after brief delay
    setTimeout(() => {
      navigate('/confirmation', { state: { booking: newBooking } });
    }, 1500);
  };

  const depositAmount = 5;

  return (
    <div className="min-h-screen bg-[#0B0C0F] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Back to home
        </button>

        {/* Header */}
        <div className="mb-10">
          <span className="eyebrow block mb-3">Complete Your Reservation</span>
          <h1 className="font-serif text-[clamp(32px,4vw,56px)] uppercase text-[#F4F6FA] leading-[0.95]">
            Book a table
          </h1>
        </div>

        {/* Booking Summary */}
        <div className="glass-card p-6 mb-8">
          <h3 className="font-serif text-xl text-[#F4F6FA] mb-4">Reservation Details</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#A9B1BE] text-sm">Date</p>
                <p className="text-[#F4F6FA]">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#A9B1BE] text-sm">Time</p>
                <p className="text-[#F4F6FA]">{formatTime(selectedTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={20} className="text-[#D4A23A]" />
              <div>
                <p className="text-[#A9B1BE] text-sm">Guests</p>
                <p className="text-[#F4F6FA]">{selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#D4A23A]' : 'text-[#A9B1BE]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A2F3A] text-[#A9B1BE]'}`}>
              1
            </div>
            <span className="text-sm hidden sm:inline">Details</span>
          </div>
          <div className="flex-1 h-px bg-[#2A2F3A]" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#D4A23A]' : 'text-[#A9B1BE]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A2F3A] text-[#A9B1BE]'}`}>
              2
            </div>
            <span className="text-sm hidden sm:inline">Payment</span>
          </div>
          <div className="flex-1 h-px bg-[#2A2F3A]" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#D4A23A]' : 'text-[#A9B1BE]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#D4A23A] text-[#0B0C0F]' : 'bg-[#2A2F3A] text-[#A9B1BE]'}`}>
              3
            </div>
            <span className="text-sm hidden sm:inline">Confirm</span>
          </div>
        </div>

        {/* Step 1: Contact Details */}
        {step === 1 && (
          <div className="glass-card p-8">
            <h3 className="font-serif text-xl text-[#F4F6FA] mb-6">Contact Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-[#A9B1BE] mb-2 block">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-luxury"
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[#A9B1BE] mb-2 block">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-luxury"
                  placeholder="Doe"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#A9B1BE] mb-2 block">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-luxury"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#A9B1BE] mb-2 block">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-luxury"
                  placeholder="+44 7123 456789"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="specialRequests" className="text-[#A9B1BE] mb-2 block">
                  Special Requests (Optional)
                </Label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="input-luxury w-full h-24 resize-none"
                  placeholder="Any dietary requirements or special occasions..."
                />
              </div>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
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
            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors mt-4"
            >
              Back to details
            </button>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {isConfirmed && (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-emerald-500" />
            </div>
            <h3 className="font-serif text-2xl text-[#F4F6FA] mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-[#A9B1BE] mb-6">
              Redirecting to your confirmation page...
            </p>
          </div>
        )}

        {/* Deposit Info */}
        <div className="mt-8 p-4 bg-[#D4A23A]/10 border border-[#D4A23A]/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-[#D4A23A] mt-0.5" />
            <div>
              <p className="text-[#F4F6FA] font-medium mb-1">£5 Deposit Required</p>
              <p className="text-[#A9B1BE] text-sm">
                A small deposit secures your reservation and helps us reduce no-shows. 
                Fully refundable with 24 hours notice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
