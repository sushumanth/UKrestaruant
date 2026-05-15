import { useEffect, useMemo, useState, useRef, useCallback, type JSX } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Calendar,
  Clock3,
  CreditCard,
  Hash,
  MapPin,
  Users,
  ChevronRight,
  Sparkles,
  
  
  TrendingUp,
  Star,
  Shield,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  Filter,
  Search,
  X,
} from 'lucide-react';
//import { formatCurrency, formatDate, formatTime } from '@/mockData';
// import { getCustomerBookings, getCustomerOrders } from '@/backendBookingApi';
import { getCustomerBookings, getCustomerOrders} from '@/frontendapis';
import { useCustomerAuthStore } from '@/store';
import type { Booking } from '@/types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const formatTime = (value: string) => {
  const [hours = '0', minutes = '0'] = value.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Booking['status'],
  { label: string; color: string; bg: string; border: string; glow: string; icon: JSX.Element }
> = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    glow: '0 0 12px rgba(245,158,11,0.25)',
    icon: <Clock size={11} />,
  },
  confirmed: {
    label: 'Confirmed',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
    glow: '0 0 12px rgba(16,185,129,0.2)',
    icon: <CheckCircle2 size={11} />,
  },
  arrived: {
    label: 'Arrived',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.25)',
    glow: '0 0 12px rgba(56,189,248,0.2)',
    icon: <ArrowUpRight size={11} />,
  },
  seated: {
    label: 'Seated',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.08)',
    border: 'rgba(129,140,248,0.25)',
    glow: '0 0 12px rgba(129,140,248,0.2)',
    icon: <Star size={11} />,
  },
  completed: {
    label: 'Completed',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
    glow: '0 0 12px rgba(167,139,250,0.2)',
    icon: <CheckCircle2 size={11} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.25)',
    glow: '0 0 12px rgba(248,113,113,0.15)',
    icon: <XCircle size={11} />,
  },
  no_show: {
    label: 'No Show',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
    glow: 'none',
    icon: <AlertCircle size={11} />,
  },
};

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{count}</>;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
  subtitle,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: JSX.Element;
  accent: string;
  subtitle?: string;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
        transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
        background: '#fffaf4',
        border: '1px solid rgba(180,130,60,0.18)',
        borderRadius: 20,
        padding: '18px 20px',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
      className="stat-card-hover"
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120,
        borderRadius: '50%', background: accent, opacity: 0.07, filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}>
          {icon}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: '#2f6b3b', fontWeight: 600,
          letterSpacing: '0.04em',
        }}>
          <TrendingUp size={10} />
          Live
        </div>
      </div>

      <div style={{ fontSize: 42, fontWeight: 700, color: '#3b2a1a', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>
        <AnimatedCounter target={value} />
      </div>
      <div style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: 'rgba(91,58,30,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        {label}
      </div>
      {subtitle && (
        <div style={{ marginTop: 4, fontSize: 12, color: accent, opacity: 0.7 }}>{subtitle}</div>
      )}
    </div>
  );
}

// ─── Booking Card ────────────────────────────────────────────────────────────

