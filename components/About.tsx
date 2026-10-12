"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { profile } from "@/data/portfolio";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="label mb-10 flex items-center gap-4 md:mb-16">
      <span aria-hidden className="h-px w-10 bg-current opacity-40" />
      <span>{children}</span>
    </h2>
  );
}

export default function About() {
  const statement = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = statement.current!.querySelectorAll("span");
    const tween = gsap.fromTo(
      words,
      { opacity: 0.5 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: { trigger: statement.current, start: "top 80%", end: "bottom 45%", scrub: true },
      }
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return (
    <section id="about" data-blob="about" data-theme-section="light" className="relative px-4 py-28 md:px-8 md:py-44">
      <SectionLabel>About</SectionLabel>
      <p
        ref={statement}
        className="font-[family-name:var(--font-display)] text-[9vw] font-medium leading-[0.98] tracking-[-0.03em] md:ml-[16.66%] md:text-[5.2vw]"
      >
        {profile.statement.split(" ").map((w, i) => (
          <span key={i}>{w} </span>
        ))}
      </p>

      <div className="mt-20 grid gap-12 md:mt-32 lg:grid-cols-12">
        <p className="max-w-xl text-base leading-relaxed md:text-lg lg:col-span-4 lg:col-start-2">{profile.summary}</p>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 lg:col-span-3 lg:col-start-7 lg:grid-cols-2">
          {profile.facts.map((f) => (
            <div key={f.label} className="border-t border-current/20 pt-3">
              <dt className="label opacity-60">{f.label}</dt>
              <dd className="mt-2 font-[family-name:var(--font-display)] text-xl">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="max-w-sm lg:col-span-2 lg:col-start-11 lg:max-w-none">
          <h3 className="label opacity-60">Languages</h3>
          <ul className="mt-3 space-y-2">
            {profile.languages.map((l) => (
              <li key={l.name} className="flex justify-between gap-4 border-t border-current/20 pt-2 text-sm">
                <span>{l.name}</span>
                <span className="opacity-60">{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
