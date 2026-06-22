/**
 * 部署配置
 * ─────────────────────────────────────────
 * 国内用户：Vercel 常无法访问，请用腾讯云云函数，见 DEPLOY-CN.md
 * 本地开发（localhost）会自动走本机 server.js
 */
window.APP_CONFIG = {
  // 国内请改为腾讯云 API 地址；海外/VPN 可用 Vercel
  API_BASE: 'https://jiu-gamma.vercel.app',
  // 若云函数路径不是 /api/orders，在此修改，例如 '/order'
  API_PATH: '/api/orders',
};
