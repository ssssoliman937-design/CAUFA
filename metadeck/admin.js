// =========================================================
//  MetaDeck — Admin Panel Logic
//  admin.js
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, query, where, orderBy, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getFunctions, httpsCallable
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";
import { SPECIAL_SKILLS, POSTERS, applyPosterBoosts } from "./skillsData.js";
import { STATS_OUTFIELD, medianOf, deriveCardStats, calcOVR } from "./ovrCalculator.js";

// ── Firebase ──────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBi-sGCeFTAj45k65jRQvwBks5jDW0Uj2o",
  authDomain: "efhub-f64cf.firebaseapp.com",
  projectId: "efhub-f64cf",
  storageBucket: "efhub-f64cf.firebasestorage.app",
  messagingSenderId: "540581635927",
  appId: "1:540581635927:web:7935e69adc3f73cc544012"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const functions = getFunctions(app);

let currentUser = null;
let currentPlayers = [];
let editingPlayerVotes = []; // votes for the player currently open in the modal (for poster preview)

// ── DOM References ────────────────────────────────────────
const logoutBtn = document.getElementById('logout-btn');
const playersList = document.getElementById('players-list');
const usersList = document.getElementById('users-list');
const btnAddPlayer = document.getElementById('btn-add-player');
const btnResetVotes = document.getElementById('btn-reset-votes');

const playerModal = document.getElementById('player-modal');
const modalTitle = document.getElementById('modal-title');
const playerForm = document.getElementById('player-form');
const btnCancelModal = document.getElementById('btn-cancel-modal');

// ── Auth & Init ───────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Check if admin
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data().role !== 'admin') {
    alert("Unauthorized. You must be an admin to view this page.");
    window.location.href = 'dashboard.html';
    return;
  }
  
  currentUser = user;
  initAdmin();
});

async function initAdmin() {
  await Promise.all([
    loadPlayers(),
    loadUsers()
  ]);
}

// ── Player Management ─────────────────────────────────────
async function loadPlayers() {
  try {
    const snap = await getDocs(query(collection(db, 'players'), orderBy('order')));
    currentPlayers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

  // Attach events
  document.querySelectorAll('.btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', (e) => openEditModal(e.target.dataset.id));
  });
  document.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => deletePlayer(e.target.dataset.id));
  });
}

// ── Special Skills + Posters grids ────────────────────────
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
      const activeToggle = row.querySelector('.poster-active');
      row.classList.toggle('assigned', cb.checked);
      activeToggle.disabled = !cb.checked;
      if (cb.checked) activeToggle.checked = true;
      updatePosterPreview();
    });
  });
  grid.querySelectorAll('.poster-active').forEach(cb => {
    cb.addEventListener('change', updatePosterPreview);
  });
}

function getSelectedPosters() {
  const posters = {};
  document.querySelectorAll('#posters-grid .poster-row').forEach(row => {
    const name = row.dataset.poster;
    const assigned = row.querySelector('.poster-assign').checked;
    if (assigned) posters[name] = row.querySelector('.poster-active').checked;
  });
  return posters;
}

async function loadVotesForPreview(playerId) {
  if (!playerId) { editingPlayerVotes = []; return; }
  try {
    const snap = await getDocs(query(collection(db, 'votes'), where('player_id', '==', playerId)));
    editingPlayerVotes = snap.docs.map(d => d.data());
  } catch (err) {
    console.error('Error loading votes for preview:', err);
    editingPlayerVotes = [];
  }
}

