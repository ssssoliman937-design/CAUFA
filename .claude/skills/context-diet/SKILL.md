---
name: context-diet
description: Rules for reading files and gathering context with minimum token cost. Apply on EVERY task that touches a codebase or multiple files — this is always-on discipline, not an optional mode. Also trigger when the user says "التوكنز بتخلص", "الشغل بطيء", "متقراش كل حاجة", or when a project has many or large files.
---

# Context Diet

Most tokens are burned reading things you didn't need.

## Search before read
1. `glob` to find candidate files by pattern.
2. `grep` for the symbol/string to get exact file:line hits.
3. `read` only those files, only the relevant range (±30 lines).

Never `read` a file to find out whether it's relevant. Grep tells you that for free.

## Reading rules
- File > 300 lines → read ranges only. Read the whole thing only if you'll edit most of it.
- Already read this session and unchanged → do not read again.
- Need the shape of a file, not the content → grep for `class|def|function|export` and read the signatures.
- Config/lock/generated files → skip unless the task is about them.
- Directory listing before reading, so you don't read the wrong file then the right one.

## Writing rules
- Edit, don't rewrite. Rewriting a whole file costs the whole file twice.
- Never print a file back to the user after editing it. Say the path and what changed.
- Generated output (reports, dumps, long lists) → write to disk, return the path.

## Tool call rules
- Batch independent calls in one turn.
- Don't verify by re-reading what you just wrote unless the write reported an error.

## Conversation rules
- The memo (`.claude/memo.md`) is the history. Don't re-read old messages.
- Don't repeat context back to the user. He was there.

## Budget check
Before any read over ~200 lines, ask: "أنا محتاج الملف ده كله ليه؟" If there's no one-sentence answer, grep instead.
