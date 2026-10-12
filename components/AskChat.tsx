"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Turn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["What did he build at Sirpi?", "What are his AI projects?", "What languages does he speak?"];

// "Ask about Nithin": Claude answers visitor questions from data/portfolio.ts.
export default function AskChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      gsap.fromTo(panel.current, { yPercent: 8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy]);

  const send = async (text: string) => {
    const q = text.trim().slice(0, 600);
    if (!q || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: q }].slice(-11) as Turn[];
    // API requires the history to start with a user turn
    while (next[0]?.role !== "user") next.shift();
    setTurns(next);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setTurns([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setTurns(next.slice(0, -1));
      setInput(q);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ask-panel"
        className="label fixed bottom-4 right-4 z-[75] flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-paper shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-8"
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-acid" />
        {open ? "Close" : "Ask about me"}
      </button>

      {open && (
        <div
          ref={panel}
          id="ask-panel"
          role="dialog"
          aria-label="Ask about Nithin"
          className="fixed inset-x-4 bottom-20 z-[75] flex max-h-[70svh] flex-col overflow-hidden rounded-2xl bg-ink text-paper shadow-2xl md:inset-x-auto md:bottom-24 md:right-8 md:w-[400px]"
        >
          <div className="border-b border-paper/15 px-5 py-4">
            <p className="font-[family-name:var(--font-display)] text-xl font-medium">Ask about Nithin</p>
            <p className="mt-1 text-xs text-paper/60">Answers questions about my work and experience.</p>
          </div>

          <div ref={log} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm leading-relaxed">
            {turns.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-paper/25 px-3 py-1.5 text-xs transition-colors hover:border-acid hover:text-acid">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {turns.map((t, i) =>
              t.role === "user" ? (
                <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-paper px-4 py-2 text-ink">{t.content}</p>
              ) : (
                <p key={i} className="max-w-[92%] whitespace-pre-line text-paper/90">{t.content}</p>
              )
            )}
            {busy && <p className="label animate-pulse text-acid">Thinking…</p>}
            {error && <p role="alert" className="text-xs text-acid">{error}</p>}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-paper/15 px-3 py-3"
          >
            <label htmlFor="ask-input" className="sr-only">Your question</label>
            <input
              ref={field}
              id="ask-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder="Ask anything about Nithin…"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-paper/40"
            />
            <button type="submit" disabled={busy || !input.trim()} className="label rounded-full bg-acid px-4 py-2 text-ink disabled:opacity-40">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
