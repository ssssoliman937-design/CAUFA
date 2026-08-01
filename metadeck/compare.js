// =========================================================
//  MetaDeck — Player Comparison
//  compare.js
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc,
  collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  medianOf, deriveCardStats, calcOVR, STATS_OUTFIELD
} from "./ovrCalculator.js";
import { tallySkillConsensus, applySkillBoosts, applyPosterBoosts } from "./skillsData.js";

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

let allPlayerCards = [];
let selectedIds = new Set();

const SCREENS = {
  loading: document.getElementById('screen-loading'),
  picker: document.getElementById('screen-picker'),
  compare: document.getElementById('screen-compare'),
};
function showScreen(name) {
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[name].classList.add('active');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = 'index.html'; return; }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  document.getElementById('header-username').textContent = userData.username || user.email.split('@')[0];
  if (userData.role === 'admin') {
    document.getElementById('header-admin-link').classList.remove('hidden');
  }

  await loadAllPlayerCards();
  renderPicker();
  showScreen('picker');
});

async function loadAllPlayerCards() {
  const playersSnap = await getDocs(query(collection(db, 'players'), orderBy('order')));
  const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const votesSnap = await getDocs(collection(db, 'votes'));
  const allVotes = votesSnap.docs.map(d => d.data());

  allPlayerCards = players.map(player => {
    const playerVotes = allVotes.filter(v => v.player_id === player.id);

    const medianStats = {};
    STATS_OUTFIELD.forEach(def => {
      const vals = playerVotes.map(v => v.stats?.[def.code]).filter(v => typeof v === 'number');
      medianStats[def.code] = medianOf(vals);
    });

    const grantedSkills = tallySkillConsensus(playerVotes.map(v => v.skills || []));
    const boostedStats = applySkillBoosts(medianStats, grantedSkills);

    const activePosters = Object.entries(player.posters || {}).filter(([, on]) => on).map(([name]) => name);
    const finalStats = applyPosterBoosts(boostedStats, activePosters);

    return {
      ...player,
      rawStats: finalStats,
      cardStats: deriveCardStats(finalStats),
      ovr: calcOVR(finalStats, player.position),
      grantedSkills,
      specialSkills: player.specialSkills || [],
      activePosters,
    };
  });
}

function renderPicker() {
  const chips = document.getElementById('picker-chips');
  chips.innerHTML = allPlayerCards.map(p => `
    <div class="picker-chip" data-id="${p.id}">${p.name} (${p.position || '-'})</div>
  `).join('');

  chips.querySelectorAll('.picker-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
      chip.classList.toggle('on');
      document.getElementById('btn-compare').disabled = selectedIds.size < 2;
    });
  });
}

document.getElementById('btn-compare').addEventListener('click', () => {
  renderComparison(allPlayerCards.filter(p => selectedIds.has(p.id)));
  showScreen('compare');
});

document.getElementById('btn-back-to-picker').addEventListener('click', () => {
  showScreen('picker');
});

function renderComparison(players) {
  const box = document.getElementById('compare-table');

  const rows = [
    { label: 'OVR', get: p => p.ovr },
    { label: 'ATT', get: p => p.cardStats.ATT },
    { label: 'DEF', get: p => p.cardStats.DEF },
    { label: 'PHY', get: p => p.cardStats.PHY },
    ...STATS_OUTFIELD.map(def => ({ label: def.name, get: p => p.rawStats[def.code] ?? '-' })),
  ];

  const cols = `repeat(${players.length + 1}, 1fr)`;

  let html = `<div class="compare-grid" style="grid-template-columns: ${cols};">`;
  html += `<div class="compare-head-row">
    <div class="compare-cell label-cell"></div>
    ${players.map(p => `<div class="compare-cell player-head">${p.name}</div>`).join('')}
  </div>`;

  rows.forEach(row => {
    const values = players.map(p => row.get(p));
    const numeric = values.filter(v => typeof v === 'number');
    const max = numeric.length ? Math.max(...numeric) : null;

    html += `<div class="compare-stat-row">
      <div class="compare-cell label-cell">${row.label}</div>
      ${values.map(v => `<div class="compare-cell ${v === max && numeric.length > 1 ? 'best' : ''}">${v}</div>`).join('')}
    </div>`;
  });

  html += `</div>`;

  html += `<div class="compare-skills-block">`;
  players.forEach(p => {
    const chips = [
      ...p.specialSkills.map(name => `<span class="skill-chip chip-special">${name}</span>`),
      ...p.grantedSkills.map(g => `<span class="skill-chip chip-${g.tier}">${g.skill}</span>`),
    ].join('');
    html += `
      <div class="compare-skills-card">
        <h4>${p.name} — Skills</h4>
        ${chips || '<span class="none">No skills yet</span>'}
      </div>`;
  });
  html += `</div>`;

  box.innerHTML = html;
}

// ── Header logout + menu ───────────────────────────────────
document.getElementById('logout-btn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

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
