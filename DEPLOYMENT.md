# MetaDeck Deployment Checklist

## ✅ Code Status
- [x] All 5 JS files converted: Firestore → Realtime Database
- [x] Real Firebase config (`clowns-15441` RTD project)
- [x] Syntax validation passed (all 8 files)
- [x] Commits pushed to `claude/metadeck-setup-n05mmf`

## Firebase Setup
**Project:** `clowns-15441`
**Database:** Realtime Database (Europe-west1)
**Auth:** Email/password (users@squad.com format)

### Required Actions Before Launch

1. **Create Firebase Users** (admin + test users)
   - Go: Firebase Console → Authentication
   - Add users with emails: `admin@squad.com`, `user1@squad.com`, etc.
   - Set role to `admin` for admin users via Realtime DB

2. **Enable RTD Rules** (temporary open for testing)
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
   ⚠️ Restrict before production!

3. **Seed Initial Data** (Optional)
   - Run: `node seed-rtd.js` (from scratchpad)
   - Loads 4 sample players (Messi, Mbappé, De Bruyne, van Dijk)

4. **Migrate Old Data** (If keeping Firestore project data)
   - Run: `node migrate-firestore-to-rtd.js` (from scratchpad)
   - Transfers players/votes/users from `efhub-f64cf` → `clowns-15441`

5. **Deploy to Firebase Hosting**
   ```bash
   cd /home/user/CAUFA/metadeck
   firebase deploy --only hosting
   ```

## Testing Checklist
- [ ] Login with admin account
- [ ] Vote on players (dashboard flow)
- [ ] Check results page
- [ ] Admin panel: Add/edit/delete players
- [ ] Admin panel: View users
- [ ] Preview page (admin only)
- [ ] Compare players feature
- [ ] Player cards render correctly

## Files Modified
- app.js (login + auth)
- dashboard.js (main rating flow)
- admin.js (player/user management)
- preview.js (admin preview)
- compare.js (player comparison)

## Key Dependencies
- Firebase 10.12.2 (Auth + Realtime DB)
- No Node.js deps needed for frontend

## Rollback
Branch: `claude/metadeck-setup-n05mmf`
All changes committed and tested syntactically ✓

---
**Status:** Ready for Firebase deployment
