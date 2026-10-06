// Render-only unless --send is explicitly supplied; never changes an account or payment.
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript'), Module = require('node:module'), assert = require('node:assert/strict');
const repo = path.resolve(__dirname, '..');
require('@next/env').loadEnvConfig(repo);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.join(repo, 'src', request.slice(2)) : request, ...args); };
const transpile = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename }).outputText, filename);
require.extensions['.ts'] = transpile;
require.extensions['.tsx'] = transpile;
async function main() {
  const to = process.argv[2];
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error('An explicit valid test inbox is required.');
  const send = process.argv.includes('--send'), fileTest = process.argv.includes('--file-test');
  const testSender = process.argv.includes('--test-sender');
  const revised = process.argv.includes('--revised');
  const outIndex = process.argv.indexOf('--out');
  const out = outIndex < 0 ? path.join(repo, '.email-previews') : path.resolve(process.argv[outIndex + 1]);
  fs.mkdirSync(out, { recursive: true });
  const runId = Date.now().toString(), site = 'https://www.exismic.xyz';
  const e = require('../src/lib/emails.ts'), n = require('../src/emails/notifications.ts');
  const { getSupportAutoReplyHtml } = require('../src/emails/SupportAutoReply.ts');
  const { resend } = require('../src/lib/resend.ts');
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  let exported = { fileUrl: `${site}/exismic-app-icon.png` };
  if (fileTest) {
    const f = require('../src/lib/server/email-result-file.ts');
    assert.throws(() => f.verifyEmailFileProof('tampered.invalid', to, 'email-test'));
    await assert.rejects(f.prepareEmailFile({ email: to, owner: 'email-test', size: 21 * 1024 * 1024, mime: 'image/gif', title: 'Sample' }));
    const prepared = await f.prepareEmailFile({ email: to, owner: 'email-test', size: gif.length, mime: 'image/gif', title: 'Exismic-email-test-sample.mp4' });
    assert.throws(() => f.verifyEmailFileProof(prepared.proof, 'other@example.com', 'email-test'));
    assert.throws(() => f.verifyEmailFileProof(prepared.proof, to, 'other-owner'));
    const { createClient } = require('@supabase/supabase-js');
    const uploader = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const uploaded = await uploader.storage.from(prepared.bucket).uploadToSignedUrl(prepared.path, prepared.token, gif, { contentType: 'image/gif' });
    if (uploaded.error) throw new Error(`Signed upload failed: ${uploaded.error.message}`);
    const result = await f.resolveEmailFile(prepared.proof, to, 'email-test');
    assert.equal(result.attachment.filename, 'Exismic-email-test-sample.gif');
    assert.deepEqual(result.attachment.content, gif);
    const downloaded = await fetch(result.url);
    assert.equal(downloaded.status, 200);
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), gif);
    const publicAccess = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${prepared.bucket}/${prepared.path}`);
    assert.notEqual(publicAccess.status, 200);
    exported = { fileUrl: result.url, fileExpiresAt: result.expiresAt, attachment: result.attachment };
    console.log('PASS signed upload, private download, file bytes, GIF extension, recipient/owner binding, size limit');
  }
  assert.equal(e.getToolEmailUrl('video-to-gif'), `${site}/tools/video/to-gif`);
  assert.equal(e.getToolEmailUrl('minecraft-skin'), `${site}/tools/image/minecraft-skin`);
  assert.equal(e.getToolEmailUrl('unknown'), `${site}/tools`);
  const device = { deviceName: 'Chrome on Windows 11 (sample device)', ip: '192.0.2.10', time: 'October 6, 2026, 10:30 AM IST (sample)' };
  const payment = { invoiceId: `TEST-${runId}`, amount: '₹499', date: 'October 6, 2026' };
  const gift = { giftCode: 'TEST-NOT-REDEEMABLE', giftTitle: 'Sample Pro Gift Pass', amount: '₹499', invoiceId: `TEST-GIFT-${runId}`, redeemUrl: `${site}/redeem?code=TEST-NOT-REDEEMABLE`, senderName: 'Sample sender', recipientName: 'Rayan', recipientMessage: 'Sample gift message — no real voucher was created.' };
  const receipt = { transactionId: `TEST-${runId}`, reference: `TEST-${runId}`, paidAt: new Date().toISOString(), buyerName: 'Rayan (test)', buyerEmail: to, item: 'Exismic Pro — sample', description: 'DESIGN TEST — no payment occurred', amountMinor: 49900, currency: 'INR', originalAmountMinor: 49900, discountMinor: 0, provider: 'Sample provider', providerPaymentId: 'TEST-NO-PAYMENT', providerOrderId: 'TEST-NO-ORDER', orderId: 'TEST-NO-ORDER', periodEnd: null, isGift: false, giftCode: null, recurring: false };
  const affiliate = { name: 'Rayan', email: to, channel: site, audienceSize: 'Sample audience', message: 'Sample application.', ticketId: 'TEST-NO-TICKET', adminCenterLink: `${site}/admin?tab=tickets` };
  const reply = { name: 'Rayan', replyText: 'Thanks for reaching out. This is a sample response demonstrating the new layout.', message: 'Sample question — no ticket was created.', createdAt: new Date(), badge: 'Support response', title: 'An update from Exismic', action: 'reply' };
  const originalSend = resend.emails.send.bind(resend.emails);
  let captured;
  resend.emails.send = async payload => { captured = payload; return { data: { id: 'render-only' }, error: null }; };
  const raw = (html, subject) => async () => { captured = { from: `Exismic <noreply@${process.env.EMAIL_SENDER_DOMAIN || 'exismic.xyz'}>`, to, subject, html }; return true; };
  const samples = [
    ['welcome', () => e.sendWelcomeEmail(to)], ['pro_welcome', () => e.sendProWelcomeEmail(to, payment)],
    ['payment_receipt', () => e.sendDownloadableReceiptEmail(to, receipt)],
    ['credits_purchased', () => e.sendCreditsPurchasedEmail(to, { ...payment, credits: 1000 })],
    ['payment_failed', () => e.sendPaymentFailedEmail(to, { purchaseType: 'credits', amount: '₹399', orderId: `TEST-FAIL-${runId}`, reason: 'Sample decline. No payment occurred.' })],
    ['pro_renewal', () => e.sendProRenewalReceiptEmail(to, { ...payment, nextBillingDate: 'November 6, 2026' })],
    ['gift_voucher_purchased', () => e.sendGiftVoucherPurchasedEmail(to, gift)], ['gift_voucher_recipient', () => e.sendGiftVoucherToRecipientEmail(to, gift)],
    ['auth_otp', () => e.sendAuthOTP(to, '000000')], ['device_verification', () => e.sendDeviceVerificationOtpEmail(to, '000000', device)],
    ['login_security', () => e.sendLoginSecurityAlertEmail(to, device)], ['magic_link', () => e.sendMagicLinkEmail(to, `${site}/auth/login?emailDesignTest=1`)],
    ['password_reset', () => e.sendResetPasswordEmail(to, 'TEST-NOT-A-VALID-TOKEN')], ['password_changed', () => e.sendPasswordChangedEmail(to)],
    ['gift_card_pro_approved', () => e.sendGiftCardApprovedEmail(to, { planName: 'Pro (sample)', orderId: 'TEST-ORDER', isPro: true })],
    ['gift_card_credits_approved', () => e.sendGiftCardApprovedEmail(to, { planName: 'Credit pack (sample)', orderId: 'TEST-ORDER', credits: 1000, isPro: false })],
    ['gift_card_rejected', () => e.sendGiftCardRejectedEmail(to, { planName: 'Sample credit pack', orderId: 'TEST-ORDER', reason: 'Sample invalid code.' })],
    ['admin_gift_card_review', () => e.sendAdminGiftCardReviewEmail({ orderId: 'TEST-ORDER', userEmail: to, userId: 'TEST-USER', giftCardType: 'sample', giftCardCode: 'TEST-NOT-REDEEMABLE', planName: 'Sample credit pack', credits: 1000, adminEmail: to })],
    ['giveaway_winner', () => e.sendGiveawayWinnerEmail({ email: to, name: 'Rayan', prizeAmount: 1500 })], ['giveaway_launch', () => e.sendGiveawayLaunchAnnouncementEmail({ email: to, name: 'Rayan' })],
    ['tool_result_file', () => e.sendToolResultEmail({ email: to, toolType: 'video-to-gif', toolName: 'Video to GIF', title: 'Exismic email test sample.gif', ...exported })],
    ['tool_result_text', () => e.sendToolResultEmail({ email: to, toolType: 'ai-writer', toolName: 'AI Writer', title: 'Sample writing result', content: 'Email design test.\n\nGenerated text appears here, with line breaks preserved.' })],
    ['streak_warning', () => e.sendStreakExpiryWarningEmail({ email: to, name: 'Rayan', streak: 7, hoursRemaining: 2, hasShield: false })],
    ['streak_warning_shield', () => e.sendStreakExpiryWarningEmail({ email: to, name: 'Rayan', streak: 7, hoursRemaining: 2, hasShield: true })],
    ['account_deletion_scheduled', () => e.sendAccountDeletionScheduledEmail(to, { scheduledDeletionAt: new Date(Date.now() + 7 * 86400000), username: 'Rayan (sample)' })],
    ['account_recovery_requested', () => e.sendAccountRecoveryRequestedEmail(to)],
    ['support_auto_reply', raw(getSupportAutoReplyHtml('Rayan', 'Sample design review'), 'Support request received')], ['support_response', raw(n.supportResponseEmail(reply), 'Support response')],
    ['partnership_approved', raw(n.supportResponseEmail({ ...reply, badge: 'Partnership approved', title: 'Exismic Partner Program', action: 'accept' }), 'Partnership approved')],
    ['partnership_declined', raw(n.supportResponseEmail({ ...reply, badge: 'Application status', title: 'Exismic Partner Program', action: 'refuse' }), 'Partnership application status')],
    ['affiliate_admin', raw(n.affiliateAdminEmail(affiliate), 'Creator partnership application')], ['affiliate_applicant', raw(n.affiliateApplicantEmail(affiliate), 'Partnership application received')],
    ['account_suspended', raw(n.accountStatusEmail('Rayan', false), 'Account suspended')], ['account_restored', raw(n.accountStatusEmail('Rayan', true), 'Account restored')],
    ['tool_suggestion', raw(n.toolSuggestionEmail('Sample tool idea', 'Sample description.'), 'Tool suggestion received')],
    ['beta_feedback', raw(n.betaFeedbackEmail({ toolName: 'Minecraft Skin Studio', toolId: 'image-minecraft-skin', email: to, feedback: 'Sample feedback — no ticket was created.', submittedAt: new Date().toISOString() }), 'Beta feedback')],
  ];
  const rendered = [];
  for (const [name, render] of samples) {
    captured = undefined;
    assert.equal(await render(), true, `${name} failed to render`);
    assert(captured?.html?.includes('email-title'), `${name} must use the shared template`);
    assert(!/href="(?:blob:|data:|javascript:|http:\/\/127|http:\/\/localhost)/i.test(captured.html), `${name} has an unusable link`);
    assert(captured.html.length < 90000, `${name} risks Gmail clipping`);
    const banner = '<table role="presentation" width="100%"><tr><td style="padding:14px;background:#fff3cd;color:#523d00;font:13px/1.6 Arial;text-align:center;"><strong>EXISMIC EMAIL DESIGN TEST</strong><br>Sample data only. No payment, account change, security event, prize or gift was created. Codes and tokens are invalid.</td></tr></table>';
    const html = captured.html.replace(/(<body[^>]*>)/i, `$1${banner}`);
    const payload = { ...captured, ...(testSender ? { from: 'Exismic Email Test <onboarding@resend.dev>' } : {}), to, cc: undefined, bcc: undefined, subject: `[TEST · Exismic${revised ? ' · Revised' : ''}] ${name.replaceAll('_', ' ')}`, html, text: `EMAIL DESIGN TEST — no real action occurred.\n${captured.text || name}` };
    if (payload.attachments) for (const file of payload.attachments) fs.writeFileSync(path.join(out, file.filename), file.content);
    fs.writeFileSync(path.join(out, `${name}.html`), html);
    rendered.push({ name, payload });
  }
  resend.emails.send = originalSend;
  const manifest = { runId, recipient: to, mode: send ? 'send' : 'render-only', testSender, revised, total: rendered.length, fileDeliveryChecked: fileTest, samples: [] };
  for (const { name, payload } of rendered) {
    if (send) {
      let response;
      for (let attempt = 0; attempt < 3; attempt++) {
        response = await originalSend(payload, { idempotencyKey: `email-design-test/${runId}/${name}` });
        if (response.error?.statusCode !== 429) break;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      manifest.samples.push({ name, accepted: !response.error, providerId: response.data?.id || null, error: response.error?.message || null });
      console.log(`${response.error ? 'FAILED' : 'ACCEPTED'} ${name}${response.error ? `: ${response.error.message}` : ''}`);
      await new Promise(resolve => setTimeout(resolve, 650));
    } else manifest.samples.push({ name, rendered: true });
    fs.writeFileSync(path.join(out, `manifest-${runId}.json`), JSON.stringify(manifest, null, 2));
  }
  if (manifest.samples.some(item => item.accepted === false)) process.exitCode = 1;
  if (send && process.argv.includes('--verify-delivery')) {
    for (const item of manifest.samples.filter(item => item.providerId)) {
      const status = await resend.emails.get(item.providerId);
      item.deliveryEvent = status.data?.last_event || null;
      item.statusError = status.error?.message || null;
      console.log(`STATUS ${item.name}: ${item.deliveryEvent || item.statusError || 'unknown'}`);
      fs.writeFileSync(path.join(out, `manifest-${runId}.json`), JSON.stringify(manifest, null, 2));
      await new Promise(resolve => setTimeout(resolve, 650));
    }
  }
  console.log(`${send ? 'Submitted' : 'Rendered'} ${rendered.length} labelled samples.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
