/** 江南伴手礼文化展示 — 内容数据（仅供介绍与展示） */

const VIEW_MODES = {
  category: { label: '按类别', key: 'category' },
  region: { label: '按地区', key: 'region' },
};

const CATEGORIES = [
  { id: 'tea', name: '茶与茶点', icon: '茶', desc: '碧螺春、龙井与茶食礼盒' },
  { id: 'wine', name: '酒与酿制', icon: '酿', desc: '黄酒、白酒与地方佳酿' },
  { id: 'pastry', name: '糕点蜜饯', icon: '糕', desc: '时令酥点、糯软小食' },
  { id: 'silk', name: '丝绸织绣', icon: '绣', desc: '苏绣、丝巾与织艺文创' },
  { id: 'craft', name: '工艺文创', icon: '艺', desc: '核雕、泥人、书签摆件' },
  { id: 'food', name: '特产名产', icon: '味', desc: '酱菜、湖鲜、时令干货' },
];

const REGIONS = [
  { id: 'wuxi', name: '无锡', tag: '太湖明珠', desc: '酱排骨、惠山泥人与茶点' },
  { id: 'suzhou', name: '苏州', tag: '姑苏风雅', desc: '苏绣、碧螺春与古典糕点' },
  { id: 'hangzhou', name: '杭州', tag: '西湖印象', desc: '龙井、丝绸与南宋遗韵' },
  { id: 'nanjing', name: '南京', tag: '金陵古韵', desc: '雨花茶、云锦与盐水鸭' },
  { id: 'shaoxing', name: '绍兴', tag: '越地风物', desc: '黄酒、霉干菜与鲁迅故里记忆' },
  { id: 'changzhou', name: '常州', tag: '运河人家', desc: '梳篦、萝卜干与地方小食' },
];

