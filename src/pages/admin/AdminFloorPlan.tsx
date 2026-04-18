import { useState } from 'react';
import { Map, List, RotateCcw } from 'lucide-react';
import { FloorPlan } from '@/components/admin/FloorPlan';
import { useTableStore, useBookingStore } from '@/store';
import { statusColors, statusLabels } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import type { TableStatus } from '@/types';

export const AdminFloorPlan = () => {
  const { tables, updateTableStatus } = useTableStore();
  const { bookings } = useBookingStore();
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');

  const filteredTables = filterStatus === 'all' 
    ? tables 
    : tables.filter(t => t.status === filterStatus);

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    booked: tables.filter(t => t.status === 'booked').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    seated: tables.filter(t => t.status === 'seated').length,
    blocked: tables.filter(t => t.status === 'blocked').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-amber-900 mb-2">Floor Plan</h1>
          <p className="text-amber-700/60">Manage table assignments and status in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('floor')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'floor' 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'text-amber-700/60 hover:bg-amber-50'
            }`}
          >
            <Map size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'text-amber-700/60 hover:bg-amber-50'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {(['available', 'booked', 'reserved', 'seated', 'blocked'] as TableStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            className={`bg-white rounded-2xl border transition-all p-4 text-left ${
              filterStatus === status ? 'border-amber-700 ring-2 ring-amber-200' : 'border-amber-200/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${statusColors.table[status]}`} />
              <span className="text-amber-700/60 text-sm capitalize">{status}</span>
            </div>
            <p className="font-serif text-2xl text-amber-900">{stats[status]}</p>
          </button>
        ))}
      </div>

      {/* Floor Plan View */}
      {viewMode === 'floor' && (
        <div className="bg-white rounded-2xl border border-amber-200/50 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-amber-700/60 text-sm">
                Showing {filteredTables.length} of {tables.length} tables
              </span>
              {filterStatus !== 'all' && (
                <button
                  onClick={() => setFilterStatus('all')}
                  className="text-amber-700 text-sm flex items-center gap-1 hover:underline"
                >
                  <RotateCcw size={14} />
                  Clear filter
                </button>
              )}
            </div>
          </div>
          <FloorPlan 
            tables={filteredTables}
            bookings={bookings}
            readOnly={false}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-amber-200/50 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50/30">
                  <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Table</th>
                  <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Capacity</th>
                  <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Current Booking</th>
                  <th className="text-left py-4 px-6 text-amber-700/70 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((table) => {
                  const tableBooking = bookings.find(
                    b => b.tableId === table.id && ['confirmed', 'arrived', 'seated'].includes(b.status)
                  );
                  
                  return (
                    <tr 
                      key={table.id} 
                      className="border-b border-amber-100 hover:bg-amber-50/30"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-amber-700 font-semibold">T{table.tableNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-amber-900">{table.capacity} guests</span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={table.status}
                          onChange={(e) => updateTableStatus(table.id, e.target.value as TableStatus)}
                          className="border border-amber-200 bg-white text-amber-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-50"
                        >
                          {(['available', 'booked', 'reserved', 'seated', 'blocked'] as TableStatus[]).map((status) => (
                            <option key={status} value={status} className="bg-white">
                              {statusLabels.table[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        {tableBooking ? (
                          <div>
                            <p className="text-amber-900">{tableBooking.customerName}</p>
                            <p className="text-amber-700/60 text-sm">
                              {tableBooking.guests} guests • {tableBooking.time}
                            </p>
                          </div>
                        ) : (
                          <span className="text-amber-700/60">No current booking</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {table.status === 'booked' && (
                            <Button 
                              size="sm" 
                              className="bg-amber-700 hover:bg-amber-800 text-white text-xs py-1"
                              onClick={() => updateTableStatus(table.id, 'seated')}
                            >
                              Mark Seated
                            </Button>
                          )}
                          {table.status === 'seated' && (
                            <Button 
                              size="sm" 
                              className="border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs py-1"
                              onClick={() => updateTableStatus(table.id, 'available')}
                            >
                              Clear Table
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
