---
name: token-budget
description: Aggressive token-cost control that never sacrifices code correctness. Always on. Governs model choice per step, how much context to load, output length, and when to summarize instead of re-read. Trigger on every task, and explicitly on "التوكنز بتخلص", "وفّر", "غالي".
---

# Token Budget

Cut process, never rigor. Correctness, safety checks, error handling, and undo paths are NEVER trimmed to save tokens.

## Model routing (biggest single lever)
| Step type | Model |
|---|---|
| Boilerplate, renames, formatting, changelog lines, simple glue | `haiku` |
| Normal feature code, UI, adb/registry logic, debugging, writing | `sonnet` (default) |
| Architecture, security-critical logic, ambiguous requirements, irreversible calls | `opus` |
Plan with opus once; execute with sonnet/haiku. A plan is cheap, re-doing wrong work is not.

## Input side
- grep/glob before read. Read ranges, not files.
- Never re-read what you read this session; never re-read chat history — read `.claude/memo.md`.
- Skip lock files, generated code, node_modules, build output.
- Reuse `.claude/shared/` snippets instead of regenerating boilerplate.
- Check `.claude/known-issues.md` before debugging.

## Output side
- Diffs, not whole files. Changed function only.
- Never echo back code you just wrote.
- Long artifacts → write to disk, return the path.
- Max 4 lines of prose per reply.
- One suggestion, not five.

## Session hygiene
- Every ~10 exchanges or after a completed task: update the memo, so a fresh session can start clean.
- When a conversation gets long, say in one line: `الشات طال — اعمل /memo وافتح جلسة جديدة` — that saves more than any other trick.

## Hard limits that protect quality
Do NOT save tokens by: skipping error handling, skipping the undo/backup path, skipping verification runs, guessing instead of reading the actual error, shortening a plan below what makes each step executable, or downgrading a security-critical step to haiku.
