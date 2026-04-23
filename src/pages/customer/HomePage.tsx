import { motion } from 'framer-motion';
import { HeroSection } from '@/components/customer/HeroSection';
import { PremiumThemeSection } from '@/components/customer/PremiumThemeSection';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Mail, PhoneCall, Sparkles, Star } from 'lucide-react';

const popularTables = [
  {
    name: 'Chef Counter Prime',
    image: '/dining_room.jpg',
    seats: 2,
    vibe: 'Live culinary theatre',
    bookedInLastHour: 6,
  },
  {
    name: 'Window Romance Booth',
    image: '/dessert.jpg',
    seats: 2,
    vibe: 'Golden-hour skyline views',
    bookedInLastHour: 4,
  },
  {
    name: 'Celebration Family Table',
    image: '/chef_plating.jpg',
    seats: 6,
    vibe: 'Private side with soft ambience',
    bookedInLastHour: 5,
  },
];

const chefSpecials = [
  {
    title: 'Smoked Truffle Risotto',
    image: '/chef_plating.jpg',
    description: 'Aromatic porcini stock, shaved truffle and aged parmesan finish.',
  },
  {
    title: 'Fire-Roasted Sea Bass',
    image: '/dining_room.jpg',
    description: 'Citrus butter glaze with charred asparagus and saffron aioli.',
  },
  {
    title: 'Valrhona Velvet Dessert',
    image: '/dessert.jpg',
    description: 'Bittersweet mousse, caramelized hazelnut crumble, orange zest.',
  },
];

const customerMoments = ['/cocktail.jpg', '/dining_room.jpg', '/chef_plating.jpg', '/kitchen_team.jpg'];

const testimonials = [
  {
    quote: 'Booked in under 20 seconds and got a perfect table by the window.',
    name: 'Amelia R.',
  },
  {
    quote: 'The flow is seamless. It feels premium and confident from first tap to confirmation.',
    name: 'Daniel M.',
  },
  {
    quote: 'We reserved for six with zero waiting. Best booking experience in London.',
    name: 'Priya K.',
  },
];

export const HomePage = () => {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <div className="grain-overlay opacity-10" />

      <HeroSection />
  <PremiumThemeSection />

      <main className="relative z-10 pb-24">
        <section id="about-us" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-14 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-2xl border border-amber-200/60 p-6 sm:p-8 bg-gradient-to-r from-[#fff1d8] via-[#f8e8cb] to-[#efe1c5] shadow-lg"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="text-amber-500 text-xs font-bold tracking-[0.16em] uppercase">About Our Kitchen</span>
                <h2 className="mt-3 font-serif text-amber-950 text-[clamp(32px,4.5vw,56px)] leading-[0.95]">
                  Crafted Punjabi Dining For The UK
                </h2>
                <p className="mt-4 text-amber-900/80 text-base leading-relaxed max-w-2xl">
                  From slow-cooked curries to charcoal-grilled favourites, every dish is prepared with traditional methods and premium ingredients.
                  We blend timeless Punjabi hospitality with a polished London dining experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-amber-200/60 bg-white/70 p-4">
                  <p className="text-amber-900 text-sm font-semibold">Freshly Ground Spices</p>
                  <p className="mt-1 text-amber-800/75 text-sm">Daily masala prep for authentic depth and aroma.</p>
                </div>
                <div className="rounded-xl border border-amber-200/60 bg-white/70 p-4">
                  <p className="text-amber-900 text-sm font-semibold">Family-Style Sharing</p>
                  <p className="mt-1 text-amber-800/75 text-sm">Menus curated for couples, families, and celebrations.</p>
                </div>
                <div className="rounded-xl border border-amber-200/60 bg-white/70 p-4">
                  <p className="text-amber-900 text-sm font-semibold">Royal Ambiance</p>
                  <p className="mt-1 text-amber-800/75 text-sm">Elegant interiors inspired by classic Punjabi heritage.</p>
                </div>
                <div className="rounded-xl border border-amber-200/60 bg-white/70 p-4">
                  <p className="text-amber-900 text-sm font-semibold">Instant Reservations</p>
                  <p className="mt-1 text-amber-800/75 text-sm">Book your preferred slot online in seconds.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-2xl border border-amber-200/50 p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 shadow-lg"
          >
            <div className="flex items-center gap-2 text-amber-900">
              <Star className="text-amber-700" size={18} />
              <span className="text-lg sm:text-xl font-medium">4.8 rating | loved across London</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-amber-200 bg-white px-4 py-2 text-amber-800 text-sm font-medium">
              <Clock3 size={15} className="text-amber-700" />
              Average online booking completion: 9 seconds
            </div>
          </motion.div>
        </section>

        <section 
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
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20 py-16 relative overflow-hidden rounded-2xl border border-amber-200/50 shadow-lg" style={{ 
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
        </section>

        <section id="gallery" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-24 scroll-mt-24">
          <div className="mb-8 flex flex-wrap justify-between items-end gap-4">
            <div>
              <span className="text-amber-700 text-xs font-bold tracking-widest uppercase">Social proof</span>
              <h2 className="font-serif text-amber-900 text-4xl sm:text-5xl leading-tight mt-3">Customer Moments</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 font-medium">
              <Sparkles size={14} /> Trending this week
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {customerMoments.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="rounded-xl overflow-hidden shadow-lg border border-amber-200/30 hover:shadow-xl transition-shadow"
              >
                <img src={image} alt="Happy diners at Luxe Reserve" className="h-44 sm:h-56 w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-24">
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
        </section>

        <section id="contact" className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-2xl border border-amber-200/50 p-7 sm:p-10 text-center bg-gradient-to-r from-amber-50/80 via-yellow-50/80 to-amber-50/80 shadow-lg"
          >
            <h2 className="font-serif text-amber-900 text-[clamp(38px,5vw,68px)] leading-[0.9]">
              Hungry yet? Your perfect table is waiting.
            </h2>
            <p className="text-amber-700/70 mt-4 text-lg max-w-2xl mx-auto">
              Land, trust, and book in seconds. We handle the rest with instant confirmation.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-amber-800">
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
          </motion.div>
        </section>
      </main>
    </div>
  );
};
