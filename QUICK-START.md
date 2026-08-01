# MetaDeck - Quick Start Guide

**For:** Next session / Team member picking up the project  
**Time:** 5 minutes to get running

---

## 📋 Before You Start

Read these in order (5 min total):
1. **PROGRESS.md** - What was done & how everything works
2. **DEPLOYMENT.md** - Setup & deployment steps
3. **TEST-URLS.md** - Live URLs for testing
4. This file - Quick commands

---

## 🚀 Get Running in 2 Minutes

### Option A: Local Testing (Recommended for Dev)
```bash
cd CAUFA/metadeck
python3 -m http.server 8080

# In browser: http://localhost:8080?test=true
```

### Option B: Real Firebase (Production)
```bash
cd CAUFA
firebase login
firebase deploy --only hosting

# Your app: https://clowns-15441.web.app
```

---

## 🎯 Common Tasks

### I want to test a feature
```bash
# Start server
cd CAUFA/metadeck && python3 -m http.server 8080

# Open in browser
http://localhost:8080?test=true

# Edit a file (e.g., dashboard.js)
# Save and refresh browser - changes load instantly (no build step)
```

### I want to add a new player
**Option 1: Admin Panel**
- Go: http://localhost:8080/admin.html?test=true
- Click "Add Player"
- Fill form & save

**Option 2: Firebase Console**
- Go: https://console.firebase.google.com
- Select project: clowns-15441
- Realtime Database → players
- Add new entry

### I want to change the OVR formula
```bash
# Edit: metadeck/ovrCalculator.js line 40-150
# Key function: calcOVR(stats, position)

# After editing, refresh browser - changes apply instantly
```

### I want to add a new stat category
```bash
# Edit: metadeck/ovrCalculator.js
# Find: STATS_OUTFIELD array (line 50)
# Add new object:
{
  code: 'NEW',
  name: 'New Stat',
  desc: 'Description',
  category: 'athleticism',
  cssClass: 'cat-athleticism'
}
# Refresh - appears automatically in dashboard
```

### I want to add a new skill
```bash
# Edit: metadeck/skillsData.js
# Find: SKILL_CATEGORIES object (line 10)
# Add to category:
"Skill Name": { tier: 1, bonus: {FIN: 2} }
# Refresh - appears in skill picker
```

### I want to modify admin rules
```bash
# Edit: metadeck/admin.js line 52
# Current: userSnap.val().role !== 'admin'
# Change to your custom check
```

### I want to deploy to Firebase
```bash
cd CAUFA
firebase login                    # One-time only
firebase deploy --only hosting    # Deploy

# Check status
firebase hosting:channel:list
```

### I want to see Firebase data
```bash
# Console: https://console.firebase.google.com
# Project: clowns-15441
# Realtime Database tab
# View: /players, /votes, /users

# Or REST API:
curl "https://clowns-15441-default-rtdb.europe-west1.firebasedatabase.app/players.json"
```

---

## 🔍 File Quick Reference

### Core Logic Files
- **ovrCalculator.js** - Rating formula (OVR = position_weight × median_stats)
- **skillsData.js** - Skill definitions & boost calculations
- **playerCard.js** - Card HTML generation

### Page Logic Files
- **dashboard.js** - Voting flow (largest file, ~810 lines)
- **admin.js** - Player/user management
- **preview.js** - Card design tool
- **compare.js** - Player comparison

### Entry Points
- **index.html** → app.js (login)
- **dashboard.html** → dashboard.js (voting)
- **admin.html** → admin.js (management)

---

## 🧪 Testing Flow

### Vote & Submit
1. http://localhost:8080?test=true
2. Click "Start Rating"
3. Rate Messi (slide or type values)
4. Select 2-3 skills
5. Click "Finish & Review All"
6. Submit votes

### Check Data in Firebase
```javascript
// In browser console:
fetch('https://clowns-15441-default-rtdb.europe-west1.firebasedatabase.app/votes.json')
  .then(r => r.json())
  .then(console.log)
```

### Admin Panel
1. http://localhost:8080/admin.html?test=true
2. Edit a player
3. Change "Special Skills"
4. Save & check card preview

---

## 🛠️ Debug Tips

### My changes aren't showing
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for JS errors (F12)
- Check network tab (is JS file fetching?)

### Firebase not responding
- Check RTD rules: https://console.firebase.google.com/project/clowns-15441/database
- Rules should have `.read: true` and `.write: true` for testing
- Check if API key is correct (in all 5 JS files)

### OVR calculation wrong
- Check ovrCalculator.js line 120 (POSITION_WEIGHTS)
- Verify skill boosts applied (skillsData.js line 150+)
- Check median calculation (line 90-100)

### Test mode not working
- Make sure URL has `?test=true`
- Check browser localStorage: `localStorage.getItem('testUser')`
- Try opening DevTools (F12) - logs will say "🧪 TEST MODE"

---

## 📊 Project Stats

- **Pages:** 5 (login, dashboard, admin, preview, compare)
- **JS Files:** 9 (~2,800 LOC)
- **CSS Files:** 5 (~800 lines)
- **Skills:** 65 total (22 special + 43 regular)
- **Stats:** 65+ individual stat ratings
- **Database:** Firebase Realtime (clowns-15441)
- **Deployment:** Firebase Hosting

---

## ⚡ Performance Notes

| Action | Time |
|--------|------|
| Page load | ~2s (cached) |
| Vote submit | ~500ms |
| Admin save | ~300ms |
| Search/filter | <100ms |
| Card render | <50ms |

---

## 🔐 Before Going Live

- [ ] Remove `?test=true` parameter support
- [ ] Restrict Firebase RTD rules
- [ ] Enable email verification
- [ ] Set up analytics
- [ ] Add error logging (Sentry/LogRocket)
- [ ] Test on mobile
- [ ] Set up SSL cert
- [ ] Configure custom domain

---

## 💾 Git Workflow

```bash
# Check status
git status

# See recent changes
git log --oneline -5

# Create new branch for feature
git checkout -b feature/new-feature

# After changes
git add metadeck/file.js
git commit -m "description"
git push origin feature/new-feature

# Merge to main branch
# (Create PR on GitHub)
```

---

## 🆘 Need Help?

### Check these files first:
1. PROGRESS.md - Full project overview
2. DEPLOYMENT.md - Setup & deployment
3. Each .js file has comments at top explaining its role

### Common solutions:
- Server not running? → `python3 -m http.server 8080`
- Firebase error? → Check .firebaserc projectId matches
- Page blank? → Check browser console (F12)
- Auth bypass not working? → Use `?test=true` in URL

---

## 🎯 Next Steps (Suggested)

1. **Run locally** (2 min) - Get server running
2. **Test voting** (5 min) - Submit a vote, check data
3. **Explore admin** (5 min) - Add a player
4. **Check code** (10 min) - Read dashboard.js comments
5. **Deploy** (5 min) - Firebase hosting deploy
6. **Go live** (1 min) - Share your app URL

---

**Total time to full production: ~30 minutes**

Last Updated: 2026-08-01
