// =========================================================
//  MetaDeck — Skills & Posters Data
//  skillsData.js
// =========================================================
// Special skills: assigned directly by the admin, no voting.
// Regular skills: selected by voters during rating; granted to the
// player automatically once 3+ voters agree (consensus tiers below).
// Posters: fixed +2 stat packs the admin can attach and toggle per player.

// ── Special skills (admin-assigned) ───────────────────────
export const SPECIAL_SKILLS = [
  'Blitz Curler', 'Bullet Header', 'Phenomenal Finishing', 'Phenomenal Pass',
  'Visionary Pass', 'Game-Changing Pass', 'Fortress', 'Momentum Dribbling',
  'Acceleration Burst', 'Speeding Bullet', 'Edged Crossing', 'Magnetic Feet',
  'Long-Reach Tackle', 'Long Ball Expert', 'Attack Trigger', 'Aerial Fort',
  'Incisive Run', 'Low Screamer', 'Long Ranger', 'Willpower',
];

// ── Regular skills (voted, grouped by category) ───────────
export const SKILL_CATEGORIES = {
  'Dribbling': [
    'Scissors Feint', 'Double Touch', 'Flip Flap', 'Marseille Turn', 'Sombrero',
    'Cut Behind & Turn', 'Scotch Move', 'Cross Over Turn', 'Step On Skill Control',
    'Trickster', 'Sole Control', 'Heel Trick',
  ],
  'Shooting': [
    'Long Range Shooting', 'Long Range Drive', 'Rising Shots', 'Dipping Shots',
    'Knuckle Shot', 'Chip Shot Control', 'Acrobatic Finishing', 'First Time Shot',
    'Outside Curler', 'Rabona', 'Penalty Specialist',
  ],
  'Passing': [
    'One Touch Pass', 'Through Passing', 'Weighted Pass', 'Low Lofted Pass',
    'Pinpoint Crossing', 'Early Cross', 'No Look Pass', 'Long Throw',
  ],
  'Defending': [
    'Man Marking', 'Track Back', 'Interception', 'Blocker', 'Sliding Tackle',
    'Acrobatic Clear', 'Aerial Superiority',
  ],
  'Physical & Mental': [
    'Captaincy', 'Super Sub', 'Fighting Spirit', 'Gamesmanship', 'Heading',
  ],
};

export const REGULAR_SKILLS = Object.values(SKILL_CATEGORIES).flat();

// ── Regular skill stat effects ────────────────────────────
// Only skills with an explicit percentage from the source table get a
// numeric boost. Everything else in REGULAR_SKILLS is a display-only badge
// (no effect on raw stats) until real numbers are supplied for it.
// "Long-Range Curler" from the table is assumed to be "Outside Curler".
export const SKILL_BOOSTS = {
  'One Touch Pass':     { LOP: 0.12 },
  'Through Passing':    { LOP: 0.11 },
  'Pinpoint Crossing':  { LFP: 0.15, CRL: 0.15 },
  'Weighted Pass':      { LFP: 0.10 },

  'First Time Shot':    { FIN: 0.12 },
  'Outside Curler':     { FIN: 0.10, CRL: 0.10 },
  'Long Range Shooting':{ KPW: 0.07 },
  'Rising Shots':       { CRL: 0.15 },
  'Dipping Shots':      { CRL: 0.15 },
  'Knuckle Shot':       { KPW: 0.17 },

  'Interception':       { DAW: 0.10 },
  'Blocker':            { DEN: 0.20 },
  'Aerial Superiority': { JMP: 0.09 },
  'Sliding Tackle':     { TAC: 0.15 },
  'Track Back':         { DAW: 0.12 },
};

// Consensus vote count -> badge tier + strength multiplier applied to
// the SKILL_BOOSTS percentages above (5+ voters = full listed bonus).
export const CONSENSUS_TIERS = [
  { min: 5, tier: 'gold',   multiplier: 1.00 },
  { min: 4, tier: 'silver', multiplier: 0.85 },
  { min: 3, tier: 'bronze', multiplier: 0.60 },
];

export function getConsensusTier(voteCount) {
  return CONSENSUS_TIERS.find(t => voteCount >= t.min) || null;
}

// Tally raw skill picks (array of skill-name arrays, one per voter) into
// the list of skills that reached consensus, each with its tier.
export function tallySkillConsensus(voterSkillLists) {
  const counts = {};
  voterSkillLists.forEach(list => {
    (list || []).forEach(skill => {
      counts[skill] = (counts[skill] || 0) + 1;
    });
  });
  const result = [];
  for (const [skill, count] of Object.entries(counts)) {
    const tier = getConsensusTier(count);
    if (tier) result.push({ skill, count, tier: tier.tier, multiplier: tier.multiplier });
  }
  return result;
}

// Apply consensus-granted regular skills on top of raw (median) stats.
export function applySkillBoosts(rawStats, grantedSkills) {
  const boosted = { ...rawStats };
  grantedSkills.forEach(({ skill, multiplier }) => {
    const boosts = SKILL_BOOSTS[skill];
    if (!boosts) return;
    for (const [stat, pct] of Object.entries(boosts)) {
      const base = boosted[stat] ?? 50;
      boosted[stat] = Math.min(99, Math.round(base * (1 + pct * multiplier)));
    }
  });
  return boosted;
}

// ── Posters (admin-assigned stat packs, +2 each, toggle per player) ─────
export const POSTERS = {
  'Shooting':          { FIN: 2, KPW: 2 },
  'Free-kick Taking':  { FIN: 2, PLK: 2, CRL: 2, KPW: 2 },
  'Aerial':            { HEA: 2, JMP: 2, PHY: 2, AGG: 2 },
  'Passing':           { LOP: 2, LFP: 2, CRL: 2, KPW: 2 },
  'Ball Carrying':     { BCO: 2, DRI: 2, TIP: 2, BAL: 2 },
  'Technique':         { BCO: 2, DRI: 2, TIP: 2, LOP: 2 },
  'Defending':         { DAW: 2, TAC: 2, DEN: 2, AGG: 2 },
  'Duelling':          { PHY: 2, BAL: 2, JMP: 2, AGG: 2 },
  'Agility':           { SPD: 2, ACC: 2, BAL: 2, STM: 2 },
  'Physicality':       { PHY: 2, JMP: 2, STM: 2, BAL: 2 },
  'Goalkeeping':       {}, // no outfield stats to boost — kept for completeness, no-op today
};

// Apply only the posters the admin has switched ON for this player.
export function applyPosterBoosts(rawStats, activePosterNames) {
  const boosted = { ...rawStats };
  (activePosterNames || []).forEach(name => {
    const boosts = POSTERS[name];
    if (!boosts) return;
    for (const [stat, add] of Object.entries(boosts)) {
      boosted[stat] = Math.min(99, (boosted[stat] ?? 50) + add);
    }
  });
  return boosted;
}
