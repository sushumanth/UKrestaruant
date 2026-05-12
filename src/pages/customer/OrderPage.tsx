import { motion, useScroll, useTransform } from 'framer-motion';
import { Leaf, Minus, Plus, Search, ShoppingBag } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/mockData';
import { getVisibleMenuItems } from '@/lib/menuUtils';
import { useMenuCartStore, useMenuStore } from '@/store';

export const OrderPage = () => {
  const { items, addItem, updateItemQuantity } = useMenuCartStore();
  const { menuItems, menuCategories } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const heroRef = useRef<HTMLElement | null>(null);

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
      <div className="w-full pb-16">
        <section
          ref={heroRef}
          className="relative isolate -mt-2 w-full overflow-hidden rounded-none border-y border-[#e7d4b2] shadow-none"
        >
          <motion.img
            src="/Memus.png"
            alt="Order online"
            className="h-[36vh] w-full object-cover object-center sm:h-[46vh]"
            style={{ y: heroImageY, scale: heroImageScale }}
            loading="eager"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,10,5,0.28)_0%,rgba(18,10,5,0.36)_55%,rgba(18,10,5,0.5)_100%)]" />

          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ y: heroTextY, opacity: heroTextOpacity }}
          >
            <h1
              className="font-serif text-[clamp(52px,14vw,150px)] font-semibold uppercase tracking-[0.14em] text-[#f7e2bc]"
              style={{
                textShadow: '0 8px 24px rgba(0,0,0,0.5)',
                WebkitTextStroke: '1px rgba(255,225,168,0.52)',
              }}
            >
              ORDER ONLINE
            </h1>
          </motion.div>
        </section>

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-4 max-w-3xl text-sm text-[#6f5f4a] sm:text-base"
          >
            Browse and order your favorite dishes for delivery right to your door.
          </motion.p>

          <section className="sticky top-16 z-20 mt-6 rounded-3xl border border-[#ead6b8] bg-[#fffaf1]/95 p-4 shadow-[0_10px_30px_rgba(83,50,17,0.08)] backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6d49]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search dishes"
                  className="h-12 w-full rounded-2xl border border-[#dcc9a4] bg-white pl-10 pr-4 text-[#2d241b] outline-none focus:border-[#c26d37]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${activeCategory === 'all' ? 'bg-[#7d2419] text-[#fff3df]' : 'bg-[#f5ead7] text-[#6c583f]'}`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${activeCategory === category ? 'bg-[#7d2419] text-[#fff3df]' : 'bg-[#f5ead7] text-[#6c583f]'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {cartCount > 0 && (
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 rounded-full bg-[#7d2419] px-4 py-2 text-sm font-semibold text-[#fff3df] shadow-md hover:bg-[#962c20]"
                >
                  <ShoppingBag size={16} />
                  Cart ({cartCount})
                  {cartTotal > 0 && <span className="ml-1">{formatCurrency(cartTotal)}</span>}
                </Link>
              )}
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ead7ba] bg-[#fffaf1] shadow-[0_12px_26px_rgba(83,50,17,0.07)] sm:rounded-3xl sm:shadow-[0_16px_34px_rgba(83,50,17,0.06)]"
              >
                <img src={item.image} alt={item.name} className="h-28 w-full object-cover sm:h-48" loading="lazy" />
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <div className="flex min-h-[50px] items-start justify-between gap-3 sm:min-h-[50px]">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-[clamp(18px,4.2vw,26px)] leading-[0.95] text-[#2d2319] sm:text-2xl">
                        {item.name}
                      </h3>
                      <p className="mt-1 min-h-[44px] text-[12px] leading-[1.35] text-[#6f5f4a] sm:mt-2 sm:min-h-[48px] sm:text-sm">
                        <span className="sm:hidden">
                          {item.description.length > 52
                            ? `${item.description.slice(0, 52).trimEnd()}...`
                            : item.description}
                        </span>
                        <span className="hidden sm:inline">{item.description}</span>
                      </p>
                    </div>
                    {item.isVeg && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8e7] px-2 py-0.5 text-[10px] font-semibold text-[#2d7a2d] sm:px-2.5 sm:py-1 sm:text-xs">
                        <Leaf size={12} /> Veg
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 sm:pt-5">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <span className="font-serif text-[clamp(20px,4vw,28px)] text-[#7d2419]">
                        {formatCurrency(item.price)}
                      </span>
                      {itemQuantityById[item.id] ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-[#dbc7a2] bg-[#fff7ea] px-1.5 py-1 sm:gap-2 sm:px-2 sm:py-1.5">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, itemQuantityById[item.id] - 1)}
                            className="p-0.5 text-[#7d531f] hover:text-[#5c3d14]"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center text-xs font-semibold text-[#4d3e2c] sm:w-6 sm:text-sm">
                            {itemQuantityById[item.id]}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, itemQuantityById[item.id] + 1)}
                            className="p-0.5 text-[#7d531f] hover:text-[#5c3d14]"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addItem(item)}
                          className="rounded-full bg-[#7d2419] px-2 py-1 text-[10px] font-semibold text-[#fff3df] transition-colors hover:bg-[#962c20] sm:px-3 sm:py-2 sm:text-xs"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-center py-12"
            >
              <ShoppingBag size={48} className="mx-auto text-[#bfa584] mb-4" />
              <p className="text-[#6f5f4a] text-lg">No dishes found in this category</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
