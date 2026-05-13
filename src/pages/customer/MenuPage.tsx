import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock3, Leaf, Minus, Plus, Search, ShoppingBag, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/mockData';
import { formatMenuRating, getVisibleMenuItems } from '@/lib/menuUtils';
import { useMenuCartStore, useMenuStore } from '@/store';
import type { MenuCategory, MenuItem } from '@/types';

const categories: Array<{ id: MenuCategory; label: string }> = [
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Mains' },
  { id: 'biryani', label: 'Biryani' },
  { id: 'bread', label: 'Bread' },
  { id: 'dessert', label: 'Dessert' },
];

export const MenuPage = () => {
  const { items, addItem, updateItemQuantity } = useMenuCartStore();
  const { menuItems } = useMenuStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -26]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.72]);

  const filteredItems = getVisibleMenuItems(menuItems, searchQuery, activeCategory);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemQuantityById = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = item.quantity;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf7ef_0%,#f4e6d2_100%)] pt-20 text-[#2d241b]">
      <div className="w-full pb-16">
        <section
          ref={heroRef}
          className="relative isolate -mt-2 w-full overflow-hidden rounded-none border-y border-[#e7d4b2] shadow-none"
        >
          <motion.img
            src="/Memus.png"
            alt="Menu hero"
            className="h-[36vh] w-full object-cover object-center md:h-[40vh] lg:h-[54vh] select-none"
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

        <div className="mx-auto w-full px-4 md:px-6 lg:px-8 xl:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-4 text-center text-sm text-[#6f5f4a] sm:text-base md:mt-6 lg:mt-8"
          >
            Scroll and explore signature dishes with a smooth, cinematic menu experience.
          </motion.p>

          <section className="mt-4 rounded-2xl border border-[#ead6b8] bg-[#fffaf1]/95 p-3 shadow-[0_10px_30px_rgba(83,50,17,0.08)] select-none md:mt-6 md:rounded-3xl md:p-4 lg:mt-8 lg:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center"> {/*  grid gap-3 lg:grid-cols-[1fr_auto] */}
              <div className="relative w-full lg:flex-1">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a6d49]"
                  aria-hidden="true"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search dishes.."
                  className="h-11 w-full rounded-xl border border-[#dcc9a4] bg-white pl-10 pr-4 text-sm text-[#2d241b] outline-none placeholder:text-[#9a8b75] focus:border-[#c26d37] focus:ring-2 focus:ring-[#c26d37]/20 md:h-12 md:pl-11 md:text-base"
                  aria-label='Search Menu Items'
                />
              </div>

              <div className="flex flex-wrap shrink-0 items-center gap-2">
              <FilterPill 
                label="All" 
                isActive={activeCategory === 'all'} 
                onClick={() => setActiveCategory('all')} 
              />
              {categories.map((category) => (
                <FilterPill
                  key={category.id}
                  label={category.label}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#e6d1b6] bg-[#fff6eb] shadow-[0_14px_28px_rgba(120,82,40,0.16)]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-32 w-full object-cover sm:h-44"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex-1 font-serif text-[clamp(18px,3.8vw,24px)] leading-[1.05] text-[#2f2218]">
                      {item.name}
                    </h3>
                    {item.isVeg ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f8e7] px-2 py-0.5 text-[10px] font-semibold text-[#2d7a2d]">
                        <Leaf size={11} /> Veg
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fde7e5] px-2 py-0.5 text-[10px] font-semibold text-[#9c2f27]">
                        <span className="inline-block h-2 w-2 rounded-full border border-current" /> Non-Veg
                      </span>
                    )}
                  </div>
                  <p className="mt-1 min-h-[44px] text-[12px] leading-[1.4] text-[#6f5b45] sm:text-sm">
                    <span className="sm:hidden">
                      {item.description.length > 52
                        ? `${item.description.slice(0, 52).trimEnd()}...`
                        : item.description}
                    </span>
                    <span className="hidden sm:inline">{item.description}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-[12px] text-[#7a674f] sm:text-sm">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Star size={13} className="text-[#b9832f]" />
                      {formatMenuRating(item.rating)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Clock3 size={13} />
                      {item.prepTime} min
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-semibold text-[#7a2b1c] sm:text-xl">
                      {formatCurrency(item.price)}
                    </span>
                    {itemQuantityById[item.id] ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#6b2a1e] px-2 py-1 text-[#fff3e2] shadow-[0_6px_16px_rgba(92,46,20,0.22)]">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, itemQuantityById[item.id] - 1)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5b2218] transition-colors hover:bg-[#742b1f]"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[18px] text-center text-sm font-semibold">
                          {itemQuantityById[item.id]}
                        </span>
                        <button
                          type="button"
                          onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#5b2218] transition-colors hover:bg-[#742b1f]"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#6b2a1e] px-3 py-1.5 text-sm font-semibold text-[#fff3e2] shadow-[0_6px_16px_rgba(92,46,20,0.22)] transition-colors hover:bg-[#7b3124]"
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </section>

          <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-[#a07a4f]">
            Scroll for more dishes
          </p>

          {filteredItems.length === 0 && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-2xl border border-dashed border-[#dbc9aa] bg-[#fff7ea] p-6 text-center text-[#6f5f4a] md:mt-10 md:rounded-3xl md:p-8"
            >
              <p className="text-sm sm:text-base">
              No dishes match "<span className="font-medium text-[#7d2419]">{searchQuery}</span>". 
              Try another search or browse all categories.
            </p>
            </motion.div>
          )}
        </div>

      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-1/2 z-40 w-[min(100vw-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-[#a24a31] bg-[#7d2419] p-4 text-[#fff3df] shadow-[0_14px_40px_rgba(60,20,10,0.35)] md:bottom-6 md:w-[min(92vw,560px)] md:rounded-3xl md:p-5"
          >
          <div className="flex items-center justify-between gap-4">
            <div className='min-w-0'>
              <p className="text-xs uppercase tracking-[0.12em] text-[#ffd9c6]">Cart</p>
              <p className="mt-1 truncate text-sm font-medium md:text-base">{cartCount} item(s) · {formatCurrency(cartTotal)}</p>
            </div>
            <Link
              to="/cart"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#f5d8b0] px-4 py-2.5 text-sm font-semibold text-[#6b1f15] transition-colors hover:bg-[#e8c99a] focus:outline-none focus:ring-2 focus:ring-[#f5d8b0] focus:ring-offset-2 focus:ring-offset-[#7d2419] md:px-5 md:py-3"
            >
              <ShoppingBag size={16} className="sm:size-5" />
              <span className="hidden sm:inline">View Cart</span>
              <span className="sm:hidden">Cart</span>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const FilterPill = ({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3.5 py-2 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#7d2419] focus:ring-offset-2 focus:ring-offset-[#fffaf1] sm:px-4 sm:py-2.5 sm:text-sm ${
      isActive
        ? 'bg-[#7d2419] text-[#fff3df] shadow-[0_4px_12px_rgba(125,36,25,0.25)]'
        : 'bg-[#f5ead7] text-[#6c583f] hover:bg-[#ecd8b8] active:bg-[#e0c9a5]'
    }`}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const MenuCard = ({
  item,
  quantity,
  onAdd,
  onUpdateQty,
}: {
  item: MenuItem;
  quantity: number;
  onAdd: () => void;
  onUpdateQty: (qty: number) => void;
}) => {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#ead7ba] bg-[#fffaf1] shadow-[0_8px_20px_rgba(83,50,17,0.05)] transition-shadow hover:shadow-[0_16px_32px_rgba(83,50,17,0.08)] sm:rounded-3xl"
    >
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden sm:h-48 lg:h-52">
        <img
          src={item.image}
          alt={item.name}
          className="no-select h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          width={400}
          height={300}
        />
        {item.isVeg ? (
          <span className="absolute no-select left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#e7f8e7] px-2 py-0.5 text-[10px] font-semibold text-[#2d7a2d] backdrop-blur-sm md:px-2.5 md:py-1.5 sm:tex-xs lg:px-3 lg:py-2">
            <Leaf size={11} /> Veg
          </span>
        ) : (
          <span className="absolute no-select left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#fde7e5] px-2 py-0.5 text-[10px] font-semibold text-[#9c2f27] backdrop-blur-sm md:px-2.5 md:py-1.5 sm:tex-xs lg:px-3 lg:py-2">
            <span className="inline-block h-2 w-2 rounded-full border border-current" /> Non-Veg
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-1 md:p-3 lg:p-4 gap-5">
        <div className="gap-2">
          <h3 className="font-serif text-lg font-medium leading-tight text-[#2d2319] sm:text-xl lg:text-2xl">
            {item.name}
          </h3>
          {/* Description */}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6f5f4a] md:mt-2 lg:mt-3 sm:text-sm lg:line-clamp-3">
          {item.description}
        </p>
        </div>

        {/* Meta: Rating & Prep Time */}
        <div className="mt-auto flex flex-col pt-1 md:pt-2 lg:pt-3">
          {/* <span className="inline-flex items-center gap-1.5">
            <Star size={13} className="text-[#b9832f] sm:size-[14px]" aria-hidden="true" />
            <span className="tabular-nums">{formatMenuRating(item.rating)}</span>
          </span> */}
          <span className="inline-flex items-center gap-1.5 text-xs text-[#7d6a57] sm:text-sm">
            <Clock3 size={13} className="sm:size-[14px]" aria-hidden="true" />
            <span className="tabular-nums">{item.prepTime} min</span>
          </span>
        

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-1 md:pt-2 lg:pt-3">
          <span className="text-base font-semibold text-[#7d2419] sm:text-lg lg:text-xl">
            {formatCurrency(item.price)}
          </span>

          {quantity > 0 ? (
            <div 
              className="no-select inline-flex items-center rounded-full border border-[#8f2a1d] bg-[#7d2419] p-1 text-[#fff3df] shadow-[0_4px_12px_rgba(60,20,10,0.2)] no-select"
              role="group"
              aria-label={`Quantity controls for ${item.name}`}
            >
              <button
                type="button"
                onClick={() => onUpdateQty(quantity - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#942d21] focus:outline-none focus:ring-2 focus:ring-[#fff3df]/50 no-select"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus size={14} aria-hidden="true" />
              </button>
              <span className="min-w-[26px] text-center text-sm font-bold leading-none" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#942d21] focus:outline-none focus:ring-2 focus:ring-[#fff3df]/50 no-select"
                aria-label={`Add one ${item.name}`}
              >
                <Plus size={14} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              className="no-select inline-flex items-center gap-2 rounded-full bg-[#7d2419] px-2 py-1 text-sm font-semibold text-[#fff3df] transition-colors hover:bg-[#942d21] focus:outline-none focus:ring-2 focus:ring-[#7d2419] focus:ring-offset-2 focus:ring-offset-[#fffaf1] md:px-3 md:py-1.5 lg:px-4 lg:py-2"
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={14} aria-hidden="true" />
              <span>Add</span>
            </button>
          )}
        </div>
        </div>
      </div>
    </motion.article>
  );
};