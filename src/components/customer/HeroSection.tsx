import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Clock3, PhoneCall } from 'lucide-react';
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
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#140705] pt-24 lg:pt-28">
      <div className="absolute inset-0">
        <img
          src="/homepa1.png"
          alt="Authentic Punjabi dining in London"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(21,7,4,0.9)_0%,rgba(25,10,6,0.66)_46%,rgba(21,7,4,0.35)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,0,0,0.22),transparent_52%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 pb-60 sm:pb-52 lg:pb-44">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="max-w-[36rem]"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#d2aa64]">
            Authentic Punjabi Dining Experience
          </p>
          <h1 className="font-serif text-[clamp(40px,6.2vw,78px)] leading-[0.93] tracking-[0.01em] text-[#f6dba4] drop-shadow-[0_8px_24px_rgba(0,0,0,0.48)]">
            in London
          </h1>
          <p className="mt-5 max-w-[32rem] text-[clamp(15px,1.7vw,21px)] leading-relaxed text-[#f3e4c2]">
            Traditional flavours, royal ambiance, and effortless table booking for your UK guests.
          </p>

          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7a3e19] bg-[linear-gradient(90deg,#67130f,#7d1712)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#7b1913,#94221a)]"
            >
              Order Online
            </Link>
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1e6a4f] bg-[linear-gradient(90deg,#0f3328,#124437)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8dfab] transition-colors hover:bg-[linear-gradient(90deg,#134132,#1a5a47)]"
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
        className="absolute inset-x-0 bottom-0 z-20 w-full border-y border-[#c7a86f] bg-[linear-gradient(90deg,#faefd7_0%,#f4e4bf_48%,#f9edd4_100%)] shadow-[0_-10px_20px_rgba(12,8,4,0.22)]"
      >
        <div className="mx-auto grid max-w-7xl gap-1 px-3 py-3 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-4">
          {operatingHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.title}-${item.subtitle}`}
                className="flex items-center gap-3 border-[#d7be90] px-2 py-2 lg:border-r last:lg:border-r-0"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#9f7e44] text-[#6a4e20] bg-[#f9edd6]">
                  <Icon size={17} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#2f2415] sm:text-base">{item.title}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#654d27]">{item.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
