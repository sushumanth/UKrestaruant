import { motion } from 'framer-motion';
import { ArrowRight, Bike, ChefHat, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type MenuItem = {
  name: string;
  description: string;
  price: string;
  tags?: string[];
};

type MenuCategory = {
  id: string;
  eyebrow: string;
  title: string;
  items: MenuItem[];
};

type PlatformInsight = {
  name: string;
  focus: 'Delivery' | 'Reservations';
  bestFor: string;
  strengths: string;
  watchouts: string;
};

const menuCategories: MenuCategory[] = [
  {
    id: 'starters',
    eyebrow: 'First Course',
    title: 'Starters',
    items: [
      {
        name: 'Seared Scallops',
        description: 'Cauliflower puree, smoked pancetta crumb, lemon oil.',
        price: '£14',
        tags: ['Signature', 'Seafood'],
      },
      {
        name: 'Truffle Burrata',
        description: 'Heirloom tomato, basil pearls, aged balsamic.',
        price: '£12',
        tags: ['Vegetarian'],
      },
      {
        name: 'Beef Tartare',
        description: 'Cured yolk, shallot, capers, sourdough crisps.',
        price: '£13',
        tags: ['Guest Favorite'],
      },
    ],
  },
  {
    id: 'mains',
    eyebrow: 'Chef Signature',
    title: 'Main Plates',
    items: [
      {
        name: 'Aged Ribeye 10oz',
        description: 'Charcoal grilled, cafe de Paris butter, rosemary jus.',
        price: '£32',
        tags: ['Popular'],
      },
      {
        name: 'Fire-Roasted Sea Bass',
        description: 'Saffron aioli, charred asparagus, citrus glaze.',
        price: '£27',
        tags: ['Seafood'],
      },
      {
        name: 'Wild Mushroom Risotto',
        description: 'Porcini stock, parmesan cloud, truffle finish.',
        price: '£22',
        tags: ['Vegetarian'],
      },
      {
        name: 'Heritage Lamb Cutlets',
        description: 'Pea puree, fondant potato, mint reduction.',
        price: '£29',
      },
    ],
  },
  {
    id: 'desserts',
    eyebrow: 'Finale',
    title: 'Desserts',
    items: [
      {
        name: 'Valrhona Velvet',
        description: 'Dark chocolate mousse, hazelnut praline crunch.',
        price: '£10',
      },
      {
        name: 'Vanilla Bean Creme Brulee',
        description: 'Torched sugar crust, berry compote.',
        price: '£9',
      },
      {
        name: 'Citrus Olive Oil Cake',
        description: 'Blood orange sorbet, candied peel.',
        price: '£9',
        tags: ['Light'],
      },
    ],
  },
  {
    id: 'drinks',
    eyebrow: 'Bar Program',
    title: 'Cocktails & Pairings',
    items: [
      {
        name: 'Midnight Manhattan',
        description: 'Rye, vermouth blend, black cherry smoke.',
        price: '£13',
      },
      {
        name: 'Saffron 75',
        description: 'Gin, saffron syrup, sparkling wine.',
        price: '£12',
      },
      {
        name: 'Sommelier Pairing Flight',
        description: 'Three wines matched to chef signatures.',
        price: '£24',
        tags: ['Recommended'],
      },
    ],
  },
];

const platformInsights: PlatformInsight[] = [
  {
    name: 'Deliveroo',
    focus: 'Delivery',
    bestFor: 'Premium city-center orders and evening demand spikes.',
    strengths: 'Strong urban coverage and high customer intent for restaurant-grade meals.',
    watchouts: 'Commission can be high. Margin control is essential on premium dishes.',
  },
  {
    name: 'Uber Eats',
    focus: 'Delivery',
    bestFor: 'Wide customer reach with strong app discovery and promotions.',
    strengths: 'Large user base and predictable conversion on featured placements.',
    watchouts: 'Heavy discounting pressure during promotional periods.',
  },
  {
    name: 'Just Eat',
    focus: 'Delivery',
    bestFor: 'Broader suburban coverage and takeaway-style repeat customers.',
    strengths: 'Good volume channel and strong brand familiarity in the UK.',
    watchouts: 'Can attract more price-sensitive demand than dine-in premium audiences.',
  },
  {
    name: 'OpenTable',
    focus: 'Reservations',
    bestFor: 'High-intent dine-in guests actively searching premium tables.',
    strengths: 'Strong reservation discovery with review-driven trust.',
    watchouts: 'Third-party booking ownership can reduce direct guest relationship.',
  },
  {
    name: 'ResDiary',
    focus: 'Reservations',
    bestFor: 'Fine-dining table management and configurable booking rules.',
    strengths: 'Operational controls for deposits, pacing and table turn windows.',
    watchouts: 'Requires careful setup and staff training to maximize value.',
  },
];

export const MenuPage = () => {
  return (
    <div className="min-h-screen pastel-luxe-bg pt-24 pb-20">
      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <section className="booking-shell px-6 py-10 sm:px-10 sm:py-12">
          <div className="max-w-3xl">
            <span className="pastel-eyebrow">Curated Selection</span>
            <h1 className="pastel-section-heading text-[clamp(40px,5.4vw,76px)] leading-[0.9] mt-3">
              Our Seasonal Menu
            </h1>
            <p className="pastel-copy text-lg mt-4 max-w-2xl">
              Crafted for elegant evenings. Fresh ingredients, chef-led technique, and balanced flavors across every course.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-[#D4DCE9]">
              <ChefHat size={15} className="text-[#D4AF37]" /> Freshly prepared daily
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.05)] px-4 py-2 text-sm text-[#D4DCE9]">
              <Sparkles size={15} className="text-[#D4AF37]" /> Vegetarian options in every section
            </span>
          </div>
        </section>

        <section className="mt-14 space-y-8">
          {menuCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: categoryIndex * 0.05 }}
              className="luxury-panel p-6 sm:p-8"
            >
              <span className="pastel-eyebrow">{category.eyebrow}</span>
              <h2 className="font-serif text-[40px] text-[#F4F6FA] leading-none mt-2 mb-5">{category.title}</h2>

              <div className="grid gap-4">
                {category.items.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] px-4 py-4 sm:px-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-3xl">
                        <h3 className="text-[#F4F6FA] text-xl font-semibold">{item.name}</h3>
                        <p className="text-[#B4BECE] text-sm mt-1 leading-relaxed">{item.description}</p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-xs text-[#E6D39A]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xl font-semibold text-[#D4AF37] min-w-[72px] text-right">{item.price}</div>
                    </div>
                  </article>
                ))}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="mt-14 luxury-panel p-6 sm:p-8" id="platform-analysis">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Bike size={18} className="text-[#D4AF37]" />
            <span className="pastel-eyebrow">Platform Analysis</span>
          </div>
          <h2 className="font-serif text-[40px] text-[#F4F6FA] leading-none mb-3">
            Existing Platforms and What They Provide
          </h2>
          <p className="text-[#B4BECE] max-w-3xl mb-6">
            Market scan for Manchester and UK premium-casual restaurants: delivery platforms maximize reach, while reservation platforms capture high-intent dine-in traffic.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {platformInsights.map((platform) => (
              <article
                key={platform.name}
                className="rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[#F4F6FA] text-xl font-semibold">{platform.name}</h3>
                  <span className="inline-flex rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-xs text-[#E6D39A]">
                    {platform.focus}
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <p className="text-[#D6DDEA]"><span className="text-[#E6D39A] font-medium">Best for:</span> {platform.bestFor}</p>
                  <p className="text-[#B4BECE]"><span className="text-[#E6D39A] font-medium">Strengths:</span> {platform.strengths}</p>
                  <p className="text-[#A5B0C3]"><span className="text-[#E6D39A] font-medium">Watchouts:</span> {platform.watchouts}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 rounded-2xl border border-[rgba(70,172,120,0.35)] bg-[rgba(70,172,120,0.1)] p-4 text-[#BFE8CE] text-sm">
            Recommended mix: Keep direct bookings on this website as your main channel, add OpenTable/ResDiary for reservation discovery,
            and use Deliveroo + Uber Eats for controlled delivery expansion.
          </div>
        </section>

        <section className="mt-14 text-center">
          <div className="luxury-panel p-7 sm:p-10">
            <h2 className="font-serif text-[clamp(34px,4.6vw,62px)] text-[#F4F6FA] leading-[0.9]">
              Ready to reserve your table?
            </h2>
            <p className="text-[#B4BECE] mt-4 text-lg max-w-2xl mx-auto">
              Choose your date, lock your table, and get instant confirmation.
            </p>
            <Link to="/book" className="btn-gold btn-gold-glow inline-flex items-center gap-2 mt-7">
              Book Now <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};