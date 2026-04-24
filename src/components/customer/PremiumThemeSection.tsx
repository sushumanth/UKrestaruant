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
    description: 'Tender chicken simmered in our rich, creamy tomato sauce.',
    image: '/chef_plating.jpg',
  },
  {
    name: 'Lamb Biryani',
    description: 'Fragrant basmati rice cooked with lamb, herbs & authentic spices.',
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
    <>
      {/*
        SVG Clip Path — Mughal / Islamic pointed arch.
        The arch rises to a sharp point at the centre (0.5, 0) using two
        cubic Bézier curves that mimic the classic ogee silhouette seen in
        the reference screenshot.  The bottom corners are notched inward so
        the card has the characteristic cut-corner finish.
      */}
      <svg width="0" height="0" className="absolute -z-10" aria-hidden="true">
        <defs>
          <clipPath id="mughal-card" clipPathUnits="objectBoundingBox">
            {/*
              Reading the path in segments (all coords are 0–1 fractions):
              Start bottom-left notch  → up the left edge
              → left side of arch dome (cubic Bézier, peaking near centre-top)
              → right side of arch dome
              → down the right edge
              → bottom-right notch → close
            */}
            <path d="
              M 0.05,1
              L 0,0.95
              L 0,0.14
              C 0.13,0.14 0.28,0.08 0.38,0.04
              C 0.43,0.02 0.47,0 0.5,0
              C 0.53,0 0.57,0.02 0.62,0.04
              C 0.72,0.08 0.87,0.14 1,0.14
              L 1,0.95
              L 0.95,1
              Z
            " />
          </clipPath>
        </defs>
      </svg>

      <section
        className="relative w-full overflow-hidden py-14 sm:py-20"
        style={{
          backgroundImage: "url('/backgroundtheme.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Warm cream overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,231,0.6)_0%,rgba(255,248,231,0.68)_52%,rgba(255,248,231,0.74)_100%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-6xl"
          >
            {/* ── Section header ── */}
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d804d]">
              Chef&apos;s Special
            </p>
            <h2 className="text-center font-serif text-[clamp(34px,6vw,62px)] font-normal leading-[0.95] tracking-[0.01em] text-[#2a1e0e]">
              Signature Dishes
            </h2>

            {/* Decorative divider */}
            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[#c4a053]" />
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
                <circle cx="10" cy="5" r="3" fill="#c4a053" />
                <circle cx="2"  cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
                <circle cx="18" cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
              </svg>
              <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#c4a053]" />
            </div>

            {/* ── Carousel ── */}
            <div className="relative mt-14 sm:mt-16">
              {/* Prev button */}
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-0 top-[38%] z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053]"
                aria-label="Previous dishes"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Next button */}
              <button
                type="button"
                onClick={showNext}
                className="absolute right-0 top-[38%] z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053]"
                aria-label="Next dishes"
              >
                <ChevronRight size={18} />
              </button>

              {/* Cards grid */}
              <div
                className="mx-12 grid gap-5 sm:mx-14"
                style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}
              >
                {visibleDishes.map((dish, i) => (
                  <motion.div
                    key={`${dish.name}-${startIndex}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
                    /*
                      drop-shadow stacks:
                      1. A soft large shadow beneath the card for depth.
                      2. A 1 px tight shadow to fake the golden border around
                         the clip-path edge (regular border won't follow the arch).
                    */
                    style={{
                      filter:
                        'drop-shadow(0 10px 22px rgba(80,40,0,0.12)) drop-shadow(0 0 0.5px rgba(196,160,83,0.9))',
                      transform: 'translateZ(0)', /* GPU layer — prevents filter repaint jank */
                    }}
                  >
                    <article
                      className="group flex cursor-default flex-col"
                      style={{ clipPath: 'url(#mughal-card)', background: '#faf4e6' }}
                    >
                      {/* ── Food image — fills the arch dome area ── */}
                      <div className="relative w-full overflow-hidden" style={{ paddingTop: '78%' }}>
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                          draggable={false}
                        />
                        {/*
                          Subtle vignette at the bottom of the image so it
                          blends into the cream card body without a harsh edge.
                        */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#faf4e6]/60 to-transparent" />
                      </div>

                      {/* ── Text body ── */}
                      <div
                        className="flex flex-col items-center px-5 pb-8 pt-6 text-center"
                        style={{ borderTop: '1px solid #e8d09a', background: '#faf4e6' }}
                      >
                        <h3 className="font-serif text-[clamp(20px,2vw,26px)] font-normal leading-tight text-[#2a1e0e]">
                          {dish.name}
                        </h3>

                        <p className="mt-2.5 min-h-[44px] px-1 text-[13px] leading-relaxed text-[#6b4f2a]">
                          {dish.description}
                        </p>

                        <Link
                          to="/menu"
                          className="mt-5 inline-flex items-center rounded border border-[#c4a053] bg-[#ecd9a8] px-7 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#3d2806] transition-colors hover:bg-[#dabb80]"
                        >
                          Order Now
                        </Link>
                      </div>
                    </article>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── CTA row ── */}
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {/* Order Online */}
              <div
                className="relative overflow-hidden rounded-2xl border border-[#6f2f22] p-6 sm:p-8"
                style={{
                  backgroundImage:
                    "linear-gradient(115deg,rgba(66,7,7,0.92),rgba(89,16,12,0.8)), url('/homepa1.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <h3 className="font-serif text-[clamp(26px,3vw,36px)] font-normal leading-tight text-[#f4dfb4]">
                  Order Online
                </h3>
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#f5e8cc]/90">
                  Enjoy your favourite Punjabi dishes at home with quick London delivery.
                </p>
                <Link
                  to="/menu"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#c8994b] bg-[rgba(63,8,8,0.55)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#f8e3b8] transition-colors hover:bg-[rgba(94,16,16,0.6)]"
                >
                  <ShoppingBag size={14} />
                  Order Now
                </Link>
              </div>

              {/* Book a Table */}
              <div
                className="relative overflow-hidden rounded-2xl border border-[#1f4e43] p-6 sm:p-8"
                style={{
                  backgroundImage:
                    "linear-gradient(115deg,rgba(8,40,34,0.94),rgba(15,58,49,0.82)), url('/dining_room.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <h3 className="font-serif text-[clamp(26px,3vw,36px)] font-normal leading-tight text-[#f2e3bf]">
                  Book Your Table
                </h3>
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#eef0de]/85">
                  Reserve your table and enjoy a complete royal dining experience.
                </p>
                <Link
                  to="/book"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#b89b61] bg-[rgba(8,33,29,0.55)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#f8e3b8] transition-colors hover:bg-[rgba(12,50,43,0.62)]"
                >
                  <CalendarDays size={14} />
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};