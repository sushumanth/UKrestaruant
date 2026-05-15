import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock3, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/restaurantUtils';
import type { BookingCardProps } from '@/types';

const previewItems = [
  { icon: CalendarDays, label: 'Choose your date' },
  { icon: Clock3, label: 'Pick a time' },
  { icon: Users, label: 'Add guest count' },
];

export const BookingCard = ({ compact = false }: BookingCardProps) => {
  const navigate = useNavigate();
  const depositAmount = 5;

  return (
    <div className={compact ? 'rounded-2xl border border-amber-200/60 bg-white/90 p-4 shadow-sm' : 'rounded-3xl border border-amber-200/60 bg-gradient-to-br from-white/95 to-amber-50/90 p-5 shadow-[0_18px_40px_rgba(126,89,36,0.12)]'}>
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700/75">Reservation</p>
        <h3 className="mt-1 font-serif text-xl text-amber-950">Book without selecting a table</h3>
        <p className="mt-1 text-sm text-amber-900/70">
          Choose your date, time, and guest count, then complete payment. We will handle table assignment internally.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {previewItems.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl border border-amber-200/60 bg-white/80 px-3 py-2 text-sm text-amber-900/80">
            <Icon size={14} className="shrink-0 text-amber-700" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-amber-200/60 bg-amber-50/70 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700/70">Deposit from</p>
          <p className="font-serif text-2xl text-amber-950">{formatCurrency(depositAmount)}</p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/booking')}
          className="h-10 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 text-sm font-semibold text-white"
        >
          Start booking
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default BookingCard;
