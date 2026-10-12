"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { scroll } from "./Providers";

// Infinite strip. Speeds up with scroll velocity and flips direction with scroll direction.
export default function Marquee({ items, speed = 1, reverse = false, className = "" }: {
  items: string[]; speed?: number; reverse?: boolean; className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = track.current!;
    let x = 0;
    let dir = reverse ? 1 : -1;
    const tick = (_: number, dt: number) => {
      const v = scroll.smooth;
      if (Math.abs(v) > 0.5) dir = (reverse ? -1 : 1) * (v > 0 ? -1 : 1);
      x += dir * (speed * 0.06 + Math.abs(v) * 0.012) * dt;
      const half = el.scrollWidth / 2;
      if (half) x = ((x % half) - half) % half; // keep in (-half, 0]
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed, reverse]);

  const row = (hidden: boolean) =>
    items.map((t, i) => (
      <span key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
        <span className="px-[0.25em]">{t}</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-[0.42em] w-[0.42em] shrink-0 text-acid" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
          <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10" />
        </svg>
      </span>
    ));

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div ref={track} className="kinetic flex w-max will-change-transform">
        {row(false)}
        {row(true)}
        {/* second copy makes the loop seamless */}
      </div>
    </div>
  );
}