function updatePosterPreview() {
  const previewBox = document.getElementById('poster-preview');
  const previewBody = document.getElementById('poster-preview-body');

  if (editingPlayerVotes.length === 0) {
    previewBox.classList.add('hidden');
    return;
  }

  const medianStats = {};
  STATS_OUTFIELD.forEach(def => {
    const vals = editingPlayerVotes.map(v => v.stats?.[def.code]).filter(v => typeof v === 'number');
    medianStats[def.code] = medianOf(vals);
  });

  const position = document.getElementById('player-position').value;
  const activePosters = Object.entries(getSelectedPosters()).filter(([, on]) => on).map(([name]) => name);

  const baseOvr = calcOVR(medianStats, position);
  const boostedStats = applyPosterBoosts(medianStats, activePosters);
  const boostedOvr = calcOVR(boostedStats, position);

  const baseCard = deriveCardStats(medianStats);
  const boostedCard = deriveCardStats(boostedStats);

  previewBox.classList.remove('hidden');
  previewBody.innerHTML = ['ATT', 'DEF', 'PHY'].map(k => `
    <div class="poster-preview-row">
      <span>${k}</span>
      <span>${baseCard[k]} <span class="arrow">→</span> <span class="${boostedCard[k] > baseCard[k] ? 'up' : ''}">${boostedCard[k]}</span></span>
    </div>
  `).join('') + `
    <div class="poster-preview-row">
      <strong>OVR</strong>
      <strong>${baseOvr} <span class="arrow">→</span> <span class="${boostedOvr > baseOvr ? 'up' : ''}">${boostedOvr}</span></strong>
    </div>
  `;
}

document.getElementById('player-position').addEventListener('change', updatePosterPreview);

// ── Player Modal Logic ────────────────────────────────────
btnAddPlayer.addEventListener('click', async () => {
  playerForm.reset();
  document.getElementById('player-id').value = '';
  document.getElementById('player-order').value = currentPlayers.length + 1;
  renderSpecialSkillsGrid([]);
  renderPostersGrid({});
  editingPlayerVotes = [];
  document.getElementById('poster-preview').classList.add('hidden');
  modalTitle.textContent = 'Add Player';
  playerModal.classList.remove('hidden');
});

btnCancelModal.addEventListener('click', () => {
  playerModal.classList.add('hidden');
});

async function openEditModal(id) {
  const p = currentPlayers.find(x => x.id === id);
  if (!p) return;

  document.getElementById('player-id').value = p.id;
  document.getElementById('player-name').value = p.name;
  document.getElementById('player-position').value = p.position || 'CF';
  document.getElementById('player-order').value = p.order;
  document.getElementById('player-linked-uid').value = p.linked_uid || '';

  renderSpecialSkillsGrid(p.specialSkills || []);
  renderPostersGrid(p.posters || {});

  modalTitle.textContent = 'Edit Player';
  playerModal.classList.remove('hidden');

  await loadVotesForPreview(id);
  updatePosterPreview();
}

playerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnSave = document.getElementById('btn-save-player');
  btnSave.disabled = true;
  btnSave.textContent = 'Saving...';

  const id = document.getElementById('player-id').value;
  const name = document.getElementById('player-name').value.trim();
  const pos = document.getElementById('player-position').value;
  const order = parseInt(document.getElementById('player-order').value) || 99;
  let uid = document.getElementById('player-linked-uid').value.trim();
  if (uid === '') uid = null;
  const specialSkills = getSelectedSpecialSkills();
  const posters = getSelectedPosters();

  try {
    const data = { name, position: pos, order, linked_uid: uid, specialSkills, posters };

    if (id) {
      await updateDoc(doc(db, 'players', id), data);
    } else {
      const newRef = doc(collection(db, 'players'));
      await setDoc(newRef, data);
    }

    playerModal.classList.add('hidden');
    await loadPlayers();
  } catch (err) {
    console.error("Error saving player:", err);
    alert("Failed to save player.");
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Save Player';
  }
});

async function deletePlayer(id) {
  if (!confirm("Are you sure you want to delete this player? This might affect existing votes.")) return;
  try {
    await deleteDoc(doc(db, 'players', id));
    await loadPlayers();
  } catch (err) {
    console.error("Error deleting player:", err);
    alert("Failed to delete player.");
  }
}

