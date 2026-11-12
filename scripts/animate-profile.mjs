// Self-contained SVG animation layers over the original, unchanged PNG artwork.
// Regenerate with: node scripts/animate-profile.mjs
import fs from 'node:fs';

const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function codeEditor(x, y, width, height, fontSize, lines) {
  const row = height / (lines.length + 1);
  let defs = '', styles = '', content = '';
  lines.forEach(([line, color], i) => {
    const start = i * 9, finish = start + 16;
    const top = y + 7 + row * i;
    defs += `<clipPath id="line${i}"><rect x="${x + 9}" y="${top}" width="${width - 18}" height="${row}" class="reveal line${i}"/></clipPath>`;
    styles += `.line${i}{transform-origin:${x + 9}px ${top}px;animation:type${i} 12s steps(${Math.max(line.length, 1)},end) infinite}@keyframes type${i}{0%,${start}%{transform:scaleX(0)}${finish}%,94%{transform:scaleX(1)}100%{transform:scaleX(0)}}`;
    content += `<text x="${x + 9}" y="${top + fontSize}" fill="${color}" clip-path="url(#line${i})">${escape(line)}</text>`;
  });
  let cursor = `<rect class="cursor" x="${x + 10}" y="${y + height - 9}" width="${fontSize * .5}" height="${fontSize}" fill="#f2d596"/>`;
  if (fontSize >= 12) {
    // Keep the terminal caret beside the last typed line, inside the display.
    // The old bottom-aligned 12px caret extended below the editor's lower edge.
    const caretX = Math.min(x + width - 12, x + 12 + lines.at(-1)[0].length * fontSize * .6);
    const caretY = y + 8 + row * (lines.length - 1);
    styles += '.terminal-caret{animation:terminal-caret 12s steps(1,end) infinite}@keyframes terminal-caret{0%,52%,100%{opacity:0}53%,94%{opacity:1}}';
    cursor = `<g class="terminal-caret"><rect class="cursor" x="${caretX}" y="${caretY}" width="2" height="${fontSize}" fill="#8dd6c6"/></g>`;
  }
  return { defs, styles, content: `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" fill="#0c1423"/><g font-family="Consolas,'Courier New',monospace" font-size="${fontSize}">${content}</g>${cursor}` };
}

function clock(cx, cy, radius) {
  // Only the dial is reconstructed. The photographed casing and its shadow stay.
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    ticks += `<line x1="0" y1="${-radius + 5}" x2="0" y2="${-radius + (i % 3 === 0 ? 13 : 9)}" transform="rotate(${i * 30})" stroke="#0c131e" stroke-width="${i % 3 === 0 ? 2.6 : 1.5}" stroke-linecap="round"/>`;
  }
  return `<g transform="translate(${cx} ${cy})"><circle r="${radius}" fill="url(#clock-face)"/>${ticks}
<g transform="rotate(-52)"><line class="hour-hand" x1="0" y1="5" x2="0" y2="${-radius * .48}" stroke="#b6ad99" stroke-width="3.5" stroke-linecap="round"/></g>
<g transform="rotate(60)"><line class="minute-hand" x1="0" y1="7" x2="0" y2="${-radius * .73}" stroke="#c6bdac" stroke-width="2.4" stroke-linecap="round"/></g>
<g transform="rotate(150)"><line class="second-hand" x1="0" y1="-8" x2="0" y2="${radius * .83}" stroke="#ec8952" stroke-width="1.9" stroke-linecap="round"/></g>
<circle r="3.8" fill="#e79562"/><circle r="1.2" fill="#eac2a0"/></g>`;
}

function status(x, y, delay = 0, color = '#79d5be', radius = 5) {
  return `<circle class="status" cx="${x}" cy="${y}" r="${radius}" fill="${color}" style="animation-delay:${delay}s"/>`;
}

function scan(path, delay = 0, color = '#8bb9ef', width = 3) {
  return `<path class="scan" d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" style="animation-delay:${delay}s"/>`;
}

function screenActivity(id, rows, delay = 0, color = '#e8f4ff') {
  // Trace the existing photographed UI lines; clip each moving highlight to its
  // own line so nothing can cross into adjacent panels, buttons or the bezel.
  return rows.map(([x, y, width, height], i) => {
    const clip = `${id}-${i}`;
    return `<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}"/></clipPath></defs><g clip-path="url(#${clip})"><rect class="screen-sheen" x="${x - 22}" y="${y}" width="18" height="${height}" fill="${color}" style="--travel:${width + 44}px;animation-delay:${delay - i * .6}s"/></g>`;
  }).join('');
}

