# Askly

A fast, clean chat app built on the Claude API.

## Features
- Streaming replies (word by word)
- Chat history with search, grouped by day
- Edit and resend messages, retry replies, stop button
- Markdown, tables, and code blocks with copy buttons
- Light, dark, and system themes
- Works on mobile

## Setup
1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env` and add your Anthropic API key.
3. Run:
   ```bash
   npm install
   npm start
   ```
4. Open http://localhost:3000

## Project structure
```
askly/
├── public/index.html   # frontend
├── server.js           # backend (calls Claude API)
├── package.json
├── .env.example        # copy to .env, add your key
└── .gitignore
```

## Security
- Never commit your `.env` file. It is listed in `.gitignore`.
- Before going live, add login and rate limits so others cannot use your API credits.
