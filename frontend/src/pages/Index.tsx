import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { analyzeGrowth, fetchMeta } from '@/lib/growth-api'
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  FocusTag,
  HotelPrefTag,
  MetaResponse,
  SpotOverride,
  TravelerProfile,
} from '@/types/growth'
import {
  BUDGET_FALLBACK,
  BUDGET_MODE_FALLBACK,
  BUDGET_RANGE_DEFAULT,
  FOCUS_FALLBACK,
  HOTEL_PREF_FALLBACK,
  TICKET_PREF_FALLBACK,
  MAX_FOCUS,
  ORIGIN_FALLBACK,
  PACE_FALLBACK,
  SEGMENT_FALLBACK,
} from '@/pages/growth/constants'
import { ControlPanel } from '@/pages/growth/ControlPanel'
import { ItineraryPanel } from '@/pages/growth/ItineraryPanel'
import { GrowthDashboard } from '@/pages/growth/GrowthDashboard'

const DEFAULT_PROFILE: TravelerProfile = {
  origin: '北京',
  destination: '杭州',
  days: 3,
  budgetMode: 'range',
  budgetMin: BUDGET_RANGE_DEFAULT.defaultMin,
  budgetMax: BUDGET_RANGE_DEFAULT.defaultMax,
  budgetTier: 'comfort',
  segment: 'solo',
  focusTags: ['hotel_location', 'food_first'],
  customFocus: '',
  pace: 'flexible',
  hotelPrefs: ['near_transit', 'value'],
  ticketPref: 'mixed',
  interests: [],
  customPreference: '',
}

const DEFAULT_TOTAL = String(
  Math.round(((BUDGET_RANGE_DEFAULT.defaultMin + BUDGET_RANGE_DEFAULT.defaultMax) / 2) * 3),
)

/** 由每日人均中值推导档位（与后端 deriveBudgetTier 保持一致） */
function deriveTier(perDay: number): TravelerProfile['budgetTier'] {
  if (perDay < 620) return 'economy'
  if (perDay < 1400) return 'comfort'
  return 'premium'
}

type TabKey = 'itinerary' | 'lab'

function initialTab(): TabKey {
  const t = new URLSearchParams(window.location.search).get('tab')
  return t === 'lab' ? 'lab' : 'itinerary'
}

