# Askly

A fast, clean chat app built on the Claude API.

## Features
- Streaming replies (word by word)
- Chat history with search, grouped by day
- Edit and resend messages, retry replies, stop button
- Markdown, tables, and code blocks with copy buttons
- Light, dark, and system themes
- Works on mobile
- Demo mode when no API key is set

## Deploy on Vercel
1. Import this repo on vercel.com (Framework preset: Other).
2. Click Deploy. The site works in demo mode right away.
3. To turn on real answers: Settings → Environment Variables → add `ANTHROPIC_API_KEY`, then redeploy.

## Run on your computer
```bash
cp .env.example .env   # add your API key
npm install
npm start              # open http://localhost:3000
```

## Project structure
```
public/index.html   frontend
api/chat.js         backend (Vercel function, calls Claude)
local-server.js     runs the app locally
```

## Security
- Never commit `.env`. It is in `.gitignore`.
- Before sharing the link publicly, add login and rate limits so others cannot use your API credits.
