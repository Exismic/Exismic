import { createHash } from 'node:crypto';
import { resend } from './resend';
import { recordEmailEvent } from './email-diagnostics';
import { getServerSiteUrl } from './site-url';
import { PRICING_CONFIG } from '@/config/pricing';
import { billingAmount, type BillingReceipt } from '@/lib/billing/receipt-data';
import { createReceiptPdf } from '@/lib/billing/receipt-pdf';
import { renderEmail, renderLegacyEmail, emailButton, emailDetails, emailPanel, emailCode } from './email-template';
import { ALL_TOOLS } from '@/data/tools';
import { normalizeHistoryToolType } from './results';

const EMAIL_SENDER_DOMAIN = process.env.EMAIL_SENDER_DOMAIN?.trim() || 'exismic.xyz';
const SENDER_PAYMENT = `"Exismic" <payments@${EMAIL_SENDER_DOMAIN}>`;
const SENDER_NOREPLY = `"Exismic" <noreply@${EMAIL_SENDER_DOMAIN}>`;
const SENDER_WELCOME = `"Exismic" <welcome@${EMAIL_SENDER_DOMAIN}>`;

const SITE_URL = getServerSiteUrl();
const PRO_DAILY_CREDITS_LABEL = PRICING_CONFIG.PRO_PLAN.DAILY_CREDITS.toLocaleString();

export async function sendDownloadableReceiptEmail(email: string, receipt: BillingReceipt) {
  try {
    const pdf = await createReceiptPdf(receipt);
    const downloadUrl = `${SITE_URL}/api/billing/receipt?transactionId=${encodeURIComponent(receipt.transactionId)}`;
    const amount = billingAmount(receipt.amountMinor, receipt.currency);
    const { error } = await sendTrackedEmail('payment_receipt', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: `Your Exismic payment receipt — ${receipt.reference}`,
      text: `Payment confirmed\n${receipt.item}\nTotal paid: ${amount}\nReceipt: ${receipt.reference}\nPaid: ${receipt.paidAt}\nYour PDF receipt is attached. You can also download it after signing in: ${downloadUrl}\nBilling help: billing@exismic.xyz`,
      html: renderEmail({preheader: `Payment confirmed: ${amount}. Your PDF receipt is attached.`, badge: 'Payment receipt', title: 'Payment confirmed', body: 'Thank you for your purchase. Your full PDF receipt is attached to this email.', content: emailDetails([['Purchase', receipt.item], ['Total paid', amount], ['Receipt', receipt.reference], ['Payment date (UTC)', receipt.paidAt]]) + emailButton(downloadUrl, 'Download receipt') + `<p>Sign in to download, or open the attached PDF. You can find this receipt again in <a href="${SITE_URL}/shop#purchases">purchase history</a>.</p>`, footerNote: 'For billing help, reply to billing@exismic.xyz.'}),
      attachments: [{ filename: `Exismic-Receipt-${receipt.reference.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`, content: pdf }],
    }, { idempotencyKey: `payment-receipt-v1/${receipt.transactionId}` });
    return !error;
  } catch (error) {
    console.error('[Billing] Receipt email failed:', error);
    return false;
  }
}

function escapeEmailText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

type EmailPayload = Parameters<typeof resend.emails.send>[0];
type EmailRequestOptions = Parameters<typeof resend.emails.send>[1];

