import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { BookingCard } from './BookingCard';

gsap.registerPlugin(ScrollTrigger);

export const ContactSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const contact = contactRef.current;
    const card = cardRef.current;
    const footer = footerRef.current;

    if (!section || !contact || !card || !footer) return;

    const ctx = gsap.context(() => {
      // Contact block animation
      gsap.fromTo(contact,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contact,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Card animation
      gsap.fromTo(card,
        { y: 60, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Footer animation
      gsap.fromTo(footer,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-[#0B0C0F]"
      style={{
        backgroundImage: 'url(/hero_street.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0B0C0F]/92" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Contact Info */}
          <div ref={contactRef}>
            <span className="eyebrow block mb-4">Get in Touch</span>
            <h2 className="font-serif text-[clamp(34px,4.2vw,64px)] uppercase text-[#F4F6FA] leading-[0.95] mb-8">
              Visit us
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin size={22} className="text-[#D4A23A] mt-1" />
                <div>
                  <p className="text-[#F4F6FA] font-medium mb-1">Address</p>
                  <p className="text-[#A9B1BE]">
                    12 Royal Exchange<br />
                    Manchester M2 7EA
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock size={22} className="text-[#D4A23A] mt-1" />
                <div>
                  <p className="text-[#F4F6FA] font-medium mb-1">Hours</p>
                  <p className="text-[#A9B1BE]">
                    Tuesday – Saturday: 17:00 – 23:00<br />
                    Sunday – Monday: Closed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone size={22} className="text-[#D4A23A] mt-1" />
                <div>
                  <p className="text-[#F4F6FA] font-medium mb-1">Phone</p>
                  <p className="text-[#A9B1BE]">+44 (0)161 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail size={22} className="text-[#D4A23A] mt-1" />
                <div>
                  <p className="text-[#F4F6FA] font-medium mb-1">Email</p>
                  <p className="text-[#A9B1BE]">hello@luxereserve.co</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Mini Booking Card */}
          <div ref={cardRef} className="lg:sticky lg:top-24">
            <BookingCard compact />
          </div>
        </div>

        {/* Footer */}
        <div
          ref={footerRef}
          className="mt-24 pt-8 border-t border-[rgba(244,246,250,0.08)] flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-[#A9B1BE] text-sm">
            © {new Date().getFullYear()} LuxeReserve. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#A9B1BE] text-sm hover:text-[#F4F6FA] transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[#A9B1BE] text-sm hover:text-[#F4F6FA] transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
