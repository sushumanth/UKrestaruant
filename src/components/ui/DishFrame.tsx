import { Link } from "react-router-dom";

type DishFrameProps = {
  name: string;
  description: string;
  image: string;
};

const maskStyle = {
    WebkitMaskImage: "url('/frame-mask.png')",
    maskImage: "url('/frame-mask.png')",

    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",

    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",

    WebkitMaskPosition: "center",
    maskPosition: "center",
} as const;

const bottomStepCut =
  "polygon(0 0, 100% 0, 100% 90%, 95% 90%, 95% 100%, 5% 100%, 5% 90%, 0 90%)";

export default function DishFrame({ name, description, image }: DishFrameProps) {
  return (
    <article className="group relative w-full max-w-[280px]">
      <div className="relative transition-transform duration-300 ease-out group-hover:-translate-y-[2px] drop-shadow-[6px_6px_6px_rgba(87,62,28,0.25)]">
      {/* Top image + frame area */}
        <div className="relative aspect-[215/220] w-full">
        {/* Food image cropped by mask */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat overflow-hidden"
            style={maskStyle}
          >
            <img
                src={image}
                alt={name}
                className="pointer-events-none select-none h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                loading="lazy"
                draggable={false}
              />
          </div>

          {/* Soft inner depth */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              ...maskStyle,
              background: "linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.02) 38%, rgba(0,0,0,0.08) 100%)",
            }}
          />

        {/* Frame overlay */}
        <img
          src="/frame.png"
          alt=""
          className="pointer-events-none select-none absolute inset-0 z-20 h-full w-full"
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Description area */}
        <div className="relative w-full">
          <div
            className="relative flex w-full flex-col items-center bg-[#fffaf0] px-3 text-center"
            style={{
              clipPath: bottomStepCut,
              WebkitClipPath: bottomStepCut,
              border: "1px 1px solid #d9c79d",
            }}
          >
            <h3 className="pt-4 pb-2 flex items-center justify-center font-serif text-[16px] leading-[1.1] text-[#2b1308] sm:text-[19px] ">
              {name}
            </h3>

             <p className="pt-2 pb-2 flex max-w-[210px] items-center justify-center px-1 text-[10px] leading-[1.45] text-[#695846] sm:text-[12px]">
              <span className="sm:hidden">
                {description.length > 40
                  ? `${description.slice(0, 40).trimEnd()}...`
                  : description}
              </span>

              <span className="hidden sm:inline">
                {description.length > 68
                  ? `${description.slice(0, 68).trimEnd()}...`
                  : description}
              </span>
            </p>

            <Link
              to="/order"
              className="mt-2 mb-5 inline-flex items-center rounded-[10px] border border-[#d2bb8a] bg-[#f4e7ca] px-5 py-[4px] text-[9px] font-bold uppercase tracking-[0.08em] text-[#5a1e1e] transition-colors duration-300 hover:bg-[#5a1e1e] hover:text-[#fff4dd] sm:px-6 sm:py-[9px] sm:text-[10px]"
            >
              Order Now
            </Link>

            <div className="pointer-events-none absolute inset-x-[24px] bottom-[6px] h-px bg-[#e6d7b4]" />
          </div>
          </div>
          </div>
    </article>
  );
}