# KEASY_AI_PLAN.md
_Last updated: 2026-01-30 (Asia/Seoul)_

This document is a **build + repair plan** for “Keasy AI” on your website/mobile app.

**Goal (must-have):**
1. Keasy AI answers **from Supabase Knowledge Base (KB) first**  
2. If KB doesn’t contain the answer with high confidence → **web fallback with sources (if enabled)** OR **general-knowledge fallback (if web is disabled)**  
3. **Never expose personal information (PII)**  
4. Works reliably in production (rate limits, logs, tests)
5. **Enterprise-grade UI for the Keasy chat experience** (clean, minimal, consistent colors)

**Important constraints:**
- **Do NOT put DeepSeek API keys or Search API keys in the mobile app or frontend.** Keep them server-side.
- If web fallback is enabled, it must use **sanitized queries** (PII redacted).
- If web fallback is disabled, use **general-knowledge answers** only when KB is insufficient, with **no sources** and strict PII refusal.
- If user asks for personal data about someone, Keasy must **refuse**.

---

## 1) Target architecture (recommended)

### Components
- **Frontend** (Website / Mobile): UI only, calls your backend `/api/keasy/chat`
- **Backend (Keasy Router)**: the only service that can:
  - query Supabase KB
  - call DeepSeek API
  - call Web Search API (optional)
  - enforce privacy rules
- **Supabase**:
  - KB tables (safe/public knowledge)
  - private tables (customers/accounts/orders) with strict RLS
- **DeepSeek API**: LLM completion
- **Web Search API**: fallback search (Bing / SerpAPI / etc.) — optional

### Runtime flow
1. Receive user message
2. **PII redaction** (input sanitizer)
3. Retrieve from **Supabase KB**
4. If **confidence ≥ threshold**:
   - call DeepSeek with **KB-only prompt**
   - return answer (no web)
5. Else:
   - If web fallback enabled:
     - web search using **sanitized query**
     - fetch top pages, extract text
     - call DeepSeek with **web-only prompt** (include sources)
   - If web fallback disabled:
     - call DeepSeek with **general-knowledge prompt** (no sources)
6. **Output PII filter** (final safety)
7. Return response with mode = `kb`, `web`, or `general` (sources only when web)

---

## 2) What to add in Supabase

### 2.1 Extensions (recommended)
- If you want semantic search: enable `pgvector`.
- If you want keyword search only: use Postgres full-text search (no extra extension needed).

### 2.2 Tables (copy/paste schema plan)

#### Table: `kb_documents`
Stores documents metadata.
- `doc_id` (text, PK or unique)
- `title` (text)
- `source` (text) — e.g. `internal_manual`, `faq`, `policy`
- `version` (text)
- `updated_at` (timestamptz)

#### Table: `kb_chunks`
Stores searchable chunks.
- `id` (uuid, PK)
- `doc_id` (text, FK → kb_documents.doc_id)
- `chunk_title` (text)
- `content` (text)
- `tags` (text[])
- `embedding` (vector) — **optional** (only if using pgvector)
- `updated_at` (timestamptz)

**Chunking guidance:**
- Split by headings (`##`, `###`) or ~300–800 tokens per chunk.
- Store `chunk_title` like “Pricing > Refund policy”.
- Keep PII out of KB.

#### Optional table: `kb_web_cache` (recommended later)
To store verified web findings (with sources) so future queries hit KB.
- `id` (uuid, PK)
- `query_hash` (text)
- `question_sanitized` (text)
- `answer` (text)
- `sources` (jsonb) — list of `{title, url, retrieved_at}`
- `created_at` (timestamptz)

### 2.3 RLS policies (critical)
**Principle:** KB tables are safe; private tables must not be readable from client.

- `kb_documents`, `kb_chunks`: you can allow **read** to anon/auth if it’s purely public knowledge, OR restrict to backend only.
- Private tables (customers/accounts/orders/payments):
  - **Enable RLS**
  - **No direct selects** from anon/auth
  - Only backend uses Supabase service role key

**Minimum rule:** Mobile/web frontend never gets service role key.

---

## 3) Retrieval options (choose one)

### Option A — Keyword search (fast MVP)
Use Postgres full-text search on `kb_chunks.content`.
- Pros: quick, no embeddings
- Cons: weaker when user wording differs from docs

### Option B — Semantic search (best quality)
Use `pgvector` and embeddings for each chunk.
- Pros: best match quality
- Cons: needs embedding generation

**Recommendation:**
- Start with Option A if you need speed, then upgrade to Option B.

---

## 4) Confidence gating (prevents hallucinations)
Do not answer from KB unless confidence is good.

### For keyword search:
- If no chunks returned → web fallback (if enabled) **or** general-knowledge fallback (if web is disabled)
- If best match is weak (few hits / low rank) → web fallback (if enabled) **or** general-knowledge fallback (if web is disabled)

### For embeddings:
- Use cosine similarity threshold (example starting point):
  - `>= 0.78` → KB answer
  - `< 0.78` → web fallback (if enabled) **or** general-knowledge fallback (if web is disabled)  
