import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "@/lib/melvin-ai";

// Node runtime; this route is a serverless function on Vercel. Rest of the
// site stays static.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Free-tier Gemini fallback chain. Each model has its OWN quota bucket, so when
// one is rate-limited (429) or overloaded (503) we fall through to the next.
// This keeps the bot answering even when a single model is exhausted/busy.
const MODELS = [
  "gemini-2.5-flash-lite", // highest free quota — primary
  "gemini-2.5-flash",      // reliable fallback
  "gemini-2.0-flash",      // separate bucket
  "gemini-flash-latest",   // last resort
];

type ChatMessage = { role: "user" | "assistant"; content: string };

/* ─────────────── Abuse guards ───────────────
   A public AI endpoint will get poked. These keep it a "Melvin bot", not a
   free ChatGPT, and stop anyone burning the free-tier quota. */

const MAX_MESSAGES = 12;      // history depth sent to the model
const MAX_CHARS = 600;        // per user message — a question, not an essay
const MAX_OUTPUT_TOKENS = 600;

// Per-IP sliding-window limiter (in-memory, best-effort). Serverless instances
// are ephemeral so this is a casual-abuse deterrent, not a hard wall — for that,
// swap in Upstash/Vercel KV. Good enough for a portfolio.
const PER_MINUTE = 6;
const PER_DAY = 40;
const hits = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; reason?: string } {
  const now = Date.now();
  const minuteAgo = now - 60_000;
  const dayAgo = now - 86_400_000;
  const stamps = (hits.get(ip) ?? []).filter((t) => t > dayAgo);

  if (stamps.length >= PER_DAY) return { ok: false, reason: "daily" };
  if (stamps.filter((t) => t > minuteAgo).length >= PER_MINUTE)
    return { ok: false, reason: "minute" };

  stamps.push(now);
  hits.set(ip, stamps);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const live = v.filter((t) => t > dayAgo);
      if (live.length === 0) hits.delete(k);
      else hits.set(k, live);
    }
  }
  return { ok: true };
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Melvin AI is not configured yet (missing API key)." },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    const msg =
      limit.reason === "minute"
        ? "Easy there — too many messages too fast. Give it a few seconds."
        : "You've hit today's chat limit. For anything more, email melvinjoshy5@gmail.com.";
    return Response.json({ error: msg }, { status: 429 });
  }

  let messages: ChatMessage[];
  try {
    messages = (await req.json())?.messages;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  // Validate, clamp, and map to Gemini's content shape ("model", not "assistant").
  const contents = messages
    .slice(-MAX_MESSAGES)
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content.slice(0, MAX_CHARS) }],
    }));

  if (contents.length === 0 || contents[contents.length - 1].role !== "user") {
    return Response.json({ error: "Last message must be from the user." }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const errStatus = (err: unknown): number =>
    (err as { status?: number })?.status ??
    (err as { error?: { code?: number } })?.error?.code ?? 0;

  // thinkingConfig only applies to 2.5 "thinking" models; sending it to others
  // can be rejected, so build the config per model.
  const configFor = (model: string) => ({
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.7,
    ...(model.includes("2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
  });

  // Open the stream BEFORE returning, pulling the first chunk so failures surface
  // here (as a real error status the widget turns into "Try again"). Walk the
  // model fallback chain: retry the SAME model only on a transient hiccup
  // (503/500/network); on 429 (quota) move straight to the next model's bucket.
  let iterator: AsyncIterator<{ text?: string }> | null = null;
  let firstText = "";
  let lastStatus = 0;
  const RETRY_TRANSIENT = 1; // extra same-model retries for a pure 503/500

  outer:
  for (const model of MODELS) {
    for (let attempt = 0; attempt <= RETRY_TRANSIENT; attempt++) {
      try {
        const result = await ai.models.generateContentStream({
          model,
          contents,
          config: configFor(model),
        });
        const it = result[Symbol.asyncIterator]();
        const first = await it.next(); // transient errors usually surface here
        iterator = it;
        if (!first.done) firstText = first.value?.text ?? "";
        break outer;
      } catch (err) {
        lastStatus = errStatus(err);
        console.error(`[chat] ${model} failed (status ${lastStatus}):`,
          (err as Error)?.message ?? err);
        // Retry the same model once for a pure overload/hiccup; otherwise (incl.
        // 429 quota) fall through to the next model in the chain.
        const transient = lastStatus === 503 || lastStatus === 500 || lastStatus === 0;
        if (transient && attempt < RETRY_TRANSIENT) {
          await new Promise((r) => setTimeout(r, 400));
          continue;
        }
        break; // next model
      }
    }
  }

  if (!iterator) {
    const msg = lastStatus === 429
      ? "Melvin AI is fielding a lot of questions right now. Give it a few seconds and try again."
      : "Melvin AI is briefly unavailable. Please try again, or reach Melvin at melvinjoshy5@gmail.com.";
    return Response.json({ error: msg }, { status: lastStatus === 429 ? 429 : 503 });
  }

  const it = iterator;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (firstText) controller.enqueue(encoder.encode(firstText));
        for (;;) {
          const { done, value } = await it.next();
          if (done) break;
          // The `.text` getter can throw on a blocked/empty chunk — treat that
          // as a mid-stream failure rather than a silent end.
          let text: string | undefined;
          try { text = value?.text; } catch { text = undefined; }
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        // Surface the failure as a stream error so the widget shows "Try again"
        // instead of presenting a silently truncated fragment as a finished reply.
        console.error("[chat] mid-stream error:", (err as Error)?.message ?? err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
