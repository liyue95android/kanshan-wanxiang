"use strict";

const DOMAINS = {
  culture: { name: "文化", glyph: "文", color: "#8d5e77" },
  history: { name: "历史", glyph: "史", color: "#99703f" },
  life: { name: "生活", glyph: "生", color: "#4f7c66" },
  logic: { name: "逻辑", glyph: "理", color: "#5e6090" },
  nature: { name: "自然", glyph: "象", color: "#3f8076" },
  technology: { name: "科技", glyph: "机", color: "#4e7191" }
};

const DIFFICULTIES = {
  safe: { name: "轻松", reward: 3, lifeLoss: 0, odds: "答错不扣生命", color: "#307a72", level: 0 },
  challenge: { name: "挑战", reward: 6, lifeLoss: 1, odds: "答错扣1点生命", color: "#c07b2c", level: 1 },
  risk: { name: "冒险", reward: 10, lifeLoss: 1, odds: "答错扣1点生命和3金币", color: "#b44739", level: 2 }
};

const ROLES = [
  { id: "scholar", name: "研究员", code: "RE", brief: ["点亮新领域", "多得1金币"], skill: "每点亮一个新领域，额外获得1金币。", desc: "多选不同领域，可以稳定多赚金币。" },
  { id: "adventurer", name: "旅行者", code: "TR", brief: ["首次答对冒险题", "道具三选一"], skill: "本局第一次答对冒险题时，额外获得一次道具三选一。", desc: "第一次挑战高难题会有额外收获。" },
  { id: "merchant", name: "银行家", code: "BK", brief: ["首次刷新商店", "不花金币"], skill: "本局第一次刷新商店免费。", desc: "可以更早调整商店货架。" },
  { id: "mage", name: "工程师", code: "EN", brief: ["免费刷新路线", "每局1次"], skill: "每局可免费刷新一次三条路线。", desc: "遇到不喜欢的路线时，可以全部换掉。" },
  { id: "detective", name: "侦探", code: "DE", brief: ["答错后再遇同领域", "排除1个错误选项"], skill: "答错后，下一次遇到同领域题会自动排除一个错误选项。", desc: "答错会为同领域的下一题留下线索。" },
  { id: "poet", name: "收藏家", code: "CO", brief: ["首次点亮6个领域", "获得1个随机道具"], skill: "本局第一次点亮全部6个领域时，获得一个随机道具。", desc: "适合连续挑战不同领域。" }
];

const RELICS = [
  { id: "inkLamp", name: "不熄墨灯", glyph: "灯", tags: ["连胜"], cost: 12 },
  { id: "pulseGear", name: "脉冲齿轮", glyph: "轮", tags: ["连胜"], cost: 13 },
  { id: "safetyValve", name: "回落阀", glyph: "阀", tags: ["连胜", "纠错"], cost: 15 },
  { id: "prism", name: "六面棱镜", glyph: "镜", tags: ["点亮领域"], cost: 12 },
  { id: "atlas", name: "万象星图", glyph: "图", tags: ["点亮领域"], cost: 15 },
  { id: "echoFork", name: "回声音叉", glyph: "叉", tags: ["点亮领域", "道具"], cost: 14 },
  { id: "redDial", name: "红线仪表", glyph: "仪", tags: ["冒险"], cost: 12 },
  { id: "stormCore", name: "风暴核心", glyph: "核", tags: ["冒险", "连胜"], cost: 16 },
  { id: "insurance", name: "保险丝盒", glyph: "丝", tags: ["冒险", "纠错"], cost: 14 },
  { id: "coinMold", name: "铸币模具", glyph: "币", tags: ["商店"], cost: 11 },
  { id: "catalog", name: "折页目录", glyph: "录", tags: ["商店", "点亮领域"], cost: 13 },
  { id: "salvager", name: "拆解钳", glyph: "钳", tags: ["商店"], cost: 12 },
  { id: "lensCase", name: "镜片匣", glyph: "匣", tags: ["道具"], cost: 12 },
  { id: "sandClock", name: "回时沙漏", glyph: "沙", tags: ["道具", "冒险"], cost: 13 },
  { id: "converter", name: "余料转换器", glyph: "转", tags: ["道具", "商店"], cost: 14 },
  { id: "errorBook", name: "错题簿", glyph: "错", tags: ["纠错"], cost: 11 },
  { id: "secondNeedle", name: "第二指针", glyph: "针", tags: ["纠错", "连胜"], cost: 14 },
  { id: "patchKit", name: "记忆补丁", glyph: "补", tags: ["纠错", "道具"], cost: 12 }
];

const ITEMS = {
  lens: { name: "排疑镜片", desc: "排除一个错误选项", usage: "答题时使用：排除一个错误选项。" },
  hourglass: { name: "沙漏", desc: "限时加注增加20秒", usage: "限时加注题中使用：增加20秒。" },
  shield: { name: "护身符", desc: "本题答错不扣生命", usage: "答题时使用：本题答错不扣生命。" },
  magnet: { name: "寻宝磁针", desc: "本题答对额外获得5金币", usage: "答题时使用：答对后多得5金币。" },
  patch: { name: "修复剂", desc: "立即恢复1点生命", usage: "生命未满时使用：恢复1点生命。" }
};

const TAG_LABELS = { "纠错": "答错补救" };
const RELIC_THEMES = {
  "连胜": "streak",
  "点亮领域": "domain",
  "冒险": "risk",
  "商店": "shop",
  "道具": "item",
  "纠错": "error"
};

const EVENTS = [
  { name: "迷雾来袭", text: "雾挡住了下一段路。往里走，下一题奖励更高；答错也会多扣金币。", choices: [
    { label: "进入迷雾：下一题多得6金币；答错再扣3金币", title: "进入迷雾", effects: ["下一题 +6金币", "答错额外 -3金币"], effect: s => { s.flags.eventBonus = 6; s.flags.eventRisk = 3; } },
    { label: "绕开迷雾：获得2金币", title: "绕开迷雾", effects: ["立即 +2金币"], effect: s => s.coins += 2 }
  ]},
  { name: "知识之泉", text: "泉水还剩一点力量。你想恢复生命，还是带走两件道具？", choices: [
    { label: "恢复1点生命", title: "喝一口泉水", effects: ["生命 +1"], effect: s => s.life = Math.min(4, s.life + 1) },
    { label: "获得排疑镜片和沙漏", title: "装走泉水", effects: ["排疑镜片 ×1", "沙漏 ×1"], effect: s => { addItem("lens"); addItem("hourglass"); } }
  ]},
  { name: "过载试验", text: "工程师正在测试奇物增幅器。参加试验会受伤，但能获得一件奇物。", choices: [
    { label: "参加试验：失去1生命，获得一次奇物三选一", title: "参加试验", effects: ["生命 -1", "奇物三选一"], effect: s => { s.life--; setTimeout(() => offerRelics(), 120); } },
    { label: "拒绝试验：获得3金币", title: "拒绝试验", effects: ["立即 +3金币"], effect: s => s.coins += 3 }
  ]},
  { name: "错误回声", text: "一本旧错题簿从书架上掉了下来。现在复习，下一题答对时可以恢复生命。", choices: [
    { label: "重新复习：下一题答对时恢复1点生命", title: "重新复习", effects: ["下一题答对：生命 +1"], effect: s => s.flags.eventHealOnCorrect = true },
    { label: "先放一边：熄灭所有领域，获得6金币", title: "先放一边", effects: ["所有领域熄灭", "立即 +6金币"], effect: s => { s.chain = []; s.coins += 6; } }
  ]},
  { name: "无人商柜", text: "商柜还在运转。价格牌掉了，但投币口看起来没坏。", choices: [
    { label: "支付5金币：随机升级一件奇物", title: "投币升级", effects: ["金币 -5", "随机奇物 +1级"], enabled: s => s.coins >= 5 && s.relics.some(r => r.level < 3), effect: s => { s.coins -= 5; upgradeRandomRelic(); } },
    { label: "取走退币：获得3金币", title: "取走退币", effects: ["立即 +3金币"], effect: s => s.coins += 3 }
  ]},
  { name: "六域回音", text: "已点亮领域正在发出回音。可以把回音换成金币，也可以调整下一组路线。", choices: [
    { label: s => `收集回音：获得${s.chain.length * 2}金币`, title: "收集回音", effects: [s => `立即 +${s.chain.length * 2}金币`], effect: s => s.coins += s.chain.length * 2 },
    { label: "调整路线：下一组路线可免费刷新一次", title: "调整路线", effects: ["下一组路线免费刷新1次"], effect: s => s.flags.freeReroute = true }
  ]}
];

const ENDINGS = [
  { id: "streak", family: "streak", rank: "basic", name: "不熄的演算", hint: "提高最高连胜，并多选连胜类奇物。", desc: "你的连胜让机器保持运转。档案馆终于有了一条稳定的线路。" },
  { id: "chain", family: "chain", rank: "basic", name: "六域合鸣", hint: "尽量点亮更多领域，并多选点亮领域类奇物。", desc: "六个领域依次亮起，散落的知识重新连成一张完整星图。" },
  { id: "risk", family: "risk", rank: "basic", name: "越过红线", hint: "多选冒险难度，并尽量答对。", desc: "你没有绕开警示灯。高风险题带来的收益，成了档案馆的新动力。" },
  { id: "shop", family: "shop", rank: "basic", name: "精密整备", hint: "多在商店购买、升级和替换奇物。", desc: "你把金币花在了最需要的地方，整套装备配合得恰到好处。" },
  { id: "item", family: "item", rank: "basic", name: "工具的语言", hint: "多使用道具，并选择道具类奇物。", desc: "镜片、沙漏和磁针各有用处。你总能在合适的时候拿出合适的工具。" },
  { id: "error", family: "error", rank: "basic", name: "第二次答案", hint: "答错后，用纠错类奇物追回损失。", desc: "你没有跳过错题。每次修正，都让档案馆多恢复一部分。" },
  { id: "streak-overclock", family: "streak", rank: "advanced", name: "过载齿列", hint: "把连胜推到更高，并让连胜奇物频繁生效。", desc: "脉冲齿轮追上了你的答题节奏，整排机械像钟表一样咬合前进。" },
  { id: "streak-quiet", family: "streak", rank: "advanced", name: "静默长线", hint: "保持稳定高连胜，少依赖冒险路线。", desc: "没有夸张的警报，也没有多余的损耗。档案馆被一条安静的长线重新牵起。" },
  { id: "chain-atlas", family: "chain", rank: "advanced", name: "星图校准", hint: "点亮全部领域，并让星图、棱镜或目录参与构筑。", desc: "万象星图完成校准，每个领域都在相邻坐标上留下清晰刻度。" },
  { id: "chain-polyglot", family: "chain", rank: "advanced", name: "六区译者", hint: "尽量覆盖更多题组和领域。", desc: "你没有停在熟悉的展柜前。六区词汇被重新翻译成同一套可读语言。" },
  { id: "risk-storm", family: "risk", rank: "advanced", name: "风暴抄近路", hint: "多答对冒险题，并持有风暴或红线类奇物。", desc: "你沿着警戒线内侧穿过风暴，把最高收益带回了主机。" },
  { id: "risk-insured", family: "risk", rank: "advanced", name: "带保险的跃迁", hint: "选择冒险路线，同时准备护身、保险或生命余量。", desc: "危险没有消失，只是被你逐项编号、分摊、锁进保险丝盒里。" },
  { id: "shop-collector", family: "shop", rank: "advanced", name: "五槽满架", hint: "尽量填满奇物架，并花金币完成整备。", desc: "五个槽位全部亮起，档案馆的工作台终于像一座小型工坊。" },
  { id: "shop-upgrade", family: "shop", rank: "advanced", name: "三阶蓝图", hint: "把已有奇物升到高等级。", desc: "你没有一味追新品，而是把关键部件打磨到能独当一面的三阶状态。" },
  { id: "item-prepared", family: "item", rank: "advanced", name: "应急手册", hint: "多次使用道具，并把道具类奇物带进构筑。", desc: "每一次停顿都有预案。镜片、沙漏、护身符在手册页边排成索引。" },
  { id: "item-magnet", family: "item", rank: "advanced", name: "磁针寻宝", hint: "用道具扩大收益，并保留足够的金币节奏。", desc: "寻宝磁针在纸面上微微发热，指向那些本来会被忽略的奖励。" },
  { id: "error-repair", family: "error", rank: "advanced", name: "错题修复站", hint: "出现多次答错后，依靠纠错奇物或道具把节奏救回来。", desc: "错题没有被划掉，而是被送上修复站，成为下一段线路的补丁材料。" },
  { id: "error-detective", family: "error", rank: "advanced", name: "回声侦探", hint: "答错后继续追踪同类线索，或选择侦探职业。", desc: "错误留下回声。你顺着回声回到现场，找到了第二条证词。" },
  { id: "perfect-archive", family: "chain", rank: "hidden", name: "无误归档", hint: "谜面：十五页纸，没有一处涂改。", desc: "十五道题完整归档，纸面没有涂改痕。燕鸥小姐把这份记录放进最上层抽屉。" },
  { id: "redline-master", family: "risk", rank: "hidden", name: "红线领航员", hint: "谜面：多数路线都越过红线，却仍能平安抵达。", desc: "红线不再是警告，而成了航标。你在高风险航道上留下了一条可复现的路线。" },
  { id: "sixfold-master", family: "chain", rank: "hidden", name: "万象总目录", hint: "谜面：六区全亮，且每区都被真正读过。", desc: "六个领域同时归位，总目录翻开后，每一页都能找到相邻页码。" },
  { id: "toolchain-master", family: "item", rank: "hidden", name: "工具链诗学", hint: "谜面：道具不是补救，而是一整套语法。", desc: "你把道具用成了一门语法。每个小工具都在句子里找到自己的位置。" },
  { id: "relic-symphony", family: "shop", rank: "hidden", name: "奇物交响", hint: "谜面：五件奇物轮流发声，像一支小乐队。", desc: "奇物架像乐谱一样展开，五件装备依次进场，没有一件只是装饰。" },
  { id: "phoenix-revision", family: "error", rank: "hidden", name: "灰烬订正版", hint: "谜面：从错误里回来，并且回来得更稳。", desc: "最初的错误没有定义这局。你从灰烬页撕下订正版，把结尾重新钉牢。" }
];