function BookingCard({ booking, index }: { booking: Booking; index: number }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CONFIG[booking.status];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100 + index * 70);
    return () => clearTimeout(timer);
  }, [index]);

  const isUpcoming = useMemo(() => {
    const now = new Date();
    const dt = new Date(`${booking.date}T${booking.time}:00`);
    return dt >= now && booking.status !== 'cancelled' && booking.status !== 'no_show';
  }, [booking]);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms`,
        background: hovered
          ? '#fff5e9'
          : '#fffaf4',
        border: hovered
          ? '1px solid rgba(180,130,60,0.28)'
          : '1px solid rgba(180,130,60,0.16)',
        borderRadius: 20,
        padding: '0',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'default',
        boxShadow: hovered
          ? '0 22px 40px rgba(91,58,30,0.18), 0 0 0 1px rgba(180,130,60,0.12)'
          : '0 10px 24px rgba(91,58,30,0.12)',
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${cfg.color}00, ${cfg.color}, ${cfg.color}00)`,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
      }} />

      {/* Upcoming shimmer */}
      {isUpcoming && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${cfg.color}60, transparent)`,
        }} />
      )}

      <div style={{ padding: '20px 24px 20px 28px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'rgba(180,130,60,0.08)', border: '1px solid rgba(180,130,60,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Hash size={12} style={{ color: 'rgba(91,58,30,0.65)' }} />
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13, fontWeight: 700,
              color: '#3b2a1a', letterSpacing: '0.08em',
            }}>
              {booking.bookingId}
            </span>
            {isUpcoming && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                color: '#2f6b3b', background: 'rgba(47,107,59,0.12)',
                border: '1px solid rgba(47,107,59,0.24)',
                borderRadius: 6, padding: '2px 7px', textTransform: 'uppercase',
              }}>
                Upcoming
              </span>
            )}
          </div>

          {/* Status badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 100,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            boxShadow: hovered ? cfg.glow : 'none',
            transition: 'box-shadow 0.3s ease',
            fontSize: 11, fontWeight: 700, color: cfg.color,
            letterSpacing: '0.06em',
          }}>
            {cfg.icon}
            {cfg.label}
          </div>
        </div>

        {/* Details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px 20px',
        }}>
          {[
            { icon: <Calendar size={13} />, value: formatDate(booking.date) },
            { icon: <Clock3 size={13} />, value: formatTime(booking.time) },
            { icon: <Users size={13} />, value: `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}` },
            { icon: <MapPin size={13} />, value: booking.tableNumber ? `Table ${booking.tableNumber}` : 'Table pending' },
          ].map(({ icon, value }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ color: 'rgba(91,58,30,0.45)', flexShrink: 0 }}>{icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(91,58,30,0.78)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 16, paddingTop: 14,
          borderTop: '1px solid rgba(180,130,60,0.16)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 100,
              background: 'rgba(180,130,60,0.08)', border: '1px solid rgba(180,130,60,0.2)',
              fontSize: 12, fontWeight: 600, color: 'rgba(91,58,30,0.75)',
            }}>
              <CreditCard size={12} style={{ color: 'rgba(91,58,30,0.55)' }} />
              Deposit paid
              <span style={{ color: '#3b2a1a', fontWeight: 700 }}>{formatCurrency(booking.depositAmount)}</span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: 'rgba(91,58,30,0.45)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}>
            View details <ChevronRight size={11} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

type FilterType = 'all' | 'upcoming' | Booking['status'];

function FilterBar({
  active,
  onChange,
  counts,
}: {
  active: FilterType;
  onChange: (f: FilterType) => void;
  counts: Record<string, number>;
}) {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {filters.map(({ key, label }) => {
        const isActive = active === key;
        const cfg = key !== 'all' && key !== 'upcoming' ? STATUS_CONFIG[key as Booking['status']] : null;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 100, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
              background: isActive
                ? (cfg ? cfg.bg : 'rgba(180,130,60,0.18)')
                : 'rgba(180,130,60,0.08)',
              color: isActive
                ? (cfg ? cfg.color : '#3b2a1a')
                : 'rgba(91,58,30,0.6)',
              border: isActive
                ? `1px solid ${cfg ? cfg.border : 'rgba(180,130,60,0.3)'}`
                : '1px solid rgba(180,130,60,0.16)',
              transition: 'all 0.2s ease',
              boxShadow: isActive && cfg ? cfg.glow : 'none',
            }}
          >
            {cfg && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />}
            {label}
            {counts[key] !== undefined && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '1px 5px',
                borderRadius: 6, background: 'rgba(180,130,60,0.18)',
                color: 'rgba(91,58,30,0.7)',
              }}>
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── View Toggle ─────────────────────────────────────────────────────────────

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', flex: 1, minWidth: 180, maxWidth: 280 }}>
      <Search size={13} style={{
        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
        color: 'rgba(91,58,30,0.45)', pointerEvents: 'none',
      }} />
      <input
        type="text"
        placeholder="Search bookings…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '8px 32px 8px 32px',
          background: '#fffaf4', border: '1px solid rgba(180,130,60,0.2)',
          borderRadius: 10, color: '#3b2a1a', fontSize: 13,
          outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s ease',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(180,130,60,0.4)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(180,130,60,0.2)'; }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(91,58,30,0.5)', padding: 0,
            display: 'flex', alignItems: 'center',
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '56px 24px', textAlign: 'center',
      background: '#fffaf4', border: '1px dashed rgba(180,130,60,0.25)',
      borderRadius: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(180,130,60,0.08)', border: '1px solid rgba(180,130,60,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        {filtered ? <Filter size={24} style={{ color: 'rgba(91,58,30,0.45)' }} /> : <Calendar size={24} style={{ color: 'rgba(91,58,30,0.45)' }} />}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'rgba(91,58,30,0.8)', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>
        {filtered ? 'No matching bookings' : 'No reservations yet'}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(91,58,30,0.55)', maxWidth: 280, lineHeight: 1.6 }}>
        {filtered
          ? 'Try adjusting your filters or search query.'
          : 'Reserve your first table and experience the finest dining.'}
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: '#fffaf4', border: '1px solid rgba(180,130,60,0.16)',
      borderRadius: 20, padding: '20px 24px', overflow: 'hidden', position: 'relative',
    }}>
      <div className="skeleton-shimmer" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ height: 28, width: 160, borderRadius: 8, background: 'rgba(180,130,60,0.12)' }} />
        <div style={{ height: 26, width: 90, borderRadius: 100, background: 'rgba(180,130,60,0.12)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px 20px', marginBottom: 18 }}>
        {[140, 100, 110, 120].map((w, i) => (
          <div key={i} style={{ height: 18, width: w, borderRadius: 6, background: 'rgba(180,130,60,0.1)' }} />
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(180,130,60,0.12)', marginBottom: 14 }} />
      <div style={{ height: 26, width: 140, borderRadius: 100, background: 'rgba(180,130,60,0.12)' }} />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const CustomerDashboardPage = () => {
  const { customer, isCustomerAuthenticated } = useCustomerAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [headerVisible, setHeaderVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!customer || !isCustomerAuthenticated) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const bookingsResult = await getCustomerBookings(customer.email);
        const ordersResult = await getCustomerOrders(customer.email);

        if (!bookingsResult.ok) {
          setError(bookingsResult.error ?? 'Unable to load your bookings right now.');
          setBookings([]);
        } else {
          setBookings(bookingsResult.bookings);
        }

        if (ordersResult.ok) {
          void ordersResult.orders;
        }

        setIsLoading(false);
      } catch {
        setError('An unexpected error occurred. Please try again.');
        setBookings([]);
        setIsLoading(false);
      }
    })();
  }, [customer, isCustomerAuthenticated]);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter((b) => {
      const dt = new Date(`${b.date}T${b.time}:00`);
      return dt >= now && b.status !== 'cancelled' && b.status !== 'no_show';
    });
  }, [bookings]);

  const filterCounts = useMemo(() => {
    const now = new Date();
    const counts: Record<string, number> = { all: bookings.length };
    counts.upcoming = bookings.filter((b) => {
      const dt = new Date(`${b.date}T${b.time}:00`);
      return dt >= now && b.status !== 'cancelled' && b.status !== 'no_show';
    }).length;
    (['pending', 'confirmed', 'arrived', 'seated', 'completed', 'cancelled', 'no_show'] as Booking['status'][]).forEach((s) => {
      counts[s] = bookings.filter((b) => b.status === s).length;
    });
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    let result = [...bookings];

    if (filter === 'upcoming') {
      result = result.filter((b) => {
        const dt = new Date(`${b.date}T${b.time}:00`);
        return dt >= now && b.status !== 'cancelled' && b.status !== 'no_show';
      });
    } else if (filter !== 'all') {
      result = result.filter((b) => b.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingId.toLowerCase().includes(q) ||
          b.date.includes(q) ||
          (b.tableNumber?.toString() ?? '').includes(q) ||
          b.status.includes(q)
      );
    }

    return result;
  }, [bookings, filter, search]);

  const totalSpend = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.depositAmount ?? 0), 0),
    [bookings]
  );

  const clearError = useCallback(() => setError(''), []);
  // const handleSignOut = useCallback(async () => {
  //   await signOutCustomer();
  //   logoutCustomer();
  // }, [logoutCustomer]);

  if (!isCustomerAuthenticated || !customer) {
    return <Navigate to="/customer/auth?redirect=/customer/dashboard" replace />;
  }

  const initials = `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');

        .dashboard-root * { box-sizing: border-box; }

        .stat-card-hover {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease !important;
        }
        .stat-card-hover:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 18px 40px rgba(91,58,30,0.18), 0 0 0 1px rgba(180,130,60,0.12) !important;
        }

        .booking-grid {
          display: grid;
          gap: 14px;
        }

        .booking-grid.is-list,
        .booking-grid.is-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        @media (max-width: 1024px) {
          .booking-grid.is-list,
          .booking-grid.is-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          animation: shimmer 1.8s infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-slow { animation: spin-slow 6s linear infinite; }

        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.9; }
          70% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid currentColor;
          animation: pulse-ring 2.4s ease-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .float-orb { animation: float 6s ease-in-out infinite; }

        input::placeholder { color: rgba(91,58,30,0.35); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(141,90,37,0.25); border-radius: 2px; }
      `}</style>

      <div
        className="dashboard-root"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(140deg, #f7f0e6 0%, #f3eadb 45%, #faf5ec 100%)',
          fontFamily: "'DM Sans', sans-serif",
          color: '#3b2a1a',
          paddingTop: 72,
          paddingBottom: 64,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background atmosphere */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div className="float-orb" style={{
            position: 'absolute', top: '8%', left: '12%',
            width: 480, height: 480, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(180,130,60,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div className="float-orb" style={{
            position: 'absolute', bottom: '10%', right: '8%',
            width: 360, height: 360, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(161,117,55,0.09) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animationDelay: '-3s',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(141,90,37,0.15), transparent)',
          }} />
          {/* Noise grain */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '100%', margin: '0 auto', padding: '0 16px' }}>

          {/* ── Hero Header ─────────────────────────────────────────────── */}
          <div style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* Top bar */}
            {/* <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, flexWrap: 'wrap', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                  boxShadow: '0 0 8px rgba(16,185,129,0.6)',
                  position: 'relative',
                }} className="pulse-ring" />
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'rgba(91,58,30,0.45)',
                }}>
                  Customer Portal
                </span>
              </div>

             
            </div> */}

            {/* Hero card */}
            <div style={{
              background: 'rgba(255,250,244,0.92)',
              border: '1px solid rgba(180,130,60,0.2)',
              borderRadius: 22, padding: '18px 24px',
              backdropFilter: 'blur(24px)',
              position: 'relative', overflow: 'hidden', marginBottom: 18,
            }}>
              {/* Decorative horizontal rule */}
              <div style={{
                position: 'absolute', top: 0, left: 40, right: 40, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(180,130,60,0.4), transparent)',
              }} />

              {/* Corner ornament */}
              <div style={{
                position: 'absolute', top: 20, right: 32,
                width: 80, height: 80, opacity: 0.06,
              }}>
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="38" stroke="#f8f4ee" strokeWidth="0.5" />
                  <circle cx="40" cy="40" r="28" stroke="#f8f4ee" strokeWidth="0.5" />
                  <line x1="40" y1="2" x2="40" y2="78" stroke="#f8f4ee" strokeWidth="0.5" />
                  <line x1="2" y1="40" x2="78" y2="40" stroke="#f8f4ee" strokeWidth="0.5" />
                </svg>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 9px', borderRadius: 8,
                    background: 'rgba(180,130,60,0.1)', border: '1px solid rgba(180,130,60,0.2)',
                    marginBottom: 12,
                  }}>
                    <Shield size={10} style={{ color: '#b4823c' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: '#b4823c', textTransform: 'uppercase' }}>
                      Verified Member
                    </span>
                  </div>

                  <h1 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 'clamp(30px, 4.2vw, 46px)',
                    fontWeight: 700, lineHeight: 0.95,
                    color: '#3b2a1a', margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    Welcome back,
                    <br />
                    <em style={{ fontStyle: 'italic', color: '#c9a06a' }}>{customer.firstName}</em>
                  </h1>

                  <p style={{ marginTop: 10, fontSize: 13, color: 'rgba(91,58,30,0.6)', lineHeight: 1.6, maxWidth: 420 }}>
                    Your exclusive dining portal — manage reservations, track your experience, and explore our curated offerings.
                  </p>

                  <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Link
                      to="/booking"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '11px 22px', borderRadius: 100,
                        background: 'linear-gradient(135deg, #c9a06a, #a07840)',
                        color: '#fff', fontWeight: 700, fontSize: 13,
                        textDecoration: 'none', letterSpacing: '0.04em',
                        boxShadow: '0 8px 24px rgba(180,130,60,0.3)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(180,130,60,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(180,130,60,0.3)';
                      }}
                    >
                      <Sparkles size={14} />
                      Reserve a Table
                    </Link>

                    <Link
                      to="/menu"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '11px 22px', borderRadius: 100,
                        background: '#fff3e2', border: '1px solid rgba(180,130,60,0.25)',
                        color: '#5b3a1e', fontWeight: 700, fontSize: 13,
                        cursor: 'pointer', letterSpacing: '0.04em',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit', textDecoration: 'none',
                        boxShadow: '0 10px 24px rgba(180,130,60,0.16)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ffe9cd';
                        e.currentTarget.style.color = '#4a2d16';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff3e2';
                        e.currentTarget.style.color = '#5b3a1e';
                      }}
                    >
                      View Menu <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(180,130,60,0.3), rgba(180,130,60,0.1))',
                    border: '1px solid rgba(180,130,60,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 24, fontWeight: 700, color: '#c9a06a',
                    position: 'relative',
                  }}>
                    {initials}
                    {/* Spinning ring */}
                    <div className="spin-slow" style={{
                      position: 'absolute', inset: -6, borderRadius: '50%',
                      border: '1px dashed rgba(180,130,60,0.2)',
                    }} />
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: 'rgba(91,58,30,0.5)', letterSpacing: '0.08em' }}>
                      {customer.email?.split('@')[0]}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16, marginBottom: 22,
            }}>
              <StatCard
                label="Upcoming"
                value={upcomingBookings.length}
                icon={<Calendar size={18} />}
                accent="#10b981"
                subtitle={upcomingBookings.length > 0 ? 'Active reservations' : 'None scheduled'}
                delay={100}
              />
              <StatCard
                label="Total Bookings"
                value={bookings.length}
                icon={<Hash size={18} />}
                accent="#c9a06a"
                subtitle="Lifetime reservations"
                delay={200}
              />
              <StatCard
                label="Total Deposits"
                value={Math.round(totalSpend)}
                icon={<CreditCard size={18} />}
                accent="#818cf8"
                subtitle={`${formatCurrency(totalSpend)} paid`}
                delay={300}
              />
              <StatCard
                label="Completed"
                value={filterCounts['completed'] ?? 0}
                icon={<Star size={18} />}
                accent="#f59e0b"
                subtitle="Dining experiences"
                delay={400}
              />
            </div>
          </div>

          {/* ── Booking List Section ─────────────────────────────────────── */}
          <div style={{
            opacity: headerVisible ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}>
            {/* Section header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28, fontWeight: 700, margin: 0,
                  color: '#3b2a1a', letterSpacing: '-0.01em',
                }}>
                  Your Reservations
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(91,58,30,0.5)', margin: '4px 0 0' }}>
                  {filteredBookings.length} of {bookings.length} bookings shown
                </p>
              </div>
            </div>

            {/* Filter + search bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 20, flexWrap: 'wrap',
              padding: '14px 18px',
              background: '#fffaf4',
              border: '1px solid rgba(180,130,60,0.18)',
              borderRadius: 16,
            }}>
              <Filter size={13} style={{ color: 'rgba(91,58,30,0.45)', flexShrink: 0 }} />
              <FilterBar active={filter} onChange={setFilter} counts={filterCounts} />
              <div style={{ marginLeft: 'auto' }}>
                <SearchBar value={search} onChange={setSearch} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 14, marginBottom: 16,
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#f87171' }}>{error}</span>
                </div>
                <button
                  onClick={clearError}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(248,113,113,0.6)' }}
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
                  <Loader2 size={14} style={{ color: 'rgba(91,58,30,0.45)', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12, color: 'rgba(91,58,30,0.45)' }}>Loading your reservations…</span>
                </div>
              </div>
            )}

            {/* Bookings */}
            {!isLoading && !error && (
              <>
                {filteredBookings.length === 0 ? (
                  <EmptyState filtered={filter !== 'all' || search !== ''} />
                ) : (
                  <div className="booking-grid is-grid">
                    {filteredBookings.map((booking, i) => (
                      <BookingCard key={booking.id} booking={booking} index={i} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Footer meta */}
            {!isLoading && bookings.length > 0 && (
              <div style={{
                marginTop: 32, padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: '#fffaf4', border: '1px solid rgba(180,130,60,0.16)',
                borderRadius: 14,
              }}>
                <Shield size={12} style={{ color: 'rgba(91,58,30,0.45)' }} />
                <span style={{ fontSize: 11, color: 'rgba(91,58,30,0.45)', letterSpacing: '0.06em' }}>
                  All reservations are secured and encrypted · Singh's Dining by Rangrez
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};