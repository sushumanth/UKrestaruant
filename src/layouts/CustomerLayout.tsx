import { Outlet } from 'react-router-dom';
import { Navigation } from '@/components/customer/Navigation';
import { Footer } from '@/components/customer/Footer';

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-[#F4F6FA]">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
