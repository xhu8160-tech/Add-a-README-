import type {
  BudgetMode,
  BudgetTier,
  FocusTag,
  HotelPrefTag,
  InterestTag,
  TicketPref,
  TravelPace,
  TravelerSegment,
} from '@/types/growth'

/** 后端元数据不可用时的本地兜底选项 */

export const SEGMENT_FALLBACK: { value: TravelerSegment; label: string }[] = [
  { value: 'solo', label: '独自旅行' },
  { value: 'couple', label: '情侣出行' },
  { value: 'honeymoon', label: '蜜月纪念' },
  { value: 'friends', label: '朋友结伴' },
  { value: 'family', label: '家庭带娃' },
  { value: 'elder', label: '带长辈游' },
  { value: 'student', label: '学生出行' },
  { value: 'business', label: '商务差旅' },
  { value: 'team', label: '团队团建' },
]

/** 出行兴趣偏好兜底选项（10 个，可多选） */
export const INTEREST_FALLBACK: { value: InterestTag; label: string }[] = [
  { value: 'nature', label: '自然生态' },
  { value: 'heritage', label: '历史古迹' },
  { value: 'art_museum', label: '艺术文博' },
  { value: 'urban_shopping', label: '城市商业' },
  { value: 'hiking', label: '户外徒步' },
  { value: 'food_tour', label: '美食探店' },
  { value: 'hidden_village', label: '小众村落' },
  { value: 'wellness', label: '休闲康养' },
  { value: 'theme_park', label: '主题乐园' },
  { value: 'seaside', label: '滨海风光' },
]

/** 兴趣偏好最多可勾选数量 */
export const MAX_INTERESTS = 5

/** 自定义偏好输入长度上限 */
export const CUSTOM_PREF_MAX_LEN = 100

/** 出发地快捷选项兜底（可自由输入其他城市） */
export const ORIGIN_FALLBACK = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '武汉', '南京', '重庆',
]

/** 出行时段快捷选项（选填，仅前端展示与透传） */
export const HOLIDAY_OPTIONS = [
  '周末小住', '五一', '端午', '国庆', '春节', '寒暑假', '年假拼假', '平日错峰', '还没定',
]

export const BUDGET_FALLBACK: { value: BudgetTier; label: string }[] = [
  { value: 'economy', label: '经济型' },
  { value: 'comfort', label: '舒适型' },
  { value: 'premium', label: '品质型' },
]

export const BUDGET_MODE_FALLBACK: { value: BudgetMode; label: string }[] = [
  { value: 'range', label: '区间滑动' },
  { value: 'input', label: '直接输入' },
]

/** 本次出行最关注事项兜底选项（8 个，可多选） */
export const FOCUS_FALLBACK: { value: FocusTag; label: string; desc: string }[] = [
  { value: 'save_money', label: '省钱优先', desc: '优先省钱，寻找低价中转交通方案' },
  { value: 'hotel_location', label: '位置优先', desc: '酒店位置优先，出行便利第一' },
  { value: 'deep_play', label: '多逛景点', desc: '深度游玩，打卡尽可能多景点' },
  { value: 'relax', label: '松弛慢玩', desc: '松弛度假，减少赶路' },
  { value: 'special_stay', label: '特色住宿', desc: '特色住宿体验，优先民宿或景区内住宿' },
  { value: 'food_first', label: '美食探店', desc: '美食探店为主' },
  { value: 'ticket_deal', label: '门票实惠', desc: '关注门票优惠与打包套票' },
  { value: 'pickup_service', label: '接送无忧', desc: '关注接送机、接送站配套服务' },
]

/** 本次出行最关注事项最多可勾选数量 */
export const MAX_FOCUS = 4

/** 关注事项 → 会影响的方案侧，帮助用户理解这是输入条件 */
export const FOCUS_RULE_HINT: Record<FocusTag, string> = {
  save_money: '优先省钱，寻找低价中转交通方案',
  hotel_location: '酒店位置优先，出行便利第一',
  deep_play: '深度游玩，打卡尽可能多景点',
  relax: '松弛度假，减少赶路',
  special_stay: '特色住宿体验，优先民宿或景区内住宿',
  food_first: '美食探店为主',
  ticket_deal: '关注门票优惠与打包套票',
  pickup_service: '关注接送机、接送站配套服务',
}

/** 行程节奏兜底选项（单选） */
export const PACE_FALLBACK: { value: TravelPace; label: string; hint: string }[] = [
  { value: 'intensive', label: '特种兵模式', hint: '每天多排点位，最大化打卡' },
  { value: 'leisure', label: '懒人慢游', hint: '每天少量点位，预留回酒店休息时间' },
  { value: 'flexible', label: '自由随机', hint: '张弛折中，按当天状态灵活安排' },
]

