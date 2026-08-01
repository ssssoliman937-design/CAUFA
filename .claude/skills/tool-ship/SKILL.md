---
name: tool-ship
description: Release checklist for shipping a tool, app, or website to real users. Use PROACTIVELY before any release, build, upload, or launch, and whenever the user says "خلصت", "هرفعها", "جاهزة للنشر", "اعملي build", "هنزلها". Covers build, safety, trust signals, docs, and launch assets.
---

# Ship Checklist

Nothing ships until every box is real. "Should be fine" is not a check.

## Build
- [ ] Builds clean — zero errors, warnings reviewed.
- [ ] Ran at least once on a normal machine, not just the dev box.
- [ ] Self-contained / dependencies bundled (runtime, platform-tools, redist). Fresh-machine test.
- [ ] Version number bumped, and visible inside the tool.
- [ ] Icon + file version info + publisher name set.
- [ ] Release build, not Debug. No console spam, no test paths.

## Safety (non-negotiable for modding/system tools)
- [ ] Every destructive action has an undo, backup, or restore point.
- [ ] Destructive actions require explicit confirmation.
- [ ] Admin/root requirement checked and clearly stated.
- [ ] Log file written somewhere findable.
- [ ] Fails with a readable message, never a silent crash.

## Trust (this is what converts downloads)
- [ ] SHA-256 hash published next to the download.
- [ ] VirusTotal scan link published.
- [ ] SmartScreen/AV behavior explained on the page — say it before a user reports it.
- [ ] Source or at least a GitHub releases page.
- [ ] Clear statement of exactly what the tool changes on the system.

## Docs
- [ ] One-sentence description of what it does.
- [ ] Requirements: OS version, runtime, admin, device support.
- [ ] Usage in ≤5 steps.
- [ ] Changelog entry for this version.
- [ ] Uninstall / revert instructions.

## Launch assets
- [ ] Screenshot of it actually running.
- [ ] 10-60 second demo GIF or video.
- [ ] Download page: version, size, date, one primary button.
- [ ] Contact/issues link.

## Final gate
Run `qa-tester` and `user-sim` before release. Fix any 🔴 or 🟠 finding, or state explicitly why it ships anyway.
