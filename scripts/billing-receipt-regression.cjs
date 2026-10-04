// Run the real billing modules with isolated account, database and provider boundaries.
// Never connects to a provider, sends mail, charges an account or writes to the database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const crypto = require('node:crypto');
const ts = require('typescript');
const { PDFDocument } = require('pdf-lib');
const root = path.resolve(__dirname, '..');
const testErrors = [];
const silentConsole = { log() {}, warn() {}, error(...values) { testErrors.push(values); } };
const next = { NextResponse: { json: (body, opts = {}) => Response.json(body, opts) } };
let checks = 0;
const uiFixtures = {};
async function check(label, run) { await run(); checks++; console.log(`PASS ${label}`); }
function loader(mocks = {}) {
  const cache = new Map();
  function load(name, parent = path.join(root, 'src/index.ts')) {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    let file = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : name.startsWith('.') ? path.resolve(path.dirname(parent), name) : name;
    if (!path.isAbsolute(file)) return require(file);
    if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return require(file);
    if (cache.has(file)) return cache.get(file);
    // pdf-lib checks native Array instances; compile the pure PDF renderer in its realm.
    if (file.endsWith('receipt-pdf.ts')) {
      const native = new Module(file, module);
      native.require = name => load(name, file);
      native._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, file);
      cache.set(file, native.exports);
      return native.exports;
    }
    const exported = {}; cache.set(file, exported);
    const context = { exports: exported, require: name => load(name, file), Buffer, Uint8Array, Response, Request, URL, URLSearchParams, Date, setTimeout, clearTimeout,
      console: silentConsole, process: { env: { NODE_ENV: 'test', RAZORPAY_KEY_ID: 'fixture', RAZORPAY_KEY_SECRET: 'fixture', RAZORPAY_WEBHOOK_SECRET: 'fixture', PAYPAL_WEBHOOK_ID: 'fixture' } },
      fetch: mocks.__fetch || (() => { throw new Error('Network calls are forbidden in billing regression tests'); }), ...mocks.__globals };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText, context, { filename: file });
    return exported;
  }
  return load;
}
const load = loader();
const pricing = load('@/config/pricing');
const plans = load('@/lib/billing/plans');
const receiptData = load('@/lib/billing/receipt-data');
const receiptPdf = load('@/lib/billing/receipt-pdf');
const renewalPrice = load('@/lib/billing/renewal-price');
const orderId = '11111111-1111-4111-8111-111111111111';
const userId = 'fixture-account';
const buyer = { name: 'Alex Example', email: 'alex@example.test' };
const paidOrder = { id: orderId, userId, planId: 'creator', market: 'IN', currency: 'INR', amount: 55900, gateway: 'razorpay', credits: 2000,
  providerOrderId: 'order_fixture', providerPaymentId: 'pay_fixture', status: 'paid', createdAt: new Date('2026-10-04T07:30:00Z'),
  metadata: { receiptSnapshot: { buyerName: buyer.name, buyerEmail: buyer.email, itemName: '2,000 permanent credits', regularAmountMinor: 69900, recurring: false } } };
const transaction = { id: 'cfixturetransaction', userId, provider: 'razorpay', providerPaymentId: 'pay_fixture', providerOrderId: 'order_fixture', kind: 'credit_purchase', amount: 55900, currency: 'INR', transactionReference: 'EXM-EXAMPLE-0001', createdAt: new Date('2026-10-04T07:30:01Z'), metadata: { billingOrderId: orderId, planId: 'creator', credits: 2000 } };
const receipt = receiptData.buildBillingReceipt(transaction, paidOrder, buyer);
const req = (query) => ({ nextUrl: new URL(`https://www.exismic.xyz/api/billing/receipt${query}`) });
const auth = (current) => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: current } }) } }) });

