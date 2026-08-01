// =========================================================
//  MetaDeck — OVR Calculator & Shared Logic
//  ovrCalculator.js
// =========================================================

export function roundAvg(...vals) {
  return Math.round(vals.reduce((s, v) => s + (v ?? 50), 0) / vals.length);
}

export function deriveCardStats(stats) {
  const getWeighted = (weightsObj) => {
    const total = Object.entries(weightsObj).reduce((sum, [stat, weight]) => sum + (stats[stat] ?? 50) * weight, 0);
    // Apply the exact same eFootball scaling multiplier to face stats so they align with OVR
    const scaled = total * 1.06;
    return Math.min(109, Math.max(1, Math.round(scaled)));
  };

  return {
    ATT: getWeighted({
      FIN: 0.20, OFA: 0.20, BCO: 0.15, DRI: 0.15, TIP: 0.10, LOP: 0.10, LFP: 0.05, PLK: 0.03, CRL: 0.02
    }),
    DEF: getWeighted({
      DAW: 0.35, TAC: 0.35, DEN: 0.20, AGG: 0.10
    }),
    PHY: getWeighted({
      SPD: 0.15, ACC: 0.15, PHY: 0.15, STM: 0.15, BAL: 0.15, JMP: 0.10, KPW: 0.10, HEA: 0.05
    })
  };
}

export const POSITION_WEIGHTS = {
  // Attackers
  'CF': { FIN: 0.22, OFA: 0.22, ACC: 0.12, SPD: 0.10, KPW: 0.07, BCO: 0.06, DRI: 0.05, TIP: 0.04, HEA: 0.04, BAL: 0.03, JMP: 0.03, CRL: 0.02 },
  'SS': { OFA: 0.16, FIN: 0.14, DRI: 0.12, ACC: 0.10, BCO: 0.10, TIP: 0.08, SPD: 0.08, LOP: 0.07, BAL: 0.06, CRL: 0.04, LFP: 0.03, KPW: 0.02 },
  'LWF': { DRI: 0.14, SPD: 0.15, ACC: 0.15, BCO: 0.10, TIP: 0.09, OFA: 0.09, BAL: 0.08, LFP: 0.06, LOP: 0.05, FIN: 0.05, CRL: 0.04 },
  'RWF': { DRI: 0.14, SPD: 0.15, ACC: 0.15, BCO: 0.10, TIP: 0.09, OFA: 0.09, BAL: 0.08, LFP: 0.06, LOP: 0.05, FIN: 0.05, CRL: 0.04 },
  'AMF': { LOP: 0.20, LFP: 0.15, OFA: 0.13, BCO: 0.12, TIP: 0.10, FIN: 0.08, DRI: 0.06, ACC: 0.05, BAL: 0.04, SPD: 0.04, CRL: 0.03 },
  // Midfielders
  'LMF': { SPD: 0.15, ACC: 0.15, STM: 0.15, LFP: 0.15, LOP: 0.10, DRI: 0.10, BCO: 0.10, TIP: 0.05, OFA: 0.05 },
  'RMF': { SPD: 0.15, ACC: 0.15, STM: 0.15, LFP: 0.15, LOP: 0.10, DRI: 0.10, BCO: 0.10, TIP: 0.05, OFA: 0.05 },
  'CMF': { LOP: 0.18, BCO: 0.16, STM: 0.15, LFP: 0.12, TIP: 0.10, DRI: 0.08, DAW: 0.08, TAC: 0.08, PHY: 0.05 },
  'DMF': { DAW: 0.18, TAC: 0.18, DEN: 0.15, STM: 0.12, AGG: 0.10, PHY: 0.10, LOP: 0.10, LFP: 0.07 },
  // Defenders
  'LB': { SPD: 0.15, ACC: 0.15, STM: 0.15, DAW: 0.12, TAC: 0.12, LFP: 0.10, DEN: 0.08, AGG: 0.08, LOP: 0.05 },
  'CB': { DAW: 0.20, TAC: 0.20, DEN: 0.15, PHY: 0.15, AGG: 0.10, HEA: 0.10, JMP: 0.07, SPD: 0.03 },
  'RB': { SPD: 0.15, ACC: 0.15, STM: 0.15, DAW: 0.12, TAC: 0.12, LFP: 0.10, DEN: 0.08, AGG: 0.08, LOP: 0.05 },
};

// Fallback if position doesn't match
export const DEFAULT_WEIGHTS = {
  OFA: 0.05, BCO: 0.05, DRI: 0.05, TIP: 0.05, LOP: 0.05, LFP: 0.05, FIN: 0.05,
  HEA: 0.05, PLK: 0.05, CRL: 0.05, DAW: 0.05, DEN: 0.05, TAC: 0.05, AGG: 0.05,
  SPD: 0.05, ACC: 0.05, KPW: 0.05, JMP: 0.05, PHY: 0.05, BAL: 0.05, STM: 0.05
};

