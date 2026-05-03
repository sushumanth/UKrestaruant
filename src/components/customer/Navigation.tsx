import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuCartStore } from '@/store';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems = useMenuCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const isHomePage = location.pathname === '/';
  const aboutHref = isHomePage ? '#about-us' : '/#about-us';
  const galleryHref = isHomePage ? '#gallery' : '/#gallery';
  const contactHref = isHomePage ? '#contact' : '/#contact';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b bg-[linear-gradient(90deg,rgba(74,9,7,0.96),rgba(52,8,6,0.96))] border-[#8d5a25]/45 shadow-[0_10px_30px_rgba(0,0,0,0.35)] py-2">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 transition-all duration-300">
          {/* Logo */}
          <Link to="/" className="group inline-flex items-center">
            <div className="relative flex items-center p-3">
              <img
                src="/logo1.png"
                alt="Singh's Dining lion logo"
                className="absolute -left-5 top-1/2 h-16 w-16 -translate-y-1/2 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
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
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              Menu
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
              to="/cart"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.05em] transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
            >
              <ShoppingBag size={15} />
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
            className="md:hidden p-2 transition-colors text-[#f5deb4]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            className="md:hidden overflow-hidden border-t bg-[linear-gradient(160deg,rgba(66,10,7,0.98),rgba(41,8,6,0.98))] border-[#8d5a25]/45"
          >
            <div className="px-6 py-8 flex flex-col space-y-5 shadow-2xl">
              <Link
                to="/"
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <a
                href={aboutHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a
                href={galleryHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </a>
              <a
                href={contactHref}
                className="text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-lg font-semibold transition-colors text-[#f4dfb6] hover:text-[#ffe9bf]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ShoppingBag size={18} />
                Cart
                {cartItemCount > 0 && (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-700 px-1.5 py-0.5 text-xs font-bold text-white">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/book"
                className="mt-6 flex justify-center items-center py-3.5 text-lg font-semibold rounded-xl transition-all bg-[#d7a44f] text-[#2f180b] hover:bg-[#e2b160]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book A Table
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
