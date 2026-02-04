# Guides Page (Next.js App Router)

This doc describes the Guides master-detail layout in the Next.js app and where to change things.

## What This Page Is
- A master-detail (list-detail) UI for browsing guides.
- Desktop: two-pane layout (list on the left, detail on the right).
- Mobile: full-screen detail overlay when a guide is selected.
- Sign-in gating: non-auth users see a partial preview and a CTA to sign in.

## File Locations (Current Repo)
- Route: `frontend_next/src/app/(site)/guides/page.tsx`
- Component: `frontend_next/src/components/pages/guides/Guides.tsx`
- Supabase client: `frontend_next/src/lib/supabase/client.ts`

## How It Works
- Client component (`"use client"`) that fetches guides and categories from Supabase.
- Uses `next/link` for navigation.
- Uses Framer Motion for transitions.
- Uses `react-icons` and `lucide-react` for iconography.

## Run It Locally
From the repo root:
```bash
cd frontend_next
npm run dev
```
Open `http://localhost:3000/guides`.

## Key Features
- Search by title/description.
- Category filter pills.
- Two-pane layout on desktop/tablet.
- Mobile detail overlay with back button.
- Sign-in gate for full content.

## Customize Behavior

### Change Preview Percentage
Search in `frontend_next/src/components/pages/guides/Guides.tsx` for `truncateToPercentage` or the call that passes `30`.
- Example: `truncateToPercentage(description, 30)`
- Change `30` to any value from 0–100.

### Change Desktop Split Ratio
Search for the list/detail container width classes and adjust the Tailwind widths.
- Example pattern: `w-[35%]` / `w-[65%]`.

### Change Breakpoint
Search for `lg:` classes and replace with `md:` or `xl:` depending on your desired breakpoint.

### Edit Empty-State Text
Search for `No guides found` or similar strings and update as needed.

## Dependencies
These are already in `frontend_next/package.json`, but if you add new icons or motion, make sure these remain installed.
- `framer-motion`
- `react-icons`
- `lucide-react`

## Notes
- This component expects Supabase tables like `guide`, `guide_category`, and user profiles to exist.
- If you see empty data, confirm `.env.local` has `NEXT_PUBLIC_KEASY_SUPABASE_URL` and `NEXT_PUBLIC_KEASY_SUPABASE_ANON_KEY`.
