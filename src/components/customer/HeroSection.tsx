import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
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

const heroParticles = [
  { top: '14%', left: '12%', size: 7, duration: 8.8, delay: 0.2, alpha: 0.32 },
  { top: '22%', left: '28%', size: 5, duration: 10.2, delay: 1.1, alpha: 0.26 },
  { top: '30%', left: '8%', size: 6, duration: 9.5, delay: 2.6, alpha: 0.3 },
  { top: '38%', left: '44%', size: 8, duration: 11.4, delay: 0.7, alpha: 0.28 },
  { top: '48%', left: '18%', size: 6, duration: 10.6, delay: 3.2, alpha: 0.25 },
  { top: '58%', left: '36%', size: 5, duration: 9.1, delay: 1.8, alpha: 0.24 },
  { top: '18%', left: '66%', size: 7, duration: 12.2, delay: 2.1, alpha: 0.22 },
  { top: '26%', left: '82%', size: 6, duration: 10.8, delay: 0.4, alpha: 0.24 },
  { top: '40%', left: '74%', size: 5, duration: 8.7, delay: 1.9, alpha: 0.22 },
  { top: '53%', left: '90%', size: 7, duration: 9.8, delay: 2.8, alpha: 0.25 },
  { top: '67%', left: '63%', size: 6, duration: 11.1, delay: 1.2, alpha: 0.23 },
  { top: '72%', left: '80%', size: 5, duration: 8.9, delay: 3.4, alpha: 0.22 },
];

const floatingFoodAccents = [
  { title: 'Proudly Non-Halal restaurant', top: '22%', left: '73%' },
  // { title: 'Clay Oven Craft', top: '41%', left: '71%' },
  // { title: 'Royal Plating', top: '60%', left: '67%' },
];

export const HeroSection = () => {
  const [playIntro, setPlayIntro] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 90, damping: 20, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 90, damping: 20, mass: 0.6 });

  const bgX = useTransform(springX, [-1, 1], [-16, 16]);
  const bgY = useTransform(springY, [-1, 1], [-10, 10]);
  const contentX = useTransform(springX, [-1, 1], [-8, 8]);
  const contentY = useTransform(springY, [-1, 1], [-5, 5]);
  const particleX = useTransform(springX, [-1, 1], [-12, 12]);
  const particleY = useTransform(springY, [-1, 1], [-8, 8]);

  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      setPlayIntro(false);
      return;
    }

    const storageKey = 'ukr-hero-intro-played';
    const hasPlayedIntro = window.localStorage.getItem(storageKey) === '1';

    setPlayIntro(!hasPlayedIntro);

    if (!hasPlayedIntro) {
      window.localStorage.setItem(storageKey, '1');
    }
  }, [prefersReducedMotion]);



  const handlePointerMove = (event: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const normalizedY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
  };

  const resetParallax = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      className="relative overflow-hidden bg-[#140705] pt-16 sm:pt-20 lg:min-h-screen lg:pt-28"
      onMouseMove={handlePointerMove}
      onMouseLeave={resetParallax}
    >
      <div className="absolute inset-0">
        <motion.img
          src="\heroimg.png"
          alt="Authentic Punjabi dining in London"
          className="h-full w-full object-cover object-center will-change-transform"
          loading="eager"
          initial={{ opacity: playIntro ? 0 : 1, scale: playIntro ? 1.12 : 1.04 }}
          animate={{
            opacity: 1,
            scale: prefersReducedMotion ? 1.03 : [1.03, 1.07, 1.03],
          }}
          transition={{
            opacity: { duration: playIntro ? 0.6 : 0.25, ease: 'easeOut' },
            scale: prefersReducedMotion
              ? { duration: 0.4, ease: 'easeOut' }
              : { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ x: bgX, y: bgY }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(21,7,4,0.9)_0%,rgba(25,10,6,0.66)_46%,rgba(21,7,4,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,0,0,0.22),transparent_52%)]" />

        <motion.div className="pointer-events-none absolute inset-0" style={{ x: particleX, y: particleY }}>
          {heroParticles.map((particle, index) => (
            <motion.span
              key={`${particle.left}-${particle.top}-${index}`}
              className="absolute rounded-full bg-[radial-gradient(circle,rgba(250,214,136,0.95)_0%,rgba(208,138,57,0.12)_70%,transparent_100%)] will-change-transform"
              style={{
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size,
              }}
              animate={
                prefersReducedMotion
                  ? { opacity: particle.alpha }
                  : {
                      opacity: [0, particle.alpha, 0],
                      y: [0, -16, 0],
                      x: [0, 4, 0],
                      scale: [0.94, 1.06, 0.94],
                    }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.3 }
                  : {
                      duration: particle.duration,
                      delay: particle.delay,
                      ease: 'easeInOut',
                      repeat: Infinity,
                    }
              }
            />
          ))}
        </motion.div>

       <motion.div
  className="pointer-events-none absolute inset-0 hidden lg:block"
  style={{ x: particleX, y: particleY }}
