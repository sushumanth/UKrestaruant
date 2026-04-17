import { motion } from 'framer-motion';
import { HeroSection } from '@/components/customer/HeroSection';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Sparkles, Star } from 'lucide-react';

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
    quote: 'We reserved for six with zero waiting. Best booking experience in Manchester.',
    name: 'Priya K.',
  },
];

export const HomePage = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="grain-overlay" />

      <HeroSection />

      <main className="relative z-10 pb-24">
        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="luxury-panel p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-[#E1E6EF]">
              <Star className="text-[#D4AF37]" size={18} />
              <span className="text-lg sm:text-xl">4.8 rating | 1200+ happy diners</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[#D7DEE8] text-sm">
              <Clock3 size={15} className="text-[#D4AF37]" />
              Average booking completion: 9 seconds
            </div>
          </motion.div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-16" id="popular-tables">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
            <div>
              <span className="pastel-eyebrow">Tonight is filling fast</span>
              <h2 className="pastel-section-heading mt-2">Today&apos;s Popular Tables</h2>
            </div>
            <Link to="/book" className="btn-gold-outline inline-flex items-center gap-2">
              Book now <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {popularTables.map((table, index) => (
              <motion.article
                key={table.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="glass-card overflow-hidden"
              >
                <img src={table.image} alt={table.name} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-serif text-3xl text-[#F4F6FA] leading-none">{table.name}</h3>
                  <p className="text-[#B7C0D0] text-sm mt-2">{table.vibe}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-[#E8D8A2]">Seats {table.seats}</span>
                    <span className="text-[#E4B28A]">{table.bookedInLastHour} booked this hour</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20" id="specials">
          <div className="mb-7">
            <span className="pastel-eyebrow">Freshly curated</span>
            <h2 className="pastel-section-heading mt-2">Chef&apos;s Specials</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {chefSpecials.map((special, index) => (
              <motion.article
                key={special.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="luxury-panel overflow-hidden"
              >
                <img src={special.image} alt={special.title} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-serif text-3xl text-[#F4F6FA] leading-none">{special.title}</h3>
                  <p className="text-[#B7C0D0] text-sm mt-2 leading-relaxed">{special.description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20">
          <div className="mb-7 flex flex-wrap justify-between items-end gap-4">
            <div>
              <span className="pastel-eyebrow">Social proof</span>
              <h2 className="pastel-section-heading mt-2">Customer Moments</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm text-[#B6C0D2]">
              <Sparkles size={14} /> Trending this week
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {customerMoments.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="glass-card overflow-hidden"
              >
                <img src={image} alt="Happy diners at Luxe Reserve" className="h-44 sm:h-56 w-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20">
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={testimonial.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="glass-card p-5"
              >
                <p className="text-[#F4F6FA] leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                <footer className="mt-4 text-[#D4AF37] text-sm">{testimonial.name}</footer>
              </motion.blockquote>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="luxury-panel p-7 sm:p-10 text-center"
          >
            <h2 className="font-serif text-[clamp(38px,5vw,68px)] text-[#F4F6FA] leading-[0.9]">
              Hungry yet? Your perfect table is waiting.
            </h2>
            <p className="text-[#A9B1BE] mt-4 text-lg max-w-2xl mx-auto">
              Land, trust, and book in seconds. We handle the rest with instant confirmation.
            </p>
            <Link to="/book" className="btn-gold btn-gold-glow inline-flex items-center gap-2 mt-7">
              Book Now <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      </main>
    </div>
  );
};
