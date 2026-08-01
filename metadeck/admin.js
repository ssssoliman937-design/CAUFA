// =========================================================
//  MetaDeck — Admin Panel Logic (Realtime Database)
//  admin.js
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, get, set, update, remove, onValue, push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { SPECIAL_SKILLS, POSTERS, applyPosterBoosts } from "./skillsData.js";
import { STATS_OUTFIELD, medianOf, deriveCardStats, calcOVR } from "./ovrCalculator.js";

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

let currentUser = null;
let currentPlayers = [];
let editingPlayerVotes = [];

const logoutBtn = document.getElementById('logout-btn');
const playersList = document.getElementById('players-list');
const usersList = document.getElementById('users-list');
const btnAddPlayer = document.getElementById('btn-add-player');
const btnResetVotes = document.getElementById('btn-reset-votes');
const playerModal = document.getElementById('player-modal');
const modalTitle = document.getElementById('modal-title');
const playerForm = document.getElementById('player-form');
const btnCancelModal = document.getElementById('btn-cancel-modal');

// ── TEST MODE: bypass auth with ?test=true ───────────────
const testMode = new URLSearchParams(window.location.search).get('test') === 'true';
if (testMode) {
  console.log('🧪 TEST MODE - Auth bypassed (admin)');
  currentUser = JSON.parse(localStorage.getItem('testUser') || '{"uid":"test-admin","email":"admin@squad.com"}');
  initAdmin().catch(err => console.error('Init failed:', err));
} else {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    const userRef = ref(db, `users/${user.uid}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists() || userSnap.val().role !== 'admin') {
      alert("Unauthorized. You must be an admin.");
      window.location.href = 'dashboard.html';
      return;
    }

    currentUser = user;
    initAdmin();
  });
}

async function initAdmin() {
  await Promise.all([loadPlayers(), loadUsers()]);
}

async function loadPlayers() {
  try {
    const snap = await get(ref(db, 'players'));
    currentPlayers = [];
    if (snap.exists()) {
      const data = snap.val();
      Object.entries(data).forEach(([id, player]) => {
        currentPlayers.push({ id, ...player });
      });
      currentPlayers.sort((a, b) => (a.order || 999) - (b.order || 999));
    }
    renderPlayers();
  } catch (err) {
    console.error("Error loading players:", err);
    playersList.innerHTML = `<tr><td colspan="5">Failed to load players.</td></tr>`;
  }
}

function renderPlayers() {
  if (currentPlayers.length === 0) {
    playersList.innerHTML = `<tr><td colspan="5">No players found.</td></tr>`;
    return;
  }

  playersList.innerHTML = currentPlayers.map(p => `
    <tr>
      <td>${p.order}</td>
      <td>${p.name}</td>
      <td>${p.position || '-'}</td>
      <td>
        <button class="btn-icon edit" data-id="${p.id}">Edit</button>
        <button class="btn-icon delete" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
  });
  document.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => deletePlayer(e.target.dataset.id));
  });
}

function renderSpecialSkillsGrid(selected = []) {
  const grid = document.getElementById('special-skills-grid');
  grid.innerHTML = SPECIAL_SKILLS.map(skill => `
    <label>
      <input type="checkbox" value="${skill}" ${selected.includes(skill) ? 'checked' : ''}>
      ${skill}
    </label>
  `).join('');
}

function getSelectedSpecialSkills() {
  return Array.from(document.querySelectorAll('#special-skills-grid input:checked')).map(el => el.value);
}

