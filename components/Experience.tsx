"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { experience } from "@/data/portfolio";
import { SectionLabel } from "./About";
import Workflow from "./Workflow";

export default function Experience() {
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lines = list.current!.querySelectorAll(".draw-line");
    const tweens = Array.from(lines).map((l) =>
      gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: l, start: "top 90%" } })
    );
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  return (
    <section id="experience" data-blob="experience" data-theme-section="light" className="relative px-4 py-28 md:px-8 md:py-44">
      <SectionLabel>Experience</SectionLabel>
      <ol ref={list}>
        {experience.map((e, i) => (
          <li key={i} className="relative">
            <span className="draw-line absolute inset-x-0 top-0 block h-px origin-left bg-current/30" />
            <details className="group">
              <summary className="grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-6 md:py-8">
                <span className="label col-span-2 md:col-span-1">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-9 font-[family-name:var(--font-display)] text-2xl font-medium md:col-span-5 md:text-4xl">{e.role}</span>
                <span aria-hidden className="col-span-1 text-right text-2xl transition-transform duration-500 group-open:rotate-45 md:order-last">+</span>
                <span className="col-span-10 col-start-3 text-sm opacity-70 md:col-span-3 md:col-start-auto">{e.company}, {e.place}</span>
                <span className="label col-span-10 col-start-3 opacity-60 md:col-span-2 md:col-start-auto md:text-right">{e.period}</span>
              </summary>
              <ul className="grid grid-cols-12 gap-x-4 pb-8">
                {e.points.map((p) => (
                  <li key={p} className="col-span-10 col-start-3 border-l-2 border-acid py-1 pl-4 text-base md:col-span-5 md:col-start-2">{p}</li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ol>
      <span className="block h-px bg-current/30" />
      <Workflow />
    </section>
  );
}
