import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BadgeCheck, Check, CreditCard, LockKeyhole, Minus, Plus, Shield, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBookingStore, useCustomerAuthStore, useMenuCartStore } from '@/store';
import { formatCurrency, generateBookingId } from '@/mockData';
import { saveBooking, saveOnlineOrder, saveOrderItems } from '@/backendBookingApi';
import { sendBookingConfirmationEmail } from '@/bookingEmailApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';

const stripePromise = loadStripe('pk_test_your_publishable_key');

const baseSlotTimes = [
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '18:00', '18:30',
  '19:00', '19:30',
  '20:00', '20:30',
  '21:00', '21:30',
];

const getDefaultOrderSchedule = () => {
  const now = new Date();
  const date = format(now, 'yyyy-MM-dd');
  const [hoursNow, minutesNow] = [now.getHours(), now.getMinutes()];

  const time = baseSlotTimes.find((slot) => {
    const [hours, minutes] = slot.split(':').map(Number);
    if (hours > hoursNow) return true;
    if (hours === hoursNow && minutes > minutesNow + 25) return true;
    return false;
  }) ?? baseSlotTimes[0];

  return { date, time };
};

const PaymentForm = ({
  onSuccess,
  amount,
}: {
  onSuccess: () => Promise<{ ok: boolean; error?: string }>;
  amount: number;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError('');

    await new Promise((resolve) => setTimeout(resolve, 2000));
    const result = await onSuccess();

    if (!result.ok) {
      setError(result.error ?? 'Unable to save your order. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-amber-200/70 bg-white/90 p-5 shadow-[0_14px_38px_rgba(128,78,24,0.12)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Label className="block text-base font-semibold text-amber-950">Card Details</Label>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-emerald-700">
            <LockKeyhole size={12} /> Encrypted
          </span>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-white px-4 py-4 shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#3F2A1D',
                  '::placeholder': {
                    color: '#9C7A60',
                  },
                },
              },
            }}
          />
        </div>

        <p className="mt-3 text-xs text-amber-800/70">
          Your payment details are processed securely and never stored on our servers.
        </p>
        {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow-[0_12px_24px_rgba(180,95,25,0.28)] hover:from-amber-700 hover:to-amber-800 disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing secure payment...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <CreditCard size={18} />
            Pay {formatCurrency(amount)} now
          </span>
        )}
      </Button>

      <div className="grid gap-2.5 text-xs sm:grid-cols-3">
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 font-medium text-amber-900/80">
          <Shield size={13} /> PCI compliant
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 font-medium text-amber-900/80">
          <LockKeyhole size={13} /> 256-bit SSL
        </div>
        <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200/80 bg-white/90 px-3 py-2 font-medium text-amber-900/80">
          <BadgeCheck size={13} /> Verified checkout
        </div>
      </div>
    </form>
  );
};

