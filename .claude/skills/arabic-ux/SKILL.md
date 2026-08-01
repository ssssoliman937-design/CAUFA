---
name: arabic-ux
description: Fixed rules for Arabic/RTL interfaces so designer and web-dev don't re-derive them each time. Apply whenever building or reviewing any Arabic-language UI, landing page, or in-app text.
---

# Arabic UX Rules

## Layout
- `dir="rtl"` on the root; use logical CSS (`margin-inline-start`, `padding-inline-end`, `text-align: start`) — never `left`/`right`.
- Mirror: arrows, back/next, progress direction, breadcrumbs, sliders.
- Do NOT mirror: logos, media playback controls (▶ stays ▶), clocks, code blocks, phone numbers, file paths.
- Code, terminal output, commands, and file paths stay LTR inside an RTL page — wrap them in `dir="ltr"` or they render scrambled. This is the single most common bug.

## Type
- Fonts: Cairo or Tajawal for UI, IBM Plex Sans Arabic for denser text. Preload; system Arabic fallbacks are ugly.
- Arabic needs more line-height than Latin — 1.7-1.8 vs 1.5. Cramped Arabic looks broken even when spacing is "correct".
- Don't bold Arabic heavily for emphasis; it muddies. Use size, color, or spacing instead.
- No italics in Arabic. It's not a real style for the script.

## Numbers and mixing
- Western digits (0-9) by default in technical tools — users copy them into commands.
- Mixed Arabic/English sentences: keep the English term intact, don't transliterate technical words (root, flash, registry, package).
- Version numbers, hashes, serials: always LTR, always monospace.

## Copy
- Egyptian dialect for consumer-facing tools reads friendlier than MSA; MSA for formal/legal text.
- Buttons: verbs, short. "تحميل" not "اضغط هنا للتحميل".
- Error messages say what happened AND what to do next.

## Check before shipping
Long Arabic string, short English string, a file path, and a command — all in the same view. If any of them breaks the layout, it's not done.
