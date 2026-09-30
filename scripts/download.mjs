import fs from 'fs';
import path from 'path';

const PARENT = {
  '98q6vr5wa6t': '7y07ok996av',
  'fc5nm95sz8b': '7y07ok996av',
  'va24punv3b6': '7y07ok996av',
  '9qntmdczuua': '8awx1ijyfh7'
};
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0';
const OUT_DIR = 'public/t';

function localName(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean); // [image|thumb, file]
  return parts[0] + '_' + parts[parts.length - 1];
}

const scraped = JSON.parse(fs.readFileSync('data/scraped.json', 'utf-8'));
const db = JSON.parse(fs.readFileSync('data/db.json', 'utf-8'));
fs.mkdirSync(OUT_DIR, { recursive: true });

// kumpulkan semua URL remote unik
const urlSet = new Map(); // url -> localName
for (const v of db.videos) if (/^https?:/.test(v.thumb || '')) urlSet.set(v.thumb, localName(v.thumb));
for (const f of scraped.folders) for (const v of f.videos) urlSet.set(v.thumb, localName(v.thumb));
console.log('unique thumbs:', urlSet.size);

async function dl(url, dest, tries = 3) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 'cached';
  for (let i = 0; i < tries; i++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) throw new Error('http ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 500) throw new Error('too small');
      fs.writeFileSync(dest, buf);
      return 'ok';
    } catch (e) {
      if (i === tries - 1) return 'fail:' + e.message;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

const entries = [...urlSet.entries()];
let done = 0, ok = 0, cached = 0;
const failed = [];
const CONC = 8;
async function worker() {
  while (entries.length) {
    const [url, name] = entries.pop();
    const st = await dl(url, path.join(OUT_DIR, name));
    done++;
    if (st === 'ok') ok++;
    else if (st === 'cached') cached++;
    else failed.push(url + ' :: ' + st);
    if (done % 50 === 0) console.log(`... ${done}/${urlSet.size}`);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`done ok=${ok} cached=${cached} failed=${failed.length}`);
if (failed.length) {
  fs.writeFileSync('data/dl-failed.txt', failed.join('\n'));
  console.log('failed list -> data/dl-failed.txt');
}

// --- merge db ---
const thumbOf = (url) => '/t/' + urlSet.get(url);
const haveVideo = new Set(db.videos.map((v) => v.id));
const haveFolder = new Set(db.folders.map((f) => f.id));

for (const f of scraped.folders) {
  if (!haveFolder.has(f.id)) {
    db.folders.push({ id: f.id, title: f.title, parentId: PARENT[f.id] || null });
    haveFolder.add(f.id);
  }
  for (const v of f.videos) {
    if (haveVideo.has(v.id)) continue;
    // kalau thumb gagal download, pakai remote sebagai fallback
    const local = urlSet.has(v.thumb) && fs.existsSync(path.join(OUT_DIR, urlSet.get(v.thumb)))
      ? thumbOf(v.thumb) : v.thumb;
    db.videos.push({ id: v.id, folderId: f.id, title: v.title, thumb: local, embed: '', file: '', label: v.label || 'vidoycdn' });
    haveVideo.add(v.id);
  }
}
// video lama: arahkan ke file lokal bila sudah terdownload
for (const v of db.videos) {
  if (/^https?:/.test(v.thumb || '') && urlSet.has(v.thumb) && fs.existsSync(path.join(OUT_DIR, urlSet.get(v.thumb)))) {
    v.thumb = thumbOf(v.thumb);
  }
}

fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2));
const remoteLeft = db.videos.filter((v) => /^https?:/.test(v.thumb || '')).length;
console.log(`db folders=${db.folders.length} videos=${db.videos.length} thumbs_masih_remote=${remoteLeft}`);
