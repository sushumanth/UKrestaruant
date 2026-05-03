import { motion } from 'framer-motion';
import { CalendarDays, Crown, Soup, Truck, Wheat } from 'lucide-react';
import { Link } from 'react-router-dom';

const experiencePoints = [
  { icon: Soup, title: 'Soup Bowl', subtitle: 'Authentic Traditional Recipes' },
  { icon: Wheat, title: 'Wheat Stalk', subtitle: 'Fresh & Premium Ingredients' },
  { icon: Crown, title: 'Royal Crown', subtitle: 'Royal Ambience & Hospitality' },
  { icon: Truck, title: 'Delivery Van', subtitle: 'Takeaway & Delivery' },
  { icon: CalendarDays, title: 'Calendar', subtitle: 'Bookings Available' },
];

export const RoyalExperienceSection = () => {
  return (
    <section className="relative w-full">
      {/* Top Section: Text & Image Split */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid min-h-[62vh] w-full lg:min-h-[68vh] lg:grid-cols-[3.5fr_6.5fr]"
      >
        {/* Left Panel: Text Content (Dark Green) */}
        <div className="relative flex min-h-[44vh] flex-col justify-center overflow-hidden bg-[linear-gradient(180deg,#0a1c14_0%,#06110c_100%)] px-8 py-10 sm:px-10 sm:py-12 md:px-14 lg:min-h-[68vh] lg:pr-12">
          {/* Subtle Decorative Mandala/Floral Glow */}
          <div className="absolute left-0 top-0 h-[500px] w-[500px] bg-[radial-gradient(circle_at_top_left,rgba(214,181,107,0.15),transparent_60%)]" />
          <div className="absolute bottom-0 right-0 hidden w-32 bg-gradient-to-r from-transparent to-[#0a1c14] lg:block" />

          <div className="relative z-10 w-full max-w-[500px]">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d6b56b]"
            >
              Royal Dining Story
            </motion.p>

            {/* Motion Perfect SVG Text */}
            <svg 
              viewBox="0 0 450 250" 
              className="relative z-10 w-full max-w-[420px] overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
              preserveAspectRatio="xMinYMin meet"
            >
              <motion.text
                x="0" y="45"
                className="font-serif text-[46px]"
                initial={{ strokeDasharray: 300, strokeDashoffset: 300, fill: "rgba(214,181,107,0)" }}
                whileInView={{ strokeDashoffset: 0, fill: "rgba(214,181,107,1)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                stroke="#d6b56b" strokeWidth="0.75"
              >
                A Royal
              </motion.text>
              <motion.text
                x="0" y="105"
                className="font-serif text-[46px]"
                initial={{ strokeDasharray: 300, strokeDashoffset: 300, fill: "rgba(214,181,107,0)" }}
                whileInView={{ strokeDashoffset: 0, fill: "rgba(214,181,107,1)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                stroke="#d6b56b" strokeWidth="0.75"
              >
                Experience
              </motion.text>
              <motion.text
                x="0" y="165"
                className="font-serif text-[46px]"
                initial={{ strokeDasharray: 300, strokeDashoffset: 300, fill: "rgba(214,181,107,0)" }}
                whileInView={{ strokeDashoffset: 0, fill: "rgba(214,181,107,1)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                stroke="#d6b56b" strokeWidth="0.75"
              >
                Rooted in
              </motion.text>
              <motion.text
                x="0" y="225"
                className="font-serif text-[46px]"
                initial={{ strokeDasharray: 300, strokeDashoffset: 300, fill: "rgba(214,181,107,0)" }}
                whileInView={{ strokeDashoffset: 0, fill: "rgba(214,181,107,1)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                stroke="#d6b56b" strokeWidth="0.75"
              >
                Tradition
              </motion.text>
            </svg>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.8, ease: 'easeOut' }}
              className="mt-1 text-[14px] leading-relaxed text-[#c4bba8] sm:text-[15px]"
            >
              At Singh&apos;s Dining by Rangrez, we bring the rich essence of Punjab with an elegant London touch, where every dish is crafted with care and passion.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <Link
                to="/about"
                className="mt-7 inline-flex w-fit rounded-full border border-[#d6b56b] bg-transparent px-7 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#d6b56b] transition-all hover:bg-[#d6b56b] hover:text-[#0a1c14]"
              >
                Read Our Story
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Panel: Expanded Image (Approx 65-70%) */}
        <div className="relative min-h-[44vh] w-full lg:min-h-[68vh]">
          <img
            src="/imaginbtmhome.png"
            alt="Royal restaurant interior"
            className="h-full w-full object-cover object-[center_60%]"
            loading="lazy"
          />
          {/* Subtle vignette/fade to blend with the dark edges */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,28,20,0.6)_0%,rgba(0,0,0,0.1)_20%,rgba(0,0,0,0.3)_100%)]" />
        </div>
      </motion.div>

      {/* Bottom Feature Bar (Burgundy) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full border-t border-[#6b251e] bg-[linear-gradient(180deg,#3e0c0a_0%,#2a0806_100%)] px-1 py-2 sm:px-3 lg:px-2"
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-0">
          {experiencePoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="flex flex-col items-center text-center">
                <Icon size={28} strokeWidth={1.2} className="mb-2 text-[#d6b56b]" />
                {/* Elegant Cursive Title */}
                <h4 className="mb-1 font-serif text-[clamp(22px,1.8vw,34px)] italic tracking-wide text-[#e8ca95]">
                  {point.title}
                </h4>
                {/* Uppercase Subtitle */}
                <p className="text-[9px] font-bold uppercase leading-[1.3] tracking-[0.13em] text-[#bda77b]">
                  {point.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};