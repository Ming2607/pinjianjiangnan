#!/usr/bin/env node
/** 更新 config.js 中的 API 地址并同步 docs/ */
const fs = require('fs');
const path = require('path');

const apiBase = process.argv[2].replace(/\/$/, '');
const apiPath = process.argv[3] || '/order';

const root = path.join(__dirname, '..');
const configPath = path.join(root, 'config.js');
let content = fs.readFileSync(configPath, 'utf8');
content = content.replace(/API_BASE:\s*'[^']*'/, `API_BASE: '${apiBase}'`);
content = content.replace(/API_PATH:\s*'[^']*'/, `API_PATH: '${apiPath}'`);
fs.writeFileSync(configPath, content);
console.log('✓ config.js 已更新');
console.log('  API_BASE:', apiBase);
console.log('  API_PATH:', apiPath);

require('./build-pages.js');
