// Offline rendering checks. No server, accounts, AI calls or external requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const { PassThrough } = require('node:stream');
const React = require('react');
const { renderToPipeableStream, renderToStaticMarkup } = require('react-dom/server');
const ts = require('typescript');
const repo = path.resolve(__dirname, '..');
const originalLoad = Module._load;
const cache = new Map();
const loaded = new Set();
let dynamicOptions;
let checks = 0;
global.fetch = async () => { throw new Error('Network forbidden in offline rendering test'); };
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.exismic.xyz';
process.env.SEO_INDEXING_ENABLED = 'true';

function check(fn) { fn(); checks++; }
function load(filename) {
  filename = path.resolve(filename);
  if (cache.has(filename)) return cache.get(filename).exports;
  loaded.add(path.relative(repo, filename).replaceAll('\\', '/'));
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  cache.set(filename, mod);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  mod._compile(compiled + (filename.endsWith('MinecraftSkinWorkspace.tsx') ? '\nexports.__EditorLoading = EditorLoading;' : ''), filename);
  return mod.exports;
}
Module._load = function (request, parent, ...rest) {
  if (request === 'next/dynamic') {
    // Use the installed App Router implementation, including its real SSR bailout
    // and inner Suspense boundary, rather than the Pages Router default export.
    return (loader, options) => {
      dynamicOptions = options;
      return originalLoad.call(this, 'next/dist/shared/lib/app-dynamic', parent)(loader, options);
    };
  }
  if (request === 'axios') return { get() { throw new Error('Network forbidden'); }, post() { throw new Error('Network forbidden'); } };
  if (request === 'next/navigation') return { useRouter: () => ({ push() { throw new Error('Navigation forbidden in offline rendering test'); } }) };
  if (request.startsWith('@/') || (request.startsWith('.') && parent?.filename.startsWith(path.join(repo, 'src')))) {
    const stem = request.startsWith('@/') ? path.join(repo, 'src', request.slice(2)) : path.resolve(path.dirname(parent.filename), request);
    const filename = [stem + '.tsx', stem + '.ts', path.join(stem, 'index.tsx'), path.join(stem, 'index.ts')].find(fs.existsSync);
    if (filename) return load(filename);
  }
  return originalLoad.call(this, request, parent, ...rest);
};

async function main() {
  const page = load(path.join(repo, 'src/app/tools/image/minecraft-skin/page.tsx'));
  const metadata = page.generateMetadata();
  check(() => assert.equal(metadata.alternates.canonical, 'https://www.exismic.xyz/tools/image/minecraft-skin'));
  check(() => assert.equal(metadata.robots.index, true));
  check(() => assert.match(metadata.title, /Minecraft Skin/));
  check(() => assert.equal(dynamicOptions.ssr, false));

  const errors = [];
  const html = await new Promise((resolve, reject) => {
    const out = new PassThrough();
    let body = '';
    out.on('data', chunk => { body += chunk.toString(); });
    out.on('end', () => resolve(body));
    out.on('error', reject);
    const stream = renderToPipeableStream(React.createElement(page.default), {
      onShellReady() { stream.pipe(out); },
      onShellError: reject,
      onError(error) { errors.push(error); },
    });
  });
  check(() => assert.ok(errors.every(error => error.digest === 'BAILOUT_TO_CLIENT_SIDE_RENDERING')));
  check(() => assert.equal((html.match(/<h1\b/g) || []).length, 1));
  check(() => assert.match(html, /AI Minecraft Skin Maker/));
  check(() => assert.match(html, /Opening your skin editor/));
  check(() => assert.match(html, /Turn on JavaScript/));
  check(() => assert.doesNotMatch(html, /<div hidden(?:="")? id="S:/));
  check(() => assert.ok(!loaded.has('src/components/tool/MinecraftSkinMaker.tsx')));
  check(() => assert.ok(![...loaded].some(name => name.includes('ToolDetailClient') || name.includes('PdfMerger') || name.includes('VideoBackgroundRemover'))));

  const { TOOLS } = load(path.join(repo, 'src/data/tools.ts'));
  const tool = TOOLS.find(item => item.id === 'image-minecraft-skin');
  const bodyText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  check(() => assert.ok(bodyText.includes(tool.seoIntro)));
  for (const step of tool.howToSteps) check(() => assert.ok(bodyText.includes(step)));
  for (const example of tool.examples) check(() => assert.ok(bodyText.includes(example)));
  for (const faq of tool.faqs) check(() => assert.ok(bodyText.includes(faq.question) && bodyText.includes(faq.answer)));
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  for (const type of ['SoftwareApplication', 'BreadcrumbList', 'FAQPage', 'HowTo']) {
    check(() => assert.equal(schemas.filter(schema => schema['@type'] === type).length, 1));
  }
  check(() => assert.equal(schemas.find(schema => schema['@type'] === 'SoftwareApplication').url, metadata.alternates.canonical));
  check(() => assert.match(html, /href="\/category\/image"/));
  check(() => assert.match(html, /href="\/tools\/ai\/prompt-builder"/));
  const guide = html.match(/<section\b[^>]*class="[^"]*mt-2 sm:mt-4 w-full text-left[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0];
  check(() => assert.ok(guide));
  check(() => assert.doesNotMatch(guide, /style="[^"]*opacity:\s*0(?:;|")/));

  const sitemap = load(path.join(repo, 'src/app/sitemap.ts')).default();
  for (const href of [tool.href, '/tools/video/to-gif']) {
    check(() => assert.equal(sitemap.filter(entry => entry.url === 'https://www.exismic.xyz' + href).length, 1));
  }
  const { MinecraftEditorBoundary, __EditorLoading } = load(path.join(repo, 'src/components/tool/MinecraftSkinWorkspace.tsx'));
  const boundary = new MinecraftEditorBoundary({ children: 'editor' });
  boundary.state = MinecraftEditorBoundary.getDerivedStateFromError(new Error('ChunkLoadError secret /_next/private.js'));
  const fallback = boundary.render();
  const failedHtml = renderToStaticMarkup(fallback);
  check(() => assert.match(failedHtml, /Reload editor/));
  check(() => assert.doesNotMatch(failedHtml, /ChunkLoadError|private\.js|secret/));
  const reloadElement = fallback.props.children.at(-1).type();
  let reloads = 0;
  global.window = { location: { reload() { reloads++; } } };
  reloadElement.props.onClick();
  check(() => assert.equal(reloads, 1));

  const realUseState = React.useState, realUseEffect = React.useEffect;
  let slow = false, timerCallback, delay, cleared, cleanup;
  React.useState = () => [slow, value => { slow = value; }];
  React.useEffect = fn => { cleanup = fn(); };
  global.window.setTimeout = (fn, ms) => { timerCallback = fn; delay = ms; return 42; };
  global.window.clearTimeout = id => { cleared = id; };
  try {
    const opening = __EditorLoading();
    check(() => assert.equal(opening.props.children[1].props.children, 'Opening your skin editor…'));
    check(() => assert.equal(opening.props.children[3], false));
    check(() => assert.equal(delay, 15000));
    timerCallback();
    const waiting = __EditorLoading();
    check(() => assert.match(waiting.props.children[1].props.children, /taking longer/));
    check(() => assert.ok(waiting.props.children[3]));
    check(() => assert.equal(reloads, 1)); // Never reload automatically.
    cleanup();
    check(() => assert.equal(cleared, 42));
  } finally {
    React.useState = realUseState;
    React.useEffect = realUseEffect;
  }
  delete global.window;
  console.log(`${checks} offline Minecraft page-render checks passed.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { Module._load = originalLoad; });
