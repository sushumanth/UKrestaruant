import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Utensils,
  Map,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store';
import { signOutStaffPortal } from '@/adminApi';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee' },
  { icon: Calendar, label: 'Bookings', href: '/employee/bookings' },
  { icon: Utensils, label: 'Menu', href: '/employee/menu' },
  { icon: Map, label: 'Floor Plan', href: '/employee/floor-plan' },
];

export const EmployeeSidebar = () => {
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
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="p-2 rounded-xl hover:bg-amber-50 transition"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X size={24} className="text-amber-800" /> : <Menu size={24} className="text-amber-800" />}
        </button>

        <div className="text-center leading-tight min-w-0 px-2">
          <span className="block text-[10px] uppercase tracking-[0.25em] text-amber-700/70 font-medium truncate">
            Staff Portal
          </span>

          <span className="block text-[15px] font-serif text-amber-900 truncate">
            Singh&apos;s Dining
          </span>
        </div>

        <div className="w-10" aria-hidden="true" />
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
          fixed top-0 right-0 md:left-0 md:right-auto z-50 h-screen bg-white border-l md:border-l-0 md:border-r border-amber-200
          flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none

          w-[82vw] max-w-[320px] md:w-64
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          md:${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-amber-200">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-700/70 font-semibold md:hidden">
              Staff Portal
            </p>

            <h2 className={`font-serif text-amber-900 truncate ${isCollapsed ? 'md:hidden' : 'text-[18px]'}`}>
              Singh&apos;s Dining
            </h2>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCollapsed((current) => !current);
            }}
            className="p-2 rounded-lg hover:bg-amber-50 transition md:block hidden"
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-amber-700" />
            ) : (
              <ChevronLeft size={18} className="text-amber-700" />
            )}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-amber-50 transition md:hidden"
            aria-label="Close menu"
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
                  flex items-center gap-4 rounded-2xl
                  px-4 py-3.5 transition-all duration-200

                  ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-200 shadow-sm'
                      : 'text-amber-800/70 hover:bg-amber-50 hover:text-amber-900'
                  }
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon
                  size={20}
                  className="flex-shrink-0"
                />

                {(!isCollapsed || true) && (
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
          {(!isCollapsed || true) && (
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
            title={isCollapsed ? 'Logout' : undefined}
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