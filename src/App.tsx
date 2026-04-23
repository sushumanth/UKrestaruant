import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore } from '@/store';
import { generateTables, generateBookings, mockUsers, mockSettings, generateReports } from '@/lib/mockData';
import { useTableStore, useBookingStore, useSettingsStore, useAnalyticsStore } from '@/store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  fetchPublicOperationalData,
  fetchStaffOperationalData,
  resolveCurrentStaffUser,
} from '@/lib/supabaseAdminApi';

// Layouts
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';

// Pages
import { HomePage } from '@/pages/customer/HomePage';
import { MenuPage } from '@/pages/customer/MenuPage';
import { CartPage } from '@/pages/customer/CartPage';
import { BookingPage } from '@/pages/customer/BookingPage';
import { BookingConfirmationPage } from '@/pages/customer/BookingConfirmationPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminFloorPlan } from '@/pages/admin/AdminFloorPlan';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { EmployeeBookings } from '@/pages/employee/EmployeeBookings';
import { LoginPage } from '@/pages/LoginPage';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Protected Route Component
const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { setTables } = useTableStore();
  const { setBookings } = useBookingStore();
  const { setSettings } = useSettingsStore();
  const { setReports } = useAnalyticsStore();

  const loadPublicData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    const publicData = await fetchPublicOperationalData();
    setTables(publicData.tables);

    if (publicData.settings) {
      setSettings(publicData.settings);
    }
  }, [setSettings, setTables]);

  const loadStaffData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    const staffData = await fetchStaffOperationalData();
    setBookings(staffData.bookings);
    setReports(staffData.reports);
  }, [setBookings, setReports]);

  // Initialize app state from Supabase when configured, otherwise fallback to local mock mode.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (!isInitialized) {
        setTables(generateTables());
        setBookings(generateBookings());
        setSettings(mockSettings);
        setReports(generateReports());
        login(mockUsers[0]);
        setIsInitialized(true);
      }
      return;
    }

    let isMounted = true;

    const initializeFromSupabase = async () => {
      try {
        await loadPublicData();

        const currentUser = await resolveCurrentStaffUser();

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          login(currentUser);
          await loadStaffData();
        } else {
          logout();
          setBookings([]);
          setReports([]);
        }
      } catch (error) {
        console.warn('Failed to initialize from Supabase:', error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    void initializeFromSupabase();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        if (!session?.user) {
          logout();
          setBookings([]);
          setReports([]);
          return;
        }

        const currentUser = await resolveCurrentStaffUser();

        if (!currentUser) {
          logout();
          setBookings([]);
          setReports([]);
          return;
        }

        login(currentUser);
        await loadStaffData();
      })();
    });

    return () => {
      isMounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, [
    isInitialized,
    loadPublicData,
    loadStaffData,
    login,
    logout,
    setBookings,
    setReports,
    setSettings,
    setTables,
  ]);

  // Keep staff/admin dashboards in sync with realtime DB changes.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !isAuthenticated || !user) {
      return;
    }

    const client = supabase;

    if (!['admin', 'employee'].includes(user.role)) {
      return;
    }

    const refreshAll = async () => {
      try {
        await loadPublicData();
        await loadStaffData();
      } catch (error) {
        console.warn('Failed to refresh realtime operational data:', error);
      }
    };

    const channel = client
      .channel('ops-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        void refreshAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, () => {
        void refreshAll();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_settings' }, () => {
        void refreshAll();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [isAuthenticated, loadPublicData, loadStaffData, user]);

  // Refresh ScrollTrigger on route change
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center">
        <div className="text-center">
          <div className="font-serif text-3xl text-[#D4A23A] mb-4">LUXERESERVE</div>
          <div className="text-[#A9B1BE]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="book" element={<BookingPage />} />
          <Route path="confirmation" element={<BookingConfirmationPage />} />
        </Route>
        
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="floor-plan" element={<AdminFloorPlan />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Employee Routes */}
        <Route 
          path="/employee" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="bookings" element={<EmployeeBookings />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
