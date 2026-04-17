import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookingCard } from './BookingCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    const card = cardRef.current;

    if (!section || !bg || !content || !card) return;

    const ctx = gsap.context(() => {
      // Initial load animation
      const loadTl = gsap.timeline();
      
      loadTl
        .fromTo(bg, 
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }
        )
        .fromTo(content.querySelectorAll('.animate-item'),
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          '-=0.6'
        )
        .fromTo(card,
          { x: '18vw', opacity: 0, scale: 0.98 },
          { x: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' },
          '-=0.7'
        );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset elements when scrolling back to top
            gsap.set(content.querySelectorAll('.animate-item'), { x: 0, opacity: 1 });
            gsap.set(card, { x: 0, opacity: 1 });
            gsap.set(bg, { scale: 1, y: 0 });
          }
        }
      });

      // ENTRANCE (0-30%): Hold visible state (already animated by load)
      // SETTLE (30-70%): Static
      // EXIT (70-100%): Elements exit
      scrollTl
        .fromTo(content,
          { x: 0, opacity: 1 },
          { x: '-18vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(card,
          { x: 0, opacity: 1 },
          { x: '18vw', opacity: 0, ease: 'power2.in' },
          0.7
        )
        .fromTo(bg,
          { scale: 1, y: 0 },
          { scale: 1.06, y: '-6vh', ease: 'none' },
          0.7
        );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden z-10"
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0 }}
      >
        <img
          src="/hero_street.jpg"
          alt="Restaurant exterior at night"
          className="w-full h-full object-cover"
        />
        {/* Vignette overlay */}
        <div className="absolute inset-0 vignette" />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C0F]/80 via-[#0B0C0F]/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div ref={contentRef} className="max-w-xl">
              <span className="animate-item eyebrow block mb-4">
                Premium Table Booking
              </span>
              <h1 className="animate-item font-serif text-[clamp(44px,6vw,84px)] uppercase text-[#F4F6FA] leading-[0.92] mb-6">
                Reserve the moment.
              </h1>
              <div className="animate-item w-24 h-px bg-[#D4A23A]/30 mb-6" />
              <p className="animate-item text-lg text-[#A9B1BE] mb-8 leading-relaxed">
                A curated evening begins with one click. Experience fine dining 
                at its finest in the heart of Manchester.
              </p>
              <div className="animate-item flex flex-wrap gap-4">
                <Link to="/book" className="btn-gold flex items-center gap-2">
                  Book a Table
                  <ArrowRight size={18} />
                </Link>
                <Link to="/" className="btn-ghost">
                  View Menu
                </Link>
              </div>
            </div>

            {/* Right: Booking Card */}
            <div ref={cardRef} className="flex justify-end">
              <BookingCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
