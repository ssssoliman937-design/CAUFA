---
name: smart-model
description: يوزّع الموديل الصح تلقائي على كل خطوة — Opus للتخطيط، Haiku للتنفيذ الميكانيكي، Sonnet لكل حاجة تانية. Always on داخل /ss وعند كل وكيل. Trigger on "غيّر الموديل", "استخدم opus", "استخدم haiku", أو تلقائي في كل task.
---

# Smart Model Routing

## القاعدة
```
التخطيط / قرار معمار / لا رجعة منه  →  opus
تنفيذ ميكانيكي / boilerplate / rename  →  haiku
كل حاجة تانية (الافتراضي)             →  sonnet
```

## في /ss — كل خطوة ليها موديل
- `planner` يشتغل بـ opus دايمًا
- خطوة واضحة ومحددة → haiku
- debugging / UI / كود حقيقي → sonnet
- قرار بيأثر على المعمار أو صعب رجوع منه → opus

## كيف تغيّر يدويًا
```
/model claude-opus-4-8    ← قبل التخطيط
/model claude-haiku-4-5   ← قبل التنفيذ
/model claude-sonnet-4-6  ← للرجوع للافتراضي
```

## متى opus مش محتاجه
- إصلاح bug واضح → sonnet
- كتابة changelog → haiku
- تعديل سطر في ملف → haiku
opus غالي، استخدمه بس لما القرار كبير فعلًا.
