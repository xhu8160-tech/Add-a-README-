/**
 * Travel Growth Copilot — 领域类型定义
 *
 * 双层用户模型：
 *  - 游客侧：itinerary（可见行程方案）
 *  - 运营侧：strategyLab（策略实验室后台报告）
 *
 * 注意：本模块所有外部信息（天气 / 库存 / 价格 / 交通班次）均为业务原型模拟，
 * 不接入任何真实第三方接口。
 */

/** 出行人群类型 */
export type TravelerSegment =
  | 'solo'          // 独自旅行
  | 'couple'        // 情侣出行
  | 'honeymoon'     // 蜜月 / 纪念日
  | 'friends'       // 朋友结伴
  | 'family'        // 家庭（带娃）
  | 'elder'         // 带父母 / 长辈
  | 'student'       // 学生出行
  | 'business'      // 商务差旅
  | 'team'          // 团队 / 团建

/** 预算档位（由预算区间推导，用于内部定价与权益匹配） */
export type BudgetTier = 'economy' | 'comfort' | 'premium'

/** 预算录入方式 */
export type BudgetMode = 'range' | 'input'

/** 游客当前浏览行为（已废弃，保留类型以兼容历史代码路径） */
export type BrowseBehavior =
  | 'hotel_browse_no_order'
  | 'scenic_detail'
  | 'arrived_station'
  | 'transport_compare'
  | 'ticket_browse'
  | 'cart_abandoned'

/**
 * 门票 / 花费结构偏好（单选）——直接决定景点筛选时如何对待收费点位
 * free：只去免费或低价点位；mixed：免费为主、适当安排 1-2 个收费核心景点；any：不限
 */
export type TicketPref = 'free' | 'mixed' | 'any'

/**
 * 本次出行最关注事项（可多选）
 * 取代原「你现在正在做什么」浏览行为单选，作为行程 / 交通 / 酒店方案的输入条件。
 */
export type FocusTag =
  | 'save_money'        // 优先省钱，寻找低价中转交通方案
  | 'hotel_location'    // 酒店位置优先，出行便利第一
  | 'deep_play'         // 深度游玩，打卡尽可能多景点
  | 'relax'             // 松弛度假，减少赶路
  | 'special_stay'      // 特色住宿体验，优先民宿 / 景区内住宿
  | 'food_first'        // 美食探店为主
  | 'ticket_deal'       // 关注门票优惠与打包套票
  | 'pickup_service'    // 关注接送机、接送站配套服务

/** 行程节奏（单选） */
export type TravelPace =
  | 'intensive'   // 特种兵模式
  | 'leisure'     // 懒人慢游
  | 'flexible'    // 自由随机

/** 酒店偏好标签（可多选） */
export type HotelPrefTag =
  | 'near_transit'      // 靠近公共交通
  | 'in_scenic'         // 景区内住宿
  | 'value'             // 高性价比
  | 'breakfast'         // 含早餐
  | 'airport_shuttle'   // 接机 / 送机
  | 'meal_plan'         // 包餐服务
  | 'local_民宿'        // 地方特色民宿
  | 'hygiene'           // 卫生优选
  | 'quiet_resort'      // 安静度假

/** 酒店方案模式 */
export type HotelPlanMode = 'same_hotel' | 'follow_route'

/** 出行兴趣偏好（可多选） */
export type InterestTag =
  | 'nature'          // 自然生态
  | 'heritage'        // 历史古迹
  | 'art_museum'      // 艺术文博
  | 'urban_shopping'  // 城市商业
  | 'hiking'          // 户外徒步
  | 'food_tour'       // 美食探店
  | 'hidden_village'  // 小众村落
  | 'wellness'        // 休闲康养
  | 'theme_park'      // 主题乐园
  | 'seaside'         // 滨海风光

/** 流失风险等级 */
export type RiskLevel = 'high' | 'mid' | 'low'

/** 策略优先级 */
export type Priority = 'P0' | 'P1' | 'P2'

/** 推荐触达渠道 */
export type Channel = 'app_popup' | 'in_app_message'

/** 游客基础出行信息 */
export interface TravelerProfile {
  /** 出发地（可与目的地相同表示本地出发） */
  origin: string
  destination: string
  days: number
  /** 预算录入方式：range=区间滑动条，input=直接输入金额 */
  budgetMode: BudgetMode
  /** 每日人均预算下限（元），两种模式均会归一化到此字段 */
  budgetMin: number
  /** 每日人均预算上限（元），input 模式下等于 budgetMin */
  budgetMax: number
  /** 由预算区间推导的档位，用于内部定价与权益匹配 */
  budgetTier: BudgetTier
  segment: TravelerSegment
  /** 兼容字段：历史行为信号，已不再由用户选择，保留以便审计 */
  behavior?: BrowseBehavior
  /** 本次出行最关注事项（可多选） */
  focusTags: FocusTag[]
  /** 自定义出行关注点（选填） */
  customFocus: string
  /** 行程节奏（单选） */
  pace: TravelPace
  /** 酒店偏好标签（可多选） */
  hotelPrefs: HotelPrefTag[]
  /** 门票偏好：决定是否排收费景点 */
  ticketPref: TicketPref
  /** 出行兴趣偏好（可多选，最多 5 个） */
  interests: InterestTag[]
  /** 自定义偏好：游客自由输入的文字描述（选填） */
  customPreference: string
}

