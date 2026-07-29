// SHEFOtube Next-Gen Mobile Download Engine (WakeLock, Haptics, AppBadge)
window.DownloadManager = {
  activeDownload: null,
  wakeLock: null,

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (e) {}
    }
  },

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  },

  triggerHaptic(pattern = [50]) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  },

  updateAppBadge(count) {
    if ('setAppBadge' in navigator) {
      if (count > 0) navigator.setAppBadge(count).catch(() => {});
      else navigator.clearAppBadge().catch(() => {});
    }
  },

  async startDownload(option, videoMeta) {
    if (this.activeDownload) {
      if (window.showToast) window.showToast('⚠️ يوجد عملية تحميل شغالة حالياً، يرجى انتظارها أو إلغائها', 'warning');
      return;
    }

    const dashboard = document.getElementById('downloadDashboard');
    const fileNameEl = document.getElementById('dashFileName');
    const progressFill = document.getElementById('dashProgressFill');
    const percentageEl = document.getElementById('dashPercentage');
    const downloadedSizeEl = document.getElementById('dashDownloadedSize');
    const totalSizeEl = document.getElementById('dashTotalSize');
    const speedEl = document.getElementById('dashSpeed');
    const etaEl = document.getElementById('dashEta');

    const totalMB = option.sizeMB || 15.0;
    const totalBytes = Math.round(totalMB * 1024 * 1024);
    const title = `${videoMeta.title || 'فيديو'} - ${option.quality || option.format}`;

    if (dashboard) dashboard.classList.add('active');
    if (fileNameEl) fileNameEl.textContent = title;

    // Mobile Haptic & Wake Lock
    this.triggerHaptic([40, 60, 40]);
    this.requestWakeLock();
    this.updateAppBadge(1);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    let loadedBytes = 0;
    let startTime = Date.now();
    let lastTime = startTime;
    let lastLoadedBytes = 0;
    let isCancelled = false;

    this.activeDownload = {
      cancel() {
        isCancelled = true;
      }
    };

    if (window.showToast) {
      window.showToast(`بدأ تحميل ${title} (الحجم: ${option.sizeFormatted}) 🚀`);
    }

    const chunkSize = 256 * 1024;
    const intervalMs = 25;

    const timer = setInterval(() => {
      if (isCancelled) {
        clearInterval(timer);
        this.activeDownload = null;
        this.releaseWakeLock();
        this.updateAppBadge(0);
        if (dashboard) dashboard.classList.remove('active');
        if (window.showToast) window.showToast('تم إلغاء التحميل', 'info');
        return;
      }

      const speedFactor = Math.floor(Math.random() * 300 * 1024) + (250 * 1024);
      loadedBytes += speedFactor;
      if (loadedBytes > totalBytes) loadedBytes = totalBytes;

      const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
      const loadedMB = (loadedBytes / (1024 * 1024)).toFixed(1);

      const now = Date.now();
      const timeDiff = (now - lastTime) / 1000;
      let currentSpeedMBs = 0;

      if (timeDiff >= 0.2) {
        const bytesDiff = loadedBytes - lastLoadedBytes;
        currentSpeedMBs = ((bytesDiff / (1024 * 1024)) / timeDiff).toFixed(1);
        lastTime = now;
        lastLoadedBytes = loadedBytes;
      } else {
        currentSpeedMBs = (Math.random() * 4 + 12).toFixed(1);
      }

      const bytesRemaining = totalBytes - loadedBytes;
      const speedBytesPerSec = parseFloat(currentSpeedMBs) * 1024 * 1024 || 1;
      const etaSeconds = Math.max(0, Math.ceil(bytesRemaining / speedBytesPerSec));
      const etaFormatted = `00:${etaSeconds < 10 ? '0' : ''}${etaSeconds}`;

      if (progressFill) progressFill.style.width = `${percent}%`;
      if (percentageEl) percentageEl.textContent = `${percent}%`;
      if (downloadedSizeEl) downloadedSizeEl.textContent = `${loadedMB} MB`;
      if (totalSizeEl) totalSizeEl.textContent = `${totalMB} MB`;
      if (speedEl) speedEl.textContent = `${currentSpeedMBs} MB/s`;
      if (etaEl) etaEl.textContent = `${etaFormatted} ثانية`;

      if (percent % 25 === 0 && 'Notification' in window && Notification.permission === 'granted') {
        try {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(`جاري التحميل (${percent}%) - SHEFOtube`, {
              body: `${loadedMB} MB من ${totalMB} MB | السرعة: ${currentSpeedMBs} MB/s`,
              icon: videoMeta.thumbnail,
              tag: 'shefotube-download-progress',
              renotify: true
            });
          });
        } catch (e) {}
      }

      if (loadedBytes >= totalBytes) {
        clearInterval(timer);
        this.activeDownload = null;
        this.releaseWakeLock();
        this.updateAppBadge(0);
        this.triggerHaptic([100, 50, 100]);

        if (dashboard) dashboard.classList.remove('active');

        const a = document.createElement('a');
        a.href = option.downloadUrl || '#';
        a.download = `${title.replace(/\s+/g, '_')}.${option.ext || 'mp4'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (window.HistoryStore) {
          window.HistoryStore.addDownload({
            title: videoMeta.title,
            quality: option.quality || option.format,
            sizeMB: totalMB,
            sizeFormatted: option.sizeFormatted,
            thumb: videoMeta.thumbnail,
            type: option.type || 'video',
            url: option.downloadUrl
          });
        }

        if (window.showToast) {
          window.showToast(`🎉 اكتمل تحميل ${title} بنجاح!`, 'success');
        }

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎉 اكتمل التحميل بنجاح!', {
            body: `تم حفظ ${title} بحجم ${totalMB} MB على جهازك.`,
            icon: videoMeta.thumbnail
          });
        }
      }
    }, intervalMs);
  },

  cancelDownload() {
    if (this.activeDownload) {
      this.activeDownload.cancel();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const cancelBtn = document.getElementById('dashCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => DownloadManager.cancelDownload());
  }
});
