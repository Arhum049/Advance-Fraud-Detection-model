/**
 * Evaluates a transaction locally based on pre-defined heuristics when the backend API is unavailable.
 * Matches the original HTML computeScore logic exactly.
 */
export function computeScore(amt, hour, dist, age, cat, isNew, user, pop) {
  let s = 0;
  const avg7 = isNew ? amt : (user.avg7 || 100);
  const dev = amt / avg7;
  const fraudCount = isNew ? 0 : user.fraud;
  const txnCount = isNew ? 0 : user.count;

  if (dev > 3) s += 0.30;
  else if (dev > 2) s += 0.15;
  else if (dev > 1.5) s += 0.07;

  if (dist > 500) s += 0.20;
  else if (dist > 200) s += 0.10;
  else if (dist > 100) s += 0.04;

  if (fraudCount >= 2) s += 0.28;
  else if (fraudCount === 1) s += 0.14;

  if (hour >= 0 && hour <= 5) s += 0.10;
  if (cat === 'misc_net' || cat === 'travel') s += 0.06;
  if (cat === 'grocery_pos') s -= 0.04;

  if (txnCount === 0) s += 0.05;
  if (pop < 5000) s += 0.05;
  if (age < 22) s += 0.04;

  // Add random noise and clip between 0.02 and 0.97
  s = Math.max(0.02, Math.min(0.97, s + (Math.random() * 0.04 - 0.02)));
  return parseFloat(s.toFixed(3));
}