>
  {floatingFoodAccents.map((accent, index) => (
    <motion.div
      key={accent.title}
      className="absolute group"
      style={{ top: accent.top, left: accent.left }}
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : {
              y: [0, -10, 0],
              opacity: [0.85, 1, 0.85],
            }
      }
      transition={{
        duration: 6 + index,
        delay: index * 0.5,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-r from-[#cfa664]/30 via-[#f2d7a1]/40 to-[#cfa664]/30 rounded-xl" />

      {/* Badge */}
      <div className="relative px-5 py-3 bg-gradient-to-b from-[#2b1a10] via-[#1a0f08] to-[#120904] border border-[#cfa664]/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-md overflow-hidden">
        
        {/* Gold Inner Border */}
        <div className="absolute inset-0 border border-[#f2d7a1]/20 rounded-md pointer-events-none" />

        {/* Shine Effect */}
        <motion.div
          className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 4,
            delay: index * 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Text */}
        <span className="relative text-[11px] tracking-[0.2em] uppercase font-semibold text-[#f2d7a1]">
          {accent.title}
        </span>
      </div>
    </motion.div>
  ))}
</motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-44">
        <motion.div
          initial={{ opacity: 0, y: playIntro ? 26 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: playIntro ? 0.9 : 0.5, delay: playIntro ? 0.18 : 0, ease: 'easeOut' }}
          className="max-w-[36rem]"
          style={{ x: contentX, y: contentY }}
        >
          <motion.p
            initial={{ opacity: 0, y: playIntro ? 16 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: playIntro ? 0.65 : 0.35, delay: playIntro ? 0.35 : 0.08, ease: 'easeOut' }}
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2aa64] sm:mb-3 sm:text-[11px] sm:tracking-[0.22em]"
          >
            Authentic Punjabi Dining Experience
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: playIntro ? 14 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: playIntro ? 0.6 : 0.35, delay: playIntro ? 0.42 : 0.12, ease: 'easeOut' }}
            className="mb-3 inline-flex rounded-full border border-[#cfa664]/45 bg-[linear-gradient(120deg,rgba(24,13,8,0.78),rgba(12,8,5,0.66))] px-3.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#f2d7a1] shadow-[0_6px_16px_rgba(0,0,0,0.28)] sm:hidden"
          >
            Proudly Non-Halal Restaurant
          </motion.div>

          <motion.svg
            viewBox="0 0 900 280"
            className="w-full max-w-2xl overflow-visible"
            preserveAspectRatio="xMinYMid meet"
            role="img"
            aria-label="An Indian Punjabi Restaurant - Experience in London"
            initial={{ opacity: 0, y: playIntro ? 18 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: playIntro ? 0.8 : 0.5, delay: playIntro ? 0.48 : 0.16, ease: 'easeOut' }}
          >
            <defs>
              <linearGradient id="heroTitleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f9e3b3" />
                <stop offset="50%" stopColor="#f2d7a1" />
                <stop offset="100%" stopColor="#e8c98d" />
              </linearGradient>
              <filter id="heroTitleGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="softGlow" />
                <feColorMatrix in="softGlow" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Line 1: An Indian Punjabi */}
            <motion.text
              x="0"
              y="70"
              fill="url(#heroTitleGradient)"
              stroke="#f7d89f"
              strokeWidth="0.8"
              filter="url(#heroTitleGlow)"
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: '56px',
                fontWeight: '700',
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
              }}
              initial={{
                strokeDasharray: 600,
                strokeDashoffset: 600,
                fill: 'rgba(246, 219, 164, 0)',
              }}
              animate={{
                strokeDashoffset: 0,
                fill: 'url(#heroTitleGradient)',
              }}
              transition={{
                duration: playIntro ? 1.4 : 0.9,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              An Indian Punjabi
            </motion.text>

            {/* Line 2: Restaurant */}
            <motion.text
              x="0"
              y="135"
              fill="url(#heroTitleGradient)"
              stroke="#f7d89f"
              strokeWidth="0.8"
              filter="url(#heroTitleGlow)"
              style={{
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontSize: '56px',
                fontWeight: '700',
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
              }}
              initial={{
                strokeDasharray: 400,
                strokeDashoffset: 400,
                fill: 'rgba(246, 219, 164, 0)',
              }}
              animate={{
                strokeDashoffset: 0,
                fill: 'url(#heroTitleGradient)',
              }}
              transition={{
                duration: playIntro ? 1.2 : 0.8,
                delay: playIntro ? 0.1 : 0.05,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              Restaurant
            </motion.text>

            {/* Line 3: Experience in London (Script) */}
            <motion.text
              x="0"
              y="210"
              fill="url(#heroTitleGradient)"
              stroke="#f7d89f"
              strokeWidth="0.9"
              filter="url(#heroTitleGlow)"
              style={{
                fontFamily: "'Palace Script MT', 'Brush Script MT', 'Segoe Script', cursive",
                fontSize: '48px',
                fontStyle: 'italic',
                letterSpacing: '-0.01em',
              }}
              initial={{
                strokeDasharray: 450,
                strokeDashoffset: 450,
                fill: 'rgba(246, 219, 164, 0)',
              }}
              animate={{
                strokeDashoffset: 0,
                fill: 'url(#heroTitleGradient)',
              }}
              transition={{
                duration: playIntro ? 1 : 0.7,
                delay: playIntro ? 0.2 : 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              Experience in London
            </motion.text>
          </motion.svg>
          <motion.p
            initial={{ opacity: 0, y: playIntro ? 16 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: playIntro ? 0.75 : 0.45, delay: playIntro ? 1.1 : 0.3, ease: 'easeOut' }}
            className="mt-6 max-w-[36rem] text-[clamp(14px,5vw,17px)] leading-relaxed text-[#e8d8bc] sm:mt-7 sm:text-[15px]"
          >
           Traditional flavours, Royal ambiance - A true taste of Punjab in the heart of London. Experience the rich heritage and vibrant culture of India with every bite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: playIntro ? 14 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: playIntro ? 0.6 : 0.35, delay: playIntro ? 1.03 : 0.28, ease: 'easeOut' }}
            className="mt-7 flex flex-col gap-3.5 sm:mt-8 sm:flex-row sm:flex-wrap"
          >
            <Link
              to="/menu"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#7a3e19] bg-[linear-gradient(90deg,#67130f,#7d1712)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#7b1913,#94221a)] sm:w-auto"
            >
              Order Online
            </Link>
            <Link
              to="/booking"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e6a4f] bg-[linear-gradient(90deg,#0f3328,#124437)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#134132,#1a5a47)] sm:w-auto"
            >
              Book Your Table <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: playIntro ? 18 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: playIntro ? 0.65 : 0.45, delay: playIntro ? 1.12 : 0.12, ease: 'easeOut' }}
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