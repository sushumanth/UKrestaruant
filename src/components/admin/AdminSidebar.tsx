import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Map,
  BarChart3,
  Settings,
  UtensilsCrossed,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store';
import { signOutStaffPortal } from '@/frontendapis';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Calendar, label: 'Bookings', href: '/admin/bookings' },
  { icon: UtensilsCrossed, label: 'Menu', href: '/admin/menu' },
  { icon: Map, label: 'Floor Plan', href: '/admin/floor-plan' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Users, label: 'Staff', href: '/admin/staff' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutStaffPortal();
    logout();
  };

  return (
    <>
      {/* ================= MOBILE TOPBAR ================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-amber-200 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-xl hover:bg-amber-50 transition flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={24} className="text-amber-800" />
        </button>

        <div className="flex items-center gap-2 min-w-0 mx-2">
          <img
            src="/logo1.png"
            alt="Singh's Dining logo"
            className="h-9 w-9 object-contain flex-shrink-0"
            loading="eager"
            draggable={false}
          />
          <div className="leading-tight min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-sm tracking-wide text-[#e49f4b] whitespace-nowrap">Singh&apos;s</span>
              <span className="inline-block h-3 w-px bg-[#D4A23A]/70" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#847d3b] whitespace-nowrap">Dining</span>
            </div>
            <span className="block text-[8px] uppercase tracking-[0.22em] text-[#AFB8C8]/80 whitespace-nowrap">
              By Rangrez
            </span>
          </div>
        </div>

        <div className="w-10 flex-shrink-0" aria-hidden="true" />
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-white border-r border-amber-200
          flex flex-col transition-all duration-300 ease-in-out

          /* Desktop */
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}

          /* Mobile */
          w-[280px]
          md:translate-x-0
          ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-amber-200">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/logo1.png"
              alt="Logo"
              className="h-11 w-11 object-contain flex-shrink-0"
            />

            {(!isCollapsed || window.innerWidth < 768) && (
              <div className="min-w-0">
                <div className="flex items-end gap-1.5 sm:gap-2">
                    <span className="font-serif text-[20px] sm:text-[22px] tracking-wide text-[#bd8b40]">Singh&apos;s</span>
                    <span className="inline-block h-3.5 w-px sm:h-4 sm:w-px bg-[#595856]/30"></span>
                    <span className="pb-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#595856]">Dining</span>
                  </div>

                <p className="text-[11px] text-amber-700/70 tracking-wide uppercase">
                  Admin Panel
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileMenuOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            className="p-2 rounded-lg hover:bg-amber-50 transition"
          >
            <X size={18} className="text-amber-700" />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center gap-4 rounded-2xl
                  px-4 py-3.5 transition-all duration-200

                  ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'
                      : 'text-amber-800/70 hover:bg-amber-50 hover:text-amber-900'
                  }
                `}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0"
                />

                {(!isCollapsed || window.innerWidth < 768) && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= FOOTER ================= */}
        <div className="border-t border-amber-200 p-4 bg-white">
          {(!isCollapsed || window.innerWidth < 768) && (
            <div className="mb-4 px-1">
              <p className="text-sm font-semibold text-amber-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>

              <p className="text-xs text-amber-700/60 capitalize mt-0.5">
                {user?.role}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              void handleLogout();
            }}
            className="
              flex items-center gap-4 w-full
              px-4 py-3 rounded-2xl
              text-amber-700/70
              hover:bg-red-50 hover:text-red-600
              transition-all duration-200
            "
          >
            <LogOut size={20} />

            {(!isCollapsed || window.innerWidth < 768) && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};