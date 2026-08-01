// =========================================================
//  MetaDeck — Cloud Functions
//  Admin-only user management (create / reset password / delete)
//
//  The client-side Firebase SDK cannot do any of this for another
//  account: createUserWithEmailAndPassword signs the caller in as the
//  new user (kicking the admin out of their own session), and there is
//  no client API at all to change or delete a DIFFERENT user's account.
//  These three callables run server-side with firebase-admin, which can.
// =========================================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const EMAIL_DOMAIN = 'squad.com';

async function assertCallerIsAdmin(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in.');
  }
  const callerDoc = await admin.firestore().doc(`users/${context.auth.uid}`).get();
  if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admins only.');
  }
}

function validateUsername(username) {
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) {
    throw new functions.https.HttpsError('invalid-argument', 'Username must be 3-32 characters (letters, numbers, _ . -).');
  }
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    throw new functions.https.HttpsError('invalid-argument', 'Password must be at least 6 characters.');
  }
}

// ── Create a new squad user ───────────────────────────────
exports.createSquadUser = functions.https.onCall(async (data, context) => {
  await assertCallerIsAdmin(context);

  const username = (data.username || '').trim();
  validateUsername(username);
  validatePassword(data.password);

  const email = `${username}@${EMAIL_DOMAIN}`;

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password: data.password });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'That username is already taken.');
    }
    throw new functions.https.HttpsError('internal', err.message);
  }

  await admin.firestore().doc(`users/${userRecord.uid}`).set({
    username,
    has_voted: false,
    current_player_index: 0,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: userRecord.uid };
});

// ── Reset an existing user's password (admin sets a new known one) ──
exports.resetSquadUserPassword = functions.https.onCall(async (data, context) => {
  await assertCallerIsAdmin(context);

  const uid = (data.uid || '').trim();
  if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');
  validatePassword(data.newPassword);

  try {
    await admin.auth().updateUser(uid, { password: data.newPassword });
  } catch (err) {
    throw new functions.https.HttpsError('internal', err.message);
  }

  return { ok: true };
});

// ── Delete a user entirely (Auth account + Firestore doc) ───
exports.deleteSquadUser = functions.https.onCall(async (data, context) => {
  await assertCallerIsAdmin(context);

  const uid = (data.uid || '').trim();
  if (!uid) throw new functions.https.HttpsError('invalid-argument', 'Missing uid.');
  if (uid === context.auth.uid) {
    throw new functions.https.HttpsError('failed-precondition', "You can't delete your own admin account.");
  }

  try {
    await admin.auth().deleteUser(uid);
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw new functions.https.HttpsError('internal', err.message);
    }
  }
  await admin.firestore().doc(`users/${uid}`).delete();

  return { ok: true };
});