export default function Index() {
  const [meta, setMeta] = useState<MetaResponse | null>(null)
  const [profile, setProfile] = useState<TravelerProfile>(DEFAULT_PROFILE)
  const [destinationDraft, setDestinationDraft] = useState(DEFAULT_PROFILE.destination)
  const [originDraft, setOriginDraft] = useState(DEFAULT_PROFILE.origin)
  const [budgetTotalDraft, setBudgetTotalDraft] = useState(DEFAULT_TOTAL)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<TabKey>(initialTab)
  /** 游客手动调整过的点位（增删改），非空时后端会重新匹配酒店 */
  const [spotOverrides, setSpotOverrides] = useState<SpotOverride[]>([])

  const segments = meta?.segments ?? SEGMENT_FALLBACK
  const budgets = meta?.budgets ?? BUDGET_FALLBACK
  const budgetModes = meta?.budgetModes ?? BUDGET_MODE_FALLBACK
  const focuses = meta?.focuses ?? FOCUS_FALLBACK
  const maxFocus = meta?.maxFocus ?? MAX_FOCUS
  const paces = meta?.paces ?? PACE_FALLBACK
  const hotelPrefs = meta?.hotelPrefs ?? HOTEL_PREF_FALLBACK
  const ticketPrefs = meta?.ticketPrefs ?? TICKET_PREF_FALLBACK
  const presets = meta?.presets ?? ['杭州', '成都', '西安', '三亚']
  const originPresets = meta?.originPresets ?? ORIGIN_FALLBACK

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch(() => {
        /* 元数据为增强项，失败时使用本地兜底选项 */
      })
  }, [])

  /** 组装实际提交给后端的 payload */
  const buildPayload = useCallback(
    (p: TravelerProfile, overrides: SpotOverride[]): AnalyzeRequest | null => {
      if (p.budgetMode === 'input') {
        const total = Number(budgetTotalDraft)
        if (!Number.isFinite(total) || total <= 0) {
          toast.error('请输入有效的总预算金额')
          return null
        }
        const perDay = Math.max(1, Math.round(total / Math.max(1, p.days)))
        return {
          ...p,
          budgetMin: perDay,
          budgetMax: perDay,
          budgetTier: deriveTier(perDay),
          spotOverrides: overrides,
        }
      }
      return {
        ...p,
        budgetTier: deriveTier(Math.round((p.budgetMin + p.budgetMax) / 2)),
        spotOverrides: overrides,
      }
    },
    [budgetTotalDraft],
  )

  const run = useCallback(
    async (next: TravelerProfile, overrides: SpotOverride[] = []) => {
      const payload = buildPayload(next, overrides)
      if (!payload) return
      setLoading(true)
      try {
        const data = await analyzeGrowth(payload)
        setResult(data)
        setProfile(next)
      } catch (err) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          '生成失败，请稍后重试'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [buildPayload],
  )

  /** 表单改动后提交时，清空历史点位调整（新的输入条件应重新生成基准点位） */
  const runFromForm = useCallback(() => {
    setSpotOverrides([])
    void run(profile, [])
  }, [profile, run])

  /** 游客手动增删改点位 → 带着 overrides 重新请求，酒店会随之重新匹配 */
  const applySpotOverrides = useCallback(
    (overrides: SpotOverride[]) => {
      setSpotOverrides(overrides)
      void run(profile, overrides)
    },
    [profile, run],
  )

  useEffect(() => {
    void run(DEFAULT_PROFILE, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patch = useCallback(
    <K extends keyof TravelerProfile>(key: K, value: TravelerProfile[K]) => {
      setProfile((p) => ({ ...p, [key]: value }))
    },
    [],
  )

  const onRangeChange = useCallback((min: number, max: number) => {
    setProfile((p) => ({ ...p, budgetMin: min, budgetMax: max }))
  }, [])

  /** 多选关注事项：已选则取消，未选则追加（达上限时提示） */
  const onToggleFocus = useCallback(
    (v: FocusTag) => {
      setProfile((p) => {
        if (p.focusTags.includes(v)) {
          return { ...p, focusTags: p.focusTags.filter((x) => x !== v) }
        }
        if (p.focusTags.length >= maxFocus) {
          toast.error(`最多选择 ${maxFocus} 个关注事项`)
          return p
        }
        return { ...p, focusTags: [...p.focusTags, v] }
      })
    },
    [maxFocus],
  )

  /** 多选酒店偏好：已选则取消，未选则追加 */
  const onToggleHotelPref = useCallback((v: HotelPrefTag) => {
    setProfile((p) => ({
      ...p,
      hotelPrefs: p.hotelPrefs.includes(v)
        ? p.hotelPrefs.filter((x) => x !== v)
        : [...p.hotelPrefs, v],
    }))
  }, [])

  const applyDestination = useCallback(
    (value: string) => {
      const v = value.trim() || '杭州'
      setDestinationDraft(v)
      patch('destination', v)
    },
    [patch],
  )

  /** 提交出发地；留空表示本地出发 */
  const applyOrigin = useCallback(
    (value: string) => {
      const v = value.trim()
      setOriginDraft(v)
      patch('origin', v)
    },
    [patch],
  )

  const tabs = useMemo(
    () => [
      { key: 'itinerary' as TabKey, label: '我的行程', hint: '游客可见' },
      { key: 'lab' as TabKey, label: 'Strategy Lab 运营后台', hint: '平台运营专属' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />

      {/* 顶部浅色提示条：全链路为业务原型模拟 */}
      <div className="border-b border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-6 py-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            全链路为业务原型模拟 · 不含真实天气 / 库存 / 第三方接口
          </p>
        </div>
      </div>

      {/* 顶部 Hero：绿色主题 + 图片背景 */}
      <header className="relative overflow-hidden">
        <img
          src="/images/hero.jpg?v=3"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/40" />
        <div className="relative mx-auto max-w-[1400px] px-6 py-12">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
            <h1 className="flex items-baseline gap-2.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              途策
              <span className="text-sm font-normal text-white/60">|</span>
              <span className="text-base font-semibold tracking-wide text-white/90 sm:text-lg">
                Travel Growth Copilot
              </span>
            </h1>
            <p className="text-sm font-medium tracking-wide text-emerald-200 sm:text-[15px]">
              洞察旅途，增长有策。
            </p>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/85">
            填入出行信息与关注重点，输出游客可直接落地的行程，运营端基于合成行为数据分析用户分层、漏斗，并生成可追溯策略与实验方案。
          </p>

          {/* 目的地图片卡：点击直接选中该目的地 */}
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { src: '/images/card-hangzhou.jpg?v=3', city: '杭州', tag: '湖光山色' },
              { src: '/images/card-chengdu.jpg?v=3', city: '成都', tag: '熊猫故乡' },
              { src: '/images/card-xian.jpg?v=3', city: '西安', tag: '千年古都' },
              { src: '/images/card-sanya.jpg?v=3', city: '三亚', tag: '海岛椰风' },
            ].map((c) => (
              <button
                key={c.city}
                type="button"
                onClick={() => applyDestination(c.city)}
                className={`group relative h-24 overflow-hidden rounded-xl text-left ring-1 transition-all ${
                  profile.destination === c.city
                    ? 'ring-2 ring-white'
                    : 'ring-white/25 hover:ring-white/70'
                }`}
              >
                <img
                  src={c.src}
                  alt={c.city}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <span className="absolute inset-x-3 bottom-1.5 flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-white">{c.city}</span>
                  <span className="text-[10px] text-white/85">{c.tag}</span>
                  {profile.destination === c.city && (
                    <span className="ml-auto rounded bg-white px-1 text-[9px] font-semibold text-emerald-800">
                      已选
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-7">
        {/* 上半部分：输入区（横向铺开的表单） */}
        {tab === 'itinerary' && <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-semibold">填写出行条件</h2>
              <span className="text-[11px] text-muted-foreground">
                出行条件用于C端行程；B端分析独立读取合成行为数据
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {profile.destination} · {profile.days} 天
            </span>
          </div>
            <ControlPanel
              profile={profile}
              destinationDraft={destinationDraft}
              originDraft={originDraft}
              budgetTotalDraft={budgetTotalDraft}
              onDestinationDraft={setDestinationDraft}
              onOriginDraft={setOriginDraft}
              onBudgetTotalDraft={setBudgetTotalDraft}
              onCommitDestination={applyDestination}
              onCommitOrigin={applyOrigin}
              segments={segments}
              budgets={budgets}
              budgetModes={budgetModes}
              focuses={focuses}
              maxFocus={maxFocus}
              paces={paces}
              hotelPrefs={hotelPrefs}
              ticketPrefs={ticketPrefs}
              presets={presets}
              originPresets={originPresets}
              loading={loading}
              onPatch={patch}
              onToggleFocus={onToggleFocus}
              onToggleHotelPref={onToggleHotelPref}
              onRangeChange={onRangeChange}
              onRun={runFromForm}
            />
        </section>}

        {/* 下半部分：输出区 */}
        <section className="mt-6 min-w-0">
            <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-border/60">
              {tabs.map((t) => {
                const active = tab === t.key
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`relative -mb-px px-4 py-2.5 text-sm font-medium transition-colors ${
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="ml-2 text-[11px] text-muted-foreground">{t.hint}</span>
                    {active && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {tab === 'lab' && <GrowthDashboard />}
            {tab === 'itinerary' && loading && !result && <SkeletonBlock />}

            {tab === 'itinerary' && !loading && !result && <EmptyState onRun={runFromForm} />}

            {tab === 'itinerary' && result && (
              <motion.div
                key={`${tab}-${result.strategyLab.generatedAt}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className={loading ? 'opacity-60 transition-opacity' : ''}
              >
                <ItineraryPanel
                    data={result.itinerary}
                    overrides={spotOverrides}
                    refreshing={loading}
                    onApplyOverrides={applySpotOverrides}
                  />
              </motion.div>
            )}
        </section>
      </main>

      <footer className="border-t border-border/60 py-6">
        <p className="mx-auto max-w-[1400px] px-6 text-xs text-muted-foreground">
          「我的行程」用游客自己的视角写，直接告诉你能去哪、住哪、怎么走；
          「Strategy Lab」基于合成行为数据展示分层、漏斗、策略及实验方案；策略建议为待验证假设，非真实商业结论。
        </p>
      </footer>
    </div>
  )
}

function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/50" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl border border-border/60 bg-muted/50" />
        <div className="h-40 animate-pulse rounded-xl border border-border/60 bg-muted/50" />
      </div>
      <div className="h-56 animate-pulse rounded-xl border border-border/60 bg-muted/50" />
    </div>
  )
}

function EmptyState({ onRun }: { onRun: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        填好左侧信息，勾选本次最关注的事项，就可以生成行程了。
      </p>
      <Button className="mt-4" onClick={onRun}>
        生成我的行程
      </Button>
    </div>
  )
}
