# Keasy (Vite + Express)

This project runs a Vite frontend and an Express backend together. The frontend **only** calls the Keasy AI backend at `POST /api/keasy/chat`.

## Environment variables

Frontend (Vite):
- `VITE_KEASY_SUPABASE_URL`
- `VITE_KEASY_SUPABASE_ANON_KEY`

Backend (server-only):
- `DEEPSEEK_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Important:
- Do **not** use `VITE_DEEPSEEK_API_KEY` or any client-side DeepSeek keys.
- Only `VITE_` variables are exposed to the client bundle.

## Development

```bash
npm install
npm run dev
```

- Vite runs on `http://localhost:3000`
- Express runs on `http://localhost:4000`
- `/api/*` requests are proxied to the backend

## Keasy AI endpoint

- `POST /api/keasy/chat`
- Request: `{ "message": "...", "session_id": "optional", "user_id": "optional", "locale": "optional" }`
- Response: `{ "answer": "...", "mode": "kb|general|refuse", "sources": [], "redactions_applied": true }`

Notes:
- Web fallback is disabled. If KB is insufficient, the answer comes from general knowledge (no sources).

## Supabase KB schema

See `supabase/keasy_kb.sql` for the KB tables and indexes.
