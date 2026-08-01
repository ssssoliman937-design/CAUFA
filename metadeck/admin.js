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
  collection, getDocs, query, orderBy, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let currentUser = null;
let currentPlayers = [];

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

// ── Player Modal Logic ────────────────────────────────────
btnAddPlayer.addEventListener('click', () => {
  playerForm.reset();
  document.getElementById('player-id').value = '';
  document.getElementById('player-order').value = currentPlayers.length + 1;
  modalTitle.textContent = 'Add Player';
  playerModal.classList.remove('hidden');
});

btnCancelModal.addEventListener('click', () => {
  playerModal.classList.add('hidden');
});

function openEditModal(id) {
  const p = currentPlayers.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('player-id').value = p.id;
  document.getElementById('player-name').value = p.name;
  document.getElementById('player-position').value = p.position || 'CF';
  document.getElementById('player-order').value = p.order;
  document.getElementById('player-linked-uid').value = p.linked_uid || '';
  
  modalTitle.textContent = 'Edit Player';
  playerModal.classList.remove('hidden');
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

  try {
    const data = { name, position: pos, order, linked_uid: uid };
    
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

// ── Voting Progress ───────────────────────────────────────
async function loadUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const totalPlayers = currentPlayers.length; // Need players loaded first
    
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (users.length === 0) {
      usersList.innerHTML = `<tr><td colspan="3">No users found.</td></tr>`;
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
        </tr>
      `;
    }).join('');

  } catch (err) {
    console.error("Error loading users:", err);
    usersList.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted)">Failed to load user progress.</div>`;
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
