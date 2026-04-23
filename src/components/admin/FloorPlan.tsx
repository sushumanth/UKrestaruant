import { useState, useMemo } from 'react';
import { useTableStore, useBookingStore } from '@/store';
import type { RestaurantTable, Booking } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { statusColors } from '@/lib/mockData';

interface FloorPlanProps {
  tables?: RestaurantTable[];
  bookings?: Booking[];
  readOnly?: boolean;
  onTableClick?: (table: RestaurantTable) => void;
}

export const FloorPlan = ({ 
  tables: propTables, 
  bookings: propBookings,
  readOnly = false,
  onTableClick 
}: FloorPlanProps) => {
  const { tables: storeTables } = useTableStore();
  const { bookings: storeBookings } = useBookingStore();
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const tables = propTables || storeTables;
  const bookings = propBookings || storeBookings;

  const validBookingsByTable = useMemo(() => {
    const map = new Map<string, Booking>();
    for (const b of bookings) {
      if (b.tableId && ['confirmed', 'arrived', 'seated'].includes(b.status)) {
        map.set(b.tableId, b);
      }
    }
    return map;
  }, [bookings]);

  const getTableBooking = (tableId: string): Booking | undefined => {
    return validBookingsByTable.get(tableId);
  };

  const handleTableClick = (table: RestaurantTable) => {
    if (readOnly) return;
    setSelectedTable(table);
    onTableClick?.(table);
  };

  const getStatusColor = (status: string) => {
    return statusColors.table[status as keyof typeof statusColors.table] || 'bg-slate-500';
  };

  return (
    <div className="relative">
      {/* Floor Plan Grid */}
      <div className="relative bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg overflow-hidden border border-amber-200/30" style={{ minHeight: '500px' }}>
        {/* Room outline */}
        <div className="absolute inset-4 border-2 border-dashed border-amber-200/50 rounded-lg" />
        
        {/* Tables */}
        {tables.map((table) => {
          const booking = getTableBooking(table.id);
          const isSelected = selectedTable?.id === table.id;
          
          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`
                absolute cursor-pointer transition-all duration-200
                ${readOnly ? 'pointer-events-none' : 'hover:-translate-y-0.5'}
                ${isSelected ? 'ring-2 ring-amber-700 ring-offset-2 ring-offset-amber-50' : ''}
              `}
              style={{
                left: `${table.x}px`,
                top: `${table.y}px`,
                width: `${table.width}px`,
                height: `${table.height}px`,
              }}
            >
              <div
                className={`
                  w-full h-full rounded-lg border-2 flex flex-col items-center justify-center shadow-md
                  ${getStatusColor(table.status)}
                  ${table.shape === 'round' ? 'rounded-full' : 'rounded-lg'}
                `}
              >
                <span className="font-mono text-xs text-white/90">T{table.tableNumber}</span>
                <span className="text-[10px] text-white/70">{table.capacity}</span>
              </div>
              
              {/* Booking indicator */}
              {booking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-md" />
              )}
            </div>
          );
        })}

        {/* Entrance */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="px-4 py-1 bg-amber-100 border border-amber-200 rounded text-xs text-amber-700 font-mono shadow-md">
            ENTRANCE
          </div>
        </div>
      </div>

      {/* Table Detail Dialog */}
      {!readOnly && selectedTable && (
        <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
          <DialogContent className="bg-white border border-amber-200">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl text-amber-900">
                Table {selectedTable.tableNumber}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4">
                  <p className="text-amber-700/60 text-sm mb-1">Capacity</p>
                  <p className="text-amber-900 font-medium">{selectedTable.capacity} guests</p>
                </div>
                <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4">
                  <p className="text-amber-700/60 text-sm mb-1">Status</p>
                  <p className="text-amber-900 font-medium capitalize">{selectedTable.status}</p>
                </div>
              </div>

              {getTableBooking(selectedTable.id) && (
                <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-4">
                  <p className="text-amber-700/60 text-sm mb-2">Current Booking</p>
                  <p className="text-amber-900">
                    {getTableBooking(selectedTable.id)?.customerName}
                  </p>
                  <p className="text-amber-700/60 text-sm">
                    {getTableBooking(selectedTable.id)?.guests} guests • {getTableBooking(selectedTable.id)?.time}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
                  onClick={() => {
                    // Update table status logic
                    setSelectedTable(null);
                  }}
                >
                  Mark as Seated
                </Button>
                <Button 
                  className="flex-1 border border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => setSelectedTable(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
