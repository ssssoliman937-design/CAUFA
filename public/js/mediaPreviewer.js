// Media Previewer, Equalizer & Timestamp Trimmer Module
window.MediaPreviewer = {
  currentMedia: null,
  trimStart: 0,
  trimEnd: 0,
  activeEq: 'normal',

  init(data) {
    this.currentMedia = data;
    const playerContainer = document.getElementById('playerContainer');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const trimmerBox = document.getElementById('trimmerBox');
    
    if (playerContainer) playerContainer.style.display = 'none';
    if (trimmerBox) trimmerBox.classList.remove('active');
    
    if (mediaPlayer) {
      mediaPlayer.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    }
  },

  togglePreview() {
    const playerContainer = document.getElementById('playerContainer');
    const mediaPlayer = document.getElementById('mediaPlayer');
    if (!playerContainer || !mediaPlayer) return;

    if (playerContainer.style.display === 'none') {
      playerContainer.style.display = 'block';
      mediaPlayer.play().catch(() => {});
      if (window.showToast) window.showToast('جاري تشغيل المعاينة المباشرة 🎬');
    } else {
      playerContainer.style.display = 'none';
      mediaPlayer.pause();
    }
  },

  toggleTrimmer() {
    const trimmerBox = document.getElementById('trimmerBox');
    if (trimmerBox) {
      trimmerBox.classList.toggle('active');
      if (trimmerBox.classList.contains('active') && window.showToast) {
        window.showToast('أداة قص الفيديو مفعلة ✂️');
      }
    }
  },

  applyTrim() {
    const startVal = parseInt(document.getElementById('trimStart').value) || 0;
    const endVal = parseInt(document.getElementById('trimEnd').value) || 60;
    
    if (startVal >= endVal) {
      if (window.showToast) window.showToast('⚠️ يجب أن يكون وقت النهاية أكبر من وقت البداية', 'error');
      return;
    }

    this.trimStart = startVal;
    this.trimEnd = endVal;
    const diffSec = endVal - startVal;
    
    if (window.showToast) {
      window.showToast(`تم تحديد الجزء من الثواني (${startVal}ث إلى ${endVal}ث) - المدة ${diffSec} ثانية ✨`);
    }
  },

  setEq(preset) {
    this.activeEq = preset;
    const eqBtns = document.querySelectorAll('.eq-btn');
    eqBtns.forEach(b => {
      if (b.getAttribute('data-eq') === preset) b.classList.add('active');
      else b.classList.remove('active');
    });

    let msg = 'تم تفعيل وضع المعالج المتوازن 🎧';
    if (preset === 'bass') msg = 'تم تفعيل وضع مضخم الصوت Bass Boost 🔊🔥';
    if (preset === 'vocal') msg = 'تم تفعيل وضع استوديو نقاء الصوت 🎙️✨';

    if (window.showToast) window.showToast(msg, 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const previewBtn = document.getElementById('previewMediaBtn');
  const trimmerBtn = document.getElementById('toggleTrimmerBtn');
  const applyTrimBtn = document.getElementById('applyTrimBtn');
  const eqBtns = document.querySelectorAll('.eq-btn');

  if (previewBtn) previewBtn.addEventListener('click', () => MediaPreviewer.togglePreview());
  if (trimmerBtn) trimmerBtn.addEventListener('click', () => MediaPreviewer.toggleTrimmer());
  if (applyTrimBtn) applyTrimBtn.addEventListener('click', () => MediaPreviewer.applyTrim());

  eqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-eq');
      MediaPreviewer.setEq(preset);
    });
  });
});