/** 动态用户标签 */
export interface DynamicTag {
  code: string
  label: string
  /** 标签来源：基础信息 / 关注事项 / 兴趣偏好 / 冲突修正 */
  source: 'base' | 'focus' | 'interest' | 'conflict'
  weight: number
}

/** 画像冲突记录 */
export interface ProfileConflict {
  /** 原画像假设 */
  from: string
  /** 更新后的画像 */
  to: string
  /** 变化原因 */
  reason: string
}

/** 用户画像 */
export interface UserPersona {
  tags: DynamicTag[]
  summary: string
  conflicts: ProfileConflict[]
  /** 消费能力指数 0-100 */
  valueIndex: number
  /** 决策阶段：认知 / 比较 / 决策 / 临门 */
  decisionStage: string
}

/** 流失风险判定 */
export interface RiskAssessment {
  level: RiskLevel
  score: number
  reasons: string[]
  /** 关键挽留窗口 */
  windowMinutes: number
}

/** 干预策略 */
export interface Intervention {
  id: string
  name: string
  channel: Channel
  channelLabel: string
  /** 触达时机 */
  timing: string
  /** 具体文案方向 */
  copyDirection: string
  /** 文案示例（原型模拟） */
  copySample: string
  /** 权益 / 钩子 */
  hook: string
  /** 运营目标 */
  objective: string
}

/** 预估效果 */
export interface EffectEstimate {
  /** 转化提升幅度（百分点） */
  liftPct: number
  /** 基线转化率 */
  baselineCvr: number
  /** 预估转化率 */
  projectedCvr: number
  /** 预估增量 GMV（元，原型模拟） */
  incrementalGmv: number
  /** 置信度 */
  confidence: 'high' | 'mid'
  disclaimer: string
}

/** 策略实验室报告 */
export interface StrategyReport {
  persona: UserPersona
  risk: RiskAssessment
  interventions: Intervention[]
  effect: EffectEstimate
  priority: Priority
  priorityReason: string
  /** 自动推理依据说明（不再依赖用户手动选择浏览行为） */
  ruleNote: string
  generatedAt: string
}

/** 游客对行程点位的手动调整（用于重新匹配酒店） */
export interface SpotOverride {
  spotId: string
  day: number
  name?: string
  /** true 表示删除该点位 */
  removed?: boolean
}

/** 行程方案 - 景点 */
export interface ItinerarySpot {
  /** 稳定的点位标识，用于前端手动增删改后重新匹配酒店 */
  id: string
  name: string
  /** 第几天 */
  day: number
  timeSlot: string
  durationHrs: number
  reason: string
  ticket: number
  tag: string
  /** 是否为游客手动添加 / 调整过的点位 */
  edited?: boolean
}

/** 行程方案 - 酒店候选 */
export interface HotelCandidate {
  name: string
  tier: string
  pricePerNight: number
  rating: number
  distance: string
  highlight: string
  /** 是否为当前挽留目标酒店 */
  rescued: boolean
  /** 命中的酒店偏好标签文案 */
  matchedPrefs: string[]
  /** 到每日游玩点位的通勤便利性评分 0-100 */
  commuteScore: number
  /** 通勤便利性说明 */
  commuteNote: string
  /** 适配天数（随行更换方案专用，如「第 2-3 天」） */
  stayRange?: string
  /** 是否为地方特色民宿 */
  isHomestay: boolean
  /** 该酒店的房型选项，前两个为重点推荐，其余折叠 */
  rooms?: HotelRoomOption[]
}

/**
 * 酒店房型候选（同一家酒店下的不同房型）
 * 前端默认只展示前两个，其余点开再看，避免信息过载。
 */
export interface HotelRoomOption {
  name: string
  /** 该房型每晚价格（元） */
  pricePerNight: number
  /** 相对该酒店价格最低房型的差价说明，如「比最低价贵 ¥60」 */
  priceNote: string
  /** 房型特点：面积 / 床型 / 早餐 / 可否取消等，一到两句 */
  feature: string
}

