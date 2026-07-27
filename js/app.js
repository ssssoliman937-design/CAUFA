/* ==========================================================================
   CAUFA LEAGUE - eFOOTBALL 26 Official Tournament Data & Realtime Engine
   + Network-First Strategy with Offline Cache Fallback & Live Status Alerts
   + Progressive Web App (PWA) Mobile Installer Engine
   + Interactive Pan & Zoom Canvas + Fixed Card Layout
   + Security Protocols (XSS Neutralization & Password Hashing)
   ========================================================================== */

/**
 * Live Network Online / Offline Detection & Alert Banner Handler
 */
function initNetworkListeners() {
  const badge = document.getElementById('network-status-badge');
  const banner = document.getElementById('network-offline-banner');
  const isGitHubPages = window.location.hostname.endsWith('github.io');

  function updateStatus() {
    const isOnline = navigator.onLine;
    if (isOnline) {
      if (badge) {
        badge.className = 'network-badge online';
        badge.innerHTML = isGitHubPages ? '⚡ GitHub Pages • متصل' : '🟢 متصل ومُحدث';
      }
      if (banner) banner.style.display = 'none';
      updateLastUpdatedTimestamp();
    } else {
      if (badge) {
        badge.className = 'network-badge offline';
        badge.innerHTML = '⚠️ غير متصل بالإنترنت';
      }
      if (banner) banner.style.display = 'block';
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

function updateLastUpdatedTimestamp() {
  const tsEl = document.getElementById('last-updated-timestamp');
  if (tsEl) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    tsEl.textContent = `⏱️ آخر تحديث للبيانات: اليوم ${timeStr}`;
  }
}

/**
 * PWA Installation & Service Worker Auto-Update Engine
 * Guarantees fresh updates & immediate version reloading
 */
let deferredPWAInstallPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => {
        console.log('CAUFA PWA Service Worker Registered:', reg.scope);
        // Force immediate check for Service Worker update on load
        reg.update();

        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New version found! Activating update immediately...');
                installingWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => console.warn('ServiceWorker Registration Error:', err));
  });

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('Service Worker updated! Reloading application...');
      window.location.reload();
    }
  });
}

// Auto re-check for new app updates whenever user switches back to the tab/app
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.update();
      });
    }
    updateLastUpdatedTimestamp();
  }
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPWAInstallPrompt = e;
  
  const installBtn = document.getElementById('pwa-install-btn');
  const bannerNotice = document.getElementById('pwa-banner-notice');
  
  if (installBtn) installBtn.style.display = 'inline-flex';
  if (bannerNotice) bannerNotice.style.display = 'block';
});

function triggerPWAInstall() {
  if (!deferredPWAInstallPrompt) {
    alert("📲 لتثبيت التطبيق على الموبايل:\n\n• على الآيفون (iOS): اضغط زر المشاركة ⎘ أسفل متصفح Safari، ثم اختر 'إضافة إلى الشاشة الرئيسية (Add to Home Screen)'.\n\n• على أندرويد (Android): اضغط القائمة ≡ بالأعلى ثم اختر 'تثبيت التطبيق (Install App)'.");
    return;
  }
  
  deferredPWAInstallPrompt.prompt();
  deferredPWAInstallPrompt.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    deferredPWAInstallPrompt = null;
  });
}

/**
 * Comprehensive Input Defense: Neutralizes XSS Threats across all dynamic outputs
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Event Throttling & Debouncing helper to prevent abuse and input flooding
 */
function debounce(func, wait = 150) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// SHA-256 Hash of Admin Password "Ss" (No Plaintext Secrets)
const ADMIN_PASSWORD_HASH = "1b9a8e366afbc156c34b52718baad4792287c7e41cedac3e9030e249eae0af12";

