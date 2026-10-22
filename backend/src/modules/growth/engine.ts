import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BudgetMode,
  BudgetTier,
  CouponSuggestion,
  DynamicTag,
  EffectEstimate,
  FocusTag,
  HotelCandidate,
  HotelPlan,
  HotelRoomOption,
  HotelPrefTag,
  InterestTag,
  IntercityOption,
  Intervention,
  Itinerary,
  ItinerarySpot,
  Priority,
  ProfileConflict,
  RiskAssessment,
  RiskLevel,
  SpotOverride,
  StrategyReport,
  TransportOption,
  TransportPlan,
  TravelPace,
  TravelerProfile,
  TravelerSegment,
  TicketPref,
  UserPersona,
  VisitorNotice,
} from './types.js'

/* =========================================================================
 * 枚举文案映射
 * ========================================================================= */

export const SEGMENT_LABEL: Record<TravelerSegment, string> = {
  solo: '独自旅行',
  couple: '情侣出行',
  honeymoon: '蜜月纪念',
  friends: '朋友结伴',
  family: '家庭带娃',
  elder: '带长辈游',
  student: '学生出行',
  business: '商务差旅',
  team: '团队团建',
}

export const BUDGET_LABEL: Record<BudgetTier, string> = {
  economy: '经济型',
  comfort: '舒适型',
  premium: '品质型',
}

/* -------------------------------------------------------------------------
 * 本次出行最关注事项（多选）
 * ----------------------------------------------------------------------- */

export const FOCUS_LABEL: Record<FocusTag, string> = {
  save_money: '省钱优先',
  hotel_location: '位置优先',
  deep_play: '多逛景点',
  relax: '松弛慢玩',
  special_stay: '特色住宿',
  food_first: '美食探店',
  ticket_deal: '门票实惠',
  pickup_service: '接送无忧',
}

/** 关注标签完整释义（作为选项下方的小字说明） */
export const FOCUS_DESC: Record<FocusTag, string> = {
  save_money: '优先省钱，寻找低价中转交通方案',
  hotel_location: '酒店位置优先，出行便利第一',
  deep_play: '深度游玩，打卡尽可能多景点',
  relax: '松弛度假，减少赶路',
  special_stay: '特色住宿体验，优先民宿或景区内住宿',
  food_first: '美食探店为主',
  ticket_deal: '关注门票优惠与打包套票',
  pickup_service: '关注接送机、接送站配套服务',
}

export const FOCUSES: FocusTag[] = [
  'save_money', 'hotel_location', 'deep_play', 'relax',
  'special_stay', 'food_first', 'ticket_deal', 'pickup_service',
]

/** 关注事项上限（防止全选导致策略失去区分度） */
export const MAX_FOCUS = 4

/** 关注事项 → 画像标签 */
const FOCUS_PERSONA_LABEL: Record<FocusTag, string> = {
  save_money: '价格高敏感 / 找低价组合',
  hotel_location: '住宿位置优先',
  deep_play: '行程密度优先 / 打卡导向',
  relax: '松弛度假导向',
  special_stay: '住宿体验导向',
  food_first: '美食驱动决策',
  ticket_deal: '门票优惠敏感 / 打包偏好',
  pickup_service: '落地配套服务敏感',
}

/** 关注事项 → 景点 tag 加权词（命中则优先排入行程） */
const FOCUS_SPOT_SYNONYMS: Partial<Record<FocusTag, string[]>> = {
  deep_play: [],
  relax: ['休闲康养', '自然生态', '茶文化', '夜游体验'],
  special_stay: ['小众村落', '休闲康养'],
  food_first: ['市井美食', '本地生活', '商圈购物'],
  ticket_deal: ['演艺体验', '亲子必去', '主题乐园', '世界遗产'],
  pickup_service: [],
  save_money: [],
  hotel_location: [],
}

/** 关注事项 → 加价意愿系数（影响内部定价与券面额，原型模拟） */
const FOCUS_VALUE_COEF: Record<FocusTag, number> = {
  save_money: 0.82,
  hotel_location: 1.06,
  deep_play: 1.0,
  relax: 1.08,
  special_stay: 1.12,
  food_first: 1.05,
  ticket_deal: 0.95,
  pickup_service: 1.04,
}

/* -------------------------------------------------------------------------
 * 行程节奏（单选）
 * ----------------------------------------------------------------------- */

export const PACE_LABEL: Record<TravelPace, string> = {
  intensive: '特种兵模式',
  leisure: '懒人慢游',
  flexible: '自由随机',
}

export const PACES: TravelPace[] = ['intensive', 'leisure', 'flexible']

/** 节奏 → 每日景点数量与时段模板 */
interface PacePlan {
  /** 每日安排点位数 */
  perDay: number
  /** 时段模板 */
  slots: string[]
  /** 节奏说明 */
  note: string
  /** 是否预留休息时段 */
  restNote: string | null
}

const PACE_PLAN: Record<TravelPace, PacePlan> = {
  intensive: {
    perDay: 3,
    slots: ['上午 08:30', '下午 13:30', '傍晚 17:30'],
    note: '每天排满 3 个点位，早出晚归，把目的地一次玩透',
    restNote: null,
  },
  leisure: {
    perDay: 1,
    slots: ['上午 10:00'],
    note: '每天只安排 1 个核心点位，其余时间自由支配',
    restNote: '午后预留 2-3 小时回酒店休息 / 自由活动',
  },
  flexible: {
    perDay: 2,
    slots: ['上午 09:30', '下午 15:00'],
    note: '每天 2 个点位，强度均衡，上午玩重点、下午留机动',
    restNote: '下午点位可临时调整，留出随机探索空间',
  },
}

/* -------------------------------------------------------------------------
 * 酒店偏好标签（多选）
 * ----------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
 * 门票偏好（单选）：直接决定景点筛选时如何对待收费点位
 * ----------------------------------------------------------------------- */

export const TICKET_PREF_LABEL: Record<TicketPref, string> = {
  free: '少买门票',
  mixed: '搭着买',
  any: '不挑票',
}

export const TICKET_PREF_DESC: Record<TicketPref, string> = {
  free: '只排免费或低价点位，把预算留给吃住',
  mixed: '以免费为主，只安排 1-2 个最值得的收费景点',
  any: '收费免费都可以，优先看体验',
}

export const TICKET_PREFS: TicketPref[] = ['free', 'mixed', 'any']

export const HOTEL_PREF_LABEL: Record<HotelPrefTag, string> = {
  near_transit: '交通近便',
  in_scenic: '景区内住',
  value: '性价比高',
  breakfast: '免费早餐',
  airport_shuttle: '接送服务',
  meal_plan: '包餐服务',
  'local_民宿': '特色民宿',
  hygiene: '卫生优选',
  quiet_resort: '安静度假',
}

/** 酒店偏好完整释义（作为选项下方的小字说明） */
export const HOTEL_PREF_DESC: Record<HotelPrefTag, string> = {
  near_transit: '靠近公共交通，出行换乘省时',
  in_scenic: '住在景区里面或紧邻景区入口',
  value: '同等条件下优先价格更友好的酒店',
  breakfast: '房费包含早餐，早起不用另找吃的',
  airport_shuttle: '酒店提供接机或送机车辆',
  meal_plan: '含正餐套餐，减少外出觅食成本',
  'local_民宿': '地方特色民宿，体验本地生活',
  hygiene: '卫生条件优先，干净整洁是新底线',
  quiet_resort: '远离喧闹地段，适合休息放松',
}

export const HOTEL_PREFS: HotelPrefTag[] = [
  'near_transit', 'in_scenic', 'value', 'breakfast',
  'airport_shuttle', 'meal_plan', 'local_民宿', 'hygiene', 'quiet_resort',
]

/** 酒店偏好 → 酒店数据包特征词的匹配规则 */
const HOTEL_PREF_MATCH: Record<HotelPrefTag, string[]> = {
  near_transit: ['地铁', '交通枢纽', '换乘', '站'],
  in_scenic: ['景区', '湖畔', '海景', '一线', '内', '步行可达景区'],
  value: ['性价比', '价格友好', '便宜', '青旅', '公寓'],
  breakfast: ['早餐', '自助早餐', '含早', '包餐'],
  airport_shuttle: ['接机', '送机', '接送', '机场'],
  meal_plan: ['包餐', '含餐', '早晚餐', '一日三餐'],
  'local_民宿': ['民宿', '客栈', '院落', '青旅', '本地', '设计感'],
  hygiene: ['干净', '整洁', '卫生', '新装'],
  quiet_resort: ['安静', '度假', '私属', '露台', '园林', '森林'],
}

/** 判断酒店是否命中某项偏好 */
function hotelMatchesPref(
  hotel: { name: string; distance: string; highlight: string },
  pref: HotelPrefTag,
): boolean {
  const text = `${hotel.name}${hotel.distance}${hotel.highlight}`
  return HOTEL_PREF_MATCH[pref].some((k) => text.includes(k))
}

/* -------------------------------------------------------------------------
 * 出行兴趣偏好
 * ----------------------------------------------------------------------- */

export const INTEREST_LABEL: Record<InterestTag, string> = {
  nature: '自然生态',
  heritage: '历史古迹',
  art_museum: '艺术文博',
  urban_shopping: '城市商业',
  hiking: '户外徒步',
  food_tour: '美食探店',
  hidden_village: '小众村落',
  wellness: '休闲康养',
  theme_park: '主题乐园',
  seaside: '滨海风光',
}

export const INTERESTS: InterestTag[] = [
  'nature', 'heritage', 'art_museum', 'urban_shopping', 'hiking',
  'food_tour', 'hidden_village', 'wellness', 'theme_park', 'seaside',
]

/** 兴趣偏好上限（防止全选导致推荐失去区分度） */
export const MAX_INTERESTS = 5

/**
 * 兴趣标签 → 数据包景点 tag 的匹配词。
 * 数据包内景点的 tag 为中文短词（如「自然生态」「人文古迹」），
 * 此处做同义词归并，使同一个人文类景点可同时命中「历史古迹」与「艺术文博」。
 */
const INTEREST_SPOT_SYNONYMS: Record<InterestTag, string[]> = {
  nature: ['自然生态', '自然', '生态'],
  heritage: ['人文古迹', '世界遗产', '古迹', '历史', '人文地标'],
  art_museum: ['文博深度', '文博', '博物馆', '艺术', '人文深度'],
  urban_shopping: ['城市地标', '商圈购物', '商业', '地标'],
  hiking: ['茶文化', '徒步', '户外', '山', '步道'],
  food_tour: ['市井美食', '本地生活', '美食', '小吃'],
  hidden_village: ['小众村落', '村落', '古镇', '小众'],
  wellness: ['休闲康养', '康养', '温泉', '疗愈'],
  theme_park: ['亲子必去', '演艺体验', '乐园', '亲子'],
  seaside: ['海滨度假', '海岛体验', '海滨', '海岛', '海'],
}

/** 兴趣标签 → 画像标签文案 */
const INTEREST_PERSONA_LABEL: Record<InterestTag, string> = {
  nature: '自然生态偏好',
  heritage: '历史人文偏好',
  art_museum: '艺术文博偏好',
  urban_shopping: '城市商业偏好',
  hiking: '户外徒步偏好',
  food_tour: '美食探店偏好',
  hidden_village: '小众目的地偏好',
  wellness: '休闲康养偏好',
  theme_park: '主题乐园偏好',
  seaside: '滨海度假偏好',
}

/** 判断某个景点 tag 是否命中指定兴趣 */
function spotMatchesInterest(spotTag: string, interest: InterestTag): boolean {
  return INTEREST_SPOT_SYNONYMS[interest].some((k) => spotTag.includes(k))
}

/* -------------------------------------------------------------------------
 * 城际交通预算规划（原型模拟）
 * ----------------------------------------------------------------------- */

/** 城市粗略坐标（用于估算城际距离，原型模拟，非真实测距） */
const CITY_COORDS: Record<string, [number, number]> = {
  北京: [39.90, 116.40], 上海: [31.23, 121.47], 广州: [23.13, 113.26],
  深圳: [22.54, 114.06], 杭州: [30.27, 120.16], 成都: [30.57, 104.07],
  西安: [34.34, 108.94], 三亚: [18.25, 109.51], 重庆: [29.56, 106.55],
  南京: [32.06, 118.80], 武汉: [30.59, 114.31], 长沙: [28.23, 112.94],
  青岛: [36.07, 120.38], 厦门: [24.48, 118.09], 昆明: [25.04, 102.71],
  哈尔滨: [45.80, 126.53], 沈阳: [41.81, 123.43], 郑州: [34.75, 113.63],
  天津: [39.08, 117.20], 苏州: [31.30, 120.58], 宁波: [29.87, 121.55],
  福州: [26.07, 119.30], 贵阳: [26.65, 106.63], 兰州: [36.06, 103.83],
  乌鲁木齐: [43.83, 87.62], 拉萨: [29.65, 91.14], 三亚湾: [18.25, 109.51],
}

/** 模糊匹配城市坐标：支持「杭州」「杭州东」「杭州市」等写法 */
function lookupCoord(name: string): [number, number] | null {
  if (!name) return null
  const key = Object.keys(CITY_COORDS).find((k) => name.includes(k))
  return key ? CITY_COORDS[key] : null
}

/** 估算两城间直线距离（公里），坐标不可得时返回 null */
function estimateDistanceKm(origin: string, destination: string): number | null {
  const a = lookupCoord(origin)
  const b = lookupCoord(destination)
  if (!a || !b) return null
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  const straight = 2 * R * Math.asin(Math.sqrt(h))
  // 实际铁路/公路里程约为直线的 1.15-1.3 倍（短途绕行更多，长途更接近直线）
  const factor = straight <= 300 ? 1.3 : straight <= 1000 ? 1.22 : 1.15
  return Math.round(straight * factor)
}

/** 由距离推导档位 */
function distanceTierOf(km: number): 'short' | 'mid' | 'long' {
  if (km <= 500) return 'short'
  if (km <= 1500) return 'mid'
  return 'long'
}

const DISTANCE_LABEL: Record<'short' | 'mid' | 'long', string> = {
  short: '近距离（同城周边 / 同省）',
  mid: '中距离（邻省 / 半日达）',
  long: '远距离（跨省远途）',
}

/* -------------------------------------------------------------------------
 * 中转联程：候选中转枢纽城市
 * ----------------------------------------------------------------------- */

/** 常见的低价中转枢纽（原型模拟，按地理覆盖挑选） */
const HUB_CITIES: { name: string; coord: [number, number] }[] = [
  { name: '郑州', coord: [34.75, 113.63] },
  { name: '武汉', coord: [30.59, 114.31] },
  { name: '西安', coord: [34.34, 108.94] },
  { name: '长沙', coord: [28.23, 112.94] },
  { name: '南京', coord: [32.06, 118.80] },
  { name: '重庆', coord: [29.56, 106.55] },
  { name: '成都', coord: [30.57, 104.07] },
  { name: '上海', coord: [31.23, 121.47] },
  { name: '广州', coord: [23.13, 113.26] },
  { name: '天津', coord: [39.08, 117.20] },
  { name: '兰州', coord: [36.06, 103.83] },
  { name: '昆明', coord: [25.04, 102.71] },
]