const ENDING_RANKS = {
  basic: { label: "基础档案", order: 0 },
  advanced: { label: "进阶档案", order: 1 },
  hidden: { label: "隐藏档案", order: 2 }
};

// 18个知识组，每组3个难度变体。原型沿用现有题库的知乎来源，第三题用于验证推理型深渊题方向。
const GROUPS = [
  group("cul-poetry", "culture", "诗歌的节奏与意象", "https://www.zhihu.com/question/12063682745/answer/100929696791", "自己对诗歌的一点见解", [
    q("诗歌组织并表达情感时，最常借助哪一组手段？", ["节奏和意象", "页码和脚注", "音量和纸张", "标题和标点"], 0, "诗歌常借助节奏组织语言，并通过意象承载情感。"),
    q("关于诗歌中的“意象”，哪种理解更准确？", ["对景物的纯客观记录", "主观情感的外化与沟通桥梁", "只负责押韵的词语", "固定不变的象征答案"], 1, "意象并非纯客观记录，它把诗人的情感转化为读者可感知的形象。"),
    q("一首诗反复写“熄灭又亮起的灯”，读者感到希望与犹疑交替。最合理的分析是？", ["灯只说明故事发生在夜晚", "灯的亮灭构成节奏，并成为情感意象", "只要有灯就属于现代诗", "作者在准确记录灯泡故障"], 1, "重复带来节奏，灯的变化又承载情绪；两种手段共同参与表达。"),
  ]),
  group("cul-calligraphy", "culture", "书法的双重属性", "https://www.zhihu.com/question/14467094364/answer/120743115667", "如何在书法和中国画里看古人的衣食住行", [
    q("书法在传统文化中主要兼具哪两种属性？", ["计数与测量", "宗教与法律", "文字记录与视觉艺术", "建筑与雕塑"], 2, "书法既是文字记录，也通过线条、结构与章法体现审美。"),
    q("书法作品上的落款和印章，能帮助研究者了解什么？", ["纸张未来的价格", "作者及作品流传信息", "作品一定创作于宫廷", "文字是否全部原创"], 1, "落款与印章可留下作者、收藏者和流传过程的线索。"),
    q("一件书法作品文字内容可查，但作者与年代有争议。哪项证据最能补充流传线索？", ["展厅灯光颜色", "观众停留时间", "历代收藏印与题跋", "作品装裱宽度"], 2, "收藏印与题跋能形成流传链条，是判断作品经历的重要旁证。"),
  ]),
  group("cul-folklore", "culture", "民俗的传承与变化", "https://www.zhihu.com/question/1940735415242946209/answer/1940775630842098088", "试春仪式背后的原理", [
    q("一种民俗能延续下来，最需要什么？", ["永远禁止改变", "人们持续参与并代际传递", "只记录在一本书里", "由一个人永久保管"], 1, "民俗依靠群体反复参与和代际传递延续。"),
    q("年轻人给传统节日加入新玩法，最能说明什么？", ["传统已经彻底消失", "民俗只能原样复制", "民俗能在传承中变化", "新玩法一定更古老"], 2, "保留核心意义的同时出现新表达，也可以是传承的一部分。"),
    q("某仪式停办多年，后来用短视频和社区活动恢复，但流程有所简化。判断它是否仍属传承，最该看什么？", ["参与者年龄是否完全相同", "核心意义与群体参与是否延续", "道具价格是否上涨", "视频播放量是否最高"], 1, "形式会变化，判断传承更应看核心意义、群体参与和代际连接。"),
  ]),
  group("his-city", "history", "分工、交换与城市", "https://www.zhihu.com/question/1924069022636400943/answer/1930946192830869982", "世界上最早的城市究竟出现在哪里", [
    q("古代聚落最可能在什么地方逐渐形成城市？", ["固定交换物品的集市附近", "完全无人经过的山顶", "不能取得水源的荒地", "禁止分工的村落"], 0, "分工带来交换需求，固定集市可能逐渐聚集人口和服务。"),
    q("一个聚落只有农民和猎人，没有人专门制作陶器，最可能缺少什么？", ["季节变化", "专职工匠", "所有食物", "居住人口"], 1, "缺少专门制陶者，说明手工业分工尚不明显。"),
    q("甲地人口更多但人人自给自足；乙地人口较少，却有固定市场、工匠和管理者。哪项判断更合理？", ["甲一定更接近城市", "乙的分工与交换更接近城市特征", "人口是唯一判断标准", "两地都不可能发展城市"], 1, "城市形成不仅看人口，还看分工、交换与组织程度。"),
  ]),
  group("his-navigation", "history", "远洋定位", "https://www.zhihu.com/question/1996978424938460162/answer/1998537182776952722", "哪些航海科技支持了郑和下西洋", [
    q("古代船只远离海岸后，最需要解决什么问题？", ["让海水变甜", "判断方向与位置", "让风永远顺向", "避免昼夜交替"], 1, "失去陆地地标后，航海者必须判断方向和自身位置。"),
    q("夜间航海观察星星，主要能提供什么帮助？", ["预测所有风暴", "增加船速", "辅助判断方向和位置", "改变海流"], 2, "星体位置可帮助传统航海者判断方向与纬度。"),
    q("一艘古船的罗盘正常，但连续阴天看不到星体。与晴夜相比，哪项能力最可能受影响？", ["判断纬度等位置信息的交叉验证", "船体承载货物", "船员书写日志", "计算淡水总量"], 0, "罗盘仍可指向，但缺少星体观测会减少定位和校验信息。"),
  ]),
  group("his-calendar", "history", "历法规则", "https://www.zhihu.com/question/2036695345158169997/answer/2046869808952750965", "西洋历法真的比中国传统历法更加精准吗", [
    q("人们制定历法，主要是为了什么？", ["改变地球速度", "安排季节、节日和活动", "让每月天数完全相同", "预测个人命运"], 1, "历法把天文周期整理为共同使用的日期系统。"),
    q("不同历法的月份与闰法不同，主要因为？", ["各地时间流速不同", "采用的天文周期和规则不同", "月份没有规律", "每个人自定一年"], 1, "历法可依据太阳、月亮或两者组合，规则因此不同。"),
    q("一种历法按月相定月，却又要让季节长期保持对应。它最可能需要什么机制？", ["定期加入闰月校正", "每天缩短一小时", "取消所有月份", "只观察潮汐"], 0, "月相周期与回归年不能整除，需要闰月等规则协调月份与季节。"),
  ]),
  group("lif-ventilation", "life", "通风与污染物", "https://www.zhihu.com/question/1895934287171264609/answer/1896885545789014846", "通风是除甲醛最快、最有效的方法吗", [
    q("通风降低室内甲醛浓度，主要依靠什么？", ["把污染空气置换到室外", "把甲醛变成水", "让甲醛沉到地面", "永久停止材料释放"], 0, "通风通过空气交换把室内污染物带到室外。"),
    q("装修房检测达标后仍建议常通风，主要因为？", ["检测会制造甲醛", "材料可能继续缓慢释放污染物", "室外永远没有污染", "通风能增加装修材料"], 1, "部分材料会持续释放污染物，封闭时仍可能积累。"),
    q("房间开窗后浓度下降，关窗一夜又回升。最合理的解释是？", ["甲醛会在夜间自行生成", "材料持续释放，封闭时重新积累", "开窗测量必然错误", "温度对释放毫无影响"], 1, "通风降低的是当下浓度，并不必然消除持续释放源。"),
  ]),
  group("lif-freezing", "life", "冷冻保存", "https://www.zhihu.com/question/1950196009071243358/answer/1950516174581371755", "冷冻食品营养价值如何", [
    q("冷冻能延长食物保存时间，最主要的原因是？", ["杀死所有微生物", "让微生物活动显著变慢", "让水分完全消失", "增加天然防腐剂"], 1, "低温抑制微生物活动，但通常不会杀死全部微生物。"),
    q("关于家庭冷冻保存，哪种说法正确？", ["解冻后微生物会重新活跃", "冷冻后可以无限期保存", "反复冻融不影响安全", "冷冻会提高全部营养"], 0, "温度回升后微生物活动恢复，解冻食物应妥善处理。"),
    q("一份食物在室温解冻数小时后又重新冷冻。即使再次冻硬，风险为何可能增加？", ["冷冻会制造新的毒素", "室温阶段微生物可能已经繁殖", "冰晶会消灭全部营养", "低温会让细菌繁殖更快"], 1, "重新冷冻只能再次减慢活动，不能撤销室温阶段已经发生的繁殖。"),
  ]),
  group("lif-label", "life", "营养标签比较", "https://www.zhihu.com/question/1994368364848649367/answer/1995098386894966930", "普通人如何看懂营养标签", [
    q("想比较零食的蛋白质和脂肪，应重点看什么？", ["包装颜色", "配料表和营养成分表", "品牌口号", "袋子大小"], 1, "营养成分表提供含量，配料表显示主要原料及顺序。"),
    q("两种零食包装和每份重量不同，怎样比较更公平？", ["只看总价", "按相同重量比较营养成分", "只看每袋总量", "看广告推荐"], 1, "按每100克或相同重量比较，才能消除份量差异。"),
    q("甲每30克含糖6克，乙每50克含糖8克。若只比较含糖比例，哪种更低？", ["甲，因为6小于8", "乙，因为乙每100克含糖16克", "两者相同", "信息不足，无法换算"], 1, "换算后甲为20%，乙为16%；不能只比较每份的绝对克数。"),
  ]),
  group("log-sampling", "logic", "抽样偏差", "https://www.zhihu.com/question/1946813688804779600/answer/1957013604575482579", "幸存者偏差与抽样偏差有什么区别", [
    q("调查全班喜好却只问篮球队员，结果最可能怎样？", ["偏向篮球队员", "代表全校", "自动变得更准确", "与抽样对象无关"], 0, "样本只覆盖特定群体，难以代表全班。"),
    q("只在地铁站问上班族喜欢什么饮料，为什么结果可能不准？", ["饮料没有种类", "漏掉学生、老人等群体", "地铁站不能说话", "上班族没有偏好"], 1, "抽样地点让某些群体更容易被选中，样本不完整。"),
    q("某应用只向仍在使用它的人调查满意度，然后宣称所有注册用户都满意。主要遗漏了谁？", ["刚注册的新用户", "已经流失的用户", "填写很快的人", "使用深色模式的人"], 1, "已经离开的用户无法进入当前样本，结论可能产生幸存者偏差。"),
  ]),
  group("log-risk", "logic", "基础发生率", "https://www.zhihu.com/question/1973348174195355960/answer/1974419767927514046", "为什么判断小概率事件时常犯直觉错误", [
    q("判断一件事故有多常见，更可靠的是看什么？", ["新闻标题数量", "个人恐惧程度", "长期基础发生率", "故事是否生动"], 2, "容易想起不等于发生更频繁，应查看基础发生率。"),
    q("新闻反复报道一次罕见事故，可能让人怎样？", ["高估这类事故的常见程度", "自动掌握完整统计", "准确预测下次事故", "完全忘记事故"], 0, "生动、重复的信息更容易被想起，从而影响概率直觉。"),
    q("甲风险每年发生1次但被报道100次，乙风险每年发生100次却很少报道。仅凭报道量会犯什么错误？", ["低估甲、高估乙", "高估甲、低估乙", "准确判断两者相等", "证明报道会制造事故"], 1, "报道可得性不能替代实际发生次数和暴露规模。"),
  ]),
  group("log-survivor", "logic", "幸存者偏差", "https://www.zhihu.com/question/2041779605061776317/answer/2044751505404821609", "高考与幸存者偏差", [
    q("想判断创业成功率，应查看哪些案例？", ["只看成功者", "成功与失败者都看", "只看最知名公司", "只看最近一个案例"], 1, "只看成功者会遗漏沉默的失败样本。"),
    q("网上只展示创业成功故事，会带来什么错觉？", ["成功比实际更容易", "失败者一定更多发言", "所有行业成功率相同", "故事数量等于公司数量"], 0, "成功者更可见，会使人低估失败案例。"),
    q("某课程广告展示10名高分学员，却不公布全部1000名学员结果。最关键的缺失信息是？", ["高分学员照片尺寸", "其余学员的成绩分布", "课程名称字数", "老师讲课音量"], 1, "没有总体结果，就无法判断展示案例是否具有代表性。"),
  ]),
  group("nat-density", "nature", "密度与浮沉", "https://www.zhihu.com/question/11742854315/answer/2047983008100230403", "为什么液体可以完全浮在水上面", [
    q("铁块放进水里通常下沉，主要因为？", ["铁块平均密度比水大", "水没有浮力", "铁块没有重量", "铁块会吸走水"], 0, "平均密度大于水的物体通常无法靠部分排水平衡重量。"),
    q("食用油通常浮在水面，主要因为？", ["油会主动向上游", "油密度通常比水小且不易混合", "水没有重量", "油温度永远更高"], 1, "常见食用油密度较小，又与水不易混合，因此形成上层。"),
    q("钢制空心船能浮，而同质量实心钢块下沉。关键差别是什么？", ["船没有受到重力", "船包含空气后整体平均密度降低并能排开更多水", "海水拒绝钢块", "钢板被加工后密度变为零"], 1, "浮沉取决于整体平均密度和排水能力，不只取决于材料本身。"),
  ]),
  group("nat-diversity", "nature", "生态多样性", "https://www.zhihu.com/question/1950902982884451720/answer/1985248251901911446", "什么是生物多样性", [
    q("森林只剩一种树时，遇到针对它的病害会怎样？", ["更容易大面积受损", "病害必然消失", "所有树自动免疫", "生态一定更稳定"], 0, "物种单一会让同一种威胁影响更大范围。"),
    q("物种较多的生态系统面对变化时，通常有什么优势？", ["永远不会受损", "不同物种可能共同维持功能", "食物关系消失", "所有物种变得相同"], 1, "一种物种减少后，其他物种有时可部分补充其生态作用。"),
    q("甲湿地有多种承担相似生态功能的生物，乙湿地只有一种。该物种骤减时，哪项预测更合理？", ["甲更可能保留部分功能", "乙一定恢复更快", "两者必然完全相同", "多样性只影响外观"], 0, "功能冗余能提供缓冲，但不代表系统永远不会受损。"),
  ]),
  group("nat-seasons", "nature", "四季成因", "https://www.zhihu.com/question/2028922749494597605/answer/2032751091473970775", "北半球多久到夏季", [
    q("地球四季形成的主要原因是？", ["月球绕地球", "地轴倾斜与地球公转", "每天距离太阳变化", "地球自转忽快忽慢"], 1, "倾斜地轴配合公转，使各地太阳高度与昼长周期变化。"),
    q("若地轴倾角变为0，季节最可能怎样？", ["变化更剧烈", "几乎不再有明显季节变化", "每天出现四季", "南北半球季节互换"], 1, "没有地轴倾斜，太阳直射点不会按现状南北移动。"),
    q("北半球夏季时地球并非一定离太阳最近。这为何不否定四季成因？", ["季节主要由地轴倾斜造成的光照角度与昼长决定", "太阳距离永远不变", "北半球不受太阳照射", "公转与季节毫无关系"], 0, "决定季节的主要因素是倾角带来的光照分配，而不是近日点距离。"),
  ]),
  group("tec-renewable", "technology", "风光发电波动", "https://www.zhihu.com/question/1921896337772906175/answer/2018731443061278088", "沙漠铺太阳能板会怎样", [
    q("太阳能和风能发电的共同特点是？", ["完全不受环境影响", "发电量随天气和环境波动", "只能在夜间工作", "不能连接电网"], 1, "日照和风速变化会让输出随时间波动。"),
    q("风小且阳光弱时，怎样让供电更稳定？", ["搭配储能或其他电源", "拆除全部线路", "只提高电价", "停止预测天气"], 0, "储能和其他电源可在风光不足时提供补充。"),
    q("某地中午光伏过剩、晚间用电高峰却供电不足。哪种组合最直接缓解错配？", ["增加白天照明", "把部分中午电量储存到晚间释放", "夜间继续依赖太阳直射", "降低所有设备效率"], 1, "储能可以在时间上转移能量，缓解发电与需求不同步。"),
  ]),
  group("tec-binary", "technology", "二进制表示", "https://www.zhihu.com/question/2000163710988220008/answer/2064770870799754480", "计算机如何思考和处理信息", [
    q("计算机内部的信息最终用什么表示？", ["0和1的序列", "彩色颜料", "纸上文字", "空气震动"], 0, "数字系统用两种稳定状态编码各种信息。"),
    q("手机照片存入设备后，在底层会变成什么？", ["一串0和1", "缩小的纸片", "永不变化的光点", "真实颜料"], 0, "图像会被编码为数字数据，再由程序还原显示。"),
    q("文字、声音和图片都能存入同一硬盘，最核心的共同条件是什么？", ["它们看起来必须相同", "都能按规则编码为二进制数据", "都必须先打印", "硬盘能直接理解含义"], 1, "媒介不同的信息都可经过编码转化为统一的二进制表示。"),
  ]),
  group("tec-backup", "technology", "冗余备份", "https://www.zhihu.com/question/23947385/answer/205351107", "工程学的冗余备份模型", [
    q("重要文件准备备份，主要为了什么？", ["让文件永不出错", "主副本损坏时仍有替代", "让内容自动缩短", "取消检查"], 1, "额外副本能降低单点故障造成的损失。"),
    q("两份备份都放在同一台电脑，主要风险是？", ["文件会自动合并", "电脑损坏时可能一起丢失", "电脑一定无法开机", "副本会互相删除"], 1, "共同依赖同一设备，仍然存在单点故障。"),
    q("公司有三个文件副本，却都在同一办公室。哪种事故最能暴露这种备份方案的缺陷？", ["一块键盘损坏", "办公室火灾影响全部设备", "某员工忘记密码", "一份文件名太长"], 1, "副本数量多不等于风险隔离；同一地点仍可能被共同事故影响。"),
  ])
];

