"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { marqueeWords, skills } from "@/data/portfolio";
import Marquee from "./Marquee";
import { SectionLabel } from "./About";

export default function Skills() {
  const list = useRef<HTMLDivElement>(null);

  // Each category's items rise in, staggered, as the row enters.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tweens = gsap.utils.toArray<HTMLElement>(".skill-row", list.current).map((row) =>
      gsap.from(row.querySelectorAll(".skill-item"), {
        yPercent: 100,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.05,
        scrollTrigger: { trigger: row, start: "top 85%" },
      })
    );
    return () => tweens.forEach((t) => t.revert());
  }, []);

  return (
    <section id="skills" data-blob="skills" data-theme-section="dark" className="relative py-28 md:py-44">
      <div className="px-4 md:px-8">
        <SectionLabel>Skills</SectionLabel>
      </div>

      <Marquee
        items={skills.flatMap((s) => s.items)}
        speed={1}
        className="display mb-16 border-y border-current/15 py-3 text-[15vw] md:mb-24 md:text-[8vw]"
      />

      <div ref={list} className="px-4 md:px-8">
        {skills.map((s, i) => (
          <div key={s.category} className="skill-row grid gap-4 border-t border-current/20 py-8 md:grid-cols-12 md:gap-8 md:py-10">
            <h3 className="flex items-baseline gap-4 md:col-span-4">
              <span className="label opacity-60">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-[family-name:var(--font-display)] text-2xl font-medium md:text-3xl">{s.category}</span>
            </h3>
            <ul className="flex flex-wrap gap-x-3 gap-y-1 md:col-span-8">
              {s.items.map((item, j) => (
                <li key={item} className="overflow-hidden">
                  <span className="skill-item display inline-block text-[9vw] leading-[1.05] transition-colors duration-300 hover:text-acid md:text-[3.4vw]">
                    {item}
                    {j < s.items.length - 1 && <span aria-hidden className="ml-3 text-current/30">/</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="border-t border-current/20" />
      </div>

      <Marquee items={marqueeWords} speed={2} reverse className="label mt-20 bg-acid py-3 text-ink" />
    </section>
  );
}
