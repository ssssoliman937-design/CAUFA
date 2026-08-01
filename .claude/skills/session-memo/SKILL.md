---
name: session-memo
description: Writes and maintains a compact session memo file so a new session can continue work without re-reading the whole conversation. Use PROACTIVELY after every completed task, every major decision, and whenever the conversation gets long. Also trigger on "اكتب الملخص", "حدّث الميمو", "اقرا الميمو وكمّل", "لخص المحادثة", or at the start of any session where .claude/memo.md exists.
---

# Session Memo

The memo replaces conversation history. Written well, a fresh session reads ~80 lines instead of 200 messages.

## At session start
If `.claude/memo.md` exists, read it FIRST and treat it as the source of truth. Do not scroll or re-read old messages. If something in it is stale, fix it, don't ignore it.

## When to write
- After any completed task.
- After any decision that changes direction (tech choice, scope change).
- When a bug is found or fixed.
- Before the conversation gets long — dump state while you still have it.
- Whenever the user asks.

## Format — rewrite the file, never endlessly append. Hard cap 120 lines.
```markdown
# Memo — <project> — updated <date>

## الهدف
<1-2 lines. What we're building and why.>

## القرارات
- <decision> — <reason in ≤8 words>

## الملفات المهمة
- `path/file.cs` — <what it does in ≤8 words>

## الحالة
- ✅ <done>
- 🔄 <in progress — and exactly where it stopped>
- ⛔ <blocked — and by what>

## مفتوح
- <open bug / open question, oldest first>

## الخطوة الجاية
<one concrete next action>
```

## Rules
- Facts only: decisions, paths, state, blockers. No narrative — unless a failure is a constraint going forward.
- Delete finished items. Keep at most the last 5 done items.
- Never store secrets, keys, tokens, or passwords in the memo.
- Absolute file paths with a one-line purpose beat pasting code.
- If it's over 120 lines, you're storing narrative. Cut.

## Continuing later
When the user says "كمّل": read memo → state the next step in one line → start. Do not re-summarize the memo back at them.