export const OrderOnlinePage = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuthStore();
  const { addBooking } = useBookingStore();
  const { items: cartItems, clearCart, updateItemQuantity, removeItem } = useMenuCartStore();

  const baseDepositAmount = 5;
  const cartSubtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const totalChargeNow = baseDepositAmount + cartSubtotal;

  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: prev.phone || customer.phone,
    }));
  }, [customer]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const isDetailsValid = Boolean(
    formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.trim() &&
      formData.phone.trim() &&
      cartItemCount > 0
  );

  const handlePaymentSuccess = async (): Promise<{ ok: boolean; error?: string }> => {
    setSaveError('');

    const { date: orderDate, time: orderTime } = getDefaultOrderSchedule();
    const orderId = `order-${Date.now()}`;

    // Create online order record
    const newOrder = {
      id: orderId,
      customerEmail: formData.email,
      totalAmount: totalChargeNow,
      status: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveOrderResult = await saveOnlineOrder(newOrder);
    if (!saveOrderResult.ok) {
      const errorMessage = saveOrderResult.error ?? 'Unable to save your order to database.';
      setSaveError(errorMessage);
      console.warn('Backend order save failed:', errorMessage);
      return { ok: false, error: errorMessage };
    }

    // Save order items
    const orderItems = cartItems.map((item) => ({
      id: `order-item-${item.id}-${Date.now()}`,
      menuItemId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const saveItemsResult = await saveOrderItems(orderId, orderItems);
    if (!saveItemsResult.ok) {
      const errorMessage = saveItemsResult.error ?? 'Unable to save order items to database.';
      setSaveError(errorMessage);
      console.warn('Backend order items save failed:', errorMessage);
      return { ok: false, error: errorMessage };
    }

    // Also save a booking record for reservation tracking (optional, for consistency)
    const newBooking = {
      id: `booking-${Date.now()}`,
      bookingId: generateBookingId(),
      customerName: `${formData.firstName} ${formData.lastName}`.trim(),
      customerEmail: formData.email,
      customerPhone: formData.phone,
      date: orderDate,
      time: orderTime,
      guests: Math.max(1, Math.min(10, cartItemCount)),
      tableId: undefined,
      tableNumber: undefined,
      status: 'confirmed' as const,
      specialRequests: undefined,
      depositAmount: totalChargeNow,
      paymentStatus: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveBookingResult = await saveBooking(newBooking);
    if (!saveBookingResult.ok) {
      console.warn('Backend booking save failed:', saveBookingResult.error);
      // Don't fail the order if booking fails - it's optional
    }

    addBooking(newBooking);

    void sendBookingConfirmationEmail(newBooking).then((result) => {
      if (!result.ok) {
        console.warn('Order confirmation email was not sent:', result.error);
      }
    });

    setIsConfirmed(true);

    setTimeout(() => {
      clearCart();
      navigate('/confirmation', {
        state: {
          booking: newBooking,
          charges: {
            baseDepositAmount,
            cartSubtotal,
            totalPaid: totalChargeNow,
            itemCount: cartItemCount,
          },
        },
      });
    }, 1500);

    return { ok: true };
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f0e1] px-5 pt-24 text-[#2d241b] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-[#ead6b8] bg-[#fffaf1] p-8 text-center shadow-[0_18px_46px_rgba(78,45,18,0.08)]">
          <ShoppingBag size={42} className="mx-auto text-[#7d2419]" />
          <h1 className="mt-4 font-serif text-[clamp(34px,5vw,54px)] leading-none text-[#2c2117]">Your cart is empty</h1>
          <p className="mx-auto mt-3 max-w-xl text-[#685949]">Add dishes from the menu to continue to checkout.</p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#7d2419] px-5 py-3 text-sm font-semibold text-[#fff3df] shadow-[0_12px_24px_rgba(125,36,25,0.2)] transition-colors hover:bg-[#962c20]"
          >
            Browse menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <div className="absolute inset-y-0 -left-32 w-[450px] pointer-events-none opacity-15" style={{ transform: 'scaleX(-1)' }}>
        <img src="/bookpagerose.png" alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-y-0 -right-32 w-[450px] pointer-events-none opacity-15">
        <img src="/bookpagerose.png" alt="" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_1fr] sm:gap-8">
          <div className="pr-4">
            <div className="overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-b from-amber-50 to-yellow-50 shadow-lg">
              <div className="border-b border-amber-100 bg-white px-8 py-6 text-center">
                <div className="mb-2 text-4xl">🧾</div>
                <h3 className="font-serif text-sm font-semibold uppercase tracking-widest text-amber-900">LUXE RESERVE / YOUR ORDER</h3>
              </div>

              <div className="px-8 py-8">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-amber-200/70 bg-white/85 p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-semibold text-amber-950">{item.name}</h4>
                              <p className="text-xs text-amber-700">{formatCurrency(item.price)} each</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="rounded-full border border-[#dbc7a2] bg-white p-2 text-[#7d2419]"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1.5 text-[#7d531f]"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-7 text-center text-sm font-medium text-[#4d3e2c]">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="rounded-full border border-[#dbc7a2] bg-[#fff7ea] p-1.5 text-[#7d531f]"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-[#7d2419]">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 space-y-3 border-t border-amber-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-900/70">Subtotal</span>
                    <span className="font-semibold text-amber-950">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-900/70">Deposit</span>
                    <span className="font-semibold text-amber-950">{formatCurrency(baseDepositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-amber-300/80 bg-amber-100/70 px-3 py-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-amber-900">Total Charge Now</span>
                    <span className="font-serif text-xl font-semibold text-amber-900">{formatCurrency(totalChargeNow)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-200/70 bg-amber-50/60 px-8 py-5">
                <p className="text-xs leading-relaxed text-amber-900/70">
                  <span className="font-semibold">Note:</span> {formatCurrency(baseDepositAmount)} deposit + {formatCurrency(cartSubtotal)} menu items will be charged now. Fully refundable with 24 hours notice.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky top-6 h-fit overflow-hidden rounded-3xl border border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,252,245,0.95),rgba(255,247,231,0.9))] shadow-[0_18px_40px_rgba(85,54,21,0.16)]">
            <div className="bg-[linear-gradient(130deg,rgba(44,26,15,0.95),rgba(73,45,22,0.96),rgba(27,23,30,0.95))] px-8 py-6 text-center border-b border-amber-200/70">
              <h3 className="font-serif text-[1.7rem] leading-none text-[#FFF8EE]">Complete Your Order</h3>
              <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-amber-200/80">Secure Checkout</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-amber-300' : 'bg-white/30'}`} />
                <span className={`h-2 w-8 rounded-full transition-colors ${step >= 3 || isConfirmed ? 'bg-amber-300' : 'bg-white/30'}`} />
              </div>
            </div>

            {step === 1 && (
              <div className="px-8 py-8">
                <h3 className="mb-2 font-serif text-[1.8rem] leading-none text-amber-950">Your Information</h3>
                <p className="mb-6 text-sm text-amber-900/70">Add your contact details to complete the checkout.</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-amber-900">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-amber-900">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-11 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2 block text-sm font-semibold text-amber-900">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-11 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-2 block text-sm font-semibold text-amber-900">Phone *</Label>
                    <div className="flex gap-2">
                      <div className="w-16 pt-2.5">
                        <span className="text-sm font-semibold text-amber-900">+ 44</span>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="h-11 flex-1 rounded-xl border border-amber-200/80 bg-white text-amber-950 placeholder:text-amber-700/45 focus-visible:ring-amber-300"
                        placeholder="7123 456789"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!isDetailsValid}
                  className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white transition-all hover:from-amber-700 hover:to-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Payment
                </Button>

                <Link
                  to="/menu"
                  className="mt-3 block text-center text-sm font-semibold text-amber-700 transition-colors hover:text-amber-900"
                >
                  Back to menu
                </Link>
              </div>
            )}

            {step === 2 && (
              <div className="px-8 py-8">
                <h3 className="mb-2 font-serif text-[1.8rem] leading-none text-amber-950">Payment Details</h3>
                <p className="mb-4 text-sm text-amber-900/70">Review and pay your order securely.</p>

                <div className="mb-6 rounded-xl border border-amber-200/80 bg-white/80 p-4 text-sm">
                  <div className="flex items-center justify-between text-amber-900/80">
                    <span>Reservation deposit</span>
                    <span className="font-semibold">{formatCurrency(baseDepositAmount)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-amber-900/80">
                    <span>Menu items ({cartItemCount} item{cartItemCount === 1 ? '' : 's'})</span>
                    <span className="font-semibold">{formatCurrency(cartSubtotal)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-3 text-amber-950">
                    <span className="text-xs font-semibold uppercase tracking-wide">Pay Now</span>
                    <span className="font-serif text-xl font-semibold">{formatCurrency(totalChargeNow)}</span>
                  </div>
                </div>

                <Elements stripe={stripePromise}>
                  <PaymentForm onSuccess={handlePaymentSuccess} amount={totalChargeNow} />
                </Elements>

                {saveError && <p className="mt-4 text-center text-sm font-semibold text-red-600">{saveError}</p>}

                <button
                  onClick={() => setStep(1)}
                  className="mt-4 w-full text-center font-semibold text-amber-700 transition-colors hover:text-amber-900"
                >
                  Back to details
                </button>
              </div>
            )}

            {isConfirmed && (
              <div className="px-8 py-12 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h3 className="mb-2 font-serif text-2xl text-amber-900">Order Confirmed!</h3>
                <p className="mb-2 text-sm font-medium text-amber-700">Your checkout is secure. Confirmation is on the way.</p>
                <p className="text-xs text-amber-600">Redirecting to confirmation page...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderOnlinePage;