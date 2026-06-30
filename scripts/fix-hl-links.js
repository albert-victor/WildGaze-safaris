const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const arrow =
  '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';

fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .forEach((file) => {
    const fp = path.join(ROOT, file);
    let html = fs.readFileSync(fp, 'utf8');
    const before = html;
    html = html.replace(/<a class="hl-link" href="([^"]+)"[^>]*>[\s\S]*?<\/a>/g, (m, href) => {
      if (m.includes('aria-label')) return m;
      let label = 'Learn more';
      if (href.includes('safaris.html')) label = 'Explore safari packages';
      else if (href.includes('kilimanjaro')) label = 'View Kilimanjaro routes';
      else if (href.includes('zanzibar')) label = 'Discover Zanzibar';
      return `<a class="hl-link" href="${href}" aria-label="${label}">${arrow}</a>`;
    });
    if (html !== before) {
      fs.writeFileSync(fp, html, 'utf8');
      console.log('Updated:', file);
    }
  });
