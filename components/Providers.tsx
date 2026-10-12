"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

// Shared, mutable scroll state read inside rAF loops (no React re-renders).
export const scroll = { velocity: 0, smooth: 0 };
// Which project row is hovered (-1 = none); the blob reads this every frame.
export const blobFocus = { project: -1 };

const ChromeBlob = dynamic(() => import("./ChromeBlob"), { ssr: false });

type Ctx = {
  loaded: boolean;
  setLoaded: (v: boolean) => void;
  reduced: boolean;
  go: (href: string, label: string) => void;
};
const SiteContext = createContext<Ctx>(null!);
export const useSite = () => useContext(SiteContext);

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const panelLabel = useRef<HTMLSpanElement>(null);
  const pending = useRef<null | (() => void)>(null);

  // Lenis + scroll velocity → CSS vars for kinetic type
  useEffect(() => {
    const root = document.documentElement;
    const lenis = reduced ? null : new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    lenis?.on("scroll", ScrollTrigger.update);
    let last = "";
    const tick = (time: number) => {
      lenis?.raf(time * 1000);
      const v = gsap.utils.clamp(-60, 60, lenis?.velocity ?? 0);
      scroll.velocity = v;
      scroll.smooth += (v - scroll.smooth) * 0.12;
      const key = scroll.smooth.toFixed(2);
      if (key !== last) {
        last = key;
        root.style.setProperty("--vel", key);
        root.style.setProperty("--speed", Math.abs(scroll.smooth).toFixed(2));
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, [reduced]);

  // Freeze scroll during the loader
  useEffect(() => {
    if (loaded) lenisRef.current?.start();
    else lenisRef.current?.stop();
  }, [loaded, reduced]);

  // Per-route: section themes + reveal after a transition
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    const triggers = gsap.utils.toArray<HTMLElement>("[data-theme-section]").map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) root.dataset.theme = el.dataset.themeSection;
        },
      })
    );
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) lenisRef.current?.scrollTo(hash, { immediate: true });
    else lenisRef.current?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
    pending.current?.();
    pending.current = null;
    return () => triggers.forEach((t) => t.kill());
  }, [pathname]);

  const go = useCallback(
    (href: string, label: string) => {
      const [path, hash] = href.split("#");
      const samePage = !path || path === pathname;
      const jump = () => {
        if (samePage && hash) lenisRef.current ? lenisRef.current.scrollTo("#" + hash, { immediate: true }) : document.getElementById(hash)?.scrollIntoView();
        else router.push(href);
      };
      if (reduced || !panel.current) return jump();

      const tl = gsap.timeline();
      panelLabel.current!.textContent = label;
      tl.set(panel.current, { display: "flex", clipPath: "inset(100% 0 0 0)" })
        .to(panel.current, { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "expo.inOut" })
        .fromTo(panelLabel.current, { yPercent: 110, skewY: 8 }, { yPercent: 0, skewY: 0, duration: 0.5, ease: "expo.out" }, "-=0.2");

      const reveal = () =>
        gsap
          .timeline()
          .to(panelLabel.current, { yPercent: -110, duration: 0.4, ease: "expo.in" }, 0.15)
          .to(panel.current, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.inOut" }, 0.3)
          .set(panel.current, { display: "none" });

      tl.call(() => {
        if (samePage) {
          jump();
          reveal();
        } else {
          pending.current = reveal;
          jump();
        }
      });
    },
    [pathname, reduced, router]
  );

  return (
    <SiteContext.Provider value={{ loaded, setLoaded, reduced, go }}>
      {loaded && <ChromeBlob />}
      {children}
      <div
        ref={panel}
        aria-hidden
        className="fixed inset-0 z-[80] hidden items-center justify-center bg-acid text-ink"
      >
        <span className="block overflow-hidden">
          <span ref={panelLabel} className="display block text-[16vw] md:text-[10vw]" />
        </span>
      </div>
      <div className="grain" aria-hidden />
    </SiteContext.Provider>
  );
}
