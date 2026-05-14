'use client';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
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

  // Track touch start position to detect scroll direction
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const loopedDishes = [
    ...signatureDishes,
    ...signatureDishes,
    ...signatureDishes,
  ];

  const isMobileLayout = useCallback(() => {
    return window.matchMedia('(max-width: 767px)').matches;
  }, []);

  const getStepSize = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return 0;
    const firstCard = scroller.querySelector('[data-signature-card]') as HTMLDivElement | null;
    if (!firstCard) return 0;
    const gap = 20;
    return firstCard.offsetWidth + gap;
  }, []);

  const jumpToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const step = getStepSize();
    scroller.scrollLeft = step * index;
    currentIndexRef.current = index;
  }, [getStepSize]);

  const animateToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const step = getStepSize();
    const target = step * index;
    const start = scroller.scrollLeft;
    const distance = target - start;
    const duration = 750;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const frame = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      scroller.scrollLeft = start + distance * easeInOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }

      currentIndexRef.current = index;
      const total = signatureDishes.length;

      if (currentIndexRef.current >= total * 2) {
        jumpToIndex(currentIndexRef.current - total);
      }
      if (currentIndexRef.current < total) {
        jumpToIndex(currentIndexRef.current + total);
      }

      isAnimatingRef.current = false;
    };

    requestAnimationFrame(frame);
  }, [getStepSize, jumpToIndex]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    jumpToIndex(signatureDishes.length);

    // ── FIX: Wheel handler — let vertical scroll pass through to page ──────
    const handleWheel = (e: WheelEvent) => {
      const isMoreVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);

      if (isMoreVertical) {
        // Don't preventDefault — let the page scroll normally
        return;
      }

      // Horizontal wheel: handle carousel scroll, block page side-scroll
      e.preventDefault();
      e.stopPropagation();

      if (isAnimatingRef.current) return;
      const direction = e.deltaX > 0 ? 1 : -1;
      animateToIndex(currentIndexRef.current + direction);
    };

    scroller.addEventListener('wheel', handleWheel, { passive: false });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => {
        scroller.removeEventListener('wheel', handleWheel);
      };
    }

    const isMobile = isMobileLayout();
    let isPaused = false;
    let animationFrameId = 0;
    let resumeTimeoutId = 0;

    // ── FIX: Touch handlers — only intercept horizontal swipes ────────────
    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      // Don't pause yet — wait to see if it's horizontal
    };

    const handleTouchMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - touchStartXRef.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartYRef.current);

      if (dy > dx) {
        // Vertical swipe — do NOT intercept, let page scroll
        return;
      }

      // Horizontal swipe — pause autoplay
      isPaused = true;
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
    };

    const handleTouchEnd = () => {
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
      resumeTimeoutId = window.setTimeout(() => {
        isPaused = false;
      }, 2000);
    };

    scroller.addEventListener('touchstart', handleTouchStart, { passive: true });
    scroller.addEventListener('touchmove', handleTouchMove, { passive: true });
    scroller.addEventListener('touchend', handleTouchEnd);

    // ── Mobile continuous scroll loop ─────────────────────────────────────
    const mobileLoop = () => {
      if (!scrollerRef.current) return;

      if (!isPaused && !isAnimatingRef.current) {
        const step = getStepSize();
        const total = signatureDishes.length;
        const loopDistance = step * total;

        scroller.scrollLeft += 0.85;

        if (scroller.scrollLeft >= loopDistance * 2) {
          scroller.scrollLeft -= loopDistance;
        }

        currentIndexRef.current = Math.round(scroller.scrollLeft / step);
      }

      animationFrameId = window.requestAnimationFrame(mobileLoop);
    };

    // ── Desktop auto-advance timer ────────────────────────────────────────
    const timer = isMobile
      ? 0
      : window.setInterval(() => {
          if (isPaused || isAnimatingRef.current) return;

          const direction = autoDirectionRef.current;
          animateToIndex(currentIndexRef.current + direction);
          autoStepCountRef.current += 1;

          if (direction === -1 && autoStepCountRef.current >= 2) {
            autoDirectionRef.current = 1;
            autoStepCountRef.current = 0;
          } else if (direction === 1 && autoStepCountRef.current >= 1) {
            autoDirectionRef.current = -1;
            autoStepCountRef.current = 0;
          }
        }, 4600);

    if (isMobile) {
      animationFrameId = window.requestAnimationFrame(mobileLoop);
    }

    const handleResize = () => jumpToIndex(currentIndexRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      scroller.removeEventListener('wheel', handleWheel);
      scroller.removeEventListener('touchstart', handleTouchStart);
      scroller.removeEventListener('touchmove', handleTouchMove);
      scroller.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (timer) window.clearInterval(timer);
      window.cancelAnimationFrame(animationFrameId);
      if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
    };
  }, [animateToIndex, getStepSize, isMobileLayout, jumpToIndex]);

  const scrollDishes = (direction: 1 | -1) => {
    animateToIndex(currentIndexRef.current + direction);
  };

  return (
    <>
      <section
        className="relative w-full min-h-auto md:min-h-[100svh] overflow-hidden pt-6 pb-2 sm:pt-8 sm:pb-4 md:pt-10 md:pb-8 md:overflow-visible"
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
                <circle cx="2" cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
                <circle cx="18" cy="5" r="1.5" fill="#c4a053" opacity="0.5" />
              </svg>
              <span className="block h-px w-16 bg-gradient-to-l from-transparent to-[#c4a053]" />
            </div>

            <div className="relative mt-10 sm:mt-12 no-select">
              <button
                type="button"
                onClick={() => scrollDishes(-1)}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053] md:left-0 md:top-1/2 md:-translate-x-0 md:-translate-y-1/2"
                aria-label="Previous dishes"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollDishes(1)}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053] md:bottom-auto md:left-auto md:right-0 md:top-1/2 md:translate-x-0 md:-translate-y-1/2"
                aria-label="Next dishes"
              >
                <ChevronRight size={18} />
              </button>

<div    
  ref={scrollerRef}
  className="mx-auto max-h-[440px] overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-y px-3 py-6 sm:px-6 sm:py-8 scroll-smooth md:mx-11 md:max-h-none md:overflow-hidden md:px-0 md:py-0"
  style={{ scrollbarWidth: 'none' }}
>
                <div className="flex flex-row items-stretch md:snap-x md:snap-mandatory gap-5 pt-4 pb-8 [perspective:1000px] w-max md:w-auto md:items-stretch">
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
                        className="relative flex h-auto w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] shrink-0 snap-start justify-center sm:w-[280px] sm:min-w-[280px] md:w-[240px] md:min-w-[240px] lg:w-[303px] lg:min-w-[303px]"
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
          </motion.div>
        </div>
      </section>
    </>
  );
};