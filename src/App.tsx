import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore, useMockDataStore } from '@/store';
import { generateTables, generateBookings, mockUsers, mockSettings, generateReports } from '@/lib/mockData';
import { useTableStore, useBookingStore, useSettingsStore, useAnalyticsStore } from '@/store';

// Layouts
import { CustomerLayout } from '@/layouts/CustomerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { EmployeeLayout } from '@/layouts/EmployeeLayout';

// Pages
import { HomePage } from '@/pages/customer/HomePage';
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

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isMockMode } = useMockDataStore();
  const { setTables } = useTableStore();
  const { setBookings } = useBookingStore();
  const { setSettings } = useSettingsStore();
  const { setReports } = useAnalyticsStore();
  const { login } = useAuthStore();

  // Initialize mock data
  useEffect(() => {
    if (isMockMode && !isInitialized) {
      // Set mock tables
      const tables = generateTables();
      setTables(tables);
      
      // Set mock bookings
      const bookings = generateBookings();
      setBookings(bookings);
      
      // Set mock settings
      setSettings(mockSettings);
      
      // Set mock reports
      const reports = generateReports();
      setReports(reports);
      
      // Auto-login as admin for demo
      login(mockUsers[0]);
      
      setIsInitialized(true);
    }
  }, [isMockMode, isInitialized, setTables, setBookings, setSettings, setReports, login]);

  // Refresh ScrollTrigger on route change
  useEffect(() => {
    ScrollTrigger.refresh();
  }, []);

  if (!isInitialized && isMockMode) {
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
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
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
