import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock3, Leaf, Minus, Plus, Search, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/mockData';
import { formatMenuRating, getVisibleMenuItems } from '@/menuUtils';
import { useMenuCartStore, useMenuStore } from '@/store';

export const MenuPage = () => {
  const { items, addItem, updateItemQuantity } = useMenuCartStore();
  const { menuItems, menuCategories } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const heroRef = useRef<HTMLElement | null>(null);
  const menuGridRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });


  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -26]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.72]);
  const categories = useMemo(
    () => Array.from(new Set([...menuCategories, ...menuItems.map((item) => item.category.trim()).filter(Boolean)])).sort((a, b) => a.localeCompare(b)),
    [menuCategories, menuItems]
  );

  const filteredItems = getVisibleMenuItems(menuItems, searchQuery, activeCategory);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const itemQuantityById = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {});

  

  return (
    <div className="min-h-screen bg-[#f8f0e1] pt-20 text-[#2d241b]">
      <div className="relative w-full">

        {/* ===== HERO (full width) ===== */}
        <section
          ref={heroRef}
          className="relative isolate -mt-2 w-full overflow-hidden rounded-none border-y border-[#e7d4b2] shadow-none"
        >
          <motion.img
            src="/Memus.png"
            alt="Menu hero"
            className="h-[36vh] w-full object-cover object-center bg-[#f4e6cf] sm:h-[46vh]"
            style={{ y: heroImageY, scale: heroImageScale }}
            loading="eager"
            draggable={false}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,10,5,0.28)_0%,rgba(18,10,5,0.36)_55%,rgba(18,10,5,0.5)_100%)]" />
          <motion.div
            className="absolute inset-0 flex items-center justify-center select-none"
            style={{ y: heroTextY, opacity: heroTextOpacity }}
          >
            <h1
              className="font-serif text-[clamp(52px,14vw,150px)] font-semibold uppercase tracking-[0.14em] text-[#f7e2bc]"
              style={{
                textShadow: '0 8px 24px rgba(0,0,0,0.5)',
                WebkitTextStroke: '1px rgba(255,225,168,0.52)',
              }}
            >
              MENU
            </h1>
          </motion.div>
        </section>

        {/* ===== CONTENT WRAPPER (centered) ===== */}
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-4 text-center text-sm text-[#6f5f4a] sm:text-base md:mt-6 lg:mt-8"
          >
            Scroll and explore signature dishes with a smooth, cinematic menu experience.
          </motion.p>

          {/* ===== FILTER (full width, sticky) ===== */}
          <section className="sticky top-16 z-20 mt-6 rounded-3xl border border-[#ead6b8] bg-[#fffaf1]/95 p-4 shadow-[0_10px_30px_rgba(83,50,17,0.08)] backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6d49]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search dishes.."
                  className="h-11 w-full rounded-xl border border-[#dcc9a4] bg-white pl-10 pr-4 text-sm text-[#2d241b] outline-none placeholder:text-[#9a8b75] focus:border-[#c26d37] focus:ring-2 focus:ring-[#c26d37]/20 md:h-12 md:pl-11 md:text-base"
                  aria-label='Search Menu Items'
                />
              </div>

              <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeCategory === 'all' ? 'bg-[#7d2419] text-[#fff3df]' : 'bg-[#f5ead7] text-[#6c583f]'
                  }`}
                >
                  All
                </button>
                <select
                  value={activeCategory === 'all' ? '' : activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value || 'all')}
                  className="rounded-full px-4 py-2 text-sm font-medium border border-[#dcc9a4] bg-white text-[#6c583f] outline-none focus:border-[#c26d37] focus:ring-2 focus:ring-[#c26d37]/20 cursor-pointer"
                  aria-label="Filter by category"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* ===== 🔥 SPLIT STARTS HERE (below filter) ===== */}
        <div className="mx-auto mt-6 flex w-full max-w-[1400px] items-start gap-8 px-5 sm:px-6 lg:px-10">

          {/* ===== LEFT: MENU GRID ===== */}
          <div className="flex-1 pb-16">
            <section ref={menuGridRef} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-2 xl:grid-cols-5">
              {filteredItems.map((item) => (
                <motion.article
                  key={item.id}
                  data-menu-card="true"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-sm hover:shadow-lg transition-shadow duration-200 min-h-[380px]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-44 object-cover rounded-t-xl"
                      loading="lazy"
                    />
                    {item.isVeg && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-emerald-700 shadow">
                        <Leaf size={12} />
                        Veg
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-semibold text-[#1f1a16] leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm text-[#6f5f4a] line-clamp-2 min-h-[44px]">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ec] px-2 py-1 text-xs text-[#7d6a57]">
                          <Star size={14} className="text-[#b9832f]" />
                          <span className="font-medium">{formatMenuRating(item.rating)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ec] px-2 py-1 text-xs text-[#7d6a57]">
                          <Clock3 size={14} />
                          <span>{item.prepTime} min</span>
                        </span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-sm">
                      <span className="text-lg font-bold text-[#7d2419]">{formatCurrency(item.price)}</span>

                      <div className="flex items-center gap-3 min-w-[120px] justify-end">
                        {itemQuantityById[item.id] ? (
                          <div className="inline-flex items-center rounded-lg bg-[#7d2419] text-white shadow-sm overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, itemQuantityById[item.id] - 1)}
                              className="px-3 py-2 hover:bg-[#942d21]"
                              aria-label={`Decrease quantity of ${item.name}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 text-sm font-bold">{itemQuantityById[item.id]}</span>
                            <button
                              type="button"
                              onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                              className="px-3 py-2 hover:bg-[#942d21]"
                              aria-label={`Increase quantity of ${item.name}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                            className="inline-flex items-center gap-2 rounded-md bg-[#7d2419] px-3 py-2 text-sm font-semibold text-white hover:bg-[#942d21]"
                          >
                            <Plus size={14} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </section>

            {filteredItems.length === 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-[#dbc9aa] bg-[#fff7ea] p-8 text-center text-[#6f5f4a]">
                No dishes match your search.
              </div>
            )}
          </div>

          {/* Right preview removed per request (order preview not needed on menu page) */}
        </div>

        {/* ===== Bottom cart bar for small/medium screens ===== */}
        {cartCount > 0 && (
          <div className="fixed left-5 right-6 bottom-6 z-50 flex justify-center px-4 lg:px-10">
            <div className="w-full max-w-[500px] rounded-xl bg-[#7d2419] px-5 py-4 text-white shadow-lg flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-medium uppercase opacity-90">Cart</div>
                <div className="mt-1 text-sm font-semibold">
                  {cartCount} item{cartCount === 1 ? '' : 's'} · {formatCurrency(cartTotal)}
                </div>
              </div>

              <Link to="/cart" className="inline-flex items-center gap-2 rounded-full bg-[#fff3df] px-4 py-2 text-sm font-semibold text-[#7d2419]">
                <ShoppingBag size={16} /> View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

