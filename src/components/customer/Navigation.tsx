import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  const isLightMode = isScrolled || !isHomePage;
  const privateDiningHref = isHomePage ? '#popular-tables' : '/#popular-tables';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isLightMode
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-amber-100/50 py-1'
          : 'bg-transparent border-transparent py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 transition-all duration-500">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 group">
            <span className={`font-mono text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 ${
              isLightMode ? 'text-amber-600' : 'text-[#D4AF37]'
            }`}>
              LUXE
            </span>
            <span className={`font-serif text-[22px] tracking-wide transition-colors duration-300 ${
              isLightMode ? 'text-amber-950' : 'text-white'
            }`}>
              RESERVE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/menu"
              className={`text-sm font-medium transition-colors hover:opacity-100 ${
                isLightMode ? 'text-amber-950/70 hover:text-amber-950' : 'text-white/80 hover:text-white'
              }`}
            >
              Menu
            </Link>
            <a
              href={privateDiningHref}
              className={`text-sm font-medium transition-colors hover:opacity-100 ${
                isLightMode ? 'text-amber-950/70 hover:text-amber-950' : 'text-white/80 hover:text-white'
              }`}
            >
              Private Dining
            </a>
            <Link
              to="/book"
              className={`text-sm font-medium transition-colors hover:opacity-100 ${
                isLightMode ? 'text-amber-950/70 hover:text-amber-950' : 'text-white/80 hover:text-white'
              }`}
            >
              Reservations
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/book"
              className={`relative overflow-hidden inline-flex items-center justify-center px-6 py-2 text-[14px] font-medium rounded-full transition-all duration-300 ${
                isLightMode 
                  ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-0.5' 
                  : 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white flex hover:text-amber-950'
              }`}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 transition-colors ${
              isLightMode ? 'text-amber-950' : 'text-white'
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
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-amber-100"
          >
            <div className="px-6 py-8 flex flex-col space-y-5 shadow-2xl">
              <Link
                to="/menu"
                className="text-lg text-amber-950 font-medium hover:text-amber-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <a
                href={privateDiningHref}
                className="text-lg text-amber-950 font-medium hover:text-amber-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Private Dining
              </a>
              <Link
                to="/book"
                className="text-lg text-amber-950 font-medium hover:text-amber-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reservations
              </Link>
              <Link
                to="/book"
                className="mt-6 flex justify-center items-center py-3.5 bg-gradient-to-r from-amber-700 to-amber-900 text-white text-lg font-medium rounded-xl hover:shadow-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
