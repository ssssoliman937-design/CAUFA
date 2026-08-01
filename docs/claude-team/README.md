# فريق كلود — جاهز للاستخدام

## التركيب
1. دبل كليك على **`1-INSTALL.bat`** (تثبيت تلقائي بالكامل، من غير أسئلة)
2. لما يقول `[OK] Installed` اقفل النافذة
3. افتح مشروعك في Antigravity / Claude Code
4. اكتب عادي (مش أمر): **`اقرا AGENTS.md وابدأ`**

لو الأداة بتاعتك بتدعم سلاش كوماندز (Claude Code تيرمنال/VS Code) هتلاقي `/go` `/auto` `/fix`... شغالين كمان. جوه Antigravity الأوامر دي ممكن متبانش — مش مشكلة، الوكلاء والمهارات شغالين برضه بمجرد إنك تكتب طلبك عادي.

## محتويات الفولدر
```
claude-team/
├── 0-START-HERE.txt   ← اقرا ده الأول
├── 1-INSTALL.bat      ← دبل كليك
├── AGENTS.md          ← القواعد (المصدر الوحيد)
├── CLAUDE.md          ← مؤشّر لـ AGENTS.md
├── GEMINI.md          ← مؤشّر لـ AGENTS.md (Antigravity)
├── .claude/  .agents/  .agent/   ← الوكلاء والمهارات والأوامر
└── docs/              ← الشرح + sync.ps1
```

## اللي بيتركب في مشروعك
```
مشروعك/
├── AGENTS.md      ← كل القواعد (بيقراه Claude Code + Antigravity + Cursor + Codex)
├── CLAUDE.md      ← مؤشّر لـ AGENTS.md
├── GEMINI.md      ← مؤشّر لـ AGENTS.md (خاص بـ Antigravity)
├── .claude/       ← agents + skills + commands   (Claude Code)
├── .agents/       ← agents + skills              (Antigravity)
└── .agent/        ← rules + workflows            (Antigravity)
```
> فولدرات مخفية — فعّل View → Hidden items في ويندوز.

## الأوامر
**`/ss <الطلب>` ← الأمر الوحيد اللي محتاجه** · `/setup` تفعيل الكل · `/chief` ← الأهم · `/plan` · `/ideas` · `/improve` · `/auto` · `/go` · `/memo` · `/fix` · `/ship` · `/newtool` · `/site` · `/review`

## الفريق — 25 وكيل (شركة كاملة)
**قيادة:** `chief` الباب الرئيسي — يقسّم ويوزّع ويحدد الموديل لكل خطوة · `planner` تفكير عميق بـOpus وخطة بخطوات صغيرة · `dispatcher` يمنع التداخل ويحدد مالك واحد لكل جزء
**تنفيذ:** `autopilot` ينفّذ لوحده ولو ناقصه وكيل يصنعه، وبيسلّم لـ`manager` يراجع تلقائي · `manager` المدير
**تطوير:** `windows-dev` · `adb-dev` · `web-dev` · `game-dev` · `reverse-eng`
**منتج وإطلاق:** `product-planner` روادماب وتسعير · `devops` بناء وتحديثات وCI · `changelog` · `docs-writer` توثيق · `growth` ترويج/SEO · `designer`
**جودة وأمان:** `qa-tester` · `security-auditor` · `user-sim` · `bug-hunter`
**توطين وربح:** `localization` تعدد اللغات وRTL · `data-privacy` مراجعة الخصوصية · `monetization-ops` مفاتيح تفعيل ونسخة مدفوعة
**دعم وتوسّع:** `support` ردود المستخدمين · `agent-smith` بيعمل وكلاء جداد · `windows-dev` · `adb-dev` · `web-dev` · `designer` · `growth` ترويج/SEO · `game-dev` · `reverse-eng` · `qa-tester` · `user-sim` مراجعة زي المستخدم · `bug-hunter` · `agent-smith` بيعمل وكلاء جداد

## المهارات — 18
`task-routing` توزيع المهام باحتراف وبدون تداخل · `arabic-ux` قواعد واجهات عربي/RTL · `perf-check` الحجم والإقلاع قبل النشر · `git-hygiene` تنظيم الكوميتس والفروع · `token-budget` توزيع الموديلات وتقليل التكلفة من غير ما تأثر على الكود · `self-improve` الفريق بيطوّر نفسه ويسجّل في لوج على الديسكتوب · `suggestion-council` مجلس اقتراحات كل متخصص في مجاله · `auto-provision` بناء وكيل/مهارة ناقصة تلقائيًا · `known-issues` أرشيف الباجات المحلولة عشان bug-hunter ميحلّش نفس المشكلة مرتين · `caveman` توفير توكنز (مفعّل دايمًا) · `context-diet` · `error-loop` · `session-memo` · `tool-ship` · `frontend-design` · `explainer-graphic` · `humanizer` · `skill-creator`

## أكواد جاهزة (توفير وقت وتوكنز)
`.claude/shared/` فيه كود جاهز بدل ما يتكتب من الصفر كل مرة:
- `windows-snippets.md` — فحص admin، باكب ريجستري، logger، restore point
- `adb-snippets.md` — مسار adb، فحص الجهاز، حذف آمن قابل للاسترجاع
- `landing-page-template.html` — هيكل صفحة هبوط جاهز يملّه `web-dev`

## التوسّع الذاتي
`autopilot` لو لقى خطوة مفيش وكيل مناسب ليها: بيبني الوكيل/المهارة، يحطها في `.claude/` و`.agents/`، يسجّلها في `AGENTS.md`، ويستعملها في نفس الرن — وبيقولك سطر واحد إنه عمل كده. بحد أقصى وكيل واحد + مهارة واحدة في المهمة.
لو عدّلت حاجة بإيدك في `.claude/`: شغّل `docs/sync.ps1` عشان يزامن نسخة Antigravity.

## أهم حاجة
الملخص في `.claude/memo.md`. كل ما تخلص مهمة اكتب `/memo`، وأول ما تفتح جلسة جديدة اكتب `/go` — مش هيقرا المحادثة من الأول، وده أكبر توفير توكنز هتحسّه.

## Antigravity
اقرا **`USAGE-ANTIGRAVITY.md`** — فيه الإعدادات المظبوطة والـ Deny List اللي تحميك وإنت بتعدل ريجستري أو بتشغل adb.
