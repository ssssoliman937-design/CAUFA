// =========================================================
//  MetaDeck — Dashboard State Machine (Realtime Database)
//  dashboard.js
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, child, get, set, update, onValue, push, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  roundAvg, medianOf, deriveCardStats, POSITION_WEIGHTS, DEFAULT_WEIGHTS,
  calcOVR, getCardTier, getTierBadgeInfo,
  STATS_OUTFIELD
} from "./ovrCalculator.js";
import { generatePlayerCardHTML } from "./playerCard.js";
import { SKILL_CATEGORIES, tallySkillConsensus, applySkillBoosts, applyPosterBoosts } from "./skillsData.js";

// ── Firebase ──────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
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

const S = {
  user: null,
  userData: null,
  players: [],
  currentPlayerIdx: 0,
  currentStatIdx: 0,
  currentVote: {},
  currentSkills: new Set(),
  editingIdx: null,
  draftVotes: [],
  statsForPlayer: [],
  pastVotes: [],
  finalResults: [],
};

function draftKey() { return `metadeck_draft_${S.user.uid}`; }
function saveDraftLocal() {
  try {
    localStorage.setItem(draftKey(), JSON.stringify({
      draftVotes: S.draftVotes,
      currentPlayerIdx: S.currentPlayerIdx,
    }));
  } catch (e) { console.warn('saveDraftLocal failed:', e); }
}
function loadDraftLocal() {
  try {
    const raw = localStorage.getItem(draftKey());
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function clearDraftLocal() {
  try { localStorage.removeItem(draftKey()); } catch (e) {}
}
function rebuildPastVotes() {
  S.pastVotes = S.draftVotes
    .map((d, i) => (d ? { name: S.players[i]?.name || d.playerName, votes: d.stats } : null))
    .filter(Boolean);
}

const SCREENS = {
  loading: document.getElementById('screen-loading'),
  intro: document.getElementById('screen-intro'),
  stat: document.getElementById('screen-stat'),
  skills: document.getElementById('screen-skills'),
  playerDone: document.getElementById('screen-player-done'),
  review: document.getElementById('screen-review'),
  waiting: document.getElementById('screen-waiting'),
  results: document.getElementById('screen-results'),
};

const header = document.getElementById('app-header');
const headerUsername = document.getElementById('header-username');
const statProgressFill = document.getElementById('stat-progress-fill');
const statPlayerLabel = document.getElementById('stat-player-label');
const statCategoryBadge = document.getElementById('stat-category-badge');
const statNameDisplay = document.getElementById('stat-name-display');
const statDescDisplay = document.getElementById('stat-desc-display');
const statInfoArea = document.getElementById('stat-info-area');
const statValueInput = document.getElementById('stat-value-input');
const statSlider = document.getElementById('stat-slider');
const statCounter = document.getElementById('stat-counter');
const prevStatBtn = document.getElementById('prev-stat-btn');
const nextStatBtn = document.getElementById('next-stat-btn');
const statPrevRatings = document.getElementById('stat-prev-ratings');
const skillsPlayerLabel = document.getElementById('skills-player-label');
const skillsCategories = document.getElementById('skills-categories');
const backToStatsBtn = document.getElementById('back-to-stats-btn');
const finishPlayerBtn = document.getElementById('finish-player-btn');
const reviewList = document.getElementById('review-list');
const btnSubmitAll = document.getElementById('btn-submit-all');

function showScreen(name) {
  Object.values(SCREENS).forEach(s => s.classList.remove('active'));
  SCREENS[name]?.classList.add('active');
  if (name !== 'loading') {
    headerUsername.textContent = S.userData?.username || S.user?.email?.split('@')[0] || '';
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  S.user = user;
  showScreen('loading');
  await initDashboard();
});

async function initDashboard() {
  try {
    const userRef = ref(db, `users/${S.user.uid}`);
    const userSnap = await get(userRef);

    if (!userSnap.exists()) {
      await set(userRef, {
        username: S.user.email.split('@')[0],
        has_voted: false,
        current_player_index: 0,
        created_at: new Date().toISOString(),
      });
    }

    S.userData = userSnap.val() || {};

    if (S.userData.role === 'admin') {
      document.getElementById('header-admin-link')?.classList.remove('hidden');
    }

    const playersRef = ref(db, 'players');
    const playersSnap = await get(playersRef);
    const allPlayers = [];
    if (playersSnap.exists()) {
      const data = playersSnap.val();
      Object.entries(data).forEach(([id, player]) => {
        allPlayers.push({ id, ...player });
      });
      allPlayers.sort((a, b) => (a.order || 999) - (b.order || 999));
    }

    S.players = allPlayers.filter(p => !p.linked_uid || p.linked_uid !== S.user.uid);

    if (S.players.length === 0) {
      alert('No players found. Ask admin to add players.');
      return;
    }

    if (S.userData.has_voted) {
      await checkAndTransitionToResults();
      return;
    }

    const localDraft = loadDraftLocal();
    if (localDraft && Array.isArray(localDraft.draftVotes) && localDraft.draftVotes.length === S.players.length) {
      S.draftVotes = localDraft.draftVotes;
      S.currentPlayerIdx = localDraft.currentPlayerIdx ?? 0;
    } else {
      S.currentPlayerIdx = S.userData.current_player_index ?? 0;
      S.draftVotes = new Array(S.players.length).fill(null);
    }
    rebuildPastVotes();

    if (S.currentPlayerIdx >= S.players.length) {
      showReview();
      return;
    }

    showIntro();

  } catch (err) {
    console.error('initDashboard error:', err);
    alert('Failed to load. Check connection and refresh.');
  }
}

function showIntro() {
  const player = S.players[S.currentPlayerIdx];
  const total = S.players.length;
  document.getElementById('intro-greeting').textContent = `Welcome, ${S.userData?.username || 'Squad'}!`;
  document.getElementById('intro-player-name').textContent = player.name;
  document.getElementById('intro-player-num').textContent = S.currentPlayerIdx + 1;
  document.getElementById('intro-player-total').textContent = total;
  showScreen('intro');
}

document.getElementById('start-btn')?.addEventListener('click', () => {
  beginRatingCurrentPlayer();
});

function beginRatingCurrentPlayer(prefillStats, prefillSkills) {
  S.statsForPlayer = STATS_OUTFIELD;
  S.currentVote = prefillStats ? { ...prefillStats } : {};
  if (!prefillStats) S.statsForPlayer.forEach(s => { S.currentVote[s.code] = 50; });
  S.currentSkills = new Set(prefillSkills || []);
  S.currentStatIdx = 0;
  renderStatStep('left');
  showScreen('stat');
}

function activePlayerIdx() {
  return S.editingIdx !== null ? S.editingIdx : S.currentPlayerIdx;
}

function renderStatStep(direction = 'left') {
  const stat = S.statsForPlayer[S.currentStatIdx];
  const player = S.players[activePlayerIdx()];
  const total = S.statsForPlayer.length;

  const pct = Math.round(((S.currentStatIdx + 1) / total) * 100);
  statProgressFill.style.width = pct + '%';

  statPlayerLabel.innerHTML = `Player ${activePlayerIdx() + 1} of ${S.players.length} &middot; <span class="highlight-name">${player.name.toUpperCase()}</span>`;
  statCategoryBadge.innerHTML = `<span class="cat-indicator-dot"></span> ${stat.category.toUpperCase()}`;
  statCategoryBadge.className = `stat-category-badge ${stat.cssClass}`;

  const inputArea = document.querySelector('.stat-input-area');
  if (inputArea) {
    inputArea.className = 'stat-input-area ' + (stat.cssClass || '');
  }

  statInfoArea.className = 'stat-info-area';
  void statInfoArea.offsetWidth;
  statInfoArea.classList.add(direction === 'left' ? 'anim-slide-left' : 'anim-slide-right');

  statNameDisplay.textContent = stat.name;
  statDescDisplay.textContent = stat.desc;

  if (S.pastVotes.length === 0) {
    statPrevRatings.innerHTML = '';
    statPrevRatings.hidden = true;
  } else {
    statPrevRatings.hidden = false;
    statPrevRatings.innerHTML = S.pastVotes.map(p => {
      const v = p.votes[stat.code] ?? '—';
      const cls = typeof v === 'number'
        ? v >= 75 ? 'prev-val--high' : v >= 50 ? 'prev-val--mid' : 'prev-val--low'
        : '';
      return `<div class="prev-rating-pill"><span class="prev-rating-name">${p.name.split(' ')[0]}</span><span class="prev-rating-val ${cls}">${v}</span></div>`;
    }).join('');
  }

  const val = S.currentVote[stat.code] ?? 50;
  statValueInput.value = val;
  statSlider.value = val;
  updateSliderFill(val);
  statCounter.textContent = `${S.currentStatIdx + 1} / ${total}`;

  prevStatBtn.disabled = S.currentStatIdx === 0;
  prevStatBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  nextStatBtn.innerHTML = S.currentStatIdx === total - 1 ? 'Finish <i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-chevron-right"></i>';
  nextStatBtn.disabled = false;
}

function updateSliderFill(val) {
  const min = 40, max = 99;
  const pct = ((val - min) / (max - min)) * 100;
  const catColors = {
    'cat-attacking': '#ff6b35',
    'cat-defending': '#4fc3f7',
    'cat-athleticism': '#ab47bc',
    'cat-speed': '#ffd54f',
    'cat-physical': '#ef5350',
    'cat-goalkeeping': '#66bb6a',
  };
  const stat = S.statsForPlayer[S.currentStatIdx];
  const color = catColors[stat?.cssClass] || '#f5c842';
  statSlider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;
}

function clamp(v) { return Math.max(40, Math.min(99, Math.round(v))); }

statSlider.addEventListener('input', () => {
  const val = clamp(parseInt(statSlider.value));
  statValueInput.value = val;
  updateSliderFill(val);
  S.currentVote[S.statsForPlayer[S.currentStatIdx].code] = val;
});

statValueInput.addEventListener('input', () => {
  let raw = statValueInput.value.replace(/\D/g, '');
  if (raw === '' || raw === '0') { statValueInput.value = raw; return; }
  let num = parseInt(raw);
  if (num > 99) { num = 99; raw = '99'; }
  statValueInput.value = raw;
  if (num >= 40 && num <= 99) {
    statSlider.value = num;
    updateSliderFill(num);
    S.currentVote[S.statsForPlayer[S.currentStatIdx].code] = num;
  }
});

statValueInput.addEventListener('blur', () => {
  let val = parseInt(statValueInput.value) || 50;
  if (val < 40) val = 40;
  if (val > 99) val = 99;
  statValueInput.value = val;
  statSlider.value = val;
  updateSliderFill(val);
  S.currentVote[S.statsForPlayer[S.currentStatIdx].code] = val;
});

prevStatBtn.addEventListener('click', () => {
  if (S.currentStatIdx > 0) {
    S.currentStatIdx--;
    renderStatStep('right');
  }
});

nextStatBtn.addEventListener('click', () => {
  const val = clamp(parseInt(statValueInput.value) || 50);
  S.currentVote[S.statsForPlayer[S.currentStatIdx].code] = val;

  if (S.currentStatIdx < S.statsForPlayer.length - 1) {
    S.currentStatIdx++;
    renderStatStep('left');
  } else {
    showSkillsStep();
  }
});

function isLastNewPlayer() {
  return S.editingIdx === null && S.currentPlayerIdx === S.players.length - 1;
}

function showSkillsStep() {
  renderSkillsStep();
  showScreen('skills');
}

function renderSkillsStep() {
  const player = S.players[activePlayerIdx()];
  skillsPlayerLabel.innerHTML = `Skills for <span class="highlight-name">${player.name.toUpperCase()}</span>`;

  skillsCategories.innerHTML = '';
  for (const [cat, skills] of Object.entries(SKILL_CATEGORIES)) {
    const block = document.createElement('div');
    block.className = 'cat-block';
    block.innerHTML = `<div class="cat-title"><span class="bar"></span>${cat}</div><div class="tiles"></div>`;
    const tilesEl = block.querySelector('.tiles');

    skills.forEach(skill => {
      const tile = document.createElement('div');
      tile.className = 'tile' + (S.currentSkills.has(skill) ? ' on' : '');
      tile.textContent = skill;
      tile.addEventListener('click', () => {
        if (S.currentSkills.has(skill)) {
          S.currentSkills.delete(skill);
          tile.classList.remove('on');
        } else {
          S.currentSkills.add(skill);
          tile.classList.add('on');
        }
      });
      tilesEl.appendChild(tile);
    });

    skillsCategories.appendChild(block);
  }

  finishPlayerBtn.textContent = S.editingIdx !== null
    ? 'Save Changes'
    : (isLastNewPlayer() ? 'Finish & Review All' : 'Save & Continue');
}

backToStatsBtn.addEventListener('click', () => {
  S.currentStatIdx = S.statsForPlayer.length - 1;
  renderStatStep('right');
  showScreen('stat');
});

finishPlayerBtn.addEventListener('click', () => {
  const player = S.players[activePlayerIdx()];
  const draft = {
    playerId: player.id,
    playerName: player.name,
    stats: { ...S.currentVote },
    skills: Array.from(S.currentSkills),
  };

  if (S.editingIdx !== null) {
    S.draftVotes[S.editingIdx] = draft;
    S.editingIdx = null;
    saveDraftLocal();
    rebuildPastVotes();
    showReview();
    return;
  }

  S.draftVotes[S.currentPlayerIdx] = draft;
  saveDraftLocal();
  rebuildPastVotes();

  const nextIdx = S.currentPlayerIdx + 1;
  update(ref(db, `users/${S.user.uid}`), { current_player_index: nextIdx }).catch(() => {});
  S.currentPlayerIdx = nextIdx;

  if (nextIdx >= S.players.length) {
    showReview();
  } else {
    showPlayerDone(player.name, nextIdx);
  }
});

function showPlayerDone(playerName, nextIdx) {
  document.getElementById('done-player-name').textContent = `Done with ${playerName}!`;
  document.getElementById('done-progress-text').textContent = `${nextIdx} of ${S.players.length} players complete`;
  const nextPlayer = S.players[nextIdx];
  document.getElementById('continue-btn').textContent = `Continue — Rate ${nextPlayer?.name || 'next player'} →`;
  showScreen('playerDone');
}

document.getElementById('continue-btn')?.addEventListener('click', () => {
  showIntro();
});

function showReview() {
  renderReview();
  showScreen('review');
}

function renderReview() {
  reviewList.innerHTML = S.draftVotes.map((d, i) => {
    if (!d) return '';
    return `
      <div class="review-item">
        <div class="review-avatar"></div>
        <div class="review-info">
          <div class="review-name">${d.playerName}</div>
          <div class="review-sub">${Object.keys(d.stats).length} stats &middot; ${d.skills.length} skills selected</div>
        </div>
        <button class="review-edit" data-idx="${i}">Edit</button>
      </div>`;
  }).join('');

  reviewList.querySelectorAll('.review-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      openDraftForEdit(parseInt(btn.dataset.idx, 10));
    });
  });
}

