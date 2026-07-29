// QR Code Modal Module
window.QrModule = {
  currentUrl: '',

  openModal(url) {
    this.currentUrl = url || window.location.href;
    const modal = document.getElementById('qrModal');
    const qrContainer = document.getElementById('qrCanvas');
    
    if (!modal || !qrContainer) return;
    
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: this.currentUrl,
      width: 180,
      height: 180,
      colorDark: '#0f172a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('qrModal');
    if (modal) modal.classList.remove('active');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeQrModal');
  const copyBtn = document.getElementById('copyQrLinkBtn');
  const modal = document.getElementById('qrModal');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => QrModule.closeModal());
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) QrModule.closeModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (QrModule.currentUrl) {
        navigator.clipboard.writeText(QrModule.currentUrl).then(() => {
          if (window.showToast) window.showToast('تم نسخ رابط QR للحافظة بنجاح! 📋');
        });
      }
    });
  }
});
