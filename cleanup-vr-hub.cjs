'use strict';
const fs = require('fs');
const FILE = 'c:\\Users\\bradl\\source\\storm-ai\\merkaba-geoqode-lattice\\public\\vr-hub.html';
let html = fs.readFileSync(FILE, 'utf8');
const usesCRLF = html.includes('\r\n');
if (usesCRLF) html = html.replace(/\r\n/g, '\n');
let count = 0;
function rep(old, nw, label) {
  if (html.includes(old)) { html = html.replace(old, nw); count++; console.log('OK: ' + label); }
  else { console.error('MISS: ' + label); }
}

// 1. Meta description
rep('Cinema, Enterprise, Lab, PLAIstore VR, Wellness, Social, Creator, Education, Art',
    'Cinema, Enterprise, Lab, Wellness, Social, Creator, Education, Art', 'meta desc');

// 2. og:description
rep('across 9 categories: Cinema, Enterprise, Education, PLAIstore VR, Wellness',
    'across 8 categories: Cinema, Enterprise, Education, Wellness', 'og:desc');

// 3. JSON-LD description
rep('"description": "Live WebXR experiences across 9 categories for Meta Quest 2/3.',
    '"description": "Live WebXR experiences across 8 categories for Meta Quest 2/3.', 'ld:desc');

// 4. JSON-LD numberOfItems
rep('"numberOfItems": 9,', '"numberOfItems": 8,', 'ld:numberOfItems');

// 5. JSON-LD PLAIstore item removal + Wellness renumber to 4
var ld_old = '          {\n            "@type": "ListItem",\n            "position": 4,\n            "name": "PLAIstore VR",\n            "url": "https://realaios.com/vr-hub#arcade"\n          },\n          {\n            "@type": "ListItem",\n            "position": 5,\n            "name": "Wellness",';
var ld_new = '          {\n            "@type": "ListItem",\n            "position": 4,\n            "name": "Wellness",';
rep(ld_old, ld_new, 'ld:plaistore-item');

// 6. JSON-LD renumber
rep('"position": 6,\n            "name": "Social"', '"position": 5,\n            "name": "Social"', 'ld:pos6');
rep('"position": 7,\n            "name": "Creator"', '"position": 6,\n            "name": "Creator"', 'ld:pos7');
rep('"position": 8,\n            "name": "Education"', '"position": 7,\n            "name": "Education"', 'ld:pos8');
rep('"position": 9,\n            "name": "Art"', '"position": 8,\n            "name": "Art"', 'ld:pos9');

// 7. Hero sub text
rep('Education, PLAIstore VR, Wellness, Social, Art &amp; Music',
    'Education, Wellness, Social, Art &amp; Music', 'hero-sub');

// 8. Hero CTAs Live Now button (uses slice)
var liveNowStart = html.indexOf('\n        <a\n          href="/experiences"\n          class="btn-secondary"');
if (liveNowStart !== -1) {
  var liveNowEnd = html.indexOf('\n        >', liveNowStart) + '\n        >'.length;
  html = html.slice(0, liveNowStart) + html.slice(liveNowEnd);
  count++; console.log('OK: live-now-btn');
} else { console.error('MISS: live-now-btn'); }

// 9. Stats bar Coming Soon div
var statLiveIdx = html.indexOf('id="stat-live"');
if (statLiveIdx !== -1) {
  var statDivStart = html.lastIndexOf('\n      <div class="stat">', statLiveIdx);
  var statDivEnd = html.indexOf('</div>', statLiveIdx) + '</div>'.length;
  html = html.slice(0, statDivStart) + html.slice(statDivEnd);
  count++; console.log('OK: stat-coming-soon');
} else { console.error('MISS: stat-coming-soon'); }

// 10. Events section HTML block
var evHtmlStart = html.indexOf('\n    <!-- -- UPCOMING EVENTS ');
var evHtmlEnd = html.indexOf('\n    <!-- -- SEARCH BAR ');
if (evHtmlStart !== -1 && evHtmlEnd !== -1) {
  html = html.slice(0, evHtmlStart) + html.slice(evHtmlEnd);
  count++; console.log('OK: events-section');
} else { console.error('MISS: events-section evStart=' + evHtmlStart + ' evEnd=' + evHtmlEnd); }

// 11. Cat-nav arcade pill
rep('\n      <a href="#arcade" class="cat-pill" data-cat="arcade"> PLAIstore VR</a>', '', 'cat-pill-arcade');

// 12. Enterprise see-all /plaistore link
rep('\n        <a href="/plaistore" class="see-all">Enterprise Plans</a>', '', 'enterprise-see-all');