const GIFTS = [
  {
    id: 'longjing',
    name: '西湖龙井',
    categories: ['tea'],
    regions: ['hangzhou'],
    intro:
      '产于杭州西湖群山，色绿、香郁、味甘、形美。明前龙井更为珍贵，是江南最具代表性的茶礼之一。春茶季赠送亲友，寓意清新雅致、礼敬自然。',
    tips: '宜配素色礼盒；明前、雨前等级差异较大，选购时可看产地与采摘季。',
    shops: ['西湖龙井茶社', '杭州知味观茶庄'],
  },
  {
    id: 'biluochun',
    name: '洞庭碧螺春',
    categories: ['tea'],
    regions: ['suzhou'],
    intro:
      '江苏苏州太湖洞庭山所产，条索纤细卷曲，白毫显露，香气清幽。与西湖龙井并称江南名茶，适合作为走访苏州、太湖旅游后的伴手礼。',
    tips: '冲泡宜低水温、快出汤，保留嫩香。',
    shops: ['苏州采芝斋', '东山茶坊'],
  },
  {
    id: 'jiangnan-wine',
    name: '江南大学士酒礼',
    categories: ['wine'],
    regions: ['wuxi'],
    intro:
      '以江南学府文化为底蕴的浓香型白酒礼盒，常见于无锡、江阴一带礼赠场景。包装多融入书卷、山水元素，适合节庆宴请与校友往来。',
    tips: '选购时注意酒精度与容量标识，礼盒装更宜馈赠。',
    shops: ['品鉴江南 · 江大伴手礼', '无锡王兴记礼品专柜'],
  },
  {
    id: 'huangjiu',
    name: '绍兴黄酒',
    categories: ['wine'],
    regions: ['shaoxing'],
    intro:
      '绍兴自古酒乡，加饭酒、花雕、女儿红闻名遐迩。温饮配江南小菜，是秋冬伴手礼的经典选择，也承载着越地饮食记忆。',
    tips: '可选手工冬酿、封坛酒等具有地方标识的产品。',
    shops: ['绍兴咸亨酒店特产', '古越龙山专卖店'],
  },
  {
    id: 'dinghu',
    name: '苏式糕点礼盒',
    categories: ['pastry'],
    regions: ['suzhou'],
    intro:
      '苏式月饼、定胜糕、梅花糕等传统点心，讲究皮酥馅细、甜而不腻。节令礼盒常配桂花、枣泥、鲜肉等口味，是姑苏手信代表。',
    tips: '保质期较短，建议临近赠送时购买。',
    shops: ['苏州采芝斋', '黄天源'],
  },
  {
    id: 'wangxingji',
    name: '无锡小笼与酱排骨礼盒',
    categories: ['pastry', 'food'],
    regions: ['wuxi'],
    intro:
      '无锡小笼包鲜汁饱满，酱排骨色泽红亮、甜咸适中。真空包装礼盒便于携带，是让远方亲友「尝一口江南」的招牌特产。',
    tips: '需留意冷链或常温保质期说明。',
    shops: ['无锡王兴记', '三凤桥肉庄'],
  },
  {
    id: 'suxiu',
    name: '苏绣摆件与丝巾',
    categories: ['silk', 'craft'],
    regions: ['suzhou'],
    intro:
      '苏绣为中国四大名绣之一，双面绣、乱针绣工艺精湛。丝巾、团扇、镜框摆件既实用又具收藏价值，是江南风物的优雅象征。',
    tips: '真丝制品避免暴晒与硬折，宜配礼盒说明保养方式。',
    shops: ['苏州刺绣研究所', '观前街丝绸店'],
  },
  {
    id: 'yunjin',
    name: '南京云锦文创',
    categories: ['silk', 'craft'],
    regions: ['nanjing'],
    intro:
      '南京云锦曾为皇家御用织品，纹样华丽、色彩庄重。现代文创将其融入书签、挂件、小幅装帧，便于携带与陈列。',
    tips: '小幅文创价格亲民，适合作为文化类伴手礼。',
    shops: ['南京云锦博物馆商店', '夫子庙文创店'],
  },
  {
    id: 'huishan',
    name: '惠山泥人',
    categories: ['craft'],
    regions: ['wuxi'],
    intro:
      '无锡惠山泥人造型生动、色彩明快，大阿福等形象寓意吉祥。手工捏制，是江南民间艺术与童趣记忆的结合。',
    tips: '泥人易碎，运输需防震包装。',
    shops: ['惠山古镇泥人店', '无锡博物院文创'],
  },
  {
    id: 'zhishanyun',
    name: '至善韵佳酿礼盒',
    categories: ['wine'],
    regions: ['wuxi'],
    intro:
      '江南地区常见的匠心酿制系列，多强调手工酿造与本地原料。礼盒设计常取水墨、竹石等元素，适合商务与亲友互赠。',
    tips: '可与地方茶点组合成「茶酒双礼」。',
    shops: ['品鉴江南 · 江大伴手礼'],
  },
  {
    id: 'midautumn',
    name: '江南时令礼盒',
    categories: ['pastry', 'food'],
    regions: ['wuxi', 'suzhou', 'hangzhou'],
    intro:
      '中秋、端午、春节等节令礼盒在江南尤为盛行，常含月饼、粽子、坚果与地方酱菜组合，体现「因时而食」的礼赠习惯。',
    tips: '节令产品应季性强，宜提前选购。',
    shops: ['品鉴江南 · 江大伴手礼', '知味观', '沈大成'],
  },
  {
    id: 'yuhua',
    name: '雨花茶',
    categories: ['tea'],
    regions: ['nanjing'],
    intro:
      '南京特产绿茶，形似松针、汤色清亮。曾作为国礼之一，兼具历史故事与品饮价值，是金陵文化的茶类代表。',
    tips: '可与云锦文创组合成「金陵双礼」。',
    shops: ['南京雨花茶专卖店', '中山陵景区茶庄'],
  },
  {
    id: 'shuanglin',
    name: '常州梳篦',
    categories: ['craft'],
    regions: ['changzhou'],
    intro:
      '「常州梳篦」为传统手工艺品，雕刻精细，寓意顺发吉祥。现代亦推出微型摆件与书签，便于随身携带。',
    tips: '选购时可看是否为传统工艺制作。',
    shops: ['常州梳篦厂门店', '运河五号文创店'],
  },
  {
    id: 'xihu',
    name: '西湖藕粉与杭帮伴手',
    categories: ['food', 'pastry'],
    regions: ['hangzhou'],
    intro:
      '西湖藕粉冲调方便、口感润滑，常与桂花、坚果搭配。还可与龙井、丝绸组合，构成「杭州味道」礼盒。',
    tips: '藕粉需防潮保存。',
    shops: ['知味观', '河坊街特产店'],
  },
];

const FEATURED_SHOPS = [
  {
    name: '品鉴江南 · 江大伴手礼',
    city: '无锡',
    specialty: '学府文化酒礼、时令礼盒、江南特产组合',
    note: '面向校友与来访亲友，呈现江大与江南物产的结合。',
  },
  {
    name: '知味观',
    city: '杭州',
    specialty: '龙井茶、藕粉、节令糕点',
    note: '百年老字号，杭帮风味代表。',
  },
  {
    name: '采芝斋',
    city: '苏州',
    specialty: '苏式月饼、酥点、糖果蜜饯',
    note: '观前街经典手信，姑苏甜软之味。',
  },
  {
    name: '王兴记',
    city: '无锡',
    specialty: '小笼包、酱排骨、无锡面点礼盒',
    note: '太湖畔招牌美食，适合馈赠饕客。',
  },
  {
    name: '沈大成',
    city: '上海 · 江南',
    specialty: '青团、条头糕、双酿团',
    note: '江南糯点名店，节令排队亦成风景。',
  },
  {
    name: '苏州刺绣研究所',
    city: '苏州',
    specialty: '苏绣艺术品、丝巾、摆件',
    note: '非遗技艺，适合重视文化价值的礼赠。',
  },
];
