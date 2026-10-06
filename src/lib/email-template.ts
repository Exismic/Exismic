import { getServerSiteUrl } from './site-url';

const siteUrl = getServerSiteUrl();

export function escapeEmailHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

export function emailButton(url: string, label: string) {
  const href = escapeEmailHtml(url);
  const arrow = /&rarr;|→/.test(label) ? '' : '&nbsp; &rarr;';
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;width:100%;max-width:440px;border-collapse:separate;"><tr><td bgcolor="#7c3aed" align="center" style="background-color:#7c3aed;border-radius:12px;"><a class="email-button-link" data-exismic-button="true" href="${href}" target="_blank" style="display:block;border:1px solid #a78bfa;border-radius:12px;padding:16px 20px;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:700;text-align:center;word-break:normal;">${label}${arrow}</a></td></tr></table>`;
}

export function emailCode(code: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="width:100%;max-width:320px;margin:24px auto;"><tr><td align="center" bgcolor="#211a32" style="padding:24px 12px;border:1px solid #57416e;border-radius:16px;background-color:#211a32;"><div style="font:700 34px/1.2 'Courier New',monospace;letter-spacing:5px;color:#f9f5ff;">${escapeEmailHtml(code)}</div><div style="margin-top:12px;color:#baa6dd;font-size:9px;font-weight:700;line-height:16px;letter-spacing:1.3px;text-transform:uppercase;">${escapeEmailHtml(label)}</div></td></tr></table>`;
}

export function emailDetails(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;border:1px solid #2b3445;border-radius:12px;background-color:#151c29;margin:20px 0;">${rows.map(([label, value]) => `<tr><td class="email-detail-label" width="36%" valign="top" style="padding:12px 16px;color:#aab5c6;font-size:12px;line-height:20px;border-bottom:1px solid #273143;">${escapeEmailHtml(label)}</td><td class="email-detail-value" valign="top" style="padding:12px 16px;color:#f4f6fb;font-size:13px;line-height:20px;font-weight:600;word-break:break-word;border-bottom:1px solid #273143;">${escapeEmailHtml(value)}</td></tr>`).join('')}</table>`;
}

export function emailPanel(content: string) {
  return `<div class="email-panel" style="padding:22px;border:1px solid #333345;border-radius:16px;background-color:#14141f;margin:18px 0;text-align:left;word-break:break-word;">${content}</div>`;
}

