# Keasy KB Sync (Guides, Jobs, Community)

This file contains SQL you can re-run to sync your app data into the KB tables (`kb_documents`, `kb_chunks`).

## 0) One-time setup

If your `kb_chunks` table does not have `source_url`, add it once:

```sql
alter table public.kb_chunks
add column if not exists source_url text;
```

## 1) Guides → KB

Notes:
- `guide.content` is JSON; we cast to text.
- We generate a new UUID per KB chunk (Option A). If you re-run, delete old guide rows first.

```sql
-- Optional: clear previous guide KB rows to avoid duplicates
-- delete from kb_chunks where doc_id like 'guide:%';
-- delete from kb_documents where doc_id like 'guide:%';

insert into kb_documents (doc_id, title, source, version, updated_at)
select
  'guide:' || g.id as doc_id,
  g.name as title,
  'guide' as source,
  '1' as version,
  coalesce(g.created_at, now()) as updated_at
from guide g
where g.approved = true
  and (g.hidden_at is null or g.hidden_at > now())
on conflict (doc_id) do update
set title = excluded.title,
    updated_at = excluded.updated_at;

insert into kb_chunks (id, doc_id, chunk_title, content, tags, source_url, updated_at)
select
  gen_random_uuid() as id,
  'guide:' || g.id as doc_id,
  g.name as chunk_title,
  trim(
    coalesce(g.name,'') || E'\n\n' ||
    coalesce(g.description,'') || E'\n\n' ||
    coalesce(g.content::text,'')
  ) as content,
  array['guide']::text[] as tags,
  null::text as source_url,
  coalesce(g.created_at, now()) as updated_at
from guide g
where g.approved = true
  and (g.hidden_at is null or g.hidden_at > now());
```

## 2) Jobs → KB (no PII/contact fields)

Notes:
- We intentionally exclude `contact_*` fields for privacy.
- Uses job `id` (uuid) directly as KB chunk id.

```sql
insert into kb_documents (doc_id, title, source, version, updated_at)
select
  'job:' || j.id as doc_id,
  j.title as title,
  'job' as source,
  '1' as version,
  coalesce(j.updated_at, j.created_at, now()) as updated_at
from job j
where j.approved = true
  and (j.hidden_at is null or j.hidden_at > now())
on conflict (doc_id) do update
set title = excluded.title,
    updated_at = excluded.updated_at;

insert into kb_chunks (id, doc_id, chunk_title, content, tags, source_url, updated_at)
select
  j.id,
  'job:' || j.id as doc_id,
  j.title as chunk_title,
  trim(
    coalesce(j.title,'') || E'\n\n' ||
    coalesce(j.description,'') || E'\n\n' ||
    coalesce(j.category,'') || ' ' || coalesce(j.job_type,'') || ' ' || coalesce(j.location_type,'') || ' ' || coalesce(j.location,'') || E'\n\n' ||
    coalesce(j.experience_level,'') || E'\n\n' ||
    coalesce(array_to_string(j.skills, ', '), '') || E'\n\n' ||
    coalesce(j.required_languages::text, '')
  ) as content,
  array['job']::text[] as tags,
  null::text as source_url,
  coalesce(j.updated_at, j.created_at, now()) as updated_at
from job j
where j.approved = true
  and (j.hidden_at is null or j.hidden_at > now())
on conflict (id) do update
set chunk_title = excluded.chunk_title,
    content = excluded.content,
    tags = excluded.tags,
    updated_at = excluded.updated_at;
```

## 3) Community → KB (chat_link as clickable source_url)

```sql
insert into kb_documents (doc_id, title, source, version, updated_at)
select
  'community:' || c.id as doc_id,
  c.name as title,
  'community' as source,
  '1' as version,
  coalesce(c.created_at, now()) as updated_at
from community c
on conflict (doc_id) do update
set title = excluded.title,
    updated_at = excluded.updated_at;

insert into kb_chunks (id, doc_id, chunk_title, content, tags, source_url, updated_at)
select
  gen_random_uuid(),
  'community:' || c.id as doc_id,
  c.name as chunk_title,
  trim(
    coalesce(c.name,'') || E'\n\n' ||
    coalesce(c.description,'') || E'\n\n' ||
    coalesce(c.platforms::text,'') || E'\n\n' ||
    coalesce(c.chat_link,'')
  ) as content,
  array['community']::text[] as tags,
  c.chat_link as source_url,
  coalesce(c.created_at, now()) as updated_at
from community c;
```

Tip: If a community name is not being found, ensure the `name` appears in `content` (it does in the SQL above) and re-run the sync.

## 4) Connect Professionals → KB

Notes:
- Uses `connect_professional` table.
- Excludes contact URLs, socials, and business docs to avoid PII.
- We link results to `/connect` (list page).
- If your `connect_professional.id` is NOT a UUID, keep `gen_random_uuid()` to avoid type errors.

```sql
insert into kb_documents (doc_id, title, source, version, updated_at)
select
  'professional:' || p.id as doc_id,
  p.full_name as title,
  'professional' as source,
  '1' as version,
  coalesce(p.updated_at, p.created_at, now()) as updated_at
from connect_professional p
where p.show = true
on conflict (doc_id) do update
set title = excluded.title,
    updated_at = excluded.updated_at;

insert into kb_chunks (id, doc_id, chunk_title, content, tags, source_url, updated_at)
select
  gen_random_uuid() as id,
  'professional:' || p.id as doc_id,
  p.full_name as chunk_title,
  trim(
    coalesce(p.full_name,'') || E'\n\n' ||
    coalesce(p.role,'') || E'\n\n' ||
    coalesce(p.industry,'') || E'\n\n' ||
    coalesce(p.bio,'') || E'\n\n' ||
    coalesce(p.bio_list::text,'') || E'\n\n' ||
    coalesce(p.location::text,'') || E'\n\n' ||
    coalesce(p.experience::text,'') || E'\n\n' ||
    coalesce(p.quote,'') || E'\n\n' ||
    coalesce(p.style::text,'')
  ) as content,
  array['professional']::text[] as tags,
  '/connect' as source_url,
  coalesce(p.updated_at, p.created_at, now()) as updated_at
from connect_professional p
where p.show = true;
```

## 5) Verify KB data

```sql
select doc_id, chunk_title
from kb_chunks
where content ilike '%koreailtalk%' or chunk_title ilike '%koreailtalk%';
```

```sql
select doc_id, chunk_title,
       ts_rank_cd(to_tsvector('english', content), websearch_to_tsquery('english', 'koreailtalk train booking')) as rank
from kb_chunks
where to_tsvector('english', content) @@ websearch_to_tsquery('english', 'koreailtalk train booking')
order by rank desc
limit 5;
```

## 6) Re-sync without duplicates

If you used UUIDs in KB chunks (Guides/Community), delete and re-insert:

```sql
delete from kb_chunks where doc_id like 'guide:%' or doc_id like 'community:%';
delete from kb_documents where doc_id like 'guide:%' or doc_id like 'community:%';
```

Then re-run the relevant insert sections.
