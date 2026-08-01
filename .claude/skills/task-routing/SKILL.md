---
name: task-routing
description: The routing algorithm — turns any request into a clean assignment of parts to owners, skills, and models with zero overlap. Apply on EVERY multi-part task, inside `/ss`, and whenever choosing between two agents that both seem to fit.
---

# Task Routing

Good routing is most of the quality. Bad routing burns tokens and produces duplicated, contradictory work.

## Algorithm
1. **Split by deliverable, not by topic.** A part is one artifact someone can hand over: a file, a screen, a script, a page, a decision. "الأمان" isn't a part; "مراجعة أمنية للأداة قبل النشر" is.
2. **Name the artifact for each part.** No artifact → it's not a part, it's a step inside one.
3. **Match owner by narrowest fit.** Score candidates on: does it own this artifact type, does it have the domain rules, would its output need rewriting by someone else. Highest wins; ties go to the narrower specialist.
4. **Attach skills per part**, not globally. Registry work → `windows-snippets` + safety rules. Debug → `error-loop` + `known-issues`. Release → `tool-ship`.
5. **Assign the cheapest sufficient model** (`token-budget`): haiku mechanical · sonnet default · opus only for irreversible/architectural judgment.
6. **Dependency pass.** Mark what must finish before what. Everything else runs in parallel.
7. **Collision pass** (`dispatcher`): one owner per part, one writer per file, reviewers don't execute.

## Splitting heuristics
- Part too big if: it needs its own sub-decisions, spans 2+ specialties, or can't be verified in one check. Split it.
- Part too small if: it's a single line inside another part's work. Merge it.
- Right size: one owner, one artifact, verifiable in under ~20 minutes.

## Anti-patterns
- Assigning a part to `chief`/`autopilot` — orchestrators route, they don't own artifacts.
- Sending a whole feature to one agent because it "kind of covers it" — that's the gap signal (`auto-provision`).
- Running a reviewer before the artifact exists.
- Parallelizing two parts that write the same file.

## Output
The assignment table only. No commentary about why routing matters.
