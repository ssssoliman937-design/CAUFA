---
name: git-hygiene
description: Commit, branch, and history rules that keep a repo readable when many agents edit code in one session. Apply whenever committing, branching, or when the user says "اعمل commit", "ارفع على جيت", "نظّم الريبو".
---

# Git Hygiene

Many agents writing in one session makes messy history by default. These rules prevent it.

## Commits
- Conventional style: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `perf:`, `build:`.
- Subject ≤ 60 chars, imperative, in English, describing user-visible effect: `fix: keep window responsive during device scan` — not `fixed stuff`, not the file name.
- **One logical change per commit.** If a session produced three unrelated changes, that's three commits — the reviewer (and future-you) reads history, not diffs.
- Body only when the "why" isn't obvious. Two lines max.

## What never gets committed
Build output (`bin/`, `obj/`, `dist/`), `node_modules/`, `.env` or any secret, personal logs, `.claude/memo.md` and `.claude/known-issues.md` (local working state), signed binaries, bundled platform-tools binaries (link them in the release instead).
Ensure `.gitignore` covers these BEFORE the first commit, not after — removing a committed secret from history is painful.

## Branches
- Solo dev: work on `main` for small changes; branch (`feat/<slug>`, `fix/<slug>`) only when a change spans multiple sessions or might get abandoned.
- Never leave a broken build on `main`. If it doesn't run, it doesn't get committed.

## Releases
- Tag with `v<semver>` on the exact commit that produced the artifact.
- The `changelog` agent's `[Unreleased]` section becomes the release notes at tag time.

## Rules for agents
- Never `git push --force` on a shared branch. Never rewrite pushed history.
- Never commit on the user's behalf without saying what's in the commit.
- Check `git status` before committing — don't sweep in files another agent was mid-way through.
