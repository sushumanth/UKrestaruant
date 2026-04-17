import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSection } from '@/components/customer/HeroSection';
import { StorySection } from '@/components/customer/StorySection';
import { FloorPlanSection } from '@/components/customer/FloorPlanSection';
import { TestimonialsSection } from '@/components/customer/TestimonialsSection';
import { ContactSection } from '@/components/customer/ContactSection';

gsap.registerPlugin(ScrollTrigger);

// Story sections data
const storySections = [
  {
    id: 'cuisine',
    image: '/chef_plating.jpg',
    eyebrow: 'Cuisine',
    headline: 'Curated menu',
    body: 'Seasonal ingredients, precise technique, and a menu that changes with what\'s best.',
    linkText: 'See today\'s menu',
    linkHref: '/',
    zIndex: 20,
  },
  {
    id: 'atmosphere',
    image: '/dining_room.jpg',
    eyebrow: 'Atmosphere',
    headline: 'Designed for the night',
    body: 'Low light, crisp linens, and a room that feels like the occasion matters.',
    linkText: 'Plan a private event',
    linkHref: '/',
    zIndex: 30,
  },
  {
    id: 'drinks',
    image: '/cocktail.jpg',
    eyebrow: 'Drinks',
    headline: 'Cocktails, curated',
    body: 'Classics done right, house signatures worth the first sip, and a wine list built to pair.',
    linkText: 'View the wine list',
    linkHref: '/',
    zIndex: 40,
  },
  {
    id: 'dessert',
    image: '/dessert.jpg',
    eyebrow: 'Dessert',
    headline: 'The finishing touch',
    body: 'Small sweets, big flavors, and a final course that earns the pause.',
    linkText: 'See dessert menu',
    linkHref: '/',
    zIndex: 50,
  },
  {
    id: 'team',
    image: '/kitchen_team.jpg',
    eyebrow: 'Team',
    headline: 'Crafted by people who care',
    body: 'From the first seat to the final plate, our team runs the room so you can relax in it.',
    linkText: 'Join the team',
    linkHref: '/',
    zIndex: 60,
  },
];

export const HomePage = () => {
  // Global snap configuration for pinned sections
  useEffect(() => {
    // Wait for all ScrollTriggers to be created
    const timer = setTimeout(() => {
      const pinned = ScrollTrigger.getAll()
        .filter((st: ScrollTrigger) => st.vars.pin)
        .sort((a: ScrollTrigger, b: ScrollTrigger) => a.start - b.start);
      
      const maxScroll = ScrollTrigger.maxScroll(window);
      
      if (!maxScroll || pinned.length === 0) return;

      // Build ranges and snap targets from actual pinned sections
      const pinnedRanges = pinned.map((st: ScrollTrigger) => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      // Create global snap
      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            // Check if within any pinned range (with buffer)
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            
            if (!inPinned) return value; // Flowing section: free scroll

            // Find nearest pinned center
            const target = pinnedRanges.reduce((closest: number, r: {center: number}) =>
              Math.abs(r.center - value) < Math.abs(closest - value) ? r.center : closest,
              pinnedRanges[0]?.center ?? 0
            );
            
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Story Sections */}
      {storySections.map((section) => (
        <StorySection key={section.id} {...section} />
      ))}
      
      {/* Floor Plan Section */}
      <FloorPlanSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Contact Section */}
      <ContactSection />
    </div>
  );
};