(You must tune threshold on your data.)

---

## 5) Privacy & PII protection (must-have)

### 5.1 Input sanitization (before KB, DeepSeek, web search)
Redact:
- emails → `[EMAIL]`
- phone → `[PHONE]`
- addresses → `[ADDRESS]`
- IDs (passport/ARC/etc) → `[ID_NUMBER]`
- card/bank → `[FINANCIAL]`
- order/account IDs (if sensitive) → `[ACCOUNT_ID]`

**Policy:** web search uses *sanitized* query only.

### 5.2 Output filtering (after DeepSeek)
Scan output for:
- email patterns
- phone patterns
- ID-like patterns
If found:
- mask them or replace with `[REDACTED]`
- if response is primarily PII → refuse

### 5.3 Refusal rules
If user asks for personal info about a person (or to doxx/track):
- Refuse: “I can’t help with sharing personal information.”
- Provide safe alternatives: official support flow, account recovery, etc.

---

## 6) Prompt templates (DeepSeek)

### 6.1 KB-only prompt (strict)
**SYSTEM (KB_MODE):**
You are Keasy AI. Use ONLY the information inside KB_REFERENCE to answer.
- If the answer is not in KB_REFERENCE, reply exactly: `NEED_WEB`.
- Do NOT reveal personal information. If any personal info appears in KB_REFERENCE, replace it with `[REDACTED]`.
- Be concise and accurate. Do not guess.

**USER:**
KB_REFERENCE:
<insert top relevant chunks here with titles>

QUESTION:
<sanitized user question>

### 6.2 Web-only prompt (with sources)
**SYSTEM (WEB_MODE):**
You are Keasy AI. Use ONLY WEB_SOURCES to answer. Include sources.
- Do NOT reveal personal information. If any appears, redact it.
- If sources are insufficient, say so.
- Provide citations as a bullet list “Sources:” with title + domain (no PII).

**USER:**
WEB_SOURCES:
<insert extracted text snippets, each labeled with a source id/title/domain>

QUESTION:
<sanitized user question>

### 6.3 General-knowledge prompt (no sources, web disabled)
**SYSTEM (GENERAL_MODE):**
You are Keasy AI. Answer using your general knowledge.
- Do NOT reveal personal information. If asked for personal info about someone, refuse.
- Do NOT invent sources or citations.
- If you are unsure, say you are not sure.
- Be concise and accurate. Do not guess about sensitive or private data.

**USER:**
QUESTION:
<sanitized user question>

---

## 7) “Keasy Router” backend endpoint (spec)

### Endpoint
`POST /api/keasy/chat`

### Request JSON
- `message` (string)
- `session_id` (string, optional)
- `user_id` (string, optional)
- `locale` (string, optional)

### Response JSON
- `answer` (string)
- `mode` (`"kb"` | `"web"` | `"general"` | `"refuse"`)
- `sources` (array, optional; web mode only)
- `redactions_applied` (boolean)
- `debug` (optional in dev only: scores, chunk ids)

### Behavior
1. `sanitized = redactPII(message)`
2. `kbResults = searchKB(sanitized)`
3. if `kbConfident(kbResults)`:
   - run DeepSeek KB prompt
   - if model returns `NEED_WEB` → web fallback (if enabled) **or** general-knowledge fallback (if web is disabled)
4. else:
   - if web fallback enabled:
     - run web search (sanitized)
     - fetch + extract top pages
     - run DeepSeek WEB prompt
   - if web fallback disabled:
     - run DeepSeek GENERAL prompt
5. `final = filterPII(output)`
6. return

---

## 8) Web fallback implementation notes (only if enabled)
- Use a trusted search API; do not scrape from client.
- Fetch 3–5 top results max.
- Extract readable text (strip nav, footer).
- Pass *short* snippets to the model (don’t dump entire pages).
- Always return sources.

---

## 9) “Prebuilt Keasy AI is not working” — repair checklist
Use this checklist to diagnose + update your existing Keasy integration.

### 9.1 Key problems (most common)
- API key in frontend (security + can be blocked)  
- No KB confidence gate (hallucinations)  
- No PII redaction before web search (privacy risk)  
- Web fallback uses raw user question (PII leaks)  
- Supabase query is wrong table / no indexing / RLS blocks access  
- Prompt doesn’t enforce “KB-only or NEED_WEB”  
- Too-large context (timeouts / token overflow)

### 9.2 Minimum fixes
- Move DeepSeek calls to backend
- Implement `/api/keasy/chat` router
- Add PII sanitizer + output filter
- Add KB search + confidence gate
- Add strict KB prompt that returns `NEED_WEB` when missing
- Add web fallback with sources (if enabled) or general-knowledge fallback (if web disabled)

---

## 10) Testing plan (you must do this)
Create test cases (at least 30):
1. Questions clearly answered in KB
2. Questions not in KB → web fallback (if enabled) **or** general fallback (if web disabled)
3. PII in question (email/phone) → should redact & not leak
4. User asks for someone’s phone/email → refusal
5. Conflicting web sources → note conflict (if web enabled)

