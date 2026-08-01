// =========================================================
//  MetaDeck Squad Login — Firebase Auth
//  app.js  (login page only — dashboard logic in dashboard.js)
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, child, get, set, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "clowns-15441.firebaseapp.com",
  projectId: "clowns-15441",
  storageBucket: "clowns-15441.appspot.com",
  messagingSenderId: "144013585965",
  appId: "1:144013585965:web:e3741f008a9386e967d2a4",
  databaseURL: "https://clowns-15441-default-rtdb.europe-west1.firebasedatabase.app"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getDatabase(app);

// ── DOM ───────────────────────────────────────────────────
const loginForm     = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const togglePwBtn   = document.getElementById("toggle-pw");
const submitBtn     = document.getElementById("submit-btn");
const alertBox      = document.getElementById("alert-box");
const alertMsg      = document.getElementById("alert-msg");

// ── Password toggle ───────────────────────────────────────
const eyeOpen   = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const eyeClosed = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

togglePwBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePwBtn.innerHTML = isHidden ? eyeOpen : eyeClosed;
  togglePwBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

// ── Already signed in → skip to dashboard ─────────────────
onAuthStateChanged(auth, (user) => {
  if (user) window.location.href = "dashboard.html";
});

// ── Login form ────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlert();

  const raw      = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!raw)      return showError("Please enter your username.");
  if (!password) return showError("Please enter your password.");

  const email = `${raw}@squad.com`;
  setLoading(true);

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);

    // Auto-create users/{uid} doc on first login in Realtime DB
    const userRef = ref(db, `users/${cred.user.uid}`);
    const userSnap = await get(userRef);
    if (!userSnap.exists()) {
      await set(userRef, {
        username:             raw,
        has_voted:            false,
        current_player_index: 0,
        created_at:           new Date().toISOString(),
      });
    }

    window.location.href = "dashboard.html";
  } catch (err) {
    setLoading(false);
    showError(friendlyError(err.code));
  }
});

// ── Helpers ───────────────────────────────────────────────
function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.classList.toggle("loading", on);
}

function showError(msg) {
  alertBox.className = "alert alert-error show";
  alertMsg.textContent = msg;
}

function clearAlert() {
  alertBox.className = "alert";
  alertMsg.textContent = "";
}

function friendlyError(code) {
  const map = {
    "auth/invalid-email":          "That doesn't look like a valid email address.",
    "auth/user-disabled":          "This account has been disabled. Contact your admin.",
    "auth/user-not-found":         "No account found for that username.",
    "auth/wrong-password":         "Incorrect password. Please try again.",
    "auth/invalid-credential":     "Invalid username or password. Please try again.",
    "auth/too-many-requests":      "Too many failed attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
  };
  return map[code] ?? `Authentication error (${code}). Please try again.`;
}
