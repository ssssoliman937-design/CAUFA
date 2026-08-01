---
name: auto-provision
description: Procedure for detecting a missing capability and building the agent or skill that fills it, then registering and using it immediately. Use whenever a task needs an agent or skill the team does not have, whenever the user says "معندناش وكيل لكده", "اعمل وكيل", "اعمل مهارة", or whenever routing a step feels like forcing it onto the wrong specialist.
---

# Auto-Provision

The team is allowed to grow itself — carefully.

## Detect the gap
Before delegating any step, ask: **which existing agent would do this well?**
- Clear owner → delegate, done.
- You're rationalizing ("windows-dev can kind of handle installers…") → that's a gap.
- The step is a repeatable procedure with no judgment → that's a missing **skill**, not an agent.

## Decide: skill or agent?
| Need | Build |
|---|---|
| A checklist, a workflow, a set of rules | **skill** |
| A specialist that reasons, with its own context window | **agent** |
| Used once, never again | **neither** — just do it inline |

## Build it
1. **Reuse check** — ≥70% overlap with something existing? Extend that instead. Adding near-duplicates makes routing worse, not better.
2. Write the file:
   - Agent → `.claude/agents/<name>.md` (frontmatter: `name`, `description` with explicit Arabic + English triggers, `tools`, `model`)
   - Skill → `.claude/skills/<name>/SKILL.md` (frontmatter: `name`, `description` — the description IS the trigger, make it pushy)
3. **Save globally too** — copy the same file to `%USERPROFILE%\.claude\agents\` or `%USERPROFILE%\.claude\skills\<name>\` so it's available in every other project from now on, not just this one.
4. **Mirror for Antigravity** — same content to `.agents/agents/<name>/agent.md` (remove the `tools:` and `model:` lines) or `.agents/skills/<name>/SKILL.md`.
5. **Register** — add a row to the delegation table or skill map in `AGENTS.md`. Unregistered = invisible.
6. **Use it now**, in the same run. Building it and not using it is wasted work.
7. **Announce in one line**: `عملت <agent|skill> جديد: <name> — <بيعمل إيه>`.

## Quality bar
- Body under 60 lines. Rules, not philosophy.
- Every rule checkable: "back up the key before writing" ✅ / "be careful" ❌.
- Output format stated explicitly, or results come out inconsistent.
- Name it after the job: `installer-builder`, `crash-triage`, `store-listing`.

## Hard limits
- Max 1 new agent + 1 new skill per task.
- Never build silently.
- Never build for a one-off.
- Log it in `.claude/memo.md` under `## الفريق اتوسّع`, and append it to the Desktop log via the `self-improve` skill.

## Cleanup
If an agent or skill hasn't been used in a long time and overlaps another, say so and propose merging. Don't delete without asking.
