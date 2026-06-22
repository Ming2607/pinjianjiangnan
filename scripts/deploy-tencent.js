#!/usr/bin/env node
/**
 * 腾讯云 CloudBase 部署助手
 * 1. 先运行: npx cloudbase login （微信扫码）
 * 2. 再运行: npm run deploy:tencent
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const root = path.join(__dirname, '..');
const cloudbaserc = path.join(root, 'cloudbaserc.json');

function run(cmd) {
  console.log('\n> ' + cmd);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

async function ask(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(q, (a) => { rl.close(); resolve(a.trim()); }));
}

async function main() {
  console.log('\n=== 品鉴江南 · 腾讯云部署 ===\n');

  let envId = process.env.TCB_ENV_ID;
  if (!envId && fs.existsSync(cloudbaserc)) {
    try { envId = JSON.parse(fs.readFileSync(cloudbaserc, 'utf8')).envId; } catch {}
  }
  if (!envId) {
    envId = await ask('请输入 CloudBase 环境 ID（控制台 → 环境 → 环境 ID）: ');
  }

  let sendkey = process.env.SERVERCHAN_SENDKEY;
  if (!sendkey && fs.existsSync(path.join(root, '.env'))) {
    const m = fs.readFileSync(path.join(root, '.env'), 'utf8').match(/SERVERCHAN_SENDKEY=(.+)/);
    if (m) sendkey = m[1].trim();
  }
  if (!sendkey) {
    sendkey = await ask('请输入 Server酱 SendKey: ');
  }

  fs.writeFileSync(cloudbaserc, JSON.stringify({
    envId,
    functionRoot: './cloudfunctions',
    functions: [{
      name: 'order',
      timeout: 15,
      runtime: 'Nodejs18.15',
      envVariables: { SERVERCHAN_SENDKEY: sendkey },
    }],
  }, null, 2));

  run(`npx cloudbase functions:deploy order --envId ${envId} --force`);

  console.log('\n请在腾讯云控制台为 order 函数开启 HTTP 访问（触发器 → HTTP 访问）');
  console.log('得到地址形如: https://xxx.service.tcloudbase.com/order');
  console.log('\n然后运行:');
  console.log('  node scripts/set-api-url.js https://xxx.service.tcloudbase.com');
  console.log('  git add config.js docs/ && git commit -m "切换腾讯云 API" && git push\n');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
