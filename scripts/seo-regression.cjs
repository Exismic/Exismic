// Read-only HTTP regression checks. Run against a local production server or a deployment.
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000';
const failures = [];
const pages = new Map();
const canonicalOrigin = 'https://www.exismic.xyz';
const normalize = (path) => path.replace(/\/+$/, '') || '/';
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1].toLowerCase(), m[2]]));
const tags = (html, name) => [...html.matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map((m) => attributes(m[0]));
const canonical = (html) => tags(html, 'link').filter((tag) => tag.rel === 'canonical');
const text = (html) => html.replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const decodedText = (value) => text(value)
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, hex, decimal) => String.fromCodePoint(parseInt(hex || decimal, hex ? 16 : 10)))
  .replace(/\s+/g, ' ').trim();
function check(condition, message) { if (!condition) failures.push(message); }
async function get(path, userAgent) {
  const response = await fetch(new URL(path, base), {
    redirect: 'manual', signal: AbortSignal.timeout(120000),
    headers: { 'User-Agent': userAgent || 'Exismic-SEO-Regression/1.0' },
  });
  return { response, html: await response.text() };
}
async function main() {
  const first = await get('/sitemap.xml');
  assert.equal(first.response.status, 200, 'Sitemap must return 200');
  const urls = [...first.html.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]));
  assert.ok(urls.length > 100, 'Expected the full public sitemap');
  check(new Set(urls.map(String)).size === urls.length, 'Duplicate sitemap URLs');
  check(!urls.some((url) => url.pathname === '/pricing'), 'Redirect alias /pricing must not be in the sitemap');
  for (const path of ['/delivery-policy', '/dmca', '/brand']) check(urls.some((u) => u.pathname === path), 'Public page missing: ' + path);
  const dates = [...first.html.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1]);
  check(dates.every((value) => Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now()), 'Invalid/future lastmod');
  for (let i = 0; i < urls.length; i += 4) {
    await Promise.all(urls.slice(i, i + 4).map(async (url) => {
      try {
        const { response, html } = await get(url.pathname);
        check(response.status === 200, url.pathname + ' returned ' + response.status);
        const links = canonical(html);
        check(links.length === 1, url.pathname + ' canonical count: ' + links.length);
        check(links[0] && normalize(links[0].href) === normalize(canonicalOrigin + url.pathname), url.pathname + ' canonical mismatch');
        const robots = tags(html, 'meta').filter((tag) => ['robots', 'googlebot'].includes(tag.name?.toLowerCase()));
        check(robots.length > 0 && robots.every((tag) => !/noindex|nofollow/i.test(tag.content)), url.pathname + ' restrictive/missing robots');
        check(!/noindex|nofollow/i.test(response.headers.get('x-robots-tag') || ''), url.pathname + ' restrictive header');
        check((html.match(/<h1\b/gi) || []).length === 1, url.pathname + ' must have one H1');
        const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
        const description = tags(html, 'meta').find((tag) => tag.name === 'description')?.content;
        check(Boolean(title && description), url.pathname + ' missing title/description');
        const schemas = [];
        for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
          const parsed = JSON.parse(match[1]);
          schemas.push(...(Array.isArray(parsed) ? parsed : [parsed]));
        }
        if (url.pathname.startsWith('/tools/')) {
          for (const type of ['SoftwareApplication', 'BreadcrumbList', 'FAQPage', 'HowTo']) check(schemas.filter((s) => s['@type'] === type).length === 1, url.pathname + ' schema count for ' + type);
          const application = schemas.find((s) => s['@type'] === 'SoftwareApplication');
          const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList');
          check(application?.url === canonicalOrigin + url.pathname, url.pathname + ' application URL mismatch');
          if (['/tools/ai/img-gen', '/tools/ai/logo'].includes(url.pathname)) {
            check(application?.isAccessibleForFree === false && application?.offers?.price !== '0', url.pathname + ' falsely advertises free Pro generation');
          }
          check(breadcrumb?.itemListElement?.at(-1)?.item === canonicalOrigin + url.pathname, url.pathname + ' breadcrumb URL mismatch');
          const body = decodedText(html);
          for (const faq of schemas.find((s) => s['@type'] === 'FAQPage')?.mainEntity || []) {
            check(body.includes(decodedText(faq.name)) && body.includes(decodedText(faq.acceptedAnswer.text)), url.pathname + ' FAQ schema does not match rendered content');
          }
          for (const step of schemas.find((s) => s['@type'] === 'HowTo')?.step || []) {
            check(body.includes(decodedText(step.text)), url.pathname + ' HowTo schema does not match rendered content');
          }
          const guide = html.match(/<section\b[^>]*class="[^"]*mt-2 sm:mt-4 w-full text-left[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0];
          check(Boolean(guide), url.pathname + ' missing server-rendered guide');
          check(!/style="[^"]*opacity:\s*0(?:;|")/.test(guide || ''), url.pathname + ' guide starts invisible');
        }
        const outbound = tags(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''), 'a').flatMap((tag) => {
          if (!tag.href) return [];
          try { const link = new URL(tag.href.replace(/&amp;/g, '&'), canonicalOrigin); return link.origin === canonicalOrigin ? [normalize(link.pathname)] : []; } catch { return []; }
        });
        pages.set(normalize(url.pathname), { html, title, description, outbound, schemas });
      } catch (error) { failures.push(url.pathname + ': ' + error.message); }
    }));
    console.log('Checked ' + Math.min(i + 4, urls.length) + '/' + urls.length);
  }
  for (const key of ['title', 'description']) {
    const seen = new Map();
    for (const [path, page] of pages) {
      if (page[key] && seen.has(page[key])) failures.push('Duplicate ' + key + ': ' + path + ', ' + seen.get(page[key]));
      seen.set(page[key], path);
    }
  }
  const depth = new Map([['/', 0]]), queue = ['/'];
  for (let i = 0; i < queue.length; i++) for (const next of pages.get(queue[i])?.outbound || []) {
    if (!depth.has(next)) { depth.set(next, depth.get(queue[i]) + 1); queue.push(next); }
  }
  for (const path of pages.keys()) check(depth.has(path), 'Orphan sitemap page: ' + path);
  for (const path of pages.keys()) if (path.startsWith('/tools/')) check(depth.get(path) <= 2, 'Tool too deep: ' + path);
  const contentChecks = [
    ['/tools/audio/tts', /Type or paste your script/, /Drop your audio track|Clean Vocal Isolation/],
    ['/tools/image/minecraft-skin', /server endpoints for processing/, /never stored, saved|privately on your device/],
    ['/tools/productivity/passgen', /Things to know/, /Generate resumes, barcodes/],
    ['/tools/productivity/units', /Examples to try/, /Generate resumes, barcodes/],
    ['/tools/ai-detector', /misclassify both human and AI writing/, /Creative Brainstorming/],
    ['/tools/citation-generator', /Check names, dates, titles/, /Summarize textbooks/],
    ['/tools/video/to-gif', /320, 480, or 640 pixels/, /zero server waiting|Fast In-Browser Cuts/],
    ['/tools/pdf/compressor', /does not downsample embedded pictures/, /100% Private & Local|40% and 80%/],
    ['/tools/pdf/to-word', /does not reconstruct fonts, tables, pictures/, /with intact layout/],
    ['/tools/ai/img-gen', /Image dimensions/, /Tune the tone, length/],
    ['/tools/ai/logo', /does not trace the picture/, /Infinitely scalable vector/],
    ['/tools/creator/teleprompter', /does not record or export video/, /Crisp PNG and MP4 downloads/],
    ['/tools/hash-generator', /without checking whether the text is valid code/, /highlights formatting mistakes and syntax errors/],
    ['/tools/audio/noise-remover', /does not change how an uploaded recording is cleaned/, /100% royalty-free/],
    ['/tools/student/plagiarism-checker', /compares only the two supplied texts/, /web-wide plagiarism search included/],
    ['/tools/creator/thumbnail-analyzer', /does not access YouTube analytics/, /predict a verified click-through rate with certainty/],
    ['/tools/pdf-to-notes', /first 18,000 characters/, /entire document without limits/],
    ['/tools/image/vectorizer', /send the image to the server fallback/, /runs entirely in your browser session/],
    ['/tools/creator/carousel-generator', /edits the supplied slides/, /AI-generated researched article/],
  ];
  for (const [path, expected, forbidden] of contentChecks) {
    const body = text(pages.get(path)?.html || '');
    check(expected.test(body), 'Missing corrected content: ' + path);
    check(!forbidden.test(body), 'Old mismatched content: ' + path);
  }
  for (const path of ['/developer/docs', '/appeal', '/community', '/rewards', '/rewards/guide', '/tools/support-agent', '/tools/text-to-3d']) {
    const { response, html } = await get(path);
    check(response.status === 200, path + ' metadata route status');
    check(canonical(html).some((tag) => tag.href === canonicalOrigin + path), path + ' missing explicit canonical');
    if (['/tools/support-agent', '/tools/text-to-3d'].includes(path)) check(tags(html, 'meta').some((tag) => tag.name === 'robots' && /noindex/.test(tag.content)), path + ' must remain excluded');
  }
  const bot = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  for (const path of ['/delivery-policy', '/dmca', '/brand', '/refund-policy', '/tools/audio/tts', '/tools/image/minecraft-skin']) {
    const { response, html } = await get(path, bot);
    check(response.status === 200 && text(html) === text(pages.get(path)?.html || ''), path + ' Googlebot-style mismatch');
  }
  for (const path of ['/account', '/dashboard', '/admin']) {
    const { response } = await get(path);
    check([302, 307].includes(response.status) && /\/auth\/login/.test(response.headers.get('location') || ''), 'Private route no longer protected: ' + path);
  }
  for (const [alias, destination] of [['/pricing', '/pro'], ['/shipping-policy', '/delivery-policy'], ['/copyright', '/dmca'], ['/press', '/brand']]) {
    const { response } = await get(alias);
    check([301, 308].includes(response.status), 'Expected permanent redirect: ' + alias);
    check(new URL(response.headers.get('location') || '/', base).pathname === destination, 'Wrong alias destination: ' + alias);
  }
  const second = await get('/sitemap.xml');
  check(first.html === second.html, 'Sitemap changes without a content update');
  const robots = await get('/robots.txt');
  check(robots.response.status === 200 && /Sitemap:/i.test(robots.html), 'Missing robots/sitemap declaration');
  if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
  else console.log('PASS: ' + urls.length + ' sitemap pages; canonical, robots, headings, schema, discovery, corrected copy, aliases and private-route checks.');
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
