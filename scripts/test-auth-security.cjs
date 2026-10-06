/* Offline regression checks: no real accounts, provider requests or outgoing email. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
process.env.SUPABASE_SERVICE_ROLE_KEY = 'offline-security-test-secret-never-used-in-production';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.invalid';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'offline-test';
global.fetch = async () => { throw new Error('Network access is forbidden in security tests.'); };
let rows = [], accounts = [], users = [], devices = [], approvals = [], challenges = [], emails = [], session = null;
let generatedLinks = 0;
let signInCalls = 0, adminUpdates = 0, dbUnavailable = false;
const jar = new Map();
const clone = value => value == null ? value : structuredClone(value);
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some(v => matches(row, v));
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      if ('startsWith' in value) return typeof row[key] === 'string' && row[key].startsWith(value.startsWith);
      if ('gt' in value && !(row[key] > value.gt)) return false;
      if ('lte' in value && !(row[key] <= value.lte)) return false;
      if ('equals' in value) return value.mode === 'insensitive' ? String(row[key]).toLowerCase() === String(value.equals).toLowerCase() : row[key] === value.equals;
      return true;
    }
    return row[key] === value;
  });
}
function table(get, set, defaults = {}) {
  return {
    async findFirst({ where }) { if (dbUnavailable) throw new Error('Offline database failure'); return clone(get().find(x => matches(x, where)) || null); },
    async findUnique({ where }) { return this.findFirst({ where }); },
    async findMany({ where, take } = {}) { if (dbUnavailable) throw new Error('Offline database failure'); return clone(get().filter(x=>matches(x,where)).slice(0,take)); },
    async create({ data }) {
      if (dbUnavailable) throw new Error('Offline database failure');
      if (data.token && get().some(x => x.token === data.token)) throw Object.assign(new Error('duplicate'), { code: 'P2002' });
      const row = { ...defaults, id: `id-${get().length}`, ...clone(data) }; get().push(row); return clone(row);
    },
    async updateMany({ where, data }) {
      if (dbUnavailable) throw new Error('Offline database failure');
      let count = 0; for (const row of get()) if (matches(row, where)) { Object.assign(row, clone(data)); count++; }
      return { count };
    },
    async deleteMany({ where }) { if (dbUnavailable) throw new Error('Offline database failure'); const before = get().length; set(get().filter(x => !matches(x, where))); return { count: before - get().length }; },
    async upsert({ where, create, update }) { const existing = get().find(x => matches(x, where)); if (existing) { Object.assign(existing, clone(update)); return clone(existing); } return this.create({ data: create }); },
    async update({ where, data }) { await this.updateMany({ where, data }); return this.findFirst({ where }); },
  };
}
const prisma = {
  async $transaction(operation) { return operation(prisma); },
  verificationToken: table(() => rows, x => rows = x),
  user: table(() => users, x => users = x, { status: 'active' }),
  trustedLoginDevice: table(() => devices, x => devices = x, { revokedAt: null }),
  trustedLoginChallenge: table(() => challenges, x => challenges = x, { consumedAt: null, status: 'pending', createdAt: new Date() }),
  authRateLimit: { async upsert({ create }) { approvals.push(clone(create)); return create; }, async findUnique({ where }) { return approvals.find(x => matches(x, where.email_type)) || null; } },
};
const cookieStore = {
  get: name => jar.get(name), getAll: () => [...jar].map(([name, entry]) => ({ name, value: entry.value })),
  set: (name, value, options) => jar.set(name, { value, options }), delete: name => jar.delete(name),
};
function makeSession(user, sid = 'test-session') {
  const token = `test.${Buffer.from(JSON.stringify({ sub: user.id, session_id: sid })).toString('base64url')}.test`;
  return { user: clone(user), access_token: token, refresh_token: 'offline-refresh' };
}
const provider = () => ({ auth: {
  async getUser() { return { data: { user: session && clone(accounts.find(x => x.id === session.user.id)) }, error: null }; },
  async getSession() { return { data: { session: clone(session) }, error: null }; },
  async signInWithPassword({ email, password }) {
    signInCalls++;
    const user = accounts.find(x => x.email === email && x.password === password);
    if (!user) return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
    if (!user.email_confirmed_at) return { data: { user: null, session: null }, error: { message: 'Email not confirmed' } };
    session = makeSession(user);
    return { data: { user: clone(user), session: clone(session) }, error: null };
  },
  async signOut() { session = null; return { error: null }; },
  async exchangeCodeForSession() { return { data: { session: clone(session) }, error: null }; },
  async updateUser() { return { error: null }; },
} });
const admin = { auth: { admin: {
  async listUsers() { return { data: { users: clone(accounts) }, error: null }; },
  async getUserById(id) { return { data: { user: clone(accounts.find(x => x.id === id) || null) }, error: null }; },
  async createUser(data) { const user = { id: `auth-${accounts.length}`, app_metadata: {}, ...clone(data), email_confirmed_at: data.email_confirm ? 'verified' : null }; accounts.push(user); return { data: { user: clone(user) }, error: null }; },
  async updateUserById(id, data) { adminUpdates++; const user = accounts.find(x => x.id === id); if (!user) throw new Error('Unknown offline account'); Object.assign(user, clone(data), data.email_confirm ? { email_confirmed_at: 'verified' } : {}); return { data: { user: clone(user) }, error: null }; },
  async generateLink() { generatedLinks++; return { data: { properties: { hashed_token: `offline-token-${generatedLinks}` } }, error: null }; },
} } };
const stubs = {
  'server-only': {}, '@/lib/prisma': { prisma },
  'next/headers': { cookies: async () => cookieStore, headers: async () => new Headers({ 'x-forwarded-for': '192.0.2.1', 'user-agent': 'Offline Test', host: 'localhost:3100' }) },
  'next/server': { ...require('next/server'), after: fn => { void Promise.resolve().then(fn); } },
  '@supabase/ssr': { createServerClient: provider },
  '@/utils/supabase/admin': { createAdminClient: () => admin },
  '@/lib/emails': new Proxy({}, { get: (_, name) => async (...args) => { emails.push({ name, args }); return true; } }),
  '@/lib/welcome-email': { sendWelcomeEmailOnce: async () => 'sent', queueWelcomeEmail: async (_tx, account) => { emails.push({ name: 'queueWelcomeEmail', args: [clone(account)] }); } },
  '@/lib/site-url': { getServerSiteUrl: () => 'https://www.exismic.xyz' },
  '@/lib/dev-account': { isDevAccountEmail: () => false, isLocalhostDevRequest: () => false, ensureDevAccountProvisioned: async () => { throw new Error('Dev provisioning forbidden'); } },
  '@/lib/notifications': { createNotification: async () => {} },
  '@/lib/trusted-login-push': { sendLoginApprovalPush: async () => {} },
  '@/lib/tool-access': { resolveToolAccess: async () => ({ appUser: null, isPro: false, outputTier: 'standard', creditCost: 0 }), isToolAccessResponse: () => false, chargeToolAccess: async () => ({ success: true }) },
  '@/lib/api-security': {
    getRequestIp: request => request.headers.get('x-forwarded-for') || '192.0.2.1',
    rateLimitResponse: seconds => require('../src/lib/public-json.ts').publicJson({ error: 'Too many attempts.' }, { status: 429, headers: { 'Retry-After': String(seconds) } }),
  },
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (Object.hasOwn(stubs, request)) return stubs[request];
  if (request.startsWith('@/')) request = path.join(root, 'src', request.slice(2));
  return originalLoad.call(this, request, parent, isMain);
};
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  module._compile(output.outputText, filename);
};
const security = require('../src/lib/auth/security.ts');
const proof = require('../src/lib/auth/session-proof.ts');
const actions = require('../src/app/actions/auth.ts');
const device = require('../src/lib/device-security.ts');
const { createClient } = require('../src/utils/supabase/server.ts');
const { publicErrorPayload, publicErrorMessage } = require('../src/lib/public-errors.ts');
const { publicJson } = require('../src/lib/public-json.ts');
const { safeAuthReturnPath } = require('../src/lib/auth/redirect.ts');
const { safeAnalyticsEvent } = require('../src/lib/analytics-privacy.ts');
const checks = [];
async function test(name, fn) {
  rows = []; jar.clear(); accounts = []; users = []; devices = []; approvals = []; challenges = []; emails = []; session = null; generatedLinks = 0;
  signInCalls = adminUpdates = 0; dbUnavailable = false;
  await fn(); checks.push(name); console.log(`PASS ${name}`);
}
const email = 'person@example.test', password = 'Correct-Password42!';
function seed(confirmed = true, status = 'active') {
  const user = { id: 'person', email, password, app_metadata: {}, user_metadata: {}, email_confirmed_at: confirmed ? 'verified' : null };
  accounts.push(user); if (confirmed) users.push({ id: user.id, email, status }); return user;
}
function form(fields = { email, password, ageConsent: 'on' }) { const data = new FormData(); for (const [key, value] of Object.entries(fields)) data.set(key, value); return data; }
function request(body, url = 'https://www.exismic.xyz/api/test') { return new Request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(body) }); }
function phoneChallenge() {
  seed();
  const { hashTrustedLoginToken } = require('../src/lib/trusted-login.ts');
  const browserToken = 'b'.repeat(43), approvalToken = 'a'.repeat(43);
  devices.push({ id: 'phone', userId: 'person', loginEmail: email, status: 'active', revokedAt: null, expiresAt: new Date(Date.now() + 600000), pushEndpoint: 'https://push.example.test', pushP256dh: 'offline-test-push-key', pushAuth: 'offline-test-auth' });
  challenges.push({ id: 'challenge-12345', userId: 'person', deviceId: 'phone', loginEmail: email, status: 'approved', consumedAt: null, browserTokenHash: hashTrustedLoginToken(browserToken), approvalTokenHash: hashTrustedLoginToken(approvalToken), expiresAt: new Date(Date.now() + 300000), returnUrl: '//evil.test' });
  return { challengeId: challenges[0].id, browserToken, approvalToken };
}
const savedError = console.error;
console.error = () => {}; // Expected rejection/provider errors never print diagnostic values.
(async () => {
  await test('OTP storage contains hashes, never plaintext codes', async () => {
    const c = await security.createOtpChallenge('signup', email, 'person', security.signupPasswordBinding(email, password));
    const encoded = JSON.parse(Buffer.from(rows[0].token.split(':')[3], 'base64url'));
    assert.match(c.otp, /^\d{6}$/); assert.equal(encoded.attempts, 0); assert.match(encoded.hash, /^[a-f0-9]{64}$/);
    assert.equal(JSON.stringify(encoded).includes(c.otp), false);
    assert.equal(rows[0].expires - Date.now() <= 600000, true);
  });
  await test('OTP rejects wrong email, purpose, challenge and password binding', async () => {
    const binding = security.signupPasswordBinding(email, password);
    const c = await security.createOtpChallenge('signup', email, 'person', binding);
    assert.equal(await security.consumeOtpChallenge('signup', 'other@example.test', c.id, c.otp, binding), null);
    assert.equal(await security.consumeOtpChallenge('device', email, c.id, c.otp), null);
    assert.equal(await security.consumeOtpChallenge('signup', email, 'a'.repeat(48), c.otp, binding), null);
    assert.equal(await security.consumeOtpChallenge('signup', email, c.id, c.otp, security.signupPasswordBinding(email, 'different')), null);
    assert.deepEqual(await security.consumeOtpChallenge('signup', email, c.id, c.otp, binding), { userId: 'person' });
  });
  await test('Five wrong OTP guesses lock the challenge', async () => {
    const c = await security.createOtpChallenge('device', email, 'person');
    const wrong = c.otp === '123456' ? '654321' : '123456';
    for (let i = 0; i < 5; i++) assert.equal(await security.consumeOtpChallenge('device', email, c.id, wrong), null);
    assert.equal(await security.consumeOtpChallenge('device', email, c.id, c.otp), null);
    assert.equal(rows.length, 0);
  });
  await test('Expired and legacy plaintext OTP codes are rejected', async () => {
    const c = await security.createOtpChallenge('device', email, 'person'); rows[0].expires = new Date(Date.now() - 1);
    assert.equal(await security.consumeOtpChallenge('device', email, c.id, c.otp), null);
    rows = [{ identifier: email, token: 'device_otp:old:123456:person', expires: new Date(Date.now() + 600000) }];
    assert.equal(await security.consumeOtpChallenge('device', email, 'old', '123456'), null);
  });
  await test('OTP is consumed once, including simultaneous requests', async () => {
    const c = await security.createOtpChallenge('device', email, 'person');
    const results = await Promise.all(Array.from({ length: 8 }, () => security.consumeOtpChallenge('device', email, c.id, c.otp)));
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await security.consumeOtpChallenge('device', email, c.id, c.otp), null);
  });
  await test('OTP rotation invalidates previous codes without deleting reset links', async () => {
    rows.push({ identifier: email, token: 'pwd_reset:unrelated', expires: new Date(Date.now() + 600000) });
    const first = await security.createOtpChallenge('device', email, 'person');
    await security.createOtpChallenge('device', email, 'person');
    assert.equal(await security.consumeOtpChallenge('device', email, first.id, first.otp), null);
    assert(rows.some(x => x.token === 'pwd_reset:unrelated'));
  });
  await test('Persistent authentication limits remain atomic under concurrency', async () => {
    const results = await Promise.all(Array.from({ length: 40 }, () => security.consumeAuthLimit('concurrent', 5, 900000)));
    assert.equal(results.filter(Boolean).length, 5);
    assert.equal(await security.consumeAuthLimit('concurrent', 5, 900000), false);
    assert.equal(await security.consumeAuthLimit('independent', 5, 900000), true);
  });
  await test('Authentication limits fail closed if database is unavailable', async () => {
    dbUnavailable = true; await assert.rejects(security.consumeAuthLimit('failure', 5, 900000));
    const result = await actions.signInAction(form()); assert(result.error); assert.equal(signInCalls, 0);
  });
  await test('Reset tokens are hashed, email-bound, expiring and single-use', async () => {
    const token = security.generateResetToken(), stored = security.resetTokenHash(email, token);
    assert.match(token, /^pwd_reset:[a-f0-9]{64}$/); assert.notEqual(stored, token);
    assert.equal(security.resetTokenHash(email, 'old-uuid'), null);
    rows.push({ identifier: email, token: stored, expires: new Date(Date.now() + 600000) });
    assert.equal(await security.consumeResetToken('other@example.test', token), false);
    const result = await Promise.all(Array.from({ length: 8 }, () => security.consumeResetToken(email, token)));
    assert.equal(result.filter(Boolean).length, 1);
    rows.push({ identifier: email, token: stored, expires: new Date(Date.now() - 1) });
    assert.equal(await security.consumeResetToken(email, token), false);
  });
  await test('Missing, tampered and foreign-session proofs reject access', async () => {
    const user = seed(); session = makeSession(user); await proof.issueSessionProof(session);
    const entry = jar.get(proof.AUTH_PROOF_COOKIE); assert.equal(entry.options.httpOnly, true); assert.equal(entry.options.path, '/');
    assert.equal(await proof.isVerifiedAppSession(user, session, entry.value), true);
    assert.equal(await proof.isVerifiedAppSession(user, session), false);
    assert.equal(await proof.isVerifiedAppSession(user, session, entry.value + 'x'), false);
    assert.equal(await proof.isVerifiedAppSession(user, makeSession(user, 'another-session'), entry.value), false);
    assert.equal(await proof.isVerifiedAppSession({ ...user, id: 'someone-else' }, session, entry.value), false);
    const expired = { uid: user.id, sid: 'test-session', version: 'initial', expires: Date.now() - 1 };
    const encoded = Buffer.from(JSON.stringify(expired)).toString('base64url');
    const sig = require('node:crypto').createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY).update(`exismic-session-v1:${encoded}`).digest('base64url');
    assert.equal(await proof.isVerifiedAppSession(user, session, `${encoded}.${sig}`), false);
  });
  await test('Production proof cookies are Secure, HttpOnly and SameSite', async () => {
    const previous = process.env.NODE_ENV; process.env.NODE_ENV = 'production';
    try { await proof.issueSessionProof(makeSession(seed())); assert.deepEqual({ secure: jar.get(proof.AUTH_PROOF_COOKIE).options.secure, httpOnly: jar.get(proof.AUTH_PROOF_COOKIE).options.httpOnly, sameSite: jar.get(proof.AUTH_PROOF_COOKIE).options.sameSite }, { secure: true, httpOnly: true, sameSite: 'lax' }); }
    finally { process.env.NODE_ENV = previous; }
  });
  await test('Password version, suspension and pending deletion invalidate proofs', async () => {
    const user = seed(); session = makeSession(user); await proof.issueSessionProof(session); const raw = jar.get(proof.AUTH_PROOF_COOKIE).value;
    assert.equal(await proof.isVerifiedAppSession({ ...user, app_metadata: { exismic_auth_version: 'new-version' } }, session, raw), false);
    for (const status of ['suspended', 'pending_deletion']) { users[0].status = status; assert.equal(await proof.isVerifiedAppSession(user, session, raw), false); }
  });
  await test('Direct provider password sessions cannot authorize protected requests', async () => {
    seed(); const client = await createClient(); await client.auth.signInWithPassword({ email, password });
    assert.equal((await client.auth.getUser()).data.user, null);
    await proof.issueSessionProof(session); assert.equal((await client.auth.getUser()).data.user.id, 'person');
    jar.delete(proof.AUTH_PROOF_COOKIE); assert.equal((await client.auth.getUser()).data.user, null);
  });
  await test('Signup completes only after the browser-bound code and password match', async () => {
    assert.equal((await actions.signUpAction(form())).success, true);
    assert.equal(emails.filter(x => x.name === 'queueWelcomeEmail').length, 0);
    const sent = emails.find(x => x.name === 'sendAuthOTP'), code = sent.args[1];
    assert(jar.get(security.SIGNUP_CHALLENGE_COOKIE).options.httpOnly);
    const saved = jar.get(security.SIGNUP_CHALLENGE_COOKIE); jar.delete(security.SIGNUP_CHALLENGE_COOKIE);
    assert((await actions.verifyOtpAction(email, code, password)).error); assert.equal(adminUpdates, 0);
    jar.set(security.SIGNUP_CHALLENGE_COOKIE, saved);
    assert((await actions.verifyOtpAction(email, code, 'Another-Password43!')).error); assert.equal(adminUpdates, 0);
    assert.equal((await actions.verifyOtpAction(email, code, password)).success, true);
    assert.equal(emails.filter(x => x.name === 'queueWelcomeEmail').length, 1);
    assert.equal(emails.find(x => x.name === 'queueWelcomeEmail').args[0].id, accounts[0].id);
    assert.equal(users[0].dailyCredits, 50); assert(jar.has(proof.AUTH_PROOF_COOKIE));
    assert.equal((await (await createClient()).auth.getUser()).data.user.id, accounts[0].id);
  });
  await test('Signup verification cannot overwrite an already confirmed password', async () => {
    const user = seed(); const c = await security.createOtpChallenge('signup', email, user.id, security.signupPasswordBinding(email, password));
    jar.set(security.SIGNUP_CHALLENGE_COOKIE, { value: c.id });
    assert((await actions.verifyOtpAction(email, c.otp, password)).error); assert.equal(adminUpdates, 0);
    assert((await actions.resendOtpAction(email, password)).error); assert.equal(emails.length, 0);
  });
  await test('New-device password login requires its originating browser and OTP', async () => {
    seed(); const login = await actions.signInAction(form()); assert.equal(login.requireDeviceOtp, true);
    assert.equal(session, null); assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
    const code = emails.find(x => x.name === 'sendDeviceVerificationOtpEmail').args[1];
    const saved = jar.get(security.DEVICE_CHALLENGE_COOKIE); jar.delete(security.DEVICE_CHALLENGE_COOKIE);
    assert((await actions.verifyDeviceOtpAction(email, login.challengeId, code, password)).error); assert.equal(signInCalls, 1);
    jar.set(security.DEVICE_CHALLENGE_COOKIE, saved);
    assert.equal((await actions.verifyDeviceOtpAction(email, login.challengeId, code, password)).success, true);
    assert(jar.has(proof.AUTH_PROOF_COOKIE)); assert(jar.has(device.DEVICE_TOKEN_COOKIE_NAME));
    assert.equal((await actions.verifyDeviceOtpAction(email, login.challengeId, code, password)).success, undefined);
  });
  await test('Trusted devices must match both user ID and email', async () => {
    seed(); const registered = await device.registerTrustedDevice('person', email, 'Offline Test', '192.0.2.1');
    assert.equal((await device.checkIsDeviceTrusted('different', email, registered.rawDeviceToken)).isTrusted, false);
    assert.equal((await device.checkIsDeviceTrusted('person', 'other@example.test', registered.rawDeviceToken)).isTrusted, false);
    jar.set(device.DEVICE_TOKEN_COOKIE_NAME, { value: registered.rawDeviceToken });
    assert.equal((await actions.signInAction(form())).success, true); assert(jar.has(proof.AUTH_PROOF_COOKIE));
  });
  await test('Suspended accounts do not disclose status before password verification', async () => {
    seed(true, 'suspended');
    const wrong = await actions.signInAction(form({ email, password: 'wrong' })); assert.match(wrong.error, /incorrect/i); assert.equal(session, null);
    const correct = await actions.signInAction(form()); assert(correct.error); assert.equal(session, null); assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
  });
  await test('Reset never probes a password or updates an account before a valid token', async () => {
    seed(); const invalid = security.generateResetToken(); assert((await actions.updatePasswordAction(email, invalid, password)).error);
    assert.equal(signInCalls, 0); assert.equal(adminUpdates, 0);
    assert((await actions.updatePasswordAction(email, 'legacy-token', password)).error); assert.equal(adminUpdates, 0);
  });
  await test('Successful reset rotates session version and revokes device/code access', async () => {
    const user = seed(); session = makeSession(user); await proof.issueSessionProof(session); const oldSession = clone(session), raw = jar.get(proof.AUTH_PROOF_COOKIE).value;
    await device.registerTrustedDevice(user.id, email, 'Offline Test', '192.0.2.1');
    devices.push({ id: 'old-phone', userId: user.id, loginEmail: email, status: 'active' });
    await security.createOtpChallenge('device', email, user.id);
    const token = security.generateResetToken(); rows.push({ identifier: email, token: security.resetTokenHash(email, token), expires: new Date(Date.now() + 600000) });
    assert.equal((await actions.updatePasswordAction(email, token, 'New-Correct-Password43!')).success, true);
    assert.equal(signInCalls, 0); assert.equal(adminUpdates, 1); assert.equal(accounts[0].password, 'New-Correct-Password43!');
    assert.equal(await proof.isVerifiedAppSession(accounts[0], oldSession, raw), false);
    assert.equal(devices[0].status, 'revoked'); assert.equal(rows.some(x => x.identifier === email), false); assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
    assert((await actions.updatePasswordAction(email, token, password)).error); assert.equal(adminUpdates, 1);
  });
  await test('Unknown and confirmed emails receive the same reset response', async () => {
    seed(); const known = await actions.forgotPasswordAction(email), unknown = await actions.forgotPasswordAction('nobody@example.test');
    assert.deepEqual(known, unknown); assert.equal(emails.filter(x => x.name === 'sendResetPasswordEmail').length, 1);
    assert.equal(rows.some(x => x.token.startsWith('pwd_reset:v2:')), true);
  });
  await test('Internal OAuth approval helpers are not exposed as server actions', async () => {
    assert.equal(actions.recordOAuthProviderApproval, undefined); assert.equal(actions.createOAuthLinkRequestAction, undefined);
  });
  await test('OAuth callback establishes a verified session after creating the application account', async () => {
    const user = seed(); users = [];
    user.created_at = new Date().toISOString(); user.identities = [{ provider: 'google' }]; user.app_metadata.provider = 'google'; session = makeSession(user);
    const callback = require('../src/app/auth/callback/route.ts');
    const response = await callback.GET(new Request('https://www.exismic.xyz/auth/callback?code=offline-code&next=//evil.test'));
    assert.match(response.headers.get('location'), /^https:\/\/www\.exismic\.xyz\/dashboard/);
    assert.equal(users[0].dailyCredits, 50); assert(jar.has(proof.AUTH_PROOF_COOKIE));
    assert.equal((await (await createClient()).auth.getUser()).data.user.id, 'person');
    assert.equal(emails.filter(x => x.name === 'queueWelcomeEmail').length, 1);
  });
  await test('OAuth linking requires a verified matching account and consumes the nonce once', async () => {
    const user = seed(); const { nonce } = await require('../src/lib/auth/oauth-link.ts').createOAuthLinkRequest(email, 'google');
    session = makeSession(user);
    assert((await actions.consumeOAuthLinkRequestAction(nonce)).error); assert.equal(adminUpdates, 0);
    await proof.issueSessionProof(session); assert.equal((await actions.consumeOAuthLinkRequestAction(nonce)).success, true);
    assert((await actions.consumeOAuthLinkRequestAction(nonce)).error); assert.equal(adminUpdates, 1);
  });
  await test('Approved phone requests expire even if they were never collected', async () => {
    const c = phoneChallenge(); challenges[0].expiresAt = new Date(Date.now() - 1);
    const response = await require('../src/app/api/auth/trusted-login/status/route.ts').POST(request(c));
    assert.equal((await response.json()).status, 'expired'); assert.equal(generatedLinks, 0);
  });
  await test('Concurrent phone approval collection creates only one login link', async () => {
    const c = phoneChallenge(); const status = require('../src/app/api/auth/trusted-login/status/route.ts');
    const results = await Promise.all(Array.from({ length: 8 }, () => status.POST(request(c)).then(r => r.json())));
    assert.equal(generatedLinks, 1); assert.equal(results.filter(x => x.actionLink).length, 1);
    const link = new URL(results.find(x => x.actionLink).actionLink); assert.equal(link.searchParams.get('next'), '/dashboard');
  });
  await test('Revoked phones and restricted accounts cannot collect approval links', async () => {
    const status = require('../src/app/api/auth/trusted-login/status/route.ts'); let c = phoneChallenge(); devices[0].status = 'revoked';
    assert.equal((await (await status.POST(request(c))).json()).status, 'expired'); assert.equal(generatedLinks, 0);
    challenges = []; devices = []; users = []; accounts = []; c = phoneChallenge(); users[0].status = 'suspended';
    assert.equal((await (await status.POST(request(c))).json()).status, 'expired'); assert.equal(generatedLinks, 0);
  });
  await test('Phone approval rejects incorrect browser and approval tokens', async () => {
    const c = phoneChallenge();
    assert.equal((await require('../src/app/api/auth/trusted-login/status/route.ts').POST(request({ ...c, browserToken: 'wrong'.repeat(10) }))).status, 403);
    challenges[0].status = 'pending';
    assert.equal((await require('../src/app/api/auth/trusted-login/respond/route.ts').POST(request({ ...c, approvalToken: 'wrong'.repeat(10), decision: 'approved' }))).status, 403);
    assert.equal(challenges[0].status, 'pending'); assert.equal(generatedLinks, 0);
  });
  await test('Phone approvals stop after password reset', async () => {
    const c = phoneChallenge(); const token = security.generateResetToken(); rows.push({ identifier: email, token: security.resetTokenHash(email, token), expires: new Date(Date.now() + 600000) });
    assert.equal((await actions.updatePasswordAction(email, token, 'New-Correct-Password43!')).success, true);
    assert.equal(challenges[0].status, 'expired');
    assert.equal((await (await require('../src/app/api/auth/trusted-login/status/route.ts').POST(request(c))).json()).status, 'expired'); assert.equal(generatedLinks, 0);
  });
  await test('Account recovery verifies the password and leaves no transient authenticated session', async () => {
    seed(true, 'pending_deletion'); users[0].scheduledDeletionAt = new Date(Date.now() + 86400000); const recover = require('../src/app/api/user/account/recover/route.ts');
    const response = await recover.POST(request({ email, password, action: 'cancel' }));
    assert.equal((await response.json()).cancelled, true); assert.equal(users[0].status, 'active'); assert.equal(session, null); assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
  });
  await test('Repeated account recovery password guesses are persistently limited', async () => {
    seed(true, 'pending_deletion'); const recover = require('../src/app/api/user/account/recover/route.ts');
    for (let i = 0; i < 5; i++) assert.equal((await recover.POST(request({ email, password: 'wrong', action: 'cancel' }))).status, 401);
    assert.equal((await recover.POST(request({ email, password, action: 'cancel' }))).status, 429);
    assert.equal(signInCalls, 5); assert.equal(users[0].status, 'pending_deletion');
  });
  await test('Pending-account password login grants only a deletion-cancellation proof', async () => {
    seed(true, 'pending_deletion'); users[0].scheduledDeletionAt = new Date(Date.now() + 86400000);
    const result = await actions.signInAction(form());
    assert.equal(result.isPendingDeletion, true); assert.equal(session, null);
    const recovery = require('../src/lib/auth/deletion-recovery.ts');
    assert(jar.has(recovery.DELETION_RECOVERY_COOKIE)); assert.equal((await recovery.getDeletionRecoveryProof()).userId, 'person');
    assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
  });
  await test('Pending-account OAuth callback supports cancellation without granting app access', async () => {
    const user = seed(true, 'pending_deletion'); users[0].scheduledDeletionAt = new Date(Date.now() + 86400000);
    user.identities = [{ provider: 'google' }]; user.app_metadata.provider = 'google'; session = makeSession(user);
    const response = await require('../src/app/auth/callback/route.ts').GET(new Request('https://www.exismic.xyz/auth/callback?code=offline-code'));
    assert(response.headers.get('location').includes('pendingDeletion=true')); assert.equal(session, null);
    const recovery = require('../src/lib/auth/deletion-recovery.ts'); assert.equal((await recovery.getDeletionRecoveryProof()).userId, 'person');
    assert.equal(jar.has(proof.AUTH_PROOF_COOKIE), false);
  });
  await test('Accounts with cleanup already started cannot sign in or receive a recovery proof', async () => {
    const user = seed(true, 'deleting'); assert((await actions.signInAction(form())).error); assert.equal(session, null);
    user.identities = [{ provider: 'google' }]; user.app_metadata.provider = 'google'; session = makeSession(user);
    const response = await require('../src/app/auth/callback/route.ts').GET(new Request('https://www.exismic.xyz/auth/callback?code=offline-code'));
    assert(response.headers.get('location').includes('account_deletion_started')); assert.equal(session, null);
    assert.equal(await require('../src/lib/auth/deletion-recovery.ts').getDeletionRecoveryProof(), null);
  });
  await test('Redirects reject foreign domains, encoded slashes and backslashes', async () => {
    for (const value of ['https://evil.test', '//evil.test', '/\\evil.test', '/%5cevil.test', '/%2fevil.test', '/%00evil.test']) assert.equal(safeAuthReturnPath(value), '/dashboard');
    assert.equal(safeAuthReturnPath('/tools/image/minecraft-skin?mode=edit'), '/tools/image/minecraft-skin?mode=edit');
  });
  await test('Customer errors exclude provider, environment and arbitrary 5xx diagnostics', async () => {
    for (const error of ['Add OPENAI_API_KEY to Vercel env', 'The selected model is outdated', 'Prisma query failed', 'SQLSTATE 12345', 'Missing API key']) assert.notEqual(publicErrorMessage(error, 400), error);
    const safe = publicErrorPayload({ success: false, error: 'provider error', details: 'private', stack: 'private', arbitrarySecret: 'private', model: 'private' }, 500);
    assert.deepEqual(Object.keys(safe).sort(), ['error', 'success']);
    assert.equal(JSON.stringify(safe).includes('private'), false);
    const reference = '00000000-0000-4000-8000-000000000001';
    const retry = publicErrorPayload({ error: 'internal', retryable: true, requestId: reference, secret: 'private' }, 503);
    assert.equal(retry.retryable, true); assert.equal(retry.requestId, reference); assert.equal(retry.secret, undefined);
    assert.equal(publicErrorPayload({ error: 'You need 25 credits.', required: 25 }, 402).error, 'You need 25 credits.');
    assert.equal(publicErrorMessage('This file must be under 20 MB.', 400), 'This file must be under 20 MB.');
  });
  await test('JSON wrapper preserves successful payloads, status and headers', async () => {
    const response = publicJson({ success: true, url: 'https://example.test/result' }, { status: 201, headers: { 'X-Test': 'kept' } });
    assert.equal(response.status, 201); assert.equal(response.headers.get('X-Test'), 'kept'); assert.equal((await response.json()).url, 'https://example.test/result');
  });
  await test('Shared file tools cannot return raw provider configuration errors', async () => {
    const { withToolHandler } = require('../src/lib/tools-handler.ts');
    const response = await withToolHandler({ formData: async () => new FormData() }, { toolId: 'offline-tool', optionalFile: true }, async () => { throw new Error('Add OPENAI_API_KEY to Vercel env; outdated model'); });
    assert.equal(response.status, 500); const body = await response.json();
    assert.equal(/OPENAI|Vercel|outdated/.test(JSON.stringify(body)), false); assert.match(body.error, /try again/i);
  });
  await test('Analytics excludes auth URLs and strips normal-page query details', async () => {
    for (const url of ['https://www.exismic.xyz/auth/reset-password?token=secret', 'https://www.exismic.xyz/?token_hash=secret', '/auth/callback?code=secret']) assert.equal(safeAnalyticsEvent({ url }), null);
    assert.equal(safeAnalyticsEvent({ url: 'https://www.exismic.xyz/shop?market=IN#details' }).url, 'https://www.exismic.xyz/shop');
  });
  console.error = savedError;
  console.log(`\n${checks.length} offline security checks passed. No network/email or real account changes.`);
})().catch(error => { console.error = savedError; console.error(error); process.exitCode = 1; });
