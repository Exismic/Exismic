import { getTodayInIndia } from './daily-cycle';

export const MAX_STREAK_SHIELDS = 3;
export const STREAK_DAY_MS = 24 * 60 * 60 * 1000;
export type StreakState = {
  dailyStreak?: number | null;
  lastClaimDate?: Date | string | null;
  streakShields?: number | null;
  streakFreezeUsedAt?: Date | string | null;
};

function claimDay(value?: Date | string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) : null;
}

/** Never changes the real claim date or grants a reward for a protected day. */
export function resolveStreak(state: StreakState, now: Date = new Date()) {
  const today = getTodayInIndia(now).getTime();
  const lastClaim = claimDay(state.lastClaimDate);
  const streak = Math.max(0, state.dailyStreak || 0);
  const shields = Math.max(0, state.streakShields || 0);
  const frozenAt = state.streakFreezeUsedAt ? new Date(state.streakFreezeUsedAt) : null;
  // The freeze timestamp is the noon when the protected day's window ended.
  const frozenThrough = frozenAt && Number.isFinite(frozenAt.getTime()) && frozenAt <= now
    ? getTodayInIndia(frozenAt).getTime() - STREAK_DAY_MS : null;
  const lastCovered = lastClaim === null ? null : Math.max(lastClaim, frozenThrough ?? lastClaim);
  const missedDays = lastCovered === null ? 0 : Math.max(0, Math.round((today - lastCovered) / STREAK_DAY_MS) - 1);
  const shieldsConsumed = streak > 0 ? Math.min(shields, missedDays) : 0;
  const broken = streak > 0 && (lastClaim === null || missedDays > shields);
  const nextFreezeUsedAt = shieldsConsumed > 0 && lastCovered !== null
    ? new Date(lastCovered + (shieldsConsumed + 1) * STREAK_DAY_MS + 6.5 * 60 * 60 * 1000) : null;
  return {
    dailyStreak: broken ? 0 : streak,
    streakShields: shields - shieldsConsumed,
    missedDays,
    shieldsConsumed,
    broken,
    changed: broken || shieldsConsumed > 0,
    nextFreezeUsedAt,
    claimedToday: lastClaim === today,
  };
}