/** 酒店推荐方案（两种：全程连住 / 随行程更换） */
export interface HotelPlan {
  mode: HotelPlanMode
  /** 方案标题 */
  title: string
  /** 方案说明 */
  description: string
  /** 推荐该方案的理由 */
  reason: string
  /** 该方案下的酒店列表 */
  hotels: HotelCandidate[]
  /** 全程住宿合计（元） */
  totalCost: number
  /** 相对另一种方案的差额说明 */
  tradeoff: string
}

/** 行程方案 - 交通 */
export interface TransportOption {
  mode: string
  route: string
  duration: string
  cost: number
  note: string
}

/** 行程方案 - 优惠 */
export interface CouponSuggestion {
  name: string
  value: string
  condition: string
  /** 适用场景 */
  appliesTo: string
}

/** 行程方案 - 面向游客本人的提示（第二人称，APP 内通知口吻） */
export interface VisitorNotice {
  id: string
  /** 提示类型，用于前端选图标 */
  kind: 'welcome' | 'deal' | 'nearby' | 'reminder' | 'tip'
  /** 标题：以「你」为主语的短句 */
  title: string
  /** 正文：直接对游客说的话 */
  body: string
  /** 行动按钮文案 */
  action: string
}

/** 跨城交通方案（原型模拟） */
export interface IntercityOption {
  /** 交通方式：高铁 / 飞机 / 长途大巴 / 中转联程 */
  mode: string
  /** 路线描述（含中转城市时形如「北京 → 郑州 → 成都」） */
  route: string
  /** 单程耗时描述 */
  duration: string
  /** 单人单程票价（元） */
  unitPrice: number
  /** 往返单人合计（元） */
  roundTripPrice: number
  /** 推荐理由 */
  reason: string
  /** 是否为推荐方案 */
  recommended: boolean
  /** 优点 */
  pros: string[]
  /** 缺点 */
  cons: string[]
  /** 该方案可叠加使用的优惠券（原型模拟） */
  coupons: string[]
  /** 是否为中转联程方案 */
  isTransfer: boolean
  /** 中转城市（仅中转联程方案） */
  transferCity?: string
  /** 分段明细（仅中转联程方案） */
  segments?: { leg: string; mode: string; duration: string; price: number }[]
}

/** 跨城交通预算规划 */
export interface TransportPlan {
  /** 出发地 */
  origin: string
  /** 目的地 */
  destination: string
  /** 距离档位：short=同城周边 / mid=省内邻省 / long=跨省远途 */
  distanceTier: 'short' | 'mid' | 'long'
  /** 距离档位文案 */
  distanceLabel: string
  /** 预估单程里程（公里，原型模拟） */
  distanceKm: number
  /** 可选交通方案（含高铁 / 飞机 / 大巴 / 中转联程） */
  options: IntercityOption[]
  /** 推荐方案名 */
  recommendedMode: string
  /** 推荐单人往返交通预算（元） */
  recommendedRoundTrip: number
  /** 最省钱的方案名 */
  cheapestMode: string
  /** 最省钱的单人往返价（元） */
  cheapestRoundTrip: number
  /** 占整趟人均预算的比例（%） */
  budgetSharePct: number
  /** 规划建议（面向游客，第二人称） */
  advice: string
  /** 说明：原型模拟 */
  note: string
}

/** 行程方案 */
export interface Itinerary {
  headline: string
  summary: string
  overview: {
    origin: string
    destination: string
    days: number
    segmentLabel: string
    budgetLabel: string
    budgetRangeLabel: string
    perPersonBudget: number
    totalBudget: number
    /** 游客勾选的兴趣偏好文案 */
    interestLabels: string[]
    /** 自定义偏好原文（选填） */
    customPreference: string
    /** 本次出行最关注事项文案 */
    focusLabels: string[]
    /** 自定义出行关注点原文（选填） */
    customFocus: string
    /** 行程节奏文案 */
    paceLabel: string
    /** 已勾选的酒店偏好文案 */
    hotelPrefLabels: string[]
  }
  /** 面向游客本人的提示（第二人称） */
  notices: VisitorNotice[]
  spots: ItinerarySpot[]
  hotels: HotelCandidate[]
  /** 两种酒店方案：全程同酒店连住 / 跟随行程更换就近酒店 */
  hotelPlans: HotelPlan[]
  transport: TransportOption[]
  /** 跨城交通预算规划（出发地 → 目的地） */
  transportPlan: TransportPlan
  coupons: CouponSuggestion[]
  tips: string[]
  /** 预算分配 */
  budgetBreakdown: { item: string; amount: number }[]
}

/** 接口响应 */
export interface AnalyzeResponse {
  ok: boolean
  profile: TravelerProfile
  itinerary: Itinerary
  strategyLab: StrategyReport
}

/** 分析请求体：游客信息 + 可选的点位手动调整 */
export type AnalyzeRequest = Partial<TravelerProfile> & {
  spotOverrides?: SpotOverride[]
}
