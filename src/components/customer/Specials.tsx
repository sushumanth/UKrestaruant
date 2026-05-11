'use client';

import DishFrame from "./../ui/DishFrame";

const dishes = [
  {
    name: 'Cheesecake Pancakes',
    image: '/layers/Cheesecake-Pancakes.png',
    description: 'Tender chicken simmered in our rich, creamy tomato sauce.',
  },
  {
    name: 'Cod in Tomatoe',
    image: '/layers/Cod-in-Tomatoe.png',
    description: 'Fragrant basmati rice cooked with lamb, herbs & spices.',
  },
  {
    name: 'Croissant French Toast',
    image: '/layers/Croissant-French-Toast.png',
    description: 'Slow cooked lamb in aromatic kashmiri spices.',
  },
];

export default function Specials() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-transparent">
        {/* decorative background pattern later */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,175,55,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(212,175,55,0.14),transparent_24%),linear-gradient(180deg,#f8f0df_0%,#f5ead5_100%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-[#a98745]">
          Chef&apos;s Special
        </p>

        <h2 className="mt-3 font-serif text-4xl text-[#2b1308] md:text-5xl">
          Signature Dishes
        </h2>
        {/* Title decoration */}
        <div className="mt-4 flex items-center justify-center">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#c49a45]" />
          <span className="mx-2 h-2 w-2 rotate-45 border border-[#c49a45]" />
          <span className="h-px w-10 bg-[#c49a45]" />
          <span className="mx-2 h-2 w-2 rotate-45 border border-[#c49a45]" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#c49a45]" />
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-10 md:flex-row md:gap-0">
          {dishes.map((dish, index) => (
            <div key={dish.name} className="flex items-center">
            <DishFrame
              name={dish.name}
              image={dish.image}
              description={dish.description}
            />
             {index !== dishes.length - 1 && (
                <div className="relative hidden h-[375px] w-12 md:block">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#cfaf74]/80 to-transparent" />
                  <div className="absolute left-1/2 top-[16%] h-[68%] w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#e0c58f]/40 to-transparent blur-[0.4px]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}