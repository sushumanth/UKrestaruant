import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  useBookingStore,
  useCustomerAuthStore,
  useMenuCartStore,
} from '@/store';

import {
  formatCurrency,
  formatDate,
  formatTime,
} from '@/mockData';

export const BookingDetailsPage = () => {
  const navigate = useNavigate();

  const { customer } = useCustomerAuthStore();

  const {
    selectedDate,
    selectedTime,
    selectedGuests,
    setSelectedDate,
    setSelectedTime,
    setSelectedGuests,
  } = useBookingStore();

  const { items: cartItems } = useMenuCartStore();
  const { selectedTable } = useTableStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (!customer) return;

    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || '',
      specialRequests: '',
    });
  }, [customer]);

  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      navigate('/booking', { replace: true });
    }
  }, [navigate, selectedDate, selectedTime]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const baseDepositAmount = 5;

  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalChargeNow =
    baseDepositAmount + cartSubtotal;

  const hasPreOrder = cartSubtotal > 0;

  const isDetailsValid = Boolean(
    customer?.firstName &&
      customer?.lastName &&
      customer?.email &&
      formData.phone
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #f6f1eb 0%, #fdfaf6 45%, #f2ebe3 100%)',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <img
          src="/bookfirstpage.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">

        <div className="grid lg:grid-cols-[0.85fr_1fr] gap-5 items-start">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-3xl overflow-hidden border border-[#eadfce] bg-white/75 backdrop-blur-xl shadow-[0_10px_40px_rgba(111,78,55,0.10)]">

              {/* Header */}
              <div className="bg-[linear-gradient(135deg,#4b2e1f,#6b4226,#3b2418)] px-6 py-5 text-center">

                <div className="text-3xl mb-2">
                  🍽️
                </div>

                <h3 className="text-[#fffaf5] font-serif text-[1.35rem] italic">
                  Luxe Reserve
                </h3>

                <p className="text-amber-100/80 text-[10px] mt-1 tracking-[0.16em] uppercase">
                  Your Reservation
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6">

                <div className="space-y-4">

                  {/* Date */}
                  <InfoCard
                    icon={
                      <Calendar
                        size={18}
                        className="text-amber-700"
                      />
                    }
                    label="Date"
                    value={formatDate(selectedDate)}
                  />

                  {/* Time */}
                  <InfoCard
                    icon={
                      <Clock
                        size={18}
                        className="text-amber-700"
                      />
                    }
                    label="Time"
                    value={formatTime(selectedTime)}
                  />

                  {/* Guests */}
                  <InfoCard
                    icon={
                      <Users
                        size={18}
                        className="text-amber-700"
                      />
                    }
                    label="Party Size"
                    value={`${selectedGuests} ${
                      selectedGuests === 1
                        ? 'Guest'
                        : 'Guests'
                    }`}
                  />

                  {/* Deposit */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-[#8b7355] font-semibold">
                          Reservation Deposit
                        </p>

                        <p className="text-amber-700 font-serif text-xl font-semibold mt-1">
                          {formatCurrency(
                            baseDepositAmount
                          )}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center">
                        <span className="text-amber-700 font-bold">
                          £
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preorder */}
                  {hasPreOrder && (
                    <div className="rounded-2xl border border-[#eadfce] bg-[#faf6f1] px-4 py-3">

                      <div className="flex items-center justify-between">

                        <p className="text-[#5f4a38] text-xs font-semibold uppercase tracking-wide">
                          Pre-order ({cartItemCount})
                        </p>

                        <p className="text-[#2f241d] font-semibold">
                          {formatCurrency(
                            cartSubtotal
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4">

                    <div className="flex items-center justify-between">

                      <p className="text-amber-900 text-xs font-bold uppercase tracking-wide">
                        Total Charge
                      </p>

                      <p className="text-[#2f241d] font-serif text-2xl font-semibold">
                        {formatCurrency(
                          totalChargeNow
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="pt-4">

                    <div className="flex items-center justify-center gap-3">

                      <Step active number="1" label="Details" />

                      <div className="flex-1 h-[2px] bg-amber-700" />

                      <Step
                        number="2"
                        label="Payment"
                      />

                      <div className="flex-1 h-[2px] bg-amber-100" />

                      <Step
                        number="3"
                        label="Confirm"
                      />
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => {
                      setSelectedDate('');
                      setSelectedTime('');
                      setSelectedGuests(0);
                      navigate('/booking');
                    }}
                    className="w-full mt-3 px-4 py-3 rounded-2xl border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold transition-all text-sm"
                  >
                    Change Selection
                  </button>

                  {/* Note */}
                  <div className="rounded-2xl bg-amber-50/70 border border-[#eadfce] px-4 py-4">

                    <p className="text-xs text-[#6f5c4d] leading-relaxed">

                      <span className="font-semibold text-amber-800">
                        Note:
                      </span>{' '}

                      {hasPreOrder
                        ? `${formatCurrency(
                            baseDepositAmount
                          )} deposit + ${formatCurrency(
                            cartSubtotal
                          )} pre-order charged now.`
                        : `${formatCurrency(
                            baseDepositAmount
                          )} deposit secures your reservation.`}

                      {' '}
                      Refundable with 24 hours notice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="rounded-3xl overflow-hidden border border-[#eadfce] bg-white/78 backdrop-blur-xl shadow-[0_10px_40px_rgba(111,78,55,0.10)]">

              {/* Header */}
              <div className="px-6 py-5 text-center bg-[linear-gradient(135deg,#4b2e1f,#6b4226,#3b2418)]">

                <h3 className="text-[#fffaf5] font-serif text-[1.5rem] italic">
                  Complete Your Details
                </h3>

                <p className="text-amber-100/80 text-[10px] mt-1 tracking-[0.18em] uppercase">
                  Secure Checkout
                </p>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="h-2 w-7 rounded-full bg-amber-300" />
                  <span className="h-2 w-7 rounded-full bg-white/25" />
                  <span className="h-2 w-7 rounded-full bg-white/25" />
                </div>
              </div>

              {/* Form */}
              <div className="px-6 py-6">

                <h3 className="font-serif text-[1.7rem] text-[#2f241d] mb-1">
                  Your Information
                </h3>

                <p className="text-sm text-[#7b6858] mb-6">
                  Your account details are used for this booking.
                </p>

                <div className="space-y-4">

                  {/* Names */}
                  <div className="grid grid-cols-2 gap-4">

                    <FormField
                      label="First Name *"
                      id="firstName"
                    >
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        readOnly
                        className="h-11 rounded-2xl bg-white border border-[#eadfce] text-[#2f241d] focus-visible:ring-amber-300"
                      />
                    </FormField>

                    <FormField
                      label="Last Name *"
                      id="lastName"
                    >
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        readOnly
                        className="h-11 rounded-2xl bg-white border border-[#eadfce] text-[#2f241d] focus-visible:ring-amber-300"
                      />
                    </FormField>
                  </div>

                  {/* Email */}
                  <FormField label="Email *" id="email">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      readOnly
                      className="h-11 rounded-2xl bg-white border border-[#eadfce] text-[#2f241d] focus-visible:ring-amber-300"
                    />
                  </FormField>

                  {/* Phone */}
                  <FormField label="Phone *" id="phone">

                    <div className="flex gap-2">

                      <div className="w-16 h-11 rounded-2xl border border-[#eadfce] bg-[#faf6f1] flex items-center justify-center text-sm font-semibold text-[#5f4a38]">
                        +44
                      </div>

                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="h-11 rounded-2xl bg-white border border-[#eadfce] text-[#2f241d] focus-visible:ring-amber-300"
                        placeholder="7123 456789"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-[#8b7355]">
                      Update account details if needed.
                    </p>
                  </FormField>

                  {/* Requests */}
                  <FormField
                    label="Special Requests"
                    id="specialRequests"
                  >
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="w-full h-24 resize-none rounded-2xl border border-[#eadfce] bg-white px-4 py-3 text-sm text-[#2f241d] outline-none focus:ring-2 focus:ring-amber-300"
                      placeholder="Dietary requirements, celebration, etc."
                    />
                  </FormField>
                </div>

                {/* Continue */}
                <Button
                  onClick={() =>
                    navigate('/booking/payment', {
                      state: formData,
                    })
                  }
                  disabled={!isDetailsValid}
                  className="w-full h-11 rounded-2xl bg-[linear-gradient(135deg,#8a5a35,#6b4226)] hover:opacity-95 text-white font-semibold mt-6 transition-all shadow-lg disabled:opacity-50"
                >
                  Continue to Payment
                </Button>

                {/* Back */}
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedTime('');
                    setSelectedGuests(0);
                    navigate('/booking');
                  }}
                  className="w-full text-center text-amber-700 hover:text-amber-900 transition-colors mt-4 text-sm font-semibold"
                >
                  Back to booking
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#eadfce] bg-[#faf6f1] px-4 py-4 transition-all hover:shadow-md">

    <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>

    <div>
      <p className="text-[#8b7355] text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>

      <p className="text-[#2f241d] font-medium text-sm">
        {value}
      </p>
    </div>
  </div>
);

const Step = ({
  number,
  label,
  active,
}: {
  number: string;
  label: string;
  active?: boolean;
}) => (
  <div className="flex flex-col items-center">

    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
        active
          ? 'bg-amber-700 text-white shadow-md'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {number}
    </div>

    <p
      className={`text-[10px] mt-2 font-medium ${
        active
          ? 'text-amber-700'
          : 'text-[#8b7355]'
      }`}
    >
      {label}
    </p>
  </div>
);

const FormField = ({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label
      htmlFor={id}
      className="text-[#5f4a38] mb-2 block text-sm font-semibold"
    >
      {label}
    </Label>

    {children}
  </div>
);

export default BookingDetailsPage;