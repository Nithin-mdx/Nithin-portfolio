"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(SplitText, ScrollTrigger);

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  children: string;
  className?: string;
  play?: boolean; // when given, animates on this flag instead of on scroll
  delay?: number;
};

// Letters stagger up from masked lines, with a blur that resolves (Codrops-style).
export default function SplitReveal({ as: Tag = "h2", children, className = "", play, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (play === false) {
      gsap.set(ref.current, { autoAlpha: 0 });
      return;
    }
    const split = SplitText.create(ref.current, { type: "lines,chars", mask: "lines", aria: Tag === "span" ? "hidden" : "auto" });
    gsap.set(ref.current, { autoAlpha: 1 });
    const tween = gsap.from(split.chars, {
      yPercent: 110,
      rotate: 6,
      filter: "blur(8px)",
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.025,
      delay,
      scrollTrigger: play === undefined ? { trigger: ref.current, start: "top 85%" } : undefined,
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [play, delay, children, Tag]);
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