/** 酒店偏好兜底选项（9 个，可多选） */
export const HOTEL_PREF_FALLBACK: { value: HotelPrefTag; label: string; desc: string }[] = [
  { value: 'near_transit', label: '交通近便', desc: '靠近公共交通，出行换乘省时' },
  { value: 'in_scenic', label: '景区内住', desc: '住在景区里面或紧邻景区入口' },
  { value: 'value', label: '性价比高', desc: '同等条件下优先价格更友好的酒店' },
  { value: 'breakfast', label: '免费早餐', desc: '房费包含早餐，早起不用另找吃的' },
  { value: 'airport_shuttle', label: '接送服务', desc: '酒店提供接机或送机车辆' },
  { value: 'meal_plan', label: '包餐服务', desc: '含正餐套餐，减少外出觅食成本' },
  { value: 'local_民宿', label: '特色民宿', desc: '地方特色民宿，体验本地生活' },
  { value: 'hygiene', label: '卫生优选', desc: '卫生条件优先，干净整洁是新底线' },
  { value: 'quiet_resort', label: '安静度假', desc: '远离喧闹地段，适合休息放松' },
]

/** 门票偏好兜底（3 个，单选） */
export const TICKET_PREF_FALLBACK: { value: TicketPref; label: string; desc: string }[] = [
  { value: 'free', label: '少买门票', desc: '只排免费或低价点位，把预算留给吃住' },
  { value: 'mixed', label: '搭着买', desc: '以免费为主，只安排 1-2 个最值得的收费景点' },
  { value: 'any', label: '不挑票', desc: '收费免费都可以，优先看体验' },
]

/** 自定义出行关注点输入长度上限 */
export const CUSTOM_FOCUS_MAX_LEN = 100

/**
 * 预算滑块：非线性刻度
 * 低区间（0-300）占一半以上行程比例，越往上越稀疏，符合「大多数人拉得到 / 少部分人才到得了」的真实分布。
 * 刻度值直接对应滑块位置索引，而不是线性像素。
 */
export const BUDGET_STOPS = [
  0, 50, 100, 150, 200, 250, 300, 400, 500, 700, 1000, 1500, 2000, 3000, 4500, 6000, 8000, 10000,
] as const

/** 低 / 中 / 高 三档在刻度上的分界，用于 UI 提示 */
export const BUDGET_ZONES = [
  { label: '易达成', range: '¥0-300', note: '大多数人实际花销' },
  { label: '舒适', range: '¥300-1500', note: '品质出行的常见区间' },
  { label: '高端', range: '¥1500+', note: '少数人的选择' },
]

export const BUDGET_RANGE_DEFAULT = {
  min: 0,
  max: 10000,
  defaultMin: 300,
  defaultMax: 900,
}

/** 滑块刻度标记（0 元起步） */

export const RISK_STYLE: Record<
  'high' | 'mid' | 'low',
  { label: string; dot: string; chip: string; bar: string }
> = {
  high: {
    label: '高风险',
    dot: 'bg-theme-red',
    chip: 'bg-theme-red/10 text-theme-red border-theme-red/30',
    bar: 'bg-theme-red',
  },
  mid: {
    label: '中风险',
    dot: 'bg-theme-gold',
    chip: 'bg-warning/10 text-warning border-warning/30',
    bar: 'bg-theme-gold',
  },
  low: {
    label: '低风险',
    dot: 'bg-theme-green',
    chip: 'bg-success/10 text-success border-success/30',
    bar: 'bg-theme-green',
  },
}

export const PRIORITY_STYLE: Record<
  'P0' | 'P1' | 'P2',
  { label: string; chip: string; desc: string }
> = {
  P0: { label: 'P0 实时干预', chip: 'bg-theme-red text-white', desc: '高风险优先推送' },
  P1: { label: 'P1 优先触达', chip: 'bg-theme-gold text-white', desc: '2 小时内批量触达' },
  P2: { label: 'P2 培育队列', chip: 'bg-muted-foreground text-white', desc: '内容种草为主' },
}

/**
 * 画像标签来源样式。
 * 注意：不再包含 behavior —— 画像已完全由表单字段自动推导，
 * 用户手动选择的浏览行为已从产品中移除。
 */
export const SOURCE_STYLE: Record<
  'base' | 'focus' | 'interest' | 'conflict',
  { label: string; cls: string }
> = {
  base: { label: '基础信息', cls: 'border-border bg-muted text-muted-foreground' },
  focus: { label: '关注事项', cls: 'border-theme-blue/30 bg-info/10 text-info' },
  interest: { label: '兴趣偏好', cls: 'border-theme-green/40 bg-success/10 text-success' },
  conflict: { label: '冲突修正', cls: 'border-theme-gold/40 bg-warning/10 text-warning' },
}

export const CHANNEL_LABEL: Record<string, string> = {
  app_popup: 'APP 弹窗',
  in_app_message: '站内消息',
}

/** 游客提示的类型样式 */
export const NOTICE_STYLE: Record<
  'welcome' | 'deal' | 'nearby' | 'reminder' | 'tip',
  { icon: string; chip: string; accent: string }
> = {
  welcome: { icon: '🎉', chip: 'bg-success/10 text-success', accent: 'border-l-success bg-success/[0.04]' },
  deal: { icon: '🎁', chip: 'bg-theme-red/10 text-theme-red', accent: 'border-l-theme-red bg-theme-red/[0.04]' },
  nearby: { icon: '📍', chip: 'bg-theme-green/10 text-theme-green', accent: 'border-l-theme-green bg-theme-green/[0.04]' },
  reminder: { icon: '🧭', chip: 'bg-warning/10 text-warning', accent: 'border-l-theme-gold bg-warning/[0.05]' },
  tip: { icon: '🏨', chip: 'bg-info/10 text-info', accent: 'border-l-info bg-info/[0.04]' },
}
