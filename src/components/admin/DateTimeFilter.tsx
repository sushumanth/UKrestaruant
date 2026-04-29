import { Button } from '@/components/ui/button';

interface DateTimeFilterProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  timeOptions: string[];
  isLoading: boolean;
  onCheck: () => void;
  validationMessage?: string;
  isTimeDisabled?: (time: string) => boolean;
}

export const DateTimeFilter = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeOptions,
  isLoading,
  onCheck,
  validationMessage,
  isTimeDisabled,
}: DateTimeFilterProps) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="h-11 rounded-2xl border-amber-200 bg-white px-3 text-amber-900"
      />

      <select
        value={selectedTime}
        onChange={(e) => setSelectedTime(e.target.value)}
        className="h-11 rounded-2xl border-amber-200 bg-white px-3 text-amber-900"
      >
        <option value="">Select time</option>
        {timeOptions.map((t) => (
          <option key={t} value={t} disabled={isTimeDisabled?.(t)}>
            {t}
          </option>
        ))}
      </select>

      <Button onClick={onCheck} disabled={isLoading} className="h-11">
        {isLoading ? 'Checking...' : 'Check Availability'}
      </Button>

      {validationMessage && (
        <p className="text-rose-600 text-sm ml-3">{validationMessage}</p>
      )}
    </div>
  );
};
