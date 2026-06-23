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
    const env = fs.readFileSync(path.join(root, '.env'), 'utf8');
    const m = env.match(/SERVERCHAN_SENDKEY=(.+)/);
    if (m) sendkey = m[1].trim();
  }

  let wecom = process.env.WECOM_WEBHOOK_URL;
  if (!wecom && fs.existsSync(path.join(root, '.env'))) {
    const env = fs.readFileSync(path.join(root, '.env'), 'utf8');
    const m = env.match(/WECOM_WEBHOOK_URL=(.+)/);
    if (m) wecom = m[1].trim();
  }
  if (!wecom) {
    wecom = await ask('请输入企业微信机器人 Webhook（留空则仅用 Server酱）: ');
  }
  if (!sendkey && !wecom) {
    sendkey = await ask('未配置企业微信，请输入 Server酱 SendKey: ');
  }

  const envVariables = {};
  if (wecom) envVariables.WECOM_WEBHOOK_URL = wecom;
  if (sendkey) envVariables.SERVERCHAN_SENDKEY = sendkey;

  fs.writeFileSync(cloudbaserc, JSON.stringify({
    envId,
    functionRoot: './cloudfunctions',
    functions: [{
      name: 'order',
      timeout: 15,
      runtime: 'Nodejs18.15',
      envVariables,
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
