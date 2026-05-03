'use client';

import React, { useState } from "react";


type LanternProps = {
  className: string;
  imgClassName: string;
  heavyWind?: boolean;

  topMask?: {
  enabled?: boolean;
  color?: string;

  width?: number;        // mask width in px
  height?: number;       // mask height in px

  fromOpacity?: number;  // top opacity
  midOpacity?: number;
  midPoint?: string;
  fadeEnd?: string;      // vertical fade end

  x?: number;            // move mask left/right
  y?: number;            // move mask up/down

  sideFadeStart?: string; // horizontal fade start
  sideFadeEnd?: string; // horizontal fade end
};

  glow?: {
    enabled?: boolean;
    color?: string;      // example: "255,210,130"
    size?: number;       // glow circle size
    blur?: number;       // blur radius
    opacity?: number;    // 0 to 1
    x?: number;          // left/right offset
    y?: number;          // up/down offset
  };
};

export default function Lantern({
  className,
  imgClassName,
  heavyWind = true,
  topMask = {
    enabled: true,
    color: "0,0,0",
    fromOpacity: 1,
    midOpacity: 0.72,
    fadeEnd: "68%",
  },
  glow = {
    enabled: true,
    color: "255,210,130",
    size: 130,
    blur: 50,
    opacity: 0.28,
    x: 0,
    y: 10,
  },
}: LanternProps) {
  const lanternBoxRef = React.useRef<HTMLDivElement | null>(null);

  const mouseRef = React.useRef({
    x: 0,
    y: 0,
    velocityX: 0,
    velocityY: 0,
    inside: false,
    ready: false,
  });

  const physicsRef = React.useRef({
    angle: 0,
    velocity: 0,
    lift: 0,
    liftVelocity: 0,
  });

  const windRef = React.useRef({
    resumeAt: 0,
    nextGustAt: 0,
    gustStartAt: 0,
    gustActive: false,
    gustReleaseUntil: 0,
  });

  const [style, setStyle] = useState({
    rotate: 0,
    lift: 0,
  });

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.velocityX = 0;
    mouseRef.current.velocityY = 0;
    mouseRef.current.inside = true;
    mouseRef.current.ready = true;

    // Mouse entered, wind stops immediately.
    windRef.current.gustActive = false;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const newX = e.clientX - rect.left;
    const newY = e.clientY - rect.top;

    if (!mouseRef.current.ready) {
      mouseRef.current.x = newX;
      mouseRef.current.y = newY;
      mouseRef.current.velocityX = 0;
      mouseRef.current.velocityY = 0;
      mouseRef.current.ready = true;
      mouseRef.current.inside = true;
      return;
    }

    mouseRef.current.velocityX = newX - mouseRef.current.x;
    mouseRef.current.velocityY = newY - mouseRef.current.y;

    mouseRef.current.x = newX;
    mouseRef.current.y = newY;
    mouseRef.current.inside = true;
  }

  function handleMouseLeave() {
    mouseRef.current.inside = false;
    mouseRef.current.ready = false;
    mouseRef.current.velocityX = 0;
    mouseRef.current.velocityY = 0;

    // Only after leaving, wait 2 seconds before wind starts again.
    windRef.current.resumeAt = performance.now() + 2000;
    windRef.current.nextGustAt = performance.now() + 7000;
    windRef.current.gustActive = false;
  }

  React.useEffect(() => {
    let animationId: number;

    windRef.current.resumeAt = 0;
    windRef.current.nextGustAt = performance.now() + 7000;
    windRef.current.gustActive = false;

    function animate() {
      const box = lanternBoxRef.current;
      const mouse = mouseRef.current;
      const physics = physicsRef.current;

      if (box) {
        const rect = box.getBoundingClientRect();

        const pivotX = rect.width / 2;
        const pivotY = 0;

        const chainLength = rect.height * 0.62;

        const lanternX =
          pivotX + Math.sin((physics.angle * Math.PI) / 180) * chainLength;

        const lanternY =
          pivotY + Math.cos((physics.angle * Math.PI) / 180) * chainLength;

        const dx = mouse.x - lanternX;
        const dy = mouse.y - lanternY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        const touchRadius = 95;

        const isTouching = mouse.inside && distance < touchRadius;

        const now = performance.now();
        const time = now / 1000;

        let targetAngle = 0;

        if (mouse.inside) {
          // Mouse mode: wind is fully OFF.
          // Only mouse force affects lantern.
          if (isTouching) {
            const strength = 1 - distance / touchRadius;

            // Your image direction needed minus, so keep minus.
            physics.velocity -= mouse.velocityX * 0.04 * strength;

            if (mouse.velocityY < 0 && mouse.y > lanternY) {
              physics.liftVelocity += mouse.velocityY * 0.12 * strength;
            }

            mouse.velocityX *= 0.18;
            mouse.velocityY *= 0.18;
          }

          // Small natural gravity while mouse mode is active.
          targetAngle = 0;
        } else {
          // Mouse left. Wind can start only after resumeAt.
          const windAllowed = now >= windRef.current.resumeAt;

          if (windAllowed) {
            if (heavyWind) {
  const GUST_DIRECTION = 1; 
  // If wind goes wrong side, change this to -1.

  const normalWind =
    Math.sin(time * 1.15) * 1.4 +
    Math.sin(time * 0.42) * 0.6;

  // Start heavy gust every 15 seconds
  if (
    !windRef.current.gustActive &&
    now >= windRef.current.nextGustAt &&
    now >= windRef.current.gustReleaseUntil
  ) {
    windRef.current.gustActive = true;
    windRef.current.gustStartAt = now;
    windRef.current.nextGustAt = now + 15000;
  }

  if (windRef.current.gustActive) {
    const gustAge = now - windRef.current.gustStartAt;

    if (gustAge < 700) {
      // Phase 1: wind builds up and pushes lantern to 30deg
      const progress = gustAge / 700;

      // smooth ramp: starts soft, ends strong
      const eased = 1 - Math.pow(1 - progress, 3);

      const jiggle =
        Math.sin(time * 18) * 0.35 +
        Math.sin(time * 31) * 0.2;

      targetAngle = GUST_DIRECTION * (20 * eased + jiggle);
    } else if (gustAge < 1700) {
      // Phase 2: hold near 30deg for 1 second with small jiggle
      const jiggle =
        Math.sin(time * 20) * 0.7 +
        Math.sin(time * 33) * 0.35;

      targetAngle = GUST_DIRECTION * (20 + jiggle);
    } else {
      // Phase 3: release.
      // Do not force opposite side.
      // Let spring physics naturally swing opposite.
      windRef.current.gustActive = false;
      windRef.current.gustReleaseUntil = now + 4500;

      targetAngle = 0;
    }
  } else if (now < windRef.current.gustReleaseUntil) {
    // After gust release: no normal wind for a few seconds.
    // This lets the pendulum naturally go:
    // 30deg -> opposite 20deg -> back 10deg -> opposite 5deg.
    targetAngle = 0;
  } else {
    // Normal soft wind after pendulum settles
    targetAngle = normalWind;
  }
} else {
  // Heavy wind OFF. Only soft wind.
  targetAngle =
    Math.sin(time * 1.05) * 1.4 +
    Math.sin(time * 0.38) * 0.6;
}
          } else {
            // Waiting after mouse leave: no wind, just natural settle.
            targetAngle = 0;
          }
        }

        let springStrength = 0.014;
let damping = 0.965;

if (windRef.current.gustActive) {
  const gustAge = now - windRef.current.gustStartAt;

  if (gustAge < 1700) {
    // While wind is holding the lantern near 30deg
    springStrength = 0.045;
    damping = 0.86;
  }
} else if (now < windRef.current.gustReleaseUntil) {
  // After wind release: loose pendulum motion
  springStrength = 0.011;
  damping = 0.975;
}

physics.velocity += -(physics.angle - targetAngle) * springStrength;
physics.velocity *= damping;

        // Apply.
        physics.angle += physics.velocity;
        physics.angle = clamp(physics.angle, -35, 35);

        // Vertical lift settle.
        physics.liftVelocity += -physics.lift * 0.08;
        physics.liftVelocity *= 0.82;
        physics.lift += physics.liftVelocity;
        physics.lift = clamp(physics.lift, -45, 10);

        setStyle({
          rotate: physics.angle,
          lift: physics.lift,
        });
      }

      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [heavyWind]);

  const topMaskOuterStyle =
  topMask.enabled === false
    ? undefined
    : {
        left: `calc(50% + ${topMask.x ?? 0}px)`,
        top: `${topMask.y ?? 0}px`,
        width: `${topMask.width ?? 90}px`,
        height: `${topMask.height ?? 220}px`,
        transform: "translateX(-50%)",

        WebkitMaskImage: `linear-gradient(
          to right,
          transparent 0%,
          black ${topMask.sideFadeStart ?? "28%"},
          black ${topMask.sideFadeEnd ?? "72%"},
          transparent 100%
        )`,
        maskImage: `linear-gradient(
          to right,
          transparent 0%,
          black ${topMask.sideFadeStart ?? "28%"},
          black ${topMask.sideFadeEnd ?? "72%"},
          transparent 100%
        )`,
      };

const topMaskInnerStyle =
  topMask.enabled === false
    ? undefined
    : {
        background: `linear-gradient(
          to bottom,
          rgba(${topMask.color ?? "0,0,0"}, ${topMask.fromOpacity ?? 1}) 0%,
          rgba(${topMask.color ?? "0,0,0"}, ${topMask.midOpacity ?? 0.75}) ${topMask.midPoint ?? "38%"},
          rgba(${topMask.color ?? "0,0,0"}, 0) ${topMask.fadeEnd ?? "75%"}
        )`,
      };

  const glowOpacity = glow.opacity ?? 0.28;
  const glowColor = glow.color ?? "255,139,10";

  const glowStyle =
    glow.enabled === false
      ? undefined
      : {
          left: `calc(50% + ${glow.x ?? 0}px)`,
          top: `calc(45% + ${glow.y ?? 10}px)`,
          width: `${glow.size ?? 130}px`,
          height: `${glow.size ?? 130}px`,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(
            circle,
            rgba(${glowColor}, ${glowOpacity}) 0%,
            rgba(${glowColor}, ${glowOpacity * 0.55}) 38%,
            rgba(${glowColor}, 0) 75%
          )`,
          filter: `blur(${glow.blur ?? 50}px)`,
          mixBlendMode: "screen" as const,
        };

  return (
    <div
      ref={lanternBoxRef}
      className={`absolute z-40 pointer-events-auto ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* FIXED DARK TOP MASK - does NOT move with lantern */}
      {topMask.enabled !== false && (
  <div
    className="absolute z-20 pointer-events-none"
    style={topMaskOuterStyle}
  >
    <div
      className="w-full h-full"
      style={topMaskInnerStyle}
    />
  </div>
)}

      {/* MOVING LANTERN GROUP */}
      <div
        className="relative z-10"
        style={{
          transform: `translateY(${style.lift}px) rotate(${style.rotate}deg)`,
          transformOrigin: "top center",
        }}
      >
        {/* MOVING GLOW - moves with lantern */}
        {glow.enabled !== false && (
          <div
            className="absolute z-0 rounded-full pointer-events-none"
            style={glowStyle}
          />
        )}

        {/* LANTERN IMAGE */}
        <img
          src="/lantern.webp"
          alt="Lantern"
          className={`relative z-10 w-auto origin-top drop-shadow-2xl ${imgClassName}`}
          draggable={false}
        />
      </div>
    </div>
  );
}
