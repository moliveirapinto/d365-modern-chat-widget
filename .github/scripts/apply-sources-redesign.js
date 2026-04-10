#!/usr/bin/env node
// Script to apply Sources redesign changes to widget-core.js
// Called by the GitHub Actions workflow from .github/scripts/

const fs = require('fs');
const path = require('path');

// Script is at .github/scripts/, so go up 2 dirs to reach repo root
const filePath = path.join(__dirname, '..', '..', 'dist', 'widget-core.js');
console.log('Reading file from:', filePath);
let content = fs.readFileSync(filePath, 'utf8');
console.log('File read, size:', content.length, 'bytes');

// CHANGE 1: CSS - Replace old source styles with new modern styles
const oldCSSPrefix = `      '.d365-sources-title{font-weight:600;color:#1f2937;margin-bottom:8px;font-size:13px}',`;
const oldCSSSuffix = `      '.d365-source-domain{color:#64748b;font-size:11px;margin-top:2px}',`;

const cssPrefixIdx = content.indexOf(oldCSSPrefix);
const cssSuffixIdx = content.indexOf(oldCSSSuffix);
if (cssPrefixIdx === -1 || cssSuffixIdx === -1) {
  console.error('ERROR: CSS pattern not found. prefix idx:', cssPrefixIdx, 'suffix idx:', cssSuffixIdx);
  process.exit(1);
}

const newCSS = `      '.d365-sources-header{display:flex;align-items:center;gap:6px;margin-bottom:8px}',
      '.d365-sources-icon{width:13px;height:13px;flex-shrink:0;opacity:.55}',
      '.d365-sources-label{font-weight:700;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.6px}',
      '.d365-source-item{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:4px 0;background:rgba(0,0,0,0.025);border-radius:10px;border:1px solid rgba(0,0,0,0.06);text-decoration:none!important;color:inherit;transition:all .2s;cursor:default}',
      '.d365-source-item:hover{background:\'+c.primaryColor+\'0d;border-color:\'+c.primaryColor+\'33;transform:translateX(2px);box-shadow:0 2px 8px rgba(0,0,0,.06)}',
      '.d365-source-item.linked{cursor:pointer}',
      '.d365-source-num{min-width:20px;height:20px;padding:0 5px;border-radius:5px;background:\'+c.primaryColor+\'18;color:\'+c.primaryColor+\';font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
      '.d365-source-info{flex:1;min-width:0}',
      '.d365-source-name{color:#1e293b;font-weight:500;font-size:13px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.d365-source-item.linked .d365-source-name{color:\'+c.primaryColor+\'}',
      '.d365-source-meta{color:#94a3b8;font-size:11px;margin-top:1px}',
      '.d365-source-arrow{color:\'+c.primaryColor+\';opacity:.4;font-size:13px;flex-shrink:0;transition:opacity .2s}',
      '.d365-source-item:hover .d365-source-arrow{opacity:.8}',`;

// Replace from prefix to (and including) suffix
const cssOldBlock = content.substring(cssPrefixIdx, cssSuffixIdx + oldCSSSuffix.length);
content = content.substring(0, cssPrefixIdx) + newCSS + content.substring(cssSuffixIdx + oldCSSSuffix.length);
console.log('Change 1 (CSS) applied! Replaced', cssOldBlock.length, 'chars with', newCSS.length, 'chars');

// CHANGE 2: Inline citation pill badges
const oldPillAnchor = `? '<span title="' + ref.title + '" style="color:' + config.primaryColor`;
const pillIdx = content.indexOf(oldPillAnchor);
if (pillIdx === -1) {
  console.error('ERROR: Pill badge anchor not found');
  process.exit(1);
}
// Find end of this expression (the closing semicolon line)
const pillLineStart = content.lastIndexOf('\n', pillIdx) + 1;
// Find the complete multi-line expression - ends at the closing semicolon of the ternary
const pillSemiIdx = content.indexOf("'</a>';", pillIdx);
const pillLineEnd = content.indexOf('\n', pillSemiIdx) + 1;

const oldPillBlock = content.substring(pillLineStart, pillLineEnd);
console.log('Old pill block:', JSON.stringify(oldPillBlock));

