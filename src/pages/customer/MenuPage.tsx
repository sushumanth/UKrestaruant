import { motion } from 'framer-motion';
import { Clock3, Leaf, Minus, Plus, Search, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/mockData';
import { useMenuCartStore } from '@/store';

type MenuCategory = 'starters' | 'mains' | 'biryani' | 'bread' | 'dessert';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image: string;
  rating: number;
  prepTime: number;
  isVeg: boolean;
};

const categories: Array<{ id: MenuCategory; label: string }> = [
  { id: 'starters', label: 'Starters' },
  { id: 'mains', label: 'Mains' },
  { id: 'biryani', label: 'Biryani' },
  { id: 'bread', label: 'Bread' },
  { id: 'dessert', label: 'Dessert' },
];

const menuItems: MenuItem[] = [
  {
    id: 'starter-1',
    name: 'Paneer Tikka',
    description: 'Char-grilled cottage cheese with smoky spice marinade.',
    price: 8.5,
    category: 'starters',
    image: '/dining_room.jpg',
    rating: 4.8,
    prepTime: 14,
    isVeg: true,
  },
  {
    id: 'starter-2',
    name: 'Chicken 65',
    description: 'Crispy fried chicken tossed in South Indian spices.',
    price: 9.5,
    category: 'starters',
    image: '/kitchen_team.jpg',
    rating: 4.7,
    prepTime: 12,
    isVeg: false,
  },
  {
    id: 'main-1',
    name: 'Butter Chicken',
    description: 'Tender chicken in creamy tomato butter gravy.',
    price: 13.9,
    category: 'mains',
    image: '/chef_plating.jpg',
    rating: 4.9,
    prepTime: 18,
    isVeg: false,
  },
  {
    id: 'main-2',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils finished with cream.',
    price: 11.5,
    category: 'mains',
    image: '/homepa1.png',
    rating: 4.7,
    prepTime: 16,
    isVeg: true,
  },
  {
    id: 'biryani-1',
    name: 'Lamb Biryani',
    description: 'Fragrant basmati rice with slow-cooked lamb.',
    price: 14.9,
    category: 'biryani',
    image: '/dessert.jpg',
    rating: 4.8,
    prepTime: 22,
    isVeg: false,
  },
  {
    id: 'biryani-2',
    name: 'Veg Dum Biryani',
    description: 'Saffron basmati layered with vegetables and herbs.',
    price: 12.2,
    category: 'biryani',
    image: '/backgroundtheme1.png',
    rating: 4.6,
    prepTime: 20,
    isVeg: true,
  },
  {
    id: 'bread-1',
    name: 'Garlic Naan',
    description: 'Tandoor-baked naan topped with butter and garlic.',
    price: 3.5,
    category: 'bread',
    image: '/homepa1.png',
    rating: 4.7,
    prepTime: 8,
    isVeg: true,
  },
  {
    id: 'dessert-1',
    name: 'Gulab Jamun',
    description: 'Warm milk-solid dumplings in cardamom syrup.',
    price: 5.2,
    category: 'dessert',
    image: '/dessert.jpg',
    rating: 4.9,
    prepTime: 6,
    isVeg: true,
  },
];

export const MenuPage = () => {
  const { items, addItem, updateItemQuantity } = useMenuCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const itemQuantityById = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {}),
    [items],
  );

  return (
    <div className="min-h-screen bg-[#f8f0e1] pt-24 text-[#2d241b]">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-[#ead6b8] bg-[linear-gradient(135deg,#7a2418_0%,#a63d1e_45%,#f0c975_100%)] p-6 text-[#fff6e4] shadow-[0_18px_46px_rgba(79,39,13,0.18)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Order Online</p>
          <h1 className="mt-2 font-serif text-[clamp(34px,8.5vw,62px)] leading-[0.95] text-white sm:text-[clamp(36px,6vw,62px)]">
            Punjabi menu, delivered fast
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            Browse signature dishes, add to cart, and head to checkout in seconds.
          </p>
        </section>

        <section className="sticky top-16 z-20 mt-6 rounded-3xl border border-[#ead6b8] bg-[#fffaf1]/95 p-4 shadow-[0_10px_30px_rgba(83,50,17,0.08)] backdrop-blur">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
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
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${activeCategory === category.id ? 'bg-[#7d2419] text-[#fff3df]' : 'bg-[#f5ead7] text-[#6c583f]'}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-[#ead7ba] bg-[#fffaf1] shadow-[0_12px_26px_rgba(83,50,17,0.07)] sm:rounded-3xl sm:shadow-[0_16px_34px_rgba(83,50,17,0.06)]"
            >
              <img src={item.image} alt={item.name} className="h-28 w-full object-cover sm:h-48" loading="lazy" />
              <div className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-[clamp(18px,4.8vw,28px)] leading-[0.95] text-[#2d2319] sm:text-2xl">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-[12px] leading-[1.35] text-[#6f5f4a] sm:mt-2 sm:text-sm">
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

                <div className="mt-3 flex items-center justify-between text-[12px] text-[#7d6a57] sm:mt-4 sm:text-sm">
                  <span className="inline-flex items-center gap-1"><Star size={13} className="text-[#b9832f] sm:h-[14px] sm:w-[14px]" /> {item.rating.toFixed(1)}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 size={13} className="sm:h-[14px] sm:w-[14px]" /> {item.prepTime} min</span>
                </div>

                <div className="mt-3 flex items-center justify-between sm:mt-4">
                  <span className="text-xl font-semibold text-[#7d2419] sm:text-lg">{formatCurrency(item.price)}</span>
                  {itemQuantityById[item.id] ? (
                    <div className="inline-flex items-center rounded-full border border-[#8f2a1d] bg-[#7d2419] p-1 text-[#fff3df] shadow-[0_4px_12px_rgba(60,20,10,0.2)]">
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, itemQuantityById[item.id] - 1)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#942d21]"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[22px] text-center text-sm font-bold leading-none">
                        {itemQuantityById[item.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#942d21]"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addItem({ id: item.id, name: item.name, image: item.image, price: item.price })}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#7d2419] px-3 py-1.5 text-sm font-semibold text-[#fff3df] transition-colors hover:bg-[#942d21] sm:gap-2 sm:px-4 sm:py-2"
                    >
                      <Plus size={14} /> Add
                    </button>
                  )}
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

      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-[#a24a31] bg-[#7d2419] p-4 text-[#fff3df] shadow-[0_14px_40px_rgba(60,20,10,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#ffd9c6]">Cart</p>
              <p className="mt-1 text-sm font-medium">{cartCount} item(s) · {formatCurrency(cartTotal)}</p>
            </div>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 rounded-full bg-[#f5d8b0] px-4 py-2 text-sm font-semibold text-[#6b1f15]"
            >
              <ShoppingBag size={15} /> View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};