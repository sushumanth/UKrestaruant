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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-[#0B0C0F]/90 backdrop-blur-md border-b border-[rgba(244,246,250,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#A9B1BE]">
              LUXE
            </span>
            <span className="font-serif text-xl text-[#F4F6FA]">RESERVE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
            >
              Menu
            </Link>
            <Link
              to="/"
              className="text-sm text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
            >
              Private Dining
            </Link>
            <Link
              to="/book"
              className="text-sm text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
            >
              Reservations
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              to="/book"
              className="btn-gold-outline text-sm py-2.5 px-5"
            >
              Book a Table
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#F4F6FA]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B0C0F]/95 backdrop-blur-md border-t border-[rgba(244,246,250,0.08)]">
          <div className="px-6 py-6 space-y-4">
            <Link
              to="/"
              className="block text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/"
              className="block text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Private Dining
            </Link>
            <Link
              to="/book"
              className="block text-[#A9B1BE] hover:text-[#F4F6FA] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Reservations
            </Link>
            <Link
              to="/book"
              className="btn-gold text-center block mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Book a Table
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
