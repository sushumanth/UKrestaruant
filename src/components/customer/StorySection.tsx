import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookingCard } from './BookingCard';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface StorySectionProps {
  id: string;
  image: string;
  eyebrow: string;
  headline: string;
  body: string;
  linkText: string;
  linkHref: string;
  zIndex: number;
}

export const StorySection = ({
  id,
  image,
  eyebrow,
  headline,
  body,
  linkText,
  linkHref,
  zIndex,
}: StorySectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const text = textRef.current;
    const card = cardRef.current;

    if (!section || !bg || !text || !card) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      scrollTl
        .fromTo(bg,
          { scale: 1.10, y: '8vh', opacity: 0.7 },
          { scale: 1.00, y: 0, opacity: 1, ease: 'none' },
          0
        )
        .fromTo(text,
          { x: '-50vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out' },
          0
        )
        .fromTo(card,
          { x: '18vw', opacity: 0 },
          { x: 0, opacity: 1, ease: 'power2.out' },
          0
        );

      // SETTLE (30-70%): Hold positions

      // EXIT (70-100%)
      scrollTl
        .fromTo(text,
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
      id={id}
      className="relative w-full h-screen overflow-hidden"
      style={{ zIndex }}
    >
      {/* Background Image */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full">
        <img
          src={image}
          alt={headline}
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
            <div ref={textRef} className="max-w-xl">
              <span className="eyebrow block mb-4">{eyebrow}</span>
              <h2 className="font-serif text-[clamp(34px,4.2vw,64px)] uppercase text-[#F4F6FA] leading-[0.95] mb-6">
                {headline}
              </h2>
              <div className="w-24 h-px bg-[#D4A23A]/30 mb-6" />
              <p className="text-lg text-[#A9B1BE] mb-8 leading-relaxed">
                {body}
              </p>
              <Link
                to={linkHref}
                className="inline-flex items-center gap-2 text-[#D4A23A] hover:text-[#E5B34A] transition-colors group"
              >
                {linkText}
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
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
