import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import DishFrame from '../ui/DishFrame';

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
   {
    name: 'Paneer Tikka 2',
    description: 'Char-grilled paneer cubes with smoky spice marinade.',
    image: '/dining_room.jpg',
  },
];

export const PremiumThemeSection = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
const currentIndexRef = useRef(signatureDishes.length);
const autoDirectionRef = useRef<1 | -1>(-1);
const autoStepCountRef = useRef(0);
const isAnimatingRef = useRef(false);

const loopedDishes = [
  ...signatureDishes,
  ...signatureDishes,
  ...signatureDishes,
];

const isMobileLayout = () => {
  return window.matchMedia('(max-width: 767px)').matches;
};

const getStepSize = () => {
  const scroller = scrollerRef.current;
  if (!scroller) return 0;

  const firstCard = scroller.querySelector('[data-signature-card]') as HTMLDivElement | null;
  if (!firstCard) return 0;

  const mobileGap = 28;
  const desktopGap = 20;
  return isMobileLayout()
    ? firstCard.offsetHeight + mobileGap
    : firstCard.offsetWidth + desktopGap;
};

const jumpToIndex = (index: number) => {
  const scroller = scrollerRef.current;
  if (!scroller) return;

  const step = getStepSize();
  const target = step * index;

  if (isMobileLayout()) {
    scroller.scrollTop = target;
  } else {
    scroller.scrollLeft = target;
  }

  currentIndexRef.current = index;
};

