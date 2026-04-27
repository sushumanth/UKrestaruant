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
  top: string;
  left: string;
};

const journeySteps: JourneyStep[] = [
  {
    title: 'Market-Fresh Sourcing',
    description: 'Premium produce and handpicked spices arrive fresh each morning.',
    image: '/Market-Fresh.png',
    top: '42%',
    left: '14%',
  },
  {
    title: 'Kitchen Craftsmanship',
    description: 'Our chefs slow-cook gravies and roast masalas with precision.',
    image: '/KitchenCraftsmanship.png',
    top: '16%',
    left: '33%',
  },
  {
    title: 'Signature Plating',
    description: 'Every dish is plated with modern elegance and royal warmth.',
    image: '/SignaturePlating.png',
    top: '38%',
    left: '56%',
  },
  {
    title: 'Luxury Dining Room',
    description: 'A refined ambience curated for memorable evenings in London.',
    image: '/lucry-dinning.png',
    top: '12%',
    left: '78%',
  },
];

export const AboutJourneySection = () => {
  const prefersReducedMotion = useReducedMotion();
  const desktopSceneRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const carriageRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      if (!desktopSceneRef.current || !pathRef.current || !carriageRef.current) {
        return;
      }

      const stepCards = stepRefs.current.filter((step): step is HTMLDivElement => Boolean(step));
      if (!stepCards.length) {
        return;
      }

      gsap.set(stepCards, { autoAlpha: 0, y: 28, scale: 0.96 });
      gsap.set(stepCards[0], { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(carriageRef.current, { autoAlpha: 1, xPercent: -50, yPercent: -50, transformOrigin: '50% 50%' });

      const scrollTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: desktopSceneRef.current,
          start: 'top top',
          end: '+=2400',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTimeline.to(
        carriageRef.current,
        {
          duration: 1,
          motionPath: {
            path: pathRef.current,
            align: pathRef.current,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
            start: 0,
            end: 1,
          },
        },
        0,
      );

      stepCards.forEach((stepCard, index) => {
        if (index === 0) {
          return;
        }

        const progress = index / Math.max(stepCards.length - 1, 1);
        const revealAt = Math.max(progress - 0.06, 0);

        scrollTimeline.to(
          stepCard,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.12,
            ease: 'power2.out',
          },
          revealAt,
        );
      });

      return () => {
        scrollTimeline.scrollTrigger?.kill();
        scrollTimeline.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <section className="relative mt-2 overflow-hidden bg-[linear-gradient(150deg,#f5ecd9_0%,#f0e2c2_45%,#f6efde_100%)]">
      <div className="mx-auto max-w-7xl px-6 pt-5 text-center sm:px-8 sm:pt-7 lg:px-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8d6435]">Our Culinary Journey</p>
        <h3 className="mt-3 font-serif text-[clamp(32px,4.2vw,60px)] leading-[0.92] text-[#2f1e0b]">
          Scroll Through The Story
        </h3>
        <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-relaxed text-[#6b4c2e] sm:text-[16px]">
          A cinematic walkthrough of how each plate travels from market freshness to your table.
        </p>
      </div>

      <div ref={desktopSceneRef} className="relative -mt-12 hidden min-h-[84vh] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,255,255,0.45),transparent_38%),radial-gradient(circle_at_86%_70%,rgba(180,126,54,0.16),transparent_33%)]" />

        <div className="absolute inset-0">
          <svg viewBox="0 0 1200 500" className="h-full w-full" aria-hidden="true">
            <path
              ref={pathRef}
              d="M120 270 C 250 190 330 110 430 118 C 560 128 578 286 715 272 C 860 258 910 126 1060 102"
              fill="none"
              stroke="rgba(153,111,52,0.72)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="2 12"
            />
          </svg>
        </div>

        <div ref={carriageRef} className="absolute left-[120px] top-[270px] z-30">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-[#cb9548]/35 blur-lg" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#c99753] bg-[linear-gradient(135deg,#2f1b10,#5b3518)] shadow-[0_8px_18px_rgba(40,20,8,0.35)]">
              <span className="inline-flex h-10 w-10 overflow-hidden rounded-full border border-[#d7aa62]/65 bg-[#1a0d06]">
                <img
                  src="/logosolo.png"
                  alt="Journey marker"
                  className="h-full w-full scale-[1.16] object-cover"
                  loading="lazy"
                  draggable={false}
                />
              </span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0">
          {journeySteps.map((step, index) => (
            <div
              key={step.title}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              className="absolute z-20 w-[280px] overflow-hidden rounded-2xl border border-[#c9a46a]/65 bg-[#fff8eb]/96 shadow-[0_18px_42px_rgba(70,44,16,0.18)] backdrop-blur-[2px]"
              style={{ top: step.top, left: step.left, transform: 'translate(-50%, -50%)' }}
            >
              <img src={step.image} alt={step.title} className="h-36 w-full object-cover" loading="lazy" draggable={false} />
              <div className="p-4">
                <h4 className="font-serif text-[28px] leading-[0.92] text-[#2f1d0a]">{step.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-[#6f5434]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-8 pt-5 sm:px-8 lg:hidden">
        <div className="relative mx-auto max-w-lg">
          <div className="absolute bottom-6 left-4 top-6 w-px bg-[linear-gradient(180deg,rgba(185,140,69,0.2),rgba(185,140,69,0.8),rgba(185,140,69,0.2))]" />

          <div className="space-y-5">
            {journeySteps.map((step, index) => (
              <motion.article
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="relative ml-8 overflow-hidden rounded-2xl border border-[#cfad76]/65 bg-[#fff8eb] shadow-[0_14px_34px_rgba(70,44,16,0.12)]"
              >
                <span className="absolute -left-8 top-6 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#ba8d4a] bg-[#f4e4c2]" />
                <img src={step.image} alt={step.title} className="h-40 w-full object-cover" loading="lazy" draggable={false} />
                <div className="p-4">
                  <h4 className="font-serif text-[30px] leading-[0.9] text-[#2f1d0a]">{step.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#6f5434]">{step.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
