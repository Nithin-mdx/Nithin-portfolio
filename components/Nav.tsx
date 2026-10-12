"use client";

import Link from "next/link";
import { useSite } from "./Providers";
import Scramble from "./Scramble";
import Magnetic from "./Magnetic";

const LINKS = [
  { href: "/#about", label: "About" },
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const { go } = useSite();
  const nav = (href: string, label: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    go(href, label);
  };
  return (
    <header className="fixed inset-x-0 top-0 z-[70] flex items-start justify-between px-4 py-4 text-paper mix-blend-difference md:px-8 md:py-6">
      <Link href="/" onClick={nav("/", "Home")} className="label">
        <Magnetic><span className="inline-block py-1">Nithin Nandakumar<span className="sr-only"> — home</span></span></Magnetic>
      </Link>
      <nav aria-label="Primary">
        <ul className="label flex gap-4 md:gap-8">
          {LINKS.map((l, i) => (
            <li key={l.href} className={i === 0 || i === 2 ? "hidden md:block" : ""}>
              <Magnetic>
                <a href={l.href} onClick={nav(l.href, l.label)} className="inline-block py-1">
                  <Scramble text={l.label} />
                </a>
              </Magnetic>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
