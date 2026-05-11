import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="pastel-footer-surface relative">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A23A]/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* ===== BRAND ===== */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4 group">
              <div className="relative flex items-center">
                <img
                  src="/logo1.png"
                  alt="Singh's Dining logo"
                  className="absolute -left-7 sm:-left-8 top-1/2 h-14 w-14 sm:h-16 sm:w-16 -translate-y-1/2 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-[1.02]"
                  loading="eager"
                  draggable={false}
                />
                <div className="relative z-10 pl-6 sm:pl-7 leading-none">
                  <div className="flex items-end gap-1.5 sm:gap-2">
                    <span className="font-serif text-[20px] sm:text-[22px] tracking-wide text-[#F4F6FA]">Singh&apos;s</span>
                    <span className="inline-block h-3.5 w-px sm:h-4 sm:w-px bg-[#D4A23A]/70" />
                    <span className="pb-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-[#D4A23A]">Dining</span>
                  </div>
                  <span className="pt-1.5 sm:pt-2 block text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-[#AFB8C8]/90">
                    By Rangrez
                  </span>
                </div>
              </div>
            </Link>
            <p className="text-[#AFB8C8] text-sm leading-relaxed max-w-[280px]">
              A curated dining experience in the heart of Manchester. Reserve your table and savor the night.
            </p>
            
            {/* Social icons (optional visual filler) */}
            <div className="flex items-center gap-3 mt-4">
              {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full border border-[#AFB8C8]/20 flex items-center justify-center text-[#AFB8C8] hover:border-[#D4A23A] hover:text-[#D4A23A] transition-colors"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="text-[10px] font-medium">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ===== CONTACT ===== */}
          <div>
            <h4 className="font-serif text-base sm:text-lg text-[#F4F6FA] mb-3 sm:mb-4">Contact</h4>
            <ul className="space-y-2.5 sm:space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#D4A23A] mt-1 flex-shrink-0" aria-hidden="true" />
                <span className="text-[#AFB8C8] text-sm leading-snug">
                  12 Royal Exchange<br />
                  Manchester M2 7EA
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#D4A23A] flex-shrink-0" aria-hidden="true" />
                <a href="tel:+441611234567" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  +44 (0)161 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#D4A23A] flex-shrink-0" aria-hidden="true" />
                <a href="mailto:hello@luxereserve.co" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  hello@luxereserve.co
                </a>
              </li>
            </ul>
          </div>

          {/* ===== HOURS ===== */}
          <div>
            <h4 className="flex items-start gap-2.5 font-serif text-base sm:text-lg text-[#F4F6FA] mb-3 sm:mb-4">
              <Clock size={16} className="text-[#D4A23A] mt-1.5 flex-shrink-0" aria-hidden="true" />Hours
            </h4>
            <ul className="space-y-2.5 sm:space-y-3">
              <li className="text-[#AFB8C8] text-sm">
                  <p>Tue – Sat</p>
                  <p className="text-[#F4F6FA] font-medium">17:00 – 23:00</p>
              </li>
              <li className="text-[#AFB8C8] text-sm">
                <p>Sun – Mon</p>
                <p className="text-[#6B7280]">Closed</p>
              </li>
            </ul>
          </div>

          {/* ===== QUICK LINKS ===== */}
          <div>
            <h4 className="font-serif text-lg text-[#F4F6FA] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/booking" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  View Menu
                </Link>
              </li>
              <li>
                <Link to="/#popular-tables" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  Private Dining
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#AFB8C8] text-sm hover:text-[#D4A23A] transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-[rgba(244,246,250,0.08)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p className="text-[#AFB8C8]/90">
              © {new Date().getFullYear()} Singh&apos;s Dining. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/" className="text-[#AFB8C8] hover:text-[#F4F6FA] transition-colors">
                Privacy
              </Link>
              <Link to="/" className="text-[#AFB8C8] hover:text-[#F4F6FA] transition-colors">
                Terms
              </Link>
              <Link to="/" className="text-[#AFB8C8] hover:text-[#F4F6FA] transition-colors hidden sm:inline">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};