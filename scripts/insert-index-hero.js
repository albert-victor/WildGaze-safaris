const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(ROOT, '_index_git.html'), 'utf8').split(/\r?\n/);
const heroLines = lines.slice(797, 1326); // 798-1326 inclusive (1-based)
let hero = heroLines.join('\n') + '\n';
hero = hero.replace(/\u2014/g, '\u2013').replace(/ΓÇö/g, '\u2013').replace(/┬╖/g, '\u00b7');

let idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const anchor = '<script src="assets/js/wg-navbar.js" defer></script>\n';
const pos = idx.indexOf(anchor);
if (pos === -1) throw new Error('navbar script anchor not found');

const afterNav = pos + anchor.length;
const rest = idx.slice(afterNav).replace(/^\s*<\/script>\s*\n/, '');

if (idx.includes('id="wgHomeHero"')) {
  console.log('Hero already present');
} else {
  idx = idx.slice(0, afterNav) + '\n' + hero + rest;
  fs.writeFileSync(path.join(ROOT, 'index.html'), idx);
  console.log('Inserted hero:', hero.length, 'chars');
}