// Official Tournament Data from CAUFA LEAGUE Images
const OFFICIAL_CAUFA_DATA = {
  activeTournamentId: "tourney_caufa_official_2026",
  tournaments: [
    {
      id: "tourney_caufa_official_2026",
      name: "بطولة CAUFA LEAGUE eFOOTBALL 26 الرسمية",
      subtitle: "CAUFA Official Championship 2026 - 12 Groups & Round of 32",
      year: "2026",
      status: "تصفيات دور الـ 32 🔴",
      isArchived: false,
      champion: null,
      groups: {
        "المجموعة الأولى (Group A)": [
          { id: "ga1", name: "Youssef Elsayed", manager: "Youssef Elsayed", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 15, ga: 4, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "ga2", name: "Abdelrhman Ayman", manager: "Abdelrhman Ayman", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 13, ga: 14, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "ga3", name: "MCR7", manager: "MCR7", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 8, ga: 12, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "ga4", name: "Som3a", manager: "Som3a", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 7, ga: 13, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الثانية (Group B)": [
          { id: "gb1", name: "Youssef Mosad", manager: "Youssef Mosad", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 14, ga: 0, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gb2", name: "Sallam", manager: "Sallam", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 8, ga: 9, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gb3", name: "Abdullah Yasser", manager: "Abdullah Yasser", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 6, ga: 11, form: ["l", "w", "l"], status: "eliminated" },
          { id: "gb4", name: "Mazen 3217", manager: "Mazen 3217", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 10, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الثالثة (Group C)": [
          { id: "gc1", name: "Mohamed Salah", manager: "Mohamed Salah", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 12, ga: 8, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gc2", name: "Ahmed Mekky", manager: "Ahmed Mekky", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 11, ga: 6, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gc3", name: "Abdelrhman Ahmed", manager: "Abdelrhman Ahmed", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 7, ga: 10, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gc4", name: "Ahmed Tarek", manager: "Ahmed Tarek", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 5, ga: 11, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الرابعة (Group D)": [
          { id: "gd1", name: "Noureldin", manager: "Noureldin", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 15, ga: 7, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gd2", name: "Youssef Fathy", manager: "Youssef Fathy", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 14, ga: 11, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gd3", name: "Youssef Fakhry", manager: "Youssef Fakhry", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 10, ga: 15, form: ["l", "w", "l"], status: "eliminated" },
          { id: "gd4", name: "Roshdy", manager: "Roshdy", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 6, ga: 12, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الخامسة (Group E)": [
          { id: "ge1", name: "Raheem", manager: "Raheem", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 18, ga: 6, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "ge2", name: "Adham", manager: "Adham", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 20, ga: 10, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "ge3", name: "Ibrahim Mohamed", manager: "Ibrahim Mohamed", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 12, ga: 23, form: ["l", "w", "l"], status: "eliminated" },
          { id: "ge4", name: "Zezo", manager: "Zezo", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 3, ga: 14, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة السادسة (Group F)": [
          { id: "gf1", name: "Ali", manager: "Ali", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 13, ga: 3, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gf2", name: "Ahmed Mohamedey", manager: "Ahmed Mohamedey", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 7, ga: 7, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gf3", name: "Eyad Kiittaa", manager: "Eyad Kiittaa", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 13, ga: 13, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gf4", name: "Ahmed", manager: "Ahmed", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 6, ga: 16, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة السابعة (Group G)": [
          { id: "gg1", name: "momen ahmed", manager: "momen ahmed", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 14, ga: 4, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gg2", name: "Ali", manager: "Ali", p: 4, mp: 3, w: 1, d: 1, l: 1, gf: 8, ga: 8, form: ["w", "d", "l"], status: "qualified_direct" },
          { id: "gg3", name: "Mahmoud eldaly", manager: "Mahmoud eldaly", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 4, ga: 10, form: ["l", "w", "l"], status: "eliminated" },
          { id: "gg4", name: "Anas Ahmed", manager: "Anas Ahmed", p: 1, mp: 3, w: 0, d: 1, l: 2, gf: 5, ga: 9, form: ["l", "d", "l"], status: "eliminated" }
        ],
        "المجموعة الثامنة (Group H)": [
          { id: "gh1", name: "Mazen Abidin", manager: "Mazen Abidin", p: 7, mp: 3, w: 2, d: 1, l: 0, gf: 10, ga: 6, form: ["w", "w", "d"], status: "qualified_direct" },
          { id: "gh2", name: "Ahmed Mohamed", manager: "Ahmed Mohamed", p: 5, mp: 3, w: 1, d: 2, l: 0, gf: 8, ga: 6, form: ["w", "d", "d"], status: "qualified_direct" },
          { id: "gh3", name: "Youssef mousa", manager: "Youssef mousa", p: 4, mp: 3, w: 1, d: 1, l: 1, gf: 7, ga: 8, form: ["w", "d", "l"], status: "qualified_best_3rd" },
          { id: "gh4", name: "Fathy Emad", manager: "Fathy Emad", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 4, ga: 9, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة التاسعة (Group I)": [
          { id: "gi1", name: "Yaseen ragab", manager: "Yaseen ragab", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 10, ga: 3, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gi2", name: "Bassem", manager: "Bassem", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 10, ga: 9, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gi3", name: "Ahmed Nagdy", manager: "Ahmed Nagdy", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 7, ga: 6, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gi4", name: "Omar Hussein", manager: "Omar Hussein", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 1, ga: 10, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة العاشرة (Group J)": [
          { id: "gj1", name: "Youssef walid", manager: "Youssef walid", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 15, ga: 8, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gj2", name: "Mohamed hassanein", manager: "Mohamed hassanein", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 10, ga: 7, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gj3", name: "El tantawy", manager: "El tantawy", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 12, ga: 10, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gj4", name: "Omar", manager: "Omar", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 5, ga: 17, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الحادية عشر (Group K)": [
          { id: "gk1", name: "zead medhat", manager: "zead medhat", p: 7, mp: 3, w: 2, d: 1, l: 0, gf: 9, ga: 3, form: ["w", "w", "d"], status: "qualified_direct" },
          { id: "gk2", name: "Ahmed Islam", manager: "Ahmed Islam", p: 7, mp: 3, w: 2, d: 1, l: 0, gf: 9, ga: 5, form: ["w", "w", "d"], status: "qualified_direct" },
          { id: "gk3", name: "toxicer", manager: "toxicer", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 9, ga: 10, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gk4", name: "moaz", manager: "moaz", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 0, ga: 9, form: ["l", "l", "l"], status: "eliminated" }
        ],
        "المجموعة الثانية عشر (Group L)": [
          { id: "gl1", name: "Abdullah", manager: "Abdullah", p: 9, mp: 3, w: 3, d: 0, l: 0, gf: 15, ga: 6, form: ["w", "w", "w"], status: "qualified_direct" },
          { id: "gl2", name: "Youssef Ahmed", manager: "Youssef Ahmed", p: 6, mp: 3, w: 2, d: 0, l: 1, gf: 14, ga: 10, form: ["w", "w", "l"], status: "qualified_direct" },
          { id: "gl3", name: "Abdo Emad", manager: "Abdo Emad", p: 3, mp: 3, w: 1, d: 0, l: 2, gf: 13, ga: 9, form: ["l", "w", "l"], status: "qualified_best_3rd" },
          { id: "gl4", name: "Omar walid", manager: "Omar walid", p: 0, mp: 3, w: 0, d: 0, l: 3, gf: 3, ga: 20, form: ["l", "l", "l"], status: "eliminated" }
        ]
      },
      knockouts: {
        roundOf32: [
          { id: "r32_1", home: "Youssef Elsayed", homeGroup: "Group A #1", away: "MCR7", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_2", home: "Youssef Mosad", homeGroup: "Group B #1", away: "Abdelrhman Ahmed", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_3", home: "Mohamed Salah", homeGroup: "Group C #1", away: "toxicer", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_4", home: "Noureldin", homeGroup: "Group D #1", away: "Eyad Kiittaa", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_5", home: "Raheem", homeGroup: "Group E #1", away: "Ahmed Nagdy", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_6", home: "Ali", homeGroup: "Group F #1", away: "El tantawy", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_7", home: "momen ahmed", homeGroup: "Group G #1", away: "Abdo Emad", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_8", home: "Mazen Abidin", homeGroup: "Group H #1", away: "Youssef mousa", awayGroup: "Best 3rd", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_9", home: "Yaseen ragab", homeGroup: "Group I #1", away: "Abdelrhman Ayman", awayGroup: "Group A #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_10", home: "Youssef walid", homeGroup: "Group J #1", away: "Sallam", awayGroup: "Group B #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_11", home: "zead medhat", homeGroup: "Group K #1", away: "Ahmed Mekky", awayGroup: "Group C #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_12", home: "Abdullah", homeGroup: "Group L #1", away: "Youssef Fathy", awayGroup: "Group D #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_13", home: "Adham", homeGroup: "Group E #2", away: "Ahmed Mohamedey", awayGroup: "Group F #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_14", home: "Ali", homeGroup: "Group G #2", away: "Ahmed Mohamed", awayGroup: "Group H #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_15", home: "Bassem", homeGroup: "Group I #2", away: "Mohamed hassanein", awayGroup: "Group J #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null },
          { id: "r32_16", home: "Ahmed Islam", homeGroup: "Group K #2", away: "Youssef Ahmed", awayGroup: "Group L #2", scoreHome: null, scoreAway: null, status: "قادمة ⏱️", winner: null }
        ],
        roundOf16: [
          { id: "r16_1", home: "الفائز من م 1", away: "الفائز من م 2", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_2", home: "الفائز من م 3", away: "الفائز من م 4", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_3", home: "الفائز من م 5", away: "الفائز من م 6", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_4", home: "الفائز من م 7", away: "الفائز من م 8", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_5", home: "الفائز من م 9", away: "الفائز من م 10", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_6", home: "الفائز من م 11", away: "الفائز من م 12", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_7", home: "الفائز من م 13", away: "الفائز من م 14", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" },
          { id: "r16_8", home: "الفائز من م 15", away: "الفائز من م 16", scoreHome: null, scoreAway: null, status: "دور الـ 16 ⏱️" }
        ],
        quarterFinals: [
          { id: "qf_1", home: "الفائز ر16 (1)", away: "الفائز ر16 (2)", scoreHome: null, scoreAway: null, status: "ربع النهائي ⏱️" },
          { id: "qf_2", home: "الفائز ر16 (3)", away: "الفائز ر16 (4)", scoreHome: null, scoreAway: null, status: "ربع النهائي ⏱️" },
          { id: "qf_3", home: "الفائز ر16 (5)", away: "الفائز ر16 (6)", scoreHome: null, scoreAway: null, status: "ربع النهائي ⏱️" },
          { id: "qf_4", home: "الفائز ر16 (7)", away: "الفائز ر16 (8)", scoreHome: null, scoreAway: null, status: "ربع النهائي ⏱️" }
        ],
        semiFinals: [
          { id: "sf_1", home: "الفائز 4/1", away: "الفائز 4/2", scoreHome: null, scoreAway: null, status: "نصف النهائي ⏱️" },
          { id: "sf_2", home: "الفائز 4/3", away: "الفائز 4/4", scoreHome: null, scoreAway: null, status: "نصف النهائي ⏱️" }
        ],
        final: { id: "f1", home: "طرف النهائي الأول", away: "طرف النهائي الثاني", scoreHome: null, scoreAway: null, status: "النهائي الكبير 🏆", winner: null }
      }
    }
  ]
};

// Realtime Channel Sync
const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('caufa_league_sync') : null;

// Firebase Config from Environment/LocalStorage
let firebaseDb = null;
let firebaseConfig = JSON.parse(localStorage.getItem("CAUFA_FIREBASE_CONFIG") || "null");

// Application State
let appState = loadState();

function loadState() {
  const saved = localStorage.getItem("CAUFA_LEAGUE_DATA_V16");
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return JSON.parse(JSON.stringify(OFFICIAL_CAUFA_DATA));
}

function saveState(broadcast = true) {
  localStorage.setItem("CAUFA_LEAGUE_DATA_V16", JSON.stringify(appState));
  
  if (broadcast && syncChannel) {
    syncChannel.postMessage({ type: 'UPDATE_DATA', payload: appState });
  }

  if (broadcast && firebaseDb) {
    try {
      firebaseDb.ref('caufa_tournament_data_v16').set(appState);
    } catch (e) {
      console.warn("Firebase sync error:", e);
    }
  }
}

function getActiveTournament() {
  return appState.tournaments.find(t => t.id === appState.activeTournamentId) || appState.tournaments[0];
}

// Cryptographic SHA-256 Hashing helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Global Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("CAUFA_LEAGUE_DATA_V16_INIT")) {
    localStorage.setItem("CAUFA_LEAGUE_DATA_V16", JSON.stringify(OFFICIAL_CAUFA_DATA));
    localStorage.setItem("CAUFA_LEAGUE_DATA_V16_INIT", "true");
    appState = JSON.parse(JSON.stringify(OFFICIAL_CAUFA_DATA));
  }
  
  initNetworkListeners();
  initRealtimeFirebase();
  renderApp();
  setupEventListeners();
  setupMultiTabListeners();
  populatePlayerSearchSuggestions();
  setupBracketPanZoom();
});

// Multi-Tab & Realtime Storage Listeners
function setupMultiTabListeners() {
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'UPDATE_DATA') {
        appState = event.data.payload;
        localStorage.setItem("CAUFA_LEAGUE_DATA_V16", JSON.stringify(appState));
        renderApp();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'CAUFA_LEAGUE_DATA_V16' && e.newValue) {
      try {
        appState = JSON.parse(e.newValue);
        renderApp();
      } catch (err) {}
    }
  });
}

// Firebase Realtime DB Initialization
function initRealtimeFirebase() {
  if (typeof firebase !== 'undefined' && firebaseConfig) {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firebaseDb = firebase.database();
      
      firebaseDb.ref('caufa_tournament_data_v16').on('value', (snapshot) => {
        const val = snapshot.val();
        if (val) {
          appState = val;
          localStorage.setItem("CAUFA_LEAGUE_DATA_V16", JSON.stringify(appState));
          renderApp();
        }
      });
    } catch (e) {
      console.warn("Firebase Init Error:", e);
    }
  }
}

function renderApp() {
  const tourney = getActiveTournament();
  renderHeader(tourney);
  renderHero(tourney);
  renderQualified32Leaderboard(tourney);
  renderGroupPills(tourney);
  renderGroupStandings(tourney);
  renderKnockoutBracket(tourney);
  renderFixtures(tourney);
  renderScorers(tourney);
  renderArchiveModal();
}

// 1. Header Rendering
function renderHeader(tourney) {
  const titleEl = document.getElementById("active-tourney-title");
  if (titleEl) titleEl.textContent = tourney.name;
  
  const authStatus = document.getElementById("admin-auth-status");
  if (authStatus) {
    const isAuth = sessionStorage.getItem("CAUFA_ADMIN_AUTH") === "true";
    authStatus.style.display = isAuth ? "inline-flex" : "none";
  }
}

// 2. Hero Banner Rendering
function renderHero(tourney) {
  const heroTitle = document.getElementById("hero-title");
  const heroSub = document.getElementById("hero-sub");
  const badgeStatus = document.getElementById("badge-status");
  
  if (heroTitle) heroTitle.textContent = tourney.name;
  if (heroSub) heroSub.textContent = tourney.subtitle;
  if (badgeStatus) badgeStatus.textContent = tourney.status;

  let totalTeams = 0;
  let totalGoals = 0;

  Object.values(tourney.groups || {}).forEach(g => {
    totalTeams += g.length;
    g.forEach(t => totalGoals += (t.gf || 0));
  });

  const elTeams = document.getElementById("stat-teams");
  const elGoals = document.getElementById("stat-goals");
  const elMatches = document.getElementById("stat-matches");

  if (elTeams) elTeams.textContent = totalTeams || 48;
  if (elGoals) elGoals.textContent = totalGoals || 240;
  if (elMatches) elMatches.textContent = 36;
}

// 3. Render Top 32 Qualified Leaderboard with Input Defense (escapeHtml)
function renderQualified32Leaderboard(tourney) {
  const container = document.getElementById("qualified-32-container");
  if (!container) return;

  const qualList = [];

  Object.entries(tourney.groups || {}).forEach(([gName, teams]) => {
    const gLabel = gName.split(' ')[1] || gName;

    const sorted = [...teams].sort((a, b) => {
      const gdA = (a.gf || 0) - (a.ga || 0);
      const gdB = (b.gf || 0) - (b.ga || 0);
      if (b.p !== a.p) return b.p - a.p;
      if (gdB !== gdA) return gdB - gdA;
      return (b.gf || 0) - (a.gf || 0);
    });

    sorted.forEach((t, idx) => {
      const gd = (t.gf || 0) - (t.ga || 0);
      let isQual = false;
      let reason = "";

      if (idx === 0) {
        isQual = true;
        reason = `🥇 بطل ${gLabel}`;
      } else if (idx === 1) {
        isQual = true;
        reason = `🥈 وصيف ${gLabel}`;
      } else if (idx === 2 && t.status === "qualified_best_3rd") {
        isQual = true;
        reason = `🌟 أفضل 3rd (${gLabel})`;
      }

      if (isQual) {
        qualList.push({
          manager: t.manager,
          group: gLabel,
          reason: reason,
          p: t.p,
          gf: t.gf || 0,
          ga: t.ga || 0,
          gd: gd
        });
      }
    });
  });

  qualList.sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  let html = `
    <div class="group-card" style="margin-bottom: 25px; border: 2px solid var(--gold-primary); box-shadow: var(--gold-glow);">
      <div class="group-header" style="background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), transparent); padding: 12px 16px;">
        <h3 style="font-size: 1rem; color:var(--gold-primary); font-weight:900;">🏆 جدول المتأهلين الـ 32 الرسميين لدور الـ 32</h3>
        <span style="font-size: 0.8rem; color: var(--gold-primary); font-weight:800;">32 لاعباً ⚡</span>
      </div>
      <div class="table-responsive">
        <table class="table-standings">
          <thead>
            <tr>
              <th style="width: 32px;">#</th>
              <th style="text-align:right;">اللاعب</th>
              <th>المجموعة</th>
              <th>صفة التأهل</th>
              <th>النقاط</th>
              <th>له ⚽</th>
              <th>عليه</th>
              <th>فارق</th>
            </tr>
          </thead>
          <tbody>
  `;

  qualList.forEach((q, idx) => {
    html += `
      <tr class="qualified" onclick="openPlayerModal('${escapeHtml(q.manager)}')" style="cursor:pointer;">
        <td style="font-weight:900; color: var(--gold-primary);">${idx + 1}</td>
        <td style="text-align:right; font-weight:800; color:var(--gold-light); white-space:nowrap;"><span class="player-clickable">👤 ${escapeHtml(q.manager)}</span></td>
        <td><span class="badge-live" style="background:rgba(255,215,0,0.1); color:var(--gold-primary); border:1px solid var(--border-gold); padding:2px 8px;">${escapeHtml(q.group)}</span></td>
        <td><span style="background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); padding:3px 8px; border-radius:8px; font-weight:800; font-size:0.75rem; white-space:nowrap;">${escapeHtml(q.reason)}</span></td>
        <td class="pts-highlight">${q.p}</td>
        <td style="font-weight:800; color:var(--gold-primary);">${q.gf}</td>
        <td>${q.ga}</td>
        <td style="direction:ltr;">${q.gd > 0 ? '+' + q.gd : q.gd}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Group Filter Pills
function renderGroupPills(tourney) {
  const container = document.getElementById("group-filter-pills");
  if (!container) return;

  const groups = Object.keys(tourney.groups || {});
  let html = `<button class="pill-btn active" onclick="filterGroupView(this, 'ALL')">جميع المجموعات (12)</button>`;
  groups.forEach(g => {
    const parts = g.split(' ');
    const shortName = (parts[0] || '') + ' ' + (parts[1] || '');
    html += `<button class="pill-btn" onclick="filterGroupView(this, '${escapeHtml(g)}')">${escapeHtml(shortName)}</button>`;
  });

  container.innerHTML = html;
}

let activeGroupFilter = "ALL";
function filterGroupView(btn, groupKey) {
  document.querySelectorAll("#group-filter-pills .pill-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeGroupFilter = groupKey;
  renderGroupStandings(getActiveTournament());
}

// 4. Group Standings Calculation & Rendering
function renderGroupStandings(tourney) {
  const container = document.getElementById("groups-container");
  if (!container) return;

  if (!tourney.groups || Object.keys(tourney.groups).length === 0) {
    container.innerHTML = `<div class="archive-card" style="grid-column: 1/-1; text-align:center; padding: 40px;">لا توجد مجموعات مسجلة بهذه البطولة.</div>`;
    return;
  }

  let html = "";
  Object.entries(tourney.groups).forEach(([groupName, teams]) => {
    if (activeGroupFilter !== "ALL" && activeGroupFilter !== groupName) return;

    const sorted = [...teams].sort((a, b) => {
      const gdA = (a.gf || 0) - (a.ga || 0);
      const gdB = (b.gf || 0) - (b.ga || 0);
      if (b.p !== a.p) return b.p - a.p;
      if (gdB !== gdA) return gdB - gdA;
      return (b.gf || 0) - (a.gf || 0);
    });

    html += `
      <div class="group-card">
        <div class="group-header">
          <h3>🏆 ${escapeHtml(groupName)}</h3>
          <span style="font-size: 0.75rem; color: var(--gold-primary); font-weight:700;">CAUFA 26</span>
        </div>
        <div class="table-responsive">
          <div class="table-scroll-hint">👉 اسحب الجدول لليمين واليسار لرؤية باقي التفاصيل 👈</div>
          <table class="table-standings">
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th style="text-align:right;">اللاعب</th>
                <th>لعب</th>
                <th>فاز</th>
                <th>تعادل</th>
                <th>خسر</th>
                <th>له</th>
                <th>عليه</th>
                <th>الفارق</th>
                <th>النقاط</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach((t, idx) => {
      const gd = (t.gf || 0) - (t.ga || 0);
      const isDirectQual = idx < 2;
      const isBest3rd = t.status === "qualified_best_3rd";

      html += `
        <tr class="${(isDirectQual || isBest3rd) ? 'qualified' : ''}" onclick="openPlayerModal('${escapeHtml(t.manager)}')" style="cursor:pointer;">
          <td style="font-weight:800;">${idx + 1}</td>
          <td style="text-align:right;">
            <div class="team-cell">
              <span class="player-clickable" style="font-size: 0.9rem; color: var(--gold-light); font-weight: 800; white-space:nowrap;">👤 ${escapeHtml(t.manager)}</span>
            </div>
          </td>
          <td>${t.mp}</td>
          <td style="color:var(--status-win); font-weight:700;">${t.w}</td>
          <td style="color:var(--status-draw); font-weight:700;">${t.d}</td>
          <td style="color:var(--status-loss); font-weight:700;">${t.l}</td>
          <td style="font-weight:800; color:var(--gold-primary);">${t.gf}</td>
          <td>${t.ga}</td>
          <td style="direction:ltr;">${gd > 0 ? '+' + gd : gd}</td>
          <td class="pts-highlight">${t.p}</td>
          <td>
            ${isDirectQual 
              ? `<span style="color:var(--status-win); font-weight:800; font-size:0.75rem; white-space:nowrap;">تأهل مباشر 🥇</span>`
              : isBest3rd 
              ? `<span style="color:var(--gold-primary); font-weight:800; font-size:0.75rem; white-space:nowrap;">أفضل ثوالث 🌟</span>`
              : `<span style="color:var(--text-muted); font-size:0.75rem; white-space:nowrap;">مغادر ❌</span>`}
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* ==========================================================================
   5. INTERACTIVE PAN & ZOOM CANVAS FOR CHAMPIONS LEAGUE BRACKET TREE
   ========================================================================== */

function getDefaultZoomForDevice() {
  const w = window.innerWidth;
  if (w <= 480) return 0.52;
  if (w <= 768) return 0.65;
  if (w <= 1024) return 0.78;
  return 0.85;
}

let bracketZoom = getDefaultZoomForDevice();
let bracketPanX = 0;
let bracketPanY = 0;
let isPanning = false;
let startX = 0;
let startY = 0;
let currentBracketStage = 'FULL';

function applyBracketTransform() {
  const container = document.getElementById("bracket-container");
  const zoomLabel = document.getElementById("bracket-zoom-val");
  if (container) {
    container.style.transform = `translate(${bracketPanX}px, ${bracketPanY}px) scale(${bracketZoom})`;
    container.style.transformOrigin = "center center";
  }
  if (zoomLabel) {
    zoomLabel.textContent = `${Math.round(bracketZoom * 100)}%`;
  }
}

function zoomBracket(delta) {
  bracketZoom = Math.min(Math.max(0.4, bracketZoom + delta), 2.5);
  applyBracketTransform();
}

function resetBracketZoom() {
  bracketZoom = getDefaultZoomForDevice();
  bracketPanX = 0;
  bracketPanY = 0;
  applyBracketTransform();
}

function setupBracketPanZoom() {
  const wrapper = document.querySelector(".bracket-wrapper");
  if (!wrapper) return;

  // Mouse Wheel Zoom
  wrapper.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    bracketZoom = Math.min(Math.max(0.4, bracketZoom + delta), 2.5);
    applyBracketTransform();
  }, { passive: false });

  // Mouse Drag (Pan)
  wrapper.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest(".cl-match-card")) return;
    isPanning = true;
    startX = e.clientX - bracketPanX;
    startY = e.clientY - bracketPanY;
    wrapper.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    bracketPanX = e.clientX - startX;
    bracketPanY = e.clientY - startY;
    applyBracketTransform();
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
    const wrapperEl = document.querySelector(".bracket-wrapper");
    if (wrapperEl) wrapperEl.style.cursor = "grab";
  });

  // Touch Pan & Pinch Zoom
  let initialTouchDist = null;

  wrapper.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      if (e.target.closest(".cl-match-card")) return;
      isPanning = true;
      startX = e.touches[0].clientX - bracketPanX;
      startY = e.touches[0].clientY - bracketPanY;
    } else if (e.touches.length === 2) {
      isPanning = false;
      initialTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  wrapper.addEventListener("touchmove", (e) => {
    if (isPanning && e.touches.length === 1) {
      bracketPanX = e.touches[0].clientX - startX;
      bracketPanY = e.touches[0].clientY - startY;
      applyBracketTransform();
    } else if (e.touches.length === 2 && initialTouchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - initialTouchDist) * 0.005;
      bracketZoom = Math.min(Math.max(0.4, bracketZoom + delta), 2.5);
      initialTouchDist = dist;
      applyBracketTransform();
    }
  }, { passive: true });

  wrapper.addEventListener("touchend", () => {
    isPanning = false;
    initialTouchDist = null;
  });
}

function switchBracketStageView(stageKey, btn) {
  document.querySelectorAll('#bracket-stage-pills .pill-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentBracketStage = stageKey;
  renderKnockoutBracket(getActiveTournament());
}

function renderKnockoutBracket(tourney) {
  const container = document.getElementById("bracket-container");
  if (!container) return;

  const r32 = (tourney.knockouts && tourney.knockouts.roundOf32) || [];
  const r16 = (tourney.knockouts && tourney.knockouts.roundOf16) || [];
  const qf = (tourney.knockouts && tourney.knockouts.quarterFinals) || [];
  const sf = (tourney.knockouts && tourney.knockouts.semiFinals) || [];
  const finalMatch = (tourney.knockouts && tourney.knockouts.final) || {};

  const renderMatchCard = (m, label) => `
    <div class="cl-match-card" onclick="openMatchDetail('${escapeHtml(m.id)}')">
      <div class="cl-match-meta">
        <span>${escapeHtml(label)}</span>
        <span>${escapeHtml(m.status)}</span>
      </div>
      <div class="cl-team-line ${m.winner === m.home ? 'winner' : ''}">
        <div class="cl-team-name">
          <span class="player-name-text player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.home)}')">👤 ${escapeHtml(m.home)}</span>
          ${m.homeGroup ? `<span class="group-tag-text">📍 ${escapeHtml(m.homeGroup)}</span>` : ''}
        </div>
        <span class="score">${m.scoreHome !== null ? m.scoreHome : '-'}</span>
      </div>
      <div class="cl-team-line ${m.winner === m.away ? 'winner' : ''}">
        <div class="cl-team-name">
          <span class="player-name-text player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.away)}')">👤 ${escapeHtml(m.away)}</span>
          ${m.awayGroup ? `<span class="group-tag-text">📍 ${escapeHtml(m.awayGroup)}</span>` : ''}
        </div>
        <span class="score">${m.scoreAway !== null ? m.scoreAway : '-'}</span>
      </div>
    </div>
  `;

  // Vertical Mobile Mode Rendering (Stacks all rounds vertically)
  if (currentBracketStage === 'VERTICAL') {
    container.innerHTML = `
      <div style="width:100%; direction:rtl;">
        <div style="margin-bottom:20px; background:var(--bg-card); border:1px solid var(--border-gold); padding:14px; border-radius:var(--radius-md);">
          <h4 style="color:var(--gold-primary); margin-bottom:12px; font-size:1rem; font-weight:900;">⚡ دور الـ 32 (16 مباراة)</h4>
          <div class="single-round-grid">
            ${r32.map((m, idx) => renderMatchCard(m, `مباراة ${idx + 1}`)).join('')}
          </div>
        </div>

        <div style="margin-bottom:20px; background:var(--bg-card); border:1px solid var(--border-gold); padding:14px; border-radius:var(--radius-md);">
          <h4 style="color:var(--gold-primary); margin-bottom:12px; font-size:1rem; font-weight:900;">🔥 دور الـ 16 (8 مباريات)</h4>
          <div class="single-round-grid">
            ${r16.map((m, idx) => renderMatchCard(m, `مباراة ${idx + 1}`)).join('')}
          </div>
        </div>

        <div style="margin-bottom:20px; background:var(--bg-card); border:1px solid var(--border-gold); padding:14px; border-radius:var(--radius-md);">
          <h4 style="color:var(--gold-primary); margin-bottom:12px; font-size:1rem; font-weight:900;">🥊 ربع النهائي (4 مباريات)</h4>
          <div class="single-round-grid">
            ${qf.map((m, idx) => renderMatchCard(m, `ربع ${idx + 1}`)).join('')}
          </div>
        </div>

        <div style="margin-bottom:20px; background:var(--bg-card); border:1px solid var(--border-gold); padding:14px; border-radius:var(--radius-md);">
          <h4 style="color:var(--gold-primary); margin-bottom:12px; font-size:1rem; font-weight:900;">🌟 نصف النهائي (مواجهتان)</h4>
          <div class="single-round-grid">
            ${sf.map((m, idx) => renderMatchCard(m, `نصف النهائي ${idx + 1}`)).join('')}
          </div>
        </div>

        <div style="background:var(--bg-card); border:2px solid var(--gold-primary); padding:18px; border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:4px;">🏆</div>
          <h3 style="color:var(--gold-primary); font-weight:900; font-size:1.15rem; margin-bottom:12px;">النهائي الكبير (Grand Final)</h3>
          ${renderMatchCard(finalMatch, 'مباراة التتويج 🏆')}
        </div>
      </div>
    `;
    applyBracketTransform();
    return;
  }

  // Filtered Stage Views
  if (currentBracketStage !== 'FULL') {
    let matchList = [];
    let title = "";

    if (currentBracketStage === 'R32') { matchList = r32; title = "⚡ مواجهات دور الـ 32 (16 مباراة)"; }
    else if (currentBracketStage === 'R16') { matchList = r16; title = "🔥 مواجهات دور الـ 16 (8 مباريات)"; }
    else if (currentBracketStage === 'QF') { matchList = qf; title = "🥊 مواجهات ربع النهائي (4 مباريات)"; }
    else if (currentBracketStage === 'SF') { matchList = sf; title = "🌟 مواجهات نصف النهائي (مواجهتان)"; }
    else if (currentBracketStage === 'FINAL') { matchList = [finalMatch]; title = "🏆 النهائي الكبير (Grand Final)"; }

    container.innerHTML = `
      <div style="width:100%; direction:rtl;">
        <h3 style="color:var(--gold-primary); margin-bottom:15px; font-weight:900;">${title}</h3>
        <div class="single-round-grid">
          ${matchList.map((m, idx) => renderMatchCard(m, `مباراة ${idx + 1}`)).join('')}
        </div>
      </div>
    `;
    applyBracketTransform();
    return;
  }

  // Full 2-Sided Champions League Tree Visualizer (Horizontal on PC/Desktop)
  const leftR32 = r32.slice(0, 8);
  const leftR16 = r16.slice(0, 4);
  const leftQF = qf.slice(0, 2);
  const leftSF = sf.slice(0, 1);

  const rightSF = sf.slice(1, 2);
  const rightQF = qf.slice(2, 4);
  const rightR16 = r16.slice(4, 8);
  const rightR32 = r32.slice(8, 16);

  container.innerHTML = `
    <!-- SIDE A (LEFT HALF) -->
    <div class="bracket-side-flex">
      <div class="cl-column">
        <div class="cl-column-title">⚡ دور الـ 32 (1-8)</div>
        ${leftR32.map((m, i) => renderMatchCard(m, `مباراة ${i + 1}`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">🔥 دور الـ 16 (1-4)</div>
        ${leftR16.map((m, i) => renderMatchCard(m, `مباراة ${i + 1}`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">🥊 ربع النهائي</div>
        ${leftQF.map((m, i) => renderMatchCard(m, `ربع ${i + 1}`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">🌟 نصف النهائي 1</div>
        ${leftSF.map(m => renderMatchCard(m, `نصف النهائي 1`)).join('')}
      </div>
    </div>

    <!-- CENTER PLATFORM: GRAND FINAL TROPHY -->
    <div class="cl-center-trophy">
      <div class="trophy-icon">🏆</div>
      <h3 style="font-size:1.15rem; font-weight:900; background:var(--gold-gradient-text); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">النهائي الكبير (Grand Final)</h3>
      <span style="font-size:0.78rem; color:var(--gold-primary); font-weight:800;">CAUFA LEAGUE 2026</span>

      <div class="cl-final-card">
        <div class="cl-match-meta" style="justify-content:center;">
          <span style="color:var(--gold-primary); font-weight:800;">${escapeHtml(finalMatch.status || 'مباراة التتويج 🏆')}</span>
        </div>
        <div class="cl-team-line" style="padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <div class="cl-team-name">
            <span class="player-name-text player-clickable" style="font-size:0.95rem; font-weight:800; color:var(--gold-light);" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(finalMatch.home)}')">👑 ${escapeHtml(finalMatch.home || 'طرف الجانب 1')}</span>
          </div>
          <span class="score">${finalMatch.scoreHome !== null ? finalMatch.scoreHome : '-'}</span>
        </div>
        <div class="cl-team-line" style="padding:6px 0;">
          <div class="cl-team-name">
            <span class="player-name-text player-clickable" style="font-size:0.95rem; font-weight:800; color:var(--gold-light);" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(finalMatch.away)}')">👑 ${escapeHtml(finalMatch.away || 'طرف الجانب 2')}</span>
          </div>
          <span class="score">${finalMatch.scoreAway !== null ? finalMatch.scoreAway : '-'}</span>
        </div>
      </div>
    </div>

    <!-- SIDE B (RIGHT HALF) -->
    <div class="bracket-side-flex">
      <div class="cl-column">
        <div class="cl-column-title">🌟 نصف النهائي 2</div>
        ${rightSF.map(m => renderMatchCard(m, `نصف النهائي 2`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">🥊 ربع النهائي</div>
        ${rightQF.map((m, i) => renderMatchCard(m, `ربع ${i + 3}`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">🔥 دور الـ 16 (5-8)</div>
        ${rightR16.map((m, i) => renderMatchCard(m, `مباراة ${i + 5}`)).join('')}
      </div>

      <div class="cl-column">
        <div class="cl-column-title">⚡ دور الـ 32 (9-16)</div>
        ${rightR32.map((m, i) => renderMatchCard(m, `مباراة ${i + 9}`)).join('')}
      </div>
    </div>
  `;

  applyBracketTransform();
}

// 6. Fixtures / Matches List Rendering
function renderFixtures(tourney) {
  const container = document.getElementById("fixtures-container");
  if (!container) return;

  let fixtures = (tourney.knockouts && tourney.knockouts.roundOf32) || [];

  container.innerHTML = fixtures.map((m, idx) => `
    <div class="match-card" onclick="openMatchDetail('${escapeHtml(m.id)}')" style="cursor:pointer; background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:16px; transition:var(--transition);">
      <div class="match-header" style="display:flex; justify-content:space-between; font-size:0.85rem; color:var(--gold-primary); margin-bottom:12px;">
        <span>📍 دور الـ 32 - مباراة ${idx + 1}</span>
        <span>⏱️ ${escapeHtml(m.status)}</span>
      </div>
      <div class="match-body" style="display:flex; align-items:center; justify-content:space-between; text-align:center;">
        <div class="match-team" style="flex:1;">
          <div class="name player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.home)}')" style="color:var(--gold-light); font-weight:800; font-size:1.05rem;">👤 ${escapeHtml(m.home)}</div>
          <div class="mgr" style="font-size:0.78rem; color:var(--text-muted);">📍 ${escapeHtml(m.homeGroup)}</div>
        </div>
        <div class="match-score-box" style="padding: 6px 16px; background:rgba(255,215,0,0.1); border-radius:var(--radius-sm); border:1px solid var(--border-gold);">
          <div class="score-num" style="font-size:1.3rem; font-weight:900; color:var(--gold-primary);">${m.scoreHome !== null ? m.scoreHome : 'VS'} ${m.scoreAway !== null ? ': ' + m.scoreAway : ''}</div>
        </div>
        <div class="match-team" style="flex:1;">
          <div class="name player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.away)}')" style="color:var(--gold-light); font-weight:800; font-size:1.05rem;">👤 ${escapeHtml(m.away)}</div>
          <div class="mgr" style="font-size:0.78rem; color:var(--text-muted);">📍 ${escapeHtml(m.awayGroup)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// 7. Top Scorers Calculation Engine with Filter Search
function renderScorers(tourney) {
  const container = document.getElementById("scorers-container");
  if (!container) return;

  const searchQuery = (document.getElementById("scorer-search-input")?.value || "").toLowerCase();
  const playerGoalsList = [];

  Object.entries(tourney.groups || {}).forEach(([groupName, teams]) => {
    const gLabel = groupName.split(' ')[1] || groupName;
    teams.forEach(t => {
      if (!searchQuery || t.manager.toLowerCase().includes(searchQuery)) {
        playerGoalsList.push({
          name: t.manager,
          group: gLabel,
          goals: t.gf || 0
        });
      }
    });
  });

  playerGoalsList.sort((a, b) => b.goals - a.goals);

  container.innerHTML = playerGoalsList.map((s, idx) => {
    let rankClass = "";
    if (idx === 0) rankClass = "top-1";
    else if (idx === 1) rankClass = "top-2";
    else if (idx === 2) rankClass = "top-3";

    return `
      <div class="scorer-card">
        <div class="scorer-rank ${rankClass}">${idx + 1}</div>
        <div class="scorer-info">
          <h4 class="player-clickable" onclick="openPlayerModal('${escapeHtml(s.name)}')">👤 ${escapeHtml(s.name)}</h4>
          <p>المجموعة: 📍 ${escapeHtml(s.group)}</p>
        </div>
        <div class="scorer-goals">${s.goals} ⚽</div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Player Search & Detailed Profile Engine
   ========================================================================== */

function populatePlayerSearchSuggestions() {
  const container = document.getElementById("player-search-dropdown");
  if (!container) return;

  const tourney = getActiveTournament();
  const allPlayers = [];

  Object.values(tourney.groups || {}).forEach(teams => {
    teams.forEach(t => allPlayers.push(t.manager));
  });

  container.innerHTML = allPlayers.slice(0, 14).map(name => `
    <button class="pill-btn" onclick="selectPlayerSearch('${escapeHtml(name)}')">👤 ${escapeHtml(name)}</button>
  `).join('');
}

function selectPlayerSearch(name) {
  openPlayerModal(name);
}

/* ==========================================================================
   Player Rankings Engine (Overall Rank, Scorer Rank & HD Image Exporter)
   ========================================================================== */

/**
 * Calculate Player Overall Tournament Rank (#1 to #48)
 */
function getPlayerOverallRank(tourney, playerName) {
  if (!tourney || !tourney.groups) return { rank: '-', total: 48 };

  const rawTarget = String(playerName || "").trim().toLowerCase();
  const allPlayers = [];

  Object.entries(tourney.groups).forEach(([gName, teams]) => {
    teams.forEach(t => {
      const gd = (t.gf || 0) - (t.ga || 0);
      allPlayers.push({
        manager: t.manager || t.name,
        p: t.p || 0,
        gf: t.gf || 0,
        ga: t.ga || 0,
        gd: gd,
        w: t.w || 0,
        mp: t.mp || 0,
        group: gName
      });
    });
  });

  allPlayers.sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return b.w - a.w;
  });

  const index = allPlayers.findIndex(p => (p.manager || "").trim().toLowerCase() === rawTarget);
  return {
    rank: index !== -1 ? index + 1 : '-',
    total: allPlayers.length
  };
}

/**
 * Calculate Player Top Scorer Rank (#1 to #48)
 */
function getPlayerScorerRank(tourney, playerName) {
  if (!tourney || !tourney.groups) return { rank: '-', total: 48 };

  const rawTarget = String(playerName || "").trim().toLowerCase();
  const scorers = [];

  Object.values(tourney.groups).forEach(teams => {
    teams.forEach(t => {
      scorers.push({
        manager: t.manager || t.name,
        gf: t.gf || 0,
        mp: t.mp || 0
      });
    });
  });

  scorers.sort((a, b) => {
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.mp - b.mp;
  });

  const index = scorers.findIndex(p => (p.manager || "").trim().toLowerCase() === rawTarget);
  return {
    rank: index !== -1 ? index + 1 : '-',
    total: scorers.length
  };
}

/**
 * Download High Quality PNG Image of Player Stats Card using HTML2Canvas
 */
async function downloadPlayerCardImage(cardElementId, playerName, btnEl) {
  const card = document.getElementById(cardElementId);
  if (!card) return;

  const originalBtnText = btnEl ? btnEl.innerHTML : '';
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.innerHTML = `<span>⏳</span> جاري توليد الصورة عالية الجودة...`;
  }

  try {
    if (typeof html2canvas === 'undefined') {
      alert("تعذر تحميل مكتبة تصدير الصور. يرجى التأكد من الاتصال بالإنترنت!");
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.innerHTML = originalBtnText;
      }
      return;
    }

    const canvas = await html2canvas(card, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#0d0e17",
      logging: false
    });

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const safeName = String(playerName || "Player").replace(/[^a-zA-Z0-9أ-ي]/g, "_");
    link.download = `CAUFA_Stats_${safeName}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error("Card Image Export Error:", err);
    alert("حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى!");
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.innerHTML = originalBtnText;
    }
  }
}

// Debounced Player Search for Rate Limiting / API Resilience
const onPlayerSearchInput = debounce(function() {
  const query = (document.getElementById("player-search-input").value || "").trim().toLowerCase();
  const container = document.getElementById("player-profile-result");
  if (!container) return;

  if (!query) {
    container.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:30px;">ادخل اسم أي لاعب أعلاه لعرض ملفه وإحصائياته...</div>`;
    return;
  }

  const tourney = getActiveTournament();
  let foundPlayer = null;
  let foundGroup = "";
  let foundRank = 0;

  Object.entries(tourney.groups || {}).forEach(([gName, teams]) => {
    const sorted = [...teams].sort((a, b) => b.p - a.p || (b.gf - b.ga) - (a.gf - a.ga));
    sorted.forEach((t, idx) => {
      if (t.manager.toLowerCase().includes(query)) {
        foundPlayer = t;
        foundGroup = gName;
        foundRank = idx + 1;
      }
    });
  });

  if (!foundPlayer) {
    container.innerHTML = `<div style="text-align:center; color:var(--status-loss); font-weight:700; padding:30px;">❌ لم يتم العثور على لاعب بهذا الاسم. جرب كتابة اسم آخر من القائمة...</div>`;
    return;
  }

  const gd = (foundPlayer.gf || 0) - (foundPlayer.ga || 0);
  const winRate = foundPlayer.mp > 0 ? Math.round((foundPlayer.w / foundPlayer.mp) * 100) : 0;
  const overallRank = getPlayerOverallRank(tourney, foundPlayer.manager);
  const scorerRank = getPlayerScorerRank(tourney, foundPlayer.manager);

  let qualBadge = "";
  if (foundRank <= 2) qualBadge = `<span style="background:rgba(16,185,129,0.2); color:#10b981; padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid rgba(16,185,129,0.4); font-size:0.85rem;">تأهل مباشر 🥇</span>`;
  else if (foundPlayer.status === "qualified_best_3rd") qualBadge = `<span style="background:rgba(255,215,0,0.2); color:var(--gold-primary); padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid var(--border-gold); font-size:0.85rem;">أفضل 8 ثوالث 🌟</span>`;
  else qualBadge = `<span style="background:rgba(239,68,68,0.2); color:#ef4444; padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid rgba(239,68,68,0.4); font-size:0.85rem;">مغادر للبطولة ❌</span>`;

  container.innerHTML = `
    <div class="player-export-card" id="search-player-card-export">
      <div class="export-card-header">
        <div class="export-card-brand">
          <img src="assets/logo.png" alt="CAUFA Logo" />
          <div class="export-card-title">
            <h3>بطاقة إحصائيات اللاعب</h3>
            <span>CAUFA LEAGUE eFOOTBALL 26</span>
          </div>
        </div>
        <div>${qualBadge}</div>
      </div>

      <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="font-size:1.7rem; font-weight:900; color:var(--gold-primary); margin:0;">👤 ${escapeHtml(foundPlayer.manager)}</h2>
          <span style="font-size:0.88rem; color:var(--text-muted);">📍 ${escapeHtml(foundGroup)}</span>
        </div>
        
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <div class="rank-badge-pill overall">
            <span>🏆</span> ترتيب البطولة الإجمالي: <strong>#${overallRank.rank}</strong> من ${overallRank.total}
          </div>
          <div class="rank-badge-pill scorer">
            <span>⚽</span> ترتيب الهدافين: <strong>#${scorerRank.rank}</strong>
          </div>
          <div class="rank-badge-pill group">
            <span>📍</span> ترتيب المجموعة: <strong>#${foundRank}</strong>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px; margin-bottom:12px;">
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">النقاط الإجمالية</div>
          <div class="p-val" style="font-size:1.3rem; font-weight:900; color:var(--gold-primary);">${foundPlayer.p}</div>
        </div>
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">أهداف (له)</div>
          <div class="p-val" style="font-size:1.3rem; font-weight:900; color:#10b981;">${foundPlayer.gf} ⚽</div>
        </div>
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">أهداف (عليه)</div>
          <div class="p-val" style="font-size:1.3rem; font-weight:900; color:#ef4444;">${foundPlayer.ga}</div>
        </div>
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">فارق الأهداف</div>
          <div class="p-val" style="font-size:1.3rem; font-weight:900; direction:ltr; color:var(--gold-light);">${gd > 0 ? '+' + gd : gd}</div>
        </div>
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">المباريات (ف/ت/خ)</div>
          <div class="p-val" style="font-size:0.92rem; font-weight:800; margin-top:2px;">
            <span style="color:var(--status-win);">${foundPlayer.w}ف</span> / <span style="color:var(--status-draw);">${foundPlayer.d}ت</span> / <span style="color:var(--status-loss);">${foundPlayer.l}خ</span>
          </div>
        </div>
        <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
          <div class="p-lbl" style="font-size:0.75rem; color:var(--text-muted);">نسبة الفوز</div>
          <div class="p-val" style="font-size:1.3rem; font-weight:900; color:var(--gold-primary);">${winRate}%</div>
        </div>
      </div>
    </div>

    <button class="btn-download-card" onclick="downloadPlayerCardImage('search-player-card-export', '${escapeHtml(foundPlayer.manager)}', this)">
      <span>📸</span> تنزيل بطاقة الإحصائيات (صورة HD عالية الجودة)
    </button>
  `;
}, 150);

// 8. Tournament Memory Vault & Archive Modal
function renderArchiveModal(searchQuery = "") {
  const container = document.getElementById("archive-list");
  if (!container) return;

  const filtered = appState.tournaments.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  container.innerHTML = filtered.map(t => `
    <div class="archive-card" onclick="switchTournament('${escapeHtml(t.id)}')">
      <div class="year">${escapeHtml(t.year)} • ${escapeHtml(t.status)}</div>
      <h4>🏆 ${escapeHtml(t.name)}</h4>
      <p style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(t.subtitle)}</p>
    </div>
  `).join('');
}

function searchArchive() {
  const query = document.getElementById("archive-search-input").value;
  renderArchiveModal(query);
}

function switchTournament(id) {
  appState.activeTournamentId = id;
  saveState();
  renderApp();
  closeArchiveModal();
}

function openArchiveModal() {
  const modal = document.getElementById("archive-modal");
  if (modal) {
    modal.classList.add("open");
    pushModalToHistory("archive-modal");
  }
}

function closeArchiveModal() {
  const modal = document.getElementById("archive-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("archive-modal");
  }
}

function openMatchDetail(matchId) {
  const tourney = getActiveTournament();
  const match = (tourney.knockouts.roundOf32 || []).find(m => m.id === matchId);
  if (!match) return;

  const modal = document.getElementById("match-modal");
  const content = document.getElementById("match-modal-content");

  content.innerHTML = `
    <div class="match-detail-card" style="padding:15px; text-align:center;">
      <div style="font-size:0.85rem; color:var(--gold-primary); font-weight:700;">📍 مواجهات دور الـ 32 التنافسية</div>
      
      <div class="match-detail-teams" style="display:flex; justify-content:space-around; align-items:center; margin:20px 0;">
        <div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--gold-light);">👤 ${escapeHtml(match.home)}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">📍 ${escapeHtml(match.homeGroup)}</div>
        </div>
        <div style="font-size:1.6rem; font-weight:900; color:var(--gold-primary);">
          ${match.scoreHome !== null ? match.scoreHome : '-'} : ${match.scoreAway !== null ? match.scoreAway : '-'}
        </div>
        <div>
          <div style="font-size:1.2rem; font-weight:800; color:var(--gold-light);">👤 ${escapeHtml(match.away)}</div>
          <div style="font-size:0.85rem; color:var(--text-muted);">📍 ${escapeHtml(match.awayGroup)}</div>
        </div>
      </div>

      <div class="events-list">
        <h4>⚽ حالة المباراة:</h4>
        <div class="event-item" style="color:var(--text-muted);">${escapeHtml(match.status)}</div>
      </div>
    </div>
  `;

  modal.classList.add("open");
  pushModalToHistory("match-modal");
}

function closeMatchModal() {
  const modal = document.getElementById("match-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("match-modal");
  }
}

/* ==========================================================================
   Super Admin Control Panel Logic
   ========================================================================== */

function handleAdminClick() {
  const isAuth = sessionStorage.getItem("CAUFA_ADMIN_AUTH") === "true";
  if (isAuth) {
    openAdminModal();
  } else {
    openPasswordModal();
  }
}

function openPasswordModal() {
  const modal = document.getElementById("password-modal");
  if (modal) {
    document.getElementById("admin-password-input").value = "";
    document.getElementById("password-error-msg").style.display = "none";
    modal.classList.add("open");
    pushModalToHistory("password-modal");
  }
}

function closePasswordModal() {
  const modal = document.getElementById("password-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("password-modal");
  }
}

async function verifyAdminPassword(e) {
  e.preventDefault();
  const inputPass = document.getElementById("admin-password-input").value;
  const inputHash = await sha256(inputPass);

  if (inputHash === ADMIN_PASSWORD_HASH) {
    sessionStorage.setItem("CAUFA_ADMIN_AUTH", "true");
    closePasswordModal();
    renderHeader(getActiveTournament());
    openAdminModal();
  } else {
    const errorMsg = document.getElementById("password-error-msg");
    if (errorMsg) errorMsg.style.display = "block";
  }
}

function adminLogout() {
  sessionStorage.removeItem("CAUFA_ADMIN_AUTH");
  closeAdminModal();
  renderHeader(getActiveTournament());
  alert("تم تسجيل الخروج من لوحة المنظم بنجاح.");
}

function switchAdminSubTab(btn, subTabId) {
  document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".admin-sub-content").forEach(c => c.style.display = "none");

  btn.classList.add("active");
  const target = document.getElementById(subTabId);
  if (target) target.style.display = "block";
}

function openAdminModal() {
  const modal = document.getElementById("admin-modal");
  if (!modal) return;

  const tourney = getActiveTournament();
  const r32 = tourney.knockouts.roundOf32 || [];
  
  const select = document.getElementById("admin-match-select");
  if (select) {
    select.innerHTML = r32.map(m => `
      <option value="${escapeHtml(m.id)}">مواجهة: ${escapeHtml(m.home)} (${escapeHtml(m.homeGroup)}) ضد ${escapeHtml(m.away)} (${escapeHtml(m.awayGroup)})</option>
    `).join('');
  }

  modal.classList.add("open");
  pushModalToHistory("admin-modal");
}

function closeAdminModal() {
  const modal = document.getElementById("admin-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("admin-modal");
  }
}

function handleAdminScoreSave(e) {
  e.preventDefault();
  const matchId = document.getElementById("admin-match-select").value;
  const homeScore = parseInt(document.getElementById("admin-home-score").value);
  const awayScore = parseInt(document.getElementById("admin-away-score").value);
  const status = document.getElementById("admin-match-status").value;

  const tourney = getActiveTournament();
  const match = (tourney.knockouts.roundOf32 || []).find(m => m.id === matchId);
  if (match) {
    match.scoreHome = homeScore;
    match.scoreAway = awayScore;
    match.status = status;
    if (homeScore > awayScore) match.winner = match.home;
    else if (awayScore > homeScore) match.winner = match.away;

    saveState();
    renderApp();
    alert("تم تحديث نتيجة المباراة بنجاح أونلاين للجميع! 🏆");
  }
}

function exportData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `CAUFA_LEAGUE_BACKUP_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.tournaments && Array.isArray(imported.tournaments)) {
        appState = imported;
        saveState();
        renderApp();
        alert("تم استيراد نسخة البيانات ومزامنتها بنجاح! 📥");
      }
    } catch (err) {
      alert("خطأ في قراءة ملف JSON!");
    }
  };
  reader.readAsText(file);
}

function resetDefaultData() {
  if (confirm("استعادة بيانات CAUFA LEAGUE الرسمية لـ 12 مجموعة ودور الـ 32؟")) {
    appState = JSON.parse(JSON.stringify(OFFICIAL_CAUFA_DATA));
    saveState();
    renderApp();
    alert("تمت استعادة البيانات بنجاح!");
  }
}

function printReport() {
  window.print();
}

function setupEventListeners() {
  const scoreForm = document.getElementById("admin-score-form");
  if (scoreForm) scoreForm.addEventListener("submit", handleAdminScoreSave);

  const passForm = document.getElementById("password-form");
  if (passForm) passForm.addEventListener("submit", verifyAdminPassword);
}

/* ==========================================================================
   Comprehensive Detailed Player Stats & Match History Modal Engine
   ========================================================================== */

function openPlayerModal(playerName) {
  if (!playerName) return;
  const rawTarget = String(playerName || "")
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
    .toLowerCase();

  const tourney = getActiveTournament();
  
  let player = null;
  let groupName = "";
  let rank = 0;
  
  Object.entries(tourney.groups || {}).forEach(([gName, teams]) => {
    const sorted = [...teams].sort((a, b) => b.p - a.p || ((b.gf - b.ga) - (a.gf - a.ga)));
    sorted.forEach((t, idx) => {
      const pName = (t.manager || t.name || "").trim().toLowerCase();
      if (pName === rawTarget || pName.includes(rawTarget) || rawTarget.includes(pName)) {
        if (!player) {
          player = t;
          groupName = gName;
          rank = idx + 1;
        }
      }
    });
  });

  const modal = document.getElementById("player-modal");
  const content = document.getElementById("player-modal-content");
  const title = document.getElementById("player-modal-title");
  
  if (!modal || !content) return;

  if (!player) {
    content.innerHTML = `
      <div style="text-align:center; padding:30px; color:var(--gold-primary);">
        <h3 style="font-size:1.3rem;">👤 ${escapeHtml(playerName)}</h3>
        <p style="color:var(--text-muted); margin-top:8px; font-size:0.9rem;">لاعب مسجل في بطولة CAUFA LEAGUE eFOOTBALL 26</p>
      </div>
    `;
    modal.classList.add("open");
    return;
  }

  if (title) title.textContent = `👤 ملف وإحصائيات اللاعب: ${player.manager}`;

  const gd = (player.gf || 0) - (player.ga || 0);
  const winRate = player.mp > 0 ? Math.round((player.w / player.mp) * 100) : 0;
  const avgGoals = player.mp > 0 ? (player.gf / player.mp).toFixed(1) : 0;
  const overallRank = getPlayerOverallRank(tourney, player.manager);
  const scorerRank = getPlayerScorerRank(tourney, player.manager);

  let qualBadge = "";
  if (rank <= 2) qualBadge = `<span style="background:rgba(16,185,129,0.2); color:#10b981; padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid rgba(16,185,129,0.4); font-size:0.85rem;">تأهل مباشر 🥇</span>`;
  else if (player.status === "qualified_best_3rd") qualBadge = `<span style="background:rgba(255,215,0,0.2); color:var(--gold-primary); padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid var(--border-gold); font-size:0.85rem;">أفضل 8 ثوالث 🌟</span>`;
  else qualBadge = `<span style="background:rgba(239,68,68,0.2); color:#ef4444; padding:6px 14px; border-radius:12px; font-weight:800; border:1px solid rgba(239,68,68,0.4); font-size:0.85rem;">مغادر ❌</span>`;

  // Gather All Matches for this player
  const playerMatches = [];

  if (tourney.groups && tourney.groups[groupName]) {
    const opponents = tourney.groups[groupName].filter(t => t.manager !== player.manager);
    opponents.forEach((opp, idx) => {
      const pGF = Math.max(0, Math.round((player.gf || 0) / (player.mp || 3)));
      const pGA = Math.max(0, Math.round((opp.gf || 0) / (opp.mp || 3)));
      let resBadge = `<span style="color:var(--status-win); font-weight:800;">فوز 🟢</span>`;
      if (pGF < pGA) resBadge = `<span style="color:var(--status-loss); font-weight:800;">خسارة 🔴</span>`;
      else if (pGF === pGA) resBadge = `<span style="color:var(--status-draw); font-weight:800;">تعادل 🟡</span>`;

      playerMatches.push({
        stage: `مباريات المجموعات (جولة ${idx + 1})`,
        home: player.manager,
        away: opp.manager,
        scoreHome: pGF,
        scoreAway: pGA,
        status: "منتهية ✅",
        resultBadge: resBadge
      });
    });
  }

  const rounds = [
    { key: 'roundOf32', label: 'دور الـ 32 ⚡' },
    { key: 'roundOf16', label: 'دور الـ 16 🔥' },
    { key: 'quarterFinals', label: 'ربع النهائي 🥊' },
    { key: 'semiFinals', label: 'نصف النهائي 🌟' }
  ];

  rounds.forEach(r => {
    const list = (tourney.knockouts && tourney.knockouts[r.key]) || [];
    list.forEach(m => {
      if (m.home === player.manager || m.away === player.manager) {
        let resBadge = `<span style="color:var(--gold-primary); font-weight:800;">${escapeHtml(m.status)}</span>`;
        if (m.winner) {
          resBadge = m.winner === player.manager 
            ? `<span style="color:var(--status-win); font-weight:800;">فوز 🟢</span>` 
            : `<span style="color:var(--status-loss); font-weight:800;">خسارة 🔴</span>`;
        }

        playerMatches.push({
          stage: r.label,
          home: m.home,
          away: m.away,
          scoreHome: m.scoreHome,
          scoreAway: m.scoreAway,
          status: m.status,
          resultBadge: resBadge
        });
      }
    });
  });

  if (tourney.knockouts && tourney.knockouts.final) {
    const fm = tourney.knockouts.final;
    if (fm.home === player.manager || fm.away === player.manager) {
      playerMatches.push({
        stage: 'النهائي الكبير 🏆',
        home: fm.home,
        away: fm.away,
        scoreHome: fm.scoreHome,
        scoreAway: fm.scoreAway,
        status: fm.status,
        resultBadge: fm.winner === player.manager ? `<span style="color:var(--gold-primary); font-weight:900;">بطل البطولة 👑</span>` : `<span style="color:var(--gold-light);">الوصيف 🥈</span>`
      });
    }
  }

  content.innerHTML = `
    <div style="direction:rtl;">
      <!-- Exportable HD Player Card Container -->
      <div class="player-export-card" id="modal-player-card-export">
        <div class="export-card-header">
          <div class="export-card-brand">
            <img src="assets/logo.png" alt="CAUFA Logo" />
            <div class="export-card-title">
              <h3>CAUFA LEAGUE eFOOTBALL 26</h3>
              <span>بطاقة الإحصائيات الرسمية للاعب</span>
            </div>
          </div>
          <div>${qualBadge}</div>
        </div>

        <div style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 style="font-size:1.65rem; font-weight:900; color:var(--gold-primary); margin:0;">👤 ${escapeHtml(player.manager)}</h3>
            <span style="font-size:0.88rem; color:var(--text-muted);">📍 ${escapeHtml(groupName)}</span>
          </div>
          
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <div class="rank-badge-pill overall">
              <span>🏆</span> الترتيب الإجمالي: <strong>#${overallRank.rank}</strong> من ${overallRank.total}
            </div>
            <div class="rank-badge-pill scorer">
              <span>⚽</span> ترتيب الهدافين: <strong>#${scorerRank.rank}</strong>
            </div>
            <div class="rank-badge-pill group">
              <span>📍</span> الترتيب بالمجموعة: <strong>#${rank}</strong>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(100px, 1fr)); gap:10px;">
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">النقاط الإجمالية</div>
            <div class="p-val" style="font-size:1.3rem; font-weight:900; color:var(--gold-primary);">${player.p}</div>
          </div>
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">أهداف له</div>
            <div class="p-val" style="font-size:1.3rem; font-weight:900; color:#10b981;">${player.gf} ⚽</div>
          </div>
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">أهداف عليه</div>
            <div class="p-val" style="font-size:1.3rem; font-weight:900; color:#ef4444;">${player.ga}</div>
          </div>
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">فارق الأهداف</div>
            <div class="p-val" style="font-size:1.3rem; font-weight:900; direction:ltr; color:var(--gold-light);">${gd > 0 ? '+' + gd : gd}</div>
          </div>
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">سجل المباريات</div>
            <div class="p-val" style="font-size:0.92rem; font-weight:800; margin-top:2px;">
              <span style="color:var(--status-win);">${player.w}ف</span> / <span style="color:var(--status-draw);">${player.d}ت</span> / <span style="color:var(--status-loss);">${player.l}خ</span>
            </div>
          </div>
          <div class="profile-item" style="background:rgba(255,215,0,0.06); border:1px solid var(--border-subtle); padding:10px; border-radius:var(--radius-sm); text-align:center;">
            <div class="p-lbl" style="font-size:0.72rem; color:var(--text-muted);">نسبة الفوز</div>
            <div class="p-val" style="font-size:1.3rem; font-weight:900; color:var(--gold-primary);">${winRate}%</div>
          </div>
        </div>
      </div>

      <!-- HD Image Download Button -->
      <button class="btn-download-card" onclick="downloadPlayerCardImage('modal-player-card-export', '${escapeHtml(player.manager)}', this)">
        <span>📸</span> تنزيل بطاقة الإحصائيات (صورة HD عالية الجودة)
      </button>

      <!-- Matches History Header -->
      <div style="border-top:1px solid var(--border-subtle); padding-top:14px; margin-top:18px;">
        <h4 style="font-size:1rem; font-weight:900; color:var(--gold-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span>⚽</span> جميع مواجهات ومباريات اللاعب بالبطولة (${playerMatches.length}):
        </h4>

        <!-- Match History List -->
        <div style="display:flex; flex-direction:column; gap:10px; max-height:280px; overflow-y:auto; padding-left:4px;">
          ${playerMatches.map(m => `
            <div style="background:var(--bg-card); border:1px solid var(--border-gold); border-radius:var(--radius-sm); padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <div style="flex:1;">
                <div style="font-size:0.78rem; color:var(--gold-primary); font-weight:800;">📍 ${escapeHtml(m.stage)}</div>
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-top:4px; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span class="player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.home)}')">👤 ${escapeHtml(m.home)}</span>
                  <span style="color:var(--gold-primary); font-size:0.82rem; font-weight:900;">ضد</span>
                  <span class="player-clickable" onclick="event.stopPropagation(); openPlayerModal('${escapeHtml(m.away)}')">👤 ${escapeHtml(m.away)}</span>
                </div>
              </div>
              <div style="text-align:center;">
                <div style="font-size:1.15rem; font-weight:900; color:var(--gold-primary); background:rgba(255,215,0,0.15); padding:4px 14px; border-radius:8px; border:1px solid var(--border-gold);">
                  ${m.scoreHome !== null ? m.scoreHome + ' - ' + m.scoreAway : 'VS'}
                </div>
                <div style="font-size:0.75rem; margin-top:3px;">${m.resultBadge}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.classList.add("open");
  pushModalToHistory("player-modal");
}

function closePlayerModal() {
  const modal = document.getElementById("player-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("player-modal");
  }
}

function openPWAHelpModal() {
  const modal = document.getElementById("pwa-help-modal");
  if (modal) {
    modal.classList.add("open");
    pushModalToHistory("pwa-help-modal");
  }
}

function closePWAHelpModal() {
  const modal = document.getElementById("pwa-help-modal");
  if (modal) {
    modal.classList.remove("open");
    popModalFromHistory("pwa-help-modal");
  }
}

/* ==========================================================================
   MOBILE BACK GESTURES & BROWSER HISTORY NAVIGATION ENGINE
   ========================================================================== */

let modalNavigationStack = [];
let isPopStateDrivenAction = false;

function pushModalToHistory(modalId) {
  if (!modalNavigationStack.includes(modalId)) {
    modalNavigationStack.push(modalId);
    try {
      history.pushState({ modalId: modalId, depth: modalNavigationStack.length }, '', '#' + modalId);
    } catch (e) {}
  }
  updateFloatingBackButtonVisibility();
}

function popModalFromHistory(modalId) {
  const index = modalNavigationStack.indexOf(modalId);
  if (index !== -1) {
    modalNavigationStack.splice(index, 1);
  }
  
  if (!isPopStateDrivenAction && history.state && history.state.modalId === modalId) {
    isPopStateDrivenAction = true;
    history.back();
    setTimeout(() => { isPopStateDrivenAction = false; }, 60);
  }
  updateFloatingBackButtonVisibility();
}

function updateFloatingBackButtonVisibility() {
  const btn = document.getElementById("floating-back-btn");
  if (!btn) return;

  const anyModalOpen = modalNavigationStack.length > 0 || document.querySelector(".modal-overlay.open") !== null;
  const isSubTabActive = window.currentActiveTabId && window.currentActiveTabId !== 'sec-groups';

  if (anyModalOpen || isSubTabActive) {
    btn.style.display = "inline-flex";
  } else {
    btn.style.display = "none";
  }
}

function handleMobileBackClick() {
  if (modalNavigationStack.length > 0) {
    const topModalId = modalNavigationStack[modalNavigationStack.length - 1];
    closeModalById(topModalId);
    return;
  }

  const openModal = document.querySelector(".modal-overlay.open");
  if (openModal) {
    closeModalById(openModal.id);
    return;
  }

  if (window.currentActiveTabId && window.currentActiveTabId !== 'sec-groups') {
    const firstTabBtn = document.querySelector(".tab-btn");
    if (typeof switchTab === 'function' && firstTabBtn) {
      switchTab(firstTabBtn, 'sec-groups');
    }
  }
}

function closeModalById(modalId) {
  if (modalId === 'archive-modal') closeArchiveModal();
  else if (modalId === 'password-modal') closePasswordModal();
  else if (modalId === 'match-modal') closeMatchModal();
  else if (modalId === 'admin-modal') closeAdminModal();
  else if (modalId === 'player-modal') closePlayerModal();
  else if (modalId === 'pwa-help-modal') closePWAHelpModal();
  else {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("open");
    updateFloatingBackButtonVisibility();
  }
}

// Global Popstate Event Listener for Intercepting Phone Back Button & Gestures
window.addEventListener('popstate', (event) => {
  if (isPopStateDrivenAction) return;

  isPopStateDrivenAction = true;

  if (modalNavigationStack.length > 0) {
    const topModalId = modalNavigationStack.pop();
    const modalEl = document.getElementById(topModalId);
    if (modalEl) modalEl.classList.remove("open");
    updateFloatingBackButtonVisibility();
    setTimeout(() => { isPopStateDrivenAction = false; }, 60);
    return;
  }

  const openModal = document.querySelector(".modal-overlay.open");
  if (openModal) {
    openModal.classList.remove("open");
    updateFloatingBackButtonVisibility();
    setTimeout(() => { isPopStateDrivenAction = false; }, 60);
    return;
  }

  if (window.currentActiveTabId && window.currentActiveTabId !== 'sec-groups') {
    const firstTabBtn = document.querySelector(".tab-btn");
    if (typeof switchTab === 'function' && firstTabBtn) {
      switchTab(firstTabBtn, 'sec-groups');
    }
  }

  setTimeout(() => { isPopStateDrivenAction = false; }, 60);
});

// Close modals when clicking backdrop
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    closeModalById(e.target.id);
  }
});
