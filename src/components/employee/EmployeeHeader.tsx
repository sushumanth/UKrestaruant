import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const EmployeeHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-20 bg-[#0B0C0F] border-b border-[rgba(244,246,250,0.08)] flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9B1BE]" size={18} />
          <Input
            type="text"
            placeholder="Search bookings..."
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

        {/* Date/Time */}
        <div className="hidden sm:block text-right">
          <p className="text-[#F4F6FA] font-medium">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[#A9B1BE] text-sm">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </header>
  );
};
