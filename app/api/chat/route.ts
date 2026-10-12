import Anthropic from "@anthropic-ai/sdk";
import { awards, education, experience, profile, projects, skills, socialService } from "@/data/portfolio";

export const runtime = "nodejs";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

// Frozen system prompt (built once) so prompt caching hits on every request.
const SYSTEM = `You are the assistant on ${profile.name}'s portfolio website. Visitors (often recruiters) ask you about him.

Rules:
- Answer only from the portfolio data below. If something isn't there, say you don't know and suggest emailing ${profile.email}.
- Refer to him as Nithin, in the third person. British English. Warm, confident, concise: 1-3 short paragraphs, no markdown headings, no bullet lists longer than 4 items.
- Stay on topic: Nithin, his work, skills and how to contact him. Politely decline anything else.
- If asked what you are, say you are the assistant on Nithin's portfolio. Do not name the AI model or company behind you.
- If asked for his CV, say it can be downloaded from the "Download CV" button at the top of the page.

Portfolio data (JSON):
${JSON.stringify({ profile, skills, projects, experience, education, awards, socialService })}`;

// ponytail: in-memory per-IP limit; resets per serverless instance. Use a KV store if abused.
const hits = new Map<string, number[]>();
const LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;

type ChatTurn = { role: "user" | "assistant"; content: string };

function valid(body: unknown): body is { messages: ChatTurn[] } {
  const m = (body as { messages?: unknown })?.messages;
  return (
    Array.isArray(m) &&
    m.length > 0 &&
    m.length <= 12 &&
    m.every(
      (t, i) =>
        t &&
        typeof t.content === "string" &&
        t.content.length > 0 &&
        t.content.length <= 600 &&
        t.role === (i % 2 === 0 ? "user" : "assistant")
    ) &&
    m[m.length - 1].role === "user"
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return Response.json({ error: "You've asked a lot of questions — try again in a few minutes." }, { status: 429 });
  }
  hits.set(ip, [...recent, now]);

  const body = await req.json().catch(() => null);
  if (!valid(body)) return Response.json({ error: "Invalid request." }, { status: 400 });

  try {
    const final = await client.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 2000, // cost cap for a public endpoint; replies are short by design
      cache_control: { type: "ephemeral" },
      system: SYSTEM,
      messages: body.messages,
    });

    if (final.stop_reason === "refusal") {
      return Response.json({ reply: "I can only help with questions about Nithin and his work." });
    }
    const reply = final.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("\n")
      .trim();
    return Response.json({ reply: reply || "Sorry, I couldn't answer that — try asking another way." });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "The assistant is busy — try again in a moment." }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Claude API error", error.status, error.message);
      return Response.json({ error: "The assistant is unavailable right now." }, { status: 502 });
    }
    throw error;
  }
}
