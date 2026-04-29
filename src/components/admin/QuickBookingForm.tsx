import { useState } from 'react';
import { useBookingStore, useTableStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Check } from 'lucide-react';
import { generateBookingId, findOptimalTable } from '@/lib/mockData';
import { saveBookingToSupabase } from '@/lib/supabaseBookingApi';

const timeSlots = [
  '17:00', '17:30', '18:00', '18:30', 
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const QuickBookingForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { addBooking, bookings } = useBookingStore();
  const { tables, updateTableStatus } = useTableStore();
  
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    setIsSubmitting(true);

    // Find optimal table
    const dateStr = format(date, 'yyyy-MM-dd');
    const optimalTable = findOptimalTable(guests, tables, bookings, dateStr, time);

    // Create booking
    const newBooking = {
      id: `booking-${Date.now()}`,
      bookingId: generateBookingId(),
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      date: dateStr,
      time,
      guests,
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
    if (optimalTable) {
      const timeSlot = new Date(`${dateStr}T${time}:00`).toISOString();
      updateTableStatus(optimalTable.id, 'booked', timeSlot);
    }
    void saveBookingToSupabase(newBooking).then((result) => {
      if (!result.ok) {
        console.warn('Quick booking save to Supabase skipped:', result.error);
      }
    });

    setIsSubmitting(false);
    onSuccess?.();
  };

  const isValid = date && time && formData.firstName && formData.lastName && formData.email;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-[#A9B1BE] mb-2 block">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full input-luxury flex items-center justify-between text-left">
                <span className={date ? 'text-[#F4F6FA]' : 'text-[#A9B1BE]'}>
                  {date ? format(date, 'MMM d') : 'Select date'}
                </span>
                <CalendarIcon size={16} className="text-[#A9B1BE]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#14171C] border border-[rgba(244,246,250,0.10)]">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="bg-[#14171C]"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label className="text-[#A9B1BE] mb-2 block">Time</Label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full input-luxury"
          >
            <option value="" className="bg-[#14171C]">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot} className="bg-[#14171C]">
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guests */}
      <div>
        <Label className="text-[#A9B1BE] mb-2 block">Guests</Label>
        <select
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full input-luxury"
        >
          {guestOptions.map((num) => (
            <option key={num} value={num} className="bg-[#14171C]">
              {num} {num === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <Label htmlFor="specialRequests" className="text-[#A9B1BE] mb-2 block">
          Special Requests (Optional)
        </Label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleInputChange}
          className="input-luxury w-full h-20 resize-none"
          placeholder="Any special requirements..."
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full btn-gold disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
            Creating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Check size={18} />
            Create Booking
          </span>
        )}
      </Button>
    </form>
  );
};
