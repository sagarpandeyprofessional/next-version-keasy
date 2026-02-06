# Assistant Workflow (Always Follow)

## Pre-Task Setup (Every Session)

1. **Read Context Files First**
   - `ASSISTANT_WORKFLOW.md` - This file (workflow rules)
   - `PROCESS.md` - History of changes, deployment issues, and fixes
   - Check `git status` for current state

2. **Understand the Request**
   - Clarify ambiguous instructions before acting
   - Identify if it's: bug fix, feature, deployment, refactor, or research

---

## Task Execution

### Step 1: Research
- Read relevant files before changing anything
- Check existing patterns in the codebase
- Review recent commits if relevant (`git log --oneline -10`)
- Ask for missing details when needed

### Step 2: Plan
- Break task into small, clear steps
- Identify dependencies and risks
- For complex tasks, outline the plan before executing

### Step 3: Execute
- Make minimal, correct changes
- Keep changes scoped and consistent with existing codebase
- Avoid over-engineering - only do what was asked
- Run builds/tests when appropriate

### Step 4: Verify
- Confirm changes work (build, test, or manual check)
- State what changed and why
- Point to file paths for verification

### Step 5: Document
- **Always update `PROCESS.md`** after making changes
- Include: problem, actions taken, files changed, result

---

## Git & Deployment Rules

### Before Committing
- Run `git status -sb` to see changes
- Run `git diff` to review what will be committed
- Only commit when explicitly asked

### Commit Format
```
Short summary (imperative mood)

- Detail 1
- Detail 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Push Protocol
- Always confirm before pushing
- If push fails, diagnose and fix (don't brute force)
- After push, verify with `git status -sb`

### Deployment Logs
- Save build/deploy logs to `Deployment-N-logs/` folder
- Rotate old logs when creating new deployment attempts

---

## Project-Specific Knowledge

### Tech Stack
- **Frontend**: Next.js in `frontend/`
- **Backend**: AWS Amplify Gen2 in `amplify/`
- **Database**: Supabase
- **Payments**: Toss Payments

### Key Files
| Purpose | Location |
|---------|----------|
| Build config | `amplify.yml` |
| Backend routes | `amplify/backend.ts` |
| API handler | `amplify/functions/keasy-api/handler.js` |
| Frontend app | `frontend/src/` |

### Common Issues & Fixes
| Issue | Fix |
|-------|-----|
| `npm ci` lock file mismatch | Run `npm install --prefix frontend` |
| Git credential loop | Check `~/.gitconfig` for corrupted credential helper |
| Amplify CDK errors | Check IAM permissions for SSM and S3 |
| Missing env vars | Add to Amplify Console > Environment Variables |

---

## Communication Style

- Be concise and direct
- Use tables and bullet points for clarity
- Show file paths as clickable links: `[file.ts](path/to/file.ts)`
- Summarize actions taken at the end of complex tasks
- Don't add unnecessary emojis or filler text

---

## Error Handling

1. **Build Errors**
   - Read the full error log
   - Identify root cause before attempting fix
   - Document the error and fix in PROCESS.md

2. **Git Errors**
   - Check `git status` and `git remote -v`
   - Don't force-push or use destructive commands without asking
   - If credential issues, check `~/.gitconfig`

3. **Deployment Errors**
   - Save logs to `Deployment-N-logs/`
   - Check Amplify Console for detailed errors
   - Verify env vars are set correctly

---

## Checklist (Quick Reference)

Before starting:
- [ ] Read PROCESS.md
- [ ] Check git status

After completing:
- [ ] Verify changes work
- [ ] Update PROCESS.md
- [ ] Commit only if asked
- [ ] Push only if asked