async function sendTrackedEmail(
  channel: string,
  recipient: string,
  payload: EmailPayload,
  options?: EmailRequestOptions,
) {
  try {
    let response = await resend.emails.send(payload, options) as {
      data?: unknown;
      error?: string | { message?: string; name?: string; statusCode?: number } | null;
    };

    let errorMessage = response.error
      ? typeof response.error === 'string'
        ? response.error
        : response.error.message || 'Resend rejected the email'
      : undefined;

    // Auto-fallback if the custom domain is not yet verified in Resend dashboard
    if (errorMessage && (errorMessage.includes('not verified') || errorMessage.includes('domain'))) {
      console.warn(`[Email] Domain unverified in Resend. Retrying ${channel} with onboarding@resend.dev fallback...`);
      const fallbackPayload = {
        ...payload,
        from: payload.from?.includes('<')
          ? payload.from.replace(/<[^>]+>/, '<onboarding@resend.dev>')
          : 'Exismic <onboarding@resend.dev>',
      };

      const fallbackResponse = await resend.emails.send(fallbackPayload, options) as {
        data?: unknown;
        error?: string | { message?: string; name?: string; statusCode?: number } | null;
      };

      response = fallbackResponse;
      errorMessage = fallbackResponse.error
        ? typeof fallbackResponse.error === 'string' ? fallbackResponse.error : fallbackResponse.error.message || 'Email provider rejected the retry'
        : undefined;
    }

    if (response.error) {
      console.error(`[Email] sendTrackedEmail error (${channel}):`, response.error);
    }

    recordEmailEvent({
      channel,
      recipient,
      success: !response.error,
      error: errorMessage,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Email provider request failed';
    console.error(`[Email] sendTrackedEmail exception (${channel}):`, error);
    recordEmailEvent({
      channel,
      recipient,
      success: false,
      error: errorMessage,
    });
    throw error;
  }
}

const PREMIUM_DARK_THEME = renderLegacyEmail;

export async function sendProWelcomeEmail(email: string, details: {
  invoiceId: string;
  amount: string;
  date: string;
}) {
  try {
    const { error } = await sendTrackedEmail('pro_welcome', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Welcome to Exismic Pro - Your Membership is Active',
      html: renderEmail({preheader: 'Your Exismic Pro membership is active.', badge: 'Membership active', title: 'Welcome to Exismic Pro', body: 'Your membership is ready. Create with higher limits and your Pro daily credit allowance.', content: emailDetails([['Plan', 'Exismic Pro'], ['Daily credits', PRO_DAILY_CREDITS_LABEL], ['Amount paid', details.amount], ['Reference', details.invoiceId], ['Payment date', details.date]]) + emailButton(`${SITE_URL}/dashboard`, 'Start creating') + `<p>View your membership and billing details in <a href="${SITE_URL}/account/settings">account settings</a>.</p>`, footerNote: 'Your downloadable payment receipt is sent separately when payment is confirmed.'}),
    }, { idempotencyKey: `pro-activated/${details.invoiceId}` });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendPaymentFailedEmail(email: string, details?: {
  purchaseType?: 'pro' | 'credits';
  amount?: string;
  orderId?: string;
  reason?: string;
}) {
  try {
    const purchaseLabel = details?.purchaseType === 'credits' ? 'credit purchase' : details?.purchaseType === 'pro' ? 'Pro membership' : 'purchase';
    const safeReason = details?.reason ? escapeEmailText(details.reason) : 'The payment provider could not complete this transaction.';
    const safeOrderId = details?.orderId ? escapeEmailText(details.orderId) : null;
    const { error } = await sendTrackedEmail('payment_failed', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: `Your Exismic ${purchaseLabel} was not completed`,
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge" style="background:rgba(244,63,94,0.10); border-color:rgba(244,63,94,0.26); color:#fb7185;">PAYMENT NOT COMPLETED</div>
            <h1>Your ${purchaseLabel} needs <span class="accent-text" style="color:#fb7185;">attention.</span></h1>
            <p>The payment provider reported that this payment was not completed. If your bank shows a charge, check purchase history or contact billing support before paying again.</p>
        </div>
        <div class="info-card">
          <div class="info-grid">
            ${details?.amount ? `<div class="info-row"><div class="info-cell info-label">Attempted amount</div><div class="info-cell info-value">${escapeEmailText(details.amount)}</div></div>` : ''}
            ${safeOrderId ? `<div class="info-row"><div class="info-cell info-label">Reference</div><div class="info-cell info-value">${safeOrderId}</div></div>` : ''}
          </div>
          <div style="height:1px; margin:14px 0 18px; background:rgba(255,255,255,0.08);"></div>
          <p style="margin:0; font-size:13px; line-height:1.65;">${safeReason}</p>
        </div>
        <a href="${SITE_URL}/shop#purchases" class="cta-button">Check Purchase History</a>
        <p style="margin:18px 0 0; color:#737f94; font-size:12px; line-height:1.6;">A temporary bank authorization may take a short time to disappear. Contact support with the reference above if you need help.</p>
      `),
    }, details?.orderId ? { idempotencyKey: `payment-failed/${details.orderId}` } : undefined);

    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendCreditsPurchasedEmail(email: string, details: {
  credits: number;
  amount: string;
  invoiceId: string;
}) {
  try {
    const { error } = await sendTrackedEmail('credits_purchased', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: `+${details.credits.toLocaleString()} Credits added to your Exismic account`,
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge">CREDITS ADDED</div>
            <h1>Power <span class="accent-text" style="color: #38bdf8;">Refueled.</span></h1>
            <p>Your permanent credit reserve has been topped up. These credits never expire and will be used whenever your daily allowance runs out.</p>
        </div>

        <div class="info-card">
            <div style="text-align: center; margin-bottom: 24px; padding: 22px 0; background: rgba(56, 189, 248, 0.08); border-radius: 18px; border: 1px solid rgba(56, 189, 248, 0.25);">
                <div style="font-size: 52px; font-weight: 950; color: #38bdf8; letter-spacing: -1px; line-height: 1;">+${details.credits.toLocaleString()}</div>
                <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; margin-top: 8px;">PERMANENT CREDITS</div>
            </div>
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-cell info-label">Invoice ID</div>
                    <div class="info-cell info-value">${details.invoiceId}</div>
                </div>
                <div class="info-row">
                    <div class="info-cell info-label">Amount Paid</div>
                    <div class="info-cell info-value">${details.amount}</div>
                </div>
            </div>
        </div>

        <a href="${SITE_URL}/dashboard" class="cta-button">Resume Creation &rarr;</a>
      `, `Your permanent credit reserve has been topped up with +${details.credits.toLocaleString()} credits. (Invoice #${details.invoiceId})`),
    }, { idempotencyKey: `credits-purchased/${details.invoiceId}` });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendProRenewalReceiptEmail(email: string, details: {
  amount: string;
  invoiceId: string;
  nextBillingDate: string;
}) {
  try {
    const { error } = await sendTrackedEmail('pro_renewal', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Your Exismic Pro renewal receipt',
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
          <div class="status-badge">PRO RENEWED</div>
          <h1>Your membership stays <span class="accent-text">active.</span></h1>
          <p>Your Exismic Pro renewal payment was completed successfully.</p>
        </div>
        <div class="info-card">
          <div class="info-grid">
            <div class="info-row"><div class="info-cell info-label">Transaction ID</div><div class="info-cell info-value">${details.invoiceId}</div></div>
            <div class="info-row"><div class="info-cell info-label">Amount Paid</div><div class="info-cell info-value">${details.amount}</div></div>
            <div class="info-row"><div class="info-cell info-label">Next Billing</div><div class="info-cell info-value">${details.nextBillingDate}</div></div>
          </div>
        </div>
        <a href="${SITE_URL}/account/settings?tab=billing" class="cta-button">View Billing</a>
      `),
    }, { idempotencyKey: `pro-renewal/${details.invoiceId}` });
    if (error) {
      console.error('[Email] Pro renewal receipt failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Pro renewal receipt failed:', error);
    return false;
  }
}

export async function sendGiftVoucherPurchasedEmail(email: string, details: {
  giftCode: string;
  giftTitle: string;
  amount: string;
  invoiceId: string;
  redeemUrl: string;
  recipientName?: string | null;
  recipientMessage?: string | null;
}) {
  try {
    const safeCode = escapeEmailText(details.giftCode);
    const safeTitle = escapeEmailText(details.giftTitle);
    const safeAmount = escapeEmailText(details.amount);
    const safeInvoice = escapeEmailText(details.invoiceId);
    const safeName = details.recipientName ? escapeEmailText(details.recipientName) : null;
    const safeMsg = details.recipientMessage ? escapeEmailText(details.recipientMessage) : null;

    const { error } = await sendTrackedEmail('gift_voucher_purchased', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: `Your Exismic Gift Voucher: ${details.giftTitle}`,
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
          <div class="status-badge" style="background:rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.3); color:#fcd34d;">GIFT VOUCHER READY</div>
          <h1>Your Gift Pass is <span class="accent-text" style="color:#fbbf24;">Ready.</span></h1>
          <p>Thank you for your purchase! A single-use voucher code has been generated. Share this code or the instant redeem link with your recipient.</p>
        </div>

        <div class="info-card" style="text-align: center; padding: 28px 20px; border-color: rgba(245, 158, 11, 0.4);">
          <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">DIGITAL VOUCHER PASS</div>
          <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 20px;">${safeTitle}</div>

          <div style="margin: 0 auto 20px; padding: 16px 20px; background: rgba(0, 0, 0, 0.6); border: 1px dashed rgba(245, 158, 11, 0.5); border-radius: 14px; font-family: monospace; font-size: 20px; font-weight: 900; color: #fde047; letter-spacing: 3px; word-break: break-all;">
            ${safeCode}
          </div>

          ${safeName ? `
            <div style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px;">
              <strong>Recipient:</strong> ${safeName}
            </div>
          ` : ''}

          ${safeMsg ? `
            <div style="font-size: 13px; font-style: italic; color: #94a3b8; margin: 12px auto; padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: 10px; max-width: 400px;">
              &ldquo;${safeMsg}&rdquo;
            </div>
          ` : ''}

          <div class="info-grid" style="margin-top: 20px; text-align: left;">
            <div class="info-row"><div class="info-cell info-label">Transaction Ref</div><div class="info-cell info-value">${safeInvoice}</div></div>
            <div class="info-row"><div class="info-cell info-label">Amount Paid</div><div class="info-cell info-value">${safeAmount}</div></div>
            <div class="info-row"><div class="info-cell info-label">Usage Limit</div><div class="info-cell info-value">Single-Use (1-Time)</div></div>
          </div>
        </div>

        <a href="${details.redeemUrl}" class="cta-button" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 900;">Redeem Gift Voucher Now &rarr;</a>

        <div style="margin-top: 24px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94a3b8; line-height: 1.6;">
          <strong>Direct Share Link:</strong><br/>
          <a href="${details.redeemUrl}" style="color: #38bdf8; word-break: break-all;">${details.redeemUrl}</a>
        </div>
      `, `Your Exismic Gift Voucher code is ${details.giftCode} (${details.giftTitle}).`),
    }, { idempotencyKey: `gift-voucher/${details.invoiceId}` });

    if (error) {
      console.error('[Email] Gift voucher email failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Gift voucher email failed:', error);
    return false;
  }
}

export async function sendGiftVoucherToRecipientEmail(recipientEmail: string, details: {
  giftCode: string;
  giftTitle: string;
  senderName: string;
  redeemUrl: string;
  recipientName?: string | null;
  recipientMessage?: string | null;
  invoiceId: string;
}) {
  try {
    const safeCode = escapeEmailText(details.giftCode);
    const safeTitle = escapeEmailText(details.giftTitle);
    const safeSender = escapeEmailText(details.senderName);
    const safeName = details.recipientName ? escapeEmailText(details.recipientName) : null;
    const safeMsg = details.recipientMessage ? escapeEmailText(details.recipientMessage) : null;

    const { error } = await sendTrackedEmail('gift_voucher_recipient', recipientEmail, {
      from: SENDER_PAYMENT,
      to: recipientEmail,
      subject: `🎁 ${safeSender} sent you an Exismic Gift Pass: ${details.giftTitle}`,
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
          <div class="status-badge" style="background:rgba(245,158,11,0.12); border-color:rgba(245,158,11,0.3); color:#fcd34d;">GIFT PASS RECEIVED</div>
          <h1>${safeName ? `Hi ${safeName}, ` : ''}<span class="accent-text" style="color:#fbbf24;">${safeSender}</span> sent you a gift pass.</h1>
          <p>You have received a single-use Exismic digital pass for <strong>${safeTitle}</strong>.</p>
        </div>

        <div class="info-card" style="text-align: center; padding: 28px 20px; border-color: rgba(245, 158, 11, 0.4);">
          <div style="font-size: 11px; color: #94a3b8; letter-spacing: 2px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">DIGITAL VOUCHER PASS</div>
          <div style="font-size: 22px; font-weight: 900; color: #ffffff; margin-bottom: 20px;">${safeTitle}</div>

          <div style="margin: 0 auto 20px; padding: 16px 20px; background: rgba(0, 0, 0, 0.6); border: 1px dashed rgba(245, 158, 11, 0.5); border-radius: 14px; font-family: monospace; font-size: 20px; font-weight: 900; color: #fde047; letter-spacing: 3px; word-break: break-all;">
            ${safeCode}
          </div>

          ${safeMsg ? `
            <div style="font-size: 13px; font-style: italic; color: #cbd5e1; margin: 12px auto; padding: 12px 16px; background: rgba(255,255,255,0.04); border-radius: 10px; max-width: 400px; border-left: 3px solid #f59e0b;">
              &ldquo;${safeMsg}&rdquo;<br/>
              <span style="font-size: 11px; color: #94a3b8; font-style: normal; display: block; margin-top: 4px;">— ${safeSender}</span>
            </div>
          ` : ''}
        </div>

        <a href="${details.redeemUrl}" class="cta-button" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 900;">Redeem Gift Pass Now &rarr;</a>

        <div style="margin-top: 24px; padding: 14px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94a3b8; line-height: 1.6;">
          <strong>How to redeem:</strong><br/>
          Click the button above or visit <a href="${details.redeemUrl}" style="color: #38bdf8; word-break: break-all;">${details.redeemUrl}</a>. Sign in to your Exismic account and your pass will be credited instantly!
        </div>
      `, `${details.senderName} sent you an Exismic Gift Pass (${details.giftTitle})! Your voucher code is ${details.giftCode}.`),
    }, { idempotencyKey: `gift-voucher-recipient/${details.invoiceId}` });

    if (error) {
      console.error('[Email] Gift voucher recipient email failed:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[Email] Gift voucher recipient email failed:', error);
    return false;
  }
}

export const renderTransactionalEmail = renderEmail;

export function getToolEmailUrl(toolType: string) {
  const tool = ALL_TOOLS.find(item => item.id === normalizeHistoryToolType(toolType));
  return `${SITE_URL}${tool?.href || '/tools'}`;
}

export async function sendAuthOTP(email: string, otp: string) {
  try {
    const { error } = await sendTrackedEmail('auth_otp', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Your Exismic Verification Code',
      html: renderTransactionalEmail({
        preheader: 'Your Exismic verification code expires in 10 minutes.',
        badge: 'Verification Code',
        title: 'Verify your <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Exismic account</span>',
        body: 'Enter this code to finish securing your account and open your Exismic studio.',
        content: `
          ${emailCode(otp, 'Secure verification code')}
          <div style="max-width:440px; margin:0 auto; border-radius:22px; border:1px solid rgba(245,158,11,0.20); background:linear-gradient(135deg, rgba(245,158,11,0.09), rgba(255,255,255,0.025)); padding:18px;">
            <p style="margin:0; color:#8792a8; font-size:12px; line-height:1.65;">This code expires in 10 minutes. For your security, never share it with anyone.</p>
          </div>
        `,
        footerNote: "Didn't request this? You can safely ignore this email.",
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendDeviceVerificationOtpEmail(
  email: string,
  otp: string,
  details: { deviceName: string; ip: string; time: string }
) {
  try {
    const safeDeviceName = escapeEmailText(details.deviceName);
    const safeIp = escapeEmailText(details.ip);
    const safeTime = escapeEmailText(details.time);

    const { error } = await sendTrackedEmail('device_verify_otp', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Exismic Security: Verify Your New Device',
      html: renderTransactionalEmail({
        preheader: `Use verification code ${otp} to authorize your device.`,
        badge: 'New Device Verification',
        title: 'Verify <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">New Device Sign-in</span>',
        body: `We detected a sign-in attempt from an unrecognized device (${safeDeviceName}). Enter the 6-digit code below to authorize this device.`,
        content: `
          ${emailCode(otp, 'Device verification code')}

          <div style="max-width:480px; margin:0 auto 24px; text-align:left; border-radius:22px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.03); padding:20px;">
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px; color:#7d8aa3; margin-bottom:12px;">Sign-in Request Details</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0; color:#8792a8; font-size:13px;">Device / Browser</td>
                <td align="right" style="padding:6px 0; color:#ffffff; font-size:13px; font-weight:700;">${safeDeviceName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.06); color:#8792a8; font-size:13px;">IP Address</td>
                <td align="right" style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.06); color:#ffffff; font-size:13px; font-weight:700;">${safeIp}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.06); color:#8792a8; font-size:13px;">Time</td>
                <td align="right" style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.06); color:#ffffff; font-size:13px; font-weight:700;">${safeTime}</td>
              </tr>
            </table>
          </div>

          <div style="max-width:480px; margin:0 auto; border-radius:20px; border:1px solid rgba(245,158,11,0.25); background:rgba(245,158,11,0.08); padding:16px; text-align:left;">
            <p style="margin:0; color:#fbbf24; font-size:12px; line-height:1.6; font-weight:600;">If you did not attempt to sign in, someone else may have your password. Change your password immediately to protect your account.</p>
          </div>
        `,
        footerNote: 'This code expires in 10 minutes.',
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Device OTP email failed:', error);
    return false;
  }
}

export async function sendLoginSecurityAlertEmail(
  email: string,
  details: { deviceName: string; ip: string; time: string }
) {
  try {
    const safeDeviceName = escapeEmailText(details.deviceName);
    const safeIp = escapeEmailText(details.ip);
    const safeTime = escapeEmailText(details.time);

    const { error } = await sendTrackedEmail('login_security_alert', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Security Alert: New Sign-in to your Exismic Account',
      html: renderTransactionalEmail({
        preheader: `Account sign-in detected from ${safeDeviceName} (${safeIp}).`,
        badge: 'Security Notification',
        title: 'New Sign-in Alert',
        body: `Your Exismic account was signed into from a browser or device.`,
        content: `
          <div style="max-width:480px; margin:0 auto 24px; text-align:left; border-radius:22px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.03); padding:22px;">
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px; color:#22d3ee; margin-bottom:14px;">Sign-in Activity Summary</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0; color:#8792a8; font-size:13px;">Account</td>
                <td align="right" style="padding:8px 0; color:#ffffff; font-size:13px; font-weight:700;">${escapeEmailText(email)}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#8792a8; font-size:13px;">Device & Browser</td>
                <td align="right" style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#ffffff; font-size:13px; font-weight:700;">${safeDeviceName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#8792a8; font-size:13px;">IP Address</td>
                <td align="right" style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#ffffff; font-size:13px; font-weight:700;">${safeIp}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#8792a8; font-size:13px;">Timestamp</td>
                <td align="right" style="padding:8px 0; border-top:1px solid rgba(255,255,255,0.06); color:#ffffff; font-size:13px; font-weight:700;">${safeTime}</td>
              </tr>
            </table>
          </div>

          <a href="${SITE_URL}/account/settings?tab=security" style="display:block; width:100%; max-width:420px; margin:0 auto; border-radius:18px; background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#ffffff; text-decoration:none; text-align:center; padding:16px 0; font-size:14px; font-weight:900; box-shadow:0 14px 40px rgba(124,58,237,0.28);">Review Security & Password</a>
        `,
        footerNote: 'If this was you, no action is needed. If you did not authorize this login, reset your password immediately.',
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Security alert email failed:', error);
    return false;
  }
}

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  try {
    const { error } = await sendTrackedEmail('magic_link', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Your Exismic Magic Login Link',
      html: renderTransactionalEmail({
        preheader: 'Use your one-click Exismic magic link within 15 minutes.',
        badge: 'One-Click Login',
        title: 'Login to <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Exismic</span>',
        body: 'Use the secure button below to sign in without a password. This link is one-time use and expires soon.',
        content: `
          <a href="${magicLink}" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(124,58,237,0.34), 0 0 26px rgba(6,182,212,0.18);">Login to Exismic</a>
          <div style="margin-top:24px; padding:18px; border-radius:22px; border:1px solid rgba(255,255,255,0.10); background:linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025));">
            <p style="margin:0; color:#8792a8; font-size:12px; line-height:1.65;">This magic link expires in 15 minutes. If the button does not work, paste this secure link into your browser:</p>
            <p style="margin:10px 0 0; word-break:break-all; color:#67e8f9; font-size:12px; line-height:1.6;">${magicLink}</p>
          </div>
        `,
        footerNote: `If you did not request this sign-in link for ${email}, you can safely ignore this email.`,
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Magic link email failed:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, idempotencyKey?: string) {
  try {
    const { error } = await sendTrackedEmail('welcome', email, {
      from: SENDER_WELCOME,
      to: email,
      subject: "Welcome to Exismic - Let's Create Something Amazing",
      text: `Welcome to Exismic! Your browser workspace for image, audio, video, PDF and AI writing tools is ready. Explore the tools: ${SITE_URL}/tools\nNeed help? ${SITE_URL}/help\nYou received this welcome email after creating an Exismic account.`,
      html: renderEmail({preheader: 'Your Exismic workspace is ready.', badge: 'Welcome to Exismic', title: 'Make something great', body: 'Your browser workspace for image, audio, video, PDF and AI writing tools is ready.', content: emailPanel('<strong>One place for everyday creative work</strong><p style="margin:10px 0 0;">Find a tool, add your files and create your result — without installing desktop software.</p>') + emailButton(`${SITE_URL}/tools`, 'Explore the tools') + `<p>Need a hand getting started? Visit the <a href="${SITE_URL}/help">Help Center</a>.</p>`, footerNote: 'You received this welcome email after creating an Exismic account.'}),
    }, idempotencyKey ? { idempotencyKey } : undefined);
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendResetPasswordEmail(email: string, token: string) {
  try {
    const resetLink = `${SITE_URL}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    const { error } = await sendTrackedEmail('password_reset', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Reset Your Exismic Password',
      html: renderTransactionalEmail({
        preheader: 'Reset your Exismic password within 10 minutes.',
        badge: 'Security Request',
        title: 'Password <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Recovery</span>',
        body: 'We received a request to reset your Exismic password. If this was you, use the secure button below to choose a new password.',
        content: `
          <a href="${resetLink}" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(124,58,237,0.34), 0 0 26px rgba(6,182,212,0.18);">Reset Password</a>
          <div style="margin-top:24px; padding:18px; border-radius:22px; border:1px solid rgba(245,158,11,0.22); background:linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,0.025));">
            <p style="margin:0; color:#f8d294; font-size:12px; line-height:1.65;">This reset link expires in 10 minutes. For your security, only use this link in the browser where you requested it.</p>
          </div>
          <div style="margin-top:14px; padding:18px; border-radius:22px; border:1px solid rgba(255,255,255,0.10); background:linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025));">
            <p style="margin:0; color:#8792a8; font-size:12px; line-height:1.65;">If the button does not work, paste this secure link into your browser:</p>
            <p style="margin:10px 0 0; word-break:break-all; color:#67e8f9; font-size:12px; line-height:1.6;">${resetLink}</p>
          </div>
        `,
        footerNote: "If you did not request a password reset, ignore this email and your password will stay unchanged.",
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}

export async function sendPasswordChangedEmail(email: string) {
  try {
    const { error } = await sendTrackedEmail('password_changed', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Your Exismic Password Was Changed',
      html: renderTransactionalEmail({
        preheader: 'Your Exismic password was changed successfully.',
        badge: 'Security Alert',
        title: 'Password <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">changed</span>',
        body: 'This is a confirmation that your Exismic account password was updated. If you made this change, no further action is needed.',
        content: `
          <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(16,185,129,0.24); background:linear-gradient(135deg, rgba(16,185,129,0.10), rgba(34,211,238,0.045)); padding:18px;">
            <p style="margin:0; color:#b7f7d3; font-size:12px; line-height:1.65;">Your account password was changed successfully. Future sign-ins will require the new password.</p>
          </div>
          <a href="${SITE_URL}/auth/login" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(124,58,237,0.34), 0 0 26px rgba(6,182,212,0.18);">Review Account</a>
          <div style="margin-top:24px; padding:18px; border-radius:22px; border:1px solid rgba(245,158,11,0.22); background:linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,0.025));">
            <p style="margin:0; color:#f8d294; font-size:12px; line-height:1.65;">If you did not change your password, reset it immediately and contact Exismic support.</p>
          </div>
        `,
        footerNote: "Exismic sends this alert whenever your account password changes.",
      }),
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Password changed email failed:', error);
    return false;
  }
}

export async function sendGiftCardApprovedEmail(
  email: string,
  details: { planName: string; orderId: string; credits?: number; isPro?: boolean }
) {
  try {
    const isPro = details.isPro || details.planName.toLowerCase().includes("pro");

    const innerContent = isPro ? `
      <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(167,139,250,0.3); background:linear-gradient(135deg, rgba(167,139,250,0.12), rgba(56,189,248,0.05)); padding:20px; text-align:left;">
        <p style="margin:0 0 12px; color:#ffffff; font-size:15px; font-weight:900;">Exismic Pro Membership Active!</p>
        <ul style="margin:0; padding-left:18px; color:#cbd5e1; font-size:13px; line-height:1.8;">
          <li>• <strong>${PRO_DAILY_CREDITS_LABEL} Daily Credits</strong> (restores every 24 hours)</li>
          <li>• <strong>Priority Speed</strong> &amp; Fast-Track Generation</li>
          <li>• <strong>Full Studio Tool Access</strong> across all creative suites</li>
          <li>• <strong>Commercial Usage License</strong> for real projects</li>
        </ul>
        <div style="margin-top:14px; text-align:left;">
          <a href="${SITE_URL}/pro/benefits" style="display:inline-block; color:#a78bfa; font-size:12px; font-weight:800; text-decoration:none;">View all Pro benefits &amp; perks &rarr;</a>
        </div>
      </div>
      <a href="${SITE_URL}/pro" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; margin:0 auto; box-shadow:0 18px 52px rgba(139,92,246,0.34);">Start Using Exismic Pro</a>
    ` : `
      <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(52,211,153,0.3); background:linear-gradient(135deg, rgba(52,211,153,0.12), rgba(16,185,129,0.05)); padding:20px; text-align:center;">
        <p style="margin:0; color:#b7f7d3; font-size:14px; font-weight:700;">Your credit pack is now active on your Exismic account!</p>
        ${details.credits ? `<p style="margin:8px 0 0; color:#ffffff; font-size:20px; font-weight:900;">+${details.credits.toLocaleString()} Permanent Credits Granted</p>` : ''}
      </div>
      <a href="${SITE_URL}/tools" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#10b981,#059669,#06b6d4); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; margin:0 auto; box-shadow:0 18px 52px rgba(16,185,129,0.34);">Start Using Exismic</a>
    `;

    const { error } = await sendTrackedEmail('gift_card_approved', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: isPro ? '🎉 Your Exismic Pro Gift Card Was Approved!' : '🎉 Your Gift Card Payment Was Approved!',
      html: renderTransactionalEmail({
        preheader: `Your gift card payment for ${details.planName} has been approved and unlocked!`,
        badge: 'Payment Approved',
        title: isPro
          ? 'Pro Membership <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Activated!</span>'
          : 'Gift Card <span style="background:linear-gradient(90deg,#34d399,#10b981,#ffffff); -webkit-background-clip:text; background-clip:text; color:#34d399;">Approved!</span>',
        body: `Great news! Your gift card submission for <strong>${escapeEmailText(details.planName)}</strong> (Order #${escapeEmailText(details.orderId.slice(-8))}) has been verified and approved.`,
        content: innerContent,
        footerNote: "Thank you for choosing Exismic! Contact support if you have any questions.",
      }),
    });
    return !error;
  } catch (err) {
    console.error('Gift card approved email error:', err);
    return false;
  }
}

export async function sendGiftCardRejectedEmail(email: string, details: { planName: string; orderId: string; reason?: string }) {
  try {
    const { error } = await sendTrackedEmail('gift_card_rejected', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Gift Card Submission Update',
      html: renderTransactionalEmail({
        preheader: `Update regarding your gift card submission for ${details.planName}`,
        badge: 'Verification Update',
        title: 'Gift Card <span style="background:linear-gradient(90deg,#f87171,#ef4444,#ffffff); -webkit-background-clip:text; background-clip:text; color:#f87171;">Declined</span>',
        body: `We reviewed your gift card submission for <strong>${escapeEmailText(details.planName)}</strong> (Order #${escapeEmailText(details.orderId.slice(-8))}). Unfortunately, the code could not be verified or redeemed.`,
        content: `
          <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(239,68,68,0.25); background:linear-gradient(135deg, rgba(239,68,68,0.10), rgba(255,255,255,0.02)); padding:18px;">
            <p style="margin:0; color:#fca5a5; font-size:13px; font-weight:700;">Reason: ${escapeEmailText(details.reason || 'Code was invalid, expired, or already redeemed.')}</p>
          </div>
          <p style="color:#a1a1aa; font-size:12px; line-height:1.6; text-align:center;">Please check your gift code for typos or try checking out using Razorpay or PayPal.</p>
        `,
        footerNote: "Contact Exismic support if you believe this code was declined in error.",
      }),
    });
    return !error;
  } catch (err) {
    console.error('Gift card rejected email error:', err);
    return false;
  }
}

export async function sendAdminGiftCardReviewEmail(details: {
  orderId: string;
  userEmail: string;
  userName?: string | null;
  userId: string;
  giftCardType: string;
  giftCardCode: string;
  planName: string;
  credits: number;
  submittedAt?: string;
  adminEmail?: string;
}) {
  try {
    const adminEmail = details.adminEmail || 'syedyaseeralirayan@gmail.com';
    const safeUserEmail = escapeEmailText(details.userEmail);
    const safePlanName = escapeEmailText(details.planName);
    const safeCode = escapeEmailText(details.giftCardCode);
    const safeType = escapeEmailText(details.giftCardType.toUpperCase());
    const safeOrderId = escapeEmailText(details.orderId);

    const { error } = await sendTrackedEmail('admin_gift_card_review', adminEmail, {
      from: SENDER_PAYMENT,
      to: adminEmail,
      subject: `[Admin Alert] New Gift Card Review Request - ${safeType} (${safePlanName})`,
      html: renderTransactionalEmail({
        preheader: `New gift card payment submission from ${safeUserEmail} requires review.`,
        badge: 'Admin Action Required',
        title: 'New <span style="background:linear-gradient(90deg,#fbbf24,#f59e0b,#ffffff); -webkit-background-clip:text; background-clip:text; color:#fbbf24;">Gift Card Submission</span>',
        body: `A user has submitted a gift card payment for manual verification. Please review and redeem the code below.`,
        content: `
          <div style="max-width:480px; margin:0 auto 20px; border-radius:24px; border:1px solid rgba(251,191,36,0.3); background:linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.04)); padding:22px; text-align:left;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0; color:#9ca3af; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Submitted By</td>
                <td align="right" style="padding:6px 0; color:#ffffff; font-size:13px; font-weight:800;">${safeUserEmail}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#9ca3af; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Plan / Package</td>
                <td align="right" style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#fbbf24; font-size:13px; font-weight:800;">${safePlanName} (${details.credits} Credits)</td>
              </tr>
              <tr>
                <td style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#9ca3af; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Brand / Type</td>
                <td align="right" style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#ffffff; font-size:13px; font-weight:800;">${safeType}</td>
              </tr>
              <tr>
                <td style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#9ca3af; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">Order ID</td>
                <td align="right" style="padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); color:#d1d5db; font-size:12px; font-family:monospace;">#${safeOrderId.slice(-8)}</td>
              </tr>
            </table>

            <div style="margin-top:18px; padding:14px; border-radius:16px; background:rgba(0,0,0,0.5); border:1px solid rgba(251,191,36,0.4); text-align:center;">
              <div style="font-size:11px; color:#fbbf24; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:4px;">Gift Card Code</div>
              <div style="font-size:20px; font-weight:900; font-family:monospace; color:#ffffff; letter-spacing:2px; user-select:all;">${safeCode}</div>
            </div>
          </div>

          <a href="${SITE_URL}/admin" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#f59e0b,#d97706,#b45309); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; margin:0 auto; box-shadow:0 18px 52px rgba(245,158,11,0.34);">Open Admin Queue</a>
        `,
        footerNote: "This alert was automatically generated because a user submitted a gift card code for verification.",
      }),
    });
    return !error;
  } catch (err) {
    console.error('Admin gift card review email error:', err);
    return false;
  }
}

export async function sendGiveawayWinnerEmail(details: {
  email: string;
  name: string;
  prizeAmount: number;
}) {
  const safeName = escapeEmailText(details.name || details.email.split('@')[0]);
  const safeCredits = details.prizeAmount.toLocaleString();

  try {
    const { error } = await sendTrackedEmail('giveaway_winner', details.email, {
      from: SENDER_WELCOME,
      to: [details.email],
      subject: `🎉 Congratulations! You Won ${safeCredits} Permanent Credits on Exismic!`,
      html: renderTransactionalEmail({
        preheader: `You are a winner in the Exismic Community Giveaway! ${safeCredits} Permanent Credits have been deposited into your account.`,
        badge: 'Official Winner',
        title: '🎉 You <span style="background:linear-gradient(90deg,#fbbf24,#f59e0b,#ffffff); -webkit-background-clip:text; background-clip:text; color:#fbbf24;">Won The Giveaway!</span>',
        body: `Congratulations <strong>${safeName}</strong>! Your entry was selected as a winner in the Exismic Community Giveaway.`,
        content: `
          <div style="max-width:480px; margin:0 auto 24px; border-radius:24px; border:1px solid rgba(251,191,36,0.35); background:linear-gradient(135deg, rgba(251,191,36,0.14), rgba(245,158,11,0.05)); padding:26px; text-align:center;">
            <div style="font-size:38px; margin-bottom:12px;">🏆</div>
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#fbbf24; margin-bottom:6px;">Official Prize Awarded</div>
            <div style="font-size:32px; font-weight:950; color:#ffffff; margin-bottom:8px; text-shadow:0 0 20px rgba(251,191,36,0.5); font-family:monospace;">+${safeCredits} CREDITS</div>
            <div style="font-size:13px; font-weight:700; color:#a1a1aa; line-height:1.5;">These are <strong>Permanent Lifetime Credits</strong> that never expire, do not reset daily, and work on all 40+ Exismic tools!</div>
          </div>

          <a href="${SITE_URL}/giveaway" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#f59e0b,#eab308,#ca8a04); color:#000000; text-decoration:none; text-align:center; padding:18px 0; font-size:16px; font-weight:950; margin:0 auto; box-shadow:0 18px 52px rgba(245,158,11,0.4);">View Giveaway & Start Creating</a>
        `,
        footerNote: "You received this email because your account was randomly chosen as a winner in the official Exismic Community Giveaway.",
      }),
    });
    return !error;
  } catch (err) {
    console.error('Giveaway winner email error:', err);
    return false;
  }
}

export async function sendGiveawayLaunchAnnouncementEmail(details: {
  email: string;
  name?: string;
}) {
  const safeName = escapeEmailText(details.name || details.email.split('@')[0]);

  // Safeguard: Never send launch emails to real users during local testing
  if (process.env.NODE_ENV !== 'production' && !details.email.toLowerCase().includes('syedrayan')) {
    console.log(`[Email Safeguard] Skipped giveaway launch email to ${details.email} in local development.`);
    return true;
  }

  try {
    const { error } = await sendTrackedEmail('giveaway_launch', details.email, {
      from: SENDER_WELCOME,
      to: [details.email],
      subject: `🎁 Mega Giveaway is Live on Exismic! Win Up to 1,500 Permanent Credits`,
      html: renderTransactionalEmail({
        preheader: `A brand new mega giveaway is live! 3 lucky creators will win up to 1,500 Permanent Lifetime Credits (3,000 Credits total pool). Spend 250+ credits to enter.`,
        badge: 'Mega Giveaway Drop',
        title: '🎉 Mega <span style="background:linear-gradient(90deg,#fbbf24,#f59e0b,#ffffff); -webkit-background-clip:text; background-clip:text; color:#fbbf24;">Giveaway is Live!</span>',
        body: `Hey <strong>${safeName}</strong>, we are hosting an exclusive community mega giveaway on Exismic!`,
        content: `
          <div style="max-width:480px; margin:0 auto 24px; border-radius:24px; border:1px solid rgba(251,191,36,0.35); background:linear-gradient(135deg, rgba(251,191,36,0.14), rgba(245,158,11,0.05)); padding:26px; text-align:center;">
            <div style="font-size:38px; margin-bottom:12px;">🎁</div>
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:2px; color:#fbbf24; margin-bottom:6px;">3,000 Credits Total Prize Pool</div>
            <div style="font-size:24px; font-weight:950; color:#ffffff; margin-bottom:8px; text-shadow:0 0 20px rgba(251,191,36,0.5); font-family:monospace;">1ST: 1,500c · 2ND: 1,000c · 3RD: 500c</div>
            <div style="font-size:13px; font-weight:700; color:#d1d5db; line-height:1.6; margin-top:10px;">
              Spend at least <strong>250 credits</strong> across any AI, Minecraft 3D Studio, or media tools during the giveaway window to be <strong>automatically entered</strong>!
            </div>
          </div>

          <a href="${SITE_URL}/giveaway" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#f59e0b,#eab308,#ca8a04); color:#000000; text-decoration:none; text-align:center; padding:18px 0; font-size:16px; font-weight:950; margin:0 auto; box-shadow:0 18px 52px rgba(245,158,11,0.4);">Enter Giveaway & View Progress →</a>
        `,
        footerNote: "You received this email because you are a registered creator on Exismic.",
      }),
    });
    return !error;
  } catch (err) {
    console.error('Giveaway launch announcement email error:', err);
    return false;
  }
}

type ToolResultEmailDetails = {
  email: string; toolType: string; toolName?: string; title?: string; content?: string;
  fileUrl?: string; fileExpiresAt?: string;
  attachment?: { filename: string; content: Buffer };
};
export type ResultEmailDelivery = { status: 'accepted' | 'rejected' | 'uncertain'; providerId?: string };
export async function sendToolResultEmail(details: ToolResultEmailDetails) {
  return (await sendToolResultEmailDetailed(details)).status === 'accepted';
}
export async function sendToolResultEmailDetailed(details: ToolResultEmailDetails, idempotencyKey?: string): Promise<ResultEmailDelivery> {
  if (details.fileUrl && !/^https:\/\//i.test(details.fileUrl)) return { status: 'rejected' };
  const name = escapeEmailText(details.toolName || 'Tool output');
  const title = escapeEmailText(details.title || 'Your result');
  const toolUrl = getToolEmailUrl(details.toolType);
  const previewContent = details.content?.slice(0, 6000);
  const longText = details.content && details.content.length > 6000
    ? { filename: 'Exismic-result.txt', content: Buffer.from(details.content, 'utf8') }
    : undefined;
  const attachments = [details.attachment, longText].filter((file): file is { filename: string; content: Buffer } => Boolean(file));
  const expiry = details.fileExpiresAt ? `<p style="font-size:12px;">The private download link expires in 7 days. Save the attached file for permanent access.</p>` : '';
  try {
    const { error, data } = await sendTrackedEmail('tool_result', details.email, {
      from: SENDER_NOREPLY, to: details.email,
      subject: `Your ${details.toolName || 'Exismic'} result: ${details.title || 'Generation'}`,
      text: `Your ${details.toolName || 'Exismic'} result is ready.\n${details.title || ''}\n${details.content || ''}\n${details.fileUrl ? `Download: ${details.fileUrl}` : ''}\n${details.fileExpiresAt ? 'Download link expires in 7 days. A copy of the file is attached.' : ''}\nOpen tool: ${toolUrl}`,
      html: renderEmail({preheader: `Your ${details.toolName || 'Exismic'} result is ready.`, badge: 'Result ready', title: 'Your result, ready to use', body: `Created with Exismic’s ${name}.`, content: emailPanel(`<strong style="font-size:16px;">${title}</strong>${details.fileUrl ? emailButton(details.fileUrl, 'Download / view file') : ''}${expiry}${previewContent ? `<div style="white-space:pre-wrap;word-break:break-word;margin-top:16px;font-size:13px;line-height:1.7;">${escapeEmailText(previewContent)}</div>${longText ? '<p style="margin-top:14px;font-size:12px;">Preview shortened. Your complete result is attached as Exismic-result.txt.</p>' : ''}` : ''}`) + `<p style="margin-top:20px;"><a href="${toolUrl}">Open ${name} in Exismic &rarr;</a></p>`, footerNote: 'You received this email because you chose to email a result from Exismic.'}),
      ...(attachments.length ? { attachments } : {}),
    }, idempotencyKey ? { idempotencyKey } : undefined);
    if (error) {
      const code = typeof error === 'object' ? error.statusCode : undefined;
      // A provider rejection is safe to refund. A timeout or an unknown outcome is not.
      return { status: code && code >= 400 && code < 500 && code !== 408 && code !== 409 ? 'rejected' : 'uncertain' };
    }
    const providerId = data && typeof data === 'object' && 'id' in data && typeof data.id === 'string' ? data.id : undefined;
    return providerId ? { status: 'accepted', providerId } : { status: 'uncertain' };
  } catch (error) {
    console.error('Tool result email failed:', error);
    return { status: 'uncertain' };
  }
}

export async function sendStreakProtectionEmail(details: {
  email: string; name?: string | null; streak: number; shieldsUsed: number;
  shieldsRemaining: number; missedDays: number; saved: boolean; eventId: string; protectedThrough: string;
}) {
  const title = details.saved ? 'Your streak saver worked' : 'Your streak protection ran out';
  const body = details.saved
    ? `${details.shieldsUsed} streak saver${details.shieldsUsed === 1 ? '' : 's'} automatically protected your ${details.streak}-day streak when you missed a daily reward.`
    : `${details.shieldsUsed} streak saver${details.shieldsUsed === 1 ? '' : 's'} protected part of your ${details.missedDays}-day gap. Your streak ended when there were no savers left to cover the remaining missed days.`;
  const next = details.saved ? "Claim today's daily reward to continue your streak." : 'Claim your next daily reward to start a new streak.';
  try {
    const { error } = await sendTrackedEmail('streak_protection', details.email, {
      from: SENDER_NOREPLY, to: details.email, subject: `Exismic: ${title.toLowerCase()}`,
      text: `${title}\n${body}\nSavers used: ${details.shieldsUsed}\nSavers remaining: ${details.shieldsRemaining}\n${next}\n${SITE_URL}/shop\nEach saver covers one missed reward day. Rewards reset at 12:00 PM IST.`,
      html: renderEmail({ preheader: body, badge: 'Automatic streak protection', title, body,
        content: emailDetails([['Previous streak', `${details.streak} days`], ['Savers used', String(details.shieldsUsed)],
          ['Savers remaining after protection', String(details.shieldsRemaining)]])
          + emailPanel(`<p>${next}</p><p>Each saver covers one missed reward day. Protection does not claim a reward or add an extra streak day. Rewards reset at 12:00 PM IST.</p>`)
          + emailButton(`${SITE_URL}/shop`, 'Open daily rewards'),
        footerNote: 'This is a confirmation of automatic streak saver use on your Exismic account.' }),
    }, { idempotencyKey: `streak-protection-v1/${details.eventId}` });
    return !error;
  } catch (error) { console.error('[Email] Streak protection email failed:', error); return false; }
}

export async function sendStreakExpiryWarningEmail(details: {
  email: string; name?: string | null; streak: number; hoursRemaining: number; hasShield: boolean; cycleDate?: string;
}) {
  const title = details.hasShield ? 'Keep your saver for another day' : 'Keep your daily streak going';
  const body = `Your ${details.streak}-day streak is active, but you have not claimed today's daily reward. Claim before the next 12:00 PM IST reset.`;
  const protection = details.hasShield
    ? 'You have a streak saver ready. If you miss this reward day, one saver will be used automatically. Claim now to keep it for another day.'
    : 'You have no streak savers remaining. Missing this reward day will end your streak at the next reset.';
  try {
    const { error } = await sendTrackedEmail('streak_reminder', details.email, {
      from: SENDER_NOREPLY, to: details.email,
      subject: details.hasShield ? `Exismic: keep your ${details.streak}-day streak and your saver` : `Exismic: claim your reward to keep your ${details.streak}-day streak`,
      text: `${title}\n${body}\n${protection}\nClaim daily reward: ${SITE_URL}/shop`,
      html: renderEmail({ preheader: body, badge: 'Daily reward reminder', title, body,
        content: emailPanel(`<p>${protection}</p>`) + emailButton(`${SITE_URL}/shop`, 'Claim daily reward'),
        footerNote: 'You received this reminder because your Exismic daily reward streak is active.' }),
    }, details.cycleDate ? { idempotencyKey: `streak-reminder-v2/${createHash('sha256').update(details.email).digest('hex')}/${details.cycleDate}` } : undefined);
    return !error;
  } catch (error) { console.error('[Email] Streak reminder email failed:', error); return false; }
}

export async function sendAccountDeletionScheduledEmail(
  email: string,
  details: { scheduledDeletionAt: Date; username?: string | null }
) {
  try {
    const formattedDate = details.scheduledDeletionAt.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const { error } = await sendTrackedEmail('account_deletion_scheduled', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Exismic: Your Account Has Been Scheduled for Deletion',
      html: renderTransactionalEmail({
        preheader: `Your account is scheduled to be permanently deleted on ${formattedDate}.`,
        badge: 'Account Deletion Notice',
        title: 'Account scheduled for <span style="background:linear-gradient(90deg,#f43f5e,#fb7185,#ffffff); -webkit-background-clip:text; background-clip:text; color:#fb7185;">deletion</span>',
        body: `We received a request to delete your Exismic account${details.username ? ` (@${details.username})` : ''}. Your account is now in a 7-day safety grace period and will be permanently erased on ${formattedDate}.`,
        content: `
          <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(244,63,94,0.3); background:linear-gradient(135deg, rgba(244,63,94,0.10), rgba(0,0,0,0.4)); padding:20px; text-align:center;">
            <p style="margin:0 0 10px; color:#ffffff; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em;">Scheduled Deletion Date</p>
            <p style="margin:0; color:#fda4af; font-size:20px; font-weight:900;">${formattedDate}</p>
            <p style="margin:10px 0 0; color:#a1a1aa; font-size:12px; line-height:1.5;">After this date, all your projects, files, generation credits, and account history will be permanently destroyed.</p>
          </div>

          <div style="max-width:440px; margin:0 auto 24px; border-radius:22px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.02); padding:18px; text-align:left;">
            <p style="margin:0 0 6px; color:#ffffff; font-size:13px; font-weight:800;">Did you change your mind?</p>
            <p style="margin:0; color:#a1a1aa; font-size:12px; line-height:1.6;">You have 7 days to restore your account. Simply sign in before ${formattedDate} and submit a recovery request.</p>
          </div>

          <a href="${SITE_URL}/auth/login" style="display:block; width:100%; max-width:420px; margin:0 auto; border-radius:20px; background:linear-gradient(90deg,#f43f5e,#e11d48,#be123c); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(244,63,94,0.35);">Restore My Account</a>
        `,
        footerNote: 'If you did not request this deletion, sign in immediately to secure and restore your account.',
      }),
    });

    if (error) {
      console.error('[Email] Account deletion email send failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] sendAccountDeletionScheduledEmail error:', err);
    return false;
  }
}

export async function sendAccountRecoveryRequestedEmail(email: string, cancelled = false) {
  try {
    if (cancelled) {
      const { error } = await sendTrackedEmail('account_deletion_cancelled', email, {
        from: SENDER_NOREPLY, to: email, subject: 'Exismic: account deletion cancelled',
        text: `Your account deletion has been cancelled. Your account is active again. Sign in to continue: ${SITE_URL}/auth/login\nIf you did not cancel deletion, contact support: ${SITE_URL}/help`,
        html: renderEmail({ preheader: 'Your account is active again.', badge: 'Account restored', title: 'Account deletion cancelled',
          body: 'Your account is active again. Your saved work and account details have been kept.',
          content: emailButton(`${SITE_URL}/auth/login`, 'Sign in to Exismic') + emailPanel(`<p>If you did not cancel deletion, please <a href="${SITE_URL}/help">contact support</a>.</p>`),
          footerNote: 'You received this confirmation because account deletion was cancelled.' }),
      });
      return !error;
    }
    const { error } = await sendTrackedEmail('account_recovery_requested', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Exismic: Account Recovery Request Received',
      html: renderTransactionalEmail({
        preheader: 'We received your request to cancel account deletion and restore access.',
        badge: 'Account Recovery',
        title: 'Recovery request <span style="background:linear-gradient(90deg,#10b981,#34d399,#ffffff); -webkit-background-clip:text; background-clip:text; color:#34d399;">received</span>',
        body: 'We have received your request to cancel account deletion. Your account is paused from deletion while our team reviews and restores full access.',
        content: `
          <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(16,185,129,0.3); background:linear-gradient(135deg, rgba(16,185,129,0.10), rgba(0,0,0,0.4)); padding:20px; text-align:left;">
            <p style="margin:0 0 8px; color:#ffffff; font-size:13px; font-weight:800;">Deletion Paused</p>
            <p style="margin:0; color:#a7f3d0; font-size:12px; line-height:1.65;">Your creations, files, and credit reserves are safe. We will restore your account access shortly.</p>
          </div>
        `,
        footerNote: 'Exismic Account Security Team',
      }),
    });
    return !error;
  } catch (err) {
    console.error('[Email] sendAccountRecoveryRequestedEmail error:', err);
    return false;
  }
}
