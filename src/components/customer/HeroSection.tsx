import { ArrowRight, CalendarClock, Clock3, PhoneCall } from 'lucide-react';

import { Link } from 'react-router-dom';
import Lantern from '../ui/LanternAnimation';
import { useRef } from 'react';

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

  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-[#140705]">
      <div className="absolute inset-0 select-none">
        <div className='relative h-full w-full overflow-hidden'>
         
<div className="absolute inset-0 z-0 overflow-hidden">
  <video
    ref={videoRef}
    className="absolute inset-0 h-full w-full object-cover lg:top-10 lg:right-0 lg:scale-[0.65] lg:origin-top-right lg:object-center"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    poster='/london.webp'
    onLoadedData={() => {
      if (videoRef.current) {
        videoRef.current.playbackRate = 1;
      }
    }}
  >
    <source src="/london_vid.webm" type="video/webm" />
    <source src="/london_vid.mp4" type="video/mp4" />
  </video>
</div>

{/* LAYER 6: Steam (Over Food) */}
{/* <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 z-20 w-[60%] max-w-xl no-select">
  <img
    src="steam.webp"
    alt="Steam"
    className="w-full h-auto opacity-80"
    draggable={false}
  />
</div> */}
          {/* London background 
        <div className="absolute inset-0 z-0 overflow-hidden">
  <img
    src="/london.webp"
    alt="London Skyline"
    className="absolute inset-0 w-full h-full object-cover lg:top-10 lg:right-0 lg:scale-[0.65] lg:origin-top-right lg:object-center"
    draggable={false}
  />
</div>
{/* ROOM INTERIOR */}
<div className="absolute inset-0 z-10">
  <img
    src="/room-interior.webp"
    alt="Restaurant Interior"
    className="no-select w-full h-full object-cover lg:object-center object-[40%_center] sm:object-[60%_center]"
    loading="lazy"
    draggable={false}
  />
</div>
        
<Lantern
  className="lg:flex justify-center items-start w-[200px] sm:w-[210px] md:w-[230px] lg:w-[240px] left-[85%] -translate-x-1/2 sm:left-[52%] md:left-[53%] lg:right-[41%]" //lg:flex justify-center items-start top-0 left-[85%] -translate-x-1/2 w-[200px] h-[300px] sm:-top-[15%] sm:left-[52%] sm:w-[210px] sm:h-[315px] md:top-[-10%] md:left-[53%] md:w-[230px] md:h-[345px] lg:top-0 lg:left-auto lg:right-[41%] lg:translate-x-0 lg:w-[240px] lg:h-[360px] 
  imgClassName="h-[250px] sm:h-[260px] md:h-[275px] lg:h-[300px] "
  heavyWind={true}
  topMask={{
    enabled: true,
    color: "0,0,0",

    width: 70,
    height: 200,

    fromOpacity: 1,
    midOpacity: 0.72,
    midPoint: "50%",
    fadeEnd: "85%",

    x: 0,
    y: 0,

    sideFadeStart: "24%",
    sideFadeEnd: "76%",
  }}
  glow={{
    enabled: true,
    color: "255,139,10",
    size: 90,
    blur: 18,
    opacity: 0.30,
    x: 0,
    y: 100,
  }}
/>

<Lantern
  className="hidden lg:flex justify-center items-start top-[-15%] right-[-5%] w-[320px] h-[460px]"
  imgClassName="h-[420px]"
  heavyWind={false}
  topMask={{
    enabled: true,
    color: "0,0,0",

    width: 100,
    height: 400,

    fromOpacity: 1,
    midOpacity: 0.72,
    midPoint: "45%",
    fadeEnd: "70%",

    x: 0,
    y: 15,

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
</div>
</div>
 {/* context */}
       <div className="relative z-20 mx-auto flex flex-col min-h-[100svh] w-full items-start justify-end px-5 pb-[140px] pt-24 md:px-6 md:pb-[160px] lg:justify-center lg:pl-8 xl:pl-16">
         <div className="w-full max-w-[19rem] sm:max-w-[22rem] md:max-w-[34rem] lg:max-w-[48rem] xl:max-w-[56rem]">
          <svg
            viewBox="0 0 850 120"
            className="block w-full overflow-visible select-none" 
            preserveAspectRatio="xMinYMid meet"
            role="img"
            aria-label="An Indian Restaurant - Experience in London"
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
              y="20"
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
              An Indian Restaurant
            </text>

            {/* Line 3: Experience in London (Script) */}
            <text
              x="0"
              y="90"
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
          <p className="max-w-[18rem] text-[13px] leading-relaxed text-[#e8d8bc] md:max-w-[22rem] md:text-[14px] lg:max-w-[34rem] lg:text-[17px]"> {/* mt-1 max-w-[18rem] text-[13px] leading-relaxed text-[#e8d8bc] sm:max-w-[22rem] sm:text-[14px] lg:max-w-[34rem] lg:text-[17px] */}
           Traditional flavours, Royal ambiance - A true taste of Punjab in the heart of London. Experience the rich heritage and vibrant culture of India with every bite.
          </p>

          <div className="mt-3 mb-3 inline-flex rounded-full border border-[#cfa664]/45 bg-[linear-gradient(120deg,rgba(24,13,8,0.78),rgba(12,8,5,0.66))] px-3.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#f2d7a1] shadow-[0_6px_16px_rgba(0,0,0,0.28)] md:hidden">
            Proudly Non-Halal Restaurant
          </div>

          <div className="mt-1 flex flex-col items-start gap-3 md:flex-row px-1 md:px-1 md:mt-0 lg:mt-5 select-none"> 
            <Link
              to="/order"
              className="gap-2 rounded-xl border border-[#7a3e19] bg-[linear-gradient(90deg,#67130f,#7d1712)] px-4 py-2.5 md:px-4 md:py-3 lg:px-6 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#7b1913,#94221a)] md:w-auto"
            >
              Order Online
            </Link>
            <Link
              to="/booking"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e6a4f] bg-[linear-gradient(90deg,#0f3328,#124437)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#134132,#1a5a47)] sm:w-auto"
            >
              Book Your Table <ArrowRight size={16} />
            </Link>
          </div>

<div className="mt-8 hidden lg:inline-flex rounded-full select-none border border-[#f2d7a1]/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2d7a1] shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-md">
            Proudly Non-Halal Restaurant
          </div>
        </div>
      </div>

      <div className="no-select absolute inset-x-2 bottom-[1px] z-30 sm:inset-x-3 lg:inset-x-6 mb-0 sm:mb-1 md:mb-2 lg:mb-3">
        <div className="mx-auto max-w-7xl rounded-[22px] border border-[#f2d7a1]/15 bg-[linear-gradient(135deg,rgba(18,10,7,0.58),rgba(60,39,22,0.24))] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="grid grid-cols-3 gap-x-1 gap-y-1 px-1 py-1 sm:grid-cols-3 sm:px-1 sm:py-1 lg:grid-cols-5 lg:gap-2 lg:px-5 lg:py-4">
            {operatingHighlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={`${item.title}-${item.subtitle}`}
                  className={`
                    flex items-center gap-2.5 rounded-xl px-1 py-1.5
                    ${index === 4 ? 'col-span-2 sm:col-span-1' : ''}
                    ${index !== 4 ? 'lg:border-r lg:border-[#f2d7a1]/10' : ''}
                    lg:px-3
                  `}
                  draggable={false}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#f2d7a1]/20 bg-white/10 text-[#f2d7a1] backdrop-blur-md sm:h-9 sm:w-9">
                    <Icon size={15} />
                  </span>

                  <div>
                    <p className="text-[11px] font-semibold leading-tight text-white/90 sm:text-[12px] lg:text-[15px]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-[0.08em] text-[#f2d7a1]/80 sm:text-[10px] lg:text-[11px]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};