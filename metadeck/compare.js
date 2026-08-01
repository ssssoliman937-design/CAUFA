// =========================================================
//  MetaDeck — Player Comparison (Realtime Database)
//  compare.js
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  medianOf, deriveCardStats, calcOVR, STATS_OUTFIELD
} from "./ovrCalculator.js";
import { tallySkillConsensus, applySkillBoosts, applyPosterBoosts } from "./skillsData.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_Qb9cxN6rXY5K6SK-uvIpWNJIFG-2N9g",
  authDomain: "clowns-15441.firebaseapp.com",
  projectId: "clowns-15441",
  storageBucket: "clowns-15441.appspot.com",
  messagingSenderId: "144013585965",
  appId: "1:144013585965:web:e3741f008a9386e967d2a4",
  databaseURL: "https://clowns-15441-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let allPlayerCards = [];
let selectedIds = new Set();

const SCREENS = {
  loading: document.getElementById('screen-loading'),
  picker: document.getElementById('screen-picker'),
  compare: document.getElementById('screen-compare'),
};

function showScreen(name) {
  Object.values(SCREENS).forEach(s => s?.classList.remove('active'));
  SCREENS[name]?.classList.add('active');
}

onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = 'index.html'; return; }

  const userSnap = await get(ref(db, `users/${user.uid}`));
  const userData = userSnap.exists() ? userSnap.val() : {};
  const headerUsername = document.getElementById('header-username');
  if (headerUsername) headerUsername.textContent = userData.username || user.email.split('@')[0];

  if (userData.role === 'admin') {
    document.getElementById('header-admin-link')?.classList.remove('hidden');
  }

  await loadAllPlayerCards();
  renderPicker();
  showScreen('picker');
});

async function loadAllPlayerCards() {
  const playersSnap = await get(ref(db, 'players'));
  const players = [];
  if (playersSnap.exists()) {
    const data = playersSnap.val();
    Object.entries(data).forEach(([id, player]) => {
      players.push({ id, ...player });
    });
    players.sort((a, b) => (a.order || 999) - (b.order || 999));
  }

  const votesSnap = await get(ref(db, 'votes'));
  const allVotes = [];
  if (votesSnap.exists()) {
    const data = votesSnap.val();
    Object.values(data).forEach(v => allVotes.push(v));
  }

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
  if (!chips) return;

  chips.innerHTML = allPlayerCards.map(p => `
    <div class="picker-chip" data-id="${p.id}">${p.name} (${p.position || '-'})</div>
  `).join('');

  chips.querySelectorAll('.picker-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.id;
      if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
      chip.classList.toggle('on');
      const btnCompare = document.getElementById('btn-compare');
      if (btnCompare) btnCompare.disabled = selectedIds.size < 2;
    });
  });
}

document.getElementById('btn-compare')?.addEventListener('click', () => {
  renderComparison(allPlayerCards.filter(p => selectedIds.has(p.id)));
  showScreen('compare');
});

document.getElementById('btn-back-to-picker')?.addEventListener('click', () => {
  showScreen('picker');
});

function renderComparison(players) {
  const box = document.getElementById('compare-table');
  if (!box) return;

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

document.getElementById('logout-btn')?.addEventListener('click', async () => {
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