// 13. Arcade cat-section HTML block
var arcHtmlStart = html.indexOf('\n    <!-- -- ARCADE ');
var arcHtmlEnd = html.indexOf('\n    <!-- -- WELLNESS ');
if (arcHtmlStart !== -1 && arcHtmlEnd !== -1) {
  html = html.slice(0, arcHtmlStart) + html.slice(arcHtmlEnd);
  count++; console.log('OK: arcade-section');
} else { console.error('MISS: arcade-section arcStart=' + arcHtmlStart + ' arcEnd=' + arcHtmlEnd); }

// 14. Creator desc
rep('Build and publish VR experiences to PLAIstore \u00b7 70/30 revenue share',
    'Build and deploy VR experiences on the AIOS platform', 'creator-desc');

// 15. Submit Your VR App card
var submitCardStart = html.indexOf('\n        <a\n          href="/vr-developer"\n          class="xp-card"\n          style="--accent: var(--creator)"');
if (submitCardStart !== -1) {
  var submitAppI = html.indexOf('Submit App', submitCardStart);
  if (submitAppI !== -1) {
    var submitCardEnd = html.indexOf('</a>', submitAppI) + 4;
    html = html.slice(0, submitCardStart) + html.slice(submitCardEnd);
    count++; console.log('OK: submit-vr-app-card');
  }
} else { console.error('MISS: submit-vr-app-card'); }

// 16. Dev banner desc
rep('Submit WebXR experiences to PLAIstore, reach 20M+ Meta Quest users\n          through realaios.com, and earn 70% of every sale. No app store\n          approval. No gatekeeping. The AIOS SDK gives your experience immersive\n          coordinates and metadata, and 24/7 SWARM promotion automatically.',
    'Build and deploy WebXR experiences on the AIOS platform. The AIOS SDK gives your experience\n          immersive coordinates and metadata, with 24/7 SWARM promotion automatically.', 'dev-banner');

// 17. Footer arcade link
rep('\n          <a href="#arcade">PLAIstore VR</a>', '', 'footer-arcade');

// 18. Footer enterprise /plaistore
rep('\n          <a href="/plaistore">Enterprise Plans</a>', '', 'footer-enterprise-plaistore');

// 19. Footer /experiences -> /vr-hub
rep('          <a href="/experiences">All Live XPs</a>', '          <a href="/vr-hub">VR Hub</a>', 'footer-all-live-xps');

// 20. JS ARCADE arrays
var arcJsStart = html.indexOf('\n      const ARCADE_LIVE = [');
var arcJsEnd = html.indexOf('\n      const WELLNESS_XP = [');
if (arcJsStart !== -1 && arcJsEnd !== -1) {
  html = html.slice(0, arcJsStart) + html.slice(arcJsEnd);
  count++; console.log('OK: arcade-js-arrays');
} else { console.error('MISS: arcade-js-arrays arcJsStart=' + arcJsStart + ' arcJsEnd=' + arcJsEnd); }

// 21. Arcade render block
var arcRenderStart = html.indexOf('\n      document.getElementById("arcade-teaser")');
var arcRenderEnd = html.indexOf('\n\n      // -- Share sheet ');
if (arcRenderStart !== -1 && arcRenderEnd !== -1) {
  html = html.slice(0, arcRenderStart) + html.slice(arcRenderEnd);
  count++; console.log('OK: arcade-render');
} else { console.error('MISS: arcade-render arcRStart=' + arcRenderStart + ' arcREnd=' + arcRenderEnd); }

// 22. PLAIStore stats fallback catch
var catchStart = html.indexOf('\n        .catch(() => {\n          // Fallback to PLAIstore');
if (catchStart !== -1) {
  var catchEnd = html.indexOf('\n        });', catchStart) + '\n        });'.length;
  html = html.slice(0, catchStart) + '\n        .catch(() => {});' + html.slice(catchEnd);
  count++; console.log('OK: stats-catch-plaistore');
} else { console.error('MISS: stats-catch-plaistore'); }

// 23. renderEvents IIFE
var evJsStart = html.indexOf('\n      // -- Events renderer ');
var evJsEnd = html.indexOf('\n      // -- Search filter ');
if (evJsStart !== -1 && evJsEnd !== -1) {
  html = html.slice(0, evJsStart) + html.slice(evJsEnd);
  count++; console.log('OK: renderEvents-iife');
} else { console.error('MISS: renderEvents-iife evJsStart=' + evJsStart + ' evJsEnd=' + evJsEnd); }

if (usesCRLF) html = html.replace(/\n/g, '\r\n');
fs.writeFileSync(FILE, html, 'utf8');
console.log('\nDone. ' + count + ' changes applied.');
