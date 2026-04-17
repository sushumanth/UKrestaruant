import { useEffect, useState } from 'react';
import { BookingCard } from './BookingCard';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

const heroImages = ['/chef_plating.jpg', '/dessert.jpg', '/cocktail.jpg', '/dining_room.jpg'];

export const HeroSection = () => {
  const [activeImage, setActiveImage] = useState(0);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((previous) => (previous + 1) % heroImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Drawer open={isMobileBookingOpen} onOpenChange={setIsMobileBookingOpen}>
      <section className="relative min-h-screen overflow-hidden pt-24 pb-24 lg:pt-28 z-10">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={heroImages[activeImage]}
              src={heroImages[activeImage]}
              alt="Luxury dining experience"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: 1.35, ease: 'easeOut' }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 animate-gradient-shift bg-[linear-gradient(108deg,rgba(6,9,14,0.78),rgba(8,11,17,0.58),rgba(6,9,14,0.72))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(212,175,55,0.12),transparent_42%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_44%,rgba(0,0,0,0.48)_100%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-[44rem]"
            >
              <span className="eyebrow block mb-3">Premium Manchester Dining</span>
              <h1 className="font-serif font-[500] text-[clamp(30px,4.6vw,56px)] leading-[1.01] tracking-[0.005em] text-[#F6F8FC] mb-5 max-w-[11ch] drop-shadow-[0_7px_22px_rgba(0,0,0,0.28)]">
                Reserve an Evening Worth Remembering
              </h1>
              <p className="text-[clamp(15px,1.6vw,19px)] text-[#D0D7E3] max-w-[31rem] leading-relaxed mb-7">
                Elegant dining starts with one seamless reservation. Book in seconds with instant confirmation.
              </p>

              <div className="flex flex-wrap gap-3.5 mb-7">
                <Link to="/book" className="btn-gold btn-gold-glow hidden sm:inline-flex items-center gap-2">
                  Book Now
                  <ArrowRight size={17} />
                </Link>
                <Link to="/menu" className="btn-ghost inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                  Explore Menu
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 text-sm text-[#E4E9F2]">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(6,8,12,0.5)] px-3 py-1.5 backdrop-blur">
                  <Star size={14} className="text-[#D4AF37]" />
                  4.8 rating | 1200+ happy diners
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.2)] bg-[rgba(6,8,12,0.5)] px-3 py-1.5 backdrop-blur">
                  <Sparkles size={14} className="text-[#D4AF37]" />
                  Instant table confirmation
                </span>
              </div>

              <div className="mt-7 lg:hidden">
                <DrawerTrigger asChild>
                  <button className="btn-gold btn-gold-glow w-full">Book Now</button>
                </DrawerTrigger>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
              className="hidden lg:flex justify-end"
            >
              <BookingCard />
            </motion.div>
          </div>
        </div>

      </section>

      <DrawerContent className="warm-ambient border-t border-[rgba(255,255,255,0.16)] bg-[rgba(11,15,24,0.92)] max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="text-left px-5 pb-3">
          <DrawerTitle className="font-serif text-3xl text-[#F4F6FA]">Book Your Table</DrawerTitle>
          <DrawerDescription className="text-[#A9B1BE]">
            Complete your reservation in a few taps.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <BookingCard compact />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
