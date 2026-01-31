# Keasy (Vite + Express)

This project runs a Vite frontend and an Express backend together. The frontend **only** calls the Keasy AI backend at `POST /api/keasy/chat`.

## Environment variables

Create a single `.env` at the repo root (`../.env`) so both Vite and the Express server read the same file.

Frontend (Vite):
- `VITE_KEASY_SUPABASE_URL`
- `VITE_KEASY_SUPABASE_ANON_KEY`
- `VITE_KEASY_API_URL` (optional; set to full API base URL in production)

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

## Amplify Hosting + Function (production)

This repo deploys the API as an Amplify Function and exposes it through API Gateway at
`/api/keasy/chat` (see `amplify/backend.ts`).

After deploy:
- Find the API endpoint in `amplify_outputs.json` (`keasyApiEndpoint`).
- In Amplify Hosting → Rewrites and redirects, add a **200 rewrite**:
  - Source: `/api/<*>`
  - Target: `https://<api-id>.execute-api.<region>.amazonaws.com/api/<*>`

This keeps the frontend calling `/api/keasy/chat` without code changes.

## Supabase KB schema

See `supabase/keasy_kb.sql` for the KB tables and indexes.
