import { resend } from './resend';
import { recordEmailEvent } from './email-diagnostics';
import { getServerSiteUrl } from './site-url';

const EMAIL_SENDER_DOMAIN = 'lumoraai.online';
const SENDER_PAYMENT = `"Lumora" <payments@${EMAIL_SENDER_DOMAIN}>`;
const SENDER_NOREPLY = `"Lumora" <noreply@${EMAIL_SENDER_DOMAIN}>`;
const SENDER_WELCOME = `"Lumora" <welcome@${EMAIL_SENDER_DOMAIN}>`;

const SITE_URL = getServerSiteUrl();

type EmailPayload = Parameters<typeof resend.emails.send>[0];

async function sendTrackedEmail(channel: string, recipient: string, payload: EmailPayload) {
  try {
    const response = await resend.emails.send(payload);
    const errorMessage = response.error
      ? typeof response.error === 'string'
        ? response.error
        : response.error.message || 'Resend rejected the email'
      : undefined;

    recordEmailEvent({
      channel,
      recipient,
      success: !response.error,
      error: errorMessage,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Email provider request failed';
    recordEmailEvent({
      channel,
      recipient,
      success: false,
      error: errorMessage,
    });
    throw error;
  }
}

const PREMIUM_DARK_THEME = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lumora Notification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            background-color: #030306;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #ffffff;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #030306;
            background-image:
              radial-gradient(circle at 16% 0%, rgba(168,85,247,0.28), transparent 32%),
              radial-gradient(circle at 88% 12%, rgba(34,211,238,0.18), transparent 30%),
              radial-gradient(circle at 50% 100%, rgba(236,72,153,0.12), transparent 36%);
            padding: 44px 16px 60px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(145deg, rgba(16,16,24,0.94), rgba(6,8,13,0.96));
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 34px;
            overflow: hidden;
            box-shadow: 0 36px 120px rgba(0,0,0,0.62), 0 0 64px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .header {
            padding: 38px 0 30px;
            text-align: center;
            background: radial-gradient(circle at 50% 0%, rgba(124,58,237,0.34), transparent 58%);
        }
        .mark-wrap {
            display: inline-block;
            padding: 1px;
            border-radius: 22px;
            background: linear-gradient(135deg, #a855f7, #22d3ee, #f472b6);
            box-shadow: 0 0 48px rgba(168,85,247,0.34), 0 0 30px rgba(34,211,238,0.16);
        }
        .mark {
            width: 54px;
            height: 54px;
            border-radius: 21px;
            background: linear-gradient(145deg, #070811, #151428);
            color: #ffffff;
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -1px;
        }
        .logo {
            margin-top: 16px;
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.8px;
            color: #ffffff;
            text-decoration: none;
            text-transform: uppercase;
            text-shadow: 0 0 28px rgba(168,85,247,0.42);
        }
        .logo-dot {
            color: #22d3ee;
        }
        .content {
            padding: 0 40px 42px;
        }
        .hero-section {
            text-align: center;
            margin-bottom: 32px;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 15px;
            background: rgba(34,211,238,0.11);
            border: 1px solid rgba(34,211,238,0.28);
            color: #67e8f9;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1.6px;
            text-transform: uppercase;
            margin-bottom: 24px;
            box-shadow: 0 0 28px rgba(34,211,238,0.10);
        }
        h1 {
            font-size: 36px;
            font-weight: 900;
            line-height: 1.08;
            margin: 0 0 16px;
            letter-spacing: -1.7px;
            background: linear-gradient(90deg, #ffffff, #c4b5fd, #67e8f9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            color: #a7b0c2;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 24px;
        }
        .info-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025));
            border: 1px solid rgba(255, 255, 255, 0.10);
            border-radius: 22px;
            padding: 24px;
            margin-bottom: 32px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .info-grid {
            display: table;
            width: 100%;
        }
        .info-row {
            display: table-row;
        }
        .info-cell {
            display: table-cell;
            padding: 8px 0;
        }
        .info-label {
            font-size: 12px;
            color: #7d8aa3;
            text-transform: uppercase;
            letter-spacing: 1.3px;
            font-weight: 800;
        }
        .info-value {
            font-size: 15px;
            color: #f8fafc;
            text-align: right;
            font-weight: 800;
        }
        .benefit-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: #cbd5e1;
            font-size: 14px;
        }
        .benefit-icon {
            color: #67e8f9;
            margin-right: 12px;
            font-size: 18px;
        }
        .cta-button {
            display: block;
            background: linear-gradient(90deg, #8b5cf6, #06b6d4);
            color: #ffffff;
            text-align: center;
            padding: 16px 32px;
            border-radius: 18px;
            text-decoration: none;
            font-weight: 900;
            font-size: 15px;
            margin-top: 8px;
            box-shadow: 0 18px 48px rgba(124,58,237,0.30), 0 0 24px rgba(6,182,212,0.16);
        }
        .footer {
            text-align: center;
            padding: 40px 0;
            color: #475569;
            font-size: 13px;
        }
        .footer-links {
            margin-bottom: 16px;
        }
        .footer-link {
            color: #64748b;
            text-decoration: none;
            margin: 0 10px;
        }
        .accent-text {
            color: #67e8f9;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="mark-wrap"><div class="mark">L</div></div>
                <div class="logo">Lumora<span class="logo-dot">.</span></div>
            </div>
            <div class="content">
                ${content}
            </div>
        </div>
        <div class="footer">
            <div class="footer-links">
                <a href="${SITE_URL}/terms-of-service" class="footer-link">Terms</a>
                <a href="${SITE_URL}/dashboard" class="footer-link">Dashboard</a>
                <a href="${SITE_URL}/support" class="footer-link">Support</a>
                <a href="${SITE_URL}/privacy-policy" class="footer-link">Privacy</a>
            </div>
            <p>&copy; 2025 Raxstdioz LLC. All Rights Reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export async function sendProWelcomeEmail(email: string, details: {
  invoiceId: string;
  amount: string;
  date: string;
}) {
  try {
    const { error } = await sendTrackedEmail('pro_welcome', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Welcome to Lumora Pro - Your Membership is Active',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to Lumora Pro</title>
</head>
<body style="margin:0; padding:0; background:#030305; color:#ffffff; font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">Your Lumora Pro membership is active. Open the dashboard and start creating with premium power.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#030305; background-image:radial-gradient(circle at 20% 0%, rgba(124,58,237,0.22), transparent 34%), radial-gradient(circle at 86% 18%, rgba(6,182,212,0.16), transparent 30%);">
    <tr>
      <td align="center" style="padding:46px 18px 34px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:680px;">
          <tr>
            <td style="padding:0 0 18px; text-align:center;">
              <div style="display:inline-block; padding:1px; border-radius:28px; background:linear-gradient(135deg, rgba(168,85,247,0.75), rgba(34,211,238,0.5), rgba(255,255,255,0.12)); box-shadow:0 0 60px rgba(124,58,237,0.26);">
                <div style="border-radius:27px; background:rgba(8,8,14,0.92); padding:18px 28px;">
                  <div style="font-size:24px; line-height:1; font-weight:900; letter-spacing:-0.7px; text-transform:uppercase; color:#ffffff; text-shadow:0 0 22px rgba(168,85,247,0.55);">Lumora<span style="color:#a78bfa;">.</span></div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-radius:34px; overflow:hidden; border:1px solid rgba(255,255,255,0.11); background:rgba(7,7,12,0.88); box-shadow:0 34px 120px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:46px 42px 34px; text-align:center; background-image:radial-gradient(circle at 50% 0%, rgba(124,58,237,0.28), transparent 52%), linear-gradient(135deg, rgba(124,58,237,0.10), rgba(6,182,212,0.05));">
                    <div style="display:inline-block; margin-bottom:22px; padding:8px 14px; border-radius:999px; border:1px solid rgba(167,139,250,0.36); background:rgba(124,58,237,0.16); color:#c4b5fd; font-size:11px; line-height:1; font-weight:800; letter-spacing:1.7px; text-transform:uppercase;">Membership Activated</div>
                    <h1 style="margin:0; color:#ffffff; font-size:44px; line-height:1.02; letter-spacing:-2.2px; font-weight:900;">Welcome to <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Lumora Pro</span></h1>
                    <p style="max-width:520px; margin:20px auto 0; color:#a7b0c2; font-size:16px; line-height:1.7; font-weight:500;">Your membership is live. Premium credits, faster generation, advanced AI models, and studio-grade tools are now unlocked for your account.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 42px 34px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:24px; border:1px solid rgba(255,255,255,0.10); background:rgba(255,255,255,0.045); box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);">
                      <tr>
                        <td style="padding:24px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr><td style="padding:0 0 16px; color:#ffffff; font-size:15px; font-weight:850;">Plan details</td><td align="right" style="padding:0 0 16px; color:#a78bfa; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.4px;">Active</td></tr>
                            <tr><td style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#7d8aa3; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px;">Plan</td><td align="right" style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#f8fafc; font-size:14px; font-weight:800;">Lumora Pro ($6.99/mo)</td></tr>
                            <tr><td style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#7d8aa3; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px;">Invoice ID</td><td align="right" style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#f8fafc; font-size:14px; font-weight:800;">${details.invoiceId}</td></tr>
                            <tr><td style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#7d8aa3; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px;">Amount Paid</td><td align="right" style="padding:12px 0; border-top:1px solid rgba(255,255,255,0.07); color:#f8fafc; font-size:14px; font-weight:800;">${details.amount}</td></tr>
                            <tr><td style="padding:12px 0 0; border-top:1px solid rgba(255,255,255,0.07); color:#7d8aa3; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:1.3px;">Next Billing</td><td align="right" style="padding:12px 0 0; border-top:1px solid rgba(255,255,255,0.07); color:#f8fafc; font-size:14px; font-weight:800;">${details.date}</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 42px 34px;">
                    <div style="margin:0 0 16px; color:#ffffff; font-size:16px; font-weight:850;">Key benefits unlocked</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:0 8px 12px 0;"><div style="min-height:104px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px;"><div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#8b5cf6,#22d3ee); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900; box-shadow:0 0 28px rgba(124,58,237,0.28);">&#10022;</div><div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">1,000 daily credits</div><div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Premium generation capacity every day.</div></div></td>
                        <td width="50%" style="padding:0 0 12px 8px;"><div style="min-height:104px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px;"><div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#06b6d4,#3b82f6); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900; box-shadow:0 0 28px rgba(6,182,212,0.24);">&#9889;</div><div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Priority speed</div><div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Faster processing for creative workflows.</div></div></td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:0 8px 0 0;"><div style="min-height:104px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px;"><div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#a855f7,#ec4899); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900; box-shadow:0 0 28px rgba(236,72,153,0.22);">&#9673;</div><div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Elite AI models</div><div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Access GPT-4o and Claude 3.5 Sonnet.</div></div></td>
                        <td width="50%" style="padding:0 0 0 8px;"><div style="min-height:104px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px;"><div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#f59e0b,#8b5cf6); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900; box-shadow:0 0 28px rgba(245,158,11,0.20);">&#9733;</div><div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Commercial license</div><div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Use generated assets in real projects.</div></div></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 42px 42px;">
                    <a href="${SITE_URL}/dashboard" style="display:block; width:100%; max-width:420px; border-radius:18px; background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:900; box-shadow:0 18px 48px rgba(124,58,237,0.30), 0 0 24px rgba(6,182,212,0.16);">Go to Dashboard</a>
                    <p style="margin:18px 0 0; color:#737f94; font-size:12px; line-height:1.6;">Your invoice is attached to your account history. You can manage your subscription anytime from Settings.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 12px 0;">
              <div style="color:#6b7280; font-size:12px; line-height:1.7;">
                <a href="${SITE_URL}/terms-of-service" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Terms</a>
                <a href="${SITE_URL}/dashboard" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Dashboard</a>
                <a href="${SITE_URL}/support" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Support</a>
                <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Privacy</a>
              </div>
              <div style="margin-top:18px; color:#475569; font-size:12px; line-height:1.6;">Lumora AI<br>You are receiving this email because your Lumora Pro membership was activated.<br>&copy; 2025 Raxstdioz LLC. All Rights Reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendProWelcomeEmailLegacy(email: string, details: {
  invoiceId: string;
  amount: string;
  date: string;
}) {
  try {
    const { error } = await sendTrackedEmail('payment_failed', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Welcome to Lumora Pro! 🎉 Your subscription is active',
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge">MEMBERSHIP ACTIVATED</div>
            <h1>The wait is over.<br>Welcome to <span class="accent-text">Pro.</span></h1>
            <p>Thank you for choosing Lumora. Your subscription is now active, and you've unlocked our most powerful AI engine and studio-grade features.</p>
        </div>
        
        <div class="info-card">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-cell info-label">Plan</div>
                    <div class="info-cell info-value">Lumora Pro ($6.99/mo)</div>
                </div>
                <div class="info-row">
                    <div class="info-cell info-label">Invoice ID</div>
                    <div class="info-cell info-value">${details.invoiceId}</div>
                </div>
                <div class="info-row">
                    <div class="info-cell info-label">Amount Paid</div>
                    <div class="info-cell info-value">${details.amount}</div>
                </div>
                <div class="info-row">
                    <div class="info-cell info-label">Next Billing</div>
                    <div class="info-cell info-value">${details.date}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 32px;">
            <p style="font-weight: 600; color: #ffffff; margin-bottom: 16px;">Key benefits unlocked:</p>
            <div class="benefit-item">
                <span class="benefit-icon">✦</span> 1,000 Daily Premium Credits
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✦</span> Ultra-fast Generation Speed
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✦</span> Access to GPT-4o & Claude 3.5 Sonnet
            </div>
            <div class="benefit-item">
                <span class="benefit-icon">✦</span> Commercial Usage License
            </div>
        </div>
        
        <a href="${SITE_URL}/dashboard" class="cta-button">Go to Dashboard</a>
      `),
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

export async function sendPaymentFailedEmail(email: string) {
  try {
    const { error } = await sendTrackedEmail('payment_failed', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Lumora - Payment Failed',
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: #f87171;">PAYMENT ERROR</div>
            <h1>Transaction <span class="accent-text" style="color: #f87171;">Unsuccessful.</span></h1>
            <p>Don't worry, no amount was charged from your account. We encountered an issue while processing your payment.</p>
        </div>
        
        <div class="info-card" style="text-align: center;">
            <p style="margin-bottom: 0; font-size: 14px;">This usually happens due to incorrect card details or bank restrictions. Please try again with a different payment method.</p>
        </div>
        
        <a href="${SITE_URL}/pricing" class="cta-button" style="background: #ffffff;">Retry Payment</a>
      `),
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

export async function sendCreditsPurchasedEmail(email: string, details: {
  credits: number;
  amount: string;
  invoiceId: string;
}) {
  try {
    const { error } = await sendTrackedEmail('credits_purchased', email, {
      from: SENDER_PAYMENT,
      to: email,
      subject: 'Credits Refueled ⚡',
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge">CREDITS ADDED</div>
            <h1>Power <span class="accent-text" style="color: #00e5ff;">Refueled.</span></h1>
            <p>Your permanent reserve has been topped up. These credits never expire and will be used whenever your daily allowance runs out.</p>
        </div>
        
        <div class="info-card">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; font-weight: 800; color: #00e5ff;">${details.credits}</div>
                <div style="font-size: 12px; color: #64748b; letter-spacing: 2px; font-weight: 600;">PERMANENT CREDITS</div>
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
        
        <a href="${SITE_URL}/dashboard" class="cta-button">Resume Creation</a>
      `),
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

function renderTransactionalEmail({
  preheader,
  badge,
  title,
  body,
  content,
  footerNote,
}: {
  preheader: string;
  badge: string;
  title: string;
  body: string;
  content: string;
  footerNote: string;
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Lumora</title>
</head>
<body style="margin:0; padding:0; background:#030305; color:#ffffff; font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#030305; background-image:radial-gradient(circle at 18% 0%, rgba(124,58,237,0.30), transparent 34%), radial-gradient(circle at 86% 10%, rgba(6,182,212,0.21), transparent 30%), radial-gradient(circle at 50% 100%, rgba(236,72,153,0.13), transparent 36%);">
    <tr>
      <td align="center" style="padding:48px 18px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:660px;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <div style="display:inline-block; padding:1px; border-radius:30px; background:linear-gradient(135deg, rgba(168,85,247,0.92), rgba(34,211,238,0.70), rgba(244,114,182,0.58)); box-shadow:0 0 72px rgba(124,58,237,0.34), 0 0 36px rgba(6,182,212,0.16);">
                <div style="border-radius:29px; background:rgba(8,8,14,0.94); padding:14px 22px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-right:12px;">
                        <div style="width:42px; height:42px; border-radius:16px; background:linear-gradient(145deg,#0b0c16,#171428); border:1px solid rgba(255,255,255,0.12); color:#ffffff; text-align:center; line-height:42px; font-size:24px; font-weight:900; box-shadow:inset 0 1px 0 rgba(255,255,255,0.09);">L</div>
                      </td>
                      <td style="font-size:24px; line-height:1; font-weight:900; letter-spacing:-0.7px; text-transform:uppercase; color:#ffffff; text-shadow:0 0 22px rgba(168,85,247,0.55);">Lumora<span style="color:#22d3ee;">.</span></td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-radius:36px; overflow:hidden; border:1px solid rgba(255,255,255,0.12); background:linear-gradient(145deg,rgba(12,12,19,0.95),rgba(5,7,12,0.96)); box-shadow:0 36px 130px rgba(0,0,0,0.64), 0 0 60px rgba(124,58,237,0.14), inset 0 1px 0 rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:50px 42px 32px; background-image:linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.035) 1px, transparent 1px), radial-gradient(circle at 50% 0%, rgba(124,58,237,0.34), transparent 52%), linear-gradient(135deg, rgba(124,58,237,0.14), rgba(6,182,212,0.075)); background-size:44px 44px,44px 44px,auto,auto;">
                    <div style="display:inline-block; margin-bottom:22px; padding:8px 15px; border-radius:999px; border:1px solid rgba(103,232,249,0.34); background:rgba(6,182,212,0.13); color:#67e8f9; font-size:11px; line-height:1; font-weight:900; letter-spacing:1.8px; text-transform:uppercase; box-shadow:0 0 26px rgba(6,182,212,0.11);">${badge}</div>
                    <h1 style="margin:0; color:#ffffff; font-size:44px; line-height:1.04; letter-spacing:-2.2px; font-weight:950;">${title}</h1>
                    <p style="max-width:510px; margin:20px auto 0; color:#a7b0c2; font-size:16px; line-height:1.7; font-weight:500;">${body}</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:12px 42px 44px;">
                    ${content}
                    <p style="margin:22px 0 0; color:#737f94; font-size:12px; line-height:1.6;">${footerNote}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 12px 0;">
              <div style="color:#6b7280; font-size:12px; line-height:1.7;">
                <a href="${SITE_URL}/dashboard" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Dashboard</a>
                <a href="${SITE_URL}/terms-of-service" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Terms</a>
                <a href="${SITE_URL}/support" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Support</a>
                <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Privacy</a>
              </div>
              <div style="margin:18px auto 0; max-width:430px; color:#5f6b80; font-size:12px; line-height:1.65;">Lumora AI<br>Trusted account security for your creative workspace.<br>&copy; 2025 Raxstdioz LLC. All Rights Reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export async function sendAuthOTP(email: string, otp: string) {
  try {
    const { error } = await sendTrackedEmail('auth_otp', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Your Lumora Verification Code',
      html: renderTransactionalEmail({
        preheader: 'Your Lumora verification code expires in 10 minutes.',
        badge: 'Verification Code',
        title: 'Verify your <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Lumora account</span>',
        body: 'Enter this code to finish securing your account and open your Lumora studio.',
        content: `
          <div style="margin:4px auto 24px; display:inline-block; padding:1px; border-radius:30px; background:linear-gradient(135deg, rgba(168,85,247,0.92), rgba(34,211,238,0.68), rgba(244,114,182,0.48)); box-shadow:0 0 64px rgba(124,58,237,0.32), 0 0 32px rgba(6,182,212,0.16);">
            <div style="border-radius:29px; background:linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025)); padding:28px 34px; border:1px solid rgba(255,255,255,0.11);">
              <div style="font-size:52px; line-height:1; font-weight:950; letter-spacing:10px; color:#ffffff; font-family:'SFMono-Regular','Consolas','Courier New',monospace; text-shadow:0 0 28px rgba(167,139,250,0.52);">${otp}</div>
              <div style="margin-top:14px; color:#67e8f9; font-size:10px; line-height:1; font-weight:900; letter-spacing:2px; text-transform:uppercase;">Secure verification code</div>
            </div>
          </div>
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

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  try {
    const { error } = await sendTrackedEmail('magic_link', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Your Lumora Magic Login Link',
      html: renderTransactionalEmail({
        preheader: 'Use your one-click Lumora magic link within 15 minutes.',
        badge: 'One-Click Login',
        title: 'Login to <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Lumora</span>',
        body: 'Use the secure button below to sign in without a password. This link is one-time use and expires soon.',
        content: `
          <a href="${magicLink}" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(124,58,237,0.34), 0 0 26px rgba(6,182,212,0.18);">Login to Lumora</a>
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

export async function sendWelcomeEmail(email: string) {
  try {
    const { error } = await sendTrackedEmail('welcome', email, {
      from: SENDER_WELCOME,
      to: email,
      subject: "Welcome to Lumora - Let's Create Something Amazing",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Welcome to Lumora</title>
</head>
<body style="margin:0; padding:0; background:#030305; color:#ffffff; font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">Welcome to Lumora. Your creative studio is ready.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; background:#030305; background-image:radial-gradient(circle at 18% 0%, rgba(124,58,237,0.24), transparent 36%), radial-gradient(circle at 84% 12%, rgba(6,182,212,0.17), transparent 32%);">
    <tr>
      <td align="center" style="padding:46px 18px 34px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:680px;">
          <tr>
            <td style="padding:0 0 18px; text-align:center;">
              <div style="display:inline-block; padding:1px; border-radius:28px; background:linear-gradient(135deg, rgba(168,85,247,0.78), rgba(34,211,238,0.52), rgba(255,255,255,0.12)); box-shadow:0 0 60px rgba(124,58,237,0.26);">
                <div style="border-radius:27px; background:rgba(8,8,14,0.92); padding:18px 28px;">
                  <div style="font-size:24px; line-height:1; font-weight:900; letter-spacing:-0.7px; text-transform:uppercase; color:#ffffff; text-shadow:0 0 22px rgba(168,85,247,0.55);">Lumora<span style="color:#a78bfa;">.</span></div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-radius:34px; overflow:hidden; border:1px solid rgba(255,255,255,0.11); background:rgba(7,7,12,0.90); box-shadow:0 34px 120px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:46px 42px 34px; text-align:center; background-image:radial-gradient(circle at 50% 0%, rgba(124,58,237,0.27), transparent 52%), linear-gradient(135deg, rgba(124,58,237,0.10), rgba(6,182,212,0.05));">
                    <div style="display:inline-block; margin-bottom:22px; padding:8px 14px; border-radius:999px; border:1px solid rgba(167,139,250,0.36); background:rgba(124,58,237,0.16); color:#c4b5fd; font-size:11px; line-height:1; font-weight:800; letter-spacing:1.7px; text-transform:uppercase;">Welcome to the Studio</div>
                    <h1 style="margin:0; color:#ffffff; font-size:44px; line-height:1.04; letter-spacing:-2.2px; font-weight:900;">Your creative workspace is <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">ready</span></h1>
                    <p style="max-width:520px; margin:20px auto 0; color:#a7b0c2; font-size:16px; line-height:1.7; font-weight:500;">We are thrilled to have you here. Lumora gives you a polished set of AI tools for visuals, writing, productivity, and everyday creative work.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 42px 34px;">
                    <div style="margin:0 0 16px; color:#ffffff; font-size:16px; font-weight:850;">Start creating right away</div>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding:0 8px 12px 0;">
                          <div style="min-height:118px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                            <div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#8b5cf6,#22d3ee); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900;">&#10022;</div>
                            <div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Try AI Image Generator</div>
                            <div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Turn prompts into polished images in seconds.</div>
                          </div>
                        </td>
                        <td width="50%" style="padding:0 0 12px 8px;">
                          <div style="min-height:118px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                            <div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#06b6d4,#3b82f6); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900;">&#9673;</div>
                            <div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Remove backgrounds</div>
                            <div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Clean up product shots and profile images instantly.</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding:0 8px 12px 0;">
                          <div style="min-height:118px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                            <div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#a855f7,#ec4899); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900;">&#9998;</div>
                            <div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Chat with Lumora AI</div>
                            <div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Brainstorm, write, plan, and solve problems faster.</div>
                          </div>
                        </td>
                        <td width="50%" style="padding:0 0 12px 8px;">
                          <div style="min-height:118px; border-radius:20px; border:1px solid rgba(255,255,255,0.09); background:rgba(255,255,255,0.035); padding:18px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                            <div style="width:34px; height:34px; border-radius:13px; background:linear-gradient(135deg,#14b8a6,#8b5cf6); color:#ffffff; text-align:center; line-height:34px; font-size:16px; font-weight:900;">&#9889;</div>
                            <div style="margin-top:14px; color:#ffffff; font-size:14px; font-weight:850;">Use productivity tools</div>
                            <div style="margin-top:6px; color:#8792a8; font-size:12px; line-height:1.5;">Summarize, convert, organize, and ship daily work.</div>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px; border-radius:22px; border:1px solid rgba(167,139,250,0.25); background:linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.055)); box-shadow:inset 0 1px 0 rgba(255,255,255,0.07);">
                      <tr>
                        <td style="padding:22px;">
                          <div style="color:#c4b5fd; font-size:13px; font-weight:850; letter-spacing:0.2px;">Want more power later?</div>
                          <p style="margin:8px 0 14px; color:#cbd5e1; font-size:13px; line-height:1.65;">Lumora Pro unlocks 1,000 daily premium credits, faster generation, advanced AI models, and commercial-ready workflows.</p>
                          <a href="${SITE_URL}/pro" style="color:#67e8f9; font-size:13px; font-weight:850; text-decoration:none;">Explore Pro benefits &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:0 42px 42px;">
                    <a href="${SITE_URL}/dashboard" style="display:block; width:100%; max-width:420px; border-radius:18px; background:linear-gradient(90deg,#7c3aed,#06b6d4); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:900; box-shadow:0 18px 48px rgba(124,58,237,0.30), 0 0 24px rgba(6,182,212,0.16);">Go to Dashboard</a>
                    <p style="margin:18px 0 0; color:#737f94; font-size:12px; line-height:1.6;">Your free Lumora account is ready. Start with any tool and build from there.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 12px 0;">
              <div style="color:#6b7280; font-size:12px; line-height:1.7;">
                <a href="${SITE_URL}/terms-of-service" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Terms</a>
                <a href="${SITE_URL}/dashboard" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Dashboard</a>
                <a href="${SITE_URL}/help" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Support</a>
                <a href="${SITE_URL}/privacy-policy" style="color:#94a3b8; text-decoration:none; margin:0 10px;">Privacy</a>
              </div>
              <div style="margin-top:18px; color:#475569; font-size:12px; line-height:1.6;">Lumora AI<br>You are receiving this email because you created a Lumora account.<br>&copy; 2025 Raxstdioz LLC. All Rights Reserved.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendWelcomeEmailLegacy(email: string) {
  try {
    await resend.emails.send({
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Welcome to Lumora! Let\'s build the future 🚀',
      html: PREMIUM_DARK_THEME(`
        <div class="hero-section">
            <div class="status-badge">WELCOME TO THE STUDIO</div>
            <h1>Your Creative Journey <span class="accent-text">Starts Here.</span></h1>
            <p>We're thrilled to have you on board. Lumora is designed to be your ultimate creative companion. Here are a few things you can do right now:</p>
        </div>
        
        <div style="margin-bottom: 32px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">✨ Generate Stunning AI Art</h3>
                <p style="font-size: 14px; margin-bottom: 0;">Use our Image Generator to turn your words into high-resolution visuals.</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
                <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">🎬 Advanced Video Tools</h3>
                <p style="font-size: 14px; margin-bottom: 0;">Enhance, trim, or generate subtitles for your videos with studio-grade precision.</p>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px;">
                <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">🤖 Chat with Genius Models</h3>
                <p style="font-size: 14px; margin-bottom: 0;">Access GPT-4o and Claude 3.5 Sonnet to solve complex problems.</p>
            </div>
        </div>

        <div class="info-card" style="border-color: rgba(124, 58, 237, 0.3); background: rgba(124, 58, 237, 0.05);">
            <h3 style="color: #a78bfa; margin-top: 0;">Unlock Elite Power</h3>
            <p style="color: #cbd5e1; font-size: 14px;">Want unlimited access and 1,000 daily credits? Upgrade to Lumora Pro for just $6.99/mo and join the top 1% of creators.</p>
            <a href="${SITE_URL}/pricing" style="color: #a78bfa; font-weight: bold; text-decoration: none; font-size: 14px;">View Pro Benefits →</a>
        </div>
        
        <a href="${SITE_URL}/dashboard" class="cta-button">Launch Your Dashboard</a>
      `),
    });
    return true;
  } catch (error) {
    console.error('Email failed:', error);
    return false;
  }
}
export async function sendResetPasswordEmail(email: string, token: string) {
  try {
    const resetLink = `${SITE_URL}/auth/reset-password?token=${token}&email=${email}`;
    
    const { error } = await sendTrackedEmail('password_reset', email, {
      from: SENDER_NOREPLY,
      to: email,
      subject: 'Reset Your Lumora Password',
      html: renderTransactionalEmail({
        preheader: 'Reset your Lumora password within 10 minutes.',
        badge: 'Security Request',
        title: 'Password <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">Recovery</span>',
        body: 'We received a request to reset your Lumora password. If this was you, use the secure button below to choose a new password.',
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
      subject: 'Your Lumora Password Was Changed',
      html: renderTransactionalEmail({
        preheader: 'Your Lumora password was changed successfully.',
        badge: 'Security Alert',
        title: 'Password <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">changed</span>',
        body: 'This is a confirmation that your Lumora account password was updated. If you made this change, no further action is needed.',
        content: `
          <div style="max-width:440px; margin:0 auto 20px; border-radius:22px; border:1px solid rgba(16,185,129,0.24); background:linear-gradient(135deg, rgba(16,185,129,0.10), rgba(34,211,238,0.045)); padding:18px;">
            <p style="margin:0; color:#b7f7d3; font-size:12px; line-height:1.65;">Your account password was changed successfully. Future sign-ins will require the new password.</p>
          </div>
          <a href="${SITE_URL}/auth/login" style="display:block; width:100%; max-width:420px; border-radius:20px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 0; font-size:15px; font-weight:950; box-shadow:0 18px 52px rgba(124,58,237,0.34), 0 0 26px rgba(6,182,212,0.18);">Review Account</a>
          <div style="margin-top:24px; padding:18px; border-radius:22px; border:1px solid rgba(245,158,11,0.22); background:linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,0.025));">
            <p style="margin:0; color:#f8d294; font-size:12px; line-height:1.65;">If you did not change your password, reset it immediately and contact Lumora support.</p>
          </div>
        `,
        footerNote: "Lumora sends this alert whenever your account password changes.",
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
