// Vercel serverless function: POST /api/chat
// Streams Claude's reply as plain text.
// 503 = no API key yet (frontend shows demo mode). Other errors return a clear reason.
import Anthropic from "@anthropic-ai/sdk";

// Tried in order. If a model name is not available on your account, the next one is used.
const MODELS = [process.env.MODEL, "claude-sonnet-5-5", "claude-sonnet-4-5", "claude-haiku-4-5"].filter(Boolean);

function friendly(err) {
  const s = err?.status;
  const raw = err?.error?.error?.message || err?.message || "Request failed";
  if (s === 401) return [401, "Your API key is wrong. Copy it again from console.anthropic.com, update it in Vercel, then redeploy."];
  if (s === 403) return [403, "This API key is not allowed to do this. Check the key's permissions in console.anthropic.com."];
  if (s === 400 && /credit|billing|balance/i.test(raw)) return [402, "Your Anthropic account has no credits. Add credits in console.anthropic.com under Billing."];
  if (s === 429) return [429, "Too many requests right now (rate limit). Wait a minute and try again."];
  if (s === 529 || s === 503) return [503, "Claude is busy right now. Try again in a moment."];
  return [500, raw];
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Use POST.");
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).send("No API key set yet.");

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (!messages.length) return res.status(400).send("No messages sent.");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY.trim() });
  let lastErr;

  for (const model of MODELS) {
    try {
      const stream = client.messages.stream({
        model,
        max_tokens: 2048,
        system: "You are Askly, a helpful assistant.",
        messages: messages.slice(-30), // last 30 messages only, to control cost
      });
      // stop only if the user really left (req "close" fires too early in Node)
      res.on("close", () => { if (!res.writableEnded) stream.abort(); });
      stream.on("text", (t) => {
        if (!res.headersSent) {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
        }
        res.write(t);
      });
      await stream.finalMessage();
      return res.end();
    } catch (err) {
      lastErr = err;
      console.error(`[askly] model ${model} failed:`, err?.status, err?.message);
      if (res.headersSent) return res.end("\n\n[Error: " + friendly(err)[1] + "]");
      if (err?.status !== 404) break; // only try the next model when the model was not found
    }
  }

  const [status, msg] = friendly(lastErr);
  res.status(status).send(msg);
}
