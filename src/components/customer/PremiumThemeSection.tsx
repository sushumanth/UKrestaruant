import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

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
    name: 'Paneer Tikka',
    description: 'Char-grilled paneer cubes with smoky spice marinade.',
    image: '/dining_room.jpg',
  },
];

export const PremiumThemeSection = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

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
      if (isPaused) return;

      const firstCard = scroller.querySelector('[data-signature-card]') as HTMLDivElement | null;
      const step = firstCard ? firstCard.offsetWidth + 16 : Math.round(scroller.clientWidth * 0.85);
      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

      if (scroller.scrollLeft + step >= maxScrollLeft - 4) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      scroller.scrollBy({ left: step, behavior: 'smooth' });
    }, 3200);

    return () => {
      window.clearInterval(timer);
      scroller.removeEventListener('mouseenter', pause);
      scroller.removeEventListener('mouseleave', resume);
      scroller.removeEventListener('touchstart', pause);
      scroller.removeEventListener('touchend', resume);
    };
  }, []);

  const scrollDishes = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const firstCard = scroller.querySelector('[data-signature-card]') as HTMLDivElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : Math.round(scroller.clientWidth * 0.85);

    scroller.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <svg width="0" height="0" className="absolute -z-10" aria-hidden="true">
        <defs>
          <clipPath id="mughal-card" clipPathUnits="objectBoundingBox">
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
        className="relative w-full overflow-hidden py-4 sm:py-8"
        style={{
          backgroundImage: "url('/backgroundtheme.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,231,0.6)_0%,rgba(255,248,231,0.68)_52%,rgba(255,248,231,0.74)_100%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-6xl"
          >
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d804d]">
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

            <div className="relative mt-10 sm:mt-12">
              <button
                type="button"
                onClick={() => scrollDishes(-1)}
                className="absolute left-0 top-[35%] z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053]"
                aria-label="Previous dishes"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => scrollDishes(1)}
                className="absolute right-0 top-[35%] z-20 -translate-y-1/2 rounded-full border border-[#c4a976] bg-[#e8d5ac] p-2.5 text-[#5c4322] shadow-sm transition-colors hover:bg-[#dabb8f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a053]"
                aria-label="Next dishes"
              >
                <ChevronRight size={18} />
              </button>

              <div
                ref={scrollerRef}
                className="mx-11 overflow-x-auto scroll-smooth sm:mx-12"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* FIX APPLIED HERE: Added items-stretch and pt-4/pb-8 for shadows */}
                <div className="flex items-stretch snap-x snap-mandatory gap-4 pt-4 pb-8">
                  {signatureDishes.map((dish, i) => (
                    <motion.div
                      key={dish.name + i}
                      data-signature-card
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
                      // FIX APPLIED HERE: Added flex and h-auto
                      className="flex h-auto w-[calc((100%-0.75rem)/2)] min-w-[140px] shrink-0 snap-start sm:w-[280px] sm:min-w-0 lg:w-[300px]"
                      style={{
                        filter:
                          'drop-shadow(0 8px 18px rgba(66,36,10,0.12)) drop-shadow(0 0 0.5px rgba(196,160,83,0.8))',
                        transform: 'translateZ(0)',
                      }}
                    >
                      {/* FIX APPLIED HERE: Added w-full */}
                      <article
                        className="group flex w-full h-full cursor-default flex-col border border-[#d5bb86]"
                        style={{ clipPath: 'url(#mughal-card)', background: 'linear-gradient(180deg,#fff7e8 0%,#f9efdb 100%)' }}
                      >
                        <div className="relative w-full overflow-hidden pt-[70%] sm:pt-[62%] shrink-0">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                            draggable={false}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#f9efdb]/70 to-transparent" />
                        </div>

                        <div
                          className="flex flex-1 flex-col items-center justify-between px-3 pb-4 pt-3 text-center sm:px-4 sm:pb-5 sm:pt-3"
                          style={{ borderTop: '1px solid #e0c794', background: '#f9efdb' }}
                        >
                          <div>
                            <h3 className="min-h-[38px] font-serif text-[16px] font-normal leading-tight text-[#2a1e0e] sm:min-h-[46px] sm:text-[clamp(17px,1.7vw,21px)]">
                              {dish.name}
                            </h3>

                            <p className="mt-1.5 min-h-[36px] px-1 text-[10px] leading-relaxed text-[#6b4f2a] sm:mt-2 sm:min-h-[34px] sm:text-[12px]">
                              <span className="sm:hidden">
                                {dish.description.length > 40
                                  ? `${dish.description.slice(0, 40).trimEnd()}...`
                                  : dish.description}
                              </span>
                              <span className="hidden sm:inline">{dish.description}</span>
                            </p>
                          </div>

                          <Link
                            to="/menu"
                            className="mt-4 inline-flex items-center rounded border border-[#c4a053] bg-[#f0dfb6] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#3d2806] transition-colors hover:bg-[#e3cd97] sm:px-5 sm:py-1.5 sm:text-[10px] sm:tracking-[0.12em]"
                          >
                            Order Now
                          </Link>
                        </div>
                      </article>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-3 md:grid-cols-2">
             <div className="relative w-full min-h-[220px] overflow-hidden rounded-2xl border border-[#6f2f22]">
                <img
                  src="/bookorderimg.png"
                  alt="Order online Punjabi food"
                  className="absolute inset-0 w-full h-full object-cover object-[75%_center]"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,4,4,0.97)_0%,rgba(40,8,8,0.9)_35%,rgba(60,12,10,0.55)_60%,rgba(0,0,0,0)_85%)]" />

                <div className="relative z-10 p-6 sm:p-8 max-w-[420px]">
                  <h3 className="font-serif text-[clamp(26px,2.8vw,36px)] text-[#f4dfb4] leading-tight">
                    Order Online
                  </h3>
                  <p className="mt-3 text-[13px] text-[#f5e8cc]/90 leading-relaxed">
                    Enjoy your favourite Punjabi dishes at home with quick London delivery.
                  </p>
                  <Link
                    to="/menu"
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
                  to="/booking"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#b89b61] bg-[rgba(8,33,29,0.55)] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#f8e3b8] transition-colors hover:bg-[rgba(12,50,43,0.62)]"
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