import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FloorPlan } from '@/components/admin/FloorPlan';
import { useTableStore, useBookingStore } from '@/store';

gsap.registerPlugin(ScrollTrigger);

export const FloorPlanSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const { tables } = useTableStore();
  const { bookings } = useBookingStore();

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const floorPlan = floorPlanRef.current;

    if (!section || !heading || !floorPlan) return;

    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(heading,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          }
        }
      );

      // Floor plan card animation
      gsap.fromTo(floorPlan,
        { y: 80, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: floorPlan,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
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
        backgroundImage: 'url(/dining_room.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0B0C0F]/90" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div ref={headingRef} className="mb-12">
          <span className="eyebrow block mb-4">Admin Feature</span>
          <h2 className="font-serif text-[clamp(34px,4.2vw,64px)] uppercase text-[#F4F6FA] leading-[0.95] mb-6">
            Live floor plan
          </h2>
          <p className="text-lg text-[#A9B1BE] max-w-2xl leading-relaxed">
            See every table, status, and turn—updated in real time. 
            Drag to reassign. Click to block.
          </p>
        </div>

        {/* Floor Plan Card */}
        <div ref={floorPlanRef}>
          <div className="glass-card p-6">
            <FloorPlan 
              tables={tables.slice(0, 30)} 
              bookings={bookings}
              readOnly={true}
            />
            
            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <span className="text-[#A9B1BE] text-sm font-mono uppercase tracking-[0.1em]">
                Legend:
              </span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-[#A9B1BE]">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-sm text-[#A9B1BE]">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-[#A9B1BE]">Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-[#A9B1BE]">Seated</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-[rgba(244,246,250,0.08)] flex flex-wrap gap-8">
              <div>
                <span className="eyebrow block mb-1">Covers tonight</span>
                <span className="font-serif text-2xl text-[#F4F6FA]">86</span>
              </div>
              <div>
                <span className="eyebrow block mb-1">Turns remaining</span>
                <span className="font-serif text-2xl text-[#F4F6FA]">3</span>
              </div>
              <div>
                <span className="eyebrow block mb-1">Avg turn</span>
                <span className="font-serif text-2xl text-[#F4F6FA]">1h 50m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
