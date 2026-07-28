@echo off
title خادم نتيجة الثانوية العامة - السيرفر المحلي العام
cls
echo ======================================================================
echo             خادم نتيجة الثانوية العامة (Local + Public Tunnel)
echo ======================================================================
echo.
echo [1/2] جاري تشغيل خادم النتائج المحلي (Node.js Express Server)...
start "Thanaweya Node Server" cmd /k "node server.js"

echo.
echo [2/2] جاري إطلاق نفق عام آمن (Public HTTPS Tunnel via localtunnel)...
echo.
echo ----------------------------------------------------------------------
echo  انسخ الرابط الذي سيظهر بالأسفل (مثل: https://xxxx.loca.lt)
echo  ثم ضع الرابط في إعدادات الموقع أو اربطه بـ GitHub Pages!
echo ----------------------------------------------------------------------
echo.

npx -y localtunnel --port 3000
pause
