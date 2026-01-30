-- Keasy KB schema (keyword search, Option A)

create table if not exists kb_documents (
  doc_id text primary key,
  title text,
  source text,
  version text,
  updated_at timestamptz default now()
);

create table if not exists kb_chunks (
  id uuid primary key,
  doc_id text references kb_documents(doc_id),
  chunk_title text,
  content text,
  tags text[],
  source_url text,
  updated_at timestamptz default now()
);

-- Full-text search index for keyword search
create index if not exists kb_chunks_content_fts_idx
  on kb_chunks
  using gin (to_tsvector('english', content));
