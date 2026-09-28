import https from "https";

const INDEXNOW_KEY = "8789a4c3c47949c38112c26bcebb37d3";
const HOST = "www.exismic.xyz";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function fetchSitemapUrls() {
  try {
    const res = await fetch(SITEMAP_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
    const urls = matches.map((m) => m.replace(/<\/?loc>/g, "").trim());
    return urls;
  } catch (err) {
    console.error("Failed to fetch sitemap:", err.message);
    return [
      `https://${HOST}/`,
      `https://${HOST}/tools`,
      `https://${HOST}/about`,
      `https://${HOST}/help`,
      `https://${HOST}/pricing`,
      `https://${HOST}/blog`,
    ];
  }
}

async function pingIndexNow(urls) {
  console.log(`\n📡 Submitting ${urls.length} URLs to IndexNow (Bing / Yandex / Seznam / Naver)...`);
  
  const payload = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls.slice(0, 10000),
  });

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: payload,
      });
      const responseText = await res.text();
      const isSuccess = res.status === 200 || res.status === 202;
      console.log(`  ✓ ${endpoint}: Status ${res.status} (${isSuccess ? "SUCCESS - Submitted to Indexing Queue" : "Response: " + responseText})`);
    } catch (e) {
      console.error(`  ✗ ${endpoint} error:`, e.message);
    }
  }
}

async function run() {
  console.log("==========================================");
  console.log("🚀 EXISMIC SEARCH ENGINE NOTIFIER");
  console.log("==========================================");
  const urls = await fetchSitemapUrls();
  console.log(`Found ${urls.length} total indexable URLs on ${HOST}`);
  await pingIndexNow(urls);
  console.log("\n==========================================");
  console.log("✅ Search engine indexing submission complete!");
  console.log("==========================================");
}

run();
