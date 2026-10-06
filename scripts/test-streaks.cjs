/* Offline regression checks: no real users, database, network or outgoing email. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const root = path.resolve(__dirname, '..'), ts = require('typescript');
const { Prisma } = require('@prisma/client');
const NativeDate = Date;
let clock = NativeDate.parse('2026-10-06T06:35:00Z');
global.Date = class extends NativeDate {
  constructor(...args) { super(...(args.length ? args : [clock])); }
  static now() { return clock; }
};
global.fetch = async () => { throw new Error('Network forbidden in streak tests'); };
const at = value => { clock = NativeDate.parse(value); };
let db, mail, mailFailure = false, outboxUnavailable = false, conflict = false, serializableCalls = 0;
let txTail = Promise.resolve();
const clone = x => structuredClone(x);
function match(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some(x => match(row, x));
    if (key === 'AND') return value.every(x => match(row, x));
    if (key === 'userId_claimDate') return match(row, value);
    let actual = row[key];
    if (value && typeof value === 'object' && !(value instanceof NativeDate)) {
      if (value.path) actual = value.path.reduce((obj, part) => obj?.[part], actual);
      if ('equals' in value) return JSON.stringify(actual) === JSON.stringify(value.equals);
      if ('not' in value && actual === value.not) return false;
      if ('lt' in value && !(actual < value.lt)) return false;
      if ('lte' in value && !(actual <= value.lte)) return false;
      if ('gt' in value && !(actual > value.gt)) return false;
      if ('gte' in value && !(actual >= value.gte)) return false;
      return true;
    }
    return actual instanceof NativeDate && value instanceof NativeDate ? +actual === +value : actual === value;
  });
}
function table(name) {
  const check = () => { if (name === 'events' && outboxUnavailable) throw new Error('Mock outbox unavailable'); };
  return {
    async findMany({ where, take } = {}) { check(); return clone(db[name].filter(x => match(x, where)).slice(0, take)); },
    async findFirst({ where } = {}) { check(); return clone(db[name].find(x => match(x, where)) || null); },
    async findUnique(args) { return this.findFirst(args); },
    async create({ data }) {
      if (name === 'claims' && db.claims.some(x => x.userId === data.userId && +x.claimDate === +data.claimDate))
        throw new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' });
      const row = { id: `${name}-${db[name].length}`, createdAt: new Date(), ...clone(data) };
      db[name].push(row); return clone(row);
    },
    async updateMany({ where, data }) {
      check(); let count = 0;
      for (const row of db[name]) if (match(row, where)) {
        for (const [key, value] of Object.entries(data)) {
          if (value === undefined) continue;
          row[key] = value && typeof value === 'object' && 'increment' in value ? row[key] + value.increment : clone(value);
        }
        count++;
      }
      return { count };
    },
    async update(args) { await this.updateMany(args); return this.findUnique({ where: args.where }); },
  };
}
const prisma = {
  user: table('users'), creditTransaction: table('events'), notification: table('notifications'),
  creditShopClaim: table('claims'), sparksTransaction: table('sparks'),
  async $transaction(operation, options) {
    if (options?.isolationLevel === 'Serializable') serializableCalls++;
    const previous = txTail;
    let release; txTail = new Promise(resolve => { release = resolve; });
    await previous;
    const snapshot = clone(db);
    try {
      if (conflict) { conflict = false; throw new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: 'test' }); }
      return await operation(prisma);
    } catch (error) { db = snapshot; throw error; }
    finally { release(); }
  },
};
const originalResolve = Module._resolveFilename, originalLoad = Module._load;
Module._resolveFilename = function(request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, ...args);
};
Module._load = function(request, parent, ...args) {
  if (request === 'server-only') return {};
  if ((request === './prisma' || request === '@/lib/prisma') && parent?.filename.startsWith(root)) return { prisma };
  if (request === './dev-account' || request === '@/lib/dev-account') return { isDevAccountEmail: email => email === 'developer@test.invalid', DEV_INFINITE_BALANCE: 99999999 };
  if (request === './resend') return { resend: { emails: { send: async (payload, options) => {
    mail.push({ payload, options });
    return { data: mailFailure ? null : { id: 'MOCK-NO-MAIL-SENT' }, error: mailFailure ? { message: 'Mock provider unavailable' } : null };
  } } } };
  if (request === './email-diagnostics') return { recordEmailEvent() {} };
  if (request === './site-url') return { getServerSiteUrl: () => 'https://www.exismic.xyz' };
  if (request === '@/lib/billing/receipt-pdf') return { createReceiptPdf: async () => Buffer.from('MOCK') };
  if (request === '@/data/tools') return { ALL_TOOLS: [] };
  return originalLoad.call(this, request, parent, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const cycle = require('../src/lib/daily-cycle.ts');
const state = require('../src/lib/streak-state.ts');
const streaks = require('../src/lib/streaks.ts');
const credits = require('../src/lib/credits.ts');
const sparks = require('../src/lib/sparks.ts');
const emails = require('../src/lib/emails.ts');
const { NextRequest } = require('next/server');
const maintenanceRoute = require('../src/app/api/cron/streak-maintenance/route.ts');
const reminderRoute = require('../src/app/api/cron/streak-reminders/route.ts');
function reset(overrides = {}) {
  at('2026-10-06T06:35:00Z'); mail = []; mailFailure = false; outboxUnavailable = false; conflict = false; serializableCalls = 0;
  db = { users: [{ id: 'user', email: 'creator@test.invalid', name: 'Creator', status: 'active', role: 'user',
    dailyStreak: 5, streakShields: 1, lastClaimDate: new Date('2026-10-04Z'), streakFreezeUsedAt: null,
    lastStreakReminderSentAt: null, dailyCredits: 50, bonusCredits: 20, lifetimeCredits: 60, plan: 'free',
    creditsLastReset: new Date(), sparks: 1000, lifetimeSparks: 1000, streakMilestonesClaimed: [], ...overrides }],
    events: [], notifications: [], claims: [], sparks: [] };
}
let passed = 0;
async function test(name, run) { reset(); await run(); passed++; console.log(`PASS ${name}`); }
const user = () => db.users[0];
const protection = () => db.events.filter(x => x.transactionType === 'streak_protection');
const quiet = async fn => { const old = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = old; } };
async function main() {
  await test('Noon IST boundary leaves the current reward day open', () => {
    at('2026-10-06T06:29:59.999Z'); assert.equal(cycle.getTodayInIndia().toISOString(), '2026-10-05T00:00:00.000Z');
    assert.equal(state.resolveStreak(user()).shieldsConsumed, 0);
    at('2026-10-06T06:30:00Z'); assert.equal(state.resolveStreak(user()).shieldsConsumed, 1);
    assert.equal(cycle.getNextDailyReset().toISOString(), '2026-10-07T06:30:00.000Z');
  });
  await test('Clock handles month/year transitions and UTC timestamps', () => {
    at('2027-01-01T02:30:00Z'); assert.equal(cycle.getTodayInIndia().toISOString(), '2026-12-31T00:00:00.000Z');
    at('2026-11-01T06:30:00Z'); assert.equal(state.resolveStreak({ ...user(), lastClaimDate: '2026-10-30' }).shieldsConsumed, 1);
  });
  await test('One missed reward consumes one saver without granting a reward', async () => {
    const before = clone(user()); await streaks.settleUserStreak('user');
    assert.equal(user().dailyStreak, 5); assert.equal(user().streakShields, 0);
    assert.equal(+user().lastClaimDate, +before.lastClaimDate); assert.equal(user().bonusCredits, before.bonusCredits);
    assert.equal(db.claims.length, 0); assert.equal(protection()[0].amount, 0); assert.equal(db.notifications.length, 1);
    assert.equal(protection()[0].metadata.emailStatus, 'pending');
  });
  await test('Multiple consecutive missed days use one saver per day', async () => {
    Object.assign(user(), { lastClaimDate: new Date('2026-10-02Z'), streakShields: 3 });
    await streaks.settleUserStreak('user'); assert.equal(user().dailyStreak, 5); assert.equal(user().streakShields, 0);
    assert.equal(protection()[0].metadata.shieldsUsed, 3);
  });
  await test('Protection runs out after uncovered missed days, without restoring old zero streaks', async () => {
    user().lastClaimDate = new Date('2026-10-02Z'); await streaks.settleUserStreak('user');
    assert.equal(user().dailyStreak, 0); assert.equal(user().streakShields, 0); assert.equal(protection()[0].metadata.saved, false);
    Object.assign(user(), { dailyStreak: 0, streakShields: 3 }); await streaks.settleUserStreak('user'); assert.equal(user().streakShields, 3);
  });
  await test('No saver resets the expired streak, current/yesterday claim does not', async () => {
    user().streakShields = 0; await streaks.settleUserStreak('user'); assert.equal(user().dailyStreak, 0);
    for (const day of ['2026-10-05', '2026-10-06']) assert.equal(state.resolveStreak({ ...user(), dailyStreak: 5, lastClaimDate: day }).dailyStreak, 5);
  });
  await test('Repeat and concurrent settlement spend once and record once', async () => {
    await Promise.all([streaks.settleUserStreak('user'), streaks.settleUserStreak('user'), streaks.settleUserStreak('user')]);
    assert.equal(protection().length, 1); assert.equal(db.notifications.length, 1); assert.equal(user().dailyStreak, 5);
    assert.equal(state.resolveStreak(user()).changed, false);
  });
  await test('Serializable conflict retry preserves exactly one event', async () => {
    conflict = true; await streaks.settleUserStreak('user'); assert.equal(serializableCalls, 2); assert.equal(protection().length, 1);
  });
  await test('A later missed day consumes another saver, never the already covered day', async () => {
    user().streakShields = 3; await streaks.settleUserStreak('user'); assert.equal(user().streakShields, 2);
    at('2026-10-07T06:35:00Z'); await streaks.settleUserStreak('user'); assert.equal(user().streakShields, 1); assert.equal(protection().length, 2);
  });
  await test('Developer and inactive accounts are excluded', async () => {
    for (const overrides of [{ role: 'developer' }, { email: 'developer@test.invalid' }, { status: 'suspended' }]) {
      reset(overrides); assert.equal(await streaks.settleUserStreak('user'), null); assert.equal(protection().length, 0);
    }
  });
  await test('Maintenance protects without any user visit and emails the recorded event', async () => {
    const result = await streaks.runStreakMaintenance(); assert.equal(result.shieldsUsed, 1); assert.equal(result.protectionEmailsSent, 1);
    assert.equal(user().dailyStreak, 5); assert.equal(mail.length, 1); assert.equal(protection()[0].metadata.emailStatus, 'sent');
    await streaks.runStreakMaintenance(); assert.equal(mail.length, 1);
  });
  await test('Email failure keeps a durable event for a later retry', async () => {
    mailFailure = true; await quiet(() => streaks.runStreakMaintenance());
    assert.equal(user().dailyStreak, 5); assert.equal(protection()[0].metadata.emailStatus, 'pending');
    assert.equal((await streaks.deliverStreakProtectionEmails()).sent, 0); assert.equal(mail.length, 1);
    at('2026-10-06T06:51:00Z'); mailFailure = false; await streaks.deliverStreakProtectionEmails();
    assert.equal(mail.length, 2); assert.deepEqual(mail[0].options, mail[1].options); assert.equal(protection()[0].metadata.emailStatus, 'sent');
  });
  await test('Concurrent outbox delivery leases one send', async () => {
    await streaks.settleUserStreak('user'); await Promise.all([streaks.deliverStreakProtectionEmails(), streaks.deliverStreakProtectionEmails()]);
    assert.equal(mail.length, 1); assert.equal(protection()[0].metadata.emailStatus, 'sent');
  });
  await test('Expired sending lease recovers; active lease skips without starving ready events', async () => {
    await streaks.settleUserStreak('user'); const event = protection()[0];
    event.metadata.emailStatus = 'sending'; event.metadata.emailLeaseUntil = new Date(clock + 600000).toISOString();
    db.events.push({ ...clone(event), id: 'ready', metadata: { ...event.metadata, emailStatus: 'pending', emailRetryAt: new Date().toISOString() } });
    assert.equal((await streaks.deliverStreakProtectionEmails(undefined, 1)).sent, 1);
    at('2026-10-06T06:46:00Z'); await streaks.deliverStreakProtectionEmails(); assert.equal(mail.length, 2);
  });
  await test('Outbox database failure cannot turn a committed reward into failure', async () => {
    outboxUnavailable = true; const result = await quiet(() => credits.claimDailyShopCredits('user'));
    assert.equal(result.success, true); assert.equal(result.streak, 6); assert.equal(user().streakShields, 0);
    assert.equal(db.claims.length, 1); assert.equal(protection().length, 1);
  });
  await test('Reward claim resumes the saved streak and never double spends', async () => {
    const result = await credits.claimDailyShopCredits('user'); assert.equal(result.success, true); assert.equal(result.streak, 6);
    assert.equal(result.shieldConsumed, true); assert.equal(user().streakShields, 0); assert.equal(protection().length, 1);
    assert.equal(+user().lastClaimDate, +cycle.getTodayInIndia());
  });
  await test('Concurrent claims award only once', async () => {
    const results = await Promise.all([credits.claimDailyShopCredits('user'), credits.claimDailyShopCredits('user')]);
    assert.equal(results.filter(x => x.success).length, 1); assert.equal(db.claims.length, 1); assert.equal(user().dailyStreak, 6);
  });
  await test('Claim after exhausted protection restarts at one', async () => {
    user().lastClaimDate = new Date('2026-10-01Z'); const result = await credits.claimDailyShopCredits('user');
    assert.equal(result.streak, 1); assert.equal(user().streakShields, 0);
  });
  await test('Weekly saver reward honors capacity three', async () => {
    Object.assign(user(), { lastClaimDate: new Date('2026-10-05Z'), dailyStreak: 6, streakShields: 2 });
    const result = await credits.claimDailyShopCredits('user'); assert.equal(result.streak, 7); assert.equal(user().streakShields, 3);
    reset({ lastClaimDate: new Date('2026-10-05Z'), dailyStreak: 6, streakShields: 3 }); await credits.claimDailyShopCredits('user'); assert.equal(user().streakShields, 3);
  });
  await test('Saved streak remains milestone eligible; duplicate milestone cannot award twice', async () => {
    user().dailyStreak = 7;
    const results = await quiet(() => Promise.all([credits.claimStreakMilestone('user', 7), credits.claimStreakMilestone('user', 7)]));
    assert.equal(results.filter(x => x.success).length, 1); assert.equal(user().dailyStreak, 7);
    assert.deepEqual(user().streakMilestonesClaimed, ['7']); assert.equal(user().streakShields, 1);
    assert.equal(db.events.filter(x => x.metadata?.milestoneDay === 7).length, 1);
  });
  await test('Protection and notifications roll back together on transactional failure', async () => {
    const original = prisma.notification.create;
    prisma.notification.create = async () => { throw new Error('Mock failed notification'); };
    try { await assert.rejects(() => streaks.settleUserStreak('user')); }
    finally { prisma.notification.create = original; }
    assert.equal(user().dailyStreak, 5); assert.equal(user().streakShields, 1); assert.equal(protection().length, 0);
  });
  await test('Credits and Sparks read the same protected persisted streak', async () => {
    const a = await credits.getUserCredits('user'), b = await sparks.getUserSparksData('user');
    assert.equal(a.dailyStreak, 5); assert.equal(b.dailyStreak, 5); assert.equal(b.streakShields, 0); assert.equal(mail.length, 1);
  });
  await test('Buying a saver settles missed days first, cannot retroactively rescue expired streak', async () => {
    user().streakShields = 0; const result = await sparks.redeemSparksShopItem('user', 'sparks_streak_freeze_1x');
    assert.equal(result.success, true); assert.equal(user().dailyStreak, 0); assert.equal(user().streakShields, 1); assert.equal(user().sparks, 750);
  });
  await test('Saver purchases cap at three and deduct only for successful purchases', async () => {
    Object.assign(user(), { lastClaimDate: new Date('2026-10-05Z'), streakShields: 2 });
    const results = await quiet(() => Promise.all([credits.buyStreakShield('user'), credits.buyStreakShield('user')]));
    assert.equal(results.filter(x => x.success).length, 1); assert.equal(user().streakShields, 3); assert.equal(user().dailyCredits, 20);
    assert.equal(db.events.filter(x => x.transactionType === 'shield_purchase').length, 1);
  });
  await test('Bundle reports actual awarded savers after cap', async () => {
    Object.assign(user(), { lastClaimDate: new Date('2026-10-05Z'), streakShields: 2 });
    const result = await sparks.redeemSparksShopItem('user', 'sparks_streak_guardian_3x');
    assert.equal(result.success, true); assert.equal(result.details.shieldsAwarded, 1); assert.equal(user().streakShields, 3);
  });
  await test('Reminder uses the same noon cycle and runs before reset', async () => {
    at('2026-10-06T02:30:00Z'); const result = await streaks.sendStreakReminders();
    assert.equal(result.hoursRemaining, 4); assert.equal(result.emailsSent, 1); assert.equal(mail.length, 1);
    assert(mail[0].payload.text.includes('used automatically')); assert(!mail[0].payload.subject.includes('break'));
    assert(mail[0].options.idempotencyKey.endsWith('/2026-10-05'));
    await streaks.sendStreakReminders(); assert.equal(mail.length, 1);
  });
  await test('No-saver reminder truthfully warns, successful claim suppresses reminders', async () => {
    at('2026-10-06T02:30:00Z'); user().streakShields = 0; await streaks.sendStreakReminders();
    assert(mail[0].payload.text.includes('will end your streak'));
    reset(); at('2026-10-06T02:30:00Z'); user().lastClaimDate = cycle.getTodayInIndia();
    assert.equal((await streaks.sendStreakReminders()).emailsSent, 0);
  });
  await test('Reminder skips ended/inactive/developer users and early cycle', async () => {
    for (const overrides of [{ dailyStreak: 0 }, { role: 'developer' }, { status: 'suspended' }]) {
      reset(overrides); at('2026-10-06T02:30:00Z'); assert.equal((await streaks.sendStreakReminders()).emailsSent, 0);
    }
    reset(); assert.equal((await streaks.sendStreakReminders()).skipped, true); assert.equal(mail.length, 0);
  });
  await test('Failed reminder is not stamped as sent', async () => {
    at('2026-10-06T02:30:00Z'); mailFailure = true; await quiet(() => streaks.sendStreakReminders());
    assert.equal(user().lastStreakReminderSentAt, null); mailFailure = false; assert.equal((await streaks.sendStreakReminders()).emailsSent, 1);
  });
  await test('Long email addresses still produce bounded, private reminder idempotency keys', async () => {
    await emails.sendStreakExpiryWarningEmail({ email: `${'x'.repeat(200)}@test.invalid`, streak: 5, hasShield: true, hoursRemaining: 4, cycleDate: '2026-10-05' });
    assert(mail[0].options.idempotencyKey.length < 256); assert(!mail[0].options.idempotencyKey.includes('@'));
  });
  await test('Email HTML/text use valid reward links and stable protection idempotency', async () => {
    await streaks.runStreakMaintenance(); const sent = mail[0];
    assert(sent.payload.html.includes('href="https://www.exismic.xyz/shop"')); assert(sent.payload.text.includes('Savers remaining: 0'));
    assert(sent.options.idempotencyKey.startsWith('streak-protection-v1/'));
    await emails.sendStreakProtectionEmail({ email: 'creator@test.invalid', streak: 5, shieldsUsed: 1, shieldsRemaining: 0, missedDays: 3, saved: false, eventId: 'expired', protectedThrough: new Date().toISOString() });
    assert(mail[1].payload.text.includes('streak ended')); assert(!mail[1].payload.text.includes('streak saved'));
  });
  await test('Cron routes fail closed with missing/wrong secret; GET works with authorization', async () => {
    for (const route of [maintenanceRoute, reminderRoute]) {
      delete process.env.CRON_SECRET;
      assert.equal((await route.GET(new NextRequest('https://test.invalid'))).status, 401);
      process.env.CRON_SECRET = 'offline-cron-secret';
      assert.equal((await route.GET(new NextRequest('https://test.invalid', { headers: { authorization: 'Bearer wrong' } }))).status, 401);
    }
    assert.equal(protection().length, 0); assert.equal(mail.length, 0);
    const result = await maintenanceRoute.GET(new NextRequest('https://test.invalid', { headers: { authorization: 'Bearer offline-cron-secret' } }));
    assert.equal(result.status, 200); assert.equal((await result.json()).shieldsUsed, 1);
  });
  await test('Both daily cron schedules are present and shop copy matches actual claim rules', () => {
    const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json')));
    assert(config.crons.some(x => x.path === '/api/cron/streak-reminders' && x.schedule === '30 2 * * *'));
    assert(config.crons.some(x => x.path === '/api/cron/streak-maintenance' && x.schedule === '35 6 * * *'));
    assert.equal(state.MAX_STREAK_SHIELDS, 3);
    assert(fs.readFileSync(path.join(root, 'src/config/sparks-shop.ts'), 'utf8').includes('miss one reward claim'));
  });
  console.log(`${passed} streak checks passed. All account writes and email transport mocked; localhost stayed off.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
