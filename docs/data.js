/** 商品数据 — 价格可按实际调整 */
const CATEGORIES = [
  {
    id: 'daxueshi',
    name: '江南大学士',
    subtitle: '典藏系列',
  },
  {
    id: 'zhishanyun',
    name: '至善韵',
    subtitle: '匠心佳酿',
  },
  {
    id: 'zhongqiu',
    name: '中秋佳品',
    subtitle: '时令臻选',
  },
];

const PRODUCTS = [
  // 江南大学士 — 4 款，支持单瓶 / 成箱
  {
    id: 'dxs-01',
    categoryId: 'daxueshi',
    name: '江南大学士 · 典藏',
    desc: '52° 浓香型，礼盒装 500ml',
    image: 'images/dxs-01.jpg',
    pricing: {
      type: 'dual',
      bottle: { label: '单瓶', price: 168, unit: '瓶' },
      case: { label: '成箱', price: 888, unit: '箱', note: '6瓶/箱' },
    },
  },
  {
    id: 'dxs-02',
    categoryId: 'daxueshi',
    name: '江南大学士 · 经典',
    desc: '52° 浓香型，经典款 500ml',
    image: 'images/dxs-02.jpg',
    pricing: {
      type: 'dual',
      bottle: { label: '单瓶', price: 128, unit: '瓶' },
      case: { label: '成箱', price: 688, unit: '箱', note: '6瓶/箱' },
    },
  },
  {
    id: 'dxs-03',
    categoryId: 'daxueshi',
    name: '江南大学士 · 臻品',
    desc: '42° 浓香型，臻品款 500ml',
    image: 'images/dxs-03.jpg',
    pricing: {
      type: 'dual',
      bottle: { label: '单瓶', price: 198, unit: '瓶' },
      case: { label: '成箱', price: 1088, unit: '箱', note: '6瓶/箱' },
    },
  },
  {
    id: 'dxs-04',
    categoryId: 'daxueshi',
    name: '江南大学士 · 礼赠',
    desc: '52° 浓香型，节日礼赠装 500ml',
    image: 'images/dxs-04.jpg',
    pricing: {
      type: 'dual',
      bottle: { label: '单瓶', price: 158, unit: '瓶' },
      case: { label: '成箱', price: 828, unit: '箱', note: '6瓶/箱' },
    },
  },
  // 至善韵 — 1 款
  {
    id: 'zsy-01',
    categoryId: 'zhishanyun',
    name: '至善韵 · 陈年佳酿',
    desc: '53° 酱香型，江南大学教授团队监制 500ml',
    image: 'images/zsy-01.jpg',
    pricing: {
      type: 'single',
      price: 268,
      unit: '瓶',
    },
  },
  // 中秋佳品 — 花雕熟醉蟹
  {
    id: 'zq-01',
    categoryId: 'zhongqiu',
    name: '无锡老字号 · 花雕熟醉蟹',
    desc: '传统花雕工艺，冷链配送，4只/盒',
    image: 'images/zq-01.jpg',
    pricing: {
      type: 'single',
      price: 198,
      unit: '盒',
    },
  },
];
