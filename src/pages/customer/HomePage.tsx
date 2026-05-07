import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '@/components/customer/HeroSection';
import { AboutJourneySection } from '@/components/customer/AboutJourneySection';
import { PremiumThemeSection } from '@/components/customer/PremiumThemeSection';
import { RoyalExperienceSection } from '@/components/customer/RoyalExperienceSection';
import { GallerySection } from '@/components/customer/GallerySection';
import { AnimatedFoodDoodle } from '@/components/customer/AnimatedFoodDoodle';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, PhoneCall } from 'lucide-react';

const kitchenHighlights = [
  {
    title: 'Freshly Ground Spices',
    description: 'Daily masala prep for authentic depth and aroma.',
    image: '/FreshlyGround.png',
  },
  {
    title: 'Family-Style Sharing',
    description: 'Menus curated for couples, families, and celebrations.',
    image: '/Family-StyleSharing.png',
  },
  {
    title: 'Royal Ambiance',
    description: 'Elegant interiors inspired by classic heritage and tradition.',
    image: '/RoyalAmbiance.png',
  },
  {
    title: 'Instant Reservations',
    description: 'Book your preferred slot online in seconds.',
    image: '/InstantReservations.png',
  },
];

// const testimonials = [
//   {
//     quote: 'Booked in under 20 seconds and got a perfect table by the window.',
//     name: 'Amelia R.',
//   },
//   {
//     quote: 'The flow is seamless. It feels premium and confident from first tap to confirmation.',
//     name: 'Daniel M.',
//   },
//   {
//     quote: 'We reserved for six with zero waiting. Best booking experience in London.',
//     name: 'Priya K.',
//   },
// ];