function group(id, domain, point, url, sourceTitle, questions) { return { id, domain, point, url, sourceTitle, questions }; }
function q(prompt, options, correct, explanation) { return { prompt, options, correct, explanation }; }

function relicEffect(id, level) {
  const effects = {
    inkLamp: () => `达到3连胜后，每次答对多得${level}金币。`,
    pulseGear: () => `连胜达到5、8或12时，获得${3 * level}金币。`,
    safetyValve: () => `每5题可触发${level}次。答错时，连胜退回最近的3、5或8。`,
    prism: () => `每点亮一个新领域，多得${level}金币。`,
    atlas: () => `点亮第4个领域时，本题金币增加${25 + 25 * level}%。`,
    echoFork: () => `点亮第3个领域时，有${25 * level}%概率获得1个排疑镜片。`,
    redDial: () => `冒险题答对时，多得${2 * level}金币。`,
    stormCore: () => `限时加注答对时，额外增加${level}连胜。`,
    insurance: () => `每5题可触发${level}次。冒险题答错时，不额外扣金币。`,
    coinMold: () => `进入商店时，获得${2 * level}金币。`,
    catalog: () => `刷新商店后，下一件奇物便宜${2 * level}金币。`,
    salvager: () => { const value = 2 + 2 * level; return `替换等级1/2/3的奇物时，返还${value}/${value * 2}/${value * 3}金币。`; },
    lensCase: () => `进入商店时，获得${level}个排疑镜片。`,
    sandClock: () => `本题使用过道具且答对时，多得${2 * level}金币。`,
    converter: () => `进入商店时，每个未使用的道具换成${level}金币。`,
    errorBook: () => `每5题可触发${level}次。答错后，下一题答对恢复1点生命。`,
    secondNeedle: () => `连胜为0时答对，额外增加${level}连胜。`,
    patchKit: () => `答错时，有${30 * level}%概率获得1个随机道具。`
  };
  return effects[id] ? effects[id]() : "";
}

function relicTriggerCount() {
  return RELICS.reduce((total, relic) => total + (state.stats.triggers[relic.id] || 0), 0);
}

function eventChoiceLabel(choice) {
  return typeof choice.label === "function" ? choice.label(state) : choice.label;
}

const EVENT_VISUALS = {
  "迷雾来袭": { glyph: "雾", color: "#687f87" },
  "知识之泉": { glyph: "泉", color: "#307a72" },
  "过载试验": { glyph: "验", color: "#d65f32" },
  "错误回声": { glyph: "错", color: "#8d5e77" },
  "无人商柜": { glyph: "柜", color: "#99703f" },
  "六域回音": { glyph: "响", color: "#5e6090" }
};

function eventChoiceCard(choice, index, preview = false) {
  const label = eventChoiceLabel(choice), parts = label.split("："), fallbackTitle = parts.shift(), detail = parts.join("：");
  const enabled = !choice.enabled || choice.enabled(state);
  const effectTexts = choice.effects ? choice.effects.map(effect => typeof effect === "function" ? effect(state) : effect) : detail ? detail.split("；") : [];
  const effects = effectTexts.map(text => {
    const isCost = /失去|扣|熄灭|答错|支付|-\d/.test(text);
    return `<span class="event-effect ${isCost ? "cost" : "gain"}">${text}</span>`;
  }).join("");
  const tag = preview ? "div" : "button";
  return `<${tag} class="event-choice${preview ? " event-choice-preview" : ""}"${preview ? "" : ` data-choice="${index}"`} style="--choice-color:${index === 0 ? "var(--orange)" : "var(--copper)"}" ${enabled || preview ? "" : "disabled"}>
    <span class="event-choice-index">0${index + 1}</span><h3>${choice.title || fallbackTitle}</h3>${effects ? `<div class="event-effects">${effects}</div>` : ""}<span class="event-choice-action">${enabled || preview ? "选择此项 →" : "当前条件不足"}</span></${tag}>`;
}

function rollShopStock() {
  return sample(RELICS.filter(r => !state.relics.some(o => o.id === r.id && o.level >= 3)), 3).map(r => r.id);
}

