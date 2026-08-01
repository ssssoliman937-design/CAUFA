---
name: self-improve
description: Lets the team upgrade itself over time and logs every change to a file on the Desktop. Use PROACTIVELY at the end of any session where something was learned — a repeated mistake, a missing capability, a better approach, a new agent or skill created. Trigger on "طوّر نفسك", "حسّن الفريق", "سجّل التطوير".
---

# Self-Improve

The team gets better only if lessons are written back into the files.

## When to fire
- A new agent or skill was created (`auto-provision`).
- The same mistake happened twice → the responsible agent's rules are missing something.
- A better approach was found for a recurring task → fold it into the relevant agent or `.claude/shared/`.
- A rule caused friction or was wrong → fix it.
- A bug was solved → `known-issues` handles that one; don't duplicate here.

## What to do
1. Edit the SPECIFIC file that owns the lesson — the agent's rules, the skill's steps, or `.claude/shared/`. Never dump lessons into `AGENTS.md` as a growing pile.
2. Keep the edit small and checkable. Add a rule, don't add a paragraph.
3. Mirror the change to `.agents/` (Antigravity copy) and to the global folder `%USERPROFILE%\.claude\` so it applies in every project.
4. Append to the Desktop log (see below).
5. Tell the user in ONE line: `طوّرت: <الملف> — <السبب>`.

## Desktop log
Append to `%USERPROFILE%\Desktop\claude-team-log.md` (create with an `# Claude Team — سجل التطوير` header if missing):
```markdown
## <YYYY-MM-DD HH:MM> — <المشروع>
- <ملف اتعدل> — <اللي اتغيّر> — <ليه>
```
Newest entries at the bottom. One line per change. Never write secrets, paths with credentials, or user data into this log.

## Guardrails
- Max 3 self-edits per session. More than that means you're churning, not improving.
- Never weaken a safety rule (undo paths, destructive-action confirmation, admin checks, security review) to make work faster.
- Never delete an agent or skill without asking the user.
- If a change is risky or opinionated, propose it in one line instead of applying it.
