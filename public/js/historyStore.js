// SHEFOtube Advanced Download History Manager (S-4: HTML Escaped for XSS Prevention)
const HISTORY_KEY = 'shefotube_history_v1';

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

window.HistoryStore = {
  activeFilter: 'all',
  searchQuery: '',

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  addDownload(item) {
    const history = this.getHistory();
    const newItem = {
      id: Date.now(),
      title: item.title,
      quality: item.quality,
      sizeMB: item.sizeMB || parseFloat(item.sizeFormatted) || 15.0,
      sizeFormatted: item.sizeFormatted,
      thumb: item.thumb,
      date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      type: item.type || 'video',
      url: item.url
    };
    
    history.unshift(newItem);
    if (history.length > 50) history.pop();
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    this.renderHistory();
  },

  removeDownload(id) {
    let history = this.getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    this.renderHistory();
    if (window.showToast) window.showToast('تم حذف العنصر من السجل', 'info');
  },

  clearAll() {
    if (confirm('هل أنت تأكد من مسح جميع التحميلات من السجل؟')) {
      localStorage.removeItem(HISTORY_KEY);
      this.renderHistory();
      if (window.showToast) window.showToast('تم إخلاء سجل التحميلات بالكامل', 'info');
    }
  },

  setFilter(filter) {
    this.activeFilter = filter;
    this.renderHistory();
  },

  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.renderHistory();
  },

  shareItem(title, url) {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `تحميل ${title} عبر SHEFOtube PRO 4K`,
        url: url || window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url || window.location.href).then(() => {
        if (window.showToast) window.showToast('تم نسخ رابط التحميل للحافظة 📋', 'success');
      });
    }
  },

  renderHistory() {
    const listEl = document.getElementById('historyList');
    const statsEl = document.getElementById('historyStats');
    if (!listEl) return;

    let history = this.getHistory();

    const totalSizeMB = history.reduce((sum, item) => sum + (parseFloat(item.sizeMB) || 0), 0).toFixed(1);
    if (statsEl) {
      statsEl.innerHTML = `
        <span style="color: var(--accent-gold);"><i class="fa-solid fa-hard-drive"></i> إجمالي التحميلات: <strong>${escapeHTML(totalSizeMB)} MB</strong></span> • 
        <span><i class="fa-solid fa-list-check"></i> العدد: <strong>${history.length} ملفات</strong></span>
      `;
    }

    if (this.activeFilter !== 'all') {
      history = history.filter(h => h.type === this.activeFilter);
    }

    if (this.searchQuery) {
      history = history.filter(h => h.title.toLowerCase().includes(this.searchQuery) || h.quality.toLowerCase().includes(this.searchQuery));
    }

    if (history.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 30px; background: rgba(255,255,255,0.02); border-radius: var(--radius-md);">
          <i class="fa-solid fa-box-open" style="font-size: 38px; margin-bottom: 10px; color: var(--accent-gold);"></i>
          <p style="font-weight: 700;">لا توجد عناصر في سجل التحميلات حالياً</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = history.map(item => `
      <div class="history-item">
        <div class="history-meta">
          <img src="${escapeHTML(item.thumb)}" class="history-thumb" alt="غلاف">
          <div>
            <strong style="font-size: 14px; display: block; line-height: 1.3;">${escapeHTML(item.title)}</strong>
            <span style="font-size: 12px; color: var(--text-muted);">${item.type === 'video' ? '🎥 فيديو' : '🎧 صوت'} • ${escapeHTML(item.quality)} • <span style="color: var(--accent-gold); font-weight: 700;">${escapeHTML(item.sizeFormatted)}</span> • ${escapeHTML(item.date)}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="icon-btn" style="width: 34px; height: 34px;" title="مشاركة" onclick="HistoryStore.shareItem('${escapeHTML(item.title).replace(/'/g, "\\'")}', '${escapeHTML(item.url)}')">
            <i class="fa-solid fa-share-nodes" style="color: var(--accent-cyan);"></i>
          </button>
          <button class="icon-btn" style="width: 34px; height: 34px;" title="حذف" onclick="HistoryStore.removeDownload(${item.id})">
            <i class="fa-solid fa-trash" style="color: #ef4444;"></i>
          </button>
        </div>
      </div>
    `).join('');
  }
};
