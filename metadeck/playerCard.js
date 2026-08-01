import { STATS_OUTFIELD, getCardTier, getBestPosition } from './ovrCalculator.js';

function getStatBadgeStyle(val) {
  if (val >= 95) return 'background: rgba(168,85,247,0.15); color: #a855f7; border: 1px solid rgba(168,85,247,0.4); box-shadow: 0 0 12px rgba(168,85,247,0.25);'; // Excellent (Purple)
  if (val >= 90) return 'background: rgba(14,165,233,0.15); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.4); box-shadow: 0 0 12px rgba(14,165,233,0.25);'; // Great (Sky Blue)
  if (val >= 80) return 'background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.4); box-shadow: 0 0 12px rgba(16,185,129,0.25);'; // High (Emerald Green)
  if (val >= 60) return 'background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.4); box-shadow: 0 0 12px rgba(234,179,8,0.25);'; // Medium
  return 'background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.4); box-shadow: 0 0 12px rgba(239,68,68,0.25);'; // Red (40-59)
}

export function generatePlayerCardHTML(player) {
  let cardType = 'standard';
  if (player.ovr >= 95) cardType = 'big-time';
  else if (player.ovr >= 90) cardType = 'epic';
  else if (player.ovr >= 80) cardType = 'highlight';

  const name = (player.name || 'PLAYER NAME').toUpperCase();
  const pos = (player.position || '—').toUpperCase();
  const ovr = player.ovr || 50;

  const stats = player.cardStats || { ATT: 50, DEF: 50, PHY: 50 };

  const themes = {
    'big-time': {
      bg: 'linear-gradient(135deg, #090a0f 0%, #1e1333 50%, #110d24 100%)',
      border: 'linear-gradient(135deg, #ffd700, #ffae00, #fff099, #d4af37)',
      textPrimary: '#ffffff',
      textSecondary: '#ffdf6d',
      glow: 'rgba(255, 215, 0, 0.45)',
      accent: '#ffd700',
      badgeBg: 'rgba(255, 215, 0, 0.15)',
      badgeBorder: 'rgba(255, 215, 0, 0.4)'
    },
    'epic': {
      bg: 'linear-gradient(135deg, #16002c 0%, #30004c 50%, #0d001a 100%)',
      border: 'linear-gradient(135deg, #f857a6, #ff5858, #b721ff)',
      textPrimary: '#ffffff',
      textSecondary: '#f48fb1',
      glow: 'rgba(248, 87, 166, 0.45)',
      accent: '#f857a6',
      badgeBg: 'rgba(248, 87, 166, 0.15)',
      badgeBorder: 'rgba(248, 87, 166, 0.4)'
    },
    'highlight': {
      bg: 'linear-gradient(135deg, #1f1405 0%, #3d2608 50%, #1a1003 100%)',
      border: 'linear-gradient(135deg, #ffc837, #ff8008, #ffd700)',
      textPrimary: '#ffffff',
      textSecondary: '#ffe082',
      glow: 'rgba(255, 179, 0, 0.4)',
      accent: '#ffb300',
      badgeBg: 'rgba(255, 179, 0, 0.15)',
      badgeBorder: 'rgba(255, 179, 0, 0.4)'
    },
    'standard': {
      bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)',
      border: 'linear-gradient(135deg, #38bdf8, #818cf8, #0ea5e9)',
      textPrimary: '#ffffff',
      textSecondary: '#a5f3fc',
      glow: 'rgba(56, 189, 248, 0.35)',
      accent: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      badgeBorder: 'rgba(56, 189, 248, 0.4)'
    }
  };

  const theme = themes[cardType];
  const tier = getCardTier(ovr);
  const rawStats = player.rawStats || {};
  const bestPosInfo = Object.keys(rawStats).length > 0 ? getBestPosition(rawStats, pos) : null;

  let posIconHTML = '';
  if (bestPosInfo) {
    if (pos === bestPosInfo.position) {
      posIconHTML = `<i class="fa-solid fa-check ef-best-pos-tick" title="Playing in best position"></i>`;
    } else {
      const msg = `Best rating at ${bestPosInfo.position} (${bestPosInfo.ovr})`;
      posIconHTML = `<i class="fa-solid fa-circle-info ef-best-pos-info" title="${msg}" onclick="alert('${msg}')"></i>`;
    }
  }

  const cardHTML = `
    <div class="ef-card-modern" style="--bg: ${theme.bg}; --border-bg: ${theme.border}; --glow-color: ${theme.glow}; --accent-color: ${theme.accent}; --badge-bg: ${theme.badgeBg}; --badge-border: ${theme.badgeBorder}; --text-primary: ${theme.textPrimary}; --text-secondary: ${theme.textSecondary};">
      <div class="ef-top-info">
        <div class="ef-ovr-val">${ovr}</div>
        <div class="ef-pos-badge">
          ${pos}
          ${posIconHTML}
        </div>
      </div>
      <div class="ef-portrait"></div>
      <div class="ef-bottom-info">
        <div class="ef-player-name">${name}</div>
        <div class="ef-stats">
          <div class="ef-stat-box"><span class="ef-stat-val">${stats.ATT}</span><span class="ef-stat-lbl">ATT</span></div>
          <div class="ef-stat-box"><span class="ef-stat-val">${stats.DEF}</span><span class="ef-stat-lbl">DEF</span></div>
          <div class="ef-stat-box"><span class="ef-stat-val">${stats.PHY}</span><span class="ef-stat-lbl">PHY</span></div>
        </div>
      </div>
    </div>
  `;

  // Build grouped detailed stats HTML
  const grouped = {
    'Attacking': { icon: '<i class="fa-solid fa-futbol"></i>', stats: [] },
    'Athleticism': { icon: '<i class="fa-solid fa-bolt"></i>', stats: [] },
    'Defending': { icon: '<i class="fa-solid fa-shield-halved"></i>', stats: [] }
  };
  STATS_OUTFIELD.forEach(s => {
    if (grouped[s.category]) {
      grouped[s.category].stats.push({ name: s.name, val: rawStats[s.code] || 50, code: s.code });
    }
  });

  let detailedHTML = '';
  for (const [cat, group] of Object.entries(grouped)) {
    if (group.stats.length === 0) continue;
    detailedHTML += `
      <div class="detail-category-block">
        <div class="detail-category-header-modern">
          <span class="detail-cat-icon">${group.icon}</span>
          <span class="detail-cat-title">${cat}</span>
        </div>
        <div class="detail-category-stats-list">
    `;
    group.stats.forEach(s => {
      const badgeStyle = getStatBadgeStyle(s.val);
      
      let votersHtml = '';
      if (player.voterDetails && player.voterDetails.length > 0) {
        votersHtml = player.voterDetails.map(v => {
           const voterVal = v.stats[s.code] ?? '—';
           return `<div class="voter-row"><span>${v.name}</span><span>${voterVal}</span></div>`;
        }).join('');
      }

      detailedHTML += `
        <div class="detail-stat-row-modern" onclick="const isExp = this.classList.contains('expanded'); this.closest('.detailed-stats').querySelectorAll('.detail-stat-row-modern').forEach(el => el.classList.remove('expanded')); if (!isExp) this.classList.add('expanded');">
          <div class="stat-main-row">
            <span class="detail-stat-name-modern">${s.name}</span>
            <span class="detail-stat-badge" style="${badgeStyle}">${s.val}</span>
          </div>
          ${votersHtml ? `<div class="stat-voters-list-wrapper"><div class="stat-voters-list-inner"><div class="stat-voters-list">${votersHtml}</div></div></div>` : ''}
        </div>`;
    });
    detailedHTML += `
        </div>
      </div>
    `;
  }

  return `
    <div class="player-result-wrapper">
      <div class="player-card ${tier}">
        ${cardHTML}
      </div>
      <div class="detailed-stats">
        ${detailedHTML}
      </div>
    </div>
  `;
}
