"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

// A typical agent workflow from the n8n work at Sirpi. Draws itself on scroll; acid pulses show data flowing.
type Node = { id: string; label: string; title: string; col: number; row: number; accent?: boolean };

const NODES: Node[] = [
  { id: "trigger", label: "Trigger", title: "Website chat", col: 0, row: 1 },
  { id: "n8n", label: "n8n", title: "Webhook", col: 1, row: 1 },
  { id: "agent", label: "AI agent", title: "LLM with tools", col: 2, row: 1, accent: true },
  { id: "zoho", label: "Tool", title: "Zoho CRM", col: 3, row: 0 },
  { id: "sheets", label: "Tool", title: "Google Sheets", col: 3, row: 1 },
  { id: "gmail", label: "Tool", title: "Gmail", col: 3, row: 2 },
  { id: "reply", label: "Output", title: "Answer the user", col: 4, row: 1 },
];
const EDGES: [string, string][] = [
  ["trigger", "n8n"],
  ["n8n", "agent"],
  ["agent", "zoho"],
  ["agent", "sheets"],
  ["agent", "gmail"],
  ["zoho", "reply"],
  ["sheets", "reply"],
  ["gmail", "reply"],
];

const W = 200;
const H = 76;

function layout(vertical: boolean) {
  // Horizontal: 5 columns, tools stacked in column 3. Vertical (phones): one column in NODES order.
  const box = Object.fromEntries(
    NODES.map((n, i) => [n.id, vertical ? { x: 50, y: 10 + i * 110 } : { x: n.col * 250, y: 20 + n.row * 110 }])
  );
  const paths = EDGES.map(([a, b]) => {
    const p = box[a];
    const q = box[b];
    if (!vertical) {
      const x1 = p.x + W, y1 = p.y + H / 2, x2 = q.x, y2 = q.y + H / 2;
      return `M ${x1} ${y1} C ${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
    }
    if (q.y - p.y === 110) {
      const x = p.x + W / 2;
      return `M ${x} ${p.y + H} L ${x} ${q.y}`; // neighbours: straight down
    }
    // longer jumps loop round the side: agent's tools on the left, into reply on the right
    const left = a === "agent";
    const x = left ? p.x : p.x + W;
    const bend = left ? -40 : 40;
    return `M ${x} ${p.y + H / 2} C ${x + bend} ${p.y + H / 2}, ${x + bend} ${q.y + H / 2}, ${x} ${q.y + H / 2}`;
  });
  return { box, paths, view: vertical ? "0 0 300 780" : "0 0 1200 370" };
}

function Diagram({ vertical, className }: { vertical: boolean; className: string }) {
  const { box, paths, view } = layout(vertical);
  const key = vertical ? "v" : "h";
  return (
    <svg viewBox={view} className={className} role="img" aria-label="Workflow: website chat triggers an n8n webhook, an AI agent uses Zoho CRM, Google Sheets and Gmail as tools, then answers the user.">
      {paths.map((d, i) => (
        <path key={i} id={`wf-${key}-${i}`} d={d} className="wf-edge" fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} />
      ))}
      {paths.map((_, i) => (
        <circle key={i} r={4.5} className="wf-pulse" fill="#c6ff3d">
          <animateMotion dur="2.6s" repeatCount="indefinite" begin={`${(i % 4) * 0.5}s`}>
            <mpath href={`#wf-${key}-${i}`} />
          </animateMotion>
        </circle>
      ))}
      {NODES.map((n) => {
        const { x, y } = box[n.id];
        return (
          <g key={n.id} className="wf-node" transform={`translate(${x} ${y})`}>
            <rect width={W} height={H} rx={14} fill={n.accent ? "#c6ff3d" : "var(--bg)"} stroke={n.accent ? "#c6ff3d" : "currentColor"} strokeOpacity={n.accent ? 1 : 0.3} />
            <text x={18} y={28} fontSize={11} letterSpacing={1.5} fill={n.accent ? "#0e0e0e" : "currentColor"} opacity={0.6} style={{ textTransform: "uppercase" }}>
              {n.label}
            </text>
            <text x={18} y={55} fontSize={20} fill={n.accent ? "#0e0e0e" : "currentColor"} style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {n.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Workflow() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = root.current!;
    const edges = el.querySelectorAll<SVGPathElement>(".wf-edge");
    edges.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", end: "center 50%", scrub: true } });
    tl.from(el.querySelectorAll(".wf-node"), { opacity: 0, y: 12, stagger: 0.08, ease: "power2.out" }, 0)
      .to(edges, { strokeDashoffset: 0, stagger: 0.06, ease: "none" }, 0.1)
      .from(el.querySelectorAll(".wf-pulse"), { opacity: 0 }, ">-0.1");
    return () => { tl.revert(); };
  }, []);

  return (
    <div ref={root} className="mt-24 md:mt-32">
      <div className="grid gap-4 md:grid-cols-12 md:gap-8">
        <h3 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-tight md:col-span-5 md:text-4xl">
          How I automate
        </h3>
        <p className="max-w-md text-base opacity-70 md:col-span-5 md:col-start-8">
          A typical agent workflow from my n8n work at Sirpi: a chat message comes in, an AI agent decides which tools
          to use, and the answer goes back to the user.
        </p>
      </div>
      <Diagram vertical={false} className="mt-12 hidden w-full md:block" />
      <Diagram vertical className="mx-auto mt-10 w-full max-w-[340px] md:hidden" />
    </div>
  );
}
