import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.MODEL || "claude-sonnet-5-5";

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// POST /api/chat  { messages: [{ role: "user" | "assistant", content: "..." }] }
// Streams plain text back to the browser.
app.post("/api/chat", async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  if (!messages.length) return res.status(400).send("No messages sent.");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 2048,
      system: "You are Askly, a helpful assistant.",
      messages: messages.slice(-30), // keep the last 30 messages to control cost
    });
    req.on("close", () => stream.abort()); // user pressed Stop
    stream.on("text", (t) => res.write(t));
    await stream.finalMessage();
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500);
    res.end("\n\n[Error: " + (err?.message || "request failed") + "]");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Askly running on http://localhost:${port}`));
