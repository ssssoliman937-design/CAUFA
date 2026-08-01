---
name: known-issues
description: Maintains a per-project .claude/known-issues.md log of bugs already diagnosed, so bug-hunter never re-solves the same root cause twice. Use PROACTIVELY whenever bug-hunter finds a root cause, and at the START of any debugging task — check this file BEFORE starting the error-loop.
---

# Known Issues Log

A cache of solved bugs. Checking it first can turn a 20-minute debug into a 10-second read.

## Before debugging
Grep `.claude/known-issues.md` for the error text, function name, or symptom. Match found → apply the known fix, verify it still applies, done. No match → proceed with `error-loop` normally.

## After solving a bug (bug-hunter does this automatically)
Append one entry:
```markdown
## <short title> — <date>
السبب: <one line>
العرض: <error text / symptom, so grep matches next time>
الإصلاح: <file:line or approach>
