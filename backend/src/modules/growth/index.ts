import type { Router as RouterT, Request, Response } from 'express'
import { Router } from 'express'
import {
  analyze,
  BUDGET_LABEL,
  BUDGET_MODES,
  BUDGETS,
  FOCUS_DESC,
  FOCUS_LABEL,
  FOCUSES,
  HOTEL_PREF_DESC,
  HOTEL_PREF_LABEL,
  HOTEL_PREFS,
  INTEREST_LABEL,
  INTERESTS,
  MAX_FOCUS,
  MAX_INTERESTS,
  PACE_LABEL,
  PACES,
  SEGMENT_LABEL,
  TICKET_PREF_DESC,
  TICKET_PREF_LABEL,
  TICKET_PREFS,
  SEGMENTS,
  validateProfile,
} from './engine.js'
import type { SpotOverride } from './types.js'

export const growthRouter: RouterT = Router()

/**
 * 元数据：前端表单选项来源
 */
growthRouter.get('/meta', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    segments: SEGMENTS.map((v) => ({ value: v, label: SEGMENT_LABEL[v] })),
    budgets: BUDGETS.map((v) => ({ value: v, label: BUDGET_LABEL[v] })),
    budgetModes: BUDGET_MODES.map((v) => ({
      value: v,
      label: v === 'range' ? '区间滑动' : '直接输入',
    })),
    /** 本次出行最关注事项（多选） */
    focuses: FOCUSES.map((v) => ({ value: v, label: FOCUS_LABEL[v], desc: FOCUS_DESC[v] })),
    maxFocus: MAX_FOCUS,
    /** 行程节奏（单选） */
    paces: PACES.map((v) => ({ value: v, label: PACE_LABEL[v] })),
    /** 酒店偏好（多选） */
    hotelPrefs: HOTEL_PREFS.map((v) => ({ value: v, label: HOTEL_PREF_LABEL[v], desc: HOTEL_PREF_DESC[v] })),
    /** 门票偏好（单选） */
    ticketPrefs: TICKET_PREFS.map((v) => ({ value: v, label: TICKET_PREF_LABEL[v], desc: TICKET_PREF_DESC[v] })),
    interests: INTERESTS.map((v) => ({ value: v, label: INTEREST_LABEL[v] })),
    maxInterests: MAX_INTERESTS,
    presets: ['杭州', '成都', '西安', '三亚'],
    /** 出发地快捷选项（可自由输入其他城市） */
    originPresets: ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '武汉', '南京', '重庆'],
    /** 每日人均预算滑块范围（元），0 起步 */
    budgetRange: { min: 0, max: 6000, step: 50, defaultMin: 300, defaultMax: 900 },
    disclaimer: '本工具所有外部信息（景点库存、酒店房价、交通班次、天气）均为业务原型模拟，不接入真实第三方接口。',
  })
})

/**
 * 核心接口：生成双板块输出
 * POST /api/growth/analyze
 *
 * 支持可选的 spotOverrides：游客手动增删 / 改名游玩点位后，酒店会重新匹配。
 */
growthRouter.post('/analyze', (req: Request, res: Response) => {
  const parsed = validateProfile(req.body)
  if (!parsed.ok) {
    res.status(400).json({ ok: false, error: parsed.error })
    return
  }

  const rawOverrides = (req.body as { spotOverrides?: unknown })?.spotOverrides
  const spotOverrides: SpotOverride[] = Array.isArray(rawOverrides)
    ? rawOverrides
        .filter((o): o is Record<string, unknown> => !!o && typeof o === 'object')
        .map((o) => ({
          spotId: typeof o.spotId === 'string' ? o.spotId : '',
          day: Number(o.day),
          name: typeof o.name === 'string' ? o.name.trim().slice(0, 30) : undefined,
          removed: o.removed === true,
        }))
        .filter((o) => o.spotId && Number.isFinite(o.day))
    : []

  const result = analyze({ ...parsed.value, spotOverrides })
  res.json(result)
})
