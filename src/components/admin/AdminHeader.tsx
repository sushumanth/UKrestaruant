import { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { QuickBookingForm } from './QuickBookingForm';

export const AdminHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-20 bg-white border-b border-amber-200 flex items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" size={18} />
          <Input
            type="text"
            placeholder="Search bookings, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-amber-200 bg-white text-amber-900 placeholder:text-amber-700/50 focus:ring-amber-200 focus:border-amber-300 pl-10 w-full rounded-lg"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-amber-700/70 hover:text-amber-700 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Quick Booking */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">Quick Booking</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-amber-200">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-amber-900">
                Create New Booking
              </DialogTitle>
            </DialogHeader>
            <QuickBookingForm />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};
