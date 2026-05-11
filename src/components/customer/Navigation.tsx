import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuCartStore } from '@/store';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const cartItems = useMenuCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isHomePage = location.pathname === '/';
  const aboutHref = isHomePage ? '#about-us' : '/#about-us';
  const galleryHref = isHomePage ? '#gallery' : '/#gallery';
  const contactHref = isHomePage ? '#contact' : '/#contact';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // At total top of homepage, keep header hidden
      if (isHomePage && currentScrollY <= 10) {
        setIsHeaderVisible(false);
        setLastScrollY(currentScrollY);
        return;
      }

      // If menu is open, keep header visible
      if (isMobileMenuOpen) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Scrolling up = show header
      if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }

      // Scrolling down = hide header
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHeaderVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isHomePage, isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);

    if (isHomePage && window.scrollY <= 10) {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  }, [location.pathname, isHomePage]);
  
  const handleHomeClick = () => {
    if (isHomePage) {
      // If already on home page, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -110 }}
      animate={{ y: isHeaderVisible || isMobileMenuOpen ? 0 : -110 }}
      transition={{ duration: 0.32, ease: 'easeInOut'}}
      className="fixed select-none top-0 left-0 right-0 z-50 duration-300 border-b bg-[linear-gradient(90deg,rgba(74,9,7,0.96),rgba(52,8,6,0.96))] border-[#8d5a25]/45 shadow-[0_10px_30px_rgba(0,0,0,0.35)] py-2">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 transition-all duration-300">
          {/* Logo */}
          <Link to="/" onClick={handleHomeClick} className="group inline-flex items-center">
            <div className="relative flex items-center">
              <img
                src="/logo1.png"
                alt="Singh's Dining lion logo"
                className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                loading="eager"
                draggable={false}
              />
              <div className="relative z-10 pl-7 leading-none">
                <div className="flex items-end gap-2">
                  <span className="font-serif text-[22px] tracking-wide text-[#F4F6FA]">Singh&apos;s</span>
                  <span className="inline-block h-4 w-px bg-[#D4A23A]/70" />
                  <span className="pb-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#D4A23A]">Dining</span>
                </div>
                <span className="pt-2 block text-[10px] uppercase tracking-[0.28em] text-[#AFB8C8]">
                  By Rangrez
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-7">
            <Link
              to="/"
              onClick={handleHomeClick}
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Home
            </Link>
            <a
              href={aboutHref}
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              About Us
            </a>
            <a
              href={galleryHref}
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Gallery
            </a>
            <a
              href={contactHref}
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Contact
            </a>
            <Link
              to="/menu"
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Menu
            </Link> 
          </div>

          {/* Desktop actions */}
          <div className="hidden xl:flex items-center gap-3">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf] hover:bg-white/5"
            >
              <ShoppingBag size={20} />
              Cart
              {cartItemCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-amber-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type='button'
            className="md:hidden p-2 transition-colors text-[#f5deb4]"
            onClick={() => {
              setIsHeaderVisible(true); 
              setIsMobileMenuOpen((prev) => !prev);
            }}
            aria-label='Toggle mobile menu'
          >
            {isMobileMenuOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="xl:hidden overflow-hidden border-t bg-[linear-gradient(160deg,rgba(66,10,7,0.98),rgba(41,8,6,0.98))] border-[#8d5a25]/45"
          >
            <div className="px-6 py-8 flex flex-col space-y-5 shadow-2xl">
              <Link
                to="/"
                className="text-lg font-semibold text-[#f4dfb6] transition-colors hover:text-[#ffe9bf]"
                onClick={handleHomeClick}
              >
                Home
              </Link>
              <a
                href={aboutHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                About Us
              </a>
              <a
                href={galleryHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Gallery
              </a>
              <a
                href={contactHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Contact
              </a>
              <Link
                to="/menu"
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={closeMobileMenu}
              >
                Menu
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
