import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCustomerAuthStore, useMenuCartStore } from '@/store';
import { signOutCustomer } from '@/customerApi';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const location = useLocation();
  const { customer, isCustomerAuthenticated, logoutCustomer } = useCustomerAuthStore();
  const cartItems = useMenuCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isHomePage = location.pathname === '/';
  const galleryHref = isHomePage ? '#gallery' : '/#gallery';
  const contactHref = isHomePage ? '#contact' : '/#contact';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }

    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setIsHeaderVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      setIsHeaderVisible(currentScrollY < lastScrollYRef.current);
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  const handleHomeClick = () => {
    closeMobileMenu();
    setIsHeaderVisible(true);
  };

  const handleCustomerSignOut = async () => {
    await signOutCustomer();
    logoutCustomer();
    closeMobileMenu();
  };

  return (
    <motion.nav
      initial={{ y: -110 }}
      animate={{ y: isHeaderVisible || isMobileMenuOpen ? 0 : -110 }}
      transition={{ duration: 0.32, ease: 'easeInOut' }}
      className="fixed left-0 right-0 top-0 z-50 select-none border-b border-[#8d5a25]/35 bg-[linear-gradient(90deg,rgba(60,8,7,0.96),rgba(44,8,6,0.96))] py-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" onClick={handleHomeClick} className="group inline-flex items-center gap-3">
            <img
              src="/logo1.png"
              alt="Singh's Dining logo"
              className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:h-14 sm:w-14"
              loading="eager"
              draggable={false}
            />
            <div className="leading-none">
              <span className="block font-serif text-[18px] tracking-wide text-[#F4F6FA] sm:text-[21px]">
                Singh&apos;s Dining
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.32em] text-[#D4A23A]/85">
                LuxeReserve
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 xl:flex">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
            >
              Home
            </Link>
            <a
              href={isHomePage ? '#about-us' : '/#about-us'}
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
            >
              About Us
            </a>
            <Link
              to="/menu"
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
            >
              Menu
            </Link>
            <a
              href={galleryHref}
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
            >
              Gallery
            </a>
            <a
              href={contactHref}
              className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
            >
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] text-[#f4dfb6] transition-colors hover:bg-white/5 hover:text-[#ffe9bf]"
            >
              <ShoppingBag size={20} />
              Cart
              {cartItemCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isCustomerAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="rounded-lg p-2 text-[#f4dfb6] transition-colors hover:bg-[#8d5a25]/20 hover:text-[#ffe9bf]"
                >
                  <User size={20} strokeWidth={1.5} />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-[#8d5a25]/45 bg-[linear-gradient(135deg,rgba(66,10,7,0.98),rgba(41,8,6,0.98))] shadow-2xl"
                    >
                      <Link
                        to="/customer/dashboard"
                        className="block w-full border-b border-[#8d5a25]/30 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.05em] text-[#f4dfb6] transition-colors hover:bg-[#8d5a25]/30 hover:text-[#ffe9bf]"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleCustomerSignOut}
                        className="block w-full px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.05em] text-[#f4dfb6] transition-colors hover:bg-[#8d5a25]/30 hover:text-[#ffe9bf]"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="p-2 text-[#f5deb4] transition-colors md:hidden"
            onClick={() => {
              setIsHeaderVisible(true);
              setIsMobileMenuOpen((prev) => !prev);
            }}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#8d5a25]/45 bg-[linear-gradient(160deg,rgba(66,10,7,0.98),rgba(41,8,6,0.98))] xl:hidden"
          >
            <div className="flex flex-col space-y-5 px-6 py-8 shadow-2xl">
              <Link
                to="/"
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={handleHomeClick}
              >
                Home
              </Link>
              <a
                href={isHomePage ? '#about-us' : '/#about-us'}
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                About Us
              </a>
              <Link
                to="/menu"
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>
              <a
                href={galleryHref}
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Gallery
              </a>
              <a
                href={contactHref}
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Contact
              </a>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                <ShoppingBag size={18} />
                Cart
                {cartItemCount > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-700 px-1.5 py-0.5 text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              {isCustomerAuthenticated ? (
                <>
                  <Link
                    to="/customer/dashboard"
                    className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                    onClick={closeMobileMenu}
                  >
                    {customer ? `${customer.firstName} Dashboard` : 'My Bookings'}
                  </Link>
                  <button
                    type="button"
                    className="text-left text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                    onClick={handleCustomerSignOut}
                  >
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
