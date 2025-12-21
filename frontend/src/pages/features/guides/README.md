# Guides Component - Master-Detail Layout

## 📋 What This File Does

This is a **refactored version** of your existing `Guides.jsx` file. It transforms the original multi-column card grid into a modern **master-detail (list-detail) interface**.

### ✨ New Features Added:

| Feature | Description |
|---------|-------------|
| **Two-Pane Layout** | Left side shows a scrollable list of guides (35%), right side shows full details (65%) |
| **Search Bar** | Filter guides by typing in title or description |
| **Category Badges** | Each guide now displays its category as a visual badge |
| **Sign-in Gating** | Non-logged-in users see only 30% of content with a beautiful "Unlock" button |
| **Mobile Optimization** | On phones, tapping a guide opens a full-screen detail view with a back button |
| **Smooth Animations** | Beautiful transitions when selecting guides and filtering |

---

## 🚀 Step-by-Step Installation Guide

### Step 1: Locate Your Current File

Find the file in your project. Based on your import path (`../../../api/supabase-client`), your file is likely at:

```
your-project/
├── src/
│   ├── api/
│   │   └── supabase-client.js
│   ├── pages/           (or components/views/etc.)
│   │   ├── guides/
│   │   │   └── Guides.jsx   ← YOUR CURRENT FILE
```

### Step 2: Backup Your Original File

**IMPORTANT**: Before making any changes, create a backup!

**On Windows:**
1. Open File Explorer
2. Navigate to your project folder → `src` → (wherever your Guides.jsx is)
3. Right-click on `Guides.jsx`
4. Click "Copy"
5. Right-click in the same folder
6. Click "Paste"
7. Rename the copy to `Guides.backup.jsx`

**On Mac:**
1. Open Finder
2. Navigate to your project folder
3. Find `Guides.jsx`
4. Right-click → Duplicate
5. Rename to `Guides.backup.jsx`

### Step 3: Replace the File

1. Download the new `Guides.jsx` file from Claude (click the download button)
2. Copy the downloaded file
3. Navigate to where your original `Guides.jsx` is located
4. Delete the old `Guides.jsx` (you have a backup, remember!)
5. Paste the new `Guides.jsx` here

### Step 4: Install Required Icon (If Not Already Installed)

Open your terminal/command prompt in your project folder and run:

```bash
npm install react-icons lucide-react
```

**How to open terminal in your project:**

**On VS Code:**
1. Open VS Code
2. Open your project folder
3. Press `` Ctrl + ` `` (backtick key, usually above Tab)
4. Terminal opens at the bottom

**On Windows (Command Prompt):**
1. Open File Explorer
2. Navigate to your project folder
3. Click in the address bar
4. Type `cmd` and press Enter

**On Mac (Terminal):**
1. Open Terminal app
2. Type `cd ` (with a space after)
3. Drag your project folder into Terminal
4. Press Enter

### Step 5: Start Your Development Server

In the terminal, run:

```bash
npm run dev
```

Then open your browser and go to the URL shown (usually `http://localhost:5173` for Vite).

---

## 🎨 Visual Guide to the New Layout

### Desktop View (1024px and above)
```
┌─────────────────────────────────────────────────────────────────┐
│  Guides                                    [+ Create Guide]     │
│  Discover and explore helpful guides...                        │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Search guides by title or description...                   │
│  [All] [Park] [App] [Transportation] [Food] ...                │
├────────────────────────┬────────────────────────────────────────┤
│                        │                                        │
│  ┌──────────────────┐  │   ┌────────────────────────────────┐  │
│  │ 📷 Guide 1       │◄─┼───│      Large Cover Image         │  │
│  │ Category • desc  │  │   │                                │  │
│  │ 👁 123 • ❤ 45   │  │   └────────────────────────────────┘  │
│  └──────────────────┘  │                                        │
│                        │   Guide Title                          │
│  ┌──────────────────┐  │   by Author • Jan 1, 2024             │
│  │ 📷 Guide 2       │  │                                        │
│  │ Category • desc  │  │   [❤ Like] [🔖 Save] [↗ Share]        │
│  │ 👁 89 • ❤ 12    │  │   ─────────────────────────────────   │
│  └──────────────────┘  │                                        │
│                        │   About this guide                     │
│  ┌──────────────────┐  │   Full description text here...       │
│  │ 📷 Guide 3       │  │                                        │
│  │ ...              │  │   [Read full guide →]                 │
│  └──────────────────┘  │                                        │
│         ↕ scroll       │                    ↕ scroll            │
└────────────────────────┴────────────────────────────────────────┘
     35% width                        65% width
```

