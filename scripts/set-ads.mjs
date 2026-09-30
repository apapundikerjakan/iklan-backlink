import fs from 'fs';
const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));

db.settings.popunderScript = `<script src="https://pl31587093.profitableratecpmnetwork.com/c0/2b/30/c02b306231d7d8115792e3b2d85d6d3c.js"><\/script>`;
db.settings.directLink = 'https://www.profitableratecpmnetwork.com/whk48179bb?key=f1c5452b4247e3383d57264715f47753';
db.settings.inGridAd = `<script async="async" data-cfasync="false" src="https://pl31587095.profitableratecpmnetwork.com/5931c070577458354d79df060780e12a/invoke.js"><\/script>\n<div id="container-5931c070577458354d79df060780e12a"></div>`;
db.settings.inGridEvery = 6;
db.settings.socialBar = `<script src="https://pl31587097.profitableratecpmnetwork.com/34/2b/a0/342ba0a78080da493ee87bea148e455e.js"><\/script>`;
db.settings.stickyAd = `<script>
  atOptions = {
    'key' : 'a840cc360662602a3c466a48d2416d1a',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
<\/script>
<script src="https://www.highrevenueformat.com/a840cc360662602a3c466a48d2416d1a/invoke.js"><\/script>`;

fs.writeFileSync('data/db.json', JSON.stringify(db, null, 2));
console.log('ads saved:', Object.keys(db.settings).join(','));