/** Keep transactional HTML readable without depending on effects email clients strip. */
export function normalizeEmailContent(html: string): string {
  const legacyStyles: Record<string, string> = {
    'hero-section': 'text-align:left;margin-bottom:24px;',
    'status-badge': 'display:inline-block;color:#bba5ff;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;',
    'info-card': 'background-color:#14141f;border:1px solid #333345;border-radius:16px;padding:20px;margin-bottom:20px;',
    'info-grid': 'display:table;width:100%;table-layout:fixed;',
    'info-row': 'display:table-row;',
    'info-cell': 'display:table-cell;padding:10px 0;vertical-align:top;word-break:break-word;',
    'info-label': 'font-size:12px;color:#aab5c6;',
    'info-value': 'font-size:13px;color:#f4f6fb;text-align:right;font-weight:600;',
    'accent-text': 'color:#bba5ff;',
  };
  let content = html.replace(/<([a-z]+)([^>]*\bclass="([^"]+)"[^>]*)>/gi, (tag, name, attrs, classes) => {
    const styles = (classes as string).split(/\s+/).map(key => legacyStyles[key] || '').join('');
    if (!styles) return tag;
    const existing = /style="([^"]*)"/i.exec(attrs)?.[1] || '';
    return `<${name}${attrs.replace(/\sstyle="[^"]*"/i, '')} style="${styles}${existing}">`;
  });
  content = content
    .replace(/style="([^"]*)"/gi, (tag, style: string) => /background-clip:\s*text/i.test(style) ? `style="${style.replace(/background:\s*linear-gradient\([^;]+\);?/gi, '')}"` : tag)
    .replace(/(?:box-shadow|text-shadow|background-image|background-size|-webkit-background-clip|background-clip):[^;"}]+;?/gi, '')
    .replace(/background:\s*linear-gradient\([^;]+\);/gi, 'background-color:#151c29;')
    .replace(/border-radius:\s*(?:[2-9]\d)px/gi, 'border-radius:16px')
    .replace(/font-weight:\s*(?:800|850|900|950)/gi, 'font-weight:700')
    .replace(/font-size:\s*52px/gi, 'font-size:32px')
    .replace(/letter-spacing:\s*10px/gi, 'letter-spacing:5px')
    .replace(/padding:\s*28px 34px/gi, 'padding:20px 16px')
    .replace(/max-height:400px;\s*overflow-y:auto;/gi, '')
    .replace(/href="([^"<>]+)"/gi, (_tag, href: string) => {
      const decoded = href.replaceAll('&amp;', '&');
      const absolute = decoded.startsWith('/') ? `${siteUrl}${decoded}` : decoded;
      if (!/^(https?:\/\/|mailto:)/i.test(absolute)) return '';
      return `href="${escapeEmailHtml(absolute)}"`;
    })
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (anchor, attrs: string, label: string) => {
      if (attrs.includes('data-exismic-button')) return anchor;
      if (!/cta-button|background(?:-color)?:|display:\s*block/.test(attrs)) return anchor;
      const href = /href="([^"]+)"/.exec(attrs)?.[1];
      if (!href) return label;
      return emailButton(href.replaceAll('&amp;', '&'), label);
    });
  return content;
}