function refreshShopStock() {
  state.shopStock = rollShopStock();
  if (hasRelic("catalog")) {
    state.flags.catalogDiscount = 2 * relicLevel("catalog");
    fireRelic("catalog");
  }
}

function currentShopPrice(relic) {
  return Math.max(0, relic.cost - (state.flags.catalogDiscount || 0));
}

const DEFAULT_STATE = () => ({
  phase: "welcome", role: null, node: 0, life: 4, coins: 5, streak: 0, maxStreak: 0, chain: [],
  answered: 0, correct: 0, riskWins: 0, bridgeTriggers: 0, hintsUsed: 0, relics: [],
  items: { lens: 1, hourglass: 1, shield: 0, magnet: 0, patch: 0 }, usedGroups: [], routes: [], shopStock: [],
  currentRoute: null, currentQuestion: null, answeredCurrent: false, selectedRole: null,
  flags: { shield: false, magnet: false, usedItem: false, eventBonus: 0, eventRisk: 0, eventHealOnCorrect: false, healCharges: 0, lastWrongDomain: null, freeReroute: false, rerouteUsed: false, firstRiskDone: false, valveUses: 0, insuranceUses: 0, errorBookUses: 0, catalogDiscount: 0 },
  stats: { difficulty: { safe: 0, challenge: 0, risk: 0 }, triggers: {}, shopSpent: 0, itemUses: 0, wrongs: 0, maxLit: 0 }, log: []
});

let state = DEFAULT_STATE();
let timerId = null;
let timeLeft = 0;
let pendingAfterModal = null;
let helpReturn = null;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function init() {
  bindStaticEvents();
  if (localStorage.getItem("archive-guide-collapsed") === "1") { $("#guideDock").classList.add("collapsed"); $("#guideToggle").textContent = "+"; $("#guideToggle").setAttribute("aria-label", "展开燕鸥小姐的话"); $("#guideToggle").setAttribute("aria-expanded", "false"); }
  const restored = restoreActiveRun();
  renderJourney(); renderSidebars();
  if (restored) {
    $("#abandonRun").hidden = false;
    if (state.phase === "question" && state.currentQuestion) renderQuestion();
    else if (state.phase === "shop") renderShop();
    else renderRouteChoice();
    toast("已恢复上次未完成的游戏");
  } else renderWelcome();
  updateCollectionCount();
}

function bindStaticEvents() {
  $("#openHelp").onclick = showHelp;
  $("#relicHelp").onclick = () => showDetailedHelp("relic");
  $("#openCollection").onclick = showCollection;
  $("#exportSave").onclick = exportSave;
  $("#importSave").onchange = importSave;
  $("#clearLog").onclick = () => { state.log = []; renderLog(); };
  $("#guideToggle").onclick = toggleGuide;
  $("#abandonRun").onclick = () => confirm("确定放弃本局？这次游戏不会收入万象档案。") && resetRun();
  $("#modal").addEventListener("click", e => { if (e.target === $("#modal")) dismissModal(); });
  $("#modal").addEventListener("cancel", e => { e.preventDefault(); dismissModal(); });
}

function renderWelcome() {
  state.phase = "welcome";
  $("#abandonRun").hidden = true;
  $("#stageBody").innerHTML = `<div class="welcome">
    <div class="welcome-intro"><h2>先选一个职业</h2><button class="welcome-help" id="welcomeHelp"><span>?</span>玩法说明</button></div>
    <div class="role-grid">${ROLES.map(r => `<button class="role-card" data-role="${r.id}" aria-pressed="false"><b>${r.name}</b><p>${r.brief.join("<br>")}</p><span class="role-art liu-sprite role-${r.id}" aria-hidden="true"></span></button>`).join("")}</div>
    <button class="primary-button" id="startRun" disabled>选择一个职业后开始</button>
  </div>`;
  $("#welcomeHelp").onclick = showHelp;
  $$(".role-card").forEach(card => card.onclick = () => {
    state.selectedRole = card.dataset.role;
    $$(".role-card").forEach(c => { const selected = c === card; c.classList.toggle("selected", selected); c.setAttribute("aria-pressed", String(selected)); });
    $("#startRun").disabled = false; $("#startRun").textContent = `以${getRole(state.selectedRole).name}开始`;
  });
  $("#startRun").onclick = startRun;
  setGuide("welcome", "先选一个职业。每个职业都有一项不同的能力。");
}

function startRun() {
  const roleId = state.selectedRole;
  state = DEFAULT_STATE(); state.role = roleId; state.selectedRole = roleId; state.phase = "route";
  $("#abandonRun").hidden = false;
  log(`探索者「${getRole(roleId).name}」进入档案馆。`);
  generateRoutes(); renderAll();
}

function generateRoutes() {
  state.phase = "route"; state.currentQuestion = null; state.answeredCurrent = false;
  const available = GROUPS.filter(g => !state.usedGroups.includes(g.id));
  const pool = available.length >= 3 ? available : GROUPS;
  const picked = sample(pool, 3);
  const diffs = shuffle(["safe", "challenge", "risk"]);
  state.routes = picked.map((g, i) => ({ groupId: g.id, difficulty: diffs[i], timed: false }));
  renderRouteChoice(); renderAll();
}

function renderRouteChoice() {
  const area = Math.floor(state.node / 5) + 1;
  const hasEventRefresh = Boolean(state.flags.freeReroute);
  const hasEngineerRefresh = state.role === "mage" && !state.flags.rerouteUsed;
  $("#stageBody").innerHTML = `<div>
    <div class="choice-header"><div><span class="eyebrow">第 ${area} / 3 阶段</span><h2 class="section-title">选择路线</h2><p>答对新的领域会点亮它。难度越高，奖励和答错损失也越高。</p></div>
    ${hasEventRefresh || hasEngineerRefresh ? `<button class="inline-button" id="reroute">免费刷新三条路线（1次）</button>` : ""}</div>
    <div class="route-grid">${state.routes.map((r, i) => routeCard(r, i)).join("")}</div>
    ${timedWagerMarkup()}
  </div>`;
  $$(".route-card").forEach(card => card.onclick = () => chooseRoute(Number(card.dataset.index), $("#timedWager").checked));
  if ($("#reroute")) $("#reroute").onclick = () => { if (hasEventRefresh) state.flags.freeReroute = false; else state.flags.rerouteUsed = true; generateRoutes(); toast("已刷新三条路线"); };
  setGuide("route", "先看领域，再看难度。冒险题奖励最高，答错会额外扣金币。");
}

function routeCard(route, index, preview = false) {
  const g = GROUPS.find(x => x.id === route.groupId), d = DIFFICULTIES[route.difficulty], domain = DOMAINS[g.domain];
  const bonus = preview ? 0 : state.flags.eventBonus || 0, riskLoss = preview ? 3 : 3 + (state.flags.eventRisk || 0), tag = preview ? "div" : "button";
  return `<${tag} class="route-card${preview ? " route-card-preview" : ""}" ${preview ? "aria-hidden=\"true\"" : `data-index="${index}"`} style="--route-color:${d.color}">
    <span class="route-index">路线 ${String(index + 1).padStart(2, "0")}</span><h3>${domain.name}</h3><span class="route-topic"><small>本题主题</small>${g.point}</span>
    <span class="difficulty-badge">${d.name}</span><span class="odds">${d.odds}</span>
    <div class="route-reward"><b>答对：</b>${d.reward + bonus}金币，连胜＋1<br><b>答错：</b>${d.lifeLoss ? "生命－1，" : "不扣生命，"}连胜清零，所有已点亮领域熄灭${route.difficulty === "risk" ? `，再扣${riskLoss}金币` : ""}</div>
  </${tag}>`;
}

function timedWagerMarkup(preview = false) {
  return `<label class="timed-wager${preview ? " timed-wager-preview" : ""}">
    <input ${preview ? "" : 'id="timedWager"'} type="checkbox" ${preview ? "disabled" : ""}>
    <span><b>本题开启限时加注</b><small>45秒内答对，多得4金币；超时按答错处理。</small></span>
  </label>`;
}

function chooseRoute(index, timed) {
  const route = state.routes[index], g = GROUPS.find(x => x.id === route.groupId), d = DIFFICULTIES[route.difficulty];
  state.currentRoute = { ...route, timed }; state.currentQuestion = g.questions[d.level]; state.usedGroups.push(g.id);
  state.stats.difficulty[route.difficulty]++;
  if (state.role === "detective" && state.flags.lastWrongDomain === g.domain) state.flags.autoEliminate = true;
  state.phase = "question"; renderQuestion(); renderAll();
}

function renderQuestion() {
  const r = state.currentRoute, g = GROUPS.find(x => x.id === r.groupId), d = DIFFICULTIES[r.difficulty], qn = state.currentQuestion, riskLoss = 3 + (state.flags.eventRisk || 0);
  $("#stageBody").innerHTML = questionCardMarkup(g, d, qn, r.timed);
  $$(".option").forEach(btn => btn.onclick = () => answerQuestion(Number(btn.dataset.option)));
  if (state.flags.autoEliminate) { eliminateWrong(false); state.flags.autoEliminate = false; }
  if (r.timed) startTimer(45);
  setGuide(r.difficulty === "risk" ? "risk" : "explain", r.difficulty === "risk" ? `这是一道冒险题。答错会扣1点生命和${riskLoss}金币。` : "可以慢慢想。需要时，右边的道具可以帮你。" );
}

function questionCardMarkup(groupData, difficulty, question, timed = false, preview = false) {
  const optionTag = preview ? "span" : "button";
  return `<div class="question-card${preview ? " question-card-preview" : ""}">
    <div class="question-meta"><span>${DOMAINS[groupData.domain].name}</span><span>${difficulty.name}</span><span>${groupData.point}</span>${timed ? `<b class="timer"${preview ? "" : ` id="timer"`}>00:45</b>` : ""}</div>
    <h2>${question.prompt}</h2><div class="option-list">${question.options.map((option, index) => `<${optionTag} class="option${preview && index === question.correct ? " correct" : ""}"${preview ? "" : ` data-option="${index}"`}><b>${"ABCD"[index]}</b><span>${option}</span></${optionTag}>`).join("")}</div>
    <div class="question-actions"><span>${timed ? "已开启限时加注，超时算答错" : "本题不限时"}</span>${preview ? "" : `<span id="itemFeedback"></span>`}</div>
    ${preview ? "" : `<div id="resolutionSlot"></div>`}
  </div>`;
}

function answerQuestion(option, timedOut = false) {
  if (state.answeredCurrent) return;
  state.answeredCurrent = true; stopTimer();
  const r = state.currentRoute, g = GROUPS.find(x => x.id === r.groupId), qn = state.currentQuestion, correct = !timedOut && option === qn.correct;
  state.answered++;
  $$(".option").forEach((btn, i) => { btn.disabled = true; if (i === qn.correct) btn.classList.add("correct"); if (!correct && i === option) btn.classList.add("wrong"); });
  if (correct) resolveCorrect(g, r); else resolveWrong(g, r, timedOut);
  setGuide(correct ? "correct" : "wrong", correct ? "答对了。连胜保住，金币也到账。" : "答错了。看看解析，下一题再追回来。" );
  const slot = $("#resolutionSlot");
  slot.innerHTML = `<div class="resolution ${correct ? "" : "wrong"}"><h3>${correct ? "回答正确" : timedOut ? "时间到了，本题算答错" : "回答错误"}</h3><p>${qn.explanation}</p>
    <div class="resolution-footer"><a class="source-link" href="${g.url}" target="_blank" rel="noopener noreferrer">查看知乎讨论 ↗</a><button class="primary-button" id="continue" style="margin:0">继续前进</button></div></div>`;
  $("#continue").onclick = advanceNode;
  renderAll();
}

