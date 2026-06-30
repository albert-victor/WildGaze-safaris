/**
 * Replace duplicated inline footers with global WG footer bundle.
 * Run: node scripts/sync-footer.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const footerBundle = fs.readFileSync(path.join(__dirname, '_site-footer.html'), 'utf8');
const footerCss = '  <link rel="stylesheet" href="assets/css/wg-footer.css">\n';

const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
let updated = 0;

function injectFooterCss(html) {
  if (html.includes('wg-footer.css')) return html;
  if (html.includes('wg-components.css')) {
    return html.replace(
      /(<link rel="stylesheet" href="assets\/css\/wg-components\.css">\s*)/,
      `$1${footerCss}`
    );
  }
  return html.replace(/<\/head>/, `${footerCss}</head>`);
}

function replaceFooter(html) {
  if (html.includes('WG:GLOBAL-FOOTER:START')) {
    return html.replace(
      /<!-- WG:GLOBAL-FOOTER:START -->[\s\S]*?<!-- WG:GLOBAL-FOOTER:END -->\s*/g,
      footerBundle
    );
  }

  const footerTag = html.indexOf('<footer class="site-footer');
  if (footerTag === -1) return html;

  const styleStart = html.lastIndexOf('<style', footerTag);
  if (styleStart === -1 || styleStart < html.lastIndexOf('</body>') - 500000) {
    // style block should be reasonably close to footer
  }
  const start = styleStart !== -1 && html.slice(styleStart, footerTag).includes('.site-footer')
    ? styleStart
    : footerTag;

  const footerEnd = html.indexOf('</footer>', footerTag);
  if (footerEnd === -1) return html;

  return html.slice(0, start) + footerBundle + html.slice(footerEnd + '</footer>'.length);
}

htmlFiles.forEach((file) => {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  const before = html;
  html = injectFooterCss(html);
  html = replaceFooter(html);
  if (html !== before) {
    fs.writeFileSync(fp, html, 'utf8');
    updated++;
    console.log('Updated:', file);
  }
});

console.log(`Done. ${updated} file(s) updated.`);