### Mobile View (below 1024px)
```
┌───────────────────────┐      ┌───────────────────────┐
│  Guides               │      │  ← Guide Title        │  ← Back button
├───────────────────────┤      ├───────────────────────┤
│  🔍 Search...         │      │  ┌─────────────────┐  │
│  [All] [Park] ...     │      │  │  Cover Image    │  │
├───────────────────────┤      │  └─────────────────┘  │
│  ┌─────────────────┐  │      │                       │
│  │📷│ Guide 1      │  │ TAP  │  Title               │
│  │  │ Category     │──┼──────▶  by Author           │
│  │  │ 👁 123 ❤ 45 │  │      │                       │
│  └─────────────────┘  │      │  [❤] [🔖] [↗]        │
│                       │      │                       │
│  ┌─────────────────┐  │      │  About this guide    │
│  │📷│ Guide 2      │  │      │  Description...      │
│  │  │ ...          │  │      │                       │
│  └─────────────────┘  │      │  [Read full guide]   │
│         ↕ scroll      │      │         ↕ scroll     │
└───────────────────────┘      └───────────────────────┘
    List View                      Detail View (overlay)
```

---

## 🔐 How the Sign-in Gate Works

When a user is **NOT signed in**:
- They see only **30%** of the guide description
- The text ends with "..."
- Below the text, they see a beautiful "Unlock Full Guide" button
- Clicking it takes them to `/signin`

When a user **IS signed in**:
- They see the **full** guide description
- They see a "Read full guide" button that goes to `/guide/{id}`

---

## ⚙️ Customization Options

### Change the Content Preview Percentage

In the code, find this line (around line 767):
```javascript
: truncateToPercentage(description, 30);
```

Change `30` to any number between 1-100:
- `20` = Show 20% of content to non-logged-in users
- `50` = Show 50% of content
- `0` = Show no content preview

### Change Breakpoints

The layout switches at `1024px` (lg breakpoint in Tailwind). To change this:

Search for `lg:` in the code and replace with:
- `md:` for 768px breakpoint
- `xl:` for 1280px breakpoint

### Change List/Detail Width Ratio

Find this line (around line 450):
```javascript
<div className="lg:w-[35%] lg:min-w-[320px] lg:max-w-[420px]
```

Change `35%` to adjust the list width (the detail pane will take the rest).

---

## 🐛 Troubleshooting

### "Module not found" error

Run these commands in your terminal:
```bash
npm install react-icons lucide-react framer-motion
```

### Icons not showing

Make sure you have these imports at the top of the file:
```javascript
import { IoEyeOutline, IoSearchOutline, IoCloseCircle } from "react-icons/io5";
import { IoIosHeart, IoIosHeartEmpty, IoArrowBack } from "react-icons/io";
import { LockKeyholeOpen, LockKeyhole, BookOpen, Share2, Bookmark, ChevronRight } from "lucide-react";
```

### Supabase connection issues

Make sure your Supabase client path is correct. The file expects:
```javascript
import { supabase } from "../../../api/supabase-client";
```

If your file is in a different location, update this path accordingly.

### Styles look wrong

Make sure Tailwind CSS is properly configured in your project. Check that your `tailwind.config.js` includes the path to this file.

---

## 📁 File Structure After Installation

```
your-project/
├── src/
│   ├── api/
│   │   └── supabase-client.js     (your existing file)
│   ├── pages/
│   │   ├── guides/
│   │   │   ├── Guides.jsx         ← NEW FILE (replace old one)
│   │   │   └── Guides.backup.jsx  ← YOUR BACKUP
```

---

## ❓ Need Help?

If something doesn't work:

1. **Check the browser console** for errors:
   - Right-click anywhere on the page
   - Click "Inspect" or "Inspect Element"
   - Click the "Console" tab
   - Look for red error messages

2. **Check the terminal** where you ran `npm run dev` for errors

3. **Compare with backup**: If things break badly, rename `Guides.backup.jsx` back to `Guides.jsx` to restore the original

---

## 📜 License

This code is provided for your use in your project. Feel free to modify as needed.
