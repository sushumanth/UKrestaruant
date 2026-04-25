import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ArrowRight, CalendarClock, Clock3, PhoneCall } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const operatingHighlights = [
  {
    icon: PhoneCall,
    title: '+44 7424 911245',
    subtitle: 'Call us',
  },
  {
    icon: CalendarClock,
    title: 'Tue - Sun',
    subtitle: 'Opening hours',
  },
  {
    icon: Clock3,
    title: '2PM - 11PM',
    subtitle: 'Weekends',
  },
  {
    icon: Clock3,
    title: '4PM - 11PM',
    subtitle: 'Weekdays',
  },
  {
    icon: CalendarClock,
    title: 'Monday',
    subtitle: 'Closed',
  },
];

export const HeroSection = () => {
  const heroTitle = 'An Indian Punjabi Restaurant';
  const [typedHeroTitle, setTypedHeroTitle] = useState('');

  useEffect(() => {
    const typingState = { chars: 0 };

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });
    timeline
      .to(typingState, {
        chars: heroTitle.length,
        duration: 2.1,
        ease: 'none',
        onUpdate: () => {
          setTypedHeroTitle(heroTitle.slice(0, Math.floor(typingState.chars)));
        },
      })
      .to({}, { duration: 0.9 })
      .set(typingState, {
        chars: 0,
        onComplete: () => {
          setTypedHeroTitle('');
        },
      });

    return () => {
      timeline.kill();
    };
  }, [heroTitle]);

  return (
    <section className="relative overflow-hidden bg-[#140705] pt-16 sm:pt-20 lg:min-h-screen lg:pt-28">
      <div className="absolute inset-0">
        <img
          src="\heroimg.png"
          alt="Authentic Punjabi dining in London"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(21,7,4,0.9)_0%,rgba(25,10,6,0.66)_46%,rgba(21,7,4,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,0,0,0.22),transparent_52%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-44">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="max-w-[36rem]"
        >
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2aa64] sm:mb-3 sm:text-[11px] sm:tracking-[0.22em]">
            Authentic Punjabi Dining Experience
          </p>

          <div className="sm:hidden">
            <div className="relative">
              <span
                aria-hidden="true"
                className="invisible block font-serif text-[clamp(46px,12vw,64px)] font-bold italic leading-[0.92] tracking-[-0.035em]"
              >
                {heroTitle}
              </span>
              <h1
                className="absolute inset-0 font-serif text-[clamp(46px,12vw,64px)] font-bold italic leading-[0.92] tracking-[-0.035em] text-[#f6dba4]"
                style={{
                  textShadow: '0 6px 20px rgba(0,0,0,0.45)',
                }}
              >
                {typedHeroTitle}
              </h1>
            </div>
            <p
              className="mt-1.5 font-serif text-[clamp(46px,11.2vw,62px)] font-bold leading-[0.9] tracking-[-0.03em] text-[#f6dba4]"
              style={{
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              Experience in London
            </p>
          </div>

          <motion.svg
  viewBox="0 0 860 240"
  className="hidden w-full max-w-[820px] overflow-visible sm:block"
  preserveAspectRatio="xMinYMin meet"
  role="img"
  aria-label="Indian Punjabi Restaurant in London - A Royal Punjabi Experience"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  {/* First Line */}
  <motion.text
  x="0"
  y="98"
  className="font-serif text-[92px] font-bold tracking-[-0.03em]"
  fill="#f6dba4"
  stroke="#f6dba4"
  strokeWidth="1.8"
  style={{
    fontFamily: "'Playfair Display', 'Great Vibes', 'Dancing Script', Blackadder ITC", // Fallback cursive fonts
    fontStyle: "italic",
    textShadow: "0 6px 20px rgba(0,0,0,0.45)",
  }}
  initial={{
    strokeDasharray: 1200,
    strokeDashoffset: 1200,
    fill: "rgba(246, 219, 164, 0)",
    opacity: 0.6,
  }}
  animate={{
    strokeDashoffset: 0,
    fill: "#f6dba4",
    opacity: 1,
  }}
  transition={{
    duration: 2.2,
    ease: [0.25, 0.1, 0.25, 1],
  }}
>
  {typedHeroTitle}
</motion.text>

  {/* Second Line */}
  <motion.text
    x="0"
    y="198"
    className="font-serif text-[92px] font-bold tracking-[-0.02em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    fill="#f6dba4"
    stroke="#f6dba4"
    strokeWidth="1.5"
    initial={{ 
      strokeDasharray: 900, 
      strokeDashoffset: 900, 
      fill: "rgba(246, 219, 164, 0)" 
    }}
    animate={{ 
      strokeDashoffset: 0, 
      fill: "#f6dba4" 
    }}
    transition={{ 
      duration: 1.4, 
      delay: 0.25, 
      ease: [0.25, 0.1, 0.25, 1] 
    }}
  >
    Experience in London
  </motion.text>
</motion.svg>
          <p className="mt-4 max-w-[32rem] text-[clamp(15px,5vw,19px)] leading-relaxed text-[#f3e4c2] sm:mt-5 sm:text-[clamp(15px,1.7vw,21px)]">
            Where timeless recipes meet refined elegance. Indulge in rich, authentic flavours crafted with tradition, served in a setting designed for unforgettable evenings.
          </p>
          <p className="mt-3 max-w-[32rem] text-[clamp(15px,4.1vw,18px)] leading-relaxed text-[#e7d6b0] sm:text-sm">
            Perfect for family celebrations, date nights, and premium dining experiences across London.
          </p>

          <div className="mt-7 flex flex-col gap-3.5 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              to="/menu"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7a3e19] bg-[linear-gradient(90deg,#67130f,#7d1712)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#7b1913,#94221a)] sm:w-auto"
            >
              Order Online
            </Link>
            <Link
              to="/book"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e6a4f] bg-[linear-gradient(90deg,#0f3328,#124437)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#134132,#1a5a47)] sm:w-auto"
            >
              Book Your Table <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
        className="relative z-20 w-full border-y border-[#c7a86f] bg-[linear-gradient(90deg,#faefd7_0%,#f4e4bf_48%,#f9edd4_100%)] shadow-[0_-10px_20px_rgba(12,8,4,0.22)] lg:absolute lg:inset-x-0 lg:bottom-0"
      >
        {/* CHANGED: Defaulted to grid-cols-2 for mobile, adjusted gap and padding */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-2 gap-y-4 px-4 py-5 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:gap-1 lg:px-8 lg:py-4">
          {operatingHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.title}-${item.subtitle}`}
                // CHANGED: Removed the excessive horizontal/vertical padding on mobile
                className="flex items-center gap-2.5 border-[#d7be90] lg:border-r lg:px-2 lg:py-2 last:lg:border-r-0"
              >
                {/* CHANGED: Added `shrink-0` to prevent the circle from squishing, slightly reduced mobile circle size */}
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#9f7e44] bg-[#f9edd6] text-[#6a4e20] sm:h-9 sm:w-9">
                  <Icon size={16} className="sm:h-[17px] sm:w-[17px]" />
                </span>
                <div>
                  {/* CHANGED: Reduced font size strictly for mobile to fit side-by-side nicely */}
                  <p className="text-[13px] font-semibold leading-tight text-[#2f2415] sm:text-base">{item.title}</p>
                  <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.05em] text-[#654d27] sm:text-[11px] sm:tracking-[0.08em]">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};