"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import type { Project } from "@/data/portfolio";
import { useSite } from "./Providers";
import SplitReveal from "./SplitReveal";
import { Button } from "./Hero";
import type { Signals } from "./DistortImage";

const DistortImage = dynamic(() => import("./DistortImage"), { ssr: false });

// Label column + content column; the repeating rhythm of the page.
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 border-t border-current/20 py-10 md:grid-cols-12 md:gap-8 md:py-14">
      <h2 className="label flex items-center gap-3 self-start md:col-span-3">
        <span aria-hidden className="h-px w-10 bg-current opacity-40" />
        {label}
      </h2>
      <div className="md:col-span-8 md:col-start-5">{children}</div>
    </div>
  );
}

// Last project links home instead of looping back to the first.
export default function ProjectView({ project: p, next }: { project: Project; next?: Project }) {
  const { go, reduced, loaded } = useSite();
  const signals = useRef<Signals>({ hover: 0, velocity: 0 });
  const href = next ? `/work/${next.slug}` : "/";
  const label = next ? next.title : "Home";

  return (
    <article>
      <section data-theme-section="light" data-blob="project" className="relative px-4 pt-24 md:px-8 md:pt-32">
        <div className="label">
          <a href="/#work" onClick={(e) => { e.preventDefault(); go("/#work", "Work"); }}>
            ← All work
          </a>
        </div>

        <SplitReveal as="h1" play={loaded} className="display kinetic mt-8 text-[16vw] md:mt-12 md:text-[11vw]">
          {p.title}
        </SplitReveal>

        <p className="mt-6 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-medium leading-tight md:mt-8 md:text-3xl">
          {p.tagline}
        </p>

        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-current/20 pt-6 md:mt-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-2">
            <dt className="label opacity-60">Year</dt>
            <dd className="mt-2">{p.year}</dd>
          </div>
          <div className="md:col-span-5">
            <dt className="label opacity-60">Context</dt>
            <dd className="mt-2 leading-relaxed">{p.context}</dd>
          </div>
          <div className="col-span-2 flex flex-wrap items-start gap-2 md:col-span-5 md:justify-end">
            {p.links.length > 0 ? (
              p.links.map((l) => <Button key={l.href} href={l.href} external>{l.label} ↗</Button>)
            ) : (
              <span className="label opacity-60">Links soon</span>
            )}
          </div>
        </dl>
      </section>

      {p.image && (
        <div
          className="relative mx-4 mt-10 aspect-[4/3] overflow-hidden md:mx-8 md:mt-14 md:aspect-[16/8]"
          onPointerEnter={() => (signals.current.hover = 1)}
          onPointerLeave={() => (signals.current.hover = 0)}
         
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={`${p.title} screenshot`} className="absolute inset-0 h-full w-full object-cover" />
          {!reduced && <DistortImage images={[p.image]} signals={signals} />}
        </div>
      )}

      <section data-theme-section="light" className="relative px-4 pt-16 pb-24 md:px-8 md:pt-24 md:pb-32">
        <Row label="Overview">
          <p className="font-[family-name:var(--font-display)] text-2xl font-medium leading-snug md:text-4xl md:leading-tight">
            {p.overview}
          </p>
        </Row>
        {p.stack.length > 0 && <Row label="Stack">
          <ul className="flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <li key={s} className="rounded-full border border-current/30 px-4 py-2 text-sm">{s}</li>
            ))}
          </ul>
        </Row>}
        {p.highlights.length > 0 && (
          <Row label="Highlights">
            <ol className="space-y-6">
              {p.highlights.map((c, i) => (
                <li key={c} className="grid grid-cols-[3rem_1fr] items-baseline text-lg md:text-xl">
                  <span className="label opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </Row>
        )}
      </section>

      <section data-theme-section="light" data-blob="project" className="relative px-4 pb-24 md:px-8 md:pb-36">
        <p className="label opacity-60">{next ? "Next project" : "That's all — back to"}</p>
        <a
          href={href}
          onClick={(e) => { e.preventDefault(); go(href, label); }}
         
          className="group mt-4 flex items-baseline justify-between gap-6 border-b border-current/20 pb-6"
        >
          <span className="display kinetic text-[13vw] transition-colors duration-500 group-hover:text-acid md:text-[9vw]">
            {label}
          </span>
          <span aria-hidden className="shrink-0 text-4xl transition-transform duration-500 group-hover:translate-x-2 md:text-6xl">
            →
          </span>
        </a>
      </section>
    </article>
  );
}
