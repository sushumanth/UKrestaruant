type DishFrameProps = {
  name: string;
  description: string;
  image: string;
};

const maskStyle = {
    WebkitMaskImage: "url('/layers/frame-mask2.png')",
    maskImage: "url('/layers/frame-mask2.png')",

    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",

    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",

    WebkitMaskPosition: "center",
    maskPosition: "center",
} as const;

export default function DishFrame({ name, description, image }: DishFrameProps) {
  return (
    <article className="mx-auto w-full max-w-[280px]">
      {/* Top image + frame area */}
      <div className="relative w-full drop-shadow-[8px_10px_16px_rgba(87,62,28,0.12)]">
        <div className="relative aspect-[215/220] w-full">
        {/* Food image cropped by mask */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
                ...maskStyle,
                backgroundImage: `url(${image})`,
            }}
          />

          {/* Soft inner depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...maskStyle,
              background: "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0.08) 100%)",
            }}
          />

        {/* Frame overlay */}
        <img
          src="/layers/frame1.png"
          alt=""
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          draggable={false}
        />
      </div>

      {/* Description area */}
        <div className="relative w-full">
          <div className="relative flex h-[178px] w-full flex-col items-center border-x border-b border-[#d9c79d] bg-[#fffaf0] px-3 pb-3 text-center rounded-b-[10px]">
            {/* Title */}
            <h3 className="flex h-[52px] items-center justify-center font-serif text-[19px] leading-[1.1] text-[#2b1308]">
              {name}
            </h3>

            {/* Description */}
            <p className="flex h-[44px] max-w-[210px] items-center justify-center text-[12px] leading-[1.45] text-[#695846]">
              {description}
            </p>

            {/* Button */}
            <button className="mt-2 rounded-[9px] border border-[#c9b07a] bg-[#f5ead1] px-6 py-[9px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#5a1e1e] transition hover:bg-[#5a1e1e] hover:text-[#fff4dd]">
              Order Now
            </button>

            {/* thin inner bottom line */}
            <div className="pointer-events-none absolute inset-x-[16px] bottom-[8px] h-px bg-[#e6d7b4]" />
          </div>

          {/* bottom cut corners */}
          {/* <div className="pointer-events-none absolute -bottom-[6px] left-[10px] h-[12px] w-[12px] rotate-45 border-l border-b border-[#d9c79d] bg-[#f8f0df]" />
          <div className="pointer-events-none absolute -bottom-[6px] right-[10px] h-[12px] w-[12px] -rotate-45 border-r border-b border-[#d9c79d] bg-[#f8f0df]" /> */}
        </div>
      </div>
    </article>
  );
}