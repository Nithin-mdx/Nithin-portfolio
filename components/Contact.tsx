"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { profile } from "@/data/portfolio";
import { SectionLabel } from "./About";
import { Button } from "./Hero";
import Magnetic from "./Magnetic";

const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function Contact() {
  const title = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Letters lift and stretch toward the cursor.
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = Array.from(title.current!.querySelectorAll<HTMLElement>(".ch"));
    const setters = letters.map((l) => ({
      y: gsap.quickTo(l, "yPercent", { duration: 0.6, ease: "power3" }),
      s: gsap.quickTo(l, "scaleY", { duration: 0.6, ease: "power3" }),
    }));
    const move = (e: PointerEvent) => {
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        const lift = Math.max(0, 1 - d / 420);
        setters[i].y(-lift * 18);
        setters[i].s(1 + lift * 0.35);
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!FORMSPREE) {
      // ponytail: no form backend configured → hand off to the mail client
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${data.get("name")}`)}&body=${encodeURIComponent(String(data.get("message")))}`;
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  };

  const field = "w-full border-b border-current/30 bg-transparent py-3 text-lg outline-none transition-colors focus:border-acid placeholder:opacity-40";

  return (
    <section id="contact" data-blob="contact" data-theme-section="dark" className="relative px-4 py-28 md:px-8 md:py-40">
      <SectionLabel>Contact</SectionLabel>
      <h2 ref={title} className="display kinetic text-[22vw] md:text-[17vw]" aria-label="Let's talk">
        {"LET'S TALK".split("").map((c, i) => (
          <span key={i} aria-hidden className="ch inline-block origin-bottom">{c === " " ? " " : c}</span>
        ))}
      </h2>

      <div className="mt-16 grid gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label opacity-60">Email — click to copy</p>
          <Magnetic strength={0.15}>
            <button
              onClick={copy}
             
              className="mt-3 break-all text-left font-[family-name:var(--font-display)] text-2xl font-medium underline decoration-acid decoration-2 underline-offset-8 md:text-4xl"
            >
              {profile.email}
            </button>
          </Magnetic>
          <p aria-live="polite" className="label mt-4 h-4 text-acid">{copied ? "Copied to clipboard ✓" : ""}</p>
          <div className="mt-8">
            <Button href={profile.github} external>GitHub — @{profile.githubHandle} ↗</Button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6 md:col-span-6 md:col-start-7">
          <label className="block">
            <span className="label opacity-60">Name</span>
            <input name="name" required autoComplete="name" className={field} />
          </label>
          <label className="block">
            <span className="label opacity-60">Email</span>
            <input name="email" type="email" required autoComplete="email" className={field} />
          </label>
          <label className="block">
            <span className="label opacity-60">Message</span>
            <textarea name="message" required rows={4} className={`${field} resize-none`} />
          </label>
          <div className="flex items-center gap-6">
            <Magnetic>
              <button
                type="submit"
                disabled={status === "sending"}
               
                className="rounded-full bg-acid px-8 py-4 label text-ink transition-transform hover:scale-105 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </Magnetic>
            <p aria-live="polite" className="label">
              {status === "sent" && "Thanks — I'll be in touch."}
              {status === "error" && "Something went wrong. Email me instead."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