function resolveCorrect(groupData, route) {
  const d = DIFFICULTIES[route.difficulty]; let reward = d.reward + (route.timed ? 4 : 0) + state.flags.eventBonus;
  if (state.flags.magnet) { reward += 5; state.flags.magnet = false; }
  state.correct++; const previousStreak = state.streak; state.streak++;
  if (route.timed && hasRelic("stormCore")) { state.streak += relicLevel("stormCore"); fireRelic("stormCore"); }
  if (previousStreak === 0 && hasRelic("secondNeedle")) { state.streak += relicLevel("secondNeedle"); fireRelic("secondNeedle"); }
  state.maxStreak = Math.max(state.maxStreak, state.streak);
  if (route.difficulty === "risk") { state.riskWins++; reward += 2 * relicLevel("redDial"); fireRelic("redDial"); }
  if (state.role === "adventurer" && route.difficulty === "risk" && !state.flags.travelerRewardClaimed) { state.flags.travelerRewardClaimed = true; state.flags.travelerRewardPending = true; }
  if (hasRelic("inkLamp") && state.streak >= 3) { reward += relicLevel("inkLamp"); fireRelic("inkLamp"); }
  if (hasRelic("pulseGear") && [5, 8, 12].includes(state.streak)) { reward += 3 * relicLevel("pulseGear"); fireRelic("pulseGear"); }
  const newDomain = !state.chain.includes(groupData.domain);
  if (newDomain) {
    state.chain.push(groupData.domain);
    state.stats.maxLit = Math.max(state.stats.maxLit || 0, state.chain.length);
    if (state.role === "scholar") reward++;
    if (hasRelic("prism")) { reward += relicLevel("prism"); fireRelic("prism"); }
    if (state.chain.length === 4 && hasRelic("atlas")) { state.flags.atlasBonus = true; fireRelic("atlas"); }
    if (state.chain.length === 3 && hasRelic("echoFork") && Math.random() < .25 * relicLevel("echoFork")) { addItem("lens"); fireRelic("echoFork"); }
    if (state.role === "poet" && state.chain.length === 6 && !state.flags.poetGift) { addItem(randomItem()); state.flags.poetGift = true; }
  }
  if (state.flags.atlasBonus) { reward = Math.ceil(reward * (1.25 + .25 * relicLevel("atlas"))); state.flags.atlasBonus = false; }
  if (state.flags.eventHealOnCorrect && state.life < 4) { state.life++; state.flags.eventHealOnCorrect = false; }
  else if ((state.flags.healCharges || 0) > 0 && state.life < 4) { state.life++; state.flags.healCharges--; fireRelic("errorBook"); }
  if (state.flags.usedItem && hasRelic("sandClock")) { reward += 2 * relicLevel("sandClock"); fireRelic("sandClock"); }
  state.coins += reward; state.flags.eventBonus = 0; state.flags.eventRisk = 0; state.flags.usedItem = false; state.flags.shield = false;
  log(`答对「${groupData.point}」，获得${reward}金币，连胜${state.streak}。`);
}

function resolveWrong(groupData, route, timedOut) {
  state.stats.wrongs++; let lifeLoss = DIFFICULTIES[route.difficulty].lifeLoss;
  if (state.flags.shield) { lifeLoss = 0; state.flags.shield = false; log("护身符吸收了生命损失。"); }
  if (hasRelic("safetyValve") && (state.flags.valveUses || 0) < relicLevel("safetyValve")) { state.streak = state.streak >= 8 ? 8 : state.streak >= 5 ? 5 : state.streak >= 3 ? 3 : 0; state.flags.valveUses = (state.flags.valveUses || 0) + 1; fireRelic("safetyValve"); }
  else state.streak = 0;
  state.chain = []; state.life -= lifeLoss; state.flags.lastWrongDomain = groupData.domain;
  const insuranceReady = hasRelic("insurance") && (state.flags.insuranceUses || 0) < relicLevel("insurance");
  if (route.difficulty === "risk" && insuranceReady) { state.flags.insuranceUses = (state.flags.insuranceUses || 0) + 1; fireRelic("insurance"); }
  else if (route.difficulty === "risk") { const loss = Math.min(state.coins, 3 + state.flags.eventRisk); state.coins -= loss; log(`冒险题答错，额外扣除${loss}金币。`); }
  if (hasRelic("errorBook") && (state.flags.errorBookUses || 0) < relicLevel("errorBook")) { state.flags.healCharges = (state.flags.healCharges || 0) + 1; state.flags.errorBookUses = (state.flags.errorBookUses || 0) + 1; }
  if (hasRelic("patchKit") && Math.random() < .3 * relicLevel("patchKit")) { addItem(randomItem()); fireRelic("patchKit"); }
  state.flags.eventBonus = 0; state.flags.eventRisk = 0; state.flags.usedItem = false;
  log(`${timedOut ? "限时加注超时" : "答错"}「${groupData.point}」，生命${lifeLoss ? `－${lifeLoss}` : "未损失"}。`);
}

function advanceNode() {
  if (state.flags.travelerRewardPending) { state.flags.travelerRewardPending = false; pendingAfterModal = advanceNode; offerItemReward(); return; }
  state.node++;
  if (state.life <= 0) return finishRun(false);
  if (state.node >= 15) return finishRun(true);
  const after = () => {
    if (state.node % 5 === 0) return openShop();
    if ([4, 9, 13].includes(state.node)) return showEvent();
    generateRoutes();
  };
  if ([3, 8, 12].includes(state.node)) { pendingAfterModal = after; offerRelics(); } else after();
}

function offerRelics() {
  const ownedTags = state.relics.flatMap(r => relicById(r.id).tags);
  const unowned = RELICS.filter(r => !state.relics.some(o => o.id === r.id && o.level >= 3));
  const synergy = unowned.filter(r => r.tags.some(t => ownedTags.includes(t)));
  const bridge = unowned.filter(r => r.tags.length > 1);
  let offers = uniqueBy([random(synergy), random(bridge), random(unowned)].filter(Boolean), "id");
  while (offers.length < 3) { const x = random(unowned); if (x && !offers.some(o => o.id === x.id)) offers.push(x); }
  openModal(`<div class="modal-head"><div><span class="eyebrow">奇物获得后，本局会一直生效</span><h2>选择一件奇物</h2></div></div>
    <div class="pick-grid">${offers.map(r => pickCard(r)).join("")}</div><button class="inline-button" id="skipRelic">放弃并获得5金币</button>`);
  $$(".pick-card").forEach(c => c.onclick = () => acquireRelic(c.dataset.id));
  $("#skipRelic").onclick = () => { state.coins += 5; closeModal(); continuePending(); };
  setGuide("relic", "奇物获得后，本局会一直生效。最多装备五件。" );
}

function offerItemReward() {
  const offers = sample(Object.keys(ITEMS), 3);
  openModal(`<div class="modal-head"><div><span class="eyebrow">旅行者奖励</span><h2>选择一个道具</h2></div></div>
    <div class="pick-grid">${offers.map(id => `<button class="pick-card" data-item-reward="${id}"><span class="glyph">${ITEMS[id].name[0]}</span><h3>${ITEMS[id].name}</h3><p>${ITEMS[id].desc}</p></button>`).join("")}</div>`);
  $$("[data-item-reward]").forEach(btn => btn.onclick = () => { const id = btn.dataset.itemReward; addItem(id); log(`旅行者从冒险路线带回「${ITEMS[id].name}」。`); closeModal(); continuePending(); });
  setGuide("relic", "这是旅行者的额外奖励。三件道具选一件。" );
}

function relicThemeClass(relic) {
  return `relic-theme-${RELIC_THEMES[relic.tags[0]] || "general"}`;
}

function relicArtMarkup(relic, variant = "card") {
  return `<span class="relic-art relic-art-${variant}"><img src="assets/relics/${relic.id}.png" alt="" loading="lazy"></span>`;
}

function relicTagsMarkup(relic) {
  return `<span class="tags">${relic.tags.map(tag => `<span class="relic-tag relic-tag-${RELIC_THEMES[tag] || "general"}">${TAG_LABELS[tag] || tag}</span>`).join("")}</span>`;
}

function relicLevelMarkup(level) {
  return `<span class="relic-level-dots" aria-label="等级${level}">${[1,2,3].map(value => `<i class="${value <= level ? "on" : ""}"></i>`).join("")}</span>`;
}

function pickCard(r, price = null, mode = "offer") {
  const preview = mode === "preview", owned = preview ? null : state.relics.find(x => x.id === r.id);
  const effect = owned && mode === "offer"
    ? `<div class="effect-compare"><p><b>当前</b>${relicEffect(r.id, owned.level)}</p><p class="next-effect"><b>升级后</b>${relicEffect(r.id, owned.level + 1)}</p></div>`
    : `<div class="effect-compare"><p><b>${owned ? "当前" : "获得后"}</b>${relicEffect(r.id, owned ? owned.level : 1)}</p></div>`;
  const tag = preview ? "div" : "button";
  const action = mode === "replace" ? "拆解这件" : price !== null ? (owned ? "购买升级" : "购买奇物") : "选择这件";
  const unaffordable = !preview && price !== null && state.coins < price;
  const level = owned ? owned.level : 1;
  return `<${tag} class="pick-card relic-card ${relicThemeClass(r)}${preview ? " pick-card-preview" : ""}${unaffordable ? " unavailable" : ""}"${preview ? "" : ` data-id="${r.id}"${unaffordable ? " disabled" : ""}`}>
    <span class="relic-card-status">${owned ? `已拥有 · ${level}级` : "新奇物"}</span>
    ${relicArtMarkup(r)}
    <span class="relic-card-copy"><span class="relic-card-title"><h3>${r.name}</h3>${relicLevelMarkup(level)}</span>${relicTagsMarkup(r)}${effect}</span>
    <span class="relic-card-footer">${price !== null ? `<strong class="relic-price"><b>${price}</b><small>金币</small></strong>` : `<span class="relic-auto">满足条件后自动生效</span>`}<span class="relic-card-action">${unaffordable ? "金币不足" : action} →</span></span>
  </${tag}>`;
}

function acquireRelic(id, fromShop = false, price = 0) {
  const owned = state.relics.find(r => r.id === id);
  if (fromShop && state.coins < price) return toast("金币不足");
  const discountUsed = fromShop ? (state.flags.catalogDiscount || 0) : 0;
  if (fromShop) { state.coins -= price; state.stats.shopSpent += price; state.flags.catalogDiscount = 0; }
  if (owned) { owned.level = Math.min(3, owned.level + 1); log(`${relicById(id).name}升级至${owned.level}级。`); closeModal(); continuePending(); return; }
  if (state.relics.length >= 5) return chooseReplacement(id, fromShop ? price : 0, discountUsed);
  state.relics.push({ id, level: 1 }); log(`获得奇物「${relicById(id).name}」。`); closeModal(); continuePending();
}

function chooseReplacement(newId, spent = 0, discountUsed = 0) {
  $("#modalContent").innerHTML = `<div class="modal-head"><div><span class="eyebrow">奇物架已满</span><h2>替换一件奇物</h2></div></div><p>选择要拆解的奇物，或放弃新奇物。</p>
    <div class="pick-grid">${state.relics.map(o => pickCard(relicById(o.id), null, "replace")).join("")}</div><button class="inline-button" id="cancelReplace">放弃新奇物</button>`;
  $$(".pick-card").forEach(c => c.onclick = () => {
    const old = state.relics.find(x => x.id === c.dataset.id), salvage = hasRelic("salvager") ? (2 + 2 * relicLevel("salvager")) * old.level : 0;
    state.relics = state.relics.filter(x => x.id !== c.dataset.id); state.relics.push({ id: newId, level: 1 }); state.coins += salvage;
    if (salvage) fireRelic("salvager");
    log(`以「${relicById(newId).name}」替换「${relicById(old.id).name}」。`); closeModal(); continuePending();
  });
  $("#cancelReplace").onclick = () => { state.coins += spent; state.flags.catalogDiscount = discountUsed; closeModal(); continuePending(); };
}

function openShop() {
  state.phase = "shop"; state.flags.valveUses = 0; state.flags.insuranceUses = 0; state.flags.errorBookUses = 0; state.shopStock = rollShopStock();
  if (hasRelic("coinMold")) { state.coins += 2 * relicLevel("coinMold"); fireRelic("coinMold"); }
  if (hasRelic("converter")) { state.coins += Object.values(state.items).reduce((a,b) => a+b,0) * relicLevel("converter"); fireRelic("converter"); }
  if (hasRelic("lensCase")) { for (let i=0;i<relicLevel("lensCase");i++) addItem("lens"); fireRelic("lensCase"); }
  renderShop(); renderAll();
  setGuide("relic", "金币可以购买或升级奇物，也能恢复生命。" );
}

