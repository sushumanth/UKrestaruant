import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore, useCustomerAuthStore } from '@/store';
import { generateTables, generateBookings, mockUsers, mockSettings, generateReports } from '@/lib/mockData';
import { mockMenuItems } from '@/lib/mockData';
import { useTableStore, useBookingStore, useSettingsStore, useAnalyticsStore, useMenuStore } from '@/store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import {
  fetchPublicOperationalData,
  fetchStaffOperationalData,
  resolveCurrentStaffUser,
} from '@/lib/supabaseAdminApi';
import { resolveCurrentCustomer } from '@/lib/supabaseCustomerApi';

// Layouts
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';

// Pages
import { HomePage } from '@/pages/customer/HomePage';
import { MenuPage } from '@/pages/customer/MenuPage';
import { CartPage } from '@/pages/customer/CartPage';
import { OrderOnlinePage } from '@/pages/customer/order_online';
import { BookingPage } from '@/pages/customer/BookingPage';
import { BookingConfirmationPage } from '@/pages/customer/BookingConfirmationPage';
import { CustomerAuthPage } from '@/pages/customer/CustomerAuthPage';
import { CustomerDashboardPage } from '@/pages/customer/CustomerDashboardPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminBookings } from '@/pages/admin/AdminBookings';
import { AdminMenu } from '@/pages/admin/AdminMenu';
import { AdminFloorPlan } from '@/pages/admin/AdminFloorPlan';
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { EmployeeBookings } from '@/pages/employee/EmployeeBookings';
import { EmployeeMenu } from '@/pages/employee/EmployeeMenu';
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

const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isCustomerAuthenticated } = useCustomerAuthStore();
  const location = useLocation();

  if (!isCustomerAuthenticated) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/customer/auth?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
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
  const { loginCustomer, logoutCustomer } = useCustomerAuthStore();
  const { setTables } = useTableStore();
  const { setBookings } = useBookingStore();
  const { setSettings } = useSettingsStore();
  const { setReports } = useAnalyticsStore();
  const { setMenuItems } = useMenuStore();

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      if (!isSupabaseConfigured) {
        if (isMounted && !isInitialized) {
          setTables(generateTables());
          setBookings(generateBookings());
          setSettings(mockSettings);
          setReports(generateReports());
          setMenuItems(mockMenuItems);
          login(mockUsers[0]);
          setIsInitialized(true);
        }
        return;
      }

      try {
        const publicData = await fetchPublicOperationalData();

        if (!isMounted) {
          return;
        }

        setTables(publicData.tables);
        setMenuItems(publicData.menuItems);

        if (publicData.settings) {
          setSettings(publicData.settings);
        }

        const currentUser = await resolveCurrentStaffUser();

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          login(currentUser);

          const staffData = await fetchStaffOperationalData();
          if (!isMounted) {
            return;
          }

          setBookings(staffData.bookings);
          setReports(staffData.reports);
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
    })();

    return () => {
      isMounted = false;
    };
  }, [
    isInitialized,
    login,
    logout,
    setBookings,
    setMenuItems,
    setReports,
    setSettings,
    setTables,
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !isAuthenticated || !user || !['admin', 'employee'].includes(user.role)) {
      return;
    }

    const client = supabase;

    const refreshAll = async () => {
      try {
        const publicData = await fetchPublicOperationalData();
        setTables(publicData.tables);
        setMenuItems(publicData.menuItems);

        if (publicData.settings) {
          setSettings(publicData.settings);
        }

        const staffData = await fetchStaffOperationalData();
        setBookings(staffData.bookings);
        setReports(staffData.reports);
      } catch (error) {
        console.warn('Failed to refresh realtime operational data:', error);
      }
    };

    const channel = supabase
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        void refreshAll();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [isAuthenticated, setBookings, setMenuItems, setReports, setSettings, setTables, user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    void (async () => {
      const currentCustomer = await resolveCurrentCustomer();

      if (!isMounted) {
        return;
      }

      if (currentCustomer) {
        loginCustomer(currentCustomer);
      } else {
        logoutCustomer();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loginCustomer, logoutCustomer]);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="online-order" element={<OrderOnlinePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="confirmation" element={<BookingConfirmationPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer/auth" element={<CustomerAuthPage />} />

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
          <Route path="menu" element={<AdminMenu />} />
          <Route path="floor-plan" element={<AdminFloorPlan />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

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
          <Route path="menu" element={<EmployeeMenu />} />
          <Route path="floor-plan" element={<AdminFloorPlan />} />
        </Route>

        <Route path="/book" element={<Navigate to="/booking" replace />} />

        <Route
          path="/booking"
          element={
            <CustomerProtectedRoute>
              <CustomerLayout />
            </CustomerProtectedRoute>
          }
        >
          <Route index element={<BookingPage />} />
        </Route>

        <Route
          path="/customer/dashboard"
          element={
            <CustomerProtectedRoute>
              <CustomerLayout />
            </CustomerProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
