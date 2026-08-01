---
name: error-loop
description: Disciplined error-fixing procedure that stops guess-and-check loops from burning tokens. Use IMMEDIATELY whenever a command fails, code throws, a build breaks, a test fails, or the user pastes an error message or says "مش شغال" / "بيديني إيرور" / "فيه مشكلة".
---

# Error Loop

Guessing costs more than reading. Read first.

## The loop
1. **Read the actual error.** Full message, full stack, innermost exception, line number. State it in one line: `الخطأ: <what it literally says>`. Half of all bugs die here.
2. **One hypothesis.** The single most likely cause, in one sentence. Not three maybes.
3. **Cheapest test of that hypothesis.** A grep, a print, a one-line change — not a refactor.
4. **Fix minimally.** Smallest change that addresses the cause.
5. **Verify by running it.** Not by reasoning that it should work.
6. **One line of prevention.** Guard, check, or test that stops the class of bug.

## Hard stop rule
**3 failed attempts = stop.** Do not attempt a 4th. Report:
```
الخطأ: <exact text>
جربت: <1-line each of the 3 attempts>
أرجح سببين: <A> / <B>
محتاج منك: <the one piece of info that decides between them>
```
Continuing past 3 attempts is where sessions die and tokens vanish.

## Never
- Never wrap in try/catch to make an error disappear. Handle it or let it fail loudly.
- Never change two things at once — you won't know which worked.
- Never revert to an older approach without saying why.
- Never re-run the same failing command hoping for a different result.
- Never refactor unrelated code during a fix.

## Environment first
Before debugging logic, rule out: missing runtime/dependency, wrong version, no permissions/admin, wrong working directory, stale build, cached artifacts, device not connected/authorized. These are ~40% of "bugs" in Windows and ADB tooling.

## Reporting
One block. No narrative of the journey.
```
السبب: <one line>
الإصلاح: <file:line>
التحقق: <what you ran, what it printed>
```
