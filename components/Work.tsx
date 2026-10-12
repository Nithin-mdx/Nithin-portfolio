"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { projects } from "@/data/portfolio";
import { blobFocus, useSite } from "./Providers";
import { SectionLabel } from "./About";
import type { Signals } from "./DistortImage";

const DistortImage = dynamic(() => import("./DistortImage"), { ssr: false });
const images = projects.flatMap((p) => p.image ?? []);

export default function Work() {
  const { go, reduced } = useSite();
  const [active, setActive] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const signals = useRef<Signals>({ hover: 0, velocity: 0 });

  useEffect(() => setDesktop(matchMedia("(pointer: fine) and (min-width: 768px)").matches), []);

  // Floating preview follows the cursor; its speed feeds the shader.
  useEffect(() => {
    const el = preview.current;
    if (!desktop || !el) return; // no screenshots yet → no preview
    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" });
    const r = gsap.quickTo(el, "rotation", { duration: 0.8, ease: "power3" });
    let lx = 0;
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lx;
      lx = e.clientX;
      x(e.clientX);
      y(e.clientY);
      r(gsap.utils.clamp(-12, 12, dx * 0.4));
      signals.current.velocity = gsap.utils.clamp(-1, 1, dx / 40);
    };
    const decay = () => { signals.current.velocity *= 0.9; };
    window.addEventListener("pointermove", move);
    gsap.ticker.add(decay);
    return () => { window.removeEventListener("pointermove", move); gsap.ticker.remove(decay); };
  }, [desktop]);

  const show = (on: boolean) => {
    signals.current.hover = on ? 1 : 0;
    if (preview.current) gsap.to(preview.current, { scale: on ? 1 : 0, duration: 0.6, ease: "expo.out" });
  };

  return (
    <section id="work" data-blob="work" data-theme-section="dark" className="relative px-4 py-28 md:px-8 md:py-44">
      <SectionLabel>Selected work</SectionLabel>

      <ul onPointerLeave={() => { show(false); blobFocus.project = -1; }} className="border-t border-current/20">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-current/20">
            <a
              href={`/work/${p.slug}`}
             
              onClick={(e) => { e.preventDefault(); go(`/work/${p.slug}`, p.title); }}
              onPointerEnter={() => { setActive(i); show(!!p.image); blobFocus.project = i; }}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-12 gap-x-8 gap-y-4 py-8 md:py-10"
            >
              {/* Mobile: inline image card instead of hover preview */}
              {p.image && (
                <div className="relative col-span-12 aspect-[4/3] overflow-hidden md:hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
              <h3 className="display col-span-12 text-[11vw] transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)] group-hover:translate-x-4 md:col-span-8 md:text-[5.6vw]">
                {p.title}
              </h3>
              <div className="col-span-12 space-y-3 md:col-span-4 md:self-center">
                <p className="text-base leading-snug opacity-80">{p.tagline}</p>
                <p className="label flex justify-between gap-4 opacity-60">
                  <span>{p.stack.slice(0, 3).join(" · ")}</span>
                  <span>{p.year}</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {desktop && images.length > 0 && (
        <div ref={preview} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[60] h-[22vw] w-[30vw] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={projects[active].image ?? images[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {!reduced && <DistortImage images={images} index={Math.max(0, images.indexOf(projects[active].image ?? ""))} signals={signals} />}
        </div>
      )}
    </section>
  );
}
