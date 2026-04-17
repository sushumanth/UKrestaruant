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
    <header className="h-20 bg-[#0B0C0F] border-b border-[rgba(244,246,250,0.08)] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
          <Input
            type="text"
            placeholder="Search bookings, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-luxury pl-10 w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Quick Booking */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-gold flex items-center gap-2">
              <Plus size={18} />
              <span className="hidden sm:inline">Quick Booking</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#14171C] border border-[rgba(244,246,250,0.10)] max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-[#F4F6FA]">
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
