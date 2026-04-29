import { TableCard } from './TableCard';
import type { RestaurantTable, Booking } from '@/types';

interface TableGridProps {
  tables: RestaurantTable[];
  bookingMap: Map<string, Booking>;
  onTableClick?: (table: RestaurantTable) => void;
}

export const TableGrid = ({ tables, bookingMap, onTableClick }: TableGridProps) => {
  return (
    <div className="grid grid-cols-5 gap-4 sm:grid-cols-7 lg:grid-cols-8">
      {tables.map((table) => (
        <TableCard key={table.id} table={table} booking={bookingMap.get(table.id)} onClick={onTableClick} />
      ))}
    </div>
  );
};
