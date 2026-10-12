"use client";

import { useEffect, useState } from "react";
import { clocks, profile } from "@/data/portfolio";

export default function Footer() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer data-theme-section="dark" className="relative grid grid-cols-2 gap-6 px-4 pb-8 pt-16 label md:grid-cols-12 md:px-8">
      {clocks.map((c) => (
        <div key={c.city} className="md:col-span-3">
          <p className="opacity-60">{c.city}</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tabular-nums tracking-normal">
            {now ? now.toLocaleTimeString("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </p>
        </div>
      ))}
      <p className="col-span-2 self-end opacity-60 md:col-span-3 md:col-start-10 md:text-right">
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
