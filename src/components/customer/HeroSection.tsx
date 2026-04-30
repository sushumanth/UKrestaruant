
import { ArrowRight, CalendarClock, Clock3, PhoneCall } from 'lucide-react';

import { Link } from 'react-router-dom';
import Lantern from '../ui/LanternAnimation';

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

const floatingFoodAccents = [
  { title: 'Proudly Non-Halal restaurant', top: '70%', left: '10%' },
  // { title: 'Clay Oven Craft', top: '41%', left: '71%' },
  // { title: 'Royal Plating', top: '60%', left: '67%' },
];

export const HeroSection = () => {
  return (
    <section
      className="relative overflow-hidden bg-[#140705] pt-16 sm:pt-20 lg:min-h-screen lg:pt-28">
      <div className="absolute inset-0">

        <div className="absolute inset-0 z-0 overflow-hidden">
  <img
    src="/london.webp"
    alt="London SKyline"
    className="absolute w-full h-full top-10 right-0 scale-[0.65] origin-top-right object-cover"
    draggable={false}
  />
</div>

<div className="absolute inset-0 z-10">
  <img
    src="/room-interior.webp"
    alt="Restaurant Interior"
    className="w-full h-full object-cover"
    draggable={false}
  />
</div>
        
        <Lantern
  className="top-0 right-[41%] w-[240px] h-[360px]"
  imgClassName="h-[300px]"
  heavyWind={true}
  topMask={{
    enabled: true,
    color: "0,0,0",

    width: 100,
    height: 260,

    fromOpacity: 0.95,
    midOpacity: 0.72,
    midPoint: "34%",
    fadeEnd: "82%",

    x: 0,
    y: 0,

    sideFadeStart: "24%",
    sideFadeEnd: "76%",
  }}
  glow={{
    enabled: true,
    color: "255,139,10",
    size: 100,
    blur: 22,
    opacity: 0.32,
    x: 0,
    y: 100,
  }}
/>

<Lantern
  className="top-[-15%] right-[-5%] w-[320px] h-[460px]"
  imgClassName="h-[420px]"
  heavyWind={false}
  topMask={{
    enabled: true,
    color: "0,0,0",

    width: 100,
    height: 400,

    fromOpacity: 1,
    midOpacity: 0.72,
    midPoint: "36%",
    fadeEnd: "76%",

    x: 0,
    y: 0,

    sideFadeStart: "24%",
    sideFadeEnd: "76%",
  }}
  glow={{
    enabled: true,
    color: "250,167,12",
    size: 180,
    blur: 50,
    opacity: 0.30,
    x: 0,
    y: 150,
  }}
/>

       <div className="pointer-events-none absolute inset-0 z-[15] hidden lg:block">
  {floatingFoodAccents.map((accent) => (
    <div
      key={accent.title}
      className="absolute group"
      style={{ top: accent.top, left: accent.left }}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-r from-[#cfa664]/30 via-[#f2d7a1]/40 to-[#cfa664]/30 rounded-xl" />

      {/* Badge */}
      <div className="relative px-5 py-3 bg-gradient-to-b from-[#2b1a10] via-[#1a0f08] to-[#120904] border border-[#cfa664]/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)] rounded-md overflow-hidden">
        
        {/* Gold Inner Border */}
        <div className="absolute inset-0 border border-[#f2d7a1]/20 rounded-md pointer-events-none" />

        {/* Shine Effect */}
        <div className="absolute top-0 left-[-100%] w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"/>

        {/* Text */}
        <span className="relative text-[11px] tracking-[0.2em] uppercase font-semibold text-[#f2d7a1]">
          {accent.title}
        </span>
      </div>
    </div>
  ))}
</div>
      </div>

      <div className="relative z-20 mx-auto max-w-7xl px-5 pb-8 sm:px-6 sm:pb-10 lg:px-8 lg:pb-44">
        <div className="max-w-[36rem]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d2aa64] sm:mb-3 sm:text-[11px] sm:tracking-[0.22em]">
            Authentic Punjabi Dining Experience
          </p>

          <div className="mb-3 inline-flex rounded-full border border-[#cfa664]/45 bg-[linear-gradient(120deg,rgba(24,13,8,0.78),rgba(12,8,5,0.66))] px-3.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#f2d7a1] shadow-[0_6px_16px_rgba(0,0,0,0.28)] sm:hidden">
            Proudly Non-Halal Restaurant
          </div>

          <svg
            viewBox="0 0 900 280"
            className="w-full max-w-2xl overflow-visible"
            preserveAspectRatio="xMinYMid meet"
            role="img"
            aria-label="An Indian Punjabi Restaurant - Experience in London"
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
            <text
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
            >
              An Indian Punjabi
            </text>

            {/* Line 2: Restaurant */}
            <text
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
            >
              Restaurant
            </text>

            {/* Line 3: Experience in London (Script) */}
            <text
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
            >
              Experience in London
            </text>
          </svg>
          <p className="mt-6 max-w-[36rem] text-[clamp(14px,5vw,17px)] leading-relaxed text-[#e8d8bc] sm:mt-7 sm:text-[15px]">
           Traditional flavours, Royal ambiance - A true taste of Punjab in the heart of London. Experience the rich heritage and vibrant culture of India with every bite.
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
        </div>
      </div>

      <div className="relative z-20 w-full border-y border-[#c7a86f] bg-[linear-gradient(90deg,#faefd7_0%,#f4e4bf_48%,#f9edd4_100%)] shadow-[0_-10px_20px_rgba(12,8,4,0.22)] lg:absolute lg:inset-x-0 lg:bottom-0">
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
      </div>
    </section>
  );
};