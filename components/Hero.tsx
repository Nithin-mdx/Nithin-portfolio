"use client";

import { profile } from "@/data/portfolio";
import { useSite } from "./Providers";
import SplitReveal from "./SplitReveal";
import Magnetic from "./Magnetic";

export function Button({ href, children, onClick, download, external }: {
  href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void; download?: boolean; external?: boolean;
}) {
  return (
    <Magnetic>
      <a
        href={href}
        onClick={onClick}
        download={download || undefined}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
       
        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-current px-5 py-3 label transition-colors duration-500 hover:text-ink"
      >
        <span className="absolute inset-0 translate-y-full rounded-full bg-acid transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:translate-y-0" />
        <span className="relative">{children}</span>
      </a>
    </Magnetic>
  );
}

export default function Hero() {
  const { loaded, go } = useSite();
  return (
    <section
      data-blob="hero"
      data-theme-section="light"
      className="relative flex min-h-svh flex-col justify-between px-4 pb-6 pt-24 md:px-8 md:pb-8"
    >
      <div className="grid grid-cols-2 gap-4 label md:grid-cols-12">
        <span className="md:col-span-6">{profile.role}</span>
        <span className="text-right md:col-span-6">{profile.locations}</span>
      </div>

      <div>
        <h1 id="hero-name" className="display kinetic whitespace-nowrap text-[12.9vw]" aria-label={profile.name}>
          <SplitReveal as="span" className="block" play={loaded}>{profile.firstName}</SplitReveal>
          <SplitReveal as="span" className="block" play={loaded} delay={0.15}>{profile.lastName}</SplitReveal>
        </h1>

        <div className="mt-6 grid gap-6 md:mt-10 md:grid-cols-12 md:items-end">
          <p className="max-w-sm text-base leading-snug md:col-span-4 md:text-lg">
            {profile.intro}
          </p>
          <div className="flex flex-wrap gap-2 md:col-span-6 md:col-start-6">
            <Button href="#work" onClick={(e) => { e.preventDefault(); go("/#work", "Work"); }}>View work</Button>
            <Button href={profile.cv} download>Download CV</Button>
            <Button href={profile.github} external>GitHub ↗</Button>
          </div>
          <div className="hidden items-center justify-end gap-3 label md:col-span-2 md:flex" aria-hidden>
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-current/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.6s_ease-in-out_infinite] bg-current" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
