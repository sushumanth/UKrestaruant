import type { RestaurantTable, Booking } from '@/types';
import { statusColors } from '@/lib/mockData';

interface TableCardProps {
  table: RestaurantTable;
  booking?: Booking | null;
  onClick?: (table: RestaurantTable) => void;
}

export const TableCard = ({ table, booking, onClick }: TableCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick?.(table)}
      className={`w-full h-12 flex flex-col items-center justify-center rounded-lg border-2 p-1 transition-all hover:shadow-md text-center ${statusColors.table[table.status]}`}
      title={`T${table.tableNumber} - ${table.status} - Capacity: ${table.capacity}`}
    >
      <p className="font-bold text-xs text-amber-900">T{table.tableNumber}</p>
      <p className="text-[10px] text-amber-700/70">{table.capacity}g</p>
      {booking && (
        <p className="text-[9px] text-amber-600 truncate w-full px-1">{booking.customerName.slice(0, 12)}</p>
      )}
    </button>
  );
};
