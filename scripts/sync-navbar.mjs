import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'index.html');
const index = fs.readFileSync(indexPath, 'utf8');

const cssPath = path.join(root, 'assets', 'css', 'wg-navbar.css');
const styleMatch = index.match(/<style>\s*\/\* Scoped reset: only affects elements inside the navbar[\s\S]*?<\/style>/);
if (styleMatch) {
  let css = styleMatch[0].replace(/^<style>\s*/, '').replace(/<\/style>\s*$/, '');
  css = css.replace(/:root\s*\{[\s\S]*?\}\s*/m, '');
  css = '/* Wild Gaze – global navbar (synced from index) */\n' + css.trim() + '\n';
  fs.mkdirSync(path.join(root, 'assets', 'css'), { recursive: true });
  fs.writeFileSync(cssPath, css);
} else if (!fs.existsSync(cssPath)) {
  throw new Error('wg-navbar.css missing and no inline navbar styles in index.html');
}

const navStart = index.indexOf('<!-- STICKY NAVBAR -->');
const navEnd = index.indexOf('<script>', index.indexOf('<!-- WhatsApp contact float -->'));
if (navStart === -1 || navEnd === -1) throw new Error('Navbar HTML block not found');

const navHtml = index.slice(navStart, navEnd).trim()
  + '\n\n<!-- WhatsApp contact float -->\n'
  + index.slice(index.indexOf('<!-- WhatsApp contact float -->') + '<!-- WhatsApp contact float -->'.length, index.indexOf('<script>', index.indexOf('<!-- WhatsApp contact float -->'))).trim();

const navBundle = `<!-- WG:GLOBAL-NAV:START -->\n${navHtml}\n<!-- WG:GLOBAL-NAV:END -->\n<script src="assets/js/wg-navbar.js" defer></script>\n`;

fs.mkdirSync(path.join(root, 'assets', 'css'), { recursive: true });

const headAssets = `  <link rel="stylesheet" href="assets/css/wg-navbar.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
`;

const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
let updated = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(path.join(root, file), 'utf8');
  if (!content.includes('navbar-wrap') && !content.includes('WG:GLOBAL-NAV:START')) continue;

  content = content.replace(/<style>[\s\S]*?\.navbar-wrap[\s\S]*?<\/style>\s*/g, '');

  if (content.includes('WG:GLOBAL-NAV:START')) {
    content = content.replace(/<!-- WG:GLOBAL-NAV:START -->[\s\S]*?<!-- WG:GLOBAL-NAV:END -->\s*<script src="assets\/js\/wg-navbar\.js" defer><\/script>\s*/g, navBundle);
  } else {
    const oldNavBlock = /<!-- TOP BAR -->[\s\S]*?<script>[\s\S]*?clampMegaPanels[\s\S]*?<\/script>\s*/;
    const oldNavBlock2 = /<!-- STICKY NAVBAR -->[\s\S]*?<script>[\s\S]*?clampMegaPanels[\s\S]*?<\/script>\s*/;
    if (oldNavBlock.test(content)) {
      content = content.replace(oldNavBlock, navBundle);
    } else if (oldNavBlock2.test(content)) {
      content = content.replace(oldNavBlock2, navBundle);
    }
  }

  content = content.replace(/(<\/head>\s*<body>\s*)+/gi, '</head>\n<body>\n\n');

  if (!content.includes('wg-navbar.css')) {
    content = content.replace(
      /(<link rel="stylesheet" href="assets\/css\/wg-components\.css">\s*)/,
      `$1${headAssets}`
    );
    if (!content.includes('wg-navbar.css')) {
      content = content.replace(/<\/head>/, `${headAssets}</head>`);
    }
  }

  if (!content.includes('font-awesome')) {
    content = content.replace(
      /(<link rel="stylesheet" href="assets\/css\/wg-navbar\.css">\s*)/,
      `$1  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">\n`
    );
  }

  if (file === 'index.html') {
    content = content.replace(/<style>\s*\/\* Scoped reset: only affects elements inside the navbar[\s\S]*?<\/style>\s*<\/head>/, '</head>');
  }

  fs.writeFileSync(path.join(root, file), content);
  updated++;
  console.log('Updated:', file);
}

console.log(`Done. ${updated} files synced.`);
