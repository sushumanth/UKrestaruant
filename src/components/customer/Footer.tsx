import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0B0C0F] border-t border-[rgba(244,246,250,0.08)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#A9B1BE]">
                LUXE
              </span>
              <span className="font-serif text-xl text-[#F4F6FA]">RESERVE</span>
            </Link>
            <p className="text-[#A9B1BE] text-sm leading-relaxed">
              A curated dining experience in the heart of Manchester. 
              Reserve your table and savor the night.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg text-[#F4F6FA] mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4A23A] mt-0.5" />
                <span className="text-[#A9B1BE] text-sm">
                  12 Royal Exchange<br />
                  Manchester M2 7EA
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4A23A]" />
                <span className="text-[#A9B1BE] text-sm">+44 (0)161 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4A23A]" />
                <span className="text-[#A9B1BE] text-sm">hello@luxereserve.co</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-serif text-lg text-[#F4F6FA] mb-6">Hours</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-[#D4A23A] mt-0.5" />
                <div className="text-[#A9B1BE] text-sm">
                  <p>Tuesday – Saturday</p>
                  <p className="text-[#F4F6FA]">17:00 – 23:00</p>
                </div>
              </li>
              <li className="text-[#A9B1BE] text-sm">
                <p>Sunday – Monday</p>
                <p className="text-[#F4F6FA]">Closed</p>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-[#F4F6FA] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/book" className="text-[#A9B1BE] text-sm hover:text-[#D4A23A] transition-colors">
                  Book a Table
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A9B1BE] text-sm hover:text-[#D4A23A] transition-colors">
                  View Menu
                </Link>
              </li>
              <li>
                <Link to="/" className="text-[#A9B1BE] text-sm hover:text-[#D4A23A] transition-colors">
                  Private Dining
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#A9B1BE] text-sm hover:text-[#D4A23A] transition-colors">
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[rgba(244,246,250,0.08)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#A9B1BE] text-sm">
            © {new Date().getFullYear()} LuxeReserve. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[#A9B1BE] text-sm hover:text-[#F4F6FA] transition-colors">
              Privacy
            </Link>
            <Link to="/" className="text-[#A9B1BE] text-sm hover:text-[#F4F6FA] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