function renderShop() {
  state.shopStock = (state.shopStock || []).filter(id => !state.relics.some(o => o.id === id && o.level >= 3));
  const available = RELICS.filter(r => !state.relics.some(o => o.id === r.id && o.level >= 3) && !state.shopStock.includes(r.id));
  while (state.shopStock.length < 3 && available.length) state.shopStock.push(available.splice(Math.floor(Math.random() * available.length), 1)[0].id);
  const stock = state.shopStock.map(relicById).filter(Boolean), discount = state.flags.catalogDiscount || 0;
  $("#stageBody").innerHTML = `<div class="shop-scene"><div class="choice-header shop-header"><div><span class="eyebrow">档案馆整备台</span><h2 class="section-title">挑选与调整奇物</h2><p>购买新品或升级已有奇物。货架与服务不会消耗答题次数。</p></div><div class="choice-header-actions"><button class="context-help" id="shopHelp" type="button">商店规则&nbsp;?</button><strong class="shop-balance"><small>当前持有</small><b>${state.coins}</b><span>金币</span></strong></div></div>
    ${discount ? `<p class="shop-discount">折页目录生效：下一件奇物便宜${discount}金币</p>` : ""}
    ${shopGridMarkup(stock)}</div>`;
  $$(".pick-card").forEach(c => c.onclick = () => { const r = relicById(c.dataset.id), price = currentShopPrice(r); if (state.coins < price) return toast("金币不足"); pendingAfterModal = renderShop; acquireRelic(r.id, true, price); });
  $("#heal").onclick = () => { const cost = state.flags.healedShop ? 9 : 6; if (state.life >= 4) return toast("生命已满"); if (state.coins < cost) return toast("金币不足"); state.coins -= cost; state.life++; state.flags.healedShop = true; renderShop(); renderAll(); };
  $("#refreshShop").onclick = () => { let cost = state.role === "merchant" && !state.flags.merchantRefresh ? 0 : 4; if (state.coins < cost) return toast("金币不足"); state.coins -= cost; state.flags.merchantRefresh = true; refreshShopStock(); renderShop(); renderAll(); };
  $("#shopHelp").onclick = () => showDetailedHelp("shop");
  $("#leaveShop").onclick = () => { state.flags.healedShop = false; generateRoutes(); };
}

function shopGridMarkup(stock, preview = false) {
  const healCost = preview ? 6 : state.flags.healedShop ? 9 : 6;
  const refreshCost = preview ? 4 : state.role === "merchant" && !state.flags.merchantRefresh ? 0 : 4;
  const serviceTag = preview ? "span" : "button";
  const healDisabled = !preview && (state.life >= 4 || state.coins < healCost);
  const refreshDisabled = !preview && state.coins < refreshCost;
  return `<div class="shop-grid${preview ? " shop-grid-preview" : ""}"><section class="shop-counter"><div class="shop-section-head"><div><span class="eyebrow">本次货架</span><strong>奇物藏品</strong></div><small>同名奇物会直接升级</small></div><div class="shop-stock">${stock.map(relic => pickCard(relic, preview ? relic.cost : currentShopPrice(relic), preview ? "preview" : "offer")).join("")}</div></section><aside class="shop-service">
    <div class="shop-section-head"><div><span class="eyebrow">整备服务</span><strong>继续前的准备</strong></div></div>
    <div class="shop-service-list"><${serviceTag} class="shop-service-button"${preview ? "" : ` id="heal"${healDisabled ? " disabled" : ""}`}><span>恢复生命</span><small>恢复1点 · ${healCost}金币</small></${serviceTag}>
    <${serviceTag} class="shop-service-button"${preview ? "" : ` id="refreshShop"${refreshDisabled ? " disabled" : ""}`}><span>更换货架</span><small>刷新3件 · ${refreshCost}金币</small></${serviceTag}></div>
    <${serviceTag} class="primary-button shop-leave"${preview ? "" : ` id="leaveShop"`}>离开商店</${serviceTag}></aside></div>`;
}

function showEvent(selectedEvent = null) {
  const event = selectedEvent || random(EVENTS);
  openModal(eventPanelMarkup(event));
  $$("[data-choice]").forEach(btn => btn.onclick = () => { event.choices[Number(btn.dataset.choice)].effect(state); log(`事件「${event.name}」：${btn.textContent.trim()}`); closeModal(); renderAll(); if (state.life <= 0) finishRun(false); else generateRoutes(); });
  $("#eventHelp").onclick = () => showDetailedHelp("event", () => showEvent(event));
  setGuide("risk", "这里没有正确选项。看清收益和损失，再做决定。" );
}

function eventPanelMarkup(event, preview = false) {
  const visual = EVENT_VISUALS[event.name] || { glyph: "档", color: "#307a72" };
  return `<div class="event-modal${preview ? " event-modal-preview" : ""}" style="--event-color:${visual.color}">
    <div class="event-header"><div class="event-copy"><div class="event-label"><span class="eyebrow">随机事件</span>${preview ? "" : `<button class="context-help" id="eventHelp" type="button">事件规则&nbsp;?</button>`}</div><h2>${event.name}</h2><p>${event.text}</p></div><div class="event-visual"><span class="event-glyph">${visual.glyph}</span><span class="event-tern tern-sprite tern-risk" aria-hidden="true"></span><small class="event-file-no">EVENT / ${String(EVENTS.indexOf(event) + 1).padStart(2,"0")}</small></div></div>
    <div class="event-grid">${event.choices.map((choice, index) => eventChoiceCard(choice, index, preview)).join("")}</div><div class="event-footer"><span>两项都会立即生效</span><span>先看收益，也别漏掉代价</span></div></div>`;
}

function useItem(id) {
  if (!state.items[id]) return;
  if (id === "patch") { if (state.life >= 4) return toast("生命已满"); state.life++; }
  else if (state.phase !== "question" || state.answeredCurrent) return toast("该道具只能在答题时使用");
  else if (id === "lens") { if (!eliminateWrong()) return; state.hintsUsed++; }
  else if (id === "hourglass") { if (!state.currentRoute.timed) return toast("沙漏只能用于限时加注题"); timeLeft += 20; }
  else if (id === "shield") state.flags.shield = true;
  else if (id === "magnet") state.flags.magnet = true;
  state.items[id]--; state.flags.usedItem = true; state.stats.itemUses++; log(`使用道具「${ITEMS[id].name}」。`); renderSidebars();
}

function eliminateWrong(showFeedback = true) {
  const active = $$(".option:not(.eliminated)").filter(b => Number(b.dataset.option) !== state.currentQuestion.correct);
  if (!active.length) return false; random(active).classList.add("eliminated");
  if (showFeedback && $("#itemFeedback")) $("#itemFeedback").textContent = "已排除一个错误选项"; return true;
}

function finishRun(won) {
  stopTimer(); state.phase = "ending"; $("#abandonRun").hidden = true;
  const ending = determineEnding(), scores = calculateScores();
  if (won) unlockEnding(ending.id);
  $("#stageBody").innerHTML = endingScreenMarkup(won, ending, scores);
  $("#newRun").onclick = resetRun; renderAll(); updateCollectionCount();
  setGuide("ending", won ? "通关了。这次的玩法已经收入万象档案。" : "这局结束了。换个职业或难度，再试一次。" );
}

function endingScreenMarkup(won, ending, scores, preview = false) {
  const actionTag = preview ? "span" : "button";
  const record = preview ? "总评级：A · 正确 12/15 · 最高连胜 8 · 冒险成功 2" : `总评级：${grade(scores)} · 正确 ${state.correct}/${state.answered} · 最高连胜 ${state.maxStreak} · 冒险成功 ${state.riskWins}`;
  const rank = ENDING_RANKS[ending.rank] || ENDING_RANKS.basic;
  return `<div class="ending-screen ending-family-${ending.family}${preview ? " ending-screen-preview" : ""}">
    <div class="ending-hero"><div class="ending-seal" aria-hidden="true">${won ? endingGlyph(ending) : "未"}</div><div class="ending-copy"><span class="eyebrow">${won ? `${rank.label} · 成功完成15道题` : "本局结束"}</span><h2>${won ? ending.name : "未完成的档案"}</h2><p>${won ? ending.desc : "生命归零，本局结束。失败不会解锁结局，但本次答题和装备记录仍会显示在结算中。"}</p></div></div>
    <div class="score-grid">${Object.entries(scores).map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join("")}</div>
    <div class="ending-record"><span>${record}</span>${won ? `<b>${rank.label}</b>` : "<b>失败记录</b>"}</div><${actionTag} class="primary-button"${preview ? "" : ` id="newRun"`}>开始新一局</${actionTag}></div>`;
}

function determineEnding() {
  const context = endingContext();
  const special = [
    ["perfect-archive", context.accuracy === 1],
    ["redline-master", context.riskRoutes >= 8 && state.riskWins >= 6 && state.life >= 2],
    ["sixfold-master", context.maxLit >= 6 && context.domainsSeen >= 6 && state.maxStreak >= 8],
    ["toolchain-master", state.stats.itemUses >= 6 && context.tagCounts["道具"] >= 4],
    ["relic-symphony", state.relics.length >= 5 && relicTriggerCount() >= 10],
    ["phoenix-revision", state.stats.wrongs >= 4 && state.correct >= 11 && context.tagCounts["纠错"] >= 3]
  ].find(([, matched]) => matched);
  if (special) return endingById(special[0]);
  const advanced = [
    ["streak-overclock", state.maxStreak >= 10 && (context.tagCounts["连胜"] >= 4 || context.triggerFamilies.streak >= 3)],
    ["streak-quiet", state.maxStreak >= 9 && context.riskRoutes <= 3],
    ["chain-atlas", context.maxLit >= 6 && context.tagCounts["点亮领域"] >= 4],
    ["chain-polyglot", context.domainsSeen >= 6 && state.usedGroups.length >= 10],
    ["risk-storm", state.riskWins >= 4 && context.tagCounts["冒险"] >= 3],
    ["risk-insured", context.riskRoutes >= 5 && (context.tagCounts["纠错"] >= 2 || state.items.shield > 0 || state.life >= 3)],
    ["shop-collector", state.relics.length >= 5 && state.stats.shopSpent >= 28],
    ["shop-upgrade", state.relics.some(relic => relic.level >= 3) && state.stats.shopSpent >= 18],
    ["item-prepared", state.stats.itemUses >= 4 && context.tagCounts["道具"] >= 2],
    ["item-magnet", state.stats.itemUses >= 3 && state.coins >= 18],
    ["error-repair", state.stats.wrongs >= 3 && context.tagCounts["纠错"] >= 2],
    ["error-detective", state.stats.wrongs >= 2 && state.role === "detective"]
  ].find(([, matched]) => matched);
  if (advanced) return endingById(advanced[0]);
  const tagCounts = {};
  state.relics.forEach(o => relicById(o.id).tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + o.level));
  const metrics = { streak: (tagCounts["连胜"]||0) + state.maxStreak/3, chain: (tagCounts["点亮领域"]||0) + (state.stats.maxLit || state.chain.length), risk: (tagCounts["冒险"]||0) + state.riskWins, shop: (tagCounts["商店"]||0) + state.stats.shopSpent/10, item: (tagCounts["道具"]||0) + state.stats.itemUses, error: (tagCounts["纠错"]||0) + state.stats.wrongs };
  return endingById(Object.entries(metrics).sort((a,b) => b[1]-a[1])[0][0]);
}

function endingContext() {
  const tagCounts = {}, triggerFamilies = { streak: 0, chain: 0, risk: 0, shop: 0, item: 0, error: 0 };
  state.relics.forEach(owned => {
    const relic = relicById(owned.id);
    relic.tags.forEach(tag => tagCounts[tag] = (tagCounts[tag] || 0) + owned.level);
  });
  Object.entries(state.stats.triggers || {}).forEach(([id, count]) => {
    const relic = relicById(id);
    if (!relic) return;
    relic.tags.forEach(tag => { const family = RELIC_THEMES[tag]; if (family) triggerFamilies[family] += count; });
  });
  const domainsSeen = new Set(state.usedGroups.map(id => GROUPS.find(g => g.id === id)?.domain).filter(Boolean)).size;
  return {
    tagCounts,
    triggerFamilies,
    domainsSeen,
    maxLit: state.stats.maxLit || state.chain.length,
    riskRoutes: state.stats.difficulty.risk || 0,
    accuracy: state.answered ? state.correct / state.answered : 0
  };
}

