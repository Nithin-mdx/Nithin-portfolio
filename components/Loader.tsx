"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useSite } from "./Providers";

// 0 → 100 counter, then the screen splits open.
export default function Loader() {
  const { setLoaded, reduced } = useSite();
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finish = () => { setLoaded(true); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      setDone(true);
      return;
    }
    const count = { v: 0 };
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.to(count, {
      v: 100,
      duration: 2.2,
      ease: "power3.inOut",
      onUpdate: () => { num.current!.textContent = String(Math.round(count.v)).padStart(3, "0"); },
    })
      .to(q(".loader-count"), { yPercent: -110, duration: 0.6, ease: "expo.in" })
      .call(finish)
      .to(q(".loader-top"), { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "split")
      .to(q(".loader-bottom"), { yPercent: 100, duration: 1.1, ease: "expo.inOut" }, "split");
    return () => { tl.kill(); };
  }, [setLoaded, reduced]);

  if (done) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[95] text-paper" role="status" aria-label="Loading">
      <div className="loader-top absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div className="loader-bottom absolute inset-x-0 bottom-0 h-1/2 bg-ink" />
      <p className="label absolute left-4 top-4 md:left-8 md:top-6">Nithin Nandakumar</p>
      <div className="absolute bottom-2 right-4 overflow-hidden md:right-8">
        <span ref={num} className="loader-count display block w-[1.9em] text-right tabular-nums text-[38vw] leading-[0.8] md:text-[26vw]">
          000
        </span>
      </div>
      <div className="absolute bottom-6 left-4 h-px w-1/3 bg-acid md:left-8" />
    </div>
  );
}
