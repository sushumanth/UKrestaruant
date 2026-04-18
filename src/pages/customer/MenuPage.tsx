import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronDown, Leaf, Wheat, AlertCircle, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Dietary = 'vegan' | 'vegetarian';

type MenuItem = {
  name: string;
  description: string;
  price: string;
  image: string;
  dietary: Dietary[];
};

type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
};

const restaurants = ['Gloucester Road', 'Piccadilly Gardens', 'Northern Quarter', 'Salford Quays'];

const menuCategories: MenuCategory[] = [
  {
    id: 'nibbles',
    title: 'Nibbles',
    items: [
      {
        name: 'Selection of Pickles',
        description: 'Crunchy seasonal vegetables in sumac-spiced brine.',
        price: '£4.25',
        image: '/hero_street.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
      {
        name: 'Marinated Mixed Olives',
        description: 'Citrus peel, coriander seed and warm olive oil.',
        price: '£4.25',
        image: '/cocktail.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
      {
        name: 'Roasted Almonds With Rosemary',
        description: 'Sea salt almonds tossed with thyme and rosemary.',
        price: '£4.25',
        image: '/dessert.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
    ],
  },
  {
    id: 'mezze',
    title: 'Mezze to Share',
    items: [
      {
        name: 'Feta & Pepper Dip',
        description: 'Whipped feta, roasted pepper, sunflower seeds and warm flatbread.',
        price: '£8.25',
        image: '/chef_plating.jpg',
        dietary: ['vegetarian'],
      },
      {
        name: 'Chicken Sambousek',
        description: 'Handmade pastry parcels with chicken, sumac and caramelized onion.',
        price: '£9.25',
        image: '/kitchen_team.jpg',
        dietary: [],
      },
      {
        name: 'Smoky Aubergine',
        description: 'Charred aubergine, tahina, pomegranate and crispy chickpeas.',
        price: '£7.95',
        image: '/dining_room.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
      {
        name: 'Lamb Kibbeh',
        description: 'Golden bulgur shell stuffed with warm spiced lamb and pine nuts.',
        price: '£9.25',
        image: '/chef_plating.jpg',
        dietary: [],
      },
    ],
  },
  {
    id: 'grills',
    title: 'Grills',
    items: [
      {
        name: 'Shawarma Chicken',
        description: 'House shawarma rub, pickled onion and garlic toum.',
        price: '£14.95',
        image: '/kitchen_team.jpg',
        dietary: [],
      },
      {
        name: 'Halloumi Skewers',
        description: 'Charred halloumi, peppers, lemon and mint yogurt.',
        price: '£13.50',
        image: '/dining_room.jpg',
        dietary: ['vegetarian'],
      },
      {
        name: 'Harissa Cauliflower Steak',
        description: 'Roasted cauliflower, chili jam and tahina drizzle.',
        price: '£12.25',
        image: '/hero_street.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
      {
        name: 'Spiced Lamb Kofta',
        description: 'Charcoal kofta with parsley salad and smoked tomato relish.',
        price: '£15.95',
        image: '/chef_plating.jpg',
        dietary: [],
      },
    ],
  },
  {
    id: 'tagines',
    title: 'Tagines',
    items: [
      {
        name: 'Apricot Chicken Tagine',
        description: 'Slow-cooked chicken with apricot, cinnamon and toasted almonds.',
        price: '£16.95',
        image: '/chef_plating.jpg',
        dietary: [],
      },
      {
        name: 'Market Vegetable Tagine',
        description: 'Root vegetables, chickpeas and preserved lemon in saffron broth.',
        price: '£14.95',
        image: '/hero_street.jpg',
        dietary: ['vegan', 'vegetarian'],
      },
      {
        name: 'Lamb & Prune Tagine',
        description: 'Tender lamb shoulder, sticky prunes and warm ras el hanout.',
        price: '£18.50',
        image: '/kitchen_team.jpg',
        dietary: [],
      },
    ],
  },
  {
    id: 'desserts',
    title: 'Desserts',
    items: [
      {
        name: 'Orange Blossom Basbousa',
        description: 'Semolina cake, citrus syrup and pistachio crumb.',
        price: '£7.50',
        image: '/dessert.jpg',
        dietary: ['vegetarian'],
      },
      {
        name: 'Date & Walnut Baklava',
        description: 'Layered filo pastry with orange zest cream.',
        price: '£7.95',
        image: '/dessert.jpg',
        dietary: ['vegetarian'],
      },
    ],
  },
];

const menuGroups = [
  {
    title: 'Main Menu',
    categoryIds: ['nibbles', 'mezze', 'grills', 'tagines', 'desserts'],
  },
  {
    title: 'The Feast',
    categoryIds: [],
  },
  {
    title: 'Drinks',
    categoryIds: [],
  },
];

const matchesDietaryFilter = (item: MenuItem, showVegan: boolean, showVegetarian: boolean): boolean => {
  if (!showVegan && !showVegetarian) {
    return true;
  }

  return (
    (showVegan && item.dietary.includes('vegan')) ||
    (showVegetarian && item.dietary.includes('vegetarian'))
  );
};

export const MenuPage = () => {
  const heroRef = useRef<HTMLElement | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurants[0]);
  const [showVegan, setShowVegan] = useState(false);
  const [showVegetarian, setShowVegetarian] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(menuCategories[0].id);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  });

  const heroImageY = useTransform(smoothProgress, [0, 1], ['0%', '16%']);
  const heroImageScale = useTransform(smoothProgress, [0, 1], [1.04, 1.18]);
  const heroTitleY = useTransform(smoothProgress, [0, 1], ['0%', '36%']);
  const heroTitleScale = useTransform(smoothProgress, [0, 1], [1, 0.9]);
  const heroTitleOpacity = useTransform(smoothProgress, [0, 0.85], [1, 0.2]);
  const heroOverlayOpacity = useTransform(smoothProgress, [0, 1], [0.38, 0.62]);

  const filteredCategories = useMemo(
    () =>
      menuCategories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => matchesDietaryFilter(item, showVegan, showVegetarian)),
        }))
        .filter((category) => category.items.length > 0),
    [showVegan, showVegetarian],
  );

  const availableCategoryIds = filteredCategories.map((category) => category.id);

  useEffect(() => {
    if (filteredCategories.length === 0) {
      return;
    }

    if (!availableCategoryIds.includes(selectedCategory)) {
      setSelectedCategory(filteredCategories[0].id);
    }
  }, [availableCategoryIds, filteredCategories, selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const section = document.getElementById(categoryId);

    if (section) {
      section.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  const menuHeadingClass = "font-['Playfair_Display']";

  return (
    <div className="min-h-screen bg-[#f4ebde] text-[#262522] font-['Inter']">
      <section ref={heroRef} className="relative h-[72vh] min-h-[470px] overflow-hidden pt-16 sm:h-[74vh] lg:h-[66vh]">
        <motion.img
          src="/Memus.png"
          alt="Top-view middle eastern dishes"
          className="absolute inset-0 h-full w-full object-cover object-[center_64%] will-change-transform"
          style={
            shouldReduceMotion
              ? { transform: 'scale(1.04)' }
              : { y: heroImageY, scale: heroImageScale }
          }
        />
        <motion.div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,8,6,0.36),rgba(24,8,6,0.58))]"
          style={shouldReduceMotion ? undefined : { opacity: heroOverlayOpacity }}
        />

        <motion.h1
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${menuHeadingClass} relative z-10 flex h-full items-center justify-center px-4 text-center text-[clamp(68px,12vw,188px)] font-semibold uppercase tracking-[0.04em] text-[#f7eedf] [text-shadow:0_8px_24px_rgba(0,0,0,0.35)]`}
          style={
            shouldReduceMotion
              ? undefined
              : { y: heroTitleY, scale: heroTitleScale, opacity: heroTitleOpacity }
          }
        >
          Menus
        </motion.h1>
      </section>

      <main className="pb-20">
        <section className="sticky top-16 z-20 border-y border-[#d8d2c4] bg-[rgba(232,227,216,0.95)] px-5 py-4 backdrop-blur-sm sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end lg:gap-8">
            <label className="w-full max-w-[420px]">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6f6a5e]">Select a restaurant</span>
              <div className="relative mt-2">
                <select
                  value={selectedRestaurant}
                  onChange={(event) => setSelectedRestaurant(event.target.value)}
                  className="w-full appearance-none border border-[#cfc7b4] bg-[#f5f2ea] px-4 py-2.5 pr-11 text-[15px] font-medium text-[#1f2022] outline-none transition-colors focus:border-[#8d7e53]"
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant} value={restaurant}>
                      {restaurant}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#726d61]" />
              </div>
            </label>

            <div className="flex flex-col gap-1.5 text-[#2b2b2b]">
              <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#6f6a5e]">Show dishes suitable for</span>
              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium">
                  <input
                    type="checkbox"
                    checked={showVegan}
                    onChange={(event) => setShowVegan(event.target.checked)}
                    className="h-4 w-4 border border-[#c6bca8] accent-[#c6b27e]"
                  />
                  Vegan
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium">
                  <input
                    type="checkbox"
                    checked={showVegetarian}
                    onChange={(event) => setShowVegetarian(event.target.checked)}
                    className="h-4 w-4 border border-[#c6bca8] accent-[#c6b27e]"
                  />
                  Vegetarian
                </label>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-fit items-center justify-center gap-2 border border-[#c4bba4] bg-[#f5f2e9] px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#746d5f] transition-colors hover:bg-[#ebe5d8]"
            >
              <AlertCircle size={14} /> Allergens & Calories
            </button>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.55),rgba(255,255,255,0)_52%),linear-gradient(120deg,#d8d4ca_0%,#cfcac0_48%,#d9d4ca_100%)] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
            <aside className="h-fit border border-[#c5beaf] bg-[#e5e0d5] p-4 text-[#262626] lg:sticky lg:top-32">
              {menuGroups.map((group) => (
                <div key={group.title} className="mb-5 border-b border-[#cbbf9e] pb-3 last:mb-0 last:border-b-0 last:pb-0">
                  <h3 className={`${menuHeadingClass} text-[22px] font-semibold uppercase leading-none tracking-[0.03em] text-[#3d3a33]`}>
                    {group.title}
                  </h3>
                  {group.categoryIds.length > 0 && (
                    <ul className="mt-3 space-y-1 text-[16px]">
                      {group.categoryIds.map((categoryId) => {
                        const category = menuCategories.find((item) => item.id === categoryId);

                        if (!category) {
                          return null;
                        }

                        const isAvailable = availableCategoryIds.includes(category.id);
                        const isActive = selectedCategory === category.id;

                        return (
                          <li key={category.id}>
                            <button
                              type="button"
                              onClick={() => handleCategoryClick(category.id)}
                              disabled={!isAvailable}
                              className={`${menuHeadingClass} w-full px-2 py-1.5 text-left leading-tight transition-colors ${isActive ? 'bg-[linear-gradient(100deg,#17222f,#1e2c3b)] text-[#f1eee7]' : 'text-[#2f2c29] hover:bg-[#d8d2c6]'} ${!isAvailable ? 'cursor-not-allowed opacity-40' : ''}`}
                            >
                              {category.title}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ))}
            </aside>

            <div className="border border-l-0 border-[#c5beaf] bg-[#f4f1e9] p-4 sm:p-6 lg:p-7">
              {filteredCategories.length === 0 ? (
                <div className="border border-[#d1c7b4] bg-[#fbf8f0] p-6 text-[15px] text-[#5f5950]">
                  No dishes match your current filters. Try enabling fewer dietary options.
                </div>
              ) : (
                filteredCategories.map((category, index) => (
                  <motion.section
                    id={category.id}
                    key={category.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.28, delay: index * 0.03 }}
                    className="mb-10 scroll-mt-32"
                  >
                    <h3 className={`${menuHeadingClass} text-[42px] font-medium uppercase leading-[0.93] tracking-[0.03em] text-[#1f2228] mb-5`}>
                      {category.title}
                    </h3>

                    <div className="mt-3 grid gap-x-8 gap-y-4 md:grid-cols-2">
                      {category.items.map((item) => (
                        <article key={item.name} className="border-b border-[#c7bcaa] pb-4">
                          <div className="grid grid-cols-[70px_1fr_auto] gap-4">
                            <img src={item.image} alt={item.name} className="h-[60px] w-[60px] rounded object-cover" />

                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`${menuHeadingClass} text-[24px] uppercase leading-[0.9] tracking-[0.02em] text-[#22252c]`}>
                                  {item.name}
                                </h4>
                              </div>
                              <p className="mt-1.5 text-[13px] font-normal leading-[1.4] text-[#4a4a4a] pr-2">{item.description}</p>
                            </div>

                            <div className="flex items-start gap-1.5 whitespace-nowrap pl-2">
                              {item.dietary.includes('vegan') && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d9c793] text-[#5b4f31]">
                                  <Leaf size={10} />
                                </span>
                              )}
                              {!item.dietary.includes('vegan') && item.dietary.includes('vegetarian') && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d9c793] text-[#5b4f31]">
                                  <Wheat size={10} />
                                </span>
                              )}
                              <span className={`${menuHeadingClass} text-[20px] font-medium leading-none text-[#1f2228]`}>{item.price}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </motion.section>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 border border-[#e1c5a6] bg-[#fff4e6] p-6 text-[#6b2b31] sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-3xl text-[13px] leading-relaxed">
              You are viewing <span className="font-semibold">{selectedRestaurant}</span>. Allergen and calorie details are
              available at the table and from our team before ordering.
            </p>
            <Link
              to="/book"
              className="inline-flex w-fit items-center gap-2 bg-[#5a1119] px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[#f6ead9] transition-colors hover:bg-[#7a1f2a]"
            >
              Book a Table <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};