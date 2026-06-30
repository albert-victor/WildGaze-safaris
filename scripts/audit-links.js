/**
 * Audit all internal links and nav wiring across HTML pages.
 * Run: node scripts/audit-links.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));

const results = { ok: [], missing: [], navIssues: [] };

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');

  if (html.includes('<!-- WG:GLOBAL-NAV:START -->')) {
    if (!html.includes('<!-- WG:GLOBAL-NAV:END -->')) {
      results.navIssues.push({ file, issue: 'missing WG:GLOBAL-NAV:END' });
    }
    if (!html.includes('assets/js/wg-navbar.js')) {
      results.navIssues.push({ file, issue: 'missing wg-navbar.js' });
    }
    if (!html.includes('id="wgWaFloat"')) {
      results.navIssues.push({ file, issue: 'missing WhatsApp float' });
    }
    if ((html.match(/id="navbarWrap"/g) || []).length !== 1) {
      results.navIssues.push({
        file,
        issue: 'navbarWrap count=' + (html.match(/id="navbarWrap"/g) || []).length
      });
    }
  }

  const re = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    if (/^(#|https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const target = path.join(ROOT, href.split(/[#?]/)[0]);
    if (fs.existsSync(target)) {
      results.ok.push({ file, href });
    } else {
      results.missing.push({ file, href });
    }
  }
});

console.log('=== Wild Gaze Link Audit ===');
console.log('Pages:', htmlFiles.length);
console.log('Internal links OK:', results.ok.length);
console.log('Broken links:', results.missing.length);
console.log('Nav issues:', results.navIssues.length);

if (results.missing.length) {
  console.log('\nBroken:');
  results.missing.forEach((r) => console.log(' ', r.file, '->', r.href));
}
if (results.navIssues.length) {
  console.log('\nNav:');
  results.navIssues.forEach((r) => console.log(' ', r.file, ':', r.issue));
}
if (!results.missing.length && !results.navIssues.length) {
  console.log('\nAll checks passed.');
}

process.exit(results.missing.length || results.navIssues.length ? 1 : 0);
