/**
 * Repair nav footer + restore index homepage hero.
 * Run: node scripts/repair-nav.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NAV_FOOTER = fs.readFileSync(path.join(__dirname, '_nav-footer.html'), 'utf8');
const GIT_INDEX = fs.readFileSync(path.join(ROOT, '_index_git.html'), 'utf8');

const HERO_START = GIT_INDEX.indexOf('<style>\n/*');
const HERO_END = GIT_INDEX.indexOf('</script>\n\n<link href="https://fonts.googleapis.com/css2?family=Cinzel', GIT_INDEX.indexOf('HOMEPAGE HERO'));
const INDEX_HERO = GIT_INDEX.slice(
  GIT_INDEX.indexOf('<style>\n/*', GIT_INDEX.indexOf('wg-home-hero {')),
  GIT_INDEX.indexOf('</script>\n\n<link href="https://fonts.googleapis.com/css2?family=Cinzel', GIT_INDEX.indexOf('id="wgHomeHero"'))
) + '</script>\n';

// Fix em dash in extracted hero
const INDEX_HERO_CLEAN = INDEX_HERO.replace(/\u2014/g, '\u2013').replace(/ΓÇö/g, '\u2013').replace(/┬╖/g, '\u00b7');

const ORPHAN_HERO_SCRIPTS =
  /<script>\s*\n\(function \(\) \{\s*\n  var hero[\s\S]*?start\(\);\s*\n\}\)\(\);\s*\n<\/script>\s*\n/g;

function repairNavFooter(html) {
  if (!html.includes('<!-- WG:GLOBAL-NAV:START -->')) return html;
  if (html.includes('<!-- WG:GLOBAL-NAV:END -->')) return html;

  const marker = '<!-- WG:GLOBAL-NAV:START -->';
  const start = html.indexOf(marker);
  const afterStart = html.slice(start);
  const drawerEnd = afterStart.search(/\n  <\/div>\n<\/div>\n/);
  if (drawerEnd === -1) return html;

  const insertPos = start + drawerEnd + '\n  </div>\n</div>\n'.length;
  return html.slice(0, insertPos) + '\n' + NAV_FOOTER + html.slice(insertPos);
}

function repairIndex(html) {
  html = html.replace(ORPHAN_HERO_SCRIPTS, '');
  const endNav = html.indexOf('<!-- WG:GLOBAL-NAV:END -->');
  if (endNav === -1) return html;
  const afterNavScript = html.indexOf('<script src="assets/js/wg-navbar.js" defer></script>', endNav);
  if (afterNavScript === -1) return html;
  const contentStart = afterNavScript + '<script src="assets/js/wg-navbar.js" defer></script>\n'.length;

  const shortcutsIdx = html.indexOf('.wg-shortcuts {', contentStart);
  if (shortcutsIdx === -1) return html;

  const styleTagStart = html.lastIndexOf('<style', shortcutsIdx);
  const before = html.slice(0, contentStart);
  const after = html.slice(styleTagStart);

  if (before.includes('id="wgHomeHero"')) return before + after;

  return before + '\n' + INDEX_HERO_CLEAN + '\n' + after;
}

function auditLinks(html, file) {
  const issues = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (/^(#|https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const target = path.join(ROOT, href.split(/[#?]/)[0]);
    if (!fs.existsSync(target)) issues.push({ file, href });
  }
  return issues;
}

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let repaired = 0;
const issues = [];

htmlFiles.forEach((file) => {
  const fp = path.join(ROOT, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;

  html = repairNavFooter(html);
  if (file === 'index.html') html = repairIndex(html);

  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    repaired++;
    console.log('Repaired:', file);
  }

  issues.push(...auditLinks(html, file));
});

console.log('\nPages repaired:', repaired);
console.log('Nav footers present:', htmlFiles.filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('WG:GLOBAL-NAV:END')).length);
console.log('wg-navbar.js refs:', htmlFiles.filter((f) => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('wg-navbar.js')).length);
console.log('Broken links:', issues.length);
issues.forEach((i) => console.log(' ', i.file, '->', i.href));
