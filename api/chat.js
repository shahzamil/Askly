// Vercel serverless function: POST /api/chat
// Streams Claude's reply as plain text. Returns 503 when no API key is set,
// which makes the frontend switch to demo mode.
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.MODEL || "claude-sonnet-5-5";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Use POST.");
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).send("No API key set yet.");

  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length) return res.status(400).send("No messages sent.");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 2048,
      system: "You are Askly, a helpful assistant.",
      messages: messages.slice(-30), // last 30 messages only, to control cost
    });
    req.on("close", () => stream.abort());
    stream.on("text", (t) => res.write(t));
    await stream.finalMessage();
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500);
    res.end("\n\n[Error: " + (err?.message || "request failed") + "]");
  }
}
