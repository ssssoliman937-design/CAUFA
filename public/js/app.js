// SHEFOtube Ultra Main Controller with Mobile Features & Auto-Clipboard Detector
document.addEventListener('DOMContentLoaded', () => {
  let extractedData = null;
  let deferredPrompt = null;

  // 1. Toast Notification Helper
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-times-circle';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // 2. Service Worker Registration & PWA Install Handling
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SHEFOtube SW registered:', reg.scope);
    }).catch(err => {
      console.warn('SW register error:', err);
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('installPwaBtn');
    if (installBtn) installBtn.style.display = 'flex';
  });

  const installBtn = document.getElementById('installPwaBtn');
  if (installBtn) {
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
          deferredPrompt = null;
          installBtn.style.display = 'none';
        });
      }
    });
  }

  // 3. Auto Clipboard Detection Feature
  async function checkClipboardForVideoUrl() {
    if (!navigator.clipboard || !navigator.clipboard.readText) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith('http') && (text.includes('tiktok') || text.includes('youtu') || text.includes('instagram') || text.includes('facebook'))) {
        const banner = document.getElementById('clipboardBanner');
        const urlText = document.getElementById('clipboardUrlText');
        const fetchClipBtn = document.getElementById('clipFetchBtn');
        const closeClipBtn = document.getElementById('clipCloseBtn');

        if (banner && urlText) {
          urlText.textContent = text.substring(0, 45) + '...';
          banner.style.display = 'flex';

          fetchClipBtn.onclick = () => {
            document.getElementById('videoUrlInput').value = text;
            banner.style.display = 'none';
            triggerExtract(text);
          };

          closeClipBtn.onclick = () => {
            banner.style.display = 'none';
          };
        }
      }
    } catch (e) {}
  }

  // Check on load & focus
  window.addEventListener('focus', checkClipboardForVideoUrl);
  setTimeout(checkClipboardForVideoUrl, 1000);

  // 4. Batch Downloader Modal Handlers
  const batchModalBtn = document.getElementById('batchModalBtn');
  const navBatchBtn = document.getElementById('navBatchBtn');
  const batchModal = document.getElementById('batchModal');
  const closeBatchBtn = document.getElementById('closeBatchModal');
  const startBatchBtn = document.getElementById('startBatchBtn');

  function openBatchModal() {
    if (batchModal) batchModal.classList.add('active');
  }

  if (batchModalBtn) batchModalBtn.addEventListener('click', openBatchModal);
  if (navBatchBtn) navBatchBtn.addEventListener('click', openBatchModal);
  if (closeBatchBtn) closeBatchBtn.addEventListener('click', () => batchModal.classList.remove('active'));

  if (startBatchBtn) {
    startBatchBtn.addEventListener('click', () => {
      const input = document.getElementById('batchUrlsInput').value.trim();
      if (!input) {
        window.showToast('يرجى إدخال روابط أولاً', 'warning');
        return;
      }
      const urls = input.split('\n').map(u => u.trim()).filter(u => u.length > 0);
      batchModal.classList.remove('active');
      window.showToast(`جاري معالجة دفعة مكونة من ${urls.length} روابط 🚀`, 'success');
      triggerExtract(urls[0]);
    });
  }

  // 5. Settings Modal Handlers
  const settingsBtn = document.getElementById('settingsToggleBtn');
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsModal');
  const exportHistoryBtn = document.getElementById('exportHistoryBtn');

  if (settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', () => {
      const history = window.HistoryStore ? window.HistoryStore.getHistory() : [];
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `SHEFOtube_History_Backup_${Date.now()}.json`;
      a.click();
      window.showToast('تم تصدير نسخة احتياطية من سجل التحميلات 💾', 'success');
    });
  }

  // 6. Theme Toggle
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      themeBtn.innerHTML = nextTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    });
  }

  // 7. History Section Toggle & Search / Filters Binding
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const historySection = document.getElementById('historySection');
  if (historyToggleBtn && historySection) {
    historyToggleBtn.addEventListener('click', () => {
      const isVisible = historySection.style.display !== 'none';
      historySection.style.display = isVisible ? 'none' : 'block';
      if (!isVisible && window.HistoryStore) {
        window.HistoryStore.renderHistory();
        historySection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  const historySearch = document.getElementById('historySearchInput');
  if (historySearch) {
    historySearch.addEventListener('input', (e) => {
      if (window.HistoryStore) window.HistoryStore.setSearch(e.target.value);
    });
  }

  const filterChips = document.querySelectorAll('.h-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.getAttribute('data-filter');
      if (window.HistoryStore) window.HistoryStore.setFilter(filter);
    });
  });

  // 8. Mobile Bottom Navigation Bar Actions
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navExtractBtn = document.getElementById('navExtractBtn');
  const navHistoryBtn = document.getElementById('navHistoryBtn');
  const navThemeBtn = document.getElementById('navThemeBtn');

  if (navHomeBtn) {
    navHomeBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveNav(navHomeBtn);
    });
  }

  if (navExtractBtn) {
    navExtractBtn.addEventListener('click', () => {
      const searchCard = document.querySelector('.search-card');
      if (searchCard) searchCard.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('videoUrlInput').focus();
      setActiveNav(navExtractBtn);
    });
  }

  if (navHistoryBtn) {
    navHistoryBtn.addEventListener('click', () => {
      if (historySection) {
        historySection.style.display = 'block';
        if (window.HistoryStore) window.HistoryStore.renderHistory();
        historySection.scrollIntoView({ behavior: 'smooth' });
      }
      setActiveNav(navHistoryBtn);
    });
  }

  if (navThemeBtn) {
    navThemeBtn.addEventListener('click', () => {
      if (themeBtn) themeBtn.click();
    });
  }

  function setActiveNav(targetBtn) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    targetBtn.classList.add('active');
  }

  // 9. Auto Paste Button
  const pasteBtn = document.getElementById('pasteBtn');
  const urlInput = document.getElementById('videoUrlInput');
  if (pasteBtn && urlInput) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          urlInput.value = text.trim();
          window.showToast('تم لصق الرابط من الحافظة 📋', 'success');
          triggerExtract(text.trim());
        }
      } catch (err) {
        window.showToast('يرجى السماح بالوصول للحافظة أو إدخال الرابط يدوياً', 'warning');
      }
    });
  }

  // 10. Check Web Share Target URL Params (Direct Share from TikTok/YouTube Apps)
  const urlParams = new URLSearchParams(window.location.search);
  const sharedUrl = urlParams.get('url') || urlParams.get('text') || urlParams.get('title');
  if (sharedUrl && urlInput) {
    urlInput.value = sharedUrl;
    window.showToast('🚀 تم استقبال الرابط المشارك بنجاح!', 'success');
    triggerExtract(sharedUrl);
  }

  // 11. Fetch Button Trigger
  const fetchBtn = document.getElementById('fetchBtn');
  if (fetchBtn && urlInput) {
    fetchBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (!url) {
        window.showToast('يرجى أدخال رابط الفيديو أولاً', 'warning');
        return;
      }
      triggerExtract(url);
    });
  }

  if (urlInput) {
    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        fetchBtn.click();
      }
    });
  }

  // 12. Extraction API Handler
  async function triggerExtract(url) {
    const fetchBtn = document.getElementById('fetchBtn');
    const resultContainer = document.getElementById('resultContainer');
    
    if (fetchBtn) {
      fetchBtn.disabled = true;
      fetchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحليل...';
    }

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const resData = await response.json();
      if (!resData.success) {
        window.showToast(resData.message || 'فشل تحليل الرابط', 'error');
        return;
      }

      extractedData = resData.data;
      renderResultCard(extractedData);
      
      if (window.MediaPreviewer) {
        window.MediaPreviewer.init(extractedData);
      }

      if (resultContainer) {
        resultContainer.classList.add('active');
        resultContainer.scrollIntoView({ behavior: 'smooth' });
      }

      window.showToast('تم استخراج الجودات والبيانات الحقيقية بنجاح ✨', 'success');

    } catch (err) {
      console.error(err);
      window.showToast('حدث خطأ بالاتصال مع الخادم', 'error');
    } finally {
      if (fetchBtn) {
        fetchBtn.disabled = false;
        fetchBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> استخراج الجودات';
      }
    }
  }

  // 13. Render Video Result Meta & Download Grids with cached DOM lookups
  function renderResultCard(data) {
    const metaThumb = document.getElementById('metaThumb');
    const metaTitle = document.getElementById('metaTitle');
    const metaAuthor = document.getElementById('metaAuthor');
    const metaDuration = document.getElementById('metaDuration');

    if (metaThumb) metaThumb.src = data.thumbnail;
    if (metaTitle) metaTitle.textContent = data.title;
    if (metaAuthor) metaAuthor.textContent = data.author;
    if (metaDuration) metaDuration.textContent = data.duration;
    
    const datePill = document.getElementById('metaPublishDatePill');
    const dateSpan = document.getElementById('metaPublishDate');
    if (data.publishDate && datePill && dateSpan) {
      dateSpan.textContent = data.publishDate;
      datePill.style.display = 'inline-flex';
    } else if (datePill) {
      datePill.style.display = 'none';
    }

    const viewsPill = document.getElementById('metaViewsPill');
    const viewsSpan = document.getElementById('metaViews');
    if (data.views && viewsPill && viewsSpan) {
      viewsSpan.textContent = data.views;
      viewsPill.style.display = 'inline-flex';
    } else if (viewsPill) {
      viewsPill.style.display = 'none';
    }

    const likesPill = document.getElementById('metaLikesPill');
    const likesSpan = document.getElementById('metaLikes');
    if (data.likes && likesPill && likesSpan) {
      likesSpan.textContent = data.likes;
      likesPill.style.display = 'inline-flex';
    } else if (likesPill) {
      likesPill.style.display = 'none';
    }

    const platformTag = document.getElementById('metaPlatform');
    platformTag.innerHTML = `<i class="fa-brands ${data.platform.icon}"></i> ${data.platform.name}`;
    platformTag.style.color = data.platform.color;

    const wmBadge = document.getElementById('watermarkBadge');
    if (data.noWatermarkAvailable) {
      wmBadge.style.display = 'flex';
      wmBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> بدون علامة مائية ✨`;
    } else {
      wmBadge.style.display = 'none';
    }

    document.getElementById('videoCount').textContent = data.videoQualities.length;
    document.getElementById('audioCount').textContent = data.audioQualities.length;

    const videoGrid = document.getElementById('videoGrid');
    videoGrid.innerHTML = data.videoQualities.map(vq => `
      <div class="option-card">
        <div class="option-meta">
          <div class="quality-badge-row">
            <span class="q-title">${vq.quality}</span>
            <span class="q-badge">${vq.badge}</span>
          </div>
          <div class="q-sub">
            <span>${vq.resolution} (${vq.fps})</span>
            <span class="q-size">${vq.sizeFormatted}</span>
          </div>
        </div>
        <button class="dl-btn" onclick="handleDownloadClick('video', '${vq.quality}')">
          <i class="fa-solid fa-download"></i> تحميل
        </button>
      </div>
    `).join('');

    const audioGrid = document.getElementById('audioGrid');
    audioGrid.innerHTML = data.audioQualities.map(aq => `
      <div class="option-card">
        <div class="option-meta">
          <div class="quality-badge-row">
            <span class="q-title">${aq.format}</span>
            <span class="q-badge">${aq.badge}</span>
          </div>
          <div class="q-sub">
            <span>${aq.bitrate} • ${aq.sampleRate}</span>
            <span class="q-size">${aq.sizeFormatted}</span>
          </div>
        </div>
        <button class="dl-btn" style="background: var(--gradient-cyber);" onclick="handleDownloadClick('audio', '${aq.format}')">
          <i class="fa-solid fa-music"></i> تحميل صوت
        </button>
      </div>
    `).join('');
  }

  // 14. Handle Direct Download Click
  window.handleDownloadClick = function(type, qualityName) {
    if (!extractedData) return;

    const list = type === 'video' ? extractedData.videoQualities : extractedData.audioQualities;
    const option = list.find(item => (item.quality === qualityName || item.format === qualityName));
    
    if (option && window.DownloadManager) {
      window.DownloadManager.startDownload({ ...option, type }, extractedData);
    }
  };

  // 15. Tab Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.getAttribute('data-tab');
      document.getElementById('videoTabPane').style.display = targetTab === 'video' ? 'block' : 'none';
      document.getElementById('audioTabPane').style.display = targetTab === 'audio' ? 'block' : 'none';
    });
  });

  // 16. QR Code Button Binding
  const generateQrBtn = document.getElementById('generateQrBtn');
  if (generateQrBtn) {
    generateQrBtn.addEventListener('click', () => {
      if (extractedData && window.QrModule) {
        window.QrModule.openModal(extractedData.url);
      }
    });
  }
});