function tabletActivity(hero = false) {
  if (hero) {
    return screenActivity('hero-tablet', [
      [208, 577, 66, 6], [208, 590, 52, 4],
      [208, 601, 56, 4], [208, 612, 40, 4],
      [289, 596, 68, 5], [289, 608, 96, 3],
    ])
      + `<rect class="screen-button" x="293" y="642" width="48" height="20" rx="6" fill="#fff1c4"/>`;
  }
  return screenActivity('react-tablet', [
    [149, 579, 73, 6], [149, 593, 70, 4],
    [148, 604, 53, 4], [148, 615, 46, 4],
    [220, 611, 56, 5], [220, 623, 83, 3],
    [358, 574, 15, 3], [358, 598, 15, 3], [358, 620, 15, 3],
  ], -2)
    + `<rect class="screen-button" x="219" y="655" width="45" height="16" rx="4" fill="#fff1c4" style="animation-delay:-2s"/>`;
}

function notebookActivity() {
  // Follow the photographed highlighter strokes, including the page perspective.
  // The original notes, text and arrows remain visible and unchanged.
  return [
    [548, 574, 651, 566, 3.2],
    [553, 601, 664, 593.5, 3.6],
    [559, 637, 666, 629.5, 4],
  ].map(([x1, y1, x2, y2, height], i) => {
    const id = `notebook-highlight-${i}`;
    const points = `${x1},${y1 - height / 2} ${x2},${y2 - height / 2} ${x2},${y2 + height / 2} ${x1},${y1 + height / 2}`;
    return `<defs><clipPath id="${id}"><polygon points="${points}"/></clipPath></defs><g clip-path="url(#${id})"><rect class="screen-sheen" x="${x1 - 22}" y="${y2 - height}" width="18" height="${y1 - y2 + height * 2}" fill="#fffaf0" style="--travel:${x2 - x1 + 44}px;animation-delay:${-i * 1.4}s"/></g>`;
  }).join('');
}

function ecosystemActivity() {
  let content = '';
  // Laravel: activity inside the photographed laptop screen.
  content += screenActivity('laravel-code', [
    [201, 282, 16, 4], [221, 282, 31, 4],
    [207, 290, 7, 3], [217, 290, 60, 3],
    [207, 296, 37, 3], [248, 296, 26, 3],
    [201, 303, 27, 4],
  ], -1);
  // AI Integration: connections and nodes pulse around the tablet's graph.
  content += scan('M600 247 L625 236 L648 261 L639 288 L612 281 L600 247', -2, '#f1d599', 1.4);
  [[600, 247], [625, 236], [648, 261], [639, 288], [612, 281]].forEach(([x, y], i) => {
    content += status(x, y, -i * .7, '#f4d99a', 3.5);
  });
  // DevOps: the clock ticks while each build stage activates in sequence.
  content += clock(1007, 270, 70);
  for (let i = 0; i < 4; i++) {
    content += `<rect class="stage" x="1103" y="${201 + i * 46}" width="165" height="34" rx="6" fill="none" stroke="#f5ce79" stroke-width="2.5" style="animation-delay:${-i * 2}s"/>`;
  }
  // Research: animate the review lines; keep the photographed check unchanged.
  content += scan('M1533 244 L1578 246 M1533 256 L1564 258', -3, '#839bbb', 2.2);
  // React / Next.js: the second tablet has its own loading and approval loop.
  content += tabletActivity();
  // Reading: subtle highlights stay inside the existing notebook marks.
  content += notebookActivity();
  // Workflow: a packet moves between all four physical tiles.
  [1424, 1521, 1624].forEach((x, i) => {
    content += `<circle class="packet" cx="${x}" cy="643" r="3.5" fill="#f1cb7b" style="animation-delay:${-i * 1.2}s"/>`;
  });
  content += `<circle class="button-glow" cx="1583" cy="645" r="17" fill="none" stroke="#97ead2" stroke-width="2"/>`;
  return content;
}

