---
name: perf-check
description: Size, startup, and resource sanity check before any release. Use PROACTIVELY as part of `tool-ship`, and whenever the user says "الأداة تقيلة", "الملف كبير", "بطيئة في الفتح", "حجم الexe".
---

# Perf Check

Users judge a system tool by how fast it opens and how big it is. Both are easy to wreck by accident.

## Budgets (indie Windows tool)
| Metric | Good | Investigate above |
|---|---|---|
| exe size (self-contained .NET) | 20-40 MB | 80 MB |
| exe size (framework-dependent) | < 5 MB | 15 MB |
| Cold start to visible window | < 1.5s | 3s |
| Idle RAM | < 80 MB | 200 MB |
| Landing page weight | < 300 KB | 1 MB |

Budgets are conversation starters, not laws — a tool bundling platform-tools is legitimately bigger. Explain, don't just flag.

## Usual causes
- Bundling debug symbols / not using Release.
- No trimming on self-contained publish (`PublishTrimmed` — verify nothing breaks via reflection first).
- Bundled platform-tools shipping the whole SDK instead of adb + 2 DLLs.
- Heavy work on startup: device scan, registry scan, update check blocking the UI thread. Move all of it after first paint.
- Web: unoptimized screenshots/GIFs — usually 90% of page weight.

## Method
1. Measure first, always. `dir` the output, time the launch, check Task Manager. No guessing.
2. Compare to the previous release — a sudden jump matters more than the absolute number.
3. Fix the biggest single contributor only, re-measure, stop. Don't micro-optimize.

## Output
```
الحجم: <x> MB (<كان y>)
الإقلاع: <x>s
أكبر سبب: <one line>
```
