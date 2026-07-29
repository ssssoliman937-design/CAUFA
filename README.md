# 🚀 SHEFOtube PRO 4K - Web Video & Audio Downloader (PWA)

[![SHEFOtube CI](https://github.com/USERNAME/shefotube/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/shefotube/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**SHEFOtube** هو تطبيق وموقع ويب خارق لتنزيل الفيديوهات والصوتيات من مختلف المنصات (تيك توك، يوتيوب، إنستجرام، فيسبوك، تويتر...) بدون علامة مائية وبكافة الجودات مع احتساب حجم الملف بالـ MB ومتابعة التقدم في شريط الإشعارات فورياً!

---

## ✨ الميزات الرئيسية (Features)

- 🎥 **دعم جميع الجودات**: تنزيل الفيديو بدقات `4K Ultra HD`, `2K QHD`, `1080p Full HD`, `720p`, `480p`, `360p`, `240p`.
- 🎧 **تحميل الصوت فقط**: خيارات متعددة للنقاء (`MP3 320kbps`, `256kbps`, `192kbps`, `M4A`, `FLAC`, `WAV`, `OGG`).
- ⚡ **حساب أحجام الملفات بالميجابايت**: معرفة حجم كل دقة وفورمات قبل التحميل بناءً على مدة الفيديو الحقيقية.
- 🛡️ **بدون علامة مائية ✨**: تنزيل فيديوهات TikTok و Instagram Reels و YouTube Shorts بدون علامات مائية.
- 📱 **دعم Web Share Target API**: إمكانية مشاركة الفيديوهات مباشرة من تطبيقات الهاتف إلى SHEFOtube.
- 📊 **شريط الإشعارات والتحميل الحي**: متابعة النسبة المئوية `%`، الـ MBs المحملة، السرعة اللحظية `MB/s` والوقت المتبقي `ETA`.
- 🎬 **مشغل معاينة وأداة قص المقطع (Trimmer)**: تحديد وقت البداية والنهاية لتحميل جزء معين من الفيديو مع Audio Equalizer.
- 📲 **مولد QR Code**: نقل رابط التحميل فورياً للهاتف الذكي.
- 📜 **سجل التحميلات المتقدم (History Store)**: بحث وفلترة وحفظ التحميلات السابقة مع إمكانية التصدير النسخة الاحتياطية.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Backend**: Node.js, Express, Axios, Cheerio
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Semantic UI, CSS3 Responsive Glassmorphism
- **PWA Capabilities**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Web Notifications API, Web Share Target API, Vibration API, Wake Lock API

---

## ☁️ التنسيق والرفع على GitHub والاستضافة المجانية (GitHub & Cloud Deploy)

### 1. الرفع على GitHub:
- قم بإنشاء Repository جديد على [GitHub.com](https://github.com) باسم `SHEFOtube`.
- ارفع ملفات المشروع (سيتم استبعاد `node_modules` تلقائياً عبر `.gitignore`).

### 2. التوزيع والاستضافة المباشرة على Vercel:
المشروع مجهز بملف `vercel.json` للنشر المجاني بضغطة زر واحدة على منصة Vercel!

---

## 🚀 كيفية التشغيل محلياً (Quick Start)

### 1. تثبيت المكتبات (Install Dependencies):
```bash
npm install
```

### 2. تشغيل الخادم (Start Server):
```bash
npm start
```

افتح المتصفح على: `http://localhost:3000` 🌐

---

## 📜 الترخيص (License)

هذا المشروع مرخص بموجب رخصة **[MIT](LICENSE)**.
