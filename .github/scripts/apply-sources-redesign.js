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

// CHANGE 1: CSS - Replace old 8 source styles with new 15 modern styles
const oldCSS = `      '.d365-sources{margin-top:16px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.1);font-size:13px}',
      '.d365-sources-title{font-weight:600;color:#1f2937;margin-bottom:8px;font-size:13px}',
      '.d365-source-item{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;margin:6px 0;background:rgba(99,102,241,0.05);border-radius:8px;border-left:3px solid \'+c.primaryColor+\';transition:background .2s}',
      '.d365-source-item:hover{background:rgba(99,102,241,0.1)}',
      '.d365-source-number{color:\'+c.primaryColor+\';font-weight:600;font-size:12px;min-width:20px}',
      '.d365-source-content{flex:1;min-width:0}',
      '.d365-source-title{color:\'+c.primaryColor+\';font-weight:500;font-size:13px;line-height:1.4;word-break:break-word}',
      '.d365-source-domain{color:#64748b;font-size:11px;margin-top:2px}',`;

const newCSS = `      '.d365-sources{margin-top:14px;padding-top:12px;border-top:1px solid rgba(0,0,0,0.08);font-size:13px}',
      '.d365-sources-header{display:flex;align-items:center;gap:6px;margin-bottom:8px}',
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

if (!content.includes(oldCSS)) {
  // Try to find what's there
  const idx = content.indexOf('.d365-sources{margin-top:');
  console.log('CSS search index:', idx);
  if (idx > -1) console.log('Found CSS context:', JSON.stringify(content.substring(idx, idx+200)));
  console.error('ERROR: CSS pattern not found - file may already be updated or format differs');
  process.exit(1);
}
content = content.replace(oldCSS, newCSS);
console.log('Change 1 (CSS) applied!');

// CHANGE 2: Inline citation pill badges
const oldPill = `          ? '<span title="' + ref.title + '" style="color:' + config.primaryColor + ';text-decoration:none;font-size:0.75em;vertical-align:super;font-weight:600;cursor:help;">' + ref.num + '</span>'
          : '<a href="' + ref.url + '" target="_blank" title="' + ref.title + '" style="color:#0078d4;text-decoration:none;font-size:0.75em;vertical-align:super;">' + ref.num + '</a>';`;

const newPill = `          ? '<span title="' + ref.title + '" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:' + config.primaryColor + '22;color:' + config.primaryColor + ';font-size:9.5px;font-weight:700;vertical-align:super;line-height:1;cursor:help;margin:0 1px;">' + ref.num + '</span>'
          : '<a href="' + ref.url + '" target="_blank" title="' + ref.title + '" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:#0078d422;color:#0078d4;font-size:9.5px;font-weight:700;vertical-align:super;line-height:1;text-decoration:none;margin:0 1px;">' + ref.num + '</a>';`;

if (!content.includes(oldPill)) {
  const idx = content.indexOf('? \'<span title="\' + ref.title');
  console.log('Pill search index:', idx);
  if (idx > -1) console.log('Found pill context:', JSON.stringify(content.substring(idx, idx+300)));
  console.error('ERROR: Pill badge pattern not found');
  process.exit(1);
}
content = content.replace(oldPill, newPill);
console.log('Change 2 (pill badges) applied!');

// CHANGE 3: Sources HTML block - modern card design
const oldSources = `        sourcesHtml += '<div class="d365-sources-title">Sources</div>';
        references.forEach(function(ref) {
          sourcesHtml += '<div class="d365-source-item">';
          sourcesHtml += '<span class="d365-source-number">[' + ref.num + ']</span>';
          sourcesHtml += '<div class="d365-source-content">';
          if (ref.isCite) {
            sourcesHtml += '<span class="d365-source-title">' + ref.title + '</span>';
          } else {
            var domain = ref.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
            sourcesHtml += '<a href="' + ref.url + '" target="_blank" class="d365-source-title">' + ref.title + '</a>';
            sourcesHtml += '<div class="d365-source-domain">' + domain + '</div>';
          }
          sourcesHtml += '</div></div>';`;

const newSources = `        sourcesHtml += '<div class="d365-sources-header">';
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
          if (!ref.isCite) {
            var domain = ref.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
            sourcesHtml += '<div class="d365-source-meta">' + domain + '</div>';
          }
          sourcesHtml += '</div>';
          sourcesHtml += '<span class="d365-source-arrow">' + (ref.isCite ? '&rsaquo;' : '&#x2197;') + '</span>';
          sourcesHtml += ref.isCite ? '</div>' : '</a>';`;

if (!content.includes(oldSources)) {
  const idx = content.indexOf('d365-sources-title');
  console.log('Sources search index:', idx);
  if (idx > -1) console.log('Found sources context:', JSON.stringify(content.substring(idx-50, idx+400)));
  console.error('ERROR: Sources HTML pattern not found');
  process.exit(1);
}
content = content.replace(oldSources, newSources);
console.log('Change 3 (sources HTML) applied!');

// Final verification
if (!content.includes('.d365-sources-header{display:flex')) {
  console.error('ERROR: Verification failed - CSS change not in output');
  process.exit(1);
}
if (!content.includes('display:inline-flex;align-items:center;justify-content:center;width:15px')) {
  console.error('ERROR: Verification failed - pill badge not in output');
  process.exit(1);
}
if (!content.includes('d365-sources-icon')) {
  console.error('ERROR: Verification failed - SVG icon not in output');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('SUCCESS! All 3 changes applied. Final file size:', content.length, 'bytes');
