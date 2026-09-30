import fs from 'fs';

const FOLDERS = ['7y07ok996av', '8awx1ijyfh7', '4l9sf6e2l7i', '5dj4n7o4ye0', 'ft1w4pmugbn', 'jdsflpo63e3', '98q6vr5wa6t', 'fc5nm95sz8b', 'va24punv3b6', '9qntmdczuua'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';

function decode(s) {
  return (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();
}

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(r.status + ' ' + url);
  return r.text();
}

function parsePage(html, fid) {
  const title = decode((html.match(/<h1 class="drive-title">([^<]*)<\/h1>/) || [])[1] || '');
  const videos = [...html.matchAll(/<a href="\/d\/([^"]+)" class="thumb-link" aria-label="([^"]*)">\s*<img src="([^"]+)" alt="([^"]*)"/g)]
    .map((m) => ({ id: m[1], title: decode(m[2]), thumb: m[3], label: decode(m[4]) }));
  const subfolders = [...html.matchAll(/<a href="\/f\/([^"]+)" class="folder-chip">[\s\S]*?<span>([^<]*)<\/span>/g)]
    .map((m) => ({ id: m[1], title: decode(m[2]) }));
  const pages = [...html.matchAll(new RegExp('href="/f/' + fid + '\\?p=(\\d+)"', 'g'))].map((m) => +m[1]);
  return { title, videos, subfolders, maxPage: pages.length ? Math.max(...pages) : 1 };
}

const out = { folders: [] };
for (const fid of FOLDERS) {
  const p1 = await get('https://vidmonstr.com/f/' + fid);
  const first = parsePage(p1, fid);
  const all = [...first.videos];
  const subs = [...first.subfolders];
  for (let p = 2; p <= first.maxPage; p++) {
    const html = await get(`https://vidmonstr.com/f/${fid}?p=${p}`);
    const parsed = parsePage(html, fid);
    all.push(...parsed.videos);
    for (const s of parsed.subfolders) if (!subs.find((x) => x.id === s.id)) subs.push(s);
  }
  // dedupe videos by id
  const seen = new Set();
  const videos = all.filter((v) => (seen.has(v.id) ? false : (seen.add(v.id), true)));
  out.folders.push({ id: fid, title: first.title, pages: first.maxPage, subfolders: subs, videos });
  console.log(`${fid} | ${first.title} | pages=${first.maxPage} subfolders=${subs.length} videos=${videos.length}`);
}

fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/scraped.json', JSON.stringify(out, null, 2));
const totalV = out.folders.reduce((a, f) => a + f.videos.length, 0);
console.log('TOTAL videos=', totalV);
