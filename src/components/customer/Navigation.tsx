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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isHomePage
          ? 'bg-[linear-gradient(90deg,rgba(74,9,7,0.96),rgba(52,8,6,0.96))] border-[#8d5a25]/45 shadow-[0_10px_30px_rgba(0,0,0,0.35)] py-2'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-amber-100/60 py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 transition-all duration-300">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
              isHomePage ? 'text-[#d7a44f]' : 'text-amber-600'
            }`}>
              LUXE
            </span>
            <span className={`font-serif text-[22px] tracking-wide transition-colors duration-300 ${
              isHomePage ? 'text-[#f1d39a]' : 'text-amber-950'
            }`}>
              RESERVE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/menu"
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Order Online
            </Link>
            <Link
              to="/book"
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Book Table
            </Link>
            <a
              href={aboutHref}
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              About Us
            </a>
            <a
              href={galleryHref}
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Gallery
            </a>
            <a
              href={contactHref}
              className={`text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
            >
              Contact
            </a>
            <Link
              to="/cart"
              className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.05em] transition-colors ${
                isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950/75 hover:text-amber-950'
              }`}
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

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/book"
              className={`relative overflow-hidden inline-flex items-center justify-center rounded-lg px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-all duration-300 ${
                isHomePage
                  ? 'bg-[#d7a44f] text-[#2f180b] hover:bg-[#e2b160]'
                  : 'bg-gradient-to-r from-amber-700 to-amber-900 text-white hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-0.5'
              }`}
            >
              Book A Table
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors ${
              isHomePage ? 'text-[#f5deb4]' : 'text-amber-950'
            }`}
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
            className={`md:hidden overflow-hidden border-t ${
              isHomePage
                ? 'bg-[linear-gradient(160deg,rgba(66,10,7,0.98),rgba(41,8,6,0.98))] border-[#8d5a25]/45'
                : 'bg-white/95 backdrop-blur-xl border-amber-100'
            }`}
          >
            <div className="px-6 py-8 flex flex-col space-y-5 shadow-2xl">
              <Link
                to="/"
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/menu"
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/menu"
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Order Online
              </Link>
              <Link
                to="/book"
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Table
              </Link>
              <a
                href={aboutHref}
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </a>
              <a
                href={galleryHref}
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </a>
              <a
                href={contactHref}
                className={`text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Link
                to="/cart"
                className={`inline-flex items-center gap-2 text-lg font-semibold transition-colors ${
                  isHomePage ? 'text-[#f4dfb6] hover:text-[#ffe9bf]' : 'text-amber-950 hover:text-amber-700'
                }`}
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
                className={`mt-6 flex justify-center items-center py-3.5 text-lg font-semibold rounded-xl transition-all ${
                  isHomePage
                    ? 'bg-[#d7a44f] text-[#2f180b] hover:bg-[#e2b160]'
                    : 'bg-gradient-to-r from-amber-700 to-amber-900 text-white hover:shadow-lg'
                }`}
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