async function main() {
  await check('credit pack bonuses are granted in the advertised totals', async () => {
    for (const pack of pricing.PRICING_CONFIG.CREDIT_PACKAGES) assert.equal(plans.getBillingPlan(pack.billingPlanId).credits, pack.credits + pack.bonusCredits);
    assert.equal(pricing.PRICING_CONFIG.CREDIT_PACKAGES.at(-1).popular, true);
    assert.equal(pricing.getAnnualSavings(true).percent, 25);
    assert.equal(pricing.getAnnualSavings(false).percent, 28);
    assert.equal(Number(pricing.getAnnualSavings(false).monthlyEquivalent.toFixed(2)), 5);
    assert.equal(plans.getBillingPlan('constructor'), null);
    const expiry = pricing.PRICING_CONFIG.V17_LAUNCH_PROMO.EXPIRES_AT;
    pricing.PRICING_CONFIG.V17_LAUNCH_PROMO.EXPIRES_AT = '2000-01-01T00:00:00Z';
    assert.equal(pricing.isExismic17PromoActive(), false); assert.equal(plans.getPlanPrice('creator', 'IN').amountMinor, 69900);
    pricing.PRICING_CONFIG.V17_LAUNCH_PROMO.EXPIRES_AT = expiry;
  });
  await check('receipts retain the recorded price, discount, customer and credit quantity', async () => {
    assert.equal(receipt.amountMinor, 55900); assert.equal(receipt.originalAmountMinor, 69900); assert.equal(receipt.discountMinor, 14000);
    assert.equal(receipt.buyerEmail, buyer.email); assert.match(receipt.description, /2,000 credits/); assert.equal(receipt.recurring, false);
    assert.equal(receiptData.buildBillingReceipt(transaction, { ...paidOrder, status: 'created' }, buyer), null);
    assert.equal(receiptData.buildBillingReceipt({ ...transaction, kind: 'failed_payment' }, paidOrder, buyer), null);
    assert.equal(receiptData.buildBillingReceipt({ ...transaction, amount: 0 }, paidOrder, buyer), null);
  });
  await check('annual renewals and one-time gifts have distinct, accurate receipts', async () => {
    const renewal = receiptData.buildBillingReceipt({ ...transaction, kind: 'pro_renewal', currency: 'USD', amount: 5999, provider: 'paypal', providerOrderId: 'I-fixture', metadata: { planId: 'pro_yearly', nextBillingTime: '2027-10-04T07:30:00Z' } }, null, buyer);
    assert.match(renewal.item, /Annual.*renewal/); assert.equal(renewal.recurring, true); assert.equal(renewal.periodEnd, '2027-10-04T07:30:00Z');
    const gift = receiptData.buildBillingReceipt({ ...transaction, kind: 'gift_pro_pass', metadata: { planId: 'pro_yearly' } }, { ...paidOrder, planId: 'pro_yearly', metadata: { isGift: true } }, buyer);
    assert.equal(gift.isGift, true); assert.equal(gift.recurring, false); assert.match(gift.description, /One-time gift purchase/);
    assert.equal(renewalPrice.expectedRenewalAmount({ ...paidOrder, planId: 'pro', amount: 39900, metadata: { receiptSnapshot: { regularAmountMinor: 49900 } } }), 49900);
    assert.equal(renewalPrice.expectedRenewalAmount({ ...paidOrder, planId: 'pro_yearly', amount: 449900, metadata: {} }), 449900);
  });

  let current = { id: userId }, rows = [transaction], order = paidOrder;
  const prisma = { paymentTransaction: { findFirst: async ({ where }) => rows.find(t => t.userId === where.userId && (!where.id || t.id === where.id) && (!where.metadata || t.metadata.billingOrderId === where.metadata.equals)) || null },
    paymentOrder: { findFirst: async ({ where }) => order && order.id === where.id && order.userId === where.userId ? order : null }, user: { findUnique: async () => buyer } };
  const protectedLoader = loader({ 'next/server': next, '@/utils/supabase/server': { createClient: async () => (await auth(current).createClient()) }, '@/lib/prisma': { prisma } });
  const receiptGet = protectedLoader('@/app/api/billing/receipt/route').GET;
  await check('receipt downloads reject signed-out users, other owners and unpaid orders', async () => {
    current = null; assert.equal((await receiptGet(req(`?transactionId=${transaction.id}`))).status, 401);
    current = { id: 'another-account' }; assert.equal((await receiptGet(req(`?transactionId=${transaction.id}`))).status, 404);
    current = { id: userId }; order = { ...paidOrder, status: 'created' }; assert.equal((await receiptGet(req(`?orderId=${orderId}`))).status, 404);
    order = paidOrder; rows = []; assert.equal((await receiptGet(req(`?orderId=${orderId}`))).status, 404);
    rows = [transaction]; assert.equal((await receiptGet(req(''))).status, 400);
    assert.equal((await receiptGet(req('?orderId=------------------------------------'))).status, 400);
  });
  await check('an owner receives a private PDF attachment only after ledger confirmation', async () => {
    const response = await receiptGet(req(`?transactionId=${transaction.id}`));
    assert.equal(response.status, 200); assert.equal(response.headers.get('content-type'), 'application/pdf');
    assert.match(response.headers.get('content-disposition'), /attachment; filename="Exismic-Receipt/);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const pdf = Buffer.from(await response.arrayBuffer()); assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert.equal((await PDFDocument.load(pdf)).getPageCount(), 1);
    const json = await (await receiptGet(req(`?orderId=${orderId}&format=json`))).json(); assert.equal(json.receipt.amountMinor, 55900);
  });
  await check('long receipt fields paginate rather than clip or block PDF downloads', async () => {
    const pdf = await receiptPdf.createReceiptPdf({ ...receipt, buyerName: 'Long customer name '.repeat(80), providerPaymentId: 'reference'.repeat(100) });
    assert.ok((await PDFDocument.load(pdf)).getPageCount() > 1);
  });

  let sends = [], emailFailure = false, diagnostics = [];
  const emailLoader = loader({ './resend': { resend: { emails: { send: async (payload, options) => { sends.push({ payload, options }); return emailFailure ? { error: { message: 'fixture failure' } } : { data: { id: 'fixture-mail' } }; } } } }, './email-diagnostics': { recordEmailEvent: value => diagnostics.push(value) } });
  const sendEmail = emailLoader('@/lib/emails').sendDownloadableReceiptEmail;
  await check('receipt emails attach the actual PDF, escape content and use a payment-specific idempotency key', async () => {
    assert.equal(await sendEmail(buyer.email, { ...receipt, item: '<script>not markup</script>' }), true);
    assert.equal(sends[0].options.idempotencyKey, `payment-receipt-v1/${transaction.id}`);
    assert.match(sends[0].payload.html, /&lt;script&gt;/); assert.doesNotMatch(sends[0].payload.html, /<script>/);
    assert.equal(sends[0].payload.attachments[0].content.subarray(0, 5).toString(), '%PDF-');
    emailFailure = true; assert.equal(await sendEmail(buyer.email, receipt), false); assert.equal(diagnostics.at(-1).success, false);
  });
  let emailCalls = 0, emailSuccess = false, deliveryTx = { ...transaction, metadata: { ...transaction.metadata } };
  const deliveryLoader = loader({ '@/lib/prisma': { prisma: { paymentTransaction: { findUnique: async () => deliveryTx, update: async ({ data }) => { deliveryTx = { ...deliveryTx, ...data }; } }, user: { findUnique: async () => buyer } } },
    '@/lib/emails': { sendDownloadableReceiptEmail: async () => { emailCalls++; return emailSuccess; } }, './receipts': { findBillingReceipt: async () => receipt } });
  const deliver = deliveryLoader('@/lib/billing/receipt-delivery').deliverBillingReceipt;
  await check('failed receipt mail stays retryable; successful delivery and wrong owners cannot send duplicates', async () => {
    assert.equal(await deliver(userId, 'pay_fixture'), false); assert.equal(deliveryTx.metadata.receiptEmailSentAt, undefined);
    emailSuccess = true; assert.equal(await deliver(userId, 'pay_fixture'), true); assert.ok(deliveryTx.metadata.receiptEmailSentAt);
    assert.equal(await deliver(userId, 'pay_fixture'), true); assert.equal(emailCalls, 2);
    assert.equal(await deliver('other', 'pay_fixture'), false); assert.equal(emailCalls, 2);
  });

  let dbOrder = { ...paidOrder, status: 'created', metadata: { ...paidOrder.metadata } }, txRows = [], grants = 0, creditLogs = 0, billingUpdates = [], userWrites = [], giftRecords = [], queue = Promise.resolve();
  const db = {
    paymentOrder: { findUnique: async () => ({ ...dbOrder }), findUniqueOrThrow: async () => ({ ...dbOrder }),
      updateMany: async ({ where, data }) => { if (where.status?.not === 'paid' && dbOrder.status === 'paid') return { count: 0 }; dbOrder = { ...dbOrder, ...data }; return { count: 1 }; },
      update: async ({ data }) => (dbOrder = { ...dbOrder, ...data }), findFirst: async () => dbOrder },
    paymentTransaction: { findFirst: async () => txRows[0], findUnique: async ({ where }) => txRows.find(t => t.providerPaymentId === where.providerPaymentId),
      upsert: async ({ create }) => { const row = { ...create, id: 'ledger-fixture', createdAt: new Date() }; txRows.push(row); return row; }, create: async ({ data }) => { txRows.push(data); return data; } },
    user: { findUnique: async () => ({ ...buyer, subscriptionId: 'sub_fixture' }), upsert: async ({ update }) => { grants += update.lifetimeCredits?.increment || 0; userWrites.push(update); }, update: async () => {} },
    promoCode: { upsert: async ({ create }) => { giftRecords.push(create); return create; } },
    userBilling: { upsert: async ({ update }) => { billingUpdates.push(update); } }, creditTransaction: { create: async () => { creditLogs++; } }, referral: { findUnique: async () => null },
  };
  db.$transaction = (run) => { const result = queue.then(() => run(db)); queue = result.catch(() => {}); return result; };
  const fulfillment = loader({ '@/lib/prisma': { prisma: db }, '@/lib/emails': { sendCreditsPurchasedEmail: async () => true, sendProWelcomeEmail: async () => true, sendProRenewalReceiptEmail: async () => true, sendPaymentFailedEmail: async () => true, sendGiftVoucherPurchasedEmail: async () => true },
    '@/lib/notifications': { createNotification: async () => {} }, '@/lib/gifts': { generateGiftCode: () => 'GIFT-FIXTURE' }, './receipt-delivery': { deliverBillingReceipt: async () => true }, '@/lib/payment-reference': { generateTransactionReference: () => 'EXM-FIXTURE' } })('@/lib/billing/fulfillment');
  await check('duplicate verified callbacks grant credits once and preserve existing membership fields', async () => {
    const results = await Promise.all([fulfillment.fulfillBillingOrder({ orderId, providerPaymentId: 'pay_fixture' }), fulfillment.fulfillBillingOrder({ orderId, providerPaymentId: 'pay_fixture' })]);
    assert.equal(grants, 2000); assert.equal(creditLogs, 1); assert.equal(txRows.length, 1); assert.equal(results.filter(r => r.alreadyProcessed).length, 1);
    assert.equal(billingUpdates[0].planId, undefined); assert.equal(billingUpdates[0].currentPeriodEnd, undefined); assert.equal(billingUpdates[0].credits.increment, 2000);
    const failure = await fulfillment.recordBillingFailure({ orderId, userId, reason: 'late failure' }); assert.equal(failure.recorded, false); assert.equal(dbOrder.status, 'paid');
  });
  await check('an annual renewal retains the annual plan and a single distinct ledger entry', async () => {
    dbOrder = { ...dbOrder, planId: 'pro_yearly', providerOrderId: 'sub_fixture' };
    const input = { userId, provider: 'razorpay', subscriptionId: 'sub_fixture', providerPaymentId: 'pay_renewal', amount: 449900, currency: 'INR', periodEnd: new Date('2027-10-04T07:30:00Z') };
    await fulfillment.fulfillProRenewal(input); await fulfillment.fulfillProRenewal(input);
    assert.equal(txRows.filter(t => t.providerPaymentId === 'pay_renewal').length, 1); assert.equal(billingUpdates.at(-1).planId, 'pro_yearly');
    assert.equal(txRows.at(-1).metadata.planId, 'pro_yearly');
  });

  await check('all three purchased credit packs grant exactly their advertised permanent totals', async () => {
    for (const [planId, expected] of [['starter', 500], ['creator', 2000], ['ultimate', 6000]]) {
      grants = 0; userWrites = []; txRows = []; billingUpdates = [];
      dbOrder = { ...paidOrder, planId, credits: plans.getBillingPlan(planId).credits, status: 'created', metadata: {} };
      await fulfillment.fulfillBillingOrder({ orderId, providerPaymentId: `pay_${planId}` });
      assert.equal(grants, expected); assert.equal(userWrites[0].plan, undefined); assert.equal(userWrites[0].bonusCredits, undefined);
      assert.equal(txRows.length, 1); assert.equal(txRows[0].kind, 'credit_purchase'); assert.equal(txRows[0].metadata.credits, expected);
    }
  });
  await check('monthly and annual purchases activate Pro with 500 daily credits and preserve permanent balances', async () => {
    const from = new Date(), periods = loader()('@/lib/billing/period');
    for (const [planId, interval] of [['pro', 'month'], ['pro_yearly', 'year']]) {
      grants = 0; userWrites = []; txRows = []; billingUpdates = [];
      dbOrder = { ...paidOrder, planId, credits: 500, status: 'created', metadata: {} };
      const end = periods.addMembershipPeriod(from, interval);
      await fulfillment.fulfillBillingOrder({ orderId, providerPaymentId: `pay_${planId}`, periodEnd: end });
      assert.equal(grants, 0); assert.equal(userWrites[0].plan, 'pro'); assert.equal(userWrites[0].dailyCredits, 500);
      assert.equal(userWrites[0].lifetimeCredits, undefined); assert.equal(userWrites[0].bonusCredits, undefined);
      assert.equal(userWrites[0].planExpiresAt.getTime(), end.getTime()); assert.equal(billingUpdates[0].planId, planId);
      assert.equal(txRows[0].kind, 'pro_subscription');
    }
    assert.equal(periods.addMembershipPeriod(new Date('2026-01-31T12:00:00Z'), 'month').toISOString(), '2026-02-28T12:00:00.000Z');
    assert.equal(periods.addMembershipPeriod(new Date('2028-02-29T12:00:00Z'), 'year').toISOString(), '2029-02-28T12:00:00.000Z');
  });
  await check('gift purchases create one-use vouchers without granting the buyer or duplicating on retries', async () => {
    for (const [planId, expected] of [['starter', 500], ['creator', 2000], ['ultimate', 6000], ['pro', 0], ['pro_yearly', 0]]) {
      grants = 0; userWrites = []; txRows = []; giftRecords = [];
      dbOrder = { ...paidOrder, planId, credits: plans.getBillingPlan(planId).credits, status: 'created', metadata: { isGift: true } };
      const input = { orderId, providerPaymentId: `gift_${planId}` };
      const first = await fulfillment.fulfillBillingOrder(input), repeat = await fulfillment.fulfillBillingOrder(input);
      assert.equal(grants, 0); assert.equal(userWrites.length, 0); assert.equal(giftRecords.length, 1);
      assert.equal(giftRecords[0].bonusCredits, expected); assert.equal(giftRecords[0].maxRedemptions, 1); assert.ok(giftRecords[0].expiresAt > new Date());
      assert.equal(repeat.giftCode, first.giftCode); assert.equal(repeat.alreadyProcessed, true); assert.equal(txRows.length, 1);
      const giftReceipt = receiptData.buildBillingReceipt(txRows[0], dbOrder, buyer);
      assert.equal(giftReceipt.giftCode, first.giftCode); assert.equal(giftReceipt.recurring, false); assert.equal(giftReceipt.periodEnd, null);
    }
  });

  let redeemUser = { id: 'recipient' }, promo, account, redemptions, redeemLogs, notificationFailure = false;
  function award(data) { for (const [key, value] of Object.entries(data)) { if (value?.increment !== undefined) account[key] = (account[key] || 0) + value.increment; else account[key] = value; } }
  const redeemDb = { promoCode: { findUnique: async () => promo, updateMany: async ({ where }) => { if (promo.redemptionCount >= where.redemptionCount.lt) return { count: 0 }; promo.redemptionCount++; return { count: 1 }; } },
    promoRedemption: { findUnique: async ({ where }) => redemptions.find(r => r.userId === where.promoId_userId.userId) || null, create: async ({ data }) => redemptions.push(data) },
    user: { findUnique: async () => account, update: async ({ data }) => { award(data); return account; } }, userBilling: { upsert: async () => {} }, creditTransaction: { create: async ({ data }) => redeemLogs.push(data) } };
  redeemDb.$transaction = run => run(redeemDb);
  const redeem = loader({ 'next/server': next, '@/lib/prisma': { prisma: redeemDb }, '@/utils/supabase/server': { createClient: async () => (await auth(redeemUser).createClient()) },
    '@/lib/notifications': { createNotification: async () => { if (notificationFailure) throw new Error('fixture notification outage'); } } })('@/app/api/user/promos/redeem/route').POST;
  function resetVoucher(code, credits) { promo = { id: 'promo', code, bonusCredits: credits, maxRedemptions: 1, redemptionCount: 0, expiresAt: new Date('2030-01-01') }; account = { plan: 'free', dailyCredits: 50, bonusCredits: 7, lifetimeCredits: 90, planExpiresAt: null }; redemptions = []; redeemLogs = []; }
  const redeemRequest = (verifyOnly = false) => ({ json: async () => ({ code: promo.code, verifyOnly }) });
  await check('paid credit vouchers redeem exactly once into permanent credits, never double balances', async () => {
    for (const credits of [500, 2000, 6000]) {
      resetVoucher(`GIFT-${credits}CR-AAAA-BBBB`, credits);
      assert.equal((await redeem(redeemRequest(true))).status, 200); assert.equal(promo.redemptionCount, 0);
      assert.equal((await redeem(redeemRequest())).status, 200); assert.equal(account.lifetimeCredits, 90 + credits); assert.equal(account.bonusCredits, 7);
      assert.equal(redeemLogs[0].balanceType, 'permanent'); assert.equal(redeemLogs[0].amount, credits);
      assert.equal((await redeem(redeemRequest())).status, 400); assert.equal(account.lifetimeCredits, 90 + credits);
    }
    resetVoucher('GIFT-500CR-AAAA-BBBB', 500); notificationFailure = true;
    assert.equal((await redeem(redeemRequest())).status, 200); assert.equal(account.lifetimeCredits, 590); notificationFailure = false;
    resetVoucher('REWARD-500-AAAA', 500); assert.equal((await redeem(redeemRequest())).status, 200); assert.equal(account.bonusCredits, 507); assert.equal(account.lifetimeCredits, 90);
  });
  await check('monthly and annual Pro gifts start on redemption, preserve balances and reject expired/used vouchers', async () => {
    const periods = loader()('@/lib/billing/period');
    for (const [code, interval] of [['GIFT-PRO30-AAAA-BBBB', 'month'], ['GIFT-PRO365-AAAA-BBBB', 'year']]) {
      resetVoucher(code, 0); const before = periods.addMembershipPeriod(new Date(), interval);
      assert.equal((await redeem(redeemRequest())).status, 200); const after = periods.addMembershipPeriod(new Date(), interval);
      assert.equal(account.plan, 'pro'); assert.equal(account.dailyCredits, 500); assert.equal(account.lifetimeCredits, 90); assert.equal(account.bonusCredits, 7);
      assert.ok(account.planExpiresAt >= before && account.planExpiresAt <= after); assert.equal((await redeem(redeemRequest())).status, 400);
    }
    resetVoucher('GIFT-PRO30-AAAA-BBBB', 0); promo.expiresAt = new Date('2000-01-01');
    assert.equal((await redeem(redeemRequest())).status, 400); assert.equal(account.plan, 'free'); assert.equal(promo.redemptionCount, 0);
    resetVoucher('GIFT-PRO30-AAAA-BBBB', 0); redeemUser = null; assert.equal((await redeem(redeemRequest())).status, 401); redeemUser = { id: 'recipient' };
    assert.equal((await redeem({ json: async () => ({ code: 123 }) })).status, 400);
    resetVoucher('GIFT-PRO30-AAAA-BBBB', 0); account.subscriptionId = 'sub_fixture'; account.subscriptionStatus = 'active';
    assert.equal((await redeem(redeemRequest())).status, 409); assert.equal(promo.redemptionCount, 0); assert.equal(redemptions.length, 0);
    account.subscriptionStatus = 'cancelled'; account.planExpiresAt = new Date('2030-01-15T12:00:00Z');
    assert.equal((await redeem(redeemRequest())).status, 200); assert.equal(account.planExpiresAt.toISOString(), '2030-02-15T12:00:00.000Z');
    assert.equal(account.subscriptionId, null);
  });

  await check('Pro daily reset restores 500 while preserving purchased and redeemed permanent credits', async () => {
    account = { ...account, plan: 'pro', planExpiresAt: new Date('2030-01-01'), dailyCredits: 12, bonusCredits: 0, lifetimeCredits: 2090, creditsLastReset: new Date('2000-01-01') };
    const fakePrismaTypes = { Prisma: { PrismaClientKnownRequestError: class extends Error {}, TransactionIsolationLevel: { Serializable: 'Serializable' } } };
    const credits = loader({ './prisma': { prisma: redeemDb }, '@prisma/client': fakePrismaTypes })('@/lib/credits');
    await credits.resetCreditsIfNewDay('recipient'); assert.equal(account.dailyCredits, 500); assert.equal(account.lifetimeCredits, 2090);
    account.planExpiresAt = new Date('2000-01-01'); await credits.resetCreditsIfNewDay('recipient'); assert.equal(account.dailyCredits, 50); assert.equal(account.plan, 'free'); assert.equal(account.lifetimeCredits, 2090);
  });

  let fulfillCalls = 0, subscription = { status: 'ACTIVE', custom_id: 'fixture', billing_info: { next_billing_time: '2026-11-04T07:30:00Z' } };
  const activation = loader({ 'next/server': next, '@/utils/supabase/server': auth({ id: userId, email: buyer.email }), '@/lib/prisma': { prisma: { paymentTransaction: { findUnique: async () => null }, paymentOrder: { findFirst: async () => ({ ...paidOrder, planId: 'pro', amount: 559, currency: 'USD' }) } } },
    '@/lib/paypal': { getPayPalSubscription: async () => subscription, parsePayPalCustomId: () => ({ userId, plan: 'pro', currency: 'USD', tierId: 'pro' }) },
    '@/lib/billing/fulfillment': { fulfillBillingOrder: async () => { fulfillCalls++; return { alreadyProcessed: false }; } }, '@/lib/billing/receipt-delivery': { deliverBillingReceipt: async () => true } })('@/app/api/paypal/subscription/activate/route').POST;
  await check('PayPal ACTIVE without a matching last payment never activates or issues a receipt', async () => {
    assert.equal((await activation({ json: async () => ({ subscriptionId: 'I-fixture' }) })).status, 400); assert.equal(fulfillCalls, 0);
    subscription.billing_info.last_payment = { amount: { value: '6.99', currency_code: 'USD' } };
    assert.equal((await activation({ json: async () => ({ subscriptionId: 'I-fixture' }) })).status, 400); assert.equal(fulfillCalls, 0);
    subscription.billing_info.last_payment.amount.value = '5.59';
    assert.equal((await activation({ json: async () => ({ subscriptionId: 'I-fixture' }) })).status, 200); assert.equal(fulfillCalls, 1);
  });

  let orderCreations = [], oneTime = 0, recurring = 0;
  const createOrder = loader({ 'next/server': next, 'razorpay': class {}, '@/utils/supabase/server': auth({ id: userId, email: buyer.email }),
    '@/lib/prisma': { prisma: { user: { findUnique: async () => ({ ...buyer, plan: 'free' }) }, paymentOrder: { count: async () => 0, findFirst: async () => null,
      create: async ({ data }) => { orderCreations.push(data); return { id: orderId, ...data }; }, update: async () => {} } } },
    '@/lib/geo/getUserCountry': { resolveMarket: () => ({ market: 'GLOBAL', countryCode: 'US' }) }, '@/lib/user-access': { hasActiveProAccess: () => false },
    '@/lib/billing/launch-discount': { checkUserLaunchDiscountEligibility: async () => ({ eligible: true }) },
    '@/lib/paypal': { createPayPalOrder: async () => { oneTime++; return { order: { id: 'ORDER-fixture' }, approvalUrl: 'https://paypal.test/approve' }; }, createPayPalSubscription: async () => { recurring++; return { subscription: { id: 'I-fixture' }, approvalUrl: 'https://paypal.test/approve' }; } } })('@/app/api/billing/create-order/route').POST;
  await check('PayPal gift Pro passes use one-time orders; personal Pro uses subscriptions and snapshots', async () => {
    const request = (isGift) => ({ nextUrl: new URL('https://www.exismic.xyz/api/billing/create-order'), json: async () => ({ planId: 'pro_yearly', isGift }) });
    assert.equal((await createOrder(request(true))).status, 200); assert.equal(oneTime, 1); assert.equal(recurring, 0); assert.equal(orderCreations[0].metadata.receiptSnapshot.recurring, false);
    assert.equal((await createOrder(request(false))).status, 200); assert.equal(recurring, 1); assert.equal(orderCreations[1].metadata.receiptSnapshot.regularAmountMinor, 5999);
  });
  let payment = { status: 'captured', amount: 55900, currency: 'INR', order_id: 'order_fixture' }, invalidUpdates = 0, verifiedCalls = 0;
  const verify = loader({ 'next/server': next, '@/utils/supabase/server': auth({ id: userId }),
    'razorpay': class { payments = { fetch: async () => payment }; },
    '@/lib/prisma': { prisma: { paymentOrder: { findFirst: async () => paidOrder, updateMany: async ({ where }) => { assert.equal(where.status.not, 'paid'); invalidUpdates++; return { count: 0 }; } } } },
    '@/lib/billing/fulfillment': { fulfillBillingOrder: async () => { verifiedCalls++; return { alreadyProcessed: false }; } } })('@/app/api/billing/razorpay/verify/route').POST;
  await check('Razorpay requires valid signatures, captured matching amounts and cannot overwrite paid orders', async () => {
    const body = { razorpay_order_id: 'order_fixture', razorpay_payment_id: 'pay_fixture', razorpay_signature: 'invalid' };
    assert.equal((await verify({ json: async () => body })).status, 400); assert.equal(invalidUpdates, 1); assert.equal(verifiedCalls, 0);
    body.razorpay_signature = crypto.createHmac('sha256', 'fixture').update('order_fixture|pay_fixture').digest('hex');
    payment = { ...payment, status: 'authorized' }; assert.equal((await verify({ json: async () => body })).status, 400);
    payment = { ...payment, status: 'captured', amount: 1 }; assert.equal((await verify({ json: async () => body })).status, 400);
    payment = { ...payment, amount: 55900 }; assert.equal((await verify({ json: async () => body })).status, 200); assert.equal(verifiedCalls, 1);
  });
  let historyUser = { id: userId }, cursorWheres = [];
  const historyRows = Array.from({ length: 35 }, (_, i) => ({ ...transaction, id: `cfixture${String(35 - i).padStart(3, '0')}`, metadata: { planId: 'creator', credits: 2000 }, createdAt: new Date('2026-10-04T07:30:01Z') }));
  const history = loader({ 'next/server': next, '@/utils/supabase/server': { createClient: async () => (await auth(historyUser).createClient()) },
    '@/lib/prisma': { prisma: { paymentTransaction: { findMany: async ({ where, take }) => { cursorWheres.push(where); assert.equal(where.userId, historyUser.id); const bound = where.OR?.find(v => v.id)?.id.lt; return historyUser.id === userId ? historyRows.filter(t => !bound || t.id < bound).slice(0, take) : []; } },
      paymentOrder: { findMany: async ({ where }) => { assert.equal(where.userId, historyUser.id); return []; } }, user: { findUnique: async () => buyer } } } })('@/app/api/billing/purchases/route').GET;
  await check('private purchase history paginates tied dates without leaking another account’s rows', async () => {
    historyUser = null; assert.equal((await history(req(''))).status, 401);
    historyUser = { id: userId }; const firstResponse = await history(req('')); assert.equal(firstResponse.headers.get('cache-control'), 'private, no-store');
    const first = await firstResponse.json(); assert.equal(first.purchases.length, 30); assert.ok(first.nextCursor);
    const second = await (await history(req(`?before=${encodeURIComponent(first.nextCursor)}`))).json(); assert.equal(second.purchases.length, 5); assert.equal(second.nextCursor, null);
    assert.equal(new Set([...first.purchases, ...second.purchases].map(p => p.id)).size, 35);
    historyUser = { id: 'different-account' }; assert.equal((await (await history(req(''))).json()).purchases.length, 0);
    assert.equal((await history(req('?before=invalid'))).status, 400);
  });
  let membershipOrder = { ...paidOrder, planId: 'pro_yearly', amount: 449900, metadata: {} };
  const membership = loader({ 'next/server': next, '@/utils/supabase/server': auth({ id: userId }),
    '@/lib/prisma': { prisma: { user: { findUnique: async ({ where }) => { assert.equal(where.id, userId); return { subscriptionId: 'sub_fixture', subscriptionStatus: 'active', planExpiresAt: '2027-10-04T07:30:00Z' }; } },
      userBilling: { findUnique: async ({ where }) => { assert.equal(where.userId, userId); return { planId: 'starter' }; } },
      paymentOrder: { findFirst: async ({ where }) => { assert.equal(where.userId, userId); return membershipOrder; } } } } })('@/app/api/billing/membership/route').GET;
  await check('membership details use the actual annual plan and standard renewal price after a discounted payment', async () => {
    const annual = await (await membership()).json(); assert.equal(annual.interval, 'year'); assert.equal(annual.amountMinor, 449900); assert.equal(annual.recurring, true);
    membershipOrder = { ...paidOrder, planId: 'pro', amount: 39900, metadata: {} };
    const monthly = await (await membership()).json(); assert.equal(monthly.interval, 'month'); assert.equal(monthly.amountMinor, 49900);
  });
  let webhookOrder = { ...paidOrder, planId: 'pro', amount: 39900, providerOrderId: 'sub_fixture', providerPaymentId: 'pay_first', metadata: { receiptSnapshot: { regularAmountMinor: 49900 } } };
  let renewals = [], initialPayments = [], statusUpdates = [];
  const webhookDb = { paymentOrder: { findFirst: async () => webhookOrder }, paymentTransaction: { findUnique: async () => null },
    paymentEvent: { create: async () => {}, updateMany: async () => {} },
    user: { findMany: async ({ where }) => { assert.ok(where.planExpiresAt.gt); return []; }, updateMany: async ({ data }) => { statusUpdates.push(data); } },
    userBilling: { updateMany: async ({ data }) => { assert.equal(data.planId, undefined); assert.equal(data.currentPeriodEnd, undefined); } } };
  const webhookFulfillment = { fulfillBillingOrder: async value => { initialPayments.push(value); return { alreadyProcessed: false }; }, fulfillProRenewal: async value => { renewals.push(value); return { alreadyProcessed: false }; } };
  const razorpayWebhook = loader({ 'next/server': next, 'razorpay': class {}, '@/lib/prisma': { prisma: webhookDb }, '@/lib/billing/fulfillment': webhookFulfillment, '@/lib/emails': {} })('@/app/api/webhooks/razorpay/route').POST;
  async function razorpayEvent(amount, event = 'subscription.charged', signatureValid = true) {
    const body = JSON.stringify({ event, payload: { payment: { entity: { id: 'pay_renewal', subscription_id: 'sub_fixture', amount, currency: 'INR' } }, subscription: { entity: { id: 'sub_fixture' } } } });
    return razorpayWebhook({ text: async () => body, headers: new Headers({ 'x-razorpay-signature': signatureValid ? crypto.createHmac('sha256', 'fixture').update(body).digest('hex') : 'invalid' }) });
  }
  await check('signed Razorpay webhooks accept normal-price monthly and annual renewals after discounted first charges', async () => {
    assert.equal((await razorpayEvent(49900, 'subscription.charged', false)).status, 401);
    assert.equal((await (await razorpayEvent(49900)).json()).processed, true); assert.equal(renewals.at(-1).amount, 49900); assert.equal(initialPayments.length, 0);
    assert.equal((await (await razorpayEvent(39900)).json()).processed, false); assert.equal(renewals.length, 1);
    webhookOrder = { ...webhookOrder, planId: 'pro_yearly', amount: 449900, metadata: { receiptSnapshot: { regularAmountMinor: 449900 } } };
    assert.equal((await (await razorpayEvent(449900)).json()).processed, true); assert.equal(renewals.at(-1).periodEnd.getFullYear(), new Date().getFullYear() + 1);
  });
  await check('Razorpay activation cannot extend access or replace an annual billing cycle without a charge', async () => {
    await razorpayEvent(0, 'subscription.activated'); assert.equal(statusUpdates.at(-1).planExpiresAt, undefined); assert.equal(renewals.length, 2);
  });

  let signatureOk = true, paypalInfo = { billing_info: { next_billing_time: '2026-11-04T07:30:00Z' } }, paidThrough = new Date('2026-11-04T07:30:00Z'), accountWrites = [];
  let currentSubscription = 'I-fixture';
  const paypalDb = { ...webhookDb, user: { findUnique: async () => ({ planExpiresAt: paidThrough, subscriptionId: currentSubscription }), update: async ({ data }) => { accountWrites.push(data); } },
    userBilling: { upsert: async () => {} } };
  paypalDb.$transaction = run => run(paypalDb);
  const paypalWebhook = loader({ 'next/server': next, '@/lib/prisma': { prisma: paypalDb }, '@/lib/billing/fulfillment': webhookFulfillment, '@/lib/emails': {},
    '@/lib/paypal': { getPayPalAccessToken: async () => 'fixture-token', getPayPalApiBase: () => 'https://paypal.fixture.invalid', getPayPalSubscription: async () => paypalInfo },
    __fetch: async url => { assert.equal(url, 'https://paypal.fixture.invalid/v1/notifications/verify-webhook-signature'); return { ok: true, json: async () => ({ verification_status: signatureOk ? 'SUCCESS' : 'FAILURE' }) }; } })('@/app/api/webhooks/paypal/route').POST;
  const paypalEvent = (type, resource) => paypalWebhook({ json: async () => ({ id: 'event-fixture', event_type: type, resource }), headers: new Headers() });
  webhookOrder = { ...paidOrder, planId: 'pro', gateway: 'paypal', providerOrderId: 'I-fixture', amount: 559, currency: 'USD', metadata: { nextBillingTime: '2026-11-04T07:30:00Z', receiptSnapshot: { regularAmountMinor: 699 } } };
  await check('PayPal activation without money does not grant access or issue a receipt', async () => {
    webhookOrder.status = 'created'; initialPayments = []; renewals = [];
    const pending = await (await paypalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-fixture' })).json();
    assert.equal(pending.processed, false); assert.equal(initialPayments.length, 0); assert.equal(accountWrites.length, 0);
    paypalInfo.billing_info.last_payment = { amount: { value: '5.59', currency_code: 'USD' } };
    assert.equal((await (await paypalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-fixture' })).json()).processed, true); assert.equal(initialPayments.length, 1);
  });
  await check('PayPal first-cycle sale callbacks reuse the initial purchase; later charges become renewals', async () => {
    webhookOrder.status = 'paid'; initialPayments = []; renewals = [];
    const resource = { id: 'capture-fixture', billing_agreement_id: 'I-fixture', amount: { total: '5.59', currency: 'USD' } };
    assert.equal((await (await paypalEvent('PAYMENT.SALE.COMPLETED', resource)).json()).processed, true); assert.equal(initialPayments.length, 1); assert.equal(renewals.length, 0);
    paypalInfo.billing_info.next_billing_time = '2026-12-04T07:30:00Z'; resource.amount.total = '6.99';
    assert.equal((await (await paypalEvent('PAYMENT.SALE.COMPLETED', resource)).json()).processed, true); assert.equal(renewals.length, 1); assert.equal(renewals[0].amount, 699);
    delete resource.amount.currency; assert.equal((await (await paypalEvent('PAYMENT.SALE.COMPLETED', resource)).json()).processed, false); assert.equal(renewals.length, 1);
  });
  await check('PayPal reactivation preserves the already-paid period and cannot revive expired access', async () => {
    assert.equal((await (await paypalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-fixture' })).json()).processed, true);
    assert.equal(accountWrites.at(-1).planExpiresAt.getTime(), paidThrough.getTime());
    paidThrough = new Date('2000-01-01T00:00:00Z'); const writes = accountWrites.length;
    assert.equal((await (await paypalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-fixture' })).json()).processed, false); assert.equal(accountWrites.length, writes);
    currentSubscription = null; paidThrough = new Date('2030-01-01');
    assert.equal((await (await paypalEvent('BILLING.SUBSCRIPTION.ACTIVATED', { id: 'I-fixture' })).json()).processed, false); assert.equal(accountWrites.length, writes);
    currentSubscription = 'I-fixture';
  });
  await check('PayPal capture webhooks require a matching amount, currency and verified signature', async () => {
    webhookOrder = { ...paidOrder, gateway: 'paypal', amount: 319, currency: 'USD', status: 'created' };
    const resource = { id: 'capture-credit', supplementary_data: { related_ids: { order_id: 'order_fixture' } }, amount: { value: '0.01', currency_code: 'USD' } };
    const initialCount = initialPayments.length;
    assert.equal((await (await paypalEvent('PAYMENT.CAPTURE.COMPLETED', resource)).json()).processed, false); assert.equal(initialPayments.length, initialCount);
    resource.amount.value = '3.19'; assert.equal((await (await paypalEvent('PAYMENT.CAPTURE.COMPLETED', resource)).json()).processed, true); assert.equal(initialPayments.length, initialCount + 1);
    signatureOk = false; assert.equal((await paypalEvent('PAYMENT.CAPTURE.COMPLETED', resource)).status, 401);
  });
  await check('third-party gift-card submissions are closed with a clear explanation', async () => {
    const post = loader({ 'next/server': next })('@/app/api/checkout/gift-card/submit/route').POST;
    assert.equal((await post()).status, 410);
  });
  await check('PayPal one-time capture is owned, completed and amount-matched before any grants', async () => {
    let captureUser = { id: userId }, parsedCapture = { status: 'PENDING', currency: 'USD', amount: 3.19, captureId: 'capture-fixture' }, calls = 0;
    const ownedOrder = { ...paidOrder, gateway: 'paypal', status: 'created', currency: 'USD', amount: 319 };
    const capture = loader({ 'next/server': next, '@/utils/supabase/server': { createClient: async () => (await auth(captureUser).createClient()) },
      '@/lib/prisma': { prisma: { paymentOrder: { findFirst: async () => ownedOrder } } },
      '@/lib/paypal': { capturePayPalOrder: async () => ({}), getPayPalCapture: () => parsedCapture }, '@/lib/billing/receipt-delivery': { deliverBillingReceipt: async () => true },
      '@/lib/billing/fulfillment': { fulfillBillingOrder: async () => { calls++; return { alreadyProcessed: false }; } } })('@/app/api/billing/paypal/capture/route').POST;
    const request = { json: async () => ({ paypalOrderId: 'order_fixture' }) };
    captureUser = null; assert.equal((await capture(request)).status, 401); captureUser = { id: 'other' }; assert.equal((await capture(request)).status, 404);
    captureUser = { id: userId }; assert.equal((await capture(request)).status, 400); assert.equal(calls, 0);
    parsedCapture.status = 'COMPLETED'; parsedCapture.amount = 0.01; assert.equal((await capture(request)).status, 400); assert.equal(calls, 0);
    parsedCapture.amount = 3.19; parsedCapture.currency = 'INR'; assert.equal((await capture(request)).status, 400); assert.equal(calls, 0);
    parsedCapture.currency = 'USD'; assert.equal((await capture(request)).status, 200); assert.equal(calls, 1);
  });
  await check('the unsupported retention offer cannot claim a real provider discount', async () => {
    const response = await loader({ 'next/server': next })('@/app/api/payments/apply-retention-discount/route').POST();
    assert.equal(response.status, 410); assert.equal((await response.json()).success, false);
  });
  await check('cancellation preserves paid annual access and cannot succeed when the provider rejects it', async () => {
    let account = { id: userId, email: buyer.email, plan: 'pro', subscriptionStatus: 'active', subscriptionId: 'sub_fixture', planExpiresAt: new Date('2027-10-04T07:30:00Z') }, reject = true, writes = 0;
    const cancellation = loader({ 'next/server': next, '@/utils/supabase/server': auth({ id: userId, email: buyer.email }),
      'razorpay': class { subscriptions = { cancel: async () => { if (reject) throw new Error('fixture provider outage'); return { current_end: new Date('2026-11-04T07:30:00Z').getTime() / 1000, end_at: new Date('2030-01-01').getTime() / 1000 }; } }; },
      '@/lib/notifications': { createNotification: async () => {} }, '@/lib/prisma': { prisma: { user: { findUnique: async () => account, update: async ({ data }) => { writes++; account = { ...account, ...data }; return account; } },
        paymentOrder: { findFirst: async ({ where }) => { assert.ok(where.planId.in.includes('pro_yearly')); assert.equal(where.userId, userId); return { gateway: 'razorpay', planId: 'pro_yearly' }; } }, userBilling: { upsert: async () => {} } } }, '@/lib/paypal': {} })('@/app/api/payments/cancel/route').POST;
    assert.equal((await cancellation()).status, 502); assert.equal(writes, 0); assert.equal(account.subscriptionStatus, 'active');
    reject = false; const response = await (await cancellation()).json(); assert.equal(response.success, true); assert.equal(response.expiryDate, '2027-10-04T07:30:00.000Z'); assert.equal(account.plan, 'pro');
    const previousWrites = writes; assert.equal((await cancellation()).status, 200); assert.equal(writes, previousWrites);
  });

  const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
  const receiptButton = () => React.createElement('button', null, 'Download PDF receipt');
  const link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
  const tick = () => new Promise(resolve => setImmediate(resolve));
  await check('the real confirmation screen shows checking, verified success, pending and unconfirmed states accurately', async () => {
    async function scenario(query, responses) {
      let state = [], cursor = 0, effects = [], fetches = [];
      const hooks = { ...React, useState: initial => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; }, useEffect: effect => effects.push(effect) };
      const Page = loader({ react: hooks, 'next/link': link, 'next/navigation': { useSearchParams: () => new URLSearchParams(query) }, '@/components/billing/ReceiptDownload': { ReceiptDownload: receiptButton },
        __fetch: async url => { fetches.push(url); const response = responses.shift(); assert.ok(response, 'unexpected extra request'); return Response.json(response.body, { status: response.status || 200 }); } })('@/app/billing/success/page.tsx').default;
      const render = () => { cursor = 0; effects = []; return renderToStaticMarkup(Page()); };
      const initial = render(); assert.match(initial, /Confirming your payment/); assert.doesNotMatch(initial, /Payment confirmed|Download PDF receipt/);
      effects[0](); await tick(); await tick(); return { html: render(), fetches };
    }
    const success = await scenario(`order=${orderId}`, [{ body: { receipt } }]);
    assert.match(success.html, /Payment confirmed/); assert.match(success.html, /2,000 permanent credits/); assert.match(success.html, /559\.00/); assert.match(success.html, /Download PDF receipt/);
    const pending = await scenario(`order=${orderId}`, [{ status: 404, body: { error: 'Your payment has not been confirmed yet.' } }]);
    assert.match(pending.html, /Payment needs attention/); assert.match(pending.html, /before paying again/); assert.match(pending.html, /Check again/); assert.doesNotMatch(pending.html, /Payment confirmed|Download PDF receipt/);
    const noProof = await scenario('payment=success', []); assert.equal(noProof.fetches.length, 0); assert.match(noProof.html, /No confirmed purchase/); assert.doesNotMatch(noProof.html, /Payment confirmed/);
    const paypalPending = await scenario('gateway=paypal&subscription_id=I-fixture', [{ status: 400, body: { error: 'Payment confirmation is still pending.' } }]);
    assert.equal(paypalPending.fetches.length, 1); assert.doesNotMatch(paypalPending.html, /Download PDF receipt|Payment confirmed/);
    const gift = await scenario(`order=${orderId}`, [{ body: { receipt: { ...receipt, isGift: true, giftCode: 'GIFT-2000CR-AAAA-BBBB' } } }]);
    assert.match(gift.html, /GIFT-2000CR-AAAA-BBBB/); assert.match(gift.html, /Open redemption link/);
  });
  const uiMocks = { react: { ...React, useEffect() {} }, 'framer-motion': { AnimatePresence: ({ children }) => children, motion: new Proxy({}, { get: (_, tag) => ({ children, initial, animate, exit, transition, ...props }) => React.createElement(tag, props, children) }) },
    '@/components/ui/Portal': { Portal: ({ children }) => children }, '@/components/ui/GradientText': ({ children }) => React.createElement('span', null, children),
    'canvas-confetti': () => {} };
  await check('success and failure modals offer receipts or safe recovery without falsely promising no bank charge', async () => {
    const ui = loader(uiMocks), Failure = ui('@/components/modals/PaymentFailureModal.tsx').PaymentFailureModal, Success = ui('@/components/modals/PaymentSuccessModal.tsx').PaymentSuccessModal;
    const failed = renderToStaticMarkup(Failure({ isOpen: true, onClose() {}, onRetry() {}, reason: 'Provider declined the payment.' }));
    uiFixtures.failure = failed;
    assert.match(failed, /Payment.*Failed/); assert.match(failed, /check purchase history before paying again/); assert.match(failed, /Get billing help/); assert.doesNotMatch(failed, /No charge was completed|Download PDF receipt/);
    const paid = renderToStaticMarkup(Success({ isOpen: true, onClose() {}, type: 'credits', amount: 2000, orderId }));
    uiFixtures.success = paid;
    assert.match(paid, /2,000/); assert.match(paid, /Download receipt \(PDF\)/);
  });
  await check('membership management shows the actual annual price and verifies cancellation before claiming it', async () => {
    let state = [{ interval: 'year', recurring: true, status: 'active', periodEnd: '2027-10-04T07:30:00Z', amountMinor: 449900, currency: 'INR' }, '', false, false], cursor = 0, newStatus = 'active';
    const hooks = { ...React, useEffect() {}, useRef: () => ({ current: null }), useState: initial => { const index = cursor++; if (!(index in state)) state[index] = initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; } };
    const Manage = loader({ react: hooks, 'next/link': link, '@/components/ui/Portal': { Portal: ({ children }) => children },
      __fetch: async () => Response.json({ ...state[0], status: newStatus }) })('@/components/tool/ManageSubscriptionModal.tsx').ManageSubscriptionModal;
    const tree = () => { cursor = 0; return Manage({ isOpen: true, onClose() {}, user: null, onCancel: async () => {}, isCancelling: false }); };
    function button(node, text) { if (!node || typeof node !== 'object') return null; if (node.type === 'button' && node.props.children === text) return node; const children = node.props?.children; for (const child of Array.isArray(children) ? children.flat(Infinity) : [children]) { const match = button(child, text); if (match) return match; } return null; }
    let html = renderToStaticMarkup(tree()); assert.match(html, /Annual subscription/); assert.match(html, /4,499\.00/); assert.doesNotMatch(html, /30%|discount applied/);
    uiFixtures.membership = html;
    button(tree(), 'Cancel future renewals').props.onClick(); button(tree(), 'Confirm cancellation').props.onClick(); await tick(); await tick();
    html = renderToStaticMarkup(tree()); assert.match(html, /Cancellation has not been confirmed/); assert.doesNotMatch(html, /Future renewals are cancelled/);
    newStatus = 'cancelled'; button(tree(), 'Confirm cancellation').props.onClick(); await tick(); await tick();
    html = renderToStaticMarkup(tree()); assert.match(html, /Future renewals are cancelled/); assert.doesNotMatch(html, /Cancellation has not been confirmed/);
  });
  await check('a confirmed payment remains successful if balance refresh fails; verification delays recover without another charge', async () => {
    const file = path.join(root, 'src/components/credits/BuyCreditsModal.tsx');
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let checkout; function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'handleCheckoutPlan') checkout = node.initializer.getText(source); ts.forEachChild(node, visit); } visit(source); assert.ok(checkout);
    const compiled = ts.transpileModule(`exports.start = ${checkout}`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
    let callback, failed = false, succeeded = false, destinations = [], verifyMode = 'confirmed';
    const values = { exports: {}, isIndia: true, setErrorMessage() {}, setLoadingId() {}, setSuccessType() {}, setSuccessCredits() {}, setSuccessOrderId() {}, setShowSuccess: value => { succeeded = value; }, setFailureReason() {}, setShowFailure: value => { failed = value; },
      refreshCredits: async () => { throw new Error('fixture refresh outage'); }, window: { location: { assign: value => destinations.push(value) } },
      loadRazorpayCheckout: async () => class { constructor(options) { callback = options.handler; } on() {} open() {} },
      fetch: async url => url.includes('create-order') ? Response.json({ success: true, gateway: 'razorpay', orderId, razorpayOrderId: 'order_fixture' }) : verifyMode === 'network' ? Promise.reject(new Error('fixture network outage')) : Response.json({ success: verifyMode === 'confirmed', orderId }, { status: verifyMode === 'confirmed' ? 200 : 503 }) };
    vm.runInNewContext(compiled, values);
    await values.exports.start('creator', 'Creator', 2000, 'credits'); await callback({}); await tick();
    assert.equal(succeeded, true); assert.equal(failed, false); assert.equal(destinations.length, 0);
    for (verifyMode of ['pending', 'network']) { succeeded = false; await values.exports.start('creator', 'Creator', 2000, 'credits'); await callback({}); assert.equal(failed, false); assert.equal(succeeded, false); assert.match(destinations.at(-1), /billing\/success\?order=/); }
  });
  if (process.argv.includes('--samples')) {
    const out = process.argv[process.argv.indexOf('--samples') + 1]; assert.ok(out); fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, 'Exismic-sample-credit-receipt.pdf'), await receiptPdf.createReceiptPdf(receipt));
    const annual = receiptData.buildBillingReceipt({ ...transaction, transactionReference: 'EXM-EXAMPLE-0002', kind: 'pro_renewal', amount: 5999, currency: 'USD', provider: 'paypal', providerOrderId: 'I-fixture', metadata: { planId: 'pro_yearly', nextBillingTime: '2027-10-04T07:30:00Z' } }, null, buyer);
    fs.writeFileSync(path.join(out, 'Exismic-sample-annual-receipt.pdf'), await receiptPdf.createReceiptPdf(annual));
  }
  if (process.argv.includes('--ui-fixtures')) {
    const out = process.argv[process.argv.indexOf('--ui-fixtures') + 1]; assert.ok(out); fs.mkdirSync(path.join(out, 'chunks'), { recursive: true });
    const staticRoot = path.join(root, '.next/static');
    const styles = fs.readdirSync(path.join(staticRoot, 'chunks')).filter(file => file.endsWith('.css'));
    for (const file of styles) fs.copyFileSync(path.join(staticRoot, 'chunks', file), path.join(out, 'chunks', file));
    if (fs.existsSync(path.join(staticRoot, 'media'))) fs.cpSync(path.join(staticRoot, 'media'), path.join(out, 'media'), { recursive: true });
    for (const [name, html] of Object.entries(uiFixtures)) fs.writeFileSync(path.join(out, `${name}.html`), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles.map(file => `<link rel="stylesheet" href="chunks/${file}">`).join('')}<title>Exismic ${name} QA fixture</title></head><body style="background:#030306">${html}</body></html>`);
  }
  console.log(`${checks} billing regression checks passed. No live services used.`);
}
main().catch(error => { console.error(error, testErrors.slice(-2)); process.exitCode = 1; });
