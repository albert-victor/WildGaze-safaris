/**
 * Restore main page body content stripped during navbar migration.
 * Keeps the current WG:GLOBAL-NAV block; re-inserts content from git HEAD.
 * Run: node scripts/restore-page-content.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const EMPTY_PAGES = [
  '1-day-ruaha-national-park.html',
  '4-days-camping-safari-serengeti-ngorongoro.html',
  '4-days-mount-meru-trekking.html',
  '4-days-safari-ruaha.html',
  '5-days-safari-lake-manyara-ngorongoro-serengeti.html',
  '6-days-lake-manyara-ngorongoro-serengeti-tarangire.html',
  '6-days-safari-big-5-of-selous-and-ruaha.html',
  '6-days-trekking-machame-route.html',
  '6-days-trekking-rongai-route.html',
  '7-days-trekking-lemosho-route.html',
  '9-days-safari-to-selous-mikumi-and-ruaha.html',
  'booking-form.html',
  'mahale-mountains.html',
  'mikumi-national-park-day-Trip.html',
  'udzungwa-mountain.html',
  'uluguru-mountain.html',
  'usambara-mountains.html',
];

function gitShow(file) {
  try {
    return execSync(`git show HEAD:${file}`, { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch {
    return null;
  }
}

function extractMainContent(headHtml) {
  const clampIdx = headHtml.indexOf('clampMegaPanels');
  if (clampIdx === -1) return null;

  const scriptEnd = headHtml.indexOf('</script>', clampIdx);
  if (scriptEnd === -1) return null;
  const contentStart = scriptEnd + '</script>'.length;

  const footerRuleIdx = headHtml.indexOf('.site-footer {', contentStart);
  if (footerRuleIdx === -1) {
    const footerTagIdx = headHtml.indexOf('<footer class="site-footer', contentStart);
    if (footerTagIdx === -1) return null;
    const styleBefore = headHtml.lastIndexOf('<style', footerTagIdx);
    const contentEnd = styleBefore > contentStart ? styleBefore : footerTagIdx;
    const content = headHtml.slice(contentStart, contentEnd).trim();
    return content.length > 600 ? content : null;
  }

  const linkBefore = headHtml.lastIndexOf('<link', footerRuleIdx);
  const styleBefore = headHtml.lastIndexOf('<style', footerRuleIdx);
  const contentEnd = Math.max(linkBefore, styleBefore);
  if (contentEnd <= contentStart) return null;

  const content = headHtml.slice(contentStart, contentEnd).trim();
  return content.length > 600 ? content : null;
}


function findFooterStyleStart(html, afterPos) {
  const footerRule = html.indexOf('.site-footer {', afterPos);
  if (footerRule === -1) return -1;
  const styleStart = html.lastIndexOf('<style', footerRule);
  return styleStart > afterPos ? styleStart : footerRule;
}

function isContentMissing(html) {
  const navEnd = html.indexOf('<!-- WG:GLOBAL-NAV:END -->');
  if (navEnd === -1) return false;
  const footerStart = findFooterStyleStart(html, navEnd);
  if (footerStart === -1) return false;
  const between = html.slice(navEnd, footerStart);
  return between.length < 800;
}

function restorePage(file) {
  const fp = path.join(ROOT, file);
  let current = fs.readFileSync(fp, 'utf8');
  if (!isContentMissing(current)) {
    console.log('Skip (content present):', file);
    return false;
  }

  const head = gitShow(file);
  if (!head) {
    console.log('Skip (no git HEAD):', file);
    return false;
  }

  const mainContent = extractMainContent(head);
  if (!mainContent) {
    console.log('Skip (could not extract):', file);
    return false;
  }

  const navScript = '<script src="assets/js/wg-navbar.js" defer></script>';
  const navIdx = current.indexOf(navScript);
  if (navIdx === -1) {
    console.log('Skip (no nav script):', file);
    return false;
  }

  const insertPos = navIdx + navScript.length;
  const footerStart = findFooterStyleStart(current, insertPos);
  if (footerStart === -1) {
    console.log('Skip (no footer marker):', file);
    return false;
  }

  const restored =
    current.slice(0, insertPos) + '\n\n' + mainContent + '\n\n' + current.slice(footerStart);

  fs.writeFileSync(fp, restored, 'utf8');
  console.log('Restored:', file, `(${mainContent.length} chars)`);
  return true;
}

let count = 0;
EMPTY_PAGES.forEach((file) => {
  if (restorePage(file)) count++;
});

console.log(`\nDone. ${count} page(s) restored.`);
