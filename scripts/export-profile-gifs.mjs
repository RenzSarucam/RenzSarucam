// Rasterize the existing SVG animation timeline for GitHub's image renderer.
// npm ci && npm run build:gif
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import ffmpeg from 'ffmpeg-static';

const executablePath = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(file => fs.existsSync(file));
if (!executablePath) throw new Error('Set CHROME_PATH to Chrome or Chromium.');

const fps = 6, seconds = 12, outputWidth = 1100;
const browser = await chromium.launch({ executablePath, headless: true });
try {
  for (const theme of ['dark', 'light']) {
    for (const kind of ['banner', 'ecosystem']) {
      const name = `${kind}-animated-${theme}`;
      const svg = fs.readFileSync(`assets/${name}.svg`, 'utf8');
      const [, width, height] = svg.match(/width="(\d+)" height="(\d+)"/);
      const outputHeight = Math.round(outputWidth * Number(height) / Number(width));
      const page = await browser.newPage({ viewport: { width: outputWidth, height: outputHeight }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
      const frames = path.resolve('.taste-skill/gif-frames', name);
      fs.mkdirSync(frames, { recursive: true });
      await page.setContent(`<style>html,body{margin:0;padding:0;overflow:hidden}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
      await page.evaluate(async () => {
        await Promise.all([...document.images].map(img => img.decode()));
        await document.fonts.ready;
        // Decode the embedded SVG <image> before the first screenshot.
        const image = document.querySelector('svg image');
        if (image) { const img = new Image(); img.src = image.getAttribute('href'); await img.decode(); }
        await Promise.all(document.getAnimations().map(animation => animation.ready));
        document.getAnimations().forEach(animation => animation.pause());
      });
      for (let frame = 0; frame < fps * seconds; frame++) {
        await page.evaluate(async time => {
          document.getAnimations().forEach(animation => { animation.currentTime = time; });
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }, frame * 1000 / fps);
        await page.screenshot({ path: path.join(frames, `${String(frame).padStart(3, '0')}.png`) });
      }
      await page.close();
      const out = `assets/${name}.gif`;
      const result = spawnSync(ffmpeg, [
        '-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps),
        '-i', path.join(frames, '%03d.png'),
        '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=diff:max_colors=256[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
        '-loop', '0', out,
      ], { encoding: 'utf8', windowsHide: true });
      if (result.status !== 0) throw new Error(result.stderr || 'GIF encoding failed');
      const size = fs.statSync(out).size;
      if (size > 10 * 1024 * 1024) throw new Error(`${out} exceeds 10 MiB`);
      console.log(`Exported ${out}: ${fps * seconds} frames, ${outputWidth}x${outputHeight}, ${(size / 1024 / 1024).toFixed(2)} MiB`);
    }
  }
} finally {
  await browser.close();
}
