"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function fakeElement() {
  return {
    innerHTML: "",
    textContent: "",
    hidden: false,
    disabled: false,
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {},
    addEventListener() {},
    querySelector() { return fakeElement(); }
  };
}

const appPath = path.join(__dirname, "..", "app.js");
const source = fs.readFileSync(appPath, "utf8").replace(/\ninit\(\);\s*$/, "");
const sandboxMath = Object.create(Math);
const sandbox = {
  console,
  Math: sandboxMath,
  Date,
  Blob,
  URL,
  setTimeout() {},
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {},
  confirm() { return true; },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  document: {
    querySelector() { return fakeElement(); },
    querySelectorAll() { return []; },
    createElement() { return fakeElement(); }
  }
};

vm.createContext(sandbox);
vm.runInContext(`${source}\n;globalThis.__test = { DEFAULT_STATE, ROLES, RELICS, ITEMS, EVENTS, ENDINGS, HELP_STEPS, HELP_DETAILS, JOURNEY_MILESTONES, roleBrief, routeCard, timedWagerMarkup, journeyNodeMarkup, eventChoiceCard, resolveCorrect, resolveWrong, relicEffect, relicTriggerCount, refreshShopStock, currentShopPrice, openShop, determineEnding, setState(next) { state = next; }, getState() { return state; } };`, sandbox);

const game = sandbox.__test;
const safeRoute = { difficulty: "safe", timed: false };
const culture = { domain: "culture", point: "文化测试" };
const history = { domain: "history", point: "历史测试" };
const nature = { domain: "nature", point: "自然测试" };

const state = game.DEFAULT_STATE();
game.setState(state);
game.resolveCorrect(culture, safeRoute);
game.resolveCorrect(history, safeRoute);
game.resolveCorrect(culture, safeRoute);
assert.deepEqual([...game.getState().chain], ["culture", "history"], "重复领域不应熄灭已点亮领域");

game.resolveWrong(nature, safeRoute, false);
assert.equal(game.getState().chain.length, 0, "答错应熄灭全部领域");

const echoState = game.DEFAULT_STATE();
echoState.chain = ["culture", "history"];
echoState.relics = [{ id: "echoFork", level: 3 }];
game.setState(echoState);
sandboxMath.random = () => 0;
const lensBefore = echoState.items.lens;
game.resolveCorrect(nature, safeRoute);
assert.equal(echoState.items.lens, lensBefore + 1, "回声音叉应在点亮第3个领域时提供镜片");

const echoEvent = game.EVENTS.find(event => event.name === "六域回音");
const eventState = game.DEFAULT_STATE();
eventState.chain = ["culture", "history", "life", "logic"];
echoEvent.choices[0].effect(eventState);
assert.equal(eventState.coins, 13, "六域回音应按每个已点亮领域2金币结算");
echoEvent.choices[1].effect(eventState);
assert.equal(eventState.flags.freeReroute, true, "六域回音应提供一次免费路线刷新");

for (const relic of game.RELICS) {
  assert.notEqual(game.relicEffect(relic.id, 1), game.relicEffect(relic.id, 2), `${relic.name}升级后说明必须变化`);
  const artPath = path.join(__dirname, "..", "assets", "relics", `${relic.id}.png`);
  assert.ok(fs.existsSync(artPath), `${relic.name}应有独立插画`);
  assert.ok(fs.statSync(artPath).size < 250_000, `${relic.name}插画应适合网页加载`);
}
assert.equal(fs.readdirSync(path.join(__dirname, "..", "assets", "relics")).filter(file => file.endsWith(".png")).length, 18, "奇物插画数量应与奇物数量一致");
assert.match(source, /assets\/relics\/\$\{relic\.id\}\.png/, "奇物组件应使用独立插画");
assert.match(source, /function relicCatalogMarkup\(\)/, "玩法说明应包含完整奇物目录");

