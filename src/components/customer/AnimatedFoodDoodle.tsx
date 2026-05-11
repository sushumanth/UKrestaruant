import { useRef } from 'react';

type AnimatedFoodDoodleProps = {
  className?: string;
};

export const AnimatedFoodDoodle = ({ className = '' }: AnimatedFoodDoodleProps) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = cardRef.current;
    if (!element) return;

    
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    const mx = `${(x * 100).toFixed(2)}%`;
    const my = `${(y * 100).toFixed(2)}%`;
    const ry = `${((x - 0.5) * 7).toFixed(2)}deg`;
    const rx = `${((0.5 - y) * 6).toFixed(2)}deg`;

    element.style.setProperty('--mx', mx);
    element.style.setProperty('--my', my);
    element.style.setProperty('--ry', ry);
    element.style.setProperty('--rx', rx);
  };

  const handlePointerLeave = () => {
    const element = cardRef.current;
    if (!element) return;

    element.style.setProperty('--mx', '50%');
    element.style.setProperty('--my', '50%');
    element.style.setProperty('--ry', '0deg');
    element.style.setProperty('--rx', '0deg');
  };
  return (
    <div
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className={`doodle-card relative overflow-hidden rounded-[26px] border border-white/20 bg-[#1f2a37] shadow-[0_22px_48px_rgba(9,14,22,0.35)] ${className}`}
      aria-label="Animated food doodle"
    >
      <div className="art-bg" />
      <div className="grid-layer" />
      <div className="scan-layer" />
      <div className="spotlight" />

      <svg viewBox="0 0 1200 760" className="relative z-10 w-full" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="chalkGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#dbe7f3" stopOpacity="0.84" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g stroke="url(#chalkGlow)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#softGlow)">
          <path className="draw d1" d="M95 102c42-10 76 12 108 44 22 22 28 65 6 90-30 35-92 50-135 26-48-27-59-81-33-120 8-12 20-26 54-40z" />
          <path className="draw d2" d="M286 110c24 28 26 60 3 90" />
          <path className="draw d3" d="M332 92c17 20 19 44 2 66" />
          <path className="draw d4" d="M405 164c62-52 147-53 212-2 23 18 30 45 20 72-12 34-52 56-90 48-22-4-45-17-66-15-20 2-36 20-56 24-32 8-69-8-87-37-20-31-11-69 19-90 12-8 28-13 48-16z" />
          <path className="draw d5" d="M480 154c12 20 34 30 58 30 26 0 50-13 64-35" />
          <path className="draw d6" d="M688 168c31-26 73-41 111-39 43 2 85 17 117 45" />
          <path className="draw d7" d="M789 128c5-16 17-27 34-34 19-8 39-8 58 0" />
          <path className="draw d8" d="M976 88c50-7 91 16 118 54 20 28 18 68-6 92-22 22-59 29-89 13" />
          <path className="draw d9" d="M962 246c68 4 131 39 168 97" />
          <path className="draw d10" d="M924 365c56 24 83 72 87 131" />
          <path className="draw d11" d="M734 365c18 57 10 106-22 149" />
          <path className="draw d12" d="M562 415c-51 53-111 78-186 72" />
          <path className="draw d13" d="M205 371c-35 61-29 119 16 172" />
          <path className="draw d14" d="M158 561c74 45 150 54 234 24" />
          <path className="draw d15" d="M945 573c54-23 90-61 111-115" />
          <path className="draw d16" d="M781 600c53 31 110 39 168 21" />
        </g>

        <g fill="none" stroke="url(#chalkGlow)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" filter="url(#softGlow)">
          <g className="float f1">
            <path className="draw d17" d="M455 368h300" />
            <path className="draw d18" d="M487 332h236c42 0 76 34 76 76s-34 76-76 76H487c-42 0-76-34-76-76s34-76 76-76z" />
            <path className="draw d19" d="M525 317c12-23 35-39 63-39s51 16 63 39" />
            <path className="draw d20" d="M545 397h166" />
            <path className="draw d21" d="M557 430h143" />
          </g>

          <g className="float f2">
            <path className="draw d22" d="M883 475h92v156h-92z" />
            <path className="draw d23" d="M883 511h92" />
            <path className="draw d24" d="M902 475V430" />
            <path className="draw d25" d="M930 475V430" />
            <path className="draw d26" d="M957 475V430" />
          </g>

          <g className="float f3">
            <path className="draw d27" d="M274 508l43-28 48 71-44 30z" />
            <path className="draw d28" d="M361 560l58-35" />
            <path className="draw d29" d="M380 594l63-38" />
          </g>

          <g className="float f4">
            <path className="draw d30" d="M164 284l72 40" />
            <path className="draw d31" d="M182 363l70-36" />
            <path className="draw d32" d="M124 326h96" />
          </g>

          <g className="float f5">
            <path className="draw d33" d="M1021 253l62 0" />
            <path className="draw d34" d="M1021 288l62 0" />
            <path className="draw d35" d="M1021 323l62 0" />
          </g>
        </g>

        <g fill="url(#chalkGlow)" fontFamily="'Comic Sans MS', 'Trebuchet MS', cursive" fontWeight="700" filter="url(#softGlow)">
          <text className="fade t1" x="470" y="214" fontSize="74">BURGER</text>
          <text className="fade t2" x="882" y="225" fontSize="56">BEST</text>
          <text className="fade t3" x="866" y="285" fontSize="52">BBQ</text>
          <text className="fade t4" x="852" y="343" fontSize="58">GRILL</text>
          <text className="fade t5" x="868" y="403" fontSize="58">DRINK</text>
          <text className="fade t6" x="505" y="640" fontSize="88">EAT</text>
        </g>
      </svg>

      <style>{`
        .doodle-card {
          --mx: 50%;
          --my: 50%;
          --rx: 0deg;
          --ry: 0deg;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .doodle-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(10, 21, 38, 0.62), rgba(16, 29, 49, 0.58));
        }

        .art-bg,
        .grid-layer,
        .scan-layer,
        .spotlight,
        svg {
          transform: rotateX(var(--rx)) rotateY(var(--ry));
          transition: transform 280ms cubic-bezier(0.2, 0.7, 0.2, 1);
          will-change: transform;
        }

        .art-bg {
          position: absolute;
          inset: -2%;
          z-index: 1;
          background-image:
            linear-gradient(135deg, rgba(5, 15, 30, 0.7), rgba(5, 15, 30, 0.4)),
            url('/image.png');
          background-size: cover;
          background-position: center;
          animation: bgDrift 18s ease-in-out infinite;
          filter: saturate(1.05) contrast(1.04);
        }

        .grid-layer {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.28;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          mask-image: radial-gradient(circle at center, black 32%, transparent 92%);
          animation: gridShift 14s linear infinite;
        }

        .scan-layer {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.05) 0px,
            rgba(255, 255, 255, 0.05) 1px,
            transparent 1px,
            transparent 4px
          );
          opacity: 0.1;
          animation: scanMove 6s linear infinite;
        }

        .spotlight {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background:
            radial-gradient(circle at var(--mx) var(--my), rgba(255, 255, 255, 0.2), transparent 28%),
            radial-gradient(circle at calc(var(--mx) - 18%) calc(var(--my) + 12%), rgba(106, 198, 255, 0.16), transparent 34%);
          mix-blend-mode: screen;
          transition: background-position 180ms linear;
        }

        svg {
          z-index: 10;
          filter: drop-shadow(0 6px 18px rgba(255, 255, 255, 0.14));
        }

        .doodle-card:hover .draw,
        .doodle-card:hover .fade {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.36));
        }

        .draw {
          stroke-dasharray: 460;
          stroke-dashoffset: 460;
          animation: drawLine 1.6s ease forwards;
        }

        .fade {
          opacity: 0;
          transform: translateY(8px) scale(0.98);
          transform-origin: center;
          animation: fadeIn 0.8s ease forwards;
        }

        .float {
          animation: bob 4.2s ease-in-out infinite;
          transform-origin: center;
        }

        .f1 { animation-delay: 0.3s; }
        .f2 { animation-delay: 0.8s; }
        .f3 { animation-delay: 1.1s; }
        .f4 { animation-delay: 1.5s; }
        .f5 { animation-delay: 1.9s; }

        .d1 { animation-delay: 0.04s; }
        .d2 { animation-delay: 0.08s; }
        .d3 { animation-delay: 0.12s; }
        .d4 { animation-delay: 0.16s; }
        .d5 { animation-delay: 0.2s; }
        .d6 { animation-delay: 0.24s; }
        .d7 { animation-delay: 0.28s; }
        .d8 { animation-delay: 0.32s; }
        .d9 { animation-delay: 0.36s; }
        .d10 { animation-delay: 0.4s; }
        .d11 { animation-delay: 0.44s; }
        .d12 { animation-delay: 0.48s; }
        .d13 { animation-delay: 0.52s; }
        .d14 { animation-delay: 0.56s; }
        .d15 { animation-delay: 0.6s; }
        .d16 { animation-delay: 0.64s; }
        .d17 { animation-delay: 0.68s; }
        .d18 { animation-delay: 0.72s; }
        .d19 { animation-delay: 0.76s; }
        .d20 { animation-delay: 0.8s; }
        .d21 { animation-delay: 0.84s; }
        .d22 { animation-delay: 0.88s; }
        .d23 { animation-delay: 0.92s; }
        .d24 { animation-delay: 0.96s; }
        .d25 { animation-delay: 1s; }
        .d26 { animation-delay: 1.04s; }
        .d27 { animation-delay: 1.08s; }
        .d28 { animation-delay: 1.12s; }
        .d29 { animation-delay: 1.16s; }
        .d30 { animation-delay: 1.2s; }
        .d31 { animation-delay: 1.24s; }
        .d32 { animation-delay: 1.28s; }
        .d33 { animation-delay: 1.32s; }
        .d34 { animation-delay: 1.36s; }
        .d35 { animation-delay: 1.4s; }

        .t1 { animation-delay: 1.05s; }
        .t2 { animation-delay: 1.2s; }
        .t3 { animation-delay: 1.35s; }
        .t4 { animation-delay: 1.5s; }
        .t5 { animation-delay: 1.65s; }
        .t6 { animation-delay: 1.8s; }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bob {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes bgDrift {
          0%,
          100% {
            transform: rotateX(var(--rx)) rotateY(var(--ry)) scale(1.03) translate3d(0, 0, 0);
          }
          50% {
            transform: rotateX(var(--rx)) rotateY(var(--ry)) scale(1.08) translate3d(-1.6%, -1.2%, 0);
          }
        }

        @keyframes gridShift {
          0% {
            background-position: 0 0, 0 0;
          }
          100% {
            background-position: 44px 22px, 22px 44px;
          }
        }

        @keyframes scanMove {
          0% {
            transform: rotateX(var(--rx)) rotateY(var(--ry)) translateY(-12%);
          }
          100% {
            transform: rotateX(var(--rx)) rotateY(var(--ry)) translateY(14%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .art-bg,
          .grid-layer,
          .scan-layer,
          .spotlight,
          .draw,
          .fade,
          .float {
            animation: none;
            opacity: 1;
            stroke-dashoffset: 0;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};