// ── Voting Progress + User Management ─────────────────────
async function loadUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (users.length === 0) {
      usersList.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
      return;
    }

    usersList.innerHTML = users.map(u => {
      const isDone = u.has_voted;
      const progress = isDone ? 'Done' : `${u.current_player_index || 0} / ${currentPlayers.length}`;
      let statusText = 'Not Started';
      if (isDone) {
        statusText = 'Completed';
      } else if (u.current_player_index > 0) {
        statusText = 'In Progress';
      }

      return `
        <tr>
          <td>${u.username} ${u.role === 'admin' ? '(Admin)' : ''}</td>
          <td>${statusText}</td>
          <td>${progress}</td>
          <td>
            <button class="btn-icon reset-pw" data-uid="${u.id}" data-username="${u.username}">Reset Password</button>
            ${u.role === 'admin' ? '' : `<button class="btn-icon delete" data-uid="${u.id}" data-username="${u.username}">Delete</button>`}
          </td>
        </tr>
      `;
    }).join('');

    usersList.querySelectorAll('button.reset-pw').forEach(btn => {
      btn.addEventListener('click', () => resetUserPassword(btn.dataset.uid, btn.dataset.username));
    });
    usersList.querySelectorAll('button.delete').forEach(btn => {
      btn.addEventListener('click', () => deleteSquadUser(btn.dataset.uid, btn.dataset.username));
    });

  } catch (err) {
    console.error("Error loading users:", err);
    usersList.innerHTML = `<tr><td colspan="4">Failed to load user progress.</td></tr>`;
  }
}

// ── Add User (Cloud Function — client SDK can't create another
//    account without signing the admin out of their own session) ──
const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const btnAddUser = document.getElementById('btn-add-user');
const btnCancelUserModal = document.getElementById('btn-cancel-user-modal');

btnAddUser.addEventListener('click', () => {
  userForm.reset();
  userModal.classList.remove('hidden');
});

btnCancelUserModal.addEventListener('click', () => {
  userModal.classList.add('hidden');
});

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btnSave = document.getElementById('btn-save-user');
  btnSave.disabled = true;
  btnSave.textContent = 'Creating...';

  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;

  try {
    const createSquadUser = httpsCallable(functions, 'createSquadUser');
    await createSquadUser({ username, password });

    userModal.classList.add('hidden');
    await loadUsers();
  } catch (err) {
    console.error("Error creating user:", err);
    alert(err.message || "Failed to create user.");
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Create User';
  }
});

async function resetUserPassword(uid, username) {
  const newPassword = prompt(`New password for "${username}" (min 6 characters):`);
  if (!newPassword) return;
  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  try {
    const resetSquadUserPassword = httpsCallable(functions, 'resetSquadUserPassword');
    await resetSquadUserPassword({ uid, newPassword });
    alert(`Password for "${username}" has been reset.`);
  } catch (err) {
    console.error("Error resetting password:", err);
    alert(err.message || "Failed to reset password.");
  }
}

async function deleteSquadUser(uid, username) {
  if (!confirm(`Delete user "${username}"? This removes their login and cannot be undone.`)) return;

  try {
    const deleteSquadUserFn = httpsCallable(functions, 'deleteSquadUser');
    await deleteSquadUserFn({ uid });
    await loadUsers();
  } catch (err) {
    console.error("Error deleting user:", err);
    alert(err.message || "Failed to delete user.");
  }
}

// ── Danger Zone: Reset Votes ──────────────────────────────
btnResetVotes.addEventListener('click', async () => {
  const code = Math.floor(1000 + Math.random() * 9000);
  const check = prompt(`Are you absolutely sure you want to RESET ALL VOTES?\nThis will delete the 'votes' collection and reset everyone's progress to 0.\n\nType ${code} to confirm.`);
  
  if (check !== String(code)) {
    if (check !== null) alert("Confirmation code didn't match. Cancelled.");
    return;
  }

  const btn = btnResetVotes;
  btn.disabled = true;
  btn.textContent = 'Resetting...';

  try {
    const batch = writeBatch(db);
    
    // 1. Delete all votes
    const votesSnap = await getDocs(collection(db, 'votes'));
    votesSnap.docs.forEach(d => batch.delete(d.ref));
    
    // 2. Reset all users
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.docs.forEach(d => {
      batch.update(d.ref, {
        has_voted: false,
        current_player_index: 0
      });
    });

    await batch.commit();
    alert("All votes have been reset.");
    await loadUsers(); // Refresh progress table

  } catch (err) {
    console.error("Error resetting votes:", err);
    alert("Failed to reset votes. Check console.");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Reset All Votes';
  }
});

// ── Header Logout ─────────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
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