assert.equal(game.ENDINGS.length, 24, "万象档案应包含24个结局");
assert.equal(game.ENDINGS.filter(ending => ending.rank === "basic").length, 6, "基础结局应为6个");
assert.equal(game.ENDINGS.filter(ending => ending.rank === "advanced").length, 12, "进阶结局应为12个");
assert.equal(game.ENDINGS.filter(ending => ending.rank === "hidden").length, 6, "隐藏结局应为6个");
assert.match(source, /collectionCount"\)\.textContent=`\$\{getUnlockedEndings\(\)\.length\}\/\$\{ENDINGS\.length\}`/, "顶部档案数量不应写死");

const perfectState = game.DEFAULT_STATE();
perfectState.answered = 15;
perfectState.correct = 15;
perfectState.maxStreak = 15;
perfectState.stats.maxLit = 6;
game.setState(perfectState);
assert.equal(game.determineEnding().id, "perfect-archive", "全对通关应优先进入隐藏结局");

const upgradeEndingState = game.DEFAULT_STATE();
upgradeEndingState.answered = 15;
upgradeEndingState.correct = 11;
upgradeEndingState.stats.shopSpent = 24;
upgradeEndingState.relics = [{ id: "coinMold", level: 3 }];
game.setState(upgradeEndingState);
assert.equal(game.determineEnding().id, "shop-upgrade", "高等级奇物和商店投入应进入进阶商店结局");

const triggerState = game.DEFAULT_STATE();
triggerState.stats.triggers = { answers: 99, inkLamp: 2, catalog: 1 };
game.setState(triggerState);
assert.equal(game.relicTriggerCount(), 3, "奇物生效次数不应包含普通答题次数");

const catalogState = game.DEFAULT_STATE();
catalogState.relics = [{ id: "catalog", level: 2 }];
game.setState(catalogState);
game.refreshShopStock();
assert.equal(catalogState.flags.catalogDiscount, 4, "2级折页目录刷新后应提供4金币折扣");
assert.equal(game.currentShopPrice({ cost: 13 }), 9, "商店价格应应用折页目录折扣");

const safetyState = game.DEFAULT_STATE();
safetyState.streak = 7;
safetyState.relics = [{ id: "safetyValve", level: 2 }];
game.setState(safetyState);
game.resolveWrong(culture, safeRoute, false);
assert.equal(safetyState.streak, 5, "2级回落阀第一次应保留最近连胜档位");
safetyState.streak = 7;
game.resolveWrong(culture, safeRoute, false);
assert.equal(safetyState.streak, 5, "2级回落阀第二次仍应生效");
safetyState.streak = 7;
game.resolveWrong(culture, safeRoute, false);
assert.equal(safetyState.streak, 0, "2级回落阀每5题最多生效两次");

const insuranceState = game.DEFAULT_STATE();
insuranceState.coins = 20;
insuranceState.relics = [{ id: "insurance", level: 2 }];
game.setState(insuranceState);
game.resolveWrong(culture, { difficulty: "risk", timed: false }, false);
game.resolveWrong(culture, { difficulty: "risk", timed: false }, false);
assert.equal(insuranceState.coins, 20, "2级保险丝盒应阻止两次冒险金币损失");
game.resolveWrong(culture, { difficulty: "risk", timed: false }, false);
assert.equal(insuranceState.coins, 17, "第三次冒险答错应正常扣3金币");

const shopState = game.DEFAULT_STATE();
shopState.items = { lens: 2, hourglass: 1, shield: 0, magnet: 0, patch: 0 };
shopState.relics = [
  { id: "coinMold", level: 2 },
  { id: "converter", level: 2 },
  { id: "lensCase", level: 2 }
];
game.setState(shopState);
game.openShop();
assert.equal(shopState.coins, 15, "商店奇物应按等级结算金币：初始5+铸币4+余料6");
assert.equal(shopState.items.lens, 4, "2级镜片匣进入商店应获得2个镜片");

const routeState = game.DEFAULT_STATE();
game.setState(routeState);
const routeMarkup = game.routeCard({ groupId: "lif-label", difficulty: "safe", timed: false }, 0);
assert.match(routeMarkup, /本题主题/);
assert.match(routeMarkup, /营养标签比较/);
assert.doesNotMatch(routeMarkup, /生活实验舱/);
const routePreviewMarkup = game.routeCard({ groupId: "lif-label", difficulty: "safe", timed: false }, 0, true);
assert.match(routePreviewMarkup, /^<div class="route-card route-card-preview"/);
assert.doesNotMatch(routePreviewMarkup, /限时加注/, "限时加注不应放在单条路线卡内");
assert.match(game.timedWagerMarkup(), /id="timedWager"/);
assert.match(game.timedWagerMarkup(), /本题开启限时加注/);
assert.equal(game.HELP_STEPS.length, 7, "快速玩法说明应为7步图文指引");
assert.ok(game.HELP_STEPS.every(step => step.title && step.text && step.art), "每一步玩法说明都应包含标题、文案和插图");
assert.equal(game.HELP_STEPS.map(step => step.title).join("|"), "选择职业|选择路线|回答问题|选择奇物|进入商店|处理随机事件|完成本局", "快速说明标题应使用一致的动作命名");
assert.match(game.HELP_STEPS[1].art, /timed-wager-preview/, "路线说明应展示独立的限时加注开关");
assert.match(game.HELP_STEPS[2].art, /question-card-preview/);
assert.match(game.HELP_STEPS[3].art, /pick-card-preview/);
assert.match(game.HELP_STEPS[4].art, /shop-grid-preview/);
assert.match(game.HELP_STEPS[5].art, /event-modal-preview/);
assert.match(game.HELP_STEPS[6].art, /ending-screen-preview/);
assert.deepEqual(Object.keys(game.HELP_DETAILS), ["answer", "relic", "shop", "event", "item"], "详细规则应包含五个分类");
assert.ok(Object.values(game.HELP_DETAILS).every(detail => detail.title && detail.lead && detail.groups.length), "每类详细规则都应包含标题、导语和规则组");
assert.equal(game.HELP_DETAILS.answer.lead, "一局要完成15道题。每题先选路线，再从4个答案中选1个。", "答题规则导语应直接说明操作顺序");
assert.match(game.HELP_DETAILS.answer.groups[0][1][2], /金币不足3枚时扣到0；事件可能增加损失/);
assert.match(game.HELP_DETAILS.answer.groups[0][1][3], /路线卡下方可以开启「限时加注」/);
assert.equal(game.HELP_DETAILS.answer.groups[1][1][1], "首次答对一个领域，会点亮该领域。", "点亮领域说明不应加入无关的重复答题解释");
assert.doesNotMatch(game.HELP_STEPS[5].text, /不占15道题/, "快速事件说明应去掉重复信息");
assert.deepEqual(Object.fromEntries(Object.entries(game.JOURNEY_MILESTONES).map(([number, milestone]) => [number, milestone.label])), {
  3: "奇物", 4: "事件", 5: "商店", 8: "奇物", 9: "事件", 10: "商店", 12: "奇物", 13: "事件"
}, "进度条特殊节点应与实际触发时机一致");
assert.doesNotMatch(game.journeyNodeMarkup(2), /<b>|>3</, "进度格中不应再显示题号");
assert.match(game.journeyNodeMarkup(2), /<small>奇物<\/small>/, "特殊节点名称应显示在对应进度格下方");
assert.doesNotMatch(game.journeyNodeMarkup(5), /<small>/, "普通进度格下方不应显示标签");

const mistChoiceMarkup = game.eventChoiceCard(game.EVENTS[0].choices[0], 0);
assert.match(mistChoiceMarkup, /进入迷雾/);
assert.match(mistChoiceMarkup, /下一题 \+6金币/);
assert.match(mistChoiceMarkup, /event-effect cost[^>]*>答错额外 -3金币/);

assert.doesNotMatch(source, /15道题 · 单局成长/);
assert.match(source, /id="welcomeHelp"[^>]*>.*玩法说明/);
assert.match(source, /\$\("#relicHelp"\)\.onclick/);
assert.match(source, /id="shopHelp"/);
assert.match(source, /id="eventHelp"/);
assert.match(source, /第4、9、13题后会遇到事件/);
assert.match(source, /class="journey-node/);
assert.match(source, /银行家在整局游戏中的第一次商店刷新免费/);
assert.doesNotMatch(source, /每个职业只改变一条规则/);
assert.match(source, /每个职业都有一项专属能力。选好就可以开始。/);
assert.match(source, /help-career-picker/);
assert.match(source, /class="role-card" data-role="\$\{r\.id\}" aria-pressed="false"/);
assert.match(source, /c\.setAttribute\("aria-pressed", String\(selected\)\)/);
assert.ok(game.ROLES.every(role => role.brief.length === 2), "每个职业都应有两行简短说明");
assert.equal(game.roleBrief("adventurer"), "首次答对冒险题<br>道具三选一", "正式选角页和玩法说明应共用职业短文案");
assert.ok(Object.values(game.ITEMS).every(item => item.usage.includes("使用")), "每个道具都应说明使用时机");
assert.match(source, /class="item-wrap" data-help="\$\{item\.usage\}"/);
assert.doesNotMatch(source, /挑下一题/);
assert.match(source, /每条路线都会显示领域、主题、难度和奖惩。比较后，选择一条路线。/);
assert.match(source, /答对会赚金币、增加连胜并点亮新领域。答错会打断连胜、熄灭所有领域；挑战和冒险还会损失生命。/);
assert.match(source, /innerHTML = questionCardMarkup\(g, d, qn, r\.timed\)/);
assert.match(source, /openModal\(eventPanelMarkup\(event\)\)/);
assert.match(source, /\$\("#stageBody"\)\.innerHTML = endingScreenMarkup\(won, ending, scores\)/);

console.log("game-logic: 38 checks passed");