/** 两点间直线距离（公里） */
function haversine(
  a: [number, number],
  b: [number, number],
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** 铁路 / 公路里程约为直线的 1.15-1.3 倍 */
function roadKm(straight: number): number {
  const factor = straight <= 300 ? 1.3 : straight <= 1000 ? 1.22 : 1.15
  return Math.round(straight * factor)
}

/**
 * 挑选中转城市：在出发地与目的地连线附近，且不绕远太多的枢纽。
 * 要求 origin→hub 与 hub→destination 都明显短于直达，才有"分段拼低价"的意义。
 */
function pickTransferCity(
  origin: string,
  destination: string,
  directKm: number,
): { city: string; leg1Km: number; leg2Km: number } | null {
  const o = lookupCoord(origin)
  const d = lookupCoord(destination)
  if (!o || !d) return null

  const candidates = HUB_CITIES.map((h) => {
    const leg1 = roadKm(haversine(o, h.coord))
    const leg2 = roadKm(haversine(h.coord, d))
    const total = leg1 + leg2
    // 绕路系数：总分里程不超过直达的 1.5 倍才值得考虑
    const detour = total / Math.max(1, directKm)
    return { city: h.name, leg1Km: leg1, leg2Km: leg2, total, detour }
  })
    .filter((c) => c.detour <= 1.5 && c.leg1Km >= 80 && c.leg2Km >= 80)
    // 绕路最少优先；同分时取总分里程更短的
    .sort((a, b) => a.detour - b.detour || a.total - b.total)

  const best = candidates[0]
  return best ? { city: best.city, leg1Km: best.leg1Km, leg2Km: best.leg2Km } : null
}

/** 长途大巴单程价（元） */
function coachPrice(km: number): number {
  return Math.round(Math.min(360, 45 + km * 0.24) / 5) * 5
}

/** 大巴耗时描述 */
function coachDuration(km: number): string {
  return `单程约 ${Math.max(1, km / 70).toFixed(1)} 小时`
}

/** 高铁单程价（元） */
function railPrice(km: number): number {
  return Math.round(Math.min(950, 100 + km * 0.38) / 5) * 5
}

/** 高铁耗时描述 */
function railDuration(km: number): string {
  const hrs = Math.max(0.5, km / 250)
  return `单程约 ${hrs < 1 ? '30 分钟' : `${hrs.toFixed(1)} 小时`}`
}

/** 飞机单程价（元） */
function flightPrice(km: number): number {
  return Math.round(Math.min(1900, 320 + km * 0.36) / 10) * 10
}

/** 生成跨城交通方案与预算规划（多方案比价，含中转联程） */
function buildTransportPlan(profile: TravelerProfile): TransportPlan {
  const origin = (profile.origin || '').trim()
  const destination = profile.destination
  const days = Math.max(1, profile.days)
  const focus = profile.focusTags ?? []

  // 同城或未填出发地：不做跨城规划
  const isLocal = !origin || origin === destination
  const km = isLocal ? 0 : estimateDistanceKm(origin, destination)
  // 坐标不可得时按保守中距离估计
  const resolvedKm = km ?? (isLocal ? 0 : 900)
  const tier = distanceTierOf(resolvedKm)

  if (isLocal) {
    return {
      origin: origin || destination,
      destination,
      distanceTier: 'short',
      distanceLabel: '本地出发',
      distanceKm: 0,
      options: [
        {
          mode: '市内交通直达',
          route: `${origin || destination} 市区 → 各游玩点位`,
          duration: '按实际位置 20-60 分钟',
          unitPrice: 0,
          roundTripPrice: 0,
          reason: '你在本地出发，不需要跨城交通，直接安排市内接驳即可',
          recommended: true,
          pros: ['零跨城成本', '时间完全自由'],
          cons: ['市内景点间通勤仍需自行安排'],
          coupons: [],
          isTransfer: false,
        },
      ],
      recommendedMode: '市内交通直达',
      recommendedRoundTrip: 0,
      cheapestMode: '市内交通直达',
      cheapestRoundTrip: 0,
      budgetSharePct: 0,
      advice: '你从本地出发，这趟不用留跨城交通预算，把钱花在住宿和门票上更划算。',
      note: '跨城交通与票价为业务原型模拟，不接入真实班次与票价接口。',
    }
  }

  const options: IntercityOption[] = []

  // ── 1. 高铁 / 动车 ────────────────────────────────────────────
  if (resolvedKm <= 2200) {
    const price = railPrice(resolvedKm)
    options.push({
      mode: '高铁 / 动车',
      route: `${origin} → ${destination}`,
      duration: railDuration(resolvedKm),
      unitPrice: price,
      roundTripPrice: price * 2,
      reason:
        tier === 'short'
          ? '距离近、班次密，准点率最高，性价比最优'
          : tier === 'mid'
            ? '半天可达，比飞机省去往返机场与安检时间'
            : '耗时较长但价格稳定，可夜车节省一晚住宿',
      recommended: tier === 'short' || tier === 'mid',
      pros:
        tier === 'long'
          ? ['直达不用换乘', '座位舒适可休息', '准点率高']
          : ['时间与价格平衡最好', '市区到市区，落地即玩', '班次密集可灵活改签'],
      cons:
        tier === 'long'
          ? ['耗时长，占掉大半天', '热门时段票源紧张']
          : ['旺季票价上浮', '景区方向仍需接驳'],
      coupons: ['12306 无折扣，可用平台「火车票立减券」', '学生 / 老年认证可享票价优惠'],
      isTransfer: false,
    })
  }

  // ── 2. 飞机 ─────────────────────────────────────────────────
  if (resolvedKm >= 700) {
    const price = flightPrice(resolvedKm)
    options.push({
      mode: '飞机',
      route: `${origin} → ${destination}`,
      duration: '飞行约 1.5-3 小时（另需机场往返与安检 3 小时）',
      unitPrice: price,
      roundTripPrice: price * 2,
      reason:
        tier === 'long'
          ? '跨省远途首选，飞行时间远低于高铁，适合假期有限的行程'
          : '时间成本最低，但需额外预留机场往返与安检时间',
      recommended: tier === 'long' && !focus.includes('save_money'),
      pros: ['绝对耗时最短', '长途舒适度最高'],
      cons: ['机场多在郊区，来回多花 3 小时', '行李额与退改限制多', '旺季价格波动大'],
      coupons: ['平台「机票立减券」满减可用', '提前 21 天以上锁特价票', '接送机券可用于机场往返'],
      isTransfer: false,
    })
  }

  // ── 3. 长途大巴 ─────────────────────────────────────────────
  // 近距离常规补充；远距离在"优先省钱"时也值得列出
  if (tier === 'short' || (focus.includes('save_money') && resolvedKm <= 1600)) {
    const price = coachPrice(resolvedKm)
    options.push({
      mode: '长途大巴',
      route: `${origin} → ${destination}`,
      duration: coachDuration(resolvedKm),
      unitPrice: price,
      roundTripPrice: price * 2,
      reason:
        tier === 'short'
          ? '价格最低，适合预算敏感且时间宽裕的安排'
          : '长途耗时明显，但票价只有高铁的一半左右，是纯粹的低价选项',
      recommended: false,
      pros: ['票价最低', '部分线路直达景区门口', '可携带大件行李'],
      cons: ['耗时长且舒适度一般', '班次少、易受路况影响', '夜间行车较多'],
      coupons: ['汽车票平台「新客立减券」', '往返套票通常再省 10%'],
      isTransfer: false,
    })
  }

  // ── 4. 中转联程（低价组合） ──────────────────────────────────
  // 仅当存在合理中转枢纽且距离足够远时才有意义
  if (resolvedKm >= 600) {
    const tf = pickTransferCity(origin, destination, resolvedKm)
    if (tf) {
      const leg1Rail = railPrice(tf.leg1Km)
      const leg2Coach = coachPrice(tf.leg2Km)
      const leg2Rail = railPrice(tf.leg2Km)
      const unit = leg1Rail + leg2Coach
      const unitRailRail = leg1Rail + leg2Rail
      // 只有确实比直达更便宜才列出；否则用"高铁+高铁"组合并注明时间优势
      const cheaperThanDirect = unit < Math.min(
        ...options.map((o) => o.unitPrice),
        Number.MAX_SAFE_INTEGER,
      )
      const chosenUnit = cheaperThanDirect ? unit : unitRailRail
      const chosenLeg2 = cheaperThanDirect ? '长途大巴' : '高铁 / 动车'
      const chosenLeg2Price = cheaperThanDirect ? leg2Coach : leg2Rail

      options.push({
        mode: `中转联程（经${tf.city}）`,
        route: `${origin} → ${tf.city} → ${destination}`,
        duration: `第一段高铁约 ${Math.max(0.5, tf.leg1Km / 250).toFixed(1)} 小时 + 中转候车 1-2 小时 + 第二段${chosenLeg2 === '长途大巴' ? coachDuration(tf.leg2Km).replace('单程约 ', '约 ') : `高铁约 ${Math.max(0.5, tf.leg2Km / 250).toFixed(1)} 小时`}`,
        unitPrice: chosenUnit,
        roundTripPrice: chosenUnit * 2,
        reason: cheaperThanDirect
          ? `先高铁到${tf.city}，再转大巴进${destination}，两段拼起来比直达便宜，适合把预算花在玩上`
          : `经${tf.city}中转可绕开直达票紧张时段，两段都是高铁，总耗时略长但更灵活`,
        recommended: focus.includes('save_money') && cheaperThanDirect,
        pros: cheaperThanDirect
          ? ['总花费通常比直达低 15%-30%', `可在${tf.city}顺路停一站`, '分段购票可各自用券']
          : [`${tf.city}枢纽班次多，容易捡到特价`, '可分两段改签，灵活度高'],
        cons: ['中转要留足候车时间，总耗时变长', '行李需自行搬转，带娃 / 长辈不轻松', '任一段晚点会连带影响后段'],
        coupons: ['两段可分别使用「火车票立减券」与「汽车票新客券」', `${tf.city}中转住宿券（若需过夜）`],
        isTransfer: true,
        transferCity: tf.city,
        segments: [
          { leg: `${origin} → ${tf.city}`, mode: '高铁 / 动车', duration: `${Math.max(0.5, tf.leg1Km / 250).toFixed(1)} 小时`, price: leg1Rail },
          { leg: `${tf.city} → ${destination}`, mode: chosenLeg2, duration: chosenLeg2 === '长途大巴' ? `${Math.max(1, tf.leg2Km / 70).toFixed(1)} 小时` : `${Math.max(0.5, tf.leg2Km / 250).toFixed(1)} 小时`, price: chosenLeg2Price },
        ],
      })
    }
  }

  // ── 5. 自驾（中近距离，多人同行摊薄成本） ────────────────────
  if (resolvedKm <= 1400 && !focus.includes('save_money')) {
    const fuel = Math.round((resolvedKm * 0.75 + 260) / 10) * 10
    options.push({
      mode: '自驾',
      route: `${origin} → ${destination}（全程高速）`,
      duration: `单程约 ${Math.max(1, resolvedKm / 85).toFixed(1)} 小时（不含休息）`,
      unitPrice: fuel,
      roundTripPrice: fuel * 2,
      reason: '多人同行可摊薄油费与过路费，目的地周边机动性最强',
      recommended: false,
      pros: ['多人同行人均最低', '目的地周边机动性最强', '行李与采购不受限'],
      cons: ['司机疲劳，长途需轮换', '景区停车位紧张且收费', '过路费与油费随油价浮动'],
      coupons: ['加油平台「满减券」', '高速 ETC 折扣', '合作停车场停车券'],
      isTransfer: false,
    })
  }

  // ── 兜底：确保至少一个方案 ──────────────────────────────────
  if (options.length === 0) {
    const p = Math.round((600 + resolvedKm * 0.5) / 10) * 10
    options.push({
      mode: '飞机 / 高铁',
      route: `${origin} → ${destination}`,
      duration: '按实际班次为准',
      unitPrice: p,
      roundTripPrice: p * 2,
      reason: '远距离出行，建议以飞机或高铁为主',
      recommended: true,
      pros: ['直达不折腾'],
      cons: ['票价随行就市'],
      coupons: ['平台机票 / 火车票立减券可用'],
      isTransfer: false,
    })
  }

  // 推荐判定：默认取第一个被标记为 recommended 的方案；
  // 「优先省钱」时改推最便宜的那套，「松弛度假」时避开最折腾的中转。
  let recommended = options.find((o) => o.recommended) ?? options[0]
  const cheapest = options.reduce((a, b) => (b.roundTripPrice < a.roundTripPrice ? b : a), options[0])
  if (focus.includes('save_money')) {
    recommended = cheapest
  } else if (focus.includes('relax') && !recommended.isTransfer) {
    // 松弛度假优先直达方案，跳过中转
    recommended = options.find((o) => !o.isTransfer && o.recommended) ?? recommended
  }

  const perPersonBudget = Math.round(
    perDayBudget(profile) * days * SEGMENT_VALUE_COEF[profile.segment],
  )
  const sharePct =
    perPersonBudget > 0
      ? Math.round((recommended.roundTripPrice / perPersonBudget) * 100)
      : 0

  // 预算过低（含 0 元穷游）时，交通占比说明改为「未预留预算」的口径
  if (perPersonBudget <= 0) {
    return {
      origin,
      destination,
      distanceTier: tier,
      distanceLabel: DISTANCE_LABEL[tier],
      distanceKm: resolvedKm,
      options,
      recommendedMode: recommended.mode,
      recommendedRoundTrip: recommended.roundTripPrice,
      cheapestMode: cheapest.mode,
      cheapestRoundTrip: cheapest.roundTripPrice,
      budgetSharePct: 0,
      advice: `你还没有预留交通预算。${origin} 到 ${destination} 距离约 ${resolvedKm} 公里，最省的「${cheapest.mode}」单人往返参考价约 ¥${cheapest.roundTripPrice}，可以用它作为订票预算的起点。`,
      note: '跨城交通方式与票价为业务原型模拟，未接入真实班次 / 机票 / 火车票接口。',
    }
  }

  const advice =
    sharePct > 100
      ? `你从${origin}到${destination}，往返交通约 ¥${recommended.roundTripPrice}，已超过你当前预留的整趟预算。当前预算下建议看「${cheapest.mode}」（单人往返约 ¥${cheapest.roundTripPrice}），或单独预留一笔交通费。`
      : focus.includes('save_money')
        ? `按你「优先省钱」的要求，帮你把「${cheapest.mode}」挑出来了：单人往返约 ¥${cheapest.roundTripPrice}，比推荐方案再省约 ¥${recommended.roundTripPrice - cheapest.roundTripPrice}。中转联程通常还能各自用券，值得比一比。`
        : sharePct > 35
          ? `你从${origin}到${destination}，往返交通大约要占整趟预算的 ${sharePct}%，比例偏高。如果时间能调，改成${tier === 'long' ? '提前 3 周以上锁特价机票' : '错峰出行'}能省下不少。`
          : `你从${origin}到${destination}，往返交通约 ¥${recommended.roundTripPrice}，占整趟预算 ${sharePct}%，属于合理区间，建议早点订票锁价。`

  return {
    origin,
    destination,
    distanceTier: tier,
    distanceLabel: DISTANCE_LABEL[tier],
    distanceKm: resolvedKm,
    options,
    recommendedMode: recommended.mode,
    recommendedRoundTrip: recommended.roundTripPrice,
    cheapestMode: cheapest.mode,
    cheapestRoundTrip: cheapest.roundTripPrice,
    budgetSharePct: sharePct,
    advice,
    note: '跨城交通方式与票价为业务原型模拟，未接入真实班次 / 机票 / 火车票接口。',
  }
}

/** 由每日人均预算数值反推档位 */
export function deriveBudgetTier(perDay: number): BudgetTier {
  if (perDay < 620) return 'economy'
  if (perDay < 1400) return 'comfort'
  return 'premium'
}

/** 人群消费能力系数 */
const SEGMENT_VALUE_COEF: Record<TravelerSegment, number> = {
  solo: 1.0,
  couple: 1.12,
  honeymoon: 1.42,
  friends: 1.0,
  family: 1.05,
  elder: 0.95,
  student: 0.72,
  business: 1.35,
  team: 0.98,
}

/** 人群酒店偏好档位描述 */
const SEGMENT_HOTEL_TIER: Record<TravelerSegment, string> = {
  solo: '独行友好 / 青旅单间或设计酒店大床房',
  couple: '设计感精品酒店 / 江景大床房',
  honeymoon: '高星度假酒店 / 套房 + 布置服务',
  friends: '双床房 / 可加床的公寓式酒店',
  family: '亲子友好型酒店 / 双床家庭房',
  elder: '无障碍设施齐全 / 电梯房低楼层',
  student: '高性价比青旅 / 地铁口快捷酒店',
  business: '商务四星 / 写字楼周边行政房',
  team: '可批量订房 / 含会议室的商务酒店',
}

/** 人群 → 面向游客本人的称呼 */
export const SEGMENT_SELF_CALL: Record<TravelerSegment, string> = {
  solo: '一个人出发',
  couple: '两个人的行程',
  honeymoon: '属于你们的纪念之旅',
  friends: '和朋友的这趟',
  family: '带孩子的这趟',
  elder: '陪爸妈的这趟',
  student: '这趟学生旅行',
  business: '这次出差',
  team: '团队这趟',
}

/** 各目的地模拟 POI 库（原型模拟，非真实库存） */
interface DestinationPack {
  spots: { name: string; tag: string; hrs: number; ticket: number; reason: string }[]
  hotels: { name: string; rating: number; distance: string; highlight: string; tierCoef: number }[]
  localTransport: TransportOption[]
  tips: string[]
}

const DESTINATION_PACKS: Record<string, DestinationPack> = {
  杭州: {
    spots: [
      { name: '西湖风景区', tag: '城市地标', hrs: 3, ticket: 0, reason: '免费开放，环湖步行或骑行都合适，第一天适应节奏' },
      { name: '灵隐寺飞来峰', tag: '人文古迹', hrs: 3, ticket: 75, reason: '千年古刹与石刻造像，适合慢逛拍照' },
      { name: '西溪湿地', tag: '自然生态', hrs: 4, ticket: 80, reason: '摇橹船穿行芦苇荡，情侣与家庭都适合' },
      { name: '宋城千古情', tag: '演艺体验', hrs: 4, ticket: 320, reason: '夜间演出，行程收尾的高光环节' },
      { name: '龙井村茶园', tag: '茶文化', hrs: 2.5, ticket: 0, reason: '茶园徒步+品茶，避开人群的安静选择' },
      { name: '河坊街历史街区', tag: '市井美食', hrs: 2, ticket: 0, reason: '小吃集中，晚间逛吃性价比高' },
      { name: '茅家埠古村水岸', tag: '小众村落', hrs: 2.5, ticket: 0, reason: '西湖以西的隐世水乡，人少清净，适合放空' },
      { name: '九溪烟树康养步道', tag: '休闲康养', hrs: 3, ticket: 0, reason: '溪谷森林步道，负氧离子高，节奏舒缓' },
      { name: '浙江省博物馆之江馆', tag: '文博深度', hrs: 3, ticket: 0, reason: '越地文物与书画特展集中，需提前预约' },
    ],
    hotels: [
      { name: '湖畔漫居·西湖店', rating: 4.8, distance: '距西湖断桥 600m', highlight: '步行可达景区，江景大床房', tierCoef: 1.25 },
      { name: '云栖轻居·龙井路店', rating: 4.7, distance: '距灵隐寺 3.2km', highlight: '茶山环绕，安静带露台', tierCoef: 1.05 },
      { name: '城中里驿·武林广场店', rating: 4.5, distance: '地铁 1 号线 200m', highlight: '交通枢纽，商圈配套齐全', tierCoef: 0.82 },
      { name: '青芝青年公寓', rating: 4.3, distance: '距河坊街 1.1km', highlight: '床位/小单间，社交氛围', tierCoef: 0.42 },
    ],
    localTransport: [
      { mode: '地铁 + 步行', route: '1 号线串联湖滨 / 武林商圈', duration: '单程约 20 分钟', cost: 8, note: '避开高峰最省心，扫码即可乘车' },
      { mode: '网约车', route: '酒店 ⇄ 灵隐 / 西溪', duration: '单程 25-40 分钟', cost: 45, note: '景区周边周末易拥堵，建议早出发' },
      { mode: '共享单车', route: '环西湖苏堤白堤段', duration: '骑行 1 小时', cost: 4, note: '环湖体验最好，注意景区限行时段' },
    ],
    tips: ['西湖景区周末实施单双号限行，自驾需提前确认', '灵隐寺需在官方公众号提前预约', '春季多雨，随身带折叠伞'],
  },
  成都: {
    spots: [
      { name: '宽窄巷子', tag: '城市地标', hrs: 2.5, ticket: 0, reason: '老城肌理与市井茶馆，抵达当天轻松逛' },
      { name: '成都大熊猫繁育研究基地', tag: '亲子必去', hrs: 4, ticket: 55, reason: '建议早上 8 点入园，熊猫活跃度最高' },
      { name: '武侯祠 + 锦里', tag: '人文古迹', hrs: 3, ticket: 50, reason: '三国文化与小吃街连成一片' },
      { name: '都江堰景区', tag: '世界遗产', hrs: 5, ticket: 80, reason: '半日近郊，水利工程与青城山可组合' },
      { name: '春熙路 / 太古里', tag: '商圈购物', hrs: 3, ticket: 0, reason: '餐饮购物集中，晚间氛围好' },
      { name: '人民公园鹤鸣茶社', tag: '本地生活', hrs: 2, ticket: 0, reason: '体验盖碗茶与掏耳朵，节奏慢下来' },
      { name: '明月村陶艺村落', tag: '小众村落', hrs: 3.5, ticket: 0, reason: '竹林里的陶艺村，可亲手拉坯，游客稀少' },
      { name: '青城山康养温泉', tag: '休闲康养', hrs: 4, ticket: 128, reason: '山林温泉与道养文化，适合行程中段调息' },
      { name: '金沙遗址博物馆', tag: '文博深度', hrs: 3, ticket: 70, reason: '古蜀文明与太阳神鸟金饰，室内避雨友好' },
      { name: '青龙湖湿地公园', tag: '自然生态', hrs: 3, ticket: 0, reason: '城市湿地与观鸟栈道，适合清晨或傍晚' },
      { name: '龙泉山城市森林公园', tag: '户外徒步', hrs: 4, ticket: 0, reason: '丹景台观景步道，可俯瞰东部新区' },
    ],
    hotels: [
      { name: '锦官城悦·春熙路店', rating: 4.8, distance: '距太古里 300m', highlight: '核心商圈，落地窗夜景', tierCoef: 1.22 },
      { name: '青城雅舍·宽窄店', rating: 4.7, distance: '距宽窄巷子 800m', highlight: '川西院落风格，安静舒适', tierCoef: 1.02 },
      { name: '天府智选·火车南站店', rating: 4.5, distance: '地铁 1/7 号线换乘', highlight: '出行便捷，性价比高', tierCoef: 0.8 },
      { name: '蓉驿青年旅舍', rating: 4.3, distance: '距宽窄巷子 1.5km', highlight: '床位房型，适合结伴', tierCoef: 0.4 },
    ],
    localTransport: [
      { mode: '地铁', route: '1/2/3 号线覆盖主要景点', duration: '单程 15-30 分钟', cost: 6, note: '熊猫基地建议地铁 3 号线+接驳车' },
      { mode: '网约车', route: '市区 ⇄ 都江堰', duration: '单程 60 分钟', cost: 110, note: '也可选城际高铁，20 分钟直达' },
      { mode: '景区直通车', route: '宽窄巷子 ⇄ 熊猫基地', duration: '单程 45 分钟', cost: 15, note: '定点发车，需提前占座' },
    ],
    tips: ['熊猫基地务必早到，10 点后熊猫多在休息', '成都多雨且湿度高，带薄外套', '火锅店排队高峰 18:30-20:00，建议线上取号'],
  },
  西安: {
    spots: [
      { name: '西安城墙', tag: '城市地标', hrs: 3, ticket: 54, reason: '可骑行环城，傍晚登墙看日落' },
      { name: '秦始皇兵马俑博物院', tag: '世界遗产', hrs: 5, ticket: 120, reason: '必看级项目，建议请讲解或租语音导览' },
      { name: '大唐不夜城', tag: '夜游体验', hrs: 3, ticket: 0, reason: '夜间灯光与街头演出，适合情侣' },
      { name: '陕西历史博物馆', tag: '文博深度', hrs: 4, ticket: 0, reason: '免费但需提前预约，馆藏极强' },
      { name: '回民街', tag: '市井美食', hrs: 2, ticket: 0, reason: '泡馍肉夹馍集中，逛吃方便' },
      { name: '华清宫', tag: '人文古迹', hrs: 3, ticket: 120, reason: '与兵马俑同线路，可拼车串联' },
      { name: '袁家村民俗村落', tag: '小众村落', hrs: 4, ticket: 0, reason: '关中民俗与手作小吃街，比市区更松弛' },
      { name: '骊山温泉康养区', tag: '休闲康养', hrs: 3, ticket: 158, reason: '温泉汤池配山景，适合徒步后恢复' },
      { name: '西安欢乐谷玛雅海滩', tag: '主题乐园', hrs: 5, ticket: 230, reason: '水陆双园区，适合全家或结伴玩一整天' },
      { name: '浐灞国家湿地公园', tag: '自然生态', hrs: 3, ticket: 0, reason: '渭河湿地候鸟栖息地，四季皆宜' },
      { name: '华山北峰徒步线', tag: '户外徒步', hrs: 6, ticket: 160, reason: '经典登山线路，建议索道上、徒步下' },
    ],
    hotels: [
      { name: '钟楼观景·长安里', rating: 4.8, distance: '距钟楼 200m', highlight: '古城核心，钟楼夜景房', tierCoef: 1.2 },
      { name: '曲江雅集·大唐不夜城店', rating: 4.7, distance: '距不夜城 500m', highlight: '新中式设计，夜游方便', tierCoef: 1.06 },
      { name: '地铁驿家·北大街店', rating: 4.4, distance: '地铁 2 号线 150m', highlight: '双线换乘，通勤效率高', tierCoef: 0.78 },
      { name: '碑林青旅', rating: 4.2, distance: '距城墙南门 900m', highlight: '床位房，背包客聚集', tierCoef: 0.38 },
    ],
    localTransport: [
      { mode: '地铁', route: '2 号线纵贯中轴，3/4 号线换乘', duration: '单程 20 分钟', cost: 6, note: '市区景点基本可地铁覆盖' },
      { mode: '城际巴士 / 拼车', route: '市区 ⇄ 兵马俑华清宫', duration: '单程 60 分钟', cost: 40, note: '拼车可串两个景点，性价比高' },
      { mode: '网约车', route: '大唐不夜城 ⇄ 钟楼', duration: '单程 25 分钟', cost: 35, note: '夜游散场时段打车难，建议提前叫车' },
    ],
    tips: ['陕历博需提前 3-5 天线上预约，免费票抢手', '兵马俑方向建议一早出发避开旅行团高峰', '城墙骑行需押金，注意夏季防晒'],
  },
  三亚: {
    spots: [
      { name: '亚龙湾海滩', tag: '海滨度假', hrs: 4, ticket: 0, reason: '沙质最细，适合下海与晒太阳' },
      { name: '蜈支洲岛', tag: '海岛体验', hrs: 6, ticket: 168, reason: '浮潜摩托艇等水上项目集中' },
      { name: '南山文化旅游区', tag: '人文地标', hrs: 5, ticket: 129, reason: '海上观音，适合家庭长辈同行' },
      { name: '亚特兰蒂斯水世界', tag: '亲子必去', hrs: 5, ticket: 380, reason: '亲子家庭一整天都想待的地方' },
      { name: '天涯海角', tag: '经典打卡', hrs: 3, ticket: 81, reason: '情侣打卡点，傍晚光线好' },
      { name: '第一市场海鲜广场', tag: '市井美食', hrs: 2.5, ticket: 0, reason: '自选海鲜加工，注意先问价' },
      { name: '后海渔村', tag: '小众村落', hrs: 3, ticket: 0, reason: '原生态渔村与村落冲浪点，避开度假区人流' },
      { name: '七仙岭雨林温泉', tag: '休闲康养', hrs: 4, ticket: 168, reason: '热带雨林中的温泉汤池，康养调息首选' },
      { name: '三亚千古情演艺', tag: '演艺体验', hrs: 3, ticket: 280, reason: '夜间大型实景演出，黎苗文化主题' },
      { name: '亚龙湾热带天堂森林', tag: '自然生态', hrs: 4, ticket: 158, reason: '雨林栈道与观海平台，俯瞰亚龙湾全貌' },
      { name: '崖州古城学宫', tag: '文博深度', hrs: 2.5, ticket: 0, reason: '海南最南端的古城与书院遗存，人文线补充' },
      { name: '尖峰岭雨林徒步', tag: '户外徒步', hrs: 5, ticket: 60, reason: '原始热带雨林步道，需向导陪同' },
    ],
    hotels: [
      { name: '海棠湾碧海豪庭', rating: 4.9, distance: '一线海景，私属沙滩', highlight: '无边泳池，亲子设施齐全', tierCoef: 1.6 },
      { name: '亚龙湾听海度假酒店', rating: 4.8, distance: '距亚龙湾 200m', highlight: '海景房，含自助早餐', tierCoef: 1.28 },
      { name: '大东海椰风客栈', rating: 4.5, distance: '距大东海 400m', highlight: '性价比海景，夜市就在楼下', tierCoef: 0.85 },
      { name: '三亚湾海居公寓', rating: 4.3, distance: '距三亚湾 700m', highlight: '公寓房型可做饭，适合家庭', tierCoef: 0.6 },
    ],
    localTransport: [
      { mode: '网约车', route: '市区 ⇄ 亚龙湾 / 海棠湾', duration: '单程 40-60 分钟', cost: 90, note: '三亚公交覆盖弱，打车是主力' },
      { mode: '旅游专线', route: '三亚湾 ⇄ 天涯海角 / 南山', duration: '单程 50 分钟', cost: 18, note: '按点发车，票价便宜' },
      { mode: '租车自驾', route: '全岛环线自由行程', duration: '按天计', cost: 260, note: '免费停车位少，酒店停车需确认' },
    ],
    tips: ['海岛紫外线极强，SPF50 防晒与浮潜鞋必备', '海鲜市场先问单价再称重，保留小票', '冬季为旺季，酒店需提前 2 周以上锁价'],
  },
}

/** 目的地兜底（未知目的地时） */
const FALLBACK_PACK: DestinationPack = {
  spots: [
    { name: '老城核心历史街区', tag: '城市地标', hrs: 3, ticket: 0, reason: '抵达当天轻松适应，感受在地生活' },
    { name: '市级博物馆', tag: '人文深度', hrs: 3.5, ticket: 0, reason: '快速建立对目的地的整体认知' },
    { name: '老城历史人文街区', tag: '人文古迹', hrs: 2.5, ticket: 0, reason: '在地历史建筑与街巷肌理集中区' },
    { name: '近郊自然景区', tag: '自然生态', hrs: 5, ticket: 90, reason: '半日近郊，节奏舒缓' },
    { name: '本地特色餐饮街', tag: '市井美食', hrs: 2, ticket: 0, reason: '晚餐时段体验本地口味' },
    { name: '城市观景平台', tag: '夜游体验', hrs: 2, ticket: 60, reason: '夜间俯瞰城市，行程收尾' },
    { name: '近郊传统村落', tag: '小众村落', hrs: 3.5, ticket: 0, reason: '保留完好的在地聚落，游客密度低' },
    { name: '康养温泉度假区', tag: '休闲康养', hrs: 4, ticket: 150, reason: '温泉与疗愈设施集中，适合行程中段放松' },
    { name: '地方艺术博物馆', tag: '文博深度', hrs: 3, ticket: 0, reason: '本地艺术与文物常设展，室内不受天气影响' },
    { name: '城市森林公园', tag: '自然生态', hrs: 3.5, ticket: 0, reason: '市区可达的绿肺，适合清晨散步' },
    { name: '近郊徒步山径', tag: '户外徒步', hrs: 4.5, ticket: 20, reason: '轻量登山线路，半天往返' },
    { name: '本地主题乐园', tag: '主题乐园', hrs: 5, ticket: 200, reason: '游乐设施集中，适合亲子或结伴' },
  ],
  hotels: [
    { name: '中心城区精品酒店', rating: 4.7, distance: '距核心商圈 300m', highlight: '位置优越，配套成熟', tierCoef: 1.1 },
    { name: '交通枢纽智选酒店', rating: 4.5, distance: '地铁站 200m', highlight: '出行效率高，性价比稳', tierCoef: 0.85 },
    { name: '性价比快捷酒店', rating: 4.3, distance: '距主景点 1.2km', highlight: '干净整洁，价格友好', tierCoef: 0.55 },
  ],
  localTransport: [
    { mode: '地铁 / 公交', route: '市区主干线', duration: '单程 20 分钟', cost: 5, note: '覆盖面广，成本最低' },
    { mode: '网约车', route: '酒店 ⇄ 各景点', duration: '单程 20-40 分钟', cost: 40, note: '多人同行更划算' },
  ],
  tips: ['抵达后先在酒店附近熟悉交通与餐饮', '热门景点建议线上提前预约', '随身携带充电宝与常用药'],
}

function getPack(destination: string): DestinationPack {
  const key = Object.keys(DESTINATION_PACKS).find((k) => destination.includes(k))
  return key ? DESTINATION_PACKS[key] : FALLBACK_PACK
}

/* =========================================================================
 * 1. 用户画像生成 + 冲突检测
 * ========================================================================= */

const BASE_TAGS: Record<TravelerSegment, DynamicTag[]> = {
  solo: [
    { code: 'seg_solo', label: '独自出行', source: 'base', weight: 0.9 },
    { code: 'pref_flexible', label: '行程自由度高', source: 'base', weight: 0.75 },
  ],
  couple: [
    { code: 'seg_couple', label: '情侣双人出行', source: 'base', weight: 0.9 },
    { code: 'pref_romantic', label: '偏好氛围感与设计感', source: 'base', weight: 0.75 },
  ],
  honeymoon: [
    { code: 'seg_honeymoon', label: '蜜月 / 纪念日出行', source: 'base', weight: 0.92 },
    { code: 'pref_premium_experience', label: '高预算体验优先', source: 'base', weight: 0.86 },
    { code: 'pref_romantic', label: '偏好氛围感与设计感', source: 'base', weight: 0.8 },
  ],
  friends: [
    { code: 'seg_friends', label: '朋友结伴出行', source: 'base', weight: 0.9 },
    { code: 'pref_social', label: '偏好夜生活与社交场景', source: 'base', weight: 0.72 },
  ],
  family: [
    { code: 'seg_family', label: '家庭亲子出行', source: 'base', weight: 0.9 },
    { code: 'pref_child_friendly', label: '强亲子设施诉求', source: 'base', weight: 0.8 },
  ],
  elder: [
    { code: 'seg_elder', label: '陪同长辈出行', source: 'base', weight: 0.9 },
    { code: 'pref_accessible', label: '无障碍与低强度行程', source: 'base', weight: 0.82 },
  ],
  student: [
    { code: 'seg_student', label: '学生结伴出行', source: 'base', weight: 0.9 },
    { code: 'price_sensitive', label: '价格高敏感', source: 'base', weight: 0.85 },
  ],
  business: [
    { code: 'seg_business', label: '商务差旅出行', source: 'base', weight: 0.9 },
    { code: 'pref_efficiency', label: '效率优先 / 时间敏感', source: 'base', weight: 0.8 },
  ],
  team: [
    { code: 'seg_team', label: '团队 / 团建出行', source: 'base', weight: 0.9 },
    { code: 'pref_group_booking', label: '批量订房与集体行程', source: 'base', weight: 0.84 },
  ],
}

/* =========================================================================
 * 1. 用户画像生成（全自动，不再依赖用户手动选择浏览行为）
 * ========================================================================= */

/** 关注事项 → 新增标签（自动进入画像） */
function focusTagsOf(profile: TravelerProfile): DynamicTag[] {
  const focus = profile.focusTags ?? []
  return focus.map((f, i) => ({
    code: `focus_${f}`,
    label: FOCUS_PERSONA_LABEL[f],
    source: 'focus' as const,
    // 勾选顺序越靠前权重越高，但仍整体高于兴趣偏好
    weight: Math.max(0.72, 0.93 - i * 0.04),
  }))
}

/** 行程节奏 → 画像标签 */
function paceTagOf(pace: TravelPace): DynamicTag {
  const label: Record<TravelPace, string> = {
    intensive: '高强度打卡型节奏',
    leisure: '慢游松弛型节奏',
    flexible: '弹性均衡型节奏',
  }
  const weight: Record<TravelPace, number> = {
    intensive: 0.88,
    leisure: 0.88,
    flexible: 0.8,
  }
  return { code: `pace_${pace}`, label: label[pace], source: 'base', weight: weight[pace] }
}

/** 酒店偏好 → 画像标签（最多取 3 个，避免标签噪音） */
function hotelPrefTagsOf(profile: TravelerProfile): DynamicTag[] {
  return (profile.hotelPrefs ?? []).slice(0, 3).map((p, i) => ({
    code: `hpref_${p}`,
    label: `酒店诉求：${HOTEL_PREF_LABEL[p]}`,
    source: 'base' as const,
    weight: Math.max(0.7, 0.84 - i * 0.04),
  }))
}

/**
 * 自动冲突检测：完全基于表单填写内容推导，不再依赖行为信号。
 * 当"用户自述的诉求"与"客观填写条件"存在张力时，更新画像并说明原因。
 */
function detectConflicts(profile: TravelerProfile): ProfileConflict[] {
  const conflicts: ProfileConflict[] = []
  const { segment, days } = profile
  const tier = profile.budgetTier
  const focus = profile.focusTags ?? []
  const perDay = perDayBudget(profile)

  // 「优先省钱」但预算其实很宽裕 → 价格敏感度被高估
  if (focus.includes('save_money') && tier === 'premium') {
    conflicts.push({
      from: '价格高敏感 / 只看低价',
      to: '价格理性型（预算充裕但追求划算）',
      reason: `你勾了「优先省钱」，但录入预算为每日人均 ¥${profile.budgetMin}-${profile.budgetMax}，属于品质档。判定为"不为低价牺牲体验、但要性价比"，策略应主打立减与打包价而非降档降价。`,
    })
  }

  // 「松弛度假」+ 高强度节奏 → 诉求矛盾，以节奏为准并提示
  if (focus.includes('relax') && profile.pace === 'intensive') {
    conflicts.push({
      from: '纯松弛度假（少赶路）',
      to: '松弛为主 + 仍想多打卡（需取舍）',
      reason: `你同时勾了「松弛度假，减少赶路」和「特种兵模式」节奏。两者张力明显，行程侧已按高强度排满点位，但会在每天保留 1 个可跳过的弹性点位，供你随时改成松弛模式。`,
    })
  }

  // 「深度游玩」+ 懒人慢游 → 密度诉求被下调
  if (focus.includes('deep_play') && profile.pace === 'leisure') {
    conflicts.push({
      from: '深度打卡（点位数量优先）',
      to: '深度体验（单点停留时长优先）',
      reason: `你关注「打卡尽可能多景点」，但节奏选了「懒人慢游」。已按"少而深"处理：每天 1 个核心点位、停留时间拉长，用体验深度替代点位数量。`,
    })
  }

  // 「特色住宿」+ 极低预算 → 体验诉求与预算冲突
  if (focus.includes('special_stay') && perDay > 0 && perDay < 350) {
    conflicts.push({
      from: '特色民宿 / 景区内住宿（体验优先）',
      to: '特色体验 + 预算收敛（需挑高性价比民宿）',
      reason: `你偏好特色住宿，但每日人均预算仅 ¥${perDay}。景区内住宿通常溢价明显，已改为优先推荐"位置好但价格温和"的地方民宿，而非景区核心区的高价房。`,
    })
  }

  // 商务差旅 + 深度游玩关注点 → 行程延展
  if (segment === 'business' && (focus.includes('deep_play') || focus.includes('food_first'))) {
    conflicts.push({
      from: '纯商务差旅（两点一线）',
      to: '商务 + 休闲延展（Biz-Leisure）',
      reason: '商务客群通常直奔会议地点，但本次明确关注深度游玩 / 美食，判定存在行程延展或自费升级意愿，可推荐会后半日的本地体验。',
    })
  }

  // 学生客群 + 品质预算
  if (segment === 'student' && tier === 'premium') {
    conflicts.push({
      from: '价格高敏感学生客群',
      to: '预算充足型学生客群（家庭资助 / 毕业旅行）',
      reason: `录入预算为每日人均 ¥${profile.budgetMin}-${profile.budgetMax}，显著高于学生客群默认价格敏感假设，调高消费能力评级。`,
    })
  }

  // 长行程家庭 / 长辈 + 高价酒店偏好
  if ((segment === 'family' || segment === 'elder') && days >= 5 && profile.hotelPrefs.includes('in_scenic')) {
    conflicts.push({
      from: '携家人长线游（成本按人头叠加）',
      to: '携家人长线游 + 景区住宿体验优先',
      reason: '长行程家庭单笔金额高，但你明确要求景区内住宿。已按"核心 2 晚住景区、其余住高性价比酒店"的混合方案平衡体验与总价。',
    })
  }

  // 带长辈 / 带娃 + 中转联程
  if ((segment === 'elder' || segment === 'family') && focus.includes('save_money')) {
    conflicts.push({
      from: '同行有老人 / 儿童（宜直达少折腾）',
      to: '预算敏感但需兼顾同行舒适度',
      reason: '携带长辈或儿童时，中转联程的搬行李与候车成本很高。策略改为优先推荐"直达但提前锁特价"，而非纯低价中转。',
    })
  }

  return conflicts
}

/** 消费能力指数 0-100（基于实际录入的每日人均预算 + 关注事项加成） */
function calcValueIndex(profile: TravelerProfile): number {
  const perDay = perDayBudget(profile)
  // 预算 200 元/天 → 约 30 分；1800 元/天 → 约 92 分
  const base = Math.max(12, Math.min(94, 22 + Math.log10(Math.max(150, perDay) / 100) * 62))
  const coef = SEGMENT_VALUE_COEF[profile.segment]
  const dayBoost = Math.min(profile.days * 1.6, 12)

  // 关注事项对消费意愿的影响：体验类拉高，省钱类拉低
  const focus = profile.focusTags ?? []
  const focusBoost = focus.reduce((s, f) => s + (FOCUS_VALUE_COEF[f] - 1) * 10, 0)

  // 酒店偏好越"重体验"，消费能力评级越高
  const prefBoost =
    (profile.hotelPrefs.includes('in_scenic') || profile.hotelPrefs.includes('quiet_resort') ? 3 : 0) +
    (profile.hotelPrefs.includes('value') ? -2 : 0)

  return Math.max(5, Math.min(99, Math.round(base * coef + dayBoost * 0.6 + focusBoost + prefBoost)))
}

/** 取游客录入的每日人均预算（区间取中值） */
function perDayBudget(profile: TravelerProfile): number {
  const min = profile.budgetMin
  const max = Math.max(profile.budgetMax, profile.budgetMin)
  return Math.round((min + max) / 2)
}

/**
 * 用于内部定价的预算基线。
 * 当用户预算极低（含 0 元穷游）时，直接按 0 计算会让酒店 / 券面额全部归零，
 * 页面失去参考意义；因此设一个经济型地板值，保证仍能给出可读的模拟报价。
 */
const PRICING_FLOOR_PER_DAY = 260

function pricingBasePerDay(profile: TravelerProfile): number {
  return Math.max(PRICING_FLOOR_PER_DAY, perDayBudget(profile))
}

/** 自动推导决策阶段：由"关注事项成熟度 + 行程准备度"决定，不再由行为决定 */
function deriveDecisionStage(profile: TravelerProfile): string {
  const focus = profile.focusTags ?? []
  const hasHotelPref = (profile.hotelPrefs ?? []).length > 0
  const days = profile.days

  // 关注点已细化到住宿偏好 → 已进入方案比较阶段
  if (hasHotelPref && focus.length >= 2) return '比较决策（方案比对中）'
  // 只关注门票 / 省钱这类单一维度 → 仍在认知拓客阶段
  if (focus.length <= 1 && !hasHotelPref) return '认知决策（需求萌发）'
  // 长行程 + 多个关注点 → 决策链条长，处于方案评估
  if (days >= 5) return '方案评估（决策链较长）'
  return '比较决策（需求已明确）'
}

function buildPersona(profile: TravelerProfile): UserPersona {
  const conflicts = detectConflicts(profile)
  const tags: DynamicTag[] = [
    ...BASE_TAGS[profile.segment],
    ...focusTagsOf(profile),
    paceTagOf(profile.pace),
    ...hotelPrefTagsOf(profile),
  ]

  // 兴趣偏好标签：勾选即进入画像，权重按命中顺序递减
  const interests = profile.interests ?? []
  interests.forEach((it, i) => {
    tags.push({
      code: `interest_${it}`,
      label: INTEREST_PERSONA_LABEL[it],
      source: 'interest',
      weight: Math.max(0.68, 0.88 - i * 0.04),
    })
  })

  // 自定义偏好 / 关注点：作为语义补充信号进入画像
  const customPref = (profile.customPreference ?? '').trim()
  if (customPref) {
    tags.push({
      code: 'custom_pref',
      label: `自定义诉求「${shorten(customPref, 12)}」`,
      source: 'interest',
      weight: 0.86,
    })
  }
  const customFocus = (profile.customFocus ?? '').trim()
  if (customFocus) {
    tags.push({
      code: 'custom_focus',
      label: `自定义关注点「${shorten(customFocus, 12)}」`,
      source: 'focus',
      weight: 0.9,
    })
  }

  for (const c of conflicts) {
    tags.push({ code: `conflict_${tags.length}`, label: c.to, source: 'conflict', weight: 0.92 })
  }

  // 去重（同 label 保留高权重）
  const dedup = new Map<string, DynamicTag>()
  for (const t of tags) {
    const prev = dedup.get(t.label)
    if (!prev || prev.weight < t.weight) dedup.set(t.label, t)
  }
  const finalTags = [...dedup.values()].sort((a, b) => b.weight - a.weight)

  const valueIndex = calcValueIndex(profile)
  const decisionStage = deriveDecisionStage(profile)
  const budgetText =
    profile.budgetMin === profile.budgetMax
      ? `每日人均 ¥${profile.budgetMin}`
      : `每日人均 ¥${profile.budgetMin}-${profile.budgetMax}`

  const interestText =
    interests.length > 0
      ? `兴趣偏好：${interests.map((it) => INTEREST_LABEL[it]).join('、')}。`
      : '未勾选兴趣偏好，按人群默认偏好推荐。'

  const focusText =
    (profile.focusTags ?? []).length > 0
      ? `最关注：${(profile.focusTags ?? []).map((f) => FOCUS_LABEL[f]).join('；')}。`
      : '未勾选关注事项，按人群默认诉求推荐。'

  const summary = `${SEGMENT_LABEL[profile.segment]} / ${budgetText} / ${profile.destination} ${profile.days} 天 / 节奏为${PACE_LABEL[profile.pace]}。${focusText}${interestText}当前处于「${decisionStage}」阶段，消费能力指数 ${valueIndex}。${conflicts.length > 0 ? `检测到 ${conflicts.length} 项画像冲突，已动态修正标签。` : '画像与填写内容一致，无需修正。'}`

  return { tags: finalTags, summary, conflicts, valueIndex, decisionStage }
}

/** 截断长文本用于标签展示 */
function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/* =========================================================================
 * 2. 流失风险判定（基于填写条件的自动评分）
 * ========================================================================= */

function assessRisk(profile: TravelerProfile, persona: UserPersona): RiskAssessment {
  let score = 34
  const reasons: string[] = []
  const focus = profile.focusTags ?? []
  const prefs = profile.hotelPrefs ?? []
  const perDay = perDayBudget(profile)

  // ── 关注事项带来的风险 / 缓和 ─────────────────────────────
  if (focus.includes('save_money')) {
    score += 14
    reasons.push('明确以「优先省钱」为目标，会在多平台反复比价，价格锚点缺失时极易流失')
  }
  if (focus.includes('ticket_deal')) {
    score += 8
    reasons.push('关注门票优惠与打包套票，若当前无可用券会延后决策，等待促销')
  }
  if (focus.includes('deep_play')) {
    score += 6
    reasons.push('关注景点密度，对门票总价敏感（多处门票叠加会推高总支出），易因总价超预期而缩减行程')
  }
  if (focus.includes('relax')) {
    score -= 8
    reasons.push('诉求为松弛度假，决策节奏慢但目的明确，短期流失概率相对可控')
  }
  if (focus.includes('special_stay')) {
    score -= 6
    reasons.push('瞄准特色住宿体验，属于高动机出游，一旦找到匹配房源转化意愿强')
  }
  if (focus.includes('pickup_service')) {
    score -= 4
    reasons.push('关注接送配套服务，说明已在规划落地细节，进入较强的购买准备状态')
  }
  if (focus.includes('food_first') || focus.includes('hotel_location')) {
    score += 2
    reasons.push('决策维度偏向体验细节，需要更充分的对比信息才能拍板，决策周期偏长')
  }

  // ── 行程准备度 ────────────────────────────────────────────
  if (prefs.length === 0) {
    score += 10
    reasons.push('未填写任何酒店偏好，住宿需求仍模糊，推荐匹配度低、需要更多引导')
  } else if (prefs.length >= 3) {
    score -= 6
    reasons.push(`已明确 ${prefs.length} 项酒店偏好，需求边界清晰，推荐可直接命中`)
  }

  if (profile.pace === 'intensive') {
    score += 5
    reasons.push('选择高强度节奏，行程紧凑、任一环节（票 / 房）未锁定都会连带影响整趟安排')
  } else if (profile.pace === 'leisure') {
    score -= 5
    reasons.push('选择慢游节奏，时间弹性大，对即时锁定的依赖度低')
  }

  // ── 预算敏感度 ────────────────────────────────────────────
  if (perDay > 0 && perDay < 500) {
    score += 12
    reasons.push('每日人均预算偏紧，对价格波动更敏感，优惠信息缺失易导致流失')
  } else if (perDay >= 1500) {
    score -= 8
    reasons.push('每日人均预算充裕，客单价值高、决策更审慎，短期流失概率相对可控')
  }

  // ── 人群特征 ──────────────────────────────────────────────
  if (profile.segment === 'student') {
    score += 10
    reasons.push('学生客群多平台比价习惯强，留存依赖价格锚点')
  }
  if (profile.segment === 'family' || profile.segment === 'elder') {
    score -= 6
    reasons.push('携家人出行决策沉没成本高，一旦启动规划流失意愿偏低')
  }
  if (profile.segment === 'honeymoon') {
    score -= 4
    reasons.push('蜜月 / 纪念日行程决策动机强，转化意愿高于均值')
  }
  if (profile.segment === 'team') {
    score += 6
    reasons.push('团队出行涉及多人协调，决策链长且易出现临时变更')
  }

  if (persona.conflicts.length > 0) {
    score += 6
    reasons.push(`画像存在 ${persona.conflicts.length} 项冲突，推荐匹配度下降，需重新校准策略`)
  }

  if (persona.valueIndex >= 80) {
    reasons.push(`消费能力指数 ${persona.valueIndex}，高价值客群，流失机会成本显著`)
  }

  score = Math.max(8, Math.min(96, score))

  const level: RiskLevel = score >= 70 ? 'high' : score >= 45 ? 'mid' : 'low'

  // 挽留窗口：越接近决策末端的关注点，窗口越短
  const windowMinutes =
    focus.includes('ticket_deal') || focus.includes('save_money') ? 30
      : profile.pace === 'intensive' ? 45
        : focus.includes('relax') ? 240
          : 120

  return { level, score, reasons, windowMinutes }
}

/* =========================================================================
 * 3. 运营干预策略（由关注事项自动匹配，无需用户手动选择行为）
 * ========================================================================= */

/** 自动推理依据说明（面向运营，解释策略为何这样生成） */
function buildRuleNote(profile: TravelerProfile): string {
  const focus = profile.focusTags ?? []
  const prefs = profile.hotelPrefs ?? []
  const parts: string[] = []

  parts.push(
    `自动推理链路：读取全部表单字段（${SEGMENT_LABEL[profile.segment]} / ${profile.destination} ${profile.days} 天 / ${PACE_LABEL[profile.pace]} / 每日人均 ¥${profile.budgetMin}-${profile.budgetMax}）`,
  )
  if (focus.length > 0) {
    parts.push(`主关注点「${focus.map((f) => FOCUS_LABEL[f]).join('；')}」决定干预主方向`)
  }
  if (prefs.length > 0) {
    parts.push(`酒店偏好（${prefs.map((p) => HOTEL_PREF_LABEL[p]).join('、')}）决定住宿侧的权益钩子`)
  }
  if ((profile.interests ?? []).length > 0) {
    parts.push(`兴趣偏好（${(profile.interests ?? []).map((i) => INTEREST_LABEL[i]).join('、')}）决定内容种草方向`)
  }
  parts.push('未使用任何用户手动选择的行为信号')
  return parts.join('；') + '。'
}

/** 价位敏感度 → 券面额（原型模拟） */
function couponValue(profile: TravelerProfile, base: number): number {
  const perDay = perDayBudget(profile)
  const coef = perDay >= 1400 ? 2.2 : perDay >= 620 ? 1.3 : 1
  const segCoef =
    profile.segment === 'student' ? 0.8
      : profile.segment === 'family' || profile.segment === 'elder' || profile.segment === 'team' ? 1.15
        : profile.segment === 'honeymoon' ? 1.5
          : 1
  // 「优先省钱」客群对券更敏感，面额适度上浮以提升响应
  const focusCoef = (profile.focusTags ?? []).includes('save_money') ? 1.15 : 1
  return Math.round((base * coef * segCoef * focusCoef) / 5) * 5
}

function buildInterventions(
  profile: TravelerProfile,
  risk: RiskAssessment,
): Intervention[] {
  const { destination, budgetTier } = profile
  const focus = profile.focusTags ?? []
  const prefs = profile.hotelPrefs ?? []
  const list: Intervention[] = []

  // ── 1) 优先省钱 / 关注门票优惠 → 交通比价与打包券 ──────────
  if (focus.includes('save_money') || focus.includes('ticket_deal')) {
    const transportSave = couponValue(profile, 60)
    const bundleSave = couponValue(profile, 45)
    list.push({
      id: 'iv_save_money',
      name: '低价组合方案推送',
      channel: 'app_popup',
      channelLabel: 'APP 弹窗',
      timing: `用户进入行程页 / 停留超过 10 秒未点击预订时触发（黄金窗口 ${risk.windowMinutes} 分钟）`,
      copyDirection:
        '主打「帮你算过了」的确定性，直接把多套比价方案摆出来，用具体差额代替笼统的"更便宜"。对中转联程强调"两段可各自用券"，弱化耗时代价。',
      copySample: `你从${profile.origin || '出发地'}到${destination}，帮你把高铁、飞机、大巴和中转联程都比过了。最省的一套单人往返约 ¥${couponValue(profile, 280)} 上下，比直达省一截。下单还能叠加 ¥${transportSave} 交通立减券。`,
      hook: `交通立减 ¥${transportSave} + 多方案比价（含中转联程）`,
      objective: '承接价格敏感流量，用透明比价缩短决策周期',
    })
    list.push({
      id: 'iv_ticket_bundle',
      name: '门票打包套票触达',
      channel: 'in_app_message',
      channelLabel: '站内消息',
      timing: '弹窗未转化后 30 分钟，推送打包票权益',
      copyDirection:
        '把分散的门票需求打包成一个总数，突出"一次买齐、免排队、可改期"。用打包总价对比单买总价，制造可量化的省钱感。',
      copySample: `${destination}这趟的门票可以一次打包：${profile.days} 天的景点票 + 往返接送 + 语音讲解，比分开买省约 ¥${bundleSave}，还支持免费改期一次。`,
      hook: `门票打包立省 ¥${bundleSave} + 免费改期`,
      objective: '提升门票连带率与单用户客单',
    })
  }

  // ── 2) 酒店位置优先 / 特色住宿 → 住宿侧权益 ────────────────
  if (focus.includes('hotel_location') || focus.includes('special_stay')) {
    const hotelCoupon = couponValue(profile, 70)
    const stayPick = prefs.includes('in_scenic')
      ? '景区内住宿'
      : prefs.includes('local_民宿')
        ? '地方特色民宿'
        : '交通便利的核心区酒店'
    list.push({
      id: 'iv_hotel_match',
      name: '住宿匹配度弹窗',
      channel: 'app_popup',
      channelLabel: 'APP 弹窗',
      timing: `用户滑动至「酒店怎么住」模块 / 在两种酒店方案间来回切换时触发（窗口 ${risk.windowMinutes} 分钟）`,
      copyDirection: `围绕「位置 + 通勤」讲价值，而非讲设施。你已明确要${stayPick}，文案要给出到每日景点的具体通勤时间，把"住得近"换算成"每天省 1 小时"。`,
      copySample: `按你"${focus.includes('hotel_location') ? '酒店位置优先' : '特色住宿体验'}"的要求，已筛出 ${stayPick}。其中「${profile.destination}·首选」到第 1 天点位通勤仅约 12 分钟，每晚约 ¥${couponValue(profile, 260)}。现在订可用 ¥${hotelCoupon} 无门槛券。`,
      hook: `住宿 ¥${hotelCoupon} 无门槛券 + 通勤便利性排序`,
      objective: '以位置与通勤效率提升住宿转化，兼顾体验诉求',
    })
    list.push({
      id: 'iv_hotel_dual_plan',
      name: '双方案取舍引导',
      channel: 'in_app_message',
      channelLabel: '站内消息',
      timing: '弹窗未转化后 2 小时，推送"连住 vs 随行更换"的取舍建议',
      copyDirection:
        '用"省心 vs 省时"的取舍框架帮用户做决定，而不是继续堆砌房源。明确两种方案各自适合谁，降低选择瘫痪。',
      copySample: `住法有两种：全程连住同一家更省心、总价更低；跟着行程换酒店每天更近、但要多搬一次行李。你 ${profile.days} 天的行程，我们更建议前者。需要我把两种都列出来对比吗？`,
      hook: '两种住宿方案对比（连住 / 随行更换）',
      objective: '降低住宿决策瘫痪，提升方案确认率',
    })
  }

  // ── 3) 深度游玩 → 点位与套票 ──────────────────────────────
  if (focus.includes('deep_play')) {
    const passPrice = couponValue(profile, 55)
    list.push({
      id: 'iv_deep_play_pass',
      name: '多景点通票推荐',
      channel: 'app_popup',
      channelLabel: 'APP 弹窗',
      timing: `用户在逐日行程区连续展开 3 天以上安排时触发（窗口 ${risk.windowMinutes} 分钟）`,
      copyDirection:
        '把"想多打卡"翻译成"买通票更划算"。给出预计打卡点位数量与单买总价，用总价差驱动购买，同时提示预约制景点需提前锁名额。',
      copySample: `你 ${profile.days} 天排了 ${profile.days * 3} 个点位，单买门票合计不低。多景点通票可覆盖其中主要收费点，预计省约 ¥${passPrice}/ 人，热门场馆的预约名额也能提前锁。`,
      hook: `多景点通票立省约 ¥${passPrice}/ 人`,
      objective: '把高密度行程转化为通票成交，提升连带与到场确定性',
    })
  }

  // ── 4) 松弛度假 → 慢节奏权益 ──────────────────────────────
  if (focus.includes('relax') || profile.pace === 'leisure') {
    const spaCoupon = couponValue(profile, 50)
    list.push({
      id: 'iv_relax_upgrade',
      name: '慢节奏体验升级',
      channel: 'in_app_message',
      channelLabel: '站内消息',
      timing: '用户确认行程后的第 1 天晚间推送（慢游客群反感打扰，避开白天）',
      copyDirection:
        '不推更多景点，推"把时间花在体验上"。用温泉、下午茶、延迟退房这类可延长停留的权益，替代"多玩一个点"。',
      copySample: `这趟按慢节奏给你排的，每天只 1 个核心点位，午后留了休息时间。如果想再加点松弛感，可加订温泉 / 下午茶，现在有 ¥${spaCoupon} 抵扣券。`,
      hook: `康养体验 ¥${spaCoupon} 抵扣 + 延迟退房权益`,
      objective: '提升客单价值而非行程密度，匹配慢游客群偏好',
    })
  }

  // ── 5) 美食探店 → 餐饮与本地生活 ──────────────────────────
  if (focus.includes('food_first')) {
    const foodCoupon = couponValue(profile, 40)
    list.push({
      id: 'iv_food_local',
      name: '本地美食地图触达',
      channel: 'in_app_message',
      channelLabel: '站内消息',
      timing: '抵达前一天 / 当天上午推送，配合用餐决策时段',
      copyDirection:
        '以"避开游客餐厅"为核心卖点，给出本地人常去的点位与人均，弱化连锁与品牌，强调真实与性价比。',
      copySample: `${destination}你关注的美食线帮你标好了：避开景区门口的高价店，选了 3 处本地人常去的馆子，人均 ¥30-60。附近还有 ¥${foodCoupon} 餐饮券可用。`,
      hook: `本地美食地图 + ¥${foodCoupon} 餐饮券`,
      objective: '以本地生活内容增强出行确定性与平台粘性',
    })
  }

  // ── 6) 接送配套服务 → 落地服务 ────────────────────────────
  if (focus.includes('pickup_service')) {
    const pickupPrice = 30
    list.push({
      id: 'iv_pickup_service',
      name: '接送配套服务推荐',
      channel: 'app_popup',
      channelLabel: 'APP 弹窗',
      timing: `用户确认交通方案后 / 出发前 24 小时触发（窗口 ${risk.windowMinutes} 分钟）`,
      copyDirection:
        '把接送包装成"落地即安心"，强调价格透明与固定时段，避免机场 / 车站临时打车的排队与溢价焦虑。',
      copySample: `你关注接送配套，帮你把落地这一段也安排好了：${destination}车站 / 机场接送单程约 ¥${pickupPrice}/ 人起，司机出口举牌等，不用现场排队找车。`,
      hook: `接送服务 ¥${pickupPrice}/ 人起 + 出口举牌引导`,
      objective: '补齐落地场景的配套服务，提升整体出行确定性',
    })
  }

  // ── 7) 兜底：按价值导向的通用权益 ─────────────────────────
  if (list.length === 0) {
    const generalCoupon = couponValue(profile, 60)
    list.push({
      id: 'iv_general_first',
      name: '首单权益引导',
      channel: 'app_popup',
      channelLabel: 'APP 弹窗',
      timing: `用户完成行程查看后未产生任何点击时触发（窗口 ${risk.windowMinutes} 分钟）`,
      copyDirection:
        '用户未表达明确关注点，此时不强行推销，用"整趟打包立减"提供无门槛的起步理由，同时引导补充偏好以提高后续匹配度。',
      copySample: `${destination} ${profile.days} 天行程方案已生成，首单立减 ¥${generalCoupon}，酒店、门票、交通通用。再补一下你的住宿偏好，能给你更准的推荐。`,
      hook: `首单立减 ¥${generalCoupon}（全场通用）`,
      objective: '无明确偏好时提供低门槛起步理由，引导补充诉求',
    })
  }

  // ── 通用收口：到站 / 入住后的连带 ─────────────────────────
  const nearPrice = Math.round(
    (pricingBasePerDay(profile) * 0.42 * SEGMENT_VALUE_COEF[profile.segment]) / 10,
  ) * 10
  list.push({
    id: 'iv_arrival_upsell',
    name: '落地连带权益触达',
    channel: 'in_app_message',
    channelLabel: '站内消息',
    timing: '出发当天 / 抵达当天推送，承接行程执行阶段的即时需求',
    copyDirection:
      '行程已定，此时推"执行更顺"的服务而非新景点。用就近住宿、行李寄存、次日早餐这类即时可用权益，降低异地落地的不安全感。',
    copySample: `行程执行中遇到变化随时找我们：${destination}就近当日房 ¥${nearPrice} 起，含行李寄存与次日早餐，支持到店前免费取消。${budgetTier === 'premium' ? '品质档房型可优先安排高楼层。' : ''}`,
    hook: `就近房 ¥${nearPrice} 起 + 行李寄存 + 免费取消`,
    objective: '承接行程执行阶段的临时需求，补充连带转化',
  })

  return list
}

/* =========================================================================
 * 4. 预估效果（策略模拟，非真实业务数据）
 * ========================================================================= */

/** 关注事项 → 基线转化率与可提升空间（原型模拟） */
function estimateEffect(
  profile: TravelerProfile,
  persona: UserPersona,
  risk: RiskAssessment,
): EffectEstimate {
  const focus = profile.focusTags ?? []

  // 基线转化率：由关注点决定的意图强度
  let base = 3.2
  if (focus.includes('pickup_service')) base += 2.6 // 已规划落地细节，意图最强
  if (focus.includes('hotel_location')) base += 1.4
  if (focus.includes('relax')) base += 0.8
  if (focus.includes('deep_play')) base += 0.6
  if (focus.includes('special_stay')) base += 0.4
  if (focus.includes('food_first')) base += 0.2
  if (focus.includes('ticket_deal')) base -= 0.6 // 等促销，转化更慢
  if (focus.includes('save_money')) base -= 1.2 // 反复比价，转化最慢
  if (focus.length === 0) base -= 0.6
  base = Number(Math.max(0.8, base).toFixed(1))

  // 风险越高，可提升空间越大
  const riskGain: Record<RiskLevel, number> = { high: 7.2, mid: 4.4, low: 2.1 }
  let liftPct = riskGain[risk.level]

  // 高价值客群对权益响应更强
  if (persona.valueIndex >= 80) liftPct += 1.6
  else if (persona.valueIndex < 45) liftPct += 0.9

  // 关注点越聚焦，策略命中越准
  if (focus.length === 1) liftPct += 1.2
  else if (focus.length >= 3) liftPct -= 0.6

  // 酒店偏好填写越完整，住宿侧策略越准
  if ((profile.hotelPrefs ?? []).length >= 3) liftPct += 0.8

  // 画像冲突会削弱策略匹配度
  liftPct -= persona.conflicts.length * 0.7
  liftPct = Math.max(1.2, Number(liftPct.toFixed(1)))

  const projectedCvr = Number((base + liftPct).toFixed(2))

  // 增量 GMV 模拟：按实际录入预算 × 转化率差 × 日均触达量假设
  const orderValue = perDayBudget(profile) * profile.days * SEGMENT_VALUE_COEF[profile.segment]
  const dailyReach = 5000
  const incrementalGmv = Math.round((liftPct / 100) * dailyReach * orderValue)

  return {
    liftPct,
    baselineCvr: base,
    projectedCvr,
    incrementalGmv,
    confidence: risk.level === 'high' ? 'high' : 'mid',
    disclaimer:
      '该预估为策略模拟评估，非真实业务数据。基于历史转化率区间与权益响应经验值推演，实际效果需以线上 AB 实验为准。',
  }
}

/* =========================================================================
 * 5. 优先级标注
 * ========================================================================= */

function resolvePriority(risk: RiskAssessment, persona: UserPersona): { priority: Priority; reason: string } {
  if (risk.level === 'high') {
    return {
      priority: 'P0',
      reason: `流失风险评分 ${risk.score}（高风险），达成「高风险优先推送」触发条件，进入 P0 实时干预队列，要求 ${risk.windowMinutes} 分钟内完成触达。`,
    }
  }
  if (risk.level === 'mid') {
    const reason =
      persona.valueIndex >= 70
        ? `流失风险评分 ${risk.score}（中风险），但消费能力指数 ${persona.valueIndex} 偏高，按价值加权提升至 P1 优先队列。`
        : `流失风险评分 ${risk.score}（中风险），进入 P1 常规干预队列，可在 2 小时窗口内批量触达。`
    return { priority: 'P1', reason }
  }
  return {
    priority: 'P2',
    reason: `流失风险评分 ${risk.score}（低风险），用户仍处内容探索期，进入 P2 培育队列，以内容种草与订阅式触达为主，不消耗即时补贴预算。`,
  }
}

/* =========================================================================
 * 6. 构建 Strategy Lab 报告（全部由表单字段自动生成）
 * ========================================================================= */

export function buildStrategyReport(profile: TravelerProfile): StrategyReport {
  const persona = buildPersona(profile)
  const risk = assessRisk(profile, persona)
  const interventions = buildInterventions(profile, risk)
  const effect = estimateEffect(profile, persona, risk)
  const { priority, reason } = resolvePriority(risk, persona)

  return {
    persona,
    risk,
    interventions,
    effect,
    priority,
    priorityReason: reason,
    ruleNote: buildRuleNote(profile),
    generatedAt: new Date().toISOString(),
  }
}

/* =========================================================================
 * 7. 构建游客行程方案
 * ========================================================================= */

/** 酒店与每日游玩点位的通勤便利性评估（原型模拟，基于距离文本与位置特征） */
function commuteForHotel(
  hotel: { name: string; distance: string; highlight: string },
  dailySpots: string[],
): { score: number; note: string } {
  const text = `${hotel.distance}${hotel.highlight}${hotel.name}`

  // 位置质量分：越靠近核心区 / 景区 / 交通枢纽越高
  let score = 58
  if (/步行可达|距.*[0-9]\s*(m|米)/.test(text)) score += 14
  if (/地铁|换乘|交通枢纽|站/.test(text)) score += 12
  if (/景区|湖畔|海景|一线|内/.test(text)) score += 12
  if (/距.*[0-9]+(\.[0-9]+)?\s*km/.test(text)) score += 2
  if (/青年|青旅|床位/.test(text)) score -= 6
  if (/近郊|机场|偏远/.test(text)) score -= 10

  // 有明确核心点位时，按"离第一站近"加成
  if (dailySpots.length > 0 && /步行可达景区|湖畔|景区内/.test(text)) score += 6

  score = Math.max(30, Math.min(98, score))

  let note: string
  if (score >= 85) note = '到主要游玩点位步行或 1 站地铁可达，通勤最省时'
  else if (score >= 70) note = '到主要点位约 10-20 分钟车程，通勤便利'
  else if (score >= 55) note = '到主要点位约 20-35 分钟，通勤一般'
  else note = '到主要点位通勤 35 分钟以上，需要预留路上的时间'

  if (dailySpots.length > 0) {
    note = `${note}（参考点位：${dailySpots[0]}）`
  }
  return { score, note }
}

/** 两个中文串的字符重合度（粗略衡量是否同一片区，忽略通用字） */
function countCharOverlap(a: string, b: string): number {
  if (!a || !b) return 0
  const stop = new Set('的与和及店路区市天第家家酒店附近距约分钟步行可达')
  const setB = new Set([...b].filter((ch) => !stop.has(ch)))
  let n = 0
  for (const ch of new Set(a)) {
    if (!stop.has(ch) && setB.has(ch)) n++
  }
  return n
}

/** 由酒店数据包构造候选（含偏好命中、通勤评分、民宿判定） */
function buildHotelCandidates(
  pack: DestinationPack,
  profile: TravelerProfile,
  perNightBase: number,
  dailySpotNames: string[],
): HotelCandidate[] {
  const prefs = profile.hotelPrefs ?? []
  return pack.hotels.map((h) => {
    const matchedPrefs = prefs
      .filter((p) => hotelMatchesPref(h, p))
      .map((p) => HOTEL_PREF_LABEL[p])
    const { score, note } = commuteForHotel(h, dailySpotNames)
    const isHomestay = /民宿|客栈|院落|青旅/.test(`${h.name}${h.highlight}`)
    return {
      name: h.name,
      tier: SEGMENT_HOTEL_TIER[profile.segment],
      pricePerNight: Math.round((perNightBase * h.tierCoef) / 10) * 10,
      rating: h.rating,
      distance: h.distance,
      highlight: h.highlight,
      rescued: false,
      matchedPrefs,
      commuteScore: score,
      commuteNote: note,
      isHomestay,
    }
  })
}

/**
 * 酒店排序综合权重：
 *   通勤便利性（用户要求"价格 + 到每日游玩点位的通勤便利性"综合权衡）
 *   + 酒店偏好命中数
 *   + 价格与预算的贴近度
 * 「酒店位置优先」时通勤权重加大，「高性价比」时价格权重加大。
 */
function rankHotels(
  hotels: HotelCandidate[],
  profile: TravelerProfile,
  perNightBase: number,
): HotelCandidate[] {
  const focus = profile.focusTags ?? []
  const prefs = profile.hotelPrefs ?? []

  const wCommute = focus.includes('hotel_location') ? 0.5 : 0.34
  const wPref = prefs.length > 0 ? 0.32 : 0.18
  const wPriceBase = prefs.includes('value') || focus.includes('save_money') ? 0.34 : 0.24
  const wRating = Math.max(0, 1 - wCommute - wPref - wPriceBase)

  return [...hotels].sort((a, b) => {
    const s = (h: HotelCandidate) => {
      const prefScore = prefs.length > 0 ? (h.matchedPrefs.length / prefs.length) * 100 : 60
      const priceScore = Math.max(
        0,
        100 - (Math.abs(h.pricePerNight - perNightBase) / Math.max(1, perNightBase)) * 100,
      )
      const ratingScore = (h.rating / 5) * 100
      return (
        h.commuteScore * wCommute +
        prefScore * wPref +
        priceScore * wPriceBase +
        ratingScore * wRating
      )
    }
    return s(b) - s(a)
  })
}

/** 应用游客手动调整的点位（增删改） */
function applySpotOverrides(spots: ItinerarySpot[], overrides: SpotOverride[]): ItinerarySpot[] {
  if (!overrides || overrides.length === 0) return spots
  let result = [...spots]
  for (const ov of overrides) {
    const idx = result.findIndex((s) => s.id === ov.spotId)
    if (ov.removed) {
      if (idx >= 0) result.splice(idx, 1)
      continue
    }
    if (idx >= 0) {
      result[idx] = {
        ...result[idx],
        day: ov.day,
        name: ov.name?.trim() || result[idx].name,
        edited: true,
      }
    }
  }
  // 删空某天后重排，避免出现空白天
  const usedDays = [...new Set(result.map((s) => s.day))].sort((a, b) => a - b)
  const remap = new Map<number, number>()
  usedDays.forEach((d, i) => remap.set(d, i + 1))
  result = result.map((s) => ({ ...s, day: remap.get(s.day) ?? s.day }))
  return result
}

function buildItinerary(profile: TravelerProfile, overrides: SpotOverride[] = []): Itinerary {
  const pack = getPack(profile.destination)
  const days = Math.max(1, Math.min(10, profile.days))

  const interests = profile.interests ?? []
  const focus = profile.focusTags ?? []
  const pace = profile.pace ?? 'flexible'
  const ticketPref: TicketPref = profile.ticketPref ?? 'mixed'
  const pacePlan = PACE_PLAN[pace]

  // ── 景点排序：兴趣命中 + 关注事项命中 双重加权 ──────────────
  const ranked = pack.spots
    .map((s, i) => {
      const interestHits = interests.filter((it) => spotMatchesInterest(s.tag, it)).length
      const focusHits = focus.filter((f) => {
        const keys = FOCUS_SPOT_SYNONYMS[f] ?? []
        return keys.some((k) => s.tag.includes(k))
      }).length
      // 「深度游玩」不挑 tag，整体提升密度；这里只做微调
      const deepBonus = focus.includes('deep_play') ? 0 : 0

      // ── 门票偏好加权：解决「说要少买门票，却给你排了高价演出」的矛盾 ──
      // free：高价票点位大幅降权（¥100 以上基本出局），中价也降权；免费点位加分
      // mixed：仅对 ¥150 以上的高价点位降权，保留 1-2 个核心收费点
      // any：不做处理
      let ticketPenalty = 0
      if (ticketPref === 'free') {
        if (s.ticket === 0) ticketPenalty = 3
        else if (s.ticket <= 60) ticketPenalty = 0
        else if (s.ticket <= 150) ticketPenalty = -4
        else ticketPenalty = -10
      } else if (ticketPref === 'mixed') {
        if (s.ticket === 0) ticketPenalty = 1
        else if (s.ticket > 150) ticketPenalty = -4.5
        else ticketPenalty = 0.5
      }

      // 「门票实惠」关注点：同样把高价点位压下去，避免和 tag 里的优惠意图打架
      if (focus.includes('ticket_deal') && s.ticket >= 200) ticketPenalty -= 2

      return {
        spot: s,
        score: interestHits * 2 + focusHits * 1.5 + deepBonus + ticketPenalty,
        order: i,
      }
    })
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((x) => x.spot)

  const matchedCount = ranked.filter((s) =>
    interests.some((it) => spotMatchesInterest(s.tag, it)),
  ).length

  // ── 按节奏分配每日点位 ────────────────────────────────────
  const spots: ItinerarySpot[] = []
  const maxSpots = ranked.length
  let cursor = 0
  for (let d = 1; d <= days; d++) {
    // 「深度游玩」关注点在均衡/慢游节奏下 +1 个点位（但不超过模板上限 3）
    let perDay = pacePlan.perDay
    if (focus.includes('deep_play') && pace !== 'intensive') perDay = Math.min(3, perDay + 1)
    // 「松弛度假」关注点在均衡节奏下降为 1 个点位
    if (focus.includes('relax') && pace === 'flexible') perDay = 1

    for (let i = 0; i < perDay; i++) {
      if (maxSpots === 0) break
      const src = ranked[cursor % maxSpots]
      cursor++
      const hitInterests = interests.filter((it) => spotMatchesInterest(src.tag, it))
      const hitFocus = focus.filter((f) =>
        (FOCUS_SPOT_SYNONYMS[f] ?? []).some((k) => src.tag.includes(k)),
      )
      const reasons: string[] = [src.reason]
      if (hitInterests.length > 0) {
        reasons.push(`命中你的偏好「${hitInterests.map((it) => INTEREST_LABEL[it]).join('、')}」`)
      }
      if (hitFocus.length > 0) {
        reasons.push(`贴合你「${hitFocus.map((f) => FOCUS_LABEL[f]).join('、')}」的关注点`)
      }
      spots.push({
        id: `s${d}-${i}-${src.name}`,
        name: src.name,
        day: d,
        timeSlot: pacePlan.slots[i % pacePlan.slots.length],
        durationHrs: src.hrs,
        reason: reasons.join('；'),
        ticket: src.ticket,
        tag: src.tag,
      })
    }
  }

  // 游客手动调整点位（修改后重新匹配酒店）
  const finalSpots = applySpotOverrides(spots, overrides)
  const effectiveDays = finalSpots.length > 0
    ? Math.max(...finalSpots.map((s) => s.day))
    : days

  // 每日首个点位名，用于酒店通勤评估
  const dailySpotNames = [...new Set(finalSpots.map((s) => s.name))].slice(0, 4)

  // ── 酒店候选（含偏好命中 + 通勤评分） ──────────────────────
  const perNightBase = pricingBasePerDay(profile) * 0.45 * SEGMENT_VALUE_COEF[profile.segment]
  const candidates = buildHotelCandidates(pack, profile, perNightBase, dailySpotNames)
  const rankedHotels = rankHotels(candidates, profile, perNightBase)

  // ── 两种酒店方案 ───────────────────────────────────────────
  const sameHotel: HotelCandidate[] = [
    { ...rankedHotels[0], rescued: profile.hotelPrefs.includes('in_scenic') },
    ...rankedHotels.slice(1, 3).map((h) => ({ ...h, rescued: false })),
  ]
  const sameHotelCost = rankedHotels[0].pricePerNight * Math.max(1, effectiveDays - 1)

  // 随行更换：按"到当日点位最近"给每天配一家，已用过的酒店降权，避免连住变味
  const followRoute: HotelCandidate[] = []
  const usedNames = new Set<string>()
  for (let d = 1; d <= effectiveDays; d++) {
    const daySpots = finalSpots.filter((s) => s.day === d)
    const refs = daySpots.map((s) => s.name)
    const scored = candidates.map((h) => {
      const c = commuteForHotel(h, refs.length > 0 ? refs : dailySpotNames)
      // 当日点位与酒店文案的字符重合度：粗略衡量"是否同一片区"
      const overlap = countCharOverlap(refs.join(''), `${h.name}${h.highlight}${h.distance}`)
      // 已用过 → 显著降权，鼓励每天换一家
      const reusePenalty = usedNames.has(h.name) ? 45 : 0
      return { h, score: c.score + overlap * 3 - reusePenalty, note: c.note }
    })
    scored.sort((a, b) => b.score - a.score)
    const best = scored.find((s) => !usedNames.has(s.h.name)) ?? scored[0]
    usedNames.add(best.h.name)
    followRoute.push({
      ...best.h,
      commuteScore: best.score,
      commuteNote: best.note,
      stayRange: effectiveDays <= 1 ? '当晚' : `第 ${d} 天`,
      rescued: false,
    })
  }
  const followRouteCost = followRoute.reduce((s, h) => s + h.pricePerNight, 0)

  // 连住 vs 随行更换：按关注点决定推荐
  const preferSame =
    profile.hotelPrefs.includes('quiet_resort') ||
    profile.hotelPrefs.includes('in_scenic') ||
    focus.includes('relax') ||
    profile.segment === 'elder' ||
    profile.segment === 'family' ||
    relaxHeavy(profile)
  const sameReason = preferSame
    ? `你的关注点（${[
        profile.hotelPrefs.includes('quiet_resort') ? '安静度假' : '',
        profile.hotelPrefs.includes('in_scenic') ? '景区内住宿' : '',
        focus.includes('relax') ? '松弛度假' : '',
        profile.segment === 'elder' ? '带长辈' : '',
        profile.segment === 'family' ? '带娃' : '',
      ].filter(Boolean).join('、')}）更看重稳定与省心，连住同一家不用反复搬行李`
    : '连住的总价通常更低，且省去中途退房入住的时间成本'
  const followReason = preferSame
    ? '每天住得离当日点位更近，减少通勤时间，但需要多搬几次行李'
    : `你的关注点更看重"到点位的通勤效率"，随行更换能让每天少花 20-40 分钟在路上`

  const hotelPlans: HotelPlan[] = [
    {
      mode: 'same_hotel',
      title: '全程同酒店连住',
      description: `全程住在【${rankedHotels[0].name}】，一次入住、零搬行李`,
      reason: sameReason,
      hotels: sameHotel,
      totalCost: sameHotelCost,
      tradeoff:
        followRouteCost > sameHotelCost
          ? `比随行更换省约 ¥${followRouteCost - sameHotelCost}`
          : `比随行更换贵约 ¥${sameHotelCost - followRouteCost}，但省去搬行李`,
    },
    {
      mode: 'follow_route',
      title: '跟随行程更换就近酒店',
      description: `按每天的点位就近安排，共 ${followRoute.length} 段住宿`,
      reason: followReason,
      hotels: followRoute,
      totalCost: followRouteCost,
      tradeoff:
        sameHotelCost > followRouteCost
          ? `比全程连住省约 ¥${sameHotelCost - followRouteCost}，通勤时间也更短`
          : `比全程连住贵约 ¥${followRouteCost - sameHotelCost}，但每天离点位更近`,
    },
  ]

  // 每家酒店挂 5 个房型：前端默认只展示 2 个，其余折叠，避免信息过载
  for (const p of hotelPlans) {
    p.hotels = p.hotels.map((h) => ({ ...h, rooms: buildHotelRooms(h, profile) }))
  }

  // 默认酒店列表：取推荐方案下的酒店
  const recommendedPlan = preferSame ? hotelPlans[0] : hotelPlans[1]
  const hotels = recommendedPlan.hotels.map((h, i) => ({ ...h, rescued: i === 0 && preferSame }))

  // ── 交通：跨城方案为绝对重点，市内通勤降为辅助说明 ────────
  const transportPlan = buildTransportPlan(profile)
  const transport: TransportOption[] = [
    {
      mode: transportPlan.recommendedMode,
      route: `${transportPlan.origin} → ${profile.destination}`,
      duration:
        transportPlan.options.find((o) => o.mode === transportPlan.recommendedMode)?.duration ??
        '按实际班次为准',
      cost: transportPlan.recommendedRoundTrip,
      note: '为往返单人合计，原型模拟测算，出行前请以官方渠道为准',
    },
    // 到站 → 酒店的落地接驳（关注接送配套时给出具体服务）
    ...(focus.includes('pickup_service')
      ? [
          {
            mode: '接送站 / 接送机',
            route: `${profile.destination}站 / 机场 → 酒店`,
            duration: '约 20-50 分钟',
            cost: 30,
            note: '你关注接送配套，已按出口举牌引导 + 固定价格安排，避免现场排队',
          },
        ]
      : []),
    // 市内点位间通勤：仅作为简要提示（不再是重点）
    {
      mode: '市内交通（点位间）',
      route: '酒店 ⇄ 各游玩点位',
      duration: pack.localTransport[0]?.duration ?? '单程 20 分钟',
      cost: pack.localTransport[0]?.cost ?? 8,
      note: '按你的点位排布估算，这部分已不是本次规划重点，实际可按当天路线灵活选择',
    },
  ]

  // ── 优惠建议（按关注事项动态生成） ─────────────────────────
  const coupons: CouponSuggestion[] = []
  const cheapestOpt = transportPlan.options.reduce(
    (a, b) => (b.roundTripPrice < a.roundTripPrice ? b : a),
    transportPlan.options[0],
  )
  if (!transportPlan.distanceKm && transportPlan.distanceKm !== 0) {
    /* noop */
  }
  if (focus.includes('save_money')) {
    coupons.push(
      {
        name: '跨城交通立减券',
        value: `¥${couponValue(profile, 60)}`,
        condition: `单人往返满 ¥${Math.max(100, transportPlan.recommendedRoundTrip)} 可用`,
        appliesTo: `高铁 / 飞机 / 大巴 / 中转联程全适用，中转联程两段可各用一张`,
      },
      {
        name: '中转联程专属券',
        value: `¥${couponValue(profile, 40)}`,
        condition: '下单含中转的联程方案',
        appliesTo: `最省的「${cheapestOpt.mode}」可用，进一步压低总价`,
      },
    )
  }
  if (focus.includes('ticket_deal')) {
    coupons.push(
      {
        name: '门票打包立减',
        value: `¥${couponValue(profile, 45)}`,
        condition: '门票 + 接送 + 讲解打包下单',
        appliesTo: '本趟行程内的收费景点可用',
      },
      {
        name: '多景点通票',
        value: `省约 ${Math.round((couponValue(profile, 55) / Math.max(1, finalSpots.reduce((s, x) => s + x.ticket, 0))) * 100)}%`,
        condition: `${Math.min(3, effectiveDays)} 个以上收费景点同时购买`,
        appliesTo: '覆盖行程中的主要收费点位',
      },
    )
  }
  if (focus.includes('hotel_location') || focus.includes('special_stay')) {
    coupons.push({
      name: profile.hotelPrefs.includes('in_scenic') ? '景区内住宿券' : '住宿无门槛券',
      value: `¥${couponValue(profile, 70)}`,
      condition: '预订本页推荐的酒店',
      appliesTo: `已按你的酒店偏好（${(profile.hotelPrefs ?? []).map((p) => HOTEL_PREF_LABEL[p]).join('、') || '位置优先'}）筛过的房源`,
    })
  }
  if (focus.includes('food_first')) {
    coupons.push({
      name: '本地餐饮券',
      value: `¥${couponValue(profile, 40)}`,
      condition: '合作本地餐厅可用',
      appliesTo: '行程中标注的本地美食点位周边',
    })
  }
  if (focus.includes('pickup_service')) {
    coupons.push({
      name: '接送服务券',
      value: `¥${couponValue(profile, 25)}`,
      condition: '提前 24 小时预约接送',
      appliesTo: '车站 / 机场 ⇄ 酒店接送服务',
    })
  }
  if (focus.includes('deep_play')) {
    coupons.push({
      name: '多景点通票立减',
      value: `¥${couponValue(profile, 55)}`,
      condition: `通票覆盖 ≥ 3 个收费点位`,
      appliesTo: `你 ${effectiveDays} 天的行程点位可打包使用`,
    })
  }
  if (focus.includes('relax')) {
    coupons.push({
      name: '康养体验抵扣券',
      value: `¥${couponValue(profile, 50)}`,
      condition: '温泉 / SPA / 下午茶等体验类订单',
      appliesTo: '行程中的康养类点位',
    })
  }

  // 通用优惠（面额按预算档位与客群动态生成，不写死）
  coupons.push({
    name: '新客首单立减',
    value: `¥${couponValue(profile, 30)}`,
    condition: '平台首单，无门槛',
    appliesTo: '酒店、门票、交通通用（择优一项使用）',
  })

  // ── 预算汇总 ──────────────────────────────────────────────
  const perPersonBudget = Math.round(perDayBudget(profile) * days * SEGMENT_VALUE_COEF[profile.segment])
  const totalBudget = perPersonBudget

  const ticketTotal = finalSpots.reduce((s, x) => s + x.ticket, 0)
  const hotelTotal = recommendedPlan.totalCost
  const intercityTotal = transportPlan.recommendedRoundTrip
  const localTransportTotal = transport
    .filter((t) => t.cost > 0 && t.mode !== transportPlan.recommendedMode && !t.mode.startsWith('市内交通'))
    .reduce((s, t) => s + t.cost, 0) * 2
  const transportTotal = intercityTotal + localTransportTotal
  const foodTotal = Math.max(0, totalBudget - ticketTotal - hotelTotal - transportTotal)

  const budgetBreakdown = [
    { item: '住宿', amount: hotelTotal },
    { item: '跨城往返交通', amount: intercityTotal },
    { item: '门票 / 体验项目', amount: ticketTotal },
    { item: '市内交通与落地服务', amount: localTransportTotal },
    { item: '餐饮与其他', amount: foodTotal },
  ]

  const budgetRangeLabel =
    profile.budgetMin === profile.budgetMax
      ? `每日人均 ¥${profile.budgetMin}`
      : `每日人均 ¥${profile.budgetMin}-${profile.budgetMax}`

  const headline = `${profile.destination} · ${days} 天 ${SEGMENT_LABEL[profile.segment]}行程方案`
  const interestSummary =
    interests.length > 0
      ? `其中 ${matchedCount} 个景点命中你勾选的偏好（${interests.map((it) => INTEREST_LABEL[it]).join('、')}），已优先排进前面几天。`
      : ''
  const focusSummary =
    focus.length > 0
      ? `已按你「${focus.map((f) => FOCUS_LABEL[f]).join('；')}」的关注点排布节奏与酒店。`
      : ''
  const customPref = (profile.customPreference ?? '').trim()
  const customFocus = (profile.customFocus ?? '').trim()
  const customSummary = customPref ? `已参考你的补充诉求「${customPref}」。` : ''
  const customFocusSummary = customFocus ? `并特别照顾你「${customFocus}」这个关注点。` : ''
  const paceSummary = `节奏按「${PACE_LABEL[pace]}」安排：${pacePlan.note}。`
  const summary = `按你设定的预算（${budgetRangeLabel}）配置，这趟人均约 ¥${perPersonBudget}。${paceSummary}${focusSummary}${interestSummary}${customSummary}${customFocusSummary}行程从「${finalSpots[0]?.name ?? '市区核心区'}」开始。`

  // ── 出行贴士 ──────────────────────────────────────────────
  const tips = [...pack.tips]
  const SEGMENT_TIP: Partial<Record<TravelerSegment, string>> = {
    solo: '一个人出行建议把行程排松一些，每天留半天自由安排',
    couple: '两个人的行程可以把傍晚留给夜景或散步，白天集中玩重点',
    honeymoon: '纪念日行程建议提前备注布置需求，酒店一般可免费协助安排',
    friends: '朋友出行人多意见杂，建议每天只定 1 个必去点，其余行程现场商量',
    family: '带孩子建议每天只安排 1-2 个主景点，午后留出休息时间',
    elder: '陪同长辈建议优先选择电梯房低楼层，单日步行控制在 2 小时以内',
    student: '学生出行多用学生证购票，多数景区可享半价优惠',
    business: '商务行程可在主景点后预留 1 小时机动时间，便于衔接日程变动',
    team: '团队出行建议提前统一房间标准，并预留 1-2 间机动房应对临时变动',
  }
  if (SEGMENT_TIP[profile.segment]) tips.unshift(SEGMENT_TIP[profile.segment]!)

  if (pacePlan.restNote) tips.unshift(`${PACE_LABEL[pace]}节奏：${pacePlan.restNote}`)
  if (focus.includes('save_money')) {
    tips.unshift(
      `你关注省钱：跨城交通建议优先看「中转联程」，两段可分别用券；此外提前 21 天以上订票通常能再省 15%-30%。`,
    )
  }
  if (focus.includes('hotel_location')) {
    tips.unshift(`你关注酒店位置：下面推荐的酒店已按"到每日点位的通勤时间"排序，位置分高的排前面。`)
  }
  if (focus.includes('special_stay')) {
    tips.unshift(`你偏好特色住宿：已优先列出地方民宿与景区内房源，注意这类房型通常不可免费取消。`)
  }
  if (focus.includes('food_first')) {
    tips.unshift(`你以美食为主：行程里的餐饮点位集中在本地人常去的街区，避开景区门口的高价店。`)
  }
  if (focus.includes('pickup_service')) {
    tips.unshift(`你关注接送配套：建议落地前 24 小时预约接送，价格固定且免排队，比现场打车更稳。`)
  }
  if (focus.includes('deep_play')) {
    tips.unshift(`你关注多打卡：${finalSpots.length} 个点位里有多处需要预约，建议行前 3-5 天先锁名额。`)
  }
  if (focus.includes('ticket_deal')) {
    tips.unshift(`你关注门票优惠：收费景点合计约 ¥${ticketTotal}，买打包票 / 通票通常比单买省一截。`)
  }
  if (interests.length > 0) {
    tips.unshift(
      `你标注的兴趣偏好是「${interests.map((it) => INTEREST_LABEL[it]).join('、')}」，排在前面的景点已优先照顾这些偏好，后面几天如果时间紧，可以先跳过没命中的那几个。`,
    )
  }
  if (customPref) tips.unshift(`你提到的「${customPref}」，可以在预订酒店或门票时备注给商家确认`)
  if (customFocus) tips.unshift(`你补充的关注点「${customFocus}」，已体现在行程节奏与酒店筛选上`)

  const focusLabels = focus.map((f) => FOCUS_LABEL[f])
  const hotelPrefLabels = (profile.hotelPrefs ?? []).map((p) => HOTEL_PREF_LABEL[p])

  const notices = buildVisitorNotices(profile, hotels, coupons, finalSpots, hotelPlans)

  return {
    headline,
    summary,
    overview: {
      origin: transportPlan.origin,
      destination: profile.destination,
      days,
      segmentLabel: SEGMENT_LABEL[profile.segment],
      budgetLabel: BUDGET_LABEL[profile.budgetTier],
      budgetRangeLabel,
      perPersonBudget,
      totalBudget,
      interestLabels: interests.map((it) => INTEREST_LABEL[it]),
      customPreference: customPref,
      focusLabels,
      customFocus,
      paceLabel: PACE_LABEL[pace],
      hotelPrefLabels,
    },
    notices,
    spots: finalSpots,
    hotels,
    hotelPlans,
    transport,
    transportPlan,
    coupons,
    tips,
    budgetBreakdown,
  }
}

/**
 * 为一家酒店生成房型候选（原型模拟）。
 * 共 5 个房型，按价格从低到高；前端默认展示前两个（最低价 + 推荐款），其余点开再看。
 */
function buildHotelRooms(h: HotelCandidate, profile: TravelerProfile): HotelRoomOption[] {
  const base = h.pricePerNight
  const withBreakfast = profile.hotelPrefs.includes('breakfast')
  const bedLabel = profile.segment === 'solo' ? '大床 1.8m' : '双床 1.2m×2'
  const tierRooms: { name: string; multiplier: number; feature: string }[] = [
    { name: '标准间', multiplier: 1, feature: `${bedLabel} · 20㎡ · 不含早 · 可免费取消` },
    {
      name: withBreakfast ? '含早标准间' : '舒适大床房',
      multiplier: 1.12,
      feature: withBreakfast ? `${bedLabel} · 22㎡ · 含双早 · 可免费取消` : `${bedLabel} · 24㎡ · 高楼层 · 不含早`,
    },
    { name: '高级景观房', multiplier: 1.28, feature: `可看${h.isHomestay ? '庭院' : '城景或山景'} · 28㎡ · 含双早` },
    { name: '家庭房', multiplier: 1.55, feature: `1 张大床 + 1 张单人床 · 35㎡ · 含双早 · 适合带娃` },
    { name: '套房', multiplier: 1.95, feature: `独立客厅 · 45㎡ · 含双早 · 延迟退房至 14:00` },
  ]
  return tierRooms.map((r) => {
    const price = Math.round((base * r.multiplier) / 10) * 10
    return {
      name: r.name,
      pricePerNight: price,
      priceNote: price === base ? '该店最低价' : `比最低价贵 ¥${price - base}`,
      feature: r.feature,
    }
  })
}

/** 判断是否为"重度松弛诉求"的辅助函数 */
function relaxHeavy(profile: TravelerProfile): boolean {
  const f = profile.focusTags ?? []
  return f.includes('relax') && f.length <= 2
}

/* =========================================================================
 * 8. 面向游客本人的提示（第二人称，APP 内通知口吻）
 * ========================================================================= */

function buildVisitorNotices(
  profile: TravelerProfile,
  _hotels: HotelCandidate[],
  coupons: CouponSuggestion[],
  spots: ItinerarySpot[],
  hotelPlans: HotelPlan[],
): VisitorNotice[] {
  const { destination, days, segment } = profile
  const focusTags = profile.focusTags ?? []
  const pace = profile.pace ?? 'flexible'
  void segment
  const notices: VisitorNotice[] = []

  // 1. 行程已就绪
  const focusText = focusTags.length > 0
    ? `围绕「${focusTags.map((f) => FOCUS_LABEL[f]).join('、')}」`
    : '按你的预算与偏好'
  notices.push({
    id: 'nt_welcome',
    kind: 'welcome',
    title: `${destination} ${days} 天行程已就绪`,
    body: `${focusText}、按「${PACE_LABEL[pace]}」排了 ${spots.length} 个点位，酒店已按价格和通勤匹配好。`,
    action: '看行程安排',
  })

  // 2. 优惠券
  if (coupons.length > 0) {
    notices.push({
      id: 'nt_coupon',
      kind: 'deal',
      title: `${coupons.length} 个优惠可用`,
      body: `「${coupons.slice(0, 2).map((c) => c.name).join('」「')}」等可直接叠加，明细在优惠区。`,
      action: '看优惠',
    })
  }

  // 3. 酒店权衡
  const same = hotelPlans.find((p) => p.mode === 'same_hotel')
  const follow = hotelPlans.find((p) => p.mode === 'follow_route')
  if (same && follow) {
    const gap = Math.abs(same.totalCost - follow.totalCost)
    notices.push({
      id: 'nt_hotel_choice',
      kind: 'tip',
      title: '酒店两种排法怎么选',
      body: `连住 ¥${same.totalCost} 不搬行李；换着住 ¥${follow.totalCost} 离景点更近，差价约 ¥${gap}。`,
      action: '对比酒店',
    })
  }

  // 4. 出发前注意
  notices.push({
    id: 'nt_reminder',
    kind: 'reminder',
    title: '出发前注意',
    body: '热门景点提前预约；交通耗时为估算值，留些余量；点位可改，改完酒店自动重匹配。',
    action: '看贴士',
  })

  return notices
}

/* =========================================================================
 * 出口：完整分析
 * ========================================================================= */

export function analyze(req: AnalyzeRequest): AnalyzeResponse {
  const profile = req as TravelerProfile
  const strategyLab = buildStrategyReport(profile)
  const itinerary = buildItinerary(profile, req.spotOverrides ?? [])

  return { ok: true, profile, itinerary, strategyLab }
}

/* =========================================================================
 * 入参校验
 * ========================================================================= */

export const SEGMENTS: TravelerSegment[] = [
  'solo', 'couple', 'honeymoon', 'friends', 'family', 'elder', 'student', 'business', 'team',
]
export const BUDGETS: BudgetTier[] = ['economy', 'comfort', 'premium']
export const BUDGET_MODES: BudgetMode[] = ['range', 'input']

/** 单日人均预算允许区间（元），0 表示可接受零预算 / 穷游 */
const PER_DAY_MIN = 0
const PER_DAY_MAX = 10000

export function validateProfile(body: unknown): { ok: true; value: TravelerProfile } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: '请求体不能为空' }
  const b = body as Record<string, unknown>

  const destination = typeof b.destination === 'string' ? b.destination.trim() : ''
  if (!destination) return { ok: false, error: '请填写出行目的地' }
  if (destination.length > 20) return { ok: false, error: '目的地名称过长' }

  // 出发地：选填，缺省视为本地出发
  const origin = typeof b.origin === 'string' ? b.origin.trim().slice(0, 20) : ''

  const days = Number(b.days)
  if (!Number.isFinite(days) || days < 1 || days > 10) return { ok: false, error: '出行天数需在 1-10 天之间' }

  const segment = b.segment as TravelerSegment
  if (!SEGMENTS.includes(segment)) return { ok: false, error: '出行人群类型取值非法' }

  // 本次出行最关注事项：多选，非法值过滤，去重，上限 MAX_FOCUS
  const rawFocus = Array.isArray(b.focusTags) ? b.focusTags : []
  const focusSet = new Set<FocusTag>()
  for (const f of rawFocus) {
    if (FOCUSES.includes(f as FocusTag)) focusSet.add(f as FocusTag)
  }
  const focusTags = [...focusSet].slice(0, MAX_FOCUS)

  // 自定义出行关注点：选填，限长
  const customFocus = typeof b.customFocus === 'string' ? b.customFocus.trim().slice(0, 100) : ''

  // 行程节奏：默认自由随机
  const pace = (PACE_LABEL[b.pace as TravelPace] ? (b.pace as TravelPace) : 'flexible') as TravelPace

  // 酒店偏好：多选，非法值过滤，去重
  const rawPrefs = Array.isArray(b.hotelPrefs) ? b.hotelPrefs : []
  const prefSet = new Set<HotelPrefTag>()
  for (const p of rawPrefs) {
    if (HOTEL_PREFS.includes(p as HotelPrefTag)) prefSet.add(p as HotelPrefTag)
  }
  const hotelPrefs = [...prefSet]

  // 门票偏好：单选，默认「搭着买」
  const ticketPref: TicketPref = TICKET_PREFS.includes(b.ticketPref as TicketPref)
    ? (b.ticketPref as TicketPref)
    : 'mixed'

  // 兴趣偏好：可多选，非法值过滤，去重，上限 MAX_INTERESTS
  const rawInterests = Array.isArray(b.interests) ? b.interests : []
  const interestSet = new Set<InterestTag>()
  for (const it of rawInterests) {
    if (INTERESTS.includes(it as InterestTag)) interestSet.add(it as InterestTag)
  }
  const interests = [...interestSet].slice(0, MAX_INTERESTS)

  // 自定义偏好：选填，限长
  const customPreference =
    typeof b.customPreference === 'string' ? b.customPreference.trim().slice(0, 100) : ''

  // 预算：两种录入方式，统一归一化为每日人均区间
  const budgetMode = (BUDGET_MODES.includes(b.budgetMode as BudgetMode) ? b.budgetMode : 'range') as BudgetMode

  let budgetMin: number
  let budgetMax: number

  if (budgetMode === 'input') {
    // 直接输入总预算（元）→ 折算为每日人均（允许 0 表示零预算 / 穷游）
    const total = Number(b.budgetTotal)
    if (!Number.isFinite(total) || total < 0) return { ok: false, error: '请输入有效的总预算金额' }
    const perDay = Math.round(total / days)
    if (perDay > PER_DAY_MAX) {
      return { ok: false, error: `折算后每日人均预算需不超过 ¥${PER_DAY_MAX}` }
    }
    budgetMin = perDay
    budgetMax = perDay
  } else {
    // 区间滑动：直接给每日人均下限与上限
    const min = Number(b.budgetMin)
    const max = Number(b.budgetMax)
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { ok: false, error: '请选择预算区间' }
    budgetMin = Math.max(PER_DAY_MIN, Math.min(PER_DAY_MAX, Math.round(Math.min(min, max))))
    budgetMax = Math.max(PER_DAY_MIN, Math.min(PER_DAY_MAX, Math.round(Math.max(min, max))))
  }

  const budgetTier = deriveBudgetTier(Math.round((budgetMin + budgetMax) / 2))

  return {
    ok: true,
    value: {
      origin, destination, days, budgetMode, budgetMin, budgetMax, budgetTier,
      segment, interests, customPreference,
      focusTags, customFocus, pace, hotelPrefs, ticketPref,
    },
  }
}
