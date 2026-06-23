#!/usr/bin/env node
/**
 * 配置企业微信机器人 Webhook 并部署云函数
 * 用法: node scripts/setup-wecom.js "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxxx"
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const cloudbasercPath = path.join(root, 'cloudbaserc.json');

const webhook = process.argv[2]?.trim();
if (!webhook || !webhook.includes('qyapi.weixin.qq.com/cgi-bin/webhook/send')) {
  console.error('\n用法: node scripts/setup-wecom.js "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key"\n');
  console.error('在企业微信群 → 右上角 ··· → 群机器人 → 复制 Webhook 地址\n');
  process.exit(1);
}

function upsertEnv(key, value) {
  let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  text = re.test(text) ? text.replace(re, line) : text.trimEnd() + `\n${line}\n`;
  fs.writeFileSync(envPath, text);
}

function readEnv(key) {
  if (!fs.existsSync(envPath)) return '';
  const m = fs.readFileSync(envPath, 'utf8').match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : '';
}

upsertEnv('WECOM_WEBHOOK_URL', webhook);
console.log('✓ 已写入 .env → WECOM_WEBHOOK_URL');

let cfg = { envId: '', functionRoot: './cloudfunctions', functions: [] };
if (fs.existsSync(cloudbasercPath)) {
  try { cfg = JSON.parse(fs.readFileSync(cloudbasercPath, 'utf8')); } catch {}
}

const sendkey = readEnv('SERVERCHAN_SENDKEY');
const envId = cfg.envId || process.env.TCB_ENV_ID;
if (!envId) {
  console.error('\n未找到 CloudBase envId，请先在 cloudbaserc.json 配置或设置 TCB_ENV_ID\n');
  process.exit(1);
}

const envVariables = { WECOM_WEBHOOK_URL: webhook };
if (sendkey) envVariables.SERVERCHAN_SENDKEY = sendkey;

cfg.envId = envId;
cfg.functionRoot = './cloudfunctions';
cfg.functions = [{
  name: 'order',
  timeout: 15,
  runtime: 'Nodejs18.15',
  envVariables,
}];
fs.writeFileSync(cloudbasercPath, JSON.stringify(cfg, null, 2));
console.log('✓ 已更新 cloudbaserc.json');

console.log('\n正在部署云函数 order …');
execSync(`npx cloudbase functions:deploy order --env-id ${envId} --force`, {
  cwd: root,
  stdio: 'inherit',
});

console.log('\n正在发送测试通知 …');
const testOrder = {
  id: 'TEST-WECOM',
  createdAt: new Date().toISOString(),
  customer: { name: '测试', phone: '13800138000', address: '无锡' },
  items: [{ name: '测试商品', spec: '单瓶', qty: 1, subtotal: 168 }],
  total: 168,
};

const apiBase = 'https://pinjianjiangnan-d0f2mt6713493228-1445879452.ap-shanghai.app.tcloudbase.com';
execSync(
  `curl -s -X POST "${apiBase}/order" -H "Content-Type: application/json" -d '${JSON.stringify(testOrder)}'`,
  { cwd: root, stdio: 'inherit' }
);

console.log('\n✓ 完成！请检查：');
console.log('  1. 企业微信群是否收到测试消息');
console.log('  2. 个人微信是否收到提醒（需开启企业微信 → 我 → 设置 → 在微信中接收企业微信消息）');
console.log('  3. 若开了 Server酱，个人微信也会收到 Server酱 通知\n');