const animateToIndex = (index: number) => {
  const scroller = scrollerRef.current;
  if (!scroller || isAnimatingRef.current) return;

  isAnimatingRef.current = true;

  const step = getStepSize();
  const target = step * index;
  const isMobile = isMobileLayout();

  const start = isMobile ? scroller.scrollTop : scroller.scrollLeft;
  const distance = target - start;
  const duration = 750;
  const startTime = performance.now();

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const frame = (time: number) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = easeInOutCubic(progress);
    const nextValue = start + distance * eased;

    if (isMobile) {
      scroller.scrollTop = nextValue;
    } else {
      scroller.scrollLeft = nextValue;
    }

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    currentIndexRef.current = index;

    const total = signatureDishes.length;

    // If we move into copy 3, silently reset to same item in copy 2
    if (currentIndexRef.current >= total * 2) {
      jumpToIndex(currentIndexRef.current - total);
    }

    // If we move into copy 1, silently reset to same item in copy 2
    if (currentIndexRef.current < total) {
      jumpToIndex(currentIndexRef.current + total);
    }

    isAnimatingRef.current = false;
  };

  requestAnimationFrame(frame);
};

  useEffect(() => {
  const scroller = scrollerRef.current;
  if (!scroller) return;

  jumpToIndex(signatureDishes.length);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let isPaused = false;

  const pause = () => {
    isPaused = true;
  };

  const resume = () => {
    isPaused = false;
  };

  scroller.addEventListener('mouseenter', pause);
  scroller.addEventListener('mouseleave', resume);
  scroller.addEventListener('touchstart', pause, { passive: true });
  scroller.addEventListener('touchend', resume);

  const timer = window.setInterval(() => {
    if (isPaused || isAnimatingRef.current) return;

    const direction = autoDirectionRef.current;
    animateToIndex(currentIndexRef.current + direction);

    autoStepCountRef.current += 1;

    // pattern: two one side, one back
    if (direction === -1 && autoStepCountRef.current >= 2) {
      autoDirectionRef.current = 1;
      autoStepCountRef.current = 0;
    } else if (direction === 1 && autoStepCountRef.current >= 1) {
      autoDirectionRef.current = -1;
      autoStepCountRef.current = 0;
    }
  }, 4600);

  const handleResize = () => {
    jumpToIndex(currentIndexRef.current);
  };

  window.addEventListener('resize', handleResize);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener('resize', handleResize);
    scroller.removeEventListener('mouseenter', pause);
    scroller.removeEventListener('mouseleave', resume);
    scroller.removeEventListener('touchstart', pause);
    scroller.removeEventListener('touchend', resume);
  };
}, []);

  const scrollDishes = (direction: 1 | -1) => {
    animateToIndex(currentIndexRef.current + direction);
  };

  return (
    <>
      <section
        className="relative w-full min-h-[100svh] overflow-visible pt-8 pb-4 sm:pt-10 sm:pb-8"
        style={{
          backgroundImage: "url('/backgroundtheme.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,231,0.6)_0%,rgba(255,248,231,0.68)_52%,rgba(255,248,231,0.74)_100%)]" />

        <div className="relative z-10 mx-auto w-full px-2 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-[85rem]"
          >
            <p className="mt-2 mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d804d] no-select">
              Chef&apos;s Special
            </p>
            <h2 className="text-center font-serif text-[clamp(24px,5vw,40px)] font-normal leading-[0.95] tracking-[0.01em] text-[#2a1e0e]">
              Signature Dishes
            </h2>

            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <span className="block h-px w-16 bg-gradient-to-r from-transparent to-[#c4a053]" />
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none" aria-hidden="true">
                <circle cx="10" cy="5" r="3" fill="#c4a053" />
                <circle cx="2"  cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
                <circle cx="18" cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
              </svg>
              <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#c4a053]" />
            </div>

            <div className="relative mt-8 px-2 pt-12 pb-12 sm:mt-10 md:px-0 md:pt-0 no-select">
              <button
  type="button"
  onClick={() => scrollDishes(-1)}
  className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053] md:left-0 md:top-1/2 md:-translate-x-0 md:-translate-y-1/2"
  aria-label="Previous dishes"
>
  <ChevronUp size={18} className="md:hidden" />
  <ChevronLeft size={18} className="hidden md:block" />
</button>

              <button
  type="button"
  onClick={() => scrollDishes(1)}
  className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053] md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:translate-x-0 md:-translate-y-1/2"
  aria-label="Next dishes"
>
  <ChevronDown size={18} className="md:hidden" />
  <ChevronRight size={18} className="hidden md:block" />
</button>


              <div    
                ref={scrollerRef}
                className="mx-auto h-[430px] max-h-[430px] w-full px-1 py-0 scroll-smooth sm:h-[460px] sm:max-h-[460px] md:h-auto md:mx-11 md:max-h-none md:px-0 overflow-hidden"
                style={{ scrollbarWidth: 'none' }}
              >
                <div className="flex flex-col items-center md:flex-row md:items-stretch md:snap-x md:snap-mandatory gap-8 py-0 md:gap-5 md:pt-4 md:pb-8 [perspective:1000px] ">
                  {loopedDishes.map((dish, i) => {
                    const realIndex = i % signatureDishes.length;
                    return (
                    <motion.div
                      layout
                      key={`${dish.name}-${i}`}
                      data-signature-card
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                      className="relative flex h-auto w-[260px] min-w-[260px] shrink-0 snap-start justify-center md:w-[275px] md:min-w-[275px] lg:w-[303px] lg:min-w-[303px]"
                    >
                      <DishFrame
              name={dish.name}
              image={dish.image}
              description={dish.description}
            />
             {realIndex !== signatureDishes.length + 1 && (
                <div className="no-select absolute right-[-10px] top-0 hidden h-full md:block">
                  <div className="absolute left-1/2 top-16 h-[calc(75%+16px)] w-[2px] -translate-x-1/2 bg-[#c6a96d]" />
                  <div className="absolute left-1/2 top-16 h-[calc(75%+20px)] w-[7px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#dcc18a]/55 to-transparent blur-[1px]" />
                </div>
              )}
                    </motion.div>
                    );
      })}
                </div>
              </div>
            </div>

            {/* <div className="mt-10 grid gap-3 md:grid-cols-2">
             <div className="relative w-full min-h-[220px] overflow-hidden rounded-2xl border border-[#6f2f22]">
                <img
                  src="/bookorderimg.png"
                  alt="Order online Indian food"
                  className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,4,4,0.97)_0%,rgba(40,8,8,0.9)_35%,rgba(60,12,10,0.55)_60%,rgba(0,0,0,0)_85%)]" />

                <div className="relative z-10 p-6 sm:p-8 max-w-[420px]">
                  <h3 className="font-serif text-[clamp(26px,2.8vw,36px)] text-[#f4dfb4] leading-tight">
                    Order Online
                  </h3>
                  <p className="mt-3 text-[13px] text-[#f5e8cc]/90 leading-relaxed">
                    Enjoy your favourite dishes at home with quick London delivery.
                  </p>
                  <Link
                    to="/order"
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#c8994b] bg-[#3f0808]/70 px-5 py-2 text-xs font-bold uppercase tracking-wide text-[#f8e3b8] hover:bg-[#5a1212]/80 transition"
                  >
                    <ShoppingBag size={14} />
                    Order Now
                  </Link>
                </div>
              </div>

              <div
                className="relative overflow-hidden rounded-2xl border border-[#1f4e43] p-5 sm:p-6"
                style={{
                  backgroundImage:
                    "linear-gradient(115deg,rgba(8,40,34,0.8),rgba(15,58,49,0)), url('/tablecard.png')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <h3 className="font-serif text-[clamp(22px,2.7vw,32px)] font-normal leading-tight text-[#f2e3bf]">
                  Book Your Table
                </h3>
                <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-[#eef0de]/85 sm:text-[13px]">
                  Reserve your table and enjoy a complete royal dining experience.
                </p>
                <Link
                  to="/book"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#b89b61] bg-[rgba(8,33,29,0.55)] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#f8e3b8] transition-colors hover:bg-[rgba(12,50,43,0.62)]"
                >
                  <CalendarDays size={14} />
                  Book Now
                </Link>
              </div>
            </div> */}
          </motion.div>
        </div>
      </section>
    </>
  );
};