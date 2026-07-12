const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const baseUrl = process.argv[2] || 'http://localhost:3000';
const toolSource = fs.readFileSync(path.join(root, 'src', 'data', 'tools.ts'), 'utf8');
const toolPaths = [...toolSource.matchAll(/href:\s*'([^']+)'/g)].map((match) => match[1]);
const publicPaths = [
  '/', '/tools', '/pro', '/pro/benefits', '/about', '/help', '/blog', '/careers', '/shop',
  '/privacy-policy', '/terms-of-service',
];
const paths = [...new Set([...toolPaths.filter((route) => route !== '/chat'), ...publicPaths])];

function matchTag(html, pattern) {
  return html.match(pattern)?.[1] || null;
}

async function auditPath(route) {
  try {
    const response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
    const html = await response.text();
    const canonical = matchTag(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
      || matchTag(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
    const robots = matchTag(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
    return { route, status: response.status, location: response.headers.get('location'), canonical, robots };
  } catch (error) {
    return { route, status: 0, error: error instanceof Error ? error.message : String(error) };
  }
}

async function main() {
  const duplicatePaths = toolPaths.filter((route, index) => toolPaths.indexOf(route) !== index);
  if (duplicatePaths.length) throw new Error(`Duplicate tool URLs: ${[...new Set(duplicatePaths)].join(', ')}`);

  const results = [];
  for (let index = 0; index < paths.length; index += 6) {
    results.push(...await Promise.all(paths.slice(index, index + 6).map(auditPath)));
  }

  const badStatus = results.filter((result) => result.status !== 200);
  const missingCanonical = results.filter((result) => result.status === 200 && !result.canonical);
  const redirecting = results.filter((result) => result.status >= 300 && result.status < 400);
  const canonicalMismatch = results.filter((result) => {
    if (!result.canonical || result.status !== 200) return false;
    try {
      const canonicalPath = new URL(result.canonical).pathname.replace(/\/+$/, '') || '/';
      const routePath = result.route.replace(/\/+$/, '') || '/';
      return canonicalPath !== routePath;
    } catch {
      return true;
    }
  });

  for (const result of badStatus) {
    console.error(`BAD ${result.status} ${result.route}${result.location ? ` -> ${result.location}` : ''}`);
  }
  for (const result of missingCanonical) console.error(`NO CANONICAL ${result.route}`);
  for (const result of canonicalMismatch) console.error(`CANONICAL MISMATCH ${result.route} -> ${result.canonical}`);

  const robotsResponse = await fetch(`${baseUrl}/robots.txt`);
  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);
  const robotsText = await robotsResponse.text();
  const sitemapText = await sitemapResponse.text();
  const indexingEnabled = sitemapText.includes('<url>');
  const missingLaunchNoIndex = indexingEnabled
    ? []
    : results.filter((result) => result.status === 200 && !/noindex/i.test(result.robots || ''));

  console.log(`Checked ${results.length} public and tool routes.`);
  console.log(`${results.length - badStatus.length} returned 200; ${redirecting.length} redirected; ${badStatus.length - redirecting.length} failed.`);
  console.log(`${results.length - missingCanonical.length} expose canonical URLs.`);
  console.log(`robots.txt ${robotsResponse.status}; sitemap.xml ${sitemapResponse.status}.`);
  console.log(`Indexing gate: ${indexingEnabled ? 'enabled' : 'disabled'}; sitemap advertised: ${/sitemap:/i.test(robotsText) ? 'yes' : 'no'}.`);
  if (!indexingEnabled) console.log(`${results.length - missingLaunchNoIndex.length} routes expose launch-safe noindex directives.`);

  if (badStatus.length || missingCanonical.length || canonicalMismatch.length || missingLaunchNoIndex.length || !robotsResponse.ok || !sitemapResponse.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