function renderPostersGrid(posters = {}) {
  const grid = document.getElementById('posters-grid');
  grid.innerHTML = Object.keys(POSTERS).map(name => {
    const assigned = Object.prototype.hasOwnProperty.call(posters, name);
    const active = assigned ? !!posters[name] : true;
    return `
      <div class="poster-row ${assigned ? 'assigned' : ''}" data-poster="${name}">
        <label>
          <input type="checkbox" class="poster-assign" value="${name}" ${assigned ? 'checked' : ''}>
          ${name}
        </label>
        <span class="poster-toggle">
          Active <input type="checkbox" class="poster-active" ${active ? 'checked' : ''} ${assigned ? '' : 'disabled'}>
        </span>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.poster-assign').forEach(cb => {
    cb.addEventListener('change', () => {
      const row = cb.closest('.poster-row');
      const activeCheckbox = row.querySelector('.poster-active');
      activeCheckbox.disabled = !cb.checked;
      updatePosterPreview();
    });
  });

  grid.querySelectorAll('.poster-active').forEach(cb => {
    cb.addEventListener('change', () => updatePosterPreview());
  });
}

function getSelectedPosters() {
  const result = {};
  document.querySelectorAll('#posters-grid .poster-assign:checked').forEach(cb => {
    const row = cb.closest('.poster-row');
    const activeCheckbox = row.querySelector('.poster-active');
    result[cb.value] = activeCheckbox.checked;
  });
  return result;
}

async function openEditModal(playerId) {
  const player = currentPlayers.find(p => p.id === playerId);
  if (!player) return;

  modalTitle.textContent = `Edit ${player.name}`;
  playerForm.dataset.playerId = playerId;

  document.getElementById('player-name').value = player.name || '';
  document.getElementById('player-position').value = player.position || '';
  document.getElementById('player-order').value = player.order || '';
  document.getElementById('player-linked-uid').value = player.linked_uid || '';

  renderSpecialSkillsGrid(player.specialSkills || []);
  renderPostersGrid(player.posters || {});

  try {
    const votesSnap = await get(ref(db, 'votes'));
    editingPlayerVotes = [];
    if (votesSnap.exists()) {
      const data = votesSnap.val();
      Object.values(data).forEach(v => {
        if (v.player_id === playerId) editingPlayerVotes.push(v);
      });
    }
    updatePosterPreview();
  } catch (err) {
    console.error('Error loading votes:', err);
  }

  playerModal.classList.add('show');
}

function updatePosterPreview() {
  if (editingPlayerVotes.length === 0) {
    document.getElementById('poster-preview').innerHTML = '<p>No votes yet.</p>';
    return;
  }

  const statDefs = STATS_OUTFIELD;
  const medianStats = {};
  statDefs.forEach(def => {
    const vals = editingPlayerVotes
      .map(v => v.stats?.[def.code])
      .filter(v => typeof v === 'number');
    medianStats[def.code] = medianOf(vals);
  });

  const beforeOVR = calcOVR(medianStats, 'ST');

  const selectedPosters = getSelectedPosters();
  const activePosters = Object.entries(selectedPosters)
    .filter(([, on]) => !!on)
    .map(([name]) => name);
  const boostedStats = applyPosterBoosts(medianStats, activePosters);
  const afterOVR = calcOVR(boostedStats, 'ST');

  const preview = document.getElementById('poster-preview');
  preview.innerHTML = `
    <div class="poster-preview">
      <div class="poster-preview-title">Before/After OVR</div>
      <div class="poster-preview-row">
        <span>Before: ${beforeOVR}</span>
        <span class="up">After: ${afterOVR} ${afterOVR > beforeOVR ? `<i>+${afterOVR - beforeOVR}</i>` : ''}</span>
      </div>
    </div>
  `;
}

btnAddPlayer.addEventListener('click', () => {
  modalTitle.textContent = 'Add New Player';
  playerForm.dataset.playerId = '';
  playerForm.reset();
  renderSpecialSkillsGrid([]);
  renderPostersGrid({});
  editingPlayerVotes = [];
  updatePosterPreview();
  playerModal.classList.add('show');
});

btnCancelModal.addEventListener('click', () => {
  playerModal.classList.remove('show');
});

playerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const playerId = playerForm.dataset.playerId || Date.now().toString();
  const playerData = {
    name: document.getElementById('player-name').value,
    position: document.getElementById('player-position').value,
    order: parseInt(document.getElementById('player-order').value) || 0,
    linked_uid: document.getElementById('player-linked-uid').value || null,
    specialSkills: getSelectedSpecialSkills(),
    posters: getSelectedPosters(),
  };

  try {
    await set(ref(db, `players/${playerId}`), playerData);
    playerModal.classList.remove('show');
    await loadPlayers();
  } catch (err) {
    console.error('Error saving player:', err);
    alert('Failed to save player.');
  }
});

async function deletePlayer(playerId) {
  if (!confirm('Delete this player? This cannot be undone.')) return;

  try {
    await remove(ref(db, `players/${playerId}`));
    await loadPlayers();
  } catch (err) {
    console.error('Error deleting player:', err);
    alert('Failed to delete player.');
  }
}

async function loadUsers() {
  try {
    const snap = await get(ref(db, 'users'));
    const users = [];
    if (snap.exists()) {
      const data = snap.val();
      Object.entries(data).forEach(([uid, user]) => {
        users.push({ uid, ...user });
      });
    }
    renderUsers(users);
  } catch (err) {
    console.error('Error loading users:', err);
    usersList.innerHTML = `<tr><td colspan="4">Failed to load users.</td></tr>`;
  }
}

function renderUsers(users) {
  if (users.length === 0) {
    usersList.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
    return;
  }

  usersList.innerHTML = users.map(u => `
    <tr>
      <td>${u.username || 'Unknown'}</td>
      <td>${u.role === 'admin' ? '👑 Admin' : 'User'}</td>
      <td>${u.has_voted ? '✓' : '—'}</td>
      <td>
        <button class="btn-icon reset-pw" data-uid="${u.uid}" data-username="${u.username}">Reset PW</button>
        <button class="btn-icon delete-user" data-uid="${u.uid}" data-username="${u.username}">Delete</button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-icon.reset-pw').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uid = e.target.dataset.uid;
      const username = e.target.dataset.username;
      resetUserPassword(uid, username);
    });
  });

  document.querySelectorAll('.btn-icon.delete-user').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const uid = e.target.dataset.uid;
      const username = e.target.dataset.username;
      deleteSquadUser(uid, username);
    });
  });
}

function resetUserPassword(uid, username) {
  const newPassword = prompt(`Enter new password for ${username}:`);
  if (!newPassword) return;

  alert('Note: Reset via Cloud Console or Auth admin SDK. Manual reset not available in client.');
}

async function deleteSquadUser(uid, username) {
  if (!confirm(`Delete user ${username}? This cannot be undone.`)) return;

  try {
    await remove(ref(db, `users/${uid}`));
    const votesSnap = await get(ref(db, 'votes'));
    if (votesSnap.exists()) {
      const data = votesSnap.val();
      Object.entries(data).forEach(async ([voteId, vote]) => {
        if (vote.voter_uid === uid) {
          await remove(ref(db, `votes/${voteId}`));
        }
      });
    }
    await loadUsers();
    alert(`Deleted ${username}.`);
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('Failed to delete user.');
  }
}

logoutBtn?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'index.html';
});