### Expected outcomes
- Zero PII printed
- KB answers reference KB content
- Web answers include sources (if web enabled)
- General answers do not include sources (if web disabled)
- Refusals for doxxing requests

---

## 11) Operational controls (production hardening)
- Rate limiting per IP/user
- Abuse detection (repeated PII requests)
- Timeouts + retries with backoff (server-side)
- Logging:
  - mode (kb/web/general/refuse)
  - KB doc_ids used
  - web domains used (if web enabled)
  - **never store raw unsanitized user messages**

---

## 12) “MD-only prompt” for Codex/Cursor in VS Code
Copy/paste the prompt below into your VS Code agent.  
It is designed to force the agent to **use THIS file as the single source of truth**, implement the router, and iterate until tests pass.

> **IMPORTANT:** The agent cannot “run forever”, but you can instruct it to repeat a loop: implement → run tests → fix → repeat, until green.

### CODEx PROMPT (paste as-is)
You are an engineering agent working in this repository.  
You MUST follow the instructions in `KEASY_AI_PLAN.md` exactly. Treat it as the source of truth.

Your job:
1) Locate the existing “Keasy AI” implementation and identify why it’s not working.  
2) Implement or refactor to match the plan:
   - Add `/api/keasy/chat` router endpoint on backend
   - Supabase KB search (keyword first; embeddings optional)
   - Confidence gate
   - DeepSeek KB-only prompt returning `NEED_WEB` when KB insufficient
   - Web fallback using sanitized query + citations (if enabled)
   - General-knowledge fallback when web is disabled (no sources)
   - Strict PII redaction before KB/LLM/web, and output PII filter
   - No API keys in frontend
3) Add tests:
   - KB hit
   - KB miss → web fallback (if enabled) or general fallback (if web disabled)
   - PII redaction input
   - PII not present in output
   - Refusal for personal-info request
4) Iterate until working:
   - After every change, run existing test commands (or add a minimal test runner).
   - Fix failures.
   - Repeat until all tests pass and `/api/keasy/chat` works end-to-end.

Rules:
- Never expose or log raw PII.
- Do not move secrets into frontend.
- Keep prompts exactly as specified; only adjust thresholds if tests require.
- If you need configuration, add it via server-side env vars:
  - DEEPSEEK_API_KEY
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - SEARCH_API_KEY (only if web fallback implemented)
- Document any new env vars in README.

Deliverables:
- Working `/api/keasy/chat`
- Updated Supabase queries
- PII scrubber + output filter
- Tests and brief docs

---

## 13) What you must fill in (your project specifics)
Before running the agent, decide:
- Backend stack: Node/Express? Next.js API routes? Python/FastAPI?
- Search provider: Bing/SerpAPI/other (only if web fallback enabled)
- KB retrieval: keyword only (MVP) or embeddings (pgvector)
 - Web fallback enabled (yes/no); if no, use general-knowledge fallback

If you are not sure:
- Start keyword-only + web fallback, then add embeddings later (or start KB-only + general fallback if you do not want web search).

---

## 14) Quick “Supabase KB bootstrap” checklist (no MD needed)
1) Create `kb_documents` and `kb_chunks`
2) Insert 1–3 docs (FAQ, pricing, policies)
3) Chunk them into ~10–50 chunks
4) Verify your KB search returns sensible results
5) Turn on Keasy router endpoint and test KB-only answers

---

## 15) Success criteria (definition of done)
- ✅ Keasy answers from Supabase KB when available  
- ✅ If KB doesn’t contain it, Keasy uses web fallback with sources **(if enabled)** or general-knowledge fallback **(if web is disabled)**  
- ✅ No personal information is exposed  
- ✅ API keys only on backend  
- ✅ Automated tests pass  
- ✅ “Prebuilt Keasy AI” path is fixed or replaced with the router
- ✅ Chat UI is enterprise-grade: clean layout, limited palette, consistent buttons, and accessible contrast

---

## 16) UI Refresh (Enterprise-grade)
**Scope:** Keasy chat UI only.  
**Goal:** Reduce visual noise and enforce a professional, consistent visual system.

### 16.1 Design constraints
- Limit the palette to **one primary**, **one neutral**, **one accent**.
- Use a **single font family** (headings + body) and consistent sizes.
- Buttons for links must look consistent (same padding, radius, and color).
- Maintain **WCAG-friendly contrast** for text.

### 16.2 UI tasks
1. Replace multi-color styles with a **minimal color system**.
2. Standardize chat bubble styles (spacing, background, border).
3. Make link buttons consistent with a single primary style.
4. Ensure mobile + desktop layouts are clean and readable.

### 16.3 Acceptance tests (visual)
- Only one primary brand color is used for interactive elements.
- No rainbow gradients or mixed-color button styles.
- Link buttons are clearly clickable and consistent.
