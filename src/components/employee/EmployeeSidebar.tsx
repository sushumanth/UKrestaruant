import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store';
import { signOutStaffPortal } from '@/lib/supabaseAdminApi';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee' },
  { icon: Calendar, label: 'Bookings', href: '/employee/bookings' },
];

export const EmployeeSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOutStaffPortal();
    logout();
  };

  return (
    <aside 
      className={`fixed left-0 top-0 h-full bg-[#14171C] border-r border-[rgba(244,246,250,0.08)] z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[rgba(244,246,250,0.08)]">
        {!isCollapsed && (
          <Link to="/employee" className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#A9B1BE]">
              STAFF
            </span>
            <span className="font-serif text-lg text-[#F4F6FA]">PORTAL</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#D4A23A]/20 text-[#D4A23A] border border-[#D4A23A]/30'
                  : 'text-[#A9B1BE] hover:bg-[rgba(244,246,250,0.05)] hover:text-[#F4F6FA]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(244,246,250,0.08)]">
        {!isCollapsed && (
          <div className="mb-4 px-4">
            <p className="text-[#F4F6FA] font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-[#A9B1BE] text-xs capitalize">{user?.role}</p>
          </div>
        )}
        <button
          onClick={() => {
            void handleLogout();
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-[#A9B1BE] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
