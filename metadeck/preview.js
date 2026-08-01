import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getCardTier, getTierBadgeInfo, calcOVR, deriveCardStats, POSITION_WEIGHTS, STATS_OUTFIELD } from "./ovrCalculator.js";
import { generatePlayerCardHTML } from "./playerCard.js";
const firebaseConfig = {
  apiKey: "AIzaSyBi-sGCeFTAj45k65jRQvwBks5jDW0Uj2o",
  authDomain: "efhub-f64cf.firebaseapp.com",
  projectId: "efhub-f64cf",
  storageBucket: "efhub-f64cf.firebasestorage.app",
  messagingSenderId: "540581635927",
  appId: "1:540581635927:web:7935e69adc3f73cc544012"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Face stat labels
const FACE_STAT_LABELS = {
  ATT: 'Attacking', DEF: 'Defending', ATH: 'Athleticism',
};



onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data().role !== 'admin') {
    alert("Access Denied: Admins Only");
    window.location.href = 'dashboard.html';
    return;
  }

  // Admin verified. Initialize preview.
  document.getElementById('screen-loading').classList.remove('active');
  document.getElementById('screen-stat').classList.add('active');
  renderMockResults();
  setupInteractivity();
  setupCalibration();
});

function setupInteractivity() {
  const btnVote = document.getElementById('btn-show-vote');
  const btnResults = document.getElementById('btn-show-results');
  const btnCalibrate = document.getElementById('btn-show-calibrate');

  btnVote.addEventListener('click', () => {
    btnVote.classList.add('active');
    btnResults.classList.remove('active');
    btnCalibrate.classList.remove('active');
    document.getElementById('screen-stat').classList.add('active');
    document.getElementById('screen-results').classList.remove('active');
    document.getElementById('screen-calibrate').classList.remove('active');
  });

  btnResults.addEventListener('click', () => {
    btnResults.classList.add('active');
    btnVote.classList.remove('active');
    btnCalibrate.classList.remove('active');
    document.getElementById('screen-results').classList.add('active');
    document.getElementById('screen-stat').classList.remove('active');
    document.getElementById('screen-calibrate').classList.remove('active');
  });

  btnCalibrate.addEventListener('click', () => {
    btnCalibrate.classList.add('active');
    btnVote.classList.remove('active');
    btnResults.classList.remove('active');
    document.getElementById('screen-calibrate').classList.add('active');
    document.getElementById('screen-stat').classList.remove('active');
    document.getElementById('screen-results').classList.remove('active');
  });

  // Slider mockup
  const slider = document.getElementById('stat-slider');
  const valInput = document.getElementById('stat-value-input');

  // Initialize slider fill
  updatePreviewSliderFill(parseInt(slider.value));

  slider.addEventListener('input', () => {
    valInput.value = slider.value;
    updatePreviewSliderFill(parseInt(slider.value));
  });
  valInput.addEventListener('input', () => {
    let raw = valInput.value.replace(/\D/g, '');
    if (raw === '' || raw === '0') { valInput.value = raw; return; }
    let num = parseInt(raw);
    if (num > 99) { num = 99; raw = '99'; }
    valInput.value = raw;
    if (num >= 40 && num <= 99) {
      slider.value = num;
      updatePreviewSliderFill(num);
    }
  });
  valInput.addEventListener('blur', () => {
    let val = parseInt(valInput.value) || 50;
    if (val < 40) val = 40;
    if (val > 99) val = 99;
    valInput.value = val;
    slider.value = val;
    updatePreviewSliderFill(val);
  });
}

function updatePreviewSliderFill(val) {
  const slider = document.getElementById('stat-slider');
  const min = 40, max = 99;
  const pct = ((val - min) / (max - min)) * 100;
  const color = '#ff6b35'; // Attacking color for preview
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;
}