for (const theme of ['dark', 'light']) {
  for (const kind of ['banner', 'ecosystem']) {
    const png = fs.readFileSync(`assets/${kind}-realistic-${theme}.png`);
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    const editor = kind === 'banner'
      ? codeEditor(721, 547, 201, 77, 8, [
        ['Route::get("/projects",', '#e9bf77'],
        ['  [ProjectController::class,', '#8bb9ef'],
        ['   "index"]);', '#8bb9ef'],
        ['// Building something useful', '#7ac5b5'],
        ['$portfolio->deploy();', '#f1d7a5'],
      ])
      : codeEditor(957, 551, 178, 159, 12, [
        ['$ git status', '#e9bf77'],
        ['On branch main', '#d3e0ef'],
        ['$ npm run dev', '#7ac5b5'],
        ['> vite', '#a6b4d0'],
        ['Ready in 248 ms', '#7ac5b5'],
      ]);
    let effects = '';
    if (kind === 'banner') {
      // The steam starts above the cup, leaving the physical photo untouched.
      effects = `<g fill="none" stroke="${theme === 'dark' ? '#f5e7d1' : '#8b7864'}" stroke-width="2" stroke-linecap="round"><path class="steam" d="M558 642 C548 630 570 623 560 611 C552 602 564 593 560 585"/><path class="steam second" d="M577 641 C587 629 567 621 577 610 C584 601 574 593 581 582"/></g>`
        + clock(1467, 129, 55)
        + tabletActivity(true)
        + scan('M831 488 H885', -1, '#e4bd74', 2);
    } else {
      effects = '<rect x="970" y="716" width="236" height="2" rx="1" fill="#24434b"/><rect class="progress" x="970" y="716" width="236" height="2" rx="1" fill="#72d9c4"/>' + ecosystemActivity();
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">Renz ${kind === 'banner' ? '- Full Stack Developer | Web Developer' : '- My Ecosystem'}</title>
<desc id="desc">Realistic ${kind === 'banner' ? 'workspace with typing code, an active tablet, ticking clock hands and gently rising coffee steam' : 'development toolkit with animated laptop code, AI nodes, clock hands, build stages, research review, tablet activity, notebook highlights, terminal output and workflow packets'}. Supports reduced motion.</desc>
<defs>${editor.defs}<radialGradient id="clock-face" cx="35%" cy="25%" r="80%"><stop stop-color="#293341"/><stop offset=".65" stop-color="#202a39"/><stop offset="1" stop-color="#17202d"/></radialGradient></defs>
<style>
${editor.styles}
.cursor{animation:blink 1.2s steps(1,end) infinite}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.steam{animation:steam 4s ease-in-out infinite;opacity:0}.second{animation-delay:-2s}
@keyframes steam{0%{opacity:0;transform:translateY(5px)}30%{opacity:.23}100%{opacity:0;transform:translateY(-17px)}}
.progress{transform-origin:970px 716px;animation:build 12s ease-in-out infinite}
@keyframes build{0%,25%{transform:scaleX(.05)}80%,94%{transform:scaleX(1)}100%{transform:scaleX(.05)}}
.hour-hand{animation:turn 43200s linear infinite}.minute-hand{animation:turn 3600s linear infinite}.second-hand{animation:turn 60s steps(60,end) infinite}
@keyframes turn{to{transform:rotate(360deg)}}
.status{animation:status 4s ease-in-out infinite}@keyframes status{0%,100%{opacity:.25}45%{opacity:.95}}
.scan{stroke-dasharray:32 170;animation:scan 6s linear infinite;opacity:.7}@keyframes scan{to{stroke-dashoffset:-202}}
.screen-sheen{animation:screen-sheen 4.8s linear infinite;opacity:0}@keyframes screen-sheen{0%{transform:translateX(0);opacity:0}15%,80%{opacity:.24}100%{transform:translateX(var(--travel));opacity:0}}
.screen-button{animation:screen-button 5s ease-in-out infinite;opacity:0}@keyframes screen-button{0%,100%{opacity:0}45%,60%{opacity:.13}}
.button-glow{animation:button-glow 5s ease-in-out infinite}@keyframes button-glow{0%,100%{opacity:0}45%,65%{opacity:.8}}
.draw-check{stroke-dasharray:50;animation:check 8s ease-in-out infinite}@keyframes check{0%,15%{stroke-dashoffset:50;opacity:0}45%,85%{stroke-dashoffset:0;opacity:.85}100%{stroke-dashoffset:0;opacity:0}}
.stage{animation:stage 8s ease-in-out infinite;opacity:0}@keyframes stage{0%,25%,100%{opacity:0}6%,18%{opacity:.85}}
.packet{animation:packet 3.6s ease-in-out infinite}@keyframes packet{0%,100%{transform:translateX(0);opacity:0}15%{opacity:1}80%{transform:translateX(17px);opacity:1}95%{transform:translateX(17px);opacity:0}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}.steam,.status,.scan,.stage,.packet,.button-glow,.draw-check,.screen-sheen,.screen-button{opacity:0}.cursor{opacity:1}}
</style>
<image width="${width}" height="${height}" href="data:image/png;base64,${png.toString('base64')}"/>
${editor.content}${effects}
</svg>`;
    const out = `assets/${kind}-animated-${theme}.svg`;
    fs.writeFileSync(out, svg);
    console.log(`Created ${out} (${(Buffer.byteLength(svg) / 1024 / 1024).toFixed(2)} MiB)`);
  }
}
