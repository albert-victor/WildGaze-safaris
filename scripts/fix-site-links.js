/**
 * Remove duplicate homepage-hero injections (NOT nav footer).
 * Safe to run after bad merges. Does NOT touch WG:GLOBAL-NAV:END.
 * Run: node scripts/fix-site-links.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const WA_BLOCK =
  /<!-- WhatsApp contact float -->[\s\S]*?<button class="wg-wa-toggle"[\s\S]*?<\/button>\s*\n<\/div>\s*\n/g;

const INJECTED_HERO_BLOCK =
  /<style>\s*\n\/\* ── SCOPED TOKENS \(same system as wg-kili\)[\s\S]*?<div class="wg-home-trust">[\s\S]*?<\/div>\s*\n<\/div>\s*\n/g;

function dedupeWaFloats(html) {
  if (!html.includes('<!-- WG:GLOBAL-NAV:END -->')) return html;
  const parts = html.split('<!-- WG:GLOBAL-NAV:END -->');
  if (parts.length < 2) return html;
  let head = parts[0];
  let tail = parts.slice(1).join('<!-- WG:GLOBAL-NAV:END -->');
  let n = 0;
  head = head.replace(WA_BLOCK, (m) => (++n === 1 ? m : ''));
  return head + '<!-- WG:GLOBAL-NAV:END -->' + tail;
}

function removeInjectedHeroBlocks(html, file) {
  if (file === 'index.html') return html;
  let prev;
  do {
    prev = html;
    html = html.replace(INJECTED_HERO_BLOCK, '');
  } while (html !== prev);
  return html;
}

htmlFiles.forEach((file) => {
  if (file === 'index.html') return;
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = dedupeWaFloats(html);
  html = removeInjectedHeroBlocks(html, file);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log('Cleaned:', file);
  }
});

console.log('Done. Run: node scripts/audit-links.js');