function renderMockResults() {
  const carousel = document.getElementById('cards-carousel');
  const dots = document.getElementById('carousel-dots');

  const mockPlayers = [
    {
      name: "L. Messi", position: "RWF", ovr: 96,
      cardStats: { ATT: 93, DEF: 34, PHY: 68 },
      rawStats: { 'FIN': 99, 'DRI': 99, 'BCO': 97, 'LOP': 95, 'DAW': 38, 'TAC': 35, 'SPD': 82, 'ACC': 90, 'BAL': 95 },
      voterDetails: [
        { name: "Admin (You)", stats: { 'FIN': 99, 'DRI': 98, 'BCO': 98, 'LOP': 95, 'DAW': 40, 'TAC': 35, 'SPD': 81, 'ACC': 90, 'BAL': 95 } },
        { name: "Ammar", stats: { 'FIN': 98, 'DRI': 99, 'BCO': 96, 'LOP': 94, 'DAW': 36, 'TAC': 35, 'SPD': 83, 'ACC': 90, 'BAL': 94 } },
        { name: "John", stats: { 'FIN': 99, 'DRI': 99, 'BCO': 97, 'LOP': 96, 'DAW': 38, 'TAC': 34, 'SPD': 82, 'ACC': 91, 'BAL': 96 } }
      ]
    },
    {
      name: "K. Mbappé", position: "CF", ovr: 92,
      cardStats: { ATT: 90, DEF: 36, PHY: 78 },
      rawStats: { 'FIN': 94, 'DRI': 92, 'SPD': 99, 'ACC': 97, 'DAW': 30 },
      voterDetails: [
        { name: "Admin (You)", stats: { 'FIN': 94, 'DRI': 91, 'SPD': 98, 'ACC': 97, 'DAW': 30 } },
        { name: "Ammar", stats: { 'FIN': 93, 'DRI': 93, 'SPD': 99, 'ACC': 96, 'DAW': 32 } },
        { name: "John", stats: { 'FIN': 95, 'DRI': 92, 'SPD': 99, 'ACC': 98, 'DAW': 28 } }
      ]
    },
    {
      name: "K. De Bruyne", position: "CMF", ovr: 85,
      cardStats: { ATT: 85, DEF: 65, PHY: 77 },
      rawStats: { 'LOP': 99, 'LFP': 95, 'FIN': 90, 'PLK': 88, 'DAW': 62, 'TAC': 68, 'STM': 88, 'SPD': 76, 'KPW': 90 },
      voterDetails: [
        { name: "Ammar", stats: { 'LOP': 99, 'LFP': 94, 'FIN': 89, 'PLK': 88, 'DAW': 60, 'TAC': 68, 'STM': 88, 'SPD': 76, 'KPW': 90 } },
        { name: "John", stats: { 'LOP': 98, 'LFP': 96, 'FIN': 91, 'PLK': 87, 'DAW': 64, 'TAC': 67, 'STM': 89, 'SPD': 77, 'KPW': 89 } }
      ]
    },
    {
      name: "V. van Dijk", position: "CB", ovr: 78,
      cardStats: { ATT: 60, DEF: 89, PHY: 86 },
      rawStats: { 'HEA': 96, 'LOP': 72, 'DAW': 98, 'TAC': 99, 'AGG': 85, 'SPD': 78, 'PHY': 95, 'JMP': 92 },
      voterDetails: [
        { name: "Ammar", stats: { 'HEA': 95, 'LOP': 70, 'DAW': 98, 'TAC': 99, 'AGG': 86, 'SPD': 78, 'PHY': 94, 'JMP': 92 } },
        { name: "John", stats: { 'HEA': 97, 'LOP': 74, 'DAW': 97, 'TAC': 98, 'AGG': 84, 'SPD': 77, 'PHY': 96, 'JMP': 91 } }
      ]
    }
  ];

  mockPlayers.forEach((mockPlayer, index) => {
    carousel.insertAdjacentHTML('beforeend', generatePlayerCardHTML(mockPlayer));

    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
    dots.appendChild(dot);
  });
}

// ── Calibration Logic ─────────────────────────────────────────
function setupCalibration() {
  const posSelect = document.getElementById('calib-pos');
  const inputsContainer = document.getElementById('calib-inputs');

  // Populate positions
  const positions = Object.keys(POSITION_WEIGHTS);
  positions.forEach(pos => {
    const opt = document.createElement('option');
    opt.value = pos;
    opt.textContent = pos;
    posSelect.appendChild(opt);
  });

  // Combine all stats
  const allStats = [...STATS_OUTFIELD];
  const uniqueStats = [];
  const seenCodes = new Set();

  allStats.forEach(s => {
    if (!seenCodes.has(s.code)) {
      seenCodes.add(s.code);
      uniqueStats.push(s);
    }
  });

  // Create inputs
  uniqueStats.forEach(stat => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';

    const label = document.createElement('label');
    label.textContent = `${stat.name} (${stat.code})`;
    label.style.fontSize = '0.8rem';
    label.style.color = 'var(--text-muted)';

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '40';
    input.max = '99';
    input.value = '50';
    input.dataset.code = stat.code;
    input.style.background = 'var(--bg-card)';
    input.style.color = 'var(--text-main)';
    input.style.border = '1px solid var(--border)';
    input.style.padding = '4px 8px';
    input.style.borderRadius = 'var(--radius-sm)';

    input.addEventListener('input', renderCalibrationCard);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    inputsContainer.appendChild(wrapper);
  });

  posSelect.addEventListener('change', renderCalibrationCard);

  // Initial render
  renderCalibrationCard();
}

function renderCalibrationCard() {
  const posSelect = document.getElementById('calib-pos');
  const position = posSelect.value;

  // Gather stats
  const inputs = document.getElementById('calib-inputs').querySelectorAll('input');
  const statsObj = {};
  inputs.forEach(input => {
    statsObj[input.dataset.code] = parseInt(input.value) || 50;
  });

  const cardStats = deriveCardStats(statsObj);
  const ovr = calcOVR(statsObj, position);

  const container = document.getElementById('calib-card-container');
  container.innerHTML = generatePlayerCardHTML({ ovr, position, name: 'DUMMY PLAYER', cardStats, rawStats: statsObj });
}
// ── Menu Logic ────────────────────────────────────────────
const menuBtn = document.getElementById('menu-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
if (menuBtn && dropdownMenu) {
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  });
}