function endingById(id) { return ENDINGS.find(ending => ending.id === id) || ENDINGS[0]; }
function endingGlyph(ending) { return ({ streak: "算", chain: "图", risk: "险", shop: "备", item: "具", error: "订" })[ending.family] || "档"; }

function calculateScores() {
  const accuracy = state.answered ? state.correct/state.answered : 0;
  return {
    "准确": Math.round(accuracy * 70 + state.stats.difficulty.challenge * 1.2 + state.stats.difficulty.risk * 2),
    "勇气": Math.min(100, state.stats.difficulty.risk * 10 + state.riskWins * 6),
    "博学": Math.min(100, new Set(state.usedGroups.map(id => GROUPS.find(g => g.id === id).domain)).size * 12 + state.maxStreak * 2),
    "装备": Math.min(100, state.relics.length * 8 + relicTriggerCount() * 2)
  };
}

function grade(scores) { const avg = Object.values(scores).reduce((a,b)=>a+b,0)/4; return avg >= 82 ? "S" : avg >= 68 ? "A" : avg >= 50 ? "B" : "C"; }
function unlockEnding(id) { const save = getMeta(); if (!save.endings.includes(id)) { save.endings.push(id); setMeta(save); toast("已收入万象档案"); } }

function renderAll() { renderJourney(); renderSidebars(); saveActiveRun(); }
const JOURNEY_MILESTONES = {
  3: { label: "奇物", type: "relic" },
  4: { label: "事件", type: "event" },
  5: { label: "商店", type: "shop" },
  8: { label: "奇物", type: "relic" },
  9: { label: "事件", type: "event" },
  10: { label: "商店", type: "shop" },
  12: { label: "奇物", type: "relic" },
  13: { label: "事件", type: "event" }
};
function renderJourney() {
  $("#nodeLabel").textContent = state.phase === "welcome" ? "尚未开始" : state.phase === "ending" ? "本局已结束" : `第 ${Math.min(state.node + 1,15)} / 15 题`;
  $("#journeyTrack").innerHTML = Array.from({length:15}, (_,i) => journeyNodeMarkup(i)).join("");
}

function journeyNodeMarkup(index) {
  const number = index + 1, milestone = JOURNEY_MILESTONES[number];
  const status = index < state.node ? " done" : index === state.node && state.phase !== "welcome" ? " current" : "";
  return `<span class="journey-stop${milestone ? ` milestone-${milestone.type}` : ""}" title="第${number}题${milestone ? `后：${milestone.label}` : ""}"><i class="journey-node${status}"></i>${milestone ? `<small>${milestone.label}</small>` : ""}</span>`;
}

function renderSidebars() {
  const role = getRole(state.role);
  $("#roleName").textContent = role ? role.name : "未选择"; $("#roleSkill").textContent = role ? role.skill : "先选一个职业，再开始游戏。"; $("#portrait").innerHTML = role ? `<span class="liu-sprite role-${role.id}" role="img" aria-label="${role.name}装扮的刘看山"></span>` : `<span>?</span>`;
  $("#lifeText").textContent = `${Math.max(0,state.life)} / 4`; $("#lifePips").innerHTML = Array.from({length:4},(_,i)=>`<i class="${i<state.life?"on":""}"></i>`).join("");
  $("#streak").textContent = state.streak; $("#coins").textContent = state.coins; $("#accuracy").textContent = state.answered ? `${Math.round(state.correct/state.answered*100)}%` : "—"; $("#chain").textContent = `${state.chain.length} / 6`;
  $("#chainTrack").innerHTML = Object.entries(DOMAINS).map(([id,d])=>`<span class="domain-chip ${state.chain.includes(id)?"on":""}">${d.name}</span>`).join("");
  $("#riskWins").textContent = state.riskWins; $("#maxStreak").textContent = state.maxStreak; $("#bridgeTriggers").textContent = relicTriggerCount(); $("#hintsUsed").textContent = state.hintsUsed;
  $("#relicCount").textContent = state.relics.length; $("#relicRack").innerHTML = Array.from({length:5},(_,i) => {
    const owned = state.relics[i]; if (!owned) return `<div class="relic-slot empty"><span>${String(i+1).padStart(2,"0")}</span><small>等待奇物</small></div>`;
    const r = relicById(owned.id); return `<div class="relic-slot ${relicThemeClass(r)}" data-relic="${r.id}">${relicArtMarkup(r, "rack")}<span class="relic-slot-copy"><span class="relic-slot-title"><b>${r.name}</b>${relicLevelMarkup(owned.level)}</span>${relicTagsMarkup(r)}<small>${relicEffect(r.id, owned.level)}</small></span></div>`;
  }).join("");
  $("#itemBelt").innerHTML = Object.entries(ITEMS).map(([id,item])=>`<span class="item-wrap" data-help="${item.usage}"><button class="item" data-item="${id}" aria-label="${item.name}：${item.usage}剩余${state.items[id]||0}个" ${state.items[id]?"":"disabled"}>${item.name}<b>×${state.items[id]||0}</b></button></span>`).join("");
  $$("[data-item]").forEach(b=>b.onclick=()=>useItem(b.dataset.item)); renderLog();
}

function renderLog() { $("#triggerLog").innerHTML = state.log.slice(-30).reverse().map(x=>`<div class="log-entry"><time>${x.time}</time>${x.text}</div>`).join("") || `<div class="log-entry">还没有奇物生效</div>`; }
function log(text) { state.log.push({ time: new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}), text }); renderLog(); }
function fireRelic(id) { if (!hasRelic(id)) return; state.stats.triggers[id] = (state.stats.triggers[id] || 0) + 1; if (relicById(id).tags.length > 1) state.bridgeTriggers++; const el = document.querySelector(`[data-relic="${id}"]`); if (el) { el.classList.remove("firing"); void el.offsetWidth; el.classList.add("firing"); } $(".energy-spine").classList.add("active"); setTimeout(()=>$(".energy-spine").classList.remove("active"),900); log(`奇物生效：${relicById(id).name}`); }

function helpQuestionPreview() {
  const groupData = GROUPS.find(group => group.id === "cul-poetry"), difficulty = DIFFICULTIES.safe;
  return questionCardMarkup(groupData, difficulty, groupData.questions[0], false, true);
}

function helpRelicPreview() {
  return `<div class="pick-grid help-relic-preview">${["inkLamp", "prism", "errorBook"].map(id => pickCard(relicById(id), null, "preview")).join("")}</div>`;
}

function relicCatalogMarkup() {
  return `<div class="relic-catalog">${RELICS.map(relic => `<article class="relic-catalog-card ${relicThemeClass(relic)}">
    ${relicArtMarkup(relic, "catalog")}
    <div class="relic-catalog-copy"><div class="relic-catalog-title"><h4>${relic.name}</h4><span>${relic.cost}金币</span></div>${relicTagsMarkup(relic)}
      <ol>${[1,2,3].map(level => `<li><b>${level}级</b><span>${relicEffect(relic.id, level)}</span></li>`).join("")}</ol>
    </div></article>`).join("")}</div>`;
}

function helpShopPreview() {
  return shopGridMarkup(["coinMold", "catalog", "lensCase"].map(relicById), true);
}

function helpEventPreview() {
  return eventPanelMarkup(EVENTS[0], true);
}

function helpEndingPreview() {
  return endingScreenMarkup(true, ENDINGS.find(ending => ending.id === "chain"), { "准确": 82, "勇气": 56, "博学": 88, "装备": 74 }, true);
}

const HELP_STEPS = [
  { title: "选择职业", text: "每个职业都有一项专属能力。选好就可以开始。", art: `<div class="help-career-picker">
    <span class="help-career-option"><i class="liu-sprite role-scholar"></i><b>研究员</b><small>${roleBrief("scholar")}</small></span>
    <span class="help-career-option selected"><em>当前选择</em><i class="liu-sprite role-adventurer"></i><b>旅行者</b><small>${roleBrief("adventurer")}</small></span>
    <span class="help-career-option"><i class="liu-sprite role-merchant"></i><b>银行家</b><small>${roleBrief("merchant")}</small></span>
  </div>` },
  { title: "选择路线", text: "每条路线都会显示领域、主题、难度和奖惩。比较后，选择一条路线。", art: `<div class="help-route-stage"><div class="help-route-preview">
    ${routeCard({ groupId: "cul-poetry", difficulty: "safe", timed: false }, 0, true)}
    ${routeCard({ groupId: "log-risk", difficulty: "challenge", timed: false }, 1, true)}
    ${routeCard({ groupId: "tec-binary", difficulty: "risk", timed: false }, 2, true)}
  </div>${timedWagerMarkup(true)}</div>` },
  { title: "回答问题", text: "答对会赚金币、增加连胜并点亮新领域。答错会打断连胜、熄灭所有领域；挑战和冒险还会损失生命。", art: `<div class="help-question-preview">${helpQuestionPreview()}</div>` },
  { title: "选择奇物", text: "第3、8、12题后，从三件奇物中选一件。奇物不需要手动使用，满足卡面条件时会自动生效。", art: helpRelicPreview() },
  { title: "进入商店", text: "第5、10题后进入商店。可以用金币购买或升级奇物、恢复生命，也可以刷新货架。", art: `<div class="help-shop-preview">${helpShopPreview()}</div>` },
  { title: "处理随机事件", text: "第4、9、13题后会遇到事件。事件没有标准答案；先看清两项选择的收益与代价，再决定当前最需要什么。", art: `<div class="help-event-preview">${helpEventPreview()}</div>` },
  { title: "完成本局", text: "答完15道题即可完成本局；生命降到0会提前结束。完成本局后，会根据本局表现解锁一份万象档案。", art: `<div class="help-ending-preview">${helpEndingPreview()}</div>` }
];

const HELP_DETAILS = {
  answer: { title: "答题规则", lead: "一局要完成15道题。每题先选路线，再从4个答案中选1个。", groups: [
    ["路线与奖励", ["轻松题答对获得3金币，答错不扣生命。", "挑战题答对获得6金币，答错扣1点生命。", "冒险题答对得10金币；答错扣1点生命，再扣3金币。金币不足3枚时扣到0；事件可能增加损失。", "路线卡下方可以开启「限时加注」。开关只对本题生效；45秒内答对多得4金币，超时按答错处理。"]],
    ["连胜与领域", ["答对使连胜加1；答错时连胜归零，但部分奇物可以改变结果。", "首次答对一个领域，会点亮该领域。", "答错会熄灭全部已点亮领域。职业和奇物可能利用连胜或点亮领域获得额外收益。"]]
  ]},
  relic: { title: "奇物规则", lead: "奇物是本局持续生效的自动装备。效果文字写明了它何时触发，流派标签则提示搭配方向。", groups: [
    ["获得与触发", ["第3、8、12题后出现奇物三选一；也可以放弃本次选择并获得5金币。", "奇物无需主动使用，满足卡面条件时会自动生效，并记入右侧效果记录。", "流派标签不是固定套装奖励；选择触发条件能互相衔接的奇物，才会形成联动。"]],
    ["升级与五个槽位", ["奇物架最多放5件。同名奇物仍占一个槽位，重复获得时升1级，最高3级。", "奇物架已满又获得新品时，必须替换一件已有奇物，或放弃新品。", "部分奇物每5题限制触发次数；进入商店时，这些次数会重置。"]]
  ]},
  shop: { title: "商店规则", lead: "第5、10题后进入商店。商店不会额外消耗答题次数，离开后继续选择路线。", groups: [
    ["奇物货架", ["货架每次显示3件奇物。购买新品会加入奇物架；购买已有的同名奇物会使它升1级。", "奇物架满时购买新品，需要替换已有奇物；放弃替换会退回本次购买花费。", "刷新货架固定花费4金币。银行家在整局游戏中的第一次商店刷新免费。"]],
    ["恢复与进店效果", ["恢复1点生命首次花费6金币；在同一次商店内再次恢复，每次花费9金币。生命已满时不能恢复。", "铸币模具、镜片匣、余料转换器等奇物会在进入商店时自动结算。", "折页目录在刷新货架后生效，让下一件购买的奇物按等级获得折扣。"]]
  ]},
  event: { title: "事件规则", lead: "一局会在第4、9、13题后各遇到一次随机事件。事件不属于题库，也不占15道题。", groups: [
    ["如何选择", ["每个事件提供两个选项，没有知识题意义上的正确答案。", "选项会直接列出主要收益和代价；条件不足的选项会变为不可选择。", "选择后通常立即生效；写有“下一题”或“下一组路线”的效果会保留到对应时机。"]],
    ["可能的影响", ["事件可能改变生命、金币、道具、已点亮领域、下一题奖惩或路线刷新。", "事件也可能提供奇物三选一或随机升级已有奇物。", "同一种事件在一局中可能再次出现，选择前应以当前资源为准。"]]
  ]},
  item: { title: "道具规则", lead: "道具是一次性主动用品，不占奇物槽位。数量和使用入口位于右侧奇物架下方。", groups: [
    ["答题时使用", ["排疑镜片：排除一个错误选项。", "沙漏：仅限限时加注题使用，增加20秒。", "护身符：本题答错时不扣生命。", "寻宝磁针：本题答对后额外获得5金币。"]],
    ["随时恢复", ["修复剂：生命未满时立即恢复1点生命。", "道具用掉后不会自动补充，可通过职业、奇物或事件继续获得。", "部分奇物会在使用道具、保留道具或进入商店时产生额外效果。"]]
  ]}
};