export function renderEmail({ preheader, badge, title, body = '', content, footerNote = '' }: {
  preheader: string; badge: string; title: string; body?: string; content: string; footerNote?: string;
}) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>Exismic</title><style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table{mso-table-lspace:0pt;mso-table-rspace:0pt;}a{color:#c4b5fd;}p{margin:0 0 16px;color:#b8b8cc;font-size:14px;line-height:1.75;}h1,h2,h3{color:#f7f6ff;line-height:1.25;}h1{font-size:34px;}h2{font-size:22px;}h3{font-size:17px;}img{max-width:100%;height:auto;border:0;}
    .email-button-link{background-image:linear-gradient(110deg,#8b5cf6,#6d28d9);box-shadow:0 7px 20px rgba(109,40,217,.15);}.email-panel{background-image:linear-gradient(135deg,#191824,#12151e);}
    @media only screen and (max-width:620px){.email-outer{padding:24px 12px!important;}.email-hero{padding:30px 22px 22px!important;}.email-content{padding:0 22px 28px!important;}.email-title{font-size:28px!important;letter-spacing:-.8px!important;}.email-detail-label,.email-detail-value,.info-cell{display:block!important;width:auto!important;text-align:left!important;}.email-detail-label{padding-bottom:2px!important;}.email-detail-value{padding-top:2px!important;}.email-body>div{max-width:100%!important;box-sizing:border-box!important;}.email-hero-copy{font-size:14px!important;}.email-top-tagline{font-size:10px!important;letter-spacing:1.5px!important;}.email-panel{padding:18px!important;}}
    </style></head><body style="margin:0;padding:0;background-color:#09090f;color:#f7f6ff;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">${escapeEmailHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#09090f" style="background-color:#09090f;background-image:radial-gradient(ellipse at 18% 0%,#1d1031 0%,transparent 45%),radial-gradient(ellipse at 92% 15%,#062027 0%,transparent 42%);"><tr><td class="email-outer" align="center" style="padding:40px 16px;">
    <!--[if mso]><table role="presentation" width="600" align="center"><tr><td><![endif]-->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;table-layout:fixed;">
    <tr><td align="center" style="padding:0 0 26px;"><table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td width="40" style="padding-right:10px;"><a href="${siteUrl}"><img src="${siteUrl}/exismic-app-icon.png" alt="" width="38" height="38" style="display:block;width:38px;height:38px;border-radius:10px;"></a></td><td><a href="${siteUrl}" style="color:#ffffff;text-decoration:none;font-size:23px;font-weight:700;letter-spacing:-.7px;">EXISMIC<span style="color:#a78bfa;">.</span></a></td></tr></table><p class="email-top-tagline" style="margin:12px 0 0;color:#9b91b3;font-size:10px;line-height:16px;font-weight:600;letter-spacing:2px;">YOUR IDEAS. YOUR WORKSPACE.</p></td></tr>
    <tr><td bgcolor="#11111b" style="background-color:#11111b;border:1px solid #343044;border-radius:22px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;">
    <tr><td class="email-hero" align="center" bgcolor="#181629" style="padding:38px 36px 28px;background-color:#181629;background-image:linear-gradient(135deg,#241a3a,#151625 60%,#10232b);border-radius:21px 21px 0 0;border-bottom:1px solid #332d43;">
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;max-width:100%;"><tr><td style="padding:7px 13px;background-color:#272038;border:1px solid #57416e;border-radius:8px;color:#d2baff;font-size:10px;line-height:16px;font-weight:700;letter-spacing:1.1px;text-align:center;text-transform:uppercase;word-break:break-word;">${escapeEmailHtml(badge)}</td></tr></table>
    <h1 class="email-title" style="margin:0 0 16px;font-size:34px;line-height:1.2;font-weight:700;letter-spacing:-1.1px;color:#faf8ff;text-align:center;">${normalizeEmailContent(title)}</h1>
    ${body ? `<p class="email-hero-copy" style="margin:0;color:#bdb9d1;font-size:15px;line-height:1.8;text-align:center;">${normalizeEmailContent(body)}</p>` : ''}</td></tr>
    <tr><td class="email-content email-body" style="padding:8px 32px 32px;word-break:break-word;font-size:14px;line-height:1.7;color:#f4f1ff;">${normalizeEmailContent(content)}${footerNote ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr><td style="padding-top:20px;border-top:1px solid #302a3c;font-size:12px;line-height:1.7;color:#9e97b2;">${normalizeEmailContent(footerNote)}</td></tr></table>` : ''}</td></tr></table></td></tr>
    <tr><td align="center" style="padding:24px 8px 0;color:#777187;font-size:11px;line-height:2;"><a href="${siteUrl}/tools" style="color:#b7adc9;text-decoration:none;">Open Exismic</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${siteUrl}/help" style="color:#b7adc9;text-decoration:none;">Help Center</a>&nbsp;&nbsp;&middot;&nbsp;&nbsp;<a href="${siteUrl}/privacy-policy" style="color:#b7adc9;text-decoration:none;">Privacy</a><br>Made for everyday creative work.<br>&copy; ${new Date().getFullYear()} Exismic</td></tr></table>
    <!--[if mso]></td></tr></table><![endif]--></td></tr></table></body></html>`;
}

export function renderLegacyEmail(content: string, preheader = 'An update from Exismic') {
  const title = /<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/i.exec(content)?.[1] || 'An update from Exismic';
  const badge = /<div\b[^>]*class="status-badge"[^>]*>([\s\S]*?)<\/div>/i.exec(content)?.[1]?.replace(/<[^>]+>/g, '') || 'Account update';
  const body = /<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(content)?.[1] || '';
  const bodyContent = content.replace(/<h[12]\b[^>]*>[\s\S]*?<\/h[12]>/i, '').replace(/<div\b[^>]*class="status-badge"[^>]*>[\s\S]*?<\/div>/i, '').replace(/<p\b[^>]*>[\s\S]*?<\/p>/i, '').replace(/<div\b[^>]*class="hero-section"[^>]*>\s*<\/div>/i, '');
  return renderEmail({ preheader, badge, title, body, content: bodyContent });
}
