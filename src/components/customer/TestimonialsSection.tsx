import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "The easiest reservation I've ever made—and the table was perfect.",
    name: 'Alex M.',
    location: 'London',
    avatar: 'AM',
  },
  {
    quote: "Feels like a private concierge every time we book.",
    name: 'Priya S.',
    location: 'Manchester',
    avatar: 'PS',
  },
  {
    quote: "We run a tighter floor with fewer no-shows.",
    name: 'Jordan T.',
    location: 'General Manager',
    avatar: 'JT',
  },
];

export const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = cardsRef.current;

    if (!section || !heading || !cards) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(heading,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      // Cards stagger animation
      const cardElements = cards.querySelectorAll('.testimonial-card');
      gsap.fromTo(cardElements,
        { y: 60, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
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
      className="relative py-24 bg-[#14171C]"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <span className="eyebrow block mb-4">Testimonials</span>
          <h2 className="font-serif text-[clamp(34px,4.2vw,64px)] uppercase text-[#F4F6FA] leading-[0.95]">
            What guests say
          </h2>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="testimonial-card bg-[rgba(255,255,255,0.03)] border border-[rgba(244,246,250,0.08)] rounded-[14px] p-8"
            >
              <Quote size={32} className="text-[#D4A23A] mb-6" />
              <p className="text-[#F4F6FA] text-lg leading-relaxed mb-8">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4A23A]/20 flex items-center justify-center">
                  <span className="font-mono text-sm text-[#D4A23A]">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-[#F4F6FA] font-medium">{testimonial.name}</p>
                  <p className="text-[#A9B1BE] text-sm">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