function openDraftForEdit(idx) {
  const draft = S.draftVotes[idx];
  if (!draft) return;
  S.editingIdx = idx;
  beginRatingCurrentPlayer(draft.stats, draft.skills);
}

btnSubmitAll.addEventListener('click', async () => {
  btnSubmitAll.disabled = true;
  btnSubmitAll.textContent = 'Submitting…';

  try {
    const votesRef = ref(db, 'votes');
    S.draftVotes.forEach(async (draft) => {
      if (!draft) return;
      const voteId = `${S.user.uid}_${draft.playerId}`;
      await set(ref(db, `votes/${voteId}`), {
        voter_uid: S.user.uid,
        player_id: draft.playerId,
        stats: draft.stats,
        skills: draft.skills,
        submitted_at: new Date().toISOString(),
      });
    });

    await update(ref(db, `users/${S.user.uid}`), {
      current_player_index: S.players.length,
      has_voted: true,
    });

    clearDraftLocal();
    S.userData.has_voted = true;
    await checkAndTransitionToResults();

  } catch (err) {
    console.error('submitAll error:', err);
    btnSubmitAll.disabled = false;
    btnSubmitAll.textContent = 'Done — Submit All ✓';
    alert('Could not submit. Check connection and try again.');
  }
});

document.getElementById('logout-for-later-btn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

let waitingUnsubscribe = null;

async function checkAndTransitionToResults() {
  showScreen('waiting');

  if (waitingUnsubscribe) waitingUnsubscribe();

  const usersRef = ref(db, 'users');
  waitingUnsubscribe = onValue(usersRef, async (snap) => {
    const data = snap.val() || {};
    const all = Object.values(data);
    const votedCount = all.filter(u => u.has_voted).length;
    const total = all.length;

    document.getElementById('waiting-tally-text').textContent = `${votedCount} / ${total} voted`;

    if (votedCount >= total && total > 0) {
      if (waitingUnsubscribe) {
        waitingUnsubscribe();
        waitingUnsubscribe = null;
      }
      await buildResults();
    }
  }, (err) => {
    console.error('waiting onValue error:', err);
    document.getElementById('waiting-tally-text').textContent = '? / ? voted';
  });
}

document.getElementById('logout-waiting-btn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});

async function buildResults() {
  showScreen('loading');

  try {
    const playersRef = ref(db, 'players');
    const playersSnap = await get(playersRef);
    const allPlayers = [];
    if (playersSnap.exists()) {
      const data = playersSnap.val();
      Object.entries(data).forEach(([id, player]) => {
        allPlayers.push({ id, ...player });
      });
      allPlayers.sort((a, b) => (a.order || 999) - (b.order || 999));
    }

    const votesRef = ref(db, 'votes');
    const votesSnap = await get(votesRef);
    const allVotes = [];
    if (votesSnap.exists()) {
      const data = votesSnap.val();
      Object.values(data).forEach(v => allVotes.push(v));
    }

    const usersRef = ref(db, 'users');
    const usersSnap = await get(usersRef);
    const allUsersMap = {};
    if (usersSnap.exists()) {
      const data = usersSnap.val();
      Object.entries(data).forEach(([id, u]) => {
        allUsersMap[id] = u.username || u.name || 'Unknown';
      });
    }

    const playerCards = allPlayers.map(player => {
      const statDefs = STATS_OUTFIELD;
      const playerVotes = allVotes.filter(v => v.player_id === player.id);

      const medianStats = {};
      statDefs.forEach(def => {
        const vals = playerVotes
          .map(v => v.stats?.[def.code])
          .filter(v => typeof v === 'number');
        medianStats[def.code] = medianOf(vals);
      });

      const grantedSkills = tallySkillConsensus(playerVotes.map(v => v.skills || []));
      const boostedStats = applySkillBoosts(medianStats, grantedSkills);

      const activePosters = Object.entries(player.posters || {})
        .filter(([, on]) => !!on)
        .map(([name]) => name);
      const finalStats = applyPosterBoosts(boostedStats, activePosters);

      const cardStats = deriveCardStats(finalStats);
      const ovr = calcOVR(finalStats, player.position);

      const voterDetails = playerVotes.map(v => ({
        name: allUsersMap[v.voter_uid] || 'Unknown',
        stats: v.stats || {}
      }));

      return {
        ...player,
        rawStats: finalStats,
        cardStats, ovr, voterDetails,
        grantedSkills,
        specialSkills: player.specialSkills || [],
        activePosters,
      };
    });

    S.finalResults = playerCards;
    renderResults(playerCards);

  } catch (err) {
    console.error('buildResults error:', err);
    alert('Failed to load results. Refresh and try again.');
  }
}

function renderResults(playerCards) {
  const carousel = document.getElementById('cards-carousel');
  const dots = document.getElementById('carousel-dots');
  carousel.innerHTML = '';
  dots.innerHTML = '';

  playerCards.forEach((player, i) => {
    carousel.insertAdjacentHTML('beforeend', generatePlayerCardHTML(player));
  });

  showScreen('results');
}

document.getElementById('btn-share-results')?.addEventListener('click', async () => {
  if (!S.finalResults || S.finalResults.length === 0) return;

  const lines = ['MetaDeck Squad Ratings:'];
  S.finalResults.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name} - OVR ${p.ovr} (${p.position || '-'})`);
  });

  const text = lines.join('\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'MetaDeck Squad Ratings',
        text: text
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
  } else {
    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  }
});

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
