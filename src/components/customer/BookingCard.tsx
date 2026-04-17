import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { useBookingStore } from '@/store';
import { generateTimeSlots } from '@/lib/mockData';
import type { BookingCardProps } from '@/types';

const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const BookingCard = ({ compact = false }: BookingCardProps) => {
  const navigate = useNavigate();
  const { setSelectedDate, setSelectedTime, setSelectedGuests, setAvailableSlots } = useBookingStore();
  
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckAvailability = () => {
    if (!date || !time) return;
    
    setIsChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      const dateStr = format(date, 'yyyy-MM-dd');
      setSelectedDate(dateStr);
      setSelectedTime(time);
      setSelectedGuests(guests);
      
      // Generate available slots
      const slots = generateTimeSlots(dateStr);
      setAvailableSlots(slots);
      
      setIsChecking(false);
      navigate('/book');
    }, 800);
  };

  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', 
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  const isFormValid = date && time && guests;

  return (
    <div className={`glass-card p-6 ${compact ? 'max-w-md' : 'w-full'}`}>
      <h3 className="font-serif text-2xl text-[#F4F6FA] mb-2">Book a table</h3>
      <p className="text-[#A9B1BE] text-sm mb-6">
        Select date, time & party size. We'll hold the best table.
      </p>

      <div className="space-y-4">
        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full input-luxury flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-[#D4A23A]" />
                <span className={date ? 'text-[#F4F6FA]' : 'text-[#A9B1BE]'}>
                  {date ? format(date, 'EEEE, MMMM d') : 'Select date'}
                </span>
              </div>
              <ChevronDown size={16} className="text-[#A9B1BE]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#14171C] border border-[rgba(244,246,250,0.10)]" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 1}
              initialFocus
              className="bg-[#14171C] text-[#F4F6FA]"
            />
          </PopoverContent>
        </Popover>

        {/* Time Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full input-luxury flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#D4A23A]" />
                <span className={time ? 'text-[#F4F6FA]' : 'text-[#A9B1BE]'}>
                  {time || 'Select time'}
                </span>
              </div>
              <ChevronDown size={16} className="text-[#A9B1BE]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-[#14171C] border border-[rgba(244,246,250,0.10)]" align="start">
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    time === slot
                      ? 'bg-[#D4A23A] text-[#0B0C0F]'
                      : 'text-[#A9B1BE] hover:bg-[rgba(244,246,250,0.08)]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Guests Selector */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-full input-luxury flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-[#D4A23A]" />
                <span className="text-[#F4F6FA]">
                  {guests} {guests === 1 ? 'guest' : 'guests'}
                </span>
              </div>
              <ChevronDown size={16} className="text-[#A9B1BE]" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 bg-[#14171C] border border-[rgba(244,246,250,0.10)]" align="start">
            <div className="grid grid-cols-5 gap-2">
              {guestOptions.map((num) => (
                <button
                  key={num}
                  onClick={() => setGuests(num)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    guests === num
                      ? 'bg-[#D4A23A] text-[#0B0C0F]'
                      : 'text-[#A9B1BE] hover:bg-[rgba(244,246,250,0.08)]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Submit Button */}
        <Button
          onClick={handleCheckAvailability}
          disabled={!isFormValid || isChecking}
          className="w-full btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isChecking ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0B0C0F] border-t-transparent rounded-full animate-spin" />
              Checking...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Check size={18} />
              Check availability
            </span>
          )}
        </Button>

        {/* Micro label */}
        <p className="text-center text-[#A9B1BE] text-xs font-mono uppercase tracking-[0.14em]">
          No deposit required
        </p>
      </div>
    </div>
  );
};
