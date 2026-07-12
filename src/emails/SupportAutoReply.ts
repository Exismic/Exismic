import { renderTransactionalEmail } from '@/lib/emails';
import { getServerSiteUrl } from '@/lib/site-url';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function getSupportAutoReplyHtml(name: string, subject: string): string {
  const firstName = escapeHtml(name.trim().split(/\s+/)[0] || 'there');
  const safeSubject = escapeHtml(subject.trim());
  const siteUrl = getServerSiteUrl();

  return renderTransactionalEmail({
    preheader: `We received your Exismic support request about ${safeSubject}.`,
    badge: 'Request Received',
    title: `We&rsquo;re on it, <span style="background:linear-gradient(90deg,#c4b5fd,#67e8f9,#ffffff); -webkit-background-clip:text; background-clip:text; color:#a78bfa;">${firstName}</span>`,
    body: 'Your message is safely in our support queue. A member of the Exismic team will review it and reply directly to this email address.',
    content: `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%; max-width:500px; margin:0 auto 24px; border-radius:22px; border:1px solid rgba(255,255,255,0.10); background:linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025));">
        <tr>
          <td style="padding:22px; text-align:left;">
            <div style="color:#738098; font-size:10px; font-weight:900; letter-spacing:1.7px; text-transform:uppercase;">Request topic</div>
            <div style="margin-top:8px; color:#ffffff; font-size:16px; line-height:1.5; font-weight:800; word-break:break-word;">${safeSubject}</div>
            <div style="height:1px; margin:20px 0; background:rgba(255,255,255,0.08);"></div>
            <div style="color:#a7b0c2; font-size:13px; line-height:1.7;">Most requests receive a response within 24 hours. Billing and account-security requests are prioritized.</div>
          </td>
        </tr>
      </table>
      <a class="email-button" href="${siteUrl}/dashboard" style="display:block; width:100%; max-width:420px; margin:0 auto; box-sizing:border-box; border-radius:18px; background:linear-gradient(90deg,#8b5cf6,#06b6d4,#22d3ee); color:#ffffff; text-decoration:none; text-align:center; padding:18px 22px; font-size:14px; font-weight:900; box-shadow:0 18px 48px rgba(124,58,237,0.30),0 0 24px rgba(6,182,212,0.16);">Return to Exismic</a>
    `,
    footerNote: "If you didn't submit this request, reply to this email so our team can investigate.",
  });
}