export const HomePage = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const targetId = hash.replace('#', '');
    const target = document.getElementById(targetId);
    if (!target) return;

    const scrollToTarget = () => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTarget);
    });
  }, [hash]);


  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <div className="grain-overlay opacity-10" />

      <HeroSection />
      <PremiumThemeSection />
      <RoyalExperienceSection />

      <main className="relative z-10 pb-24">
        <section
          id="about-us"
          className="relative mt-0 min-h-screen w-full overflow-hidden scroll-mt-24"
          style={{
            backgroundImage: `
              linear-gradient(
                135deg,
                rgba(250, 242, 225, 0.65) 0%,
                rgba(248, 235, 205, 0.55) 35%,
                rgba(240, 220, 180, 0.45) 65%,
                rgba(236, 216, 178, 0.35) 100%
              ),
              url('/bgimage.png')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.35),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(173,129,56,0.14),transparent_24%)]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="relative z-10 flex min-h-screen w-full flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 xl:px-24"
          >
            <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
              <div className="max-w-3xl">
                <span className="text-[#8c5735] text-[11px] font-bold tracking-[0.2em] uppercase">About Our Kitchen</span>
                
                {/* Motion Perfect SVG Text replacing standard h2 */}
                <svg
                  viewBox="0 0 700 280"
                  className="relative z-10 w-full mt-5 overflow-visible drop-shadow-[0_2px_12px_rgba(74,37,17,0.15)]"
                  preserveAspectRatio="xMinYMin meet"
                >
                  <motion.text
                    x="0" y="80"
                    className="font-serif text-[85px] font-bold tracking-tight"
                    initial={{ strokeDasharray: 400, strokeDashoffset: 400, fill: "rgba(74,37,17,0)" }}
                    whileInView={{ strokeDashoffset: 0, fill: "rgba(74,37,17,1)" }} // Rich Mahogany color
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    stroke="#4a2511" strokeWidth="1"
                  >
                    Crafted Royal
                  </motion.text>
                  <motion.text
                    x="0" y="175"
                    className="font-serif text-[85px] font-bold tracking-tight"
                    initial={{ strokeDasharray: 400, strokeDashoffset: 400, fill: "rgba(74,37,17,0)" }}
                    whileInView={{ strokeDashoffset: 0, fill: "rgba(74,37,17,1)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.25 }}
                    stroke="#4a2511" strokeWidth="1"
                  >
                    Dining For The
                  </motion.text>
                  <motion.text
                    x="0" y="270"
                    className="font-serif text-[85px] font-bold tracking-tight"
                    initial={{ strokeDasharray: 400, strokeDashoffset: 400, fill: "rgba(74,37,17,0)" }}
                    whileInView={{ strokeDashoffset: 0, fill: "rgba(74,37,17,1)" }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    stroke="#4a2511" strokeWidth="1"
                  >
                    UK
                  </motion.text>
                </svg>

                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="mt-6 max-w-2xl text-[#6b4c3a] text-[clamp(16px,1.7vw,20px)] leading-relaxed font-medium"
                >
                  From slow-cooked curries to charcoal-grilled favourites, every dish is prepared with traditional methods and premium ingredients. We blend timeless hospitality with a polished London dining experience.
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 rounded-full bg-[#7a1d14] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#f8e4b7] shadow-lg shadow-[#7a1d14]/20 transition-colors hover:bg-[#8d2419]"
                  >
                    Explore Menu
                  </Link>
                  <Link
                    to="/book"
                    className="inline-flex items-center gap-2 rounded-full border border-[#9f7c42] bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#4a2511] transition-colors hover:bg-[#fff7e8]"
                  >
                    Reserve Now <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {kitchenHighlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: 0.02 + index * 0.06 }}
                    className="group relative min-h-[190px] overflow-hidden rounded-[24px] border border-amber-200/65 shadow-[0_16px_40px_rgba(112,76,30,0.14)]"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(51,24,12,0.18)_0%,rgba(58,27,13,0.34)_42%,rgba(42,19,9,0.76)_100%)]" />

                    <div className="relative z-10 flex h-full flex-col justify-end p-5">
                      <p className="text-[22px] font-serif leading-tight text-[#f8e8c6]">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#f2ddba]">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <AboutJourneySection />

        {/* <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 -mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="flex flex-wrap items-center justify-between gap-4 bg-[linear-gradient(90deg,rgba(255,248,233,0.96)_0%,rgba(244,226,190,0.96)_100%)] px-6 py-5 shadow-[0_18px_36px_rgba(99,67,25,0.12)]"
          >
            <div className="flex items-center gap-2 text-amber-900">
              <Star className="text-amber-700" size={18} />
              <span className="text-lg sm:text-xl font-medium">4.8 rating | loved across London</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/80 px-4 py-2 text-amber-800 text-sm font-medium">
              <Clock3 size={15} className="text-amber-700" />
              Average online booking completion: 9 seconds
            </div>
          </motion.div>
        </section> */}

        {/* <section 
          className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-16 py-16 relative overflow-hidden rounded-2xl border border-amber-200/50 shadow-lg" 
          id="popular-tables" 
          style={{ 
            backgroundImage: `
              linear-gradient(135deg, rgba(40, 42, 60, 0.75) 0%, rgba(80, 60, 50, 0.65) 100%),
              url('/popular-tables.png')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-amber-700 text-xs font-bold tracking-widest uppercase">Tonight is filling fast</span>
              <h2 className="font-serif text-amber-900 text-4xl sm:text-5xl leading-tight mt-2">Today&apos;s Popular Tables</h2>
            </div>
            <Link to="/book" className="inline-flex items-center gap-2 px-6 py-2 border-2 border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white font-semibold rounded-full transition-all">
              Book now <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-6">
            {popularTables.map((table, index) => (
              <motion.article
                key={table.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl overflow-hidden shadow-lg bg-rose-100 border border-amber-200/50 hover:shadow-xl transition-shadow"
              >
                <img src={table.image} alt={table.name} className="h-52 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-amber-900 text-2xl leading-none">{table.name}</h3>
                  <p className="text-amber-700/70 text-sm mt-2">{table.vibe}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-amber-700 font-medium">Seats {table.seats}</span>
                    <span className="text-amber-600 font-semibold">{table.bookedInLastHour} booked this hour</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section> */}

        {/* <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20 py-16 relative overflow-hidden rounded-2xl border border-amber-200/50 shadow-lg" style={{ 
          background: `
            linear-gradient(135deg, rgba(232, 228, 223, 0.30) 0%, rgba(245, 241, 237, 0.35) 100%),
            url('/homepage2.png')
          `,
          backgroundSize: 'auto, cover',
          backgroundPosition: 'center, center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat, no-repeat',
        }}>
          <div className="relative z-10 mb-8 flex flex-wrap justify-between items-end gap-4">
            <div>
              <span className="text-amber-700 text-xs font-bold tracking-widest uppercase">Freshly curated</span>
              <h2 className="font-serif text-amber-900 text-4xl sm:text-5xl leading-tight mt-3">Chef&apos;s Specials</h2>
            </div>
          </div>

          <div className="relative z-10 grid md:grid-cols-3 gap-6">
            {chefSpecials.map((special, index) => (
              <motion.article
                key={special.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-2xl overflow-hidden shadow-lg bg-white border border-amber-200/50 hover:shadow-xl transition-shadow"
              >
                <img src={special.image} alt={special.title} className="h-52 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-serif text-amber-900 text-2xl leading-none">{special.title}</h3>
                  <p className="text-amber-700/70 text-sm mt-2 leading-relaxed">{special.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section> */}

        {/* <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-24">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={testimonial.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="rounded-xl border border-amber-200/50 p-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/80 shadow-lg"
              >
                <p className="text-amber-900 leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <footer className="mt-4 text-amber-700 font-semibold text-sm">{testimonial.name}</footer>
              </motion.blockquote>
            ))}
          </div>
        </section> */}

        <GallerySection />

        <section id="contact" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-2xl border border-amber-200/60 p-6 sm:p-8 lg:p-10 bg-[linear-gradient(135deg,rgba(255,251,240,0.92)_0%,rgba(245,227,187,0.86)_50%,rgba(255,243,217,0.95)_100%)] shadow-[0_26px_60px_rgba(94,62,18,0.16)]"
          >
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
              <div className="text-center lg:text-left">
                <span className="text-[#8c5735] text-xs font-bold tracking-[0.2em] uppercase">Hand-drawn vibe</span>
                <h2 className="mt-3 font-serif text-amber-900 text-[clamp(38px,5vw,68px)] leading-[0.9]">
                  Hungry yet? Your perfect table is waiting.
                </h2>
                {/* <p className="text-amber-700/80 mt-4 text-lg max-w-2xl lg:max-w-xl lg:mx-0 mx-auto">
                  Inspired by your chalkboard artwork, this section now uses an SVG doodle with draw-in lines, floating icons, and subtle glow interactions.
                </p> */}
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-amber-800">
                  <a href="tel:+447424911245" className="inline-flex items-center gap-2 font-medium hover:text-amber-900 transition-colors">
                    <PhoneCall size={16} /> +44 7424 911245
                  </a>
                  <a href="mailto:hello@luxereserve.co" className="inline-flex items-center gap-2 font-medium hover:text-amber-900 transition-colors">
                    <Mail size={16} /> hello@luxereserve.co
                  </a>
                </div>
                <Link to="/book" className="inline-flex items-center gap-2 mt-7 px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-full transition-all shadow-lg">
                  Book Now <ArrowRight size={18} />
                </Link>
              </div>

              <AnimatedFoodDoodle className="mx-auto w-full max-w-[640px] lg:max-w-none" />
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};