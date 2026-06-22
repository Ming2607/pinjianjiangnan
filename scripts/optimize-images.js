#!/usr/bin/env node
/** 压缩产品图：PNG → JPG + WebP，供 GitHub Pages 快速加载 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'images');
const FILES = ['dxs-01', 'dxs-02', 'dxs-03', 'dxs-04', 'zq-01', 'zsy-01'];

console.log('\n优化产品图片…\n');

for (const name of FILES) {
  const png = path.join(DIR, `${name}.png`);
  const jpg = path.join(DIR, `${name}.jpg`);
  const webp = path.join(DIR, `${name}.webp`);

  if (!fs.existsSync(png)) {
    console.log(`  跳过 ${name}（无 PNG 源文件）`);
    continue;
  }

  execSync(`sips -Z 560 "${png}" --out "${jpg}" -s format jpeg -s formatOptions 82`, { stdio: 'ignore' });
  execSync(`cwebp -q 80 "${jpg}" -o "${webp}"`, { stdio: 'ignore' });

  const jpgKb = Math.round(fs.statSync(jpg).size / 1024);
  const webpKb = Math.round(fs.statSync(webp).size / 1024);
  console.log(`  ✓ ${name}  JPG ${jpgKb}KB  WebP ${webpKb}KB`);
}

console.log('\n完成。运行 npm run build:pages 同步到 docs/\n');
