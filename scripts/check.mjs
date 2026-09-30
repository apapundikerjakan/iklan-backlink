import fs from 'fs';
const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
console.log('settings:', JSON.stringify(db.settings, null, 1));
console.log('folders:', db.folders.length, 'videos:', db.videos.length);
