import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

type SignatureDish = {
  name: string;
  description: string;
  image: string;
};

const signatureDishes: SignatureDish[] = [
  {
    name: 'Butter Chicken',
    description: 'Tender chicken simmered in rich, creamy tomato sauce.',
    image: '/chef_plating.jpg',
  },
  {
    name: 'Lamb Biryani',
    description: 'Fragrant basmati rice cooked with lamb, herbs and spices.',
    image: '/dessert.jpg',
  },
  {
    name: 'Lamb Rogan Josh',
    description: 'Slow cooked lamb in aromatic Kashmiri spices.',
    image: '/kitchen_team.jpg',
  },
  {
    name: 'Paneer Tikka',
    description: 'Char-grilled paneer cubes with smoky spice marinade.',
    image: '/dining_room.jpg',
  },
];

export const PremiumThemeSection = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1);
        return;
      }

      if (window.innerWidth < 1120) {
        setItemsPerView(2);
        return;
      }

      setItemsPerView(3);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const visibleDishes = useMemo(
    () =>
      Array.from({ length: itemsPerView }, (_, offset) => {
        const dishIndex = (startIndex + offset) % signatureDishes.length;
        return signatureDishes[dishIndex];
      }),
    [itemsPerView, startIndex],
  );

  const showPrevious = () => {
    setStartIndex((current) => (current - 1 + signatureDishes.length) % signatureDishes.length);
  };

  const showNext = () => {
    setStartIndex((current) => (current + 1) % signatureDishes.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden py-14 sm:py-16"
      style={{
        backgroundImage: "url('/backgroundtheme.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,231,0.58)_0%,rgba(255,248,231,0.64)_52%,rgba(255,248,231,0.7)_100%)]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mx-auto max-w-6xl"
        >
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d804d]">
            Chef&apos;s Special
          </p>
          <h2 className="text-center font-serif text-[clamp(34px,6vw,64px)] leading-[0.92] tracking-[0.005em] text-[#2a2116]">
            Signature Dishes
          </h2>

          <div className="relative mt-8">
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#d1b988] bg-[#f6e8cc] p-2 text-[#9a7a43] shadow-sm transition-colors hover:bg-[#f0dfbb]"
              aria-label="Previous signature dishes"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#d1b988] bg-[#f6e8cc] p-2 text-[#9a7a43] shadow-sm transition-colors hover:bg-[#f0dfbb]"
              aria-label="Next signature dishes"
            >
              <ChevronRight size={20} />
            </button>

            <div className="mx-10 grid gap-5 md:mx-12" style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}>
              {visibleDishes.map((dish) => (
                <article
                  key={dish.name}
                  className="rounded-2xl border border-[#e4d3b0] bg-[#f9efdd] p-3 shadow-[0_8px_16px_rgba(80,57,24,0.08)]"
                >
                  <div className="overflow-hidden rounded-xl border border-[#d4bf95]">
                    <img src={dish.image} alt={dish.name} className="h-44 w-full object-cover sm:h-52" loading="lazy" />
                  </div>
                  <div className="px-2 pb-2 pt-4 text-center">
                    <h3 className="font-serif text-[clamp(24px,2.2vw,30px)] leading-none text-[#2e2418]">{dish.name}</h3>
                    <p className="mt-3 min-h-[42px] text-sm leading-relaxed text-[#6b5841]">{dish.description}</p>
                    <Link
                      to="/menu"
                      className="mt-4 inline-flex rounded-lg border border-[#ccb17b] bg-[#f4e5c7] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6e542d] transition-colors hover:bg-[#ecd7af]"
                    >
                      Order Now
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-3 rounded-2xl md:grid-cols-2">
            <div
              className="relative overflow-hidden rounded-2xl border border-[#6f2f22] p-6 sm:p-7"
              style={{
                backgroundImage:
                  "linear-gradient(115deg,rgba(66,7,7,0.9),rgba(89,16,12,0.78)), url('/homepa1.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <h3 className="font-serif text-[clamp(30px,3vw,42px)] leading-[0.92] text-[#f4dfb4]">Order Online</h3>
              <p className="mt-3 max-w-md text-sm text-[#f5e8cc]/90">
                Enjoy your favourite Punjabi dishes at home with quick London delivery.
              </p>
              <Link
                to="/menu"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#c8994b] bg-[rgba(63,8,8,0.55)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-[#f8e3b8] transition-colors hover:bg-[rgba(94,16,16,0.58)]"
              >
                <ShoppingBag size={14} /> Order Now
              </Link>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl border border-[#1f4e43] p-6 sm:p-7"
              style={{
                backgroundImage:
                  "linear-gradient(115deg,rgba(8,40,34,0.92),rgba(15,58,49,0.8)), url('/dining_room.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <h3 className="font-serif text-[clamp(30px,3vw,42px)] leading-[0.92] text-[#f2e3bf]">Book Your Table</h3>
              <p className="mt-3 max-w-md text-sm text-[#eef0de]/88">
                Reserve your table and enjoy a complete royal dining experience.
              </p>
              <Link
                to="/book"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#b89b61] bg-[rgba(8,33,29,0.55)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.09em] text-[#f8e3b8] transition-colors hover:bg-[rgba(12,50,43,0.6)]"
              >
                <CalendarDays size={14} /> Book Now
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
