import { useEffect, useMemo, useState } from 'react';
import { Clock3, List, Map as MapIcon, MapPin, RotateCcw, Search, Sparkles, Users } from 'lucide-react';
import { useTableStore, useBookingStore } from '@/store';
import { statusColors, statusLabels } from '@/restaurantUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createRestaurantTable, fetchStaffOperationalData, getOccupiedTableIds } from '@/frontendapis';
import { DateTimeFilter } from '@/components/admin/DateTimeFilter';
import { TableGrid } from '@/components/admin/TableGrid';
import type { RestaurantTable, TableStatus } from '@/types';

type AreaFilter = 'all' | 'main-floor' | 'terrace';

const getTableArea = (tableNumber: number): AreaFilter => (tableNumber <= 30 ? 'main-floor' : 'terrace');

const areaLabels: Record<AreaFilter, string> = {
  all: 'All Areas',
  'main-floor': 'Main Floor',
  terrace: 'Terrace',
};

export const AdminFloorPlan = () => {
  const { tables, updateTableStatus, setTables } = useTableStore();
  const { bookings } = useBookingStore();
  const [viewMode, setViewMode] = useState<'floor' | 'list'>('floor');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<AreaFilter>('all');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [slotBookingMap, setSlotBookingMap] = useState<Map<string, (typeof bookings)[number]>>(new Map());
  const [displayedTables, setDisplayedTables] = useState<RestaurantTable[]>(tables);
  const [noBookingsFound, setNoBookingsFound] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState(() => String((tables.at(-1)?.tableNumber ?? 0) + 1));
  const [newTableCapacity, setNewTableCapacity] = useState('2');
  const [isSavingTable, setIsSavingTable] = useState(false);
  const [tableMessage, setTableMessage] = useState('');
  const [selectedTableForStatus, setSelectedTableForStatus] = useState<RestaurantTable | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TableStatus>('available');
  const [pendingReservationDate, setPendingReservationDate] = useState('');
  const [pendingReservationTime, setPendingReservationTime] = useState('');

  useEffect(() => {
    setDisplayedTables(tables);
  }, [tables]);

  const tableBookingById = useMemo(() => {
    const map = new globalThis.Map<string, (typeof bookings)[number]>();

    // Live mapping (any current confirmed/arrived/seated booking)
    for (const booking of bookings) {
      if (booking.tableId && ['confirmed', 'arrived', 'seated'].includes(booking.status)) {
        map.set(booking.tableId, booking);
      }
    }

    return map;
  }, [bookings]);

  // Build displayed tables after check availability; initial is store tables

  const filteredTables = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return displayedTables.filter((table) => {
      const matchesArea = selectedArea === 'all' || getTableArea(table.tableNumber) === selectedArea;
      const matchesStatus = filterStatus === 'all' || table.status === filterStatus;
      const booking = tableBookingById.get(table.id);

      const matchesSearch =
        !query ||
        `t${table.tableNumber}`.includes(query) ||
        table.tableNumber.toString().includes(query) ||
        table.capacity.toString().includes(query) ||
        table.status.includes(query) ||
        Boolean(booking && booking.customerName.toLowerCase().includes(query));

      return matchesArea && matchesStatus && matchesSearch;
    });
  }, [filterStatus, searchQuery, selectedArea, displayedTables, tableBookingById]);


  const stats = {
    available: displayedTables.filter(t => t.status === 'available').length,
    booked: displayedTables.filter(t => t.status === 'booked').length,
    reserved: displayedTables.filter(t => t.status === 'reserved').length,
    seated: displayedTables.filter(t => t.status === 'seated').length,
    blocked: displayedTables.filter(t => t.status === 'blocked').length,
  };

  const occupiedCount = stats.booked + stats.seated;
  const mainFloorCount = tables.filter((table) => getTableArea(table.tableNumber) === 'main-floor').length;
  const terraceCount = tables.filter((table) => getTableArea(table.tableNumber) === 'terrace').length;
  const availableFilteredCount = filteredTables.filter((table) => table.status === 'available').length;

  const reservationSlotOptions = [
    '11:00',  '11:30', 
  '12:00',  '12:30', 
  '13:00',  '13:30', 
  '14:00',  '14:30', 
  '18:00',  '18:30', 
  '19:00', '19:30', 
  '20:00',  '20:30', 
  '21:00',  '21:30',
  ];

  const shouldShowReservationFields = pendingStatus === 'booked' || pendingStatus === 'reserved';

  const isTimeDisabled = (time: string) => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    if (selectedDate !== today) return false;
    const now = new Date();
    const [h, m] = time.split(':').map((s) => Number(s));
    const slotDate = new Date();
    slotDate.setHours(h, m, 0, 0);
    return slotDate < now;
  };

  const openAddTableDialog = () => {
    const nextNumber = (tables.at(-1)?.tableNumber ?? 0) + 1;
    setNewTableNumber(String(nextNumber));
    setNewTableCapacity('2');
    setTableMessage('');
    setIsAddTableOpen(true);
  };

  const handleSaveTableStatus = () => {
    if (!selectedTableForStatus) {
      return;
    }

    const shouldSaveSlot = Boolean(pendingReservationDate && pendingReservationTime);
    const timeSlot = shouldSaveSlot ? new Date(`${pendingReservationDate}T${pendingReservationTime}:00`).toISOString() : null;

    updateTableStatus(selectedTableForStatus.id, pendingStatus, timeSlot);
    setSelectedTableForStatus(null);
  };

  const handleCheckAvailability = async () => {
    setValidationMessage('');
    setNoBookingsFound(false);

    if (!selectedDate || !selectedTime) {
      setValidationMessage('Please select both date and time before checking.');
      return;
    }

    setIsChecking(true);

    try {
      const occupied = await getOccupiedTableIds(selectedDate, selectedTime);
      let matchedBookings: (typeof bookings)[number][] = [];

      if (occupied.ok && occupied.tableIds.length > 0) {
        const all = await fetchStaffOperationalData();
        matchedBookings = all.bookings.filter((booking) => booking.date === selectedDate && booking.time.slice(0, 5) === selectedTime.slice(0, 5) && occupied.tableIds.includes(booking.tableId ?? ''));
      } else {
        const all = await fetchStaffOperationalData();
        matchedBookings = all.bookings.filter((booking) => booking.date === selectedDate && booking.time.slice(0, 5) === selectedTime.slice(0, 5));
      }

      const map = new Map<string, (typeof bookings)[number]>();

      const rank: Record<string, number> = {
        seated: 5,
        arrived: 4,
        confirmed: 3,
        pending: 2,
        reserved: 1,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      };

      for (const booking of matchedBookings) {
        const tableId = booking.tableId ?? tables.find((table) => table.tableNumber === booking.tableNumber)?.id;
        if (!tableId) {
          continue;
        }

        const existing = map.get(tableId);
        if (!existing || (rank[booking.status] ?? 0) > (rank[existing.status] ?? 0)) {
          map.set(tableId, booking);
        }
      }

      setSlotBookingMap(map);

      const nextDisplay = tables.map((table) => {
        if (table.status === 'blocked') {
          return table;
        }

        const booking = map.get(table.id);
        if (!booking) {
          return { ...table, status: 'available' as TableStatus };
        }

        const statusMap: Record<string, TableStatus> = {
          pending: 'booked',
          confirmed: 'booked',
          arrived: 'seated',
          seated: 'seated',
          reserved: 'reserved',
          completed: 'available',
          cancelled: 'available',
          no_show: 'available',
        };

        return { ...table, status: statusMap[booking.status] ?? 'booked' };
      });

      setDisplayedTables(nextDisplay);
      setNoBookingsFound(map.size === 0);
    } catch (error) {
      console.warn('Failed to fetch bookings for slot:', error);
      setValidationMessage('Unable to fetch availability. Try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleAddTable = async () => {
    const tableNumber = Number(newTableNumber);
    const capacity = Number(newTableCapacity);

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      setTableMessage('Enter a valid table number.');
      return;
    }

    if (!Number.isInteger(capacity) || capacity <= 0) {
      setTableMessage('Enter a valid capacity.');
      return;
    }

    if (tables.some((table) => table.tableNumber === tableNumber)) {
      setTableMessage('That table number already exists.');
      return;
    }

    const nextTable: RestaurantTable = {
      id: `table-${tableNumber}`,
      tableNumber,
      capacity,
      status: 'available' as TableStatus,
    };

    setIsSavingTable(true);
    setTableMessage('');

    try {
      const savedTable = await createRestaurantTable(nextTable);
      const nextTables = [...tables, savedTable].sort((left, right) => left.tableNumber - right.tableNumber);
      setTables(nextTables);
      setIsAddTableOpen(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setTableMessage(`Unable to add table: ${errorMsg}`);
    } finally {
      setIsSavingTable(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl text-amber-900 mb-1">Table Layout</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-amber-700/60">Manage your restaurant tables in real-time.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/50" size={16} />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search tables..."
              className="h-11 rounded-2xl border-amber-200 bg-white pl-9 text-amber-900 placeholder:text-amber-700/40"
            />
          </div>
          <Button className="h-11 rounded-2xl bg-amber-700 px-5 text-white hover:bg-amber-800" onClick={openAddTableDialog}>
            <Sparkles size={16} className="mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700/60">
            <Users size={18} />
            <span className="text-sm">Total Tables</span>
          </div>
          <p className="mt-2 font-serif text-3xl text-amber-900">{tables.length}</p>
        </div>
        <button
          onClick={() => setFilterStatus(filterStatus === 'available' ? 'all' : 'available')}
          className={`rounded-2xl border p-4 text-left shadow-sm transition-all ${filterStatus === 'available' ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-amber-200/50 bg-white'}`}
        >
          <div className="flex items-center gap-3 text-emerald-700/70">
            <div className="h-3 w-3 rounded-full bg-emerald-900" />
            <span className="text-sm">Available</span>
          </div>
          <p className="mt-2 font-serif text-3xl text-emerald-700">{stats.available}</p>
        </button>
        <div className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700/60">
            <Clock3 size={18} />
            <span className="text-sm">Occupied</span>
          </div>
          <p className="mt-2 font-serif text-3xl text-amber-900">{occupiedCount}</p>
        </div>
        <button
          onClick={() => setFilterStatus(filterStatus === 'reserved' ? 'all' : 'reserved')}
          className={`rounded-2xl border p-4 text-left shadow-sm transition-all ${filterStatus === 'reserved' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-amber-200/50 bg-white'}`}
        >
          <div className="flex items-center gap-3 text-amber-700/70">
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-sm">Reserved</span>
          </div>
          <p className="mt-2 font-serif text-3xl text-amber-900">{stats.reserved}</p>
        </button>
        <div className="rounded-2xl border border-amber-200/50 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 text-amber-700/60">
            <MapPin size={18} />
            <span className="text-sm">Maintenance</span>
          </div>
          <p className="mt-2 font-serif text-3xl text-amber-900">{stats.blocked}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-amber-200/50 bg-white/90 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(areaLabels) as AreaFilter[]).map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => setSelectedArea(area)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedArea === area ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
            >
              {areaLabels[area]}
              {area !== 'all' && (
                <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                  {area === 'main-floor' ? mainFloorCount : terraceCount}
                </span>
              )}
            </button>
          ))}
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw size={14} />
              Clear status filter
            </button>
          )}
          {selectedArea !== 'all' && (
            <button
              onClick={() => setSelectedArea('all')}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50"
            >
              <RotateCcw size={14} />
              Clear area filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('floor')}
            className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-colors ${viewMode === 'floor' ? 'border-amber-300 bg-amber-100 text-amber-800' : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'}`}
          >
            <MapIcon size={16} />
            Floor
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-colors ${viewMode === 'list' ? 'border-amber-300 bg-amber-100 text-amber-800' : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'}`}
          >
            <List size={16} />
            List
          </button>
        </div>
      </div>

      {viewMode === 'floor' && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-amber-200/50 bg-white p-5 shadow-lg">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-amber-700/60">
                  Showing {filteredTables.length} of {tables.length} tables
                </p>
                <p className="text-sm text-amber-700/60">
                  {availableFilteredCount} available in the current view
                </p>
                  <div className="mt-2">
                    <DateTimeFilter
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      selectedTime={selectedTime}
                      setSelectedTime={setSelectedTime}
                      timeOptions={reservationSlotOptions}
                      isLoading={isChecking}
                      onCheck={handleCheckAvailability}
                      validationMessage={validationMessage}
                      isTimeDisabled={isTimeDisabled}
                    />
                  </div>
              </div>
              <div className="text-sm text-amber-700/60">
                Click a table to change status.
              </div>
            </div>
            
             {/* Table Grid */}
             {isChecking && (
               <div className="mb-4 text-sm text-amber-700/60">Checking availability...</div>
             )}
             {noBookingsFound && (
               <div className="mb-4 text-sm text-amber-700/60">No bookings found for selected slot.</div>
             )}
            <TableGrid
              tables={filteredTables}
              bookingMap={slotBookingMap.size ? slotBookingMap : tableBookingById}
              onTableClick={(t) => setSelectedTableForStatus(t)}
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-amber-200/50 bg-white p-5 shadow-lg">
              <h2 className="mb-4 font-serif text-xl text-amber-900">Table Legend</h2>
              <div className="space-y-3 text-sm">
                {(['available', 'booked', 'reserved', 'seated', 'blocked'] as TableStatus[]).map((status) => (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors.table[status]}`} />
                    <div>
                      <p className="font-medium text-amber-900 capitalize">{statusLabels.table[status]}</p>
                      <p className="text-amber-700/60 text-xs">
                        {status === 'available' && 'Table is ready to be seated'}
                        {status === 'booked' && 'Table is assigned to a booking'}
                        {status === 'reserved' && 'Table is reserved for later'}
                        {status === 'seated' && 'Guests are currently dining'}
                        {status === 'blocked' && 'Table is unavailable for service'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

         <div className="rounded-[24px] border border-amber-200/50 bg-white p-5 shadow-lg">
  <h2 className="mb-4 font-serif text-xl text-amber-900">Quick Actions</h2>

  <div className="space-y-3">
    <Button
      variant="outline"
      className="w-full justify-between border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
      onClick={() => {
        setSelectedArea('main-floor');
        setFilterStatus('all');
        setViewMode('floor');
      }}
    >
      <span>Show Main Floor</span>
      <MapPin size={16} className="text-amber-600" />
    </Button>

    <Button
      variant="outline"
      className="w-full justify-between border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
      onClick={() => {
        setSelectedArea('all');
        setFilterStatus('all');
        setSearchQuery('');
        setViewMode('floor');
      }}
    >
      <span>Reset View</span>
      <RotateCcw size={16} className="text-amber-600" />
    </Button>

    <Button
      variant="outline"
      className="w-full justify-between border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
      onClick={() => setFilterStatus('available')}
    >
      <span>Focus Available Tables</span>
      <Users size={16} className="text-amber-600" />
    </Button>
  </div>
</div>

            <div className="rounded-[24px] border border-amber-200/50 bg-white p-5 shadow-lg">
              <h2 className="mb-3 font-serif text-xl text-amber-900">View Snapshot</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-amber-700/60">Main Floor</p>
                  <p className="font-semibold text-amber-900">{mainFloorCount} tables</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-amber-700/60">Terrace</p>
                  <p className="font-semibold text-amber-900">{terraceCount} tables</p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-amber-700/60">Current Filter</p>
                  <p className="font-semibold text-amber-900 capitalize">
                    {selectedArea === 'all' ? 'All areas' : areaLabels[selectedArea]}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-amber-700/60">Search</p>
                  <p className="font-semibold text-amber-900">{searchQuery.trim() || 'None'}</p>
                </div>
              </div>
            </div>
          </aside>
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

      {viewMode === 'floor' && filteredTables.length === 0 && (
        <div className="rounded-2xl border border-amber-200/50 bg-white px-6 py-10 text-center text-amber-700/60 shadow-lg">
          No tables matched the current filters.
        </div>
      )}

      {/* Table Status Change Dialog */}
      {selectedTableForStatus && (
        <Dialog open={!!selectedTableForStatus} onOpenChange={(open) => !open && setSelectedTableForStatus(null)}>
          <DialogContent className="max-w-md border-amber-200 bg-white text-amber-900">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-amber-900">
                Table T{selectedTableForStatus.tableNumber}
              </DialogTitle>
              <DialogDescription className="text-amber-700/60">
                Capacity: {selectedTableForStatus.capacity} guests
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-sm font-medium text-amber-700/60">Change Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['available', 'booked', 'reserved', 'seated', 'blocked'] as TableStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setPendingStatus(status)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                        pendingStatus === status
                          ? `${statusColors.table[status]} ring-2 ring-offset-2 ring-amber-300`
                          : 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${statusColors.table[status].split(' ').find(c => c.includes('bg-'))} `} />
                        <span className="capitalize">{statusLabels.table[status]}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {shouldShowReservationFields && (
                <div className="space-y-3 rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-amber-700/70">Reservation Date</label>
                    <Input
                      type="date"
                      value={pendingReservationDate}
                      onChange={(event) => setPendingReservationDate(event.target.value)}
                      className="border-amber-200 bg-white text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-amber-700/70">Time Slot</label>
                    <select
                      value={pendingReservationTime}
                      onChange={(event) => setPendingReservationTime(event.target.value)}
                      className="w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-amber-900 outline-none focus:ring-2 focus:ring-amber-300"
                    >
                      <option value="">Optional: choose a time slot</option>
                      {reservationSlotOptions.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-amber-700/60">
                      Optional. Leave both fields empty to save just the status.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                className="bg-amber-700 text-white hover:bg-amber-800"
                onClick={handleSaveTableStatus}
              >
                Save Status
              </Button>
              <Button
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 focus:ring-0 focus:outline-none"
                onClick={() => setSelectedTableForStatus(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent className="max-w-md border-amber-200 bg-white text-amber-900">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-amber-900">Add Table</DialogTitle>
            <DialogDescription className="text-amber-700/60">
              Create a new table and place it automatically in the layout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-amber-700/60">Table Number</label>
              <Input
                type="number"
                min="1"
                value={newTableNumber}
                onChange={(event) => setNewTableNumber(event.target.value)}
                className="border border-amber-200 bg-white text-amber-900 rounded-lg"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-amber-700/60">Capacity</label>
              <Input
                type="number"
                min="1"
                value={newTableCapacity}
                onChange={(event) => setNewTableCapacity(event.target.value)}
                className="border border-amber-200 bg-white text-amber-900 rounded-lg"
              />
            </div>
            {tableMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {tableMessage}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => setIsAddTableOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-amber-700 text-white hover:bg-amber-800" onClick={() => void handleAddTable()} disabled={isSavingTable}>
              {isSavingTable ? 'Saving...' : 'Create Table'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
