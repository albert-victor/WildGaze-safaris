import fs from 'fs';

const p = new URL('../index.html', import.meta.url);
let html = fs.readFileSync(p, 'utf8');

const start = html.indexOf('<!-- PLACEHOLDER_REMOVE_OLD_HERO -->');
const end = html.indexOf('<style class="cid-rlzH4qeOqU" id="content1-fs"');

if (start === -1 || end === -1) {
  console.error('markers not found', { start, end });
  process.exit(1);
}

html = html.slice(0, start) + html.slice(end);

const heroCount = (html.match(/id="wgHomeHero"/g) || []).length;
const navCount = (html.match(/WG:GLOBAL-NAV:START/g) || []).length;
const navJsCount = (html.match(/wg-navbar\.js/g) || []).length;
const heroJsCount = (html.match(/wg-home-hero\.js/g) || []).length;

fs.writeFileSync(p, html);
console.log('OK', { heroCount, navCount, navJsCount, heroJsCount });
