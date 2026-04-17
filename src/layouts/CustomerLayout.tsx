import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from '@/components/customer/Navigation';
import { Footer } from '@/components/customer/Footer';

export const CustomerLayout = () => {
  const location = useLocation();
  const shouldHideFooter = ['/book', '/confirmation'].includes(location.pathname);

  return (
    <div className="min-h-screen pastel-luxe-bg text-[#F4F6FA]">
      <Navigation />
      <main>
        <Outlet />
      </main>
      {!shouldHideFooter && <Footer />}
    </div>
  );
};
