import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const EmployeeHeader = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="hidden md:flex h-20 bg-white border-b border-amber-200 items-center justify-between px-6 shadow-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60" size={18} />
          <Input
            type="text"
            placeholder="Search bookings..."
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

        {/* Date/Time */}
        <div className="hidden sm:block text-right">
          <p className="text-amber-900 font-medium">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-amber-700/60 text-sm">
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </header>
  );
};