export function calcOVR(rawStats, position) {
  const w = POSITION_WEIGHTS[position] || DEFAULT_WEIGHTS;
  const total = Object.entries(w).reduce((sum, [stat, weight]) => sum + (rawStats[stat] ?? 50) * weight, 0);

  // eFootball applies a non-linear scaling or base stat boost to reach final OVRs.
  // We've further reduced the multiplier to 1.06 to make high ratings extremely difficult to reach.
  const scaledOvr = total * 1.06;

  // We'll return the weighted total rounded to nearest whole number.
  // Cap at 109 to allow for highly boosted ratings
  return Math.min(109, Math.max(1, Math.round(scaledOvr)));
}

export function getBestPosition(rawStats, currentPos = '') {
  let bestOvr = 0;
  let bestPos = 'CF';
  for (const pos of Object.keys(POSITION_WEIGHTS)) {
    const ovr = calcOVR(rawStats, pos);
    if (ovr > bestOvr) {
      bestOvr = ovr;
      bestPos = pos;
    } else if (ovr === bestOvr && pos === currentPos) {
      bestPos = pos;
    }
  }
  return { position: bestPos, ovr: bestOvr };
}

export function getCardTier(ovr) {
  if (ovr >= 95) return 'tier-goat';
  if (ovr >= 90) return 'tier-elite';
  if (ovr >= 80) return 'tier-gold';
  return 'tier-silver';
}

export function getTierBadgeInfo(tier) {
  switch (tier) {
    case 'tier-goat': return { icon: '<i class="fa-solid fa-crown"></i>', label: 'GOAT' };
    case 'tier-elite': return { icon: '<i class="fa-solid fa-star"></i>', label: 'ELITE' };
    case 'tier-gold': return { icon: '<i class="fa-solid fa-shield-halved"></i>', label: 'GOLD' };
    default: return { icon: '<i class="fa-solid fa-award"></i>', label: 'SILVER' };
  }
}

export const STATS_OUTFIELD = [
  {
    code: 'OFA', name: 'Offensive Awareness', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Reading of the game in attack — positioning, runs, and decision-making in offensive situations'
  },
  {
    code: 'BCO', name: 'Ball Control', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Ability to receive, control, and retain the ball under pressure'
  },
  {
    code: 'DRI', name: 'Dribbling', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Effectiveness when taking on opponents in 1v1 dribbling situations'
  },
  {
    code: 'TIP', name: 'Tight Possession', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Ability to keep the ball in tight spaces and resist defensive pressure'
  },
  {
    code: 'LOP', name: 'Low Pass', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Accuracy and weight on ground-level short and medium passes'
  },
  {
    code: 'LFP', name: 'Lofted Pass', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Quality and accuracy when playing lofted through balls and long switches'
  },
  {
    code: 'FIN', name: 'Finishing', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Ability to score in front of goal including 1v1s and shooting situations'
  },
  {
    code: 'HEA', name: 'Heading', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Effectiveness at winning and directing headed balls in attack and defence'
  },
  {
    code: 'PLK', name: 'Place Kicking', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Technique and accuracy on set pieces including free kicks and corners'
  },
  {
    code: 'CRL', name: 'Curl', category: 'Attacking', icon: '<i class="fa-solid fa-futbol"></i>', cssClass: 'cat-attacking',
    desc: 'Ability to put curl and swerve on shots and passes'
  },
  {
    code: 'DAW', name: 'Defensive Awareness', category: 'Defending', icon: '<i class="fa-solid fa-shield-halved"></i>', cssClass: 'cat-defending',
    desc: 'Ability to read the game defensively and position to intercept or block'
  },
  {
    code: 'DEN', name: 'Def. Engagement', category: 'Defending', icon: '<i class="fa-solid fa-shield-halved"></i>', cssClass: 'cat-defending',
    desc: 'Intensity and timing when engaging opponents defensively'
  },
  {
    code: 'TAC', name: 'Tackling', category: 'Defending', icon: '<i class="fa-solid fa-shield-halved"></i>', cssClass: 'cat-defending',
    desc: 'Effectiveness at winning the ball cleanly with standing and sliding tackles'
  },
  {
    code: 'AGG', name: 'Aggression', category: 'Defending', icon: '<i class="fa-solid fa-shield-halved"></i>', cssClass: 'cat-defending',
    desc: 'Intensity and commitment level in challenges and defensive duels'
  },
  {
    code: 'SPD', name: 'Speed', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Maximum running speed at full sprint'
  },
  {
    code: 'ACC', name: 'Acceleration', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'How quickly the player reaches top speed from a standing start'
  },
  {
    code: 'KPW', name: 'Kicking Power', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Raw power and pace behind every shot and long pass'
  },
  {
    code: 'JMP', name: 'Jump', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Ability to jump high to win aerial duels'
  },
  {
    code: 'PHY', name: 'Physical', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Strength and physicality to hold off opponents and win duels'
  },
  {
    code: 'BAL', name: 'Balance', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Ability to stay on feet and hold balance under pressure'
  },
  {
    code: 'STM', name: 'Stamina', category: 'Athleticism', icon: '<i class="fa-solid fa-bolt"></i>', cssClass: 'cat-athleticism',
    desc: 'Rate of fatigue — sustains high performance throughout the match'
  },
];
