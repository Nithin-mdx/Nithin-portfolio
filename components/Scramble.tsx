"use client";

import { useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+/";

// Text scrambles then resolves on hover (React Bits-style, no dependency).
export default function Scramble({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const run = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      ref.current!.textContent = text
        .split("")
        .map((c, i) => (c === " " || i < frame / 2 ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        .join("");
      if (frame / 2 >= text.length) clearInterval(id);
    }, 30);
  };
  return (
    <span ref={ref} onPointerEnter={run} onFocus={run} aria-label={text}>
      {text}
    </span>
  );
}
