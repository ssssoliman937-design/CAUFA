---
name: suggestion-council
description: Collects one strong, non-overlapping suggestion from each relevant specialist agent — a council of advisors, each in its own domain. Use when the user asks "عندك اقتراحات", "إيه اللي ناقص", "حسّن الحاجة دي", "رأي الفريق إيه", or after finishing a milestone.
---

# Suggestion Council

Each specialist advises only in its own lane. No generic advice, no repetition.

## Who advises on what
| Agent | Its lane |
|---|---|
| `product-planner` | ما الذي يستحق البناء التالي، التسعير |
| `windows-dev` / `adb-dev` | صلابة تقنية، حالات فشل غير معالجة |
| `designer` | وضوح الواجهة والهوية |
| `growth` | ما الذي يزيد التحميلات فعليًا |
| `qa-tester` | أخطر ثغرة اختبارية |
| `security-auditor` | أخطر مخاطرة أمنية |
| `user-sim` | أكبر نقطة ارتباك للمستخدم |
| `devops` | البناء والتحديث والتوزيع |
| `docs-writer` | ما هو غير موثّق ويسبب أسئلة متكررة |

## How to run it (token-aware)
1. Pick only the 3-5 lanes that actually apply to the current work. Never run all nine — that's expensive and produces filler.
2. Ask each for **exactly one** suggestion: what to do + why it matters + rough effort (س/م/ك).
3. Drop duplicates and anything vague.
4. Rank by (impact ÷ effort) and present the top 3 only.

## Output
```
1. <الاقتراح> — `<agent>` — أثر: <عالي/متوسط> · جهد: <س/م/ك>
2. ...
3. ...
```
Then one line: `أنفّذ رقم كام؟`

## Rules
- An agent with nothing genuinely valuable to add says nothing. Silence beats filler.
- No suggestion that repeats something already in the plan or the memo.
- Never more than 3 in the final output.
