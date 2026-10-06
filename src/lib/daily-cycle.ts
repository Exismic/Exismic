const DAY = 24 * 60 * 60 * 1000;
const IST_OFFSET = 5.5 * 60 * 60 * 1000;
const NOON_UTC = 6.5 * 60 * 60 * 1000;

/** A daily reward cycle runs from noon IST to the following noon IST. */
export function getTodayInIndia(now: Date = new Date()): Date {
  const india = new Date(now.getTime() + IST_OFFSET);
  const date = Date.UTC(india.getUTCFullYear(), india.getUTCMonth(), india.getUTCDate());
  return new Date(date - (india.getUTCHours() < 12 ? DAY : 0));
}

export function getMostRecentResetTimestamp(now: Date = new Date()): Date {
  return new Date(getTodayInIndia(now).getTime() + NOON_UTC);
}

export function getNextDailyReset(now: Date = new Date()): Date {
  return new Date(getMostRecentResetTimestamp(now).getTime() + DAY);
}
