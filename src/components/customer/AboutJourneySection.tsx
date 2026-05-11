import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

type JourneyStep = {
  title: string;
  description: string;
  image: string;
};

const journeySteps: JourneyStep[] = [
  {
    title: 'Market-Fresh Sourcing',
    description: 'Premium produce and handpicked spices arrive fresh each morning.',
    image: '/Market-Fresh.png',
  },
  {
    title: 'Kitchen Craftsmanship',
    description: 'Our chefs slow-cook gravies and roast masalas with precision.',
    image: '/KitchenCraftsmanship.png',
  },
  {
    title: 'Signature Plating',
    description: 'Every dish is plated with modern elegance and royal warmth.',
    image: '/SignaturePlating.png',
  },
  {
    title: 'Luxury Dining Room',
    description: 'A refined ambience curated for memorable evenings in London.',
    image: '/lucry-dinning.png',
  },
];

export const AboutJourneySection = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carriageRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Desktop Animation (1024px +)
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 1,
          },
        });

        // 1. Animate the carriage along the path
        tl.to(carriageRef.current, {
          motionPath: {
            path: pathRef.current!,
            align: pathRef.current!,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          ease: "none",
        }, 0);

        // 2. Animate cards appearing as the carriage passes
        const cards = gsap.utils.toArray<HTMLElement>(".journey-card");
        cards.forEach((card, i) => {
          tl.fromTo(card, 
            { autoAlpha: 0, y: 50, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.2 },
            (i / cards.length) * 0.8 // Stagger reveal based on path progress
          );
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section 
      ref={containerRef}
      className="relative overflow-hidden bg-[#f5ecd9] py-16 lg:py-0"
    >
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(185,140,69,0.15),transparent_70%)]" />

      {/* Header Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:pt-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8d6435]">Our Culinary Journey</p>
        <h3 className="mt-3 font-serif text-[clamp(32px,5vw,60px)] leading-none text-[#2f1e0b]">
          Scroll Through The Story
        </h3>
      </div>

      {/* DESKTOP VIEW: Path & Carriage (Visible on lg+) */}
      <div className="relative mx-auto hidden h-[80vh] max-w-7xl lg:block">
        <svg 
          viewBox="0 0 1200 500" 
          className="absolute inset-0 h-full w-full opacity-30"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            ref={pathRef}
            d="M100 350 C 250 350 300 150 450 150 C 600 150 650 350 800 350 C 950 350 1000 150 1100 150"
            fill="none"
            stroke="#8d6435"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Moving Marker */}
        <div ref={carriageRef} className="absolute left-0 top-0 z-30">
           <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#c99753] bg-[#2f1b10] shadow-xl">
              <img src="/logosolo.png" alt="marker" className="no-select h-8 w-8 rounded-full object-cover" />
           </div>
        </div>

        {/* Floating Cards - Positioned via Grid/Flex instead of hardcoded Top/Left */}
        <div className="relative flex h-full items-center justify-around px-10">
          {journeySteps.map((step, i) => (
            <div 
              key={i} 
              className="journey-card invisible flex w-64 flex-col rounded-2xl border border-[#c9a46a]/40 bg-white/80 p-4 shadow-xl backdrop-blur-md"
              style={{ marginTop: i % 2 === 0 ? '160px' : '-160px' }} // Zig-zag pattern
            >
              <img src={step.image} className="no-select h-32 w-full rounded-lg object-cover" alt={step.title} />
              <h4 className="mt-4 font-serif text-xl text-[#2f1e0b]">{step.title}</h4>
              <p className="mt-2 text-sm text-[#6f5434]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE/TABLET VIEW: Vertical Timeline (Visible below lg) */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 pt-12 lg:hidden">
        <div className="absolute left-10 top-12 bottom-12 w-px bg-dashed bg-[#8d6435]/30" 
             style={{ backgroundImage: 'linear-gradient(to bottom, #8d6435 50%, transparent 50%)', backgroundSize: '1px 15px' }} 
        />
        
        <div className="space-y-12">
          {journeySteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative flex items-start gap-8"
            >
              {/* Dot */}
              <div className="relative z-10 mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#c99753] bg-[#f5ecd9]">
                <div className="h-2 w-2 rounded-full bg-[#8d6435]" />
              </div>

              {/* Card */}
              <div className="overflow-hidden rounded-2xl border border-[#cfad76]/50 bg-white shadow-lg">
                <img src={step.image} className="no-select h-48 w-full object-cover" alt={step.title} />
                <div className="p-6">
                  <h4 className="font-serif text-2xl text-[#2f1d0a]">{step.title}</h4>
                  <p className="mt-2 text-[#6f5434]">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};