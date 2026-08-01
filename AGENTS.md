# AGENTS.md
<!-- قرأه كلود كود + Antigravity + Gemini + Cursor تلقائيًا -->
<!-- أول حاجة كل وكيل يعملها: يقرا .claude/work-log.md -->
<!-- آخر حاجة: يكتب فيه اللي عمله -->

## القواعد الثابتة (على كل وكيل)
- رد بالعربي المصري دايمًا
- caveman mode: جواب في أول سطر، بدون مقدمة، بدون خاتمة
- اقرا `.claude/work-log.md` قبل أي حاجة
- اكتب فيه بعد كل مهمة (آخر تحديث + حالة + خطوة جاية)
- دور في `.claude/known-issues.md` قبل أي debug
- اكتب دفز في الملفات، مش الملف كله
- مش لازم تأذن قبل ما تفتح متصفح أو تجرب حاجة — جرّبها وبعدين أخبرني

## تفعيل Agent Teams
في `.claude/settings.json`: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- يتواصل الوكلاء مع بعض عبر mailbox مباشرة
- كل وكيل في context window مستقل
- تواصل مع وكيل بعينه: اكتب `@<name>` في الشات

## الوكلاء (25)
| الوكيل | بيعمل إيه | تكلّم معه مباشرة |
|---|---|---|
| **chief** | يقسّم أي مهمة ويوزّعها (الباب الرئيسي) | `@chief` |
| **planner** | خطة تفصيلية بـ Opus قبل أي شغل كبير | `@planner` |
| **autopilot** | ينفّذ لوحده ويبني الوكلاء الناقصة | `@autopilot` |
| **dispatcher** | يمنع التداخل ويحدد مالك لكل جزء | `@dispatcher` |
| **manager** | يراجع الناتج قبل ما يوصلك | `@manager` |
| **windows-dev** | C# · WinAPI · PowerShell · Registry · إنستولر | `@windows-dev` |
| **adb-dev** | ADB · fastboot · Android automation | `@adb-dev` |
| **web-dev** | HTML/CSS/JS · React · صفحات هبوط | `@web-dev` |
| **designer** | UI · ألوان · تايبوجرافي · أيقونات | `@designer` |
| **game-dev** | منطق اللعبة · Godot · Unity · Canvas | `@game-dev` |
| **reverse-eng** | تحليل ملفات وبروتوكولات وصيغ ثنائية | `@reverse-eng` |
| **qa-tester** | يكسر الأداة قبل ما المستخدم يكسرها | `@qa-tester` |
| **security-auditor** | يراجع أمان أداتك قبل النشر | `@security-auditor` |
| **user-sim** | يتصرف كمستخدم حقيقي ويقولك أين ضاع | `@user-sim` |
| **bug-hunter** | يلاقي السبب الجذري للخطأ ويصلحه | `@bug-hunter` |
| **agent-smith** | يعمل وكلاء ومهارات جديدة | `@agent-smith` |
| **autoprov** | يبني الناقص ويحفظه جلوبال تلقائي | `@autoprov` |
| **changelog** | يكتب CHANGELOG.md بعد كل مهمة | `@changelog` |
| **devops** | CI · تحديثات تلقائية · build pipeline | `@devops` |
| **docs-writer** | README · توثيق · FAQ | `@docs-writer` |
| **growth** | SEO · XDA · Reddit · بوستات ترويج | `@growth` |
| **product-planner** | روادماب · تسعير · مقارنة أدوات | `@product-planner` |
| **support** | يرد على شكاوى المستخدمين | `@support` |
| **localization** | ترجمة متعددة · RTL/LTR | `@localization` |
| **data-privacy** | مراجعة الخصوصية والتليمتري | `@data-privacy` |
| **monetization-ops** | مفاتيح تفعيل · نسخة مدفوعة | `@monetization-ops` |

## المهارات (18)
caveman · **smart-model** · token-budget · session-memo · context-diet · error-loop · tool-ship · auto-provision · known-issues · self-improve · suggestion-council · task-routing · frontend-design · explainer-graphic · humanizer · skill-creator · arabic-ux · perf-check · git-hygiene

## الأوامر
`/ss <مهمة>` الأمر الوحيد المهم — `/go` · `/plan` · `/fix` · `/memo` · `/ship` · `/ideas` · `/improve`

## توزيع الموديلات
haiku: ميكانيكي واضح | sonnet: كل حاجة تانية (الافتراضي) | opus: قرار معمار أو لا رجعة منه
