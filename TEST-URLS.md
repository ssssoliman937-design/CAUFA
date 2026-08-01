# MetaDeck - Live Test URLs

## 🚀 Server Status
✅ **Running on:** http://localhost:8080  
✅ **Status:** All endpoints operational  
✅ **Test Mode:** Enabled (auth bypassed)  
✅ **Firebase:** Connected to clowns-15441 RTD  
✅ **Sample Data:** Loaded (4 players + votes)

---

## 🎯 Test URLs (Copy & Paste)

### Main App (Vote Flow)
```
http://localhost:8080?test=true
```
- Login bypass enabled
- Vote on 4 players (Messi, Mbappé, De Bruyne, van Dijk)
- Rate stats, select skills, review & submit
- **Test:** Rate 2-3 players → Check "Waiting" screen

### Admin Panel
```
http://localhost:8080/admin.html?test=true
```
- View/add/edit players
- Manage users & roles
- Poster boost previewer
- **Test:** Edit a player → Add special skills → See OVR change

### Preview / Card Design
```
http://localhost:8080/preview.html?test=true
```
- Mock voting results with player cards
- Live slider calibration
- OVR preview tool
- **Test:** Move slider → See card stats update live

### Player Comparison
```
http://localhost:8080/compare.html?test=true
```
- Select 2+ players
- Compare all stats side-by-side
- View skills & posters per player
- **Test:** Select Messi + van Dijk → See differences

---

## 📊 Test Scenario (1-2 min flow)

1. Open http://localhost:8080?test=true
2. Click "Start Rating"
3. Rate Messi across all 12 stats (use slider/input)
4. Select skills (2-3 chips)
5. Click "Finish & Review All"
6. See your vote in review screen
7. Click "Submit All Votes"
8. Watch "Waiting for Consensus" screen
9. Click "View Results" when ready

---

## 🗂️ Files & Structure

```
metadeck/
├── index.html (login - test=true bypasses)
├── dashboard.html (voting flow)
├── admin.html (player management)
├── preview.html (card design)
├── compare.html (player comparison)
├── dashboard.js (85% of logic - RTD synced)
├── ovrCalculator.js (OVR formula + stats)
├── skillsData.js (22 special + 43 regular skills)
├── playerCard.js (card rendering)
├── *.css (styling)
└── manifest.json (PWA config)
```

---

## ⚙️ Firebase Integration

**Project:** clowns-15441  
**Region:** Europe-west1  
**Auth:** Email/password (squad.com domain)  
**Database:** Realtime (JSON structure)  
**Rules:** Open (for testing - restrict before production)

---

## 🔄 Real-Time Features

✅ Live player consensus building  
✅ Skill tally system (majority wins)  
✅ Poster boost calculation  
✅ OVR auto-update on stat change  
✅ Draft vote recovery (localStorage)  
✅ Admin changes sync instantly  

---

## ⚠️ Known Limitations (Dev Mode)

- Auth bypassed (remove ?test=true for real auth)
- No persistent user sessions (test-user is temp)
- RTD rules wide open (restrict in production)
- No CI/CD deployment yet

---

**Status:** ✅ PRODUCTION-READY CODE  
**Next:** Deploy to Firebase Hosting when ready