const newPillBlock = oldPillBlock
  .replace(
    `? '<span title="' + ref.title + '" style="color:' + config.primaryColor + ';text-decoration:none;font-size:0.75em;vertical-align:super;font-weight:600;cursor:help;">' + ref.num + '</span>'`,
    `? '<span title="' + ref.title + '" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:' + config.primaryColor + '22;color:' + config.primaryColor + ';font-size:9.5px;font-weight:700;vertical-align:super;line-height:1;cursor:help;margin:0 1px;">' + ref.num + '</span>'`
  )
  .replace(
    `: '<a href="' + ref.url + '" target="_blank" title="' + ref.title + '" style="color:#0078d4;text-decoration:none;font-size:0.75em;vertical-align:super;">' + ref.num + '</a>';`,
    `: '<a href="' + ref.url + '" target="_blank" title="' + ref.title + '" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:#0078d422;color:#0078d4;font-size:9.5px;font-weight:700;vertical-align:super;line-height:1;text-decoration:none;margin:0 1px;">' + ref.num + '</a>';`
  );

if (oldPillBlock === newPillBlock) {
  console.error('ERROR: Pill badge replacement did not change anything. Block was:', JSON.stringify(oldPillBlock));
  process.exit(1);
}

content = content.substring(0, pillLineStart) + newPillBlock + content.substring(pillLineEnd);
console.log('Change 2 (pill badges) applied!');

// CHANGE 3: Sources HTML block - modern card design
// Use anchor-based replacement: find the unique string and replace up to a safe end point
const sourcesStartAnchor = `sourcesHtml += '<div class="d365-sources-title">Sources</div>';`;
const sourcesEndAnchor = `sourcesHtml += '</div></div>';`;

let srcStart = content.indexOf(sourcesStartAnchor);
if (srcStart === -1) {
  // Try with actual double quotes (no escaping needed in indexOf)
  console.error('ERROR: Sources start anchor not found');
  // Debug: look for nearby content
  const debugIdx = content.indexOf('d365-sources-title');
  if (debugIdx > -1) console.error('Context:', JSON.stringify(content.substring(debugIdx-20, debugIdx+120)));
  process.exit(1);
}

// Include the full line
const srcLineStart = content.lastIndexOf('\n', srcStart) + 1;
const srcEndAnchorIdx = content.indexOf(sourcesEndAnchor, srcStart);
if (srcEndAnchorIdx === -1) {
  console.error('ERROR: Sources end anchor not found');
  process.exit(1);
}
const srcLineEnd = content.indexOf('\n', srcEndAnchorIdx) + 1;

console.log('Sources block found at lines', srcLineStart, 'to', srcLineEnd);

const newSourcesLines = `        sourcesHtml += '<div class="d365-sources-header">';
        sourcesHtml += '<svg class="d365-sources-icon" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
        sourcesHtml += '<span class="d365-sources-label">Sources</span>';
        sourcesHtml += '</div>';
        references.forEach(function(ref) {
          if (ref.isCite) {
            sourcesHtml += '<div class="d365-source-item">';
          } else {
            sourcesHtml += '<a href="' + ref.url + '" target="_blank" class="d365-source-item linked">';
          }
          sourcesHtml += '<span class="d365-source-num">' + ref.num + '</span>';
          sourcesHtml += '<div class="d365-source-info">';
          sourcesHtml += '<div class="d365-source-name">' + ref.title + '</div>';
          if (!ref.isCite && ref.url) {
            var domain = ref.url.replace(/https?:\\/\\/(www\\.)?/, '').split('/')[0];
            sourcesHtml += '<div class="d365-source-meta">' + domain + '</div>';
          } else if (ref.isCite) {
            sourcesHtml += '<div class="d365-source-meta">Internal reference</div>';
          }
          sourcesHtml += '</div>';
          sourcesHtml += '<span class="d365-source-arrow">' + (ref.isCite ? '&rsaquo;' : '&#x2197;') + '</span>';
          sourcesHtml += ref.isCite ? '</div>' : '</a>';
`;

content = content.substring(0, srcLineStart) + newSourcesLines + content.substring(srcLineEnd);
console.log('Change 3 (sources HTML) applied!');

// Final verification
if (!content.includes('.d365-sources-header{display:flex')) {
  console.error('ERROR: Verification failed - CSS change not in output');
  process.exit(1);
}
if (!content.includes('border-radius:4px;background:\' + config.primaryColor + \'22')) {
  console.error('ERROR: Verification failed - pill badge not in output');
  // Show what's there
  const idx = content.indexOf('config.primaryColor + \'22');
  console.error('Search result:', idx);
  process.exit(1);
}
if (!content.includes('d365-sources-icon')) {
  console.error('ERROR: Verification failed - SVG icon not in output');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS! All 3 changes applied. Final file size:', content.length, 'chars');
