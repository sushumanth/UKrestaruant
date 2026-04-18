import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  const privateDiningHref = isHomePage ? '#popular-tables' : '/#popular-tables';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-white shadow-sm border-b border-amber-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-amber-700">
              LUXE
            </span>
            <span className="font-serif text-xl text-amber-900">RESERVE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/menu"
              className="text-sm text-amber-700/70 hover:text-amber-900 transition-colors"
            >
              Menu
            </Link>
            <a
              href={privateDiningHref}
              className="text-sm text-amber-700/70 hover:text-amber-900 transition-colors"
            >
              Private Dining
            </a>
            <Link
              to="/book"
              className="text-sm text-amber-700/70 hover:text-amber-900 transition-colors"
            >
              Reservations
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/book"
              className="bg-amber-700 hover:bg-amber-800 text-white text-sm py-2.5 px-5 rounded-lg transition-colors"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-amber-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden backdrop-blur-md border-t border-[rgba(255,255,255,0.08)] bg-[rgba(8,11,17,0.96)]">
          <div className="px-6 py-6 space-y-4">
            <Link
              to="/menu"
              className="block text-[#C4CDDB] hover:text-[#FFFFFF] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <a
              href={privateDiningHref}
              className="block text-[#C4CDDB] hover:text-[#FFFFFF] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Private Dining
            </a>
            <Link
              to="/book"
              className="block text-[#C4CDDB] hover:text-[#FFFFFF] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reservations
            </Link>
            <Link
              to="/book"
              className="btn-gold btn-gold-glow text-center block mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