let helpStep = 0;
function showHelp() { helpReturn = null; helpStep = 0; openModal(`<div id="helpContent"></div>`); renderHelpStep(); }
function renderHelpStep() {
  const step = HELP_STEPS[helpStep];
  $("#helpContent").innerHTML = `<div class="modal-head help-head"><div><span class="eyebrow">玩法 · ${helpStep + 1} / ${HELP_STEPS.length}</span><h2>${step.title}</h2></div><button class="modal-close" aria-label="关闭">×</button></div>
    <div class="help-slide"><div class="help-illustration">${step.art}</div><p>${step.text}</p></div>
    <div class="help-footer"><div><div class="help-dots">${HELP_STEPS.map((_,i)=>`<button class="${i===helpStep?"on":""}" data-help-step="${i}" aria-label="第${i+1}步"></button>`).join("")}</div><button class="help-detail-link" id="openDetailedHelp">查看详细规则</button></div><div><button class="inline-button" id="helpPrev" ${helpStep===0?"disabled":""}>上一步</button><button class="primary-button" id="helpNext">${helpStep===HELP_STEPS.length-1?"知道了":"下一步"}</button></div></div>`;
  $(".modal-close").onclick = closeHelp;
  $$("[data-help-step]").forEach(button => button.onclick = () => { helpStep = Number(button.dataset.helpStep); renderHelpStep(); });
  $("#openDetailedHelp").onclick = () => renderDetailedHelp("answer");
  $("#helpPrev").onclick = () => { if (helpStep > 0) { helpStep--; renderHelpStep(); } };
  $("#helpNext").onclick = () => { if (helpStep === HELP_STEPS.length - 1) closeHelp(); else { helpStep++; renderHelpStep(); } };
}

function showDetailedHelp(section = "answer", returnAction = null) {
  helpReturn = returnAction;
  openModal(`<div id="helpContent"></div>`);
  renderDetailedHelp(section);
}

function renderDetailedHelp(section) {
  const detail = HELP_DETAILS[section] || HELP_DETAILS.answer;
  $("#helpContent").innerHTML = `<div class="modal-head"><div><span class="eyebrow">玩法说明 · 详细规则</span><h2>${detail.title}</h2></div><button class="modal-close" aria-label="关闭">×</button></div>
    <nav class="help-tabs" aria-label="详细规则分类">${Object.entries(HELP_DETAILS).map(([id, item]) => `<button class="${id === section ? "on" : ""}" data-help-tab="${id}" aria-pressed="${id === section}">${item.title.replace("规则", "")}</button>`).join("")}</nav>
    <div class="help-detail"><p class="help-detail-lead">${detail.lead}</p><div class="help-rule-grid">${detail.groups.map(([title, rules]) => `<section><h3>${title}</h3><ul>${rules.map(rule => `<li>${rule}</li>`).join("")}</ul></section>`).join("")}</div>${section === "relic" ? `<div class="relic-catalog-head"><div><span class="eyebrow">现有奇物 · ${RELICS.length}件</span><h3>奇物目录与等级效果</h3></div><p>所有奇物都自动生效。价格为商店基础价格；折页目录可能降低实际售价。</p></div>${relicCatalogMarkup()}` : ""}</div>
    <div class="help-detail-footer"><button class="inline-button" id="backToQuickHelp">返回快速说明</button><button class="primary-button" id="closeDetailedHelp">${helpReturn ? "返回事件" : "知道了"}</button></div>`;
  $(".modal-close").onclick = closeHelp;
  $$("[data-help-tab]").forEach(button => button.onclick = () => renderDetailedHelp(button.dataset.helpTab));
  $("#backToQuickHelp").onclick = () => { helpStep = 0; renderHelpStep(); };
  $("#closeDetailedHelp").onclick = closeHelp;
}

function closeHelp() {
  const returnAction = helpReturn;
  helpReturn = null;
  if (returnAction) returnAction(); else closeModal();
}

function showCollection() {
  const unlocked = getUnlockedEndings();
  openModal(`<div class="modal-head collection-head"><div><span class="eyebrow">只用于收藏，不增加属性</span><h2>万象档案 ${unlocked.length}/${ENDINGS.length}</h2></div><button class="modal-close">×</button></div>
    <div class="collection-summary">${Object.entries(ENDING_RANKS).map(([rank, info]) => {
      const total = ENDINGS.filter(ending => ending.rank === rank).length;
      const done = ENDINGS.filter(ending => ending.rank === rank && unlocked.includes(ending.id)).length;
      return `<span><b>${done}/${total}</b>${info.label}</span>`;
    }).join("")}</div>
    <div class="collection-grid">${ENDINGS.map(e => collectionTileMarkup(e, unlocked.includes(e.id))).join("")}</div>`); bindClose();
}

function collectionTileMarkup(ending, unlocked) {
  const rank = ENDING_RANKS[ending.rank] || ENDING_RANKS.basic;
  return `<article class="ending-tile ending-family-${ending.family} rank-${ending.rank} ${unlocked ? "unlocked" : "locked"}">
    <div class="ending-tile-seal" aria-hidden="true">${unlocked ? endingGlyph(ending) : "?"}</div>
    <div class="ending-tile-copy"><span>${rank.label}</span><h3>${unlocked ? ending.name : "未发现结局"}</h3><p>${unlocked ? ending.desc : ending.hint}</p></div>
  </article>`;
}

function openModal(html) { $("#modalContent").innerHTML = html; if (!$("#modal").open) $("#modal").showModal(); }
function closeModal() { if ($("#modal").open) $("#modal").close(); }
function dismissModal() { if ($("#helpContent")) closeHelp(); else if (!$(".event-modal")) closeModal(); }
function bindClose() { const b=$(".modal-close"); if(b)b.onclick=closeModal; }
function continuePending() { renderAll(); if (pendingAfterModal) { const fn=pendingAfterModal; pendingAfterModal=null; fn(); } }
function upgradeRandomRelic() { const candidates=state.relics.filter(r=>r.level<3); if(!candidates.length)return; random(candidates).level++; }
function addItem(id) { state.items[id]=(state.items[id]||0)+1; }
function randomItem() { return random(Object.keys(ITEMS)); }
function getRole(id) { return ROLES.find(r=>r.id===id); }
function roleBrief(id) { return getRole(id).brief.join("<br>"); }
function relicById(id) { return RELICS.find(r=>r.id===id); }
function hasRelic(id) { return state.relics.some(r=>r.id===id); }
function relicLevel(id) { return state.relics.find(r=>r.id===id)?.level || 0; }
function random(arr) { return arr && arr[Math.floor(Math.random()*arr.length)]; }
function shuffle(arr) { return [...arr].sort(()=>Math.random()-.5); }
function sample(arr,n) { return shuffle(arr).slice(0,n); }
function uniqueBy(arr,key) { return arr.filter((x,i)=>arr.findIndex(y=>y[key]===x[key])===i); }

function startTimer(seconds) { stopTimer(); timeLeft=seconds; updateTimer(); timerId=setInterval(()=>{ timeLeft--; updateTimer(); if(timeLeft<=0){stopTimer();answerQuestion(-1,true);} },1000); }
function updateTimer() { const el=$("#timer"); if(el)el.textContent=`00:${String(Math.max(0,timeLeft)).padStart(2,"0")}`; }
function stopTimer() { if(timerId)clearInterval(timerId); timerId=null; }
function toast(text) { const el=$("#toast"); el.textContent=text; el.classList.add("show"); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),1800); }
function setGuide(pose, text) { const sprite=$("#guideSprite"), copy=$("#guideText"); if(!sprite||!copy)return; sprite.className=`tern-sprite tern-${pose}`; copy.textContent=text; }
function toggleGuide() { const dock=$("#guideDock"), collapsed=!dock.classList.contains("collapsed"), toggle=$("#guideToggle"); dock.classList.toggle("collapsed",collapsed); toggle.textContent=collapsed?"+":"−"; toggle.setAttribute("aria-label",collapsed?"展开燕鸥小姐的话":"收起燕鸥小姐的话"); toggle.setAttribute("aria-expanded",String(!collapsed)); localStorage.setItem("archive-guide-collapsed",collapsed?"1":"0"); }
function resetRun() { stopTimer(); state=DEFAULT_STATE(); closeModal(); renderJourney(); renderSidebars(); renderWelcome(); localStorage.removeItem("archive-active-run"); }

function getMeta() { try { return JSON.parse(localStorage.getItem("archive-meta")) || { endings: [] }; } catch { return { endings: [] }; } }
function setMeta(meta) { localStorage.setItem("archive-meta",JSON.stringify(meta)); }
function saveActiveRun() { if(state.phase!=="welcome") localStorage.setItem("archive-active-run",JSON.stringify(state)); }
function restoreActiveRun() {
  try {
    const saved = JSON.parse(localStorage.getItem("archive-active-run"));
    if (!saved || !saved.role || !["route", "question", "shop"].includes(saved.phase)) return false;
    const defaults = DEFAULT_STATE();
    state = {
      ...defaults,
      ...saved,
      items: { ...defaults.items, ...(saved.items || {}) },
      flags: { ...defaults.flags, ...(saved.flags || {}) },
      stats: {
        ...defaults.stats,
        ...(saved.stats || {}),
        difficulty: { ...defaults.stats.difficulty, ...(saved.stats?.difficulty || {}) },
        triggers: { ...(saved.stats?.triggers || {}) }
      }
    };
    if (state.phase === "question" && state.answeredCurrent) state.answeredCurrent = false;
    return true;
  } catch { return false; }
}
function getUnlockedEndings() { return getMeta().endings.filter(id => ENDINGS.some(ending => ending.id === id)); }
function updateCollectionCount() { $("#collectionCount").textContent=`${getUnlockedEndings().length}/${ENDINGS.length}`; }
function exportSave() { const active=localStorage.getItem("archive-active-run"); const blob=new Blob([JSON.stringify({version:1,meta:getMeta(),active:active?JSON.parse(active):null},null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="万象档案馆-存档.json"; a.click(); URL.revokeObjectURL(a.href); }
function importSave(e) { const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{ try { const data=JSON.parse(reader.result); if(data.version!==1||!data.meta)throw new Error(); setMeta(data.meta); if(data.active)localStorage.setItem("archive-active-run",JSON.stringify(data.active)); updateCollectionCount(); toast(data.active?"存档已导入，刷新后恢复本局":"存档已导入"); } catch { toast("存档格式无效"); } }; reader.readAsText(file); e.target.value=""; }

init();
