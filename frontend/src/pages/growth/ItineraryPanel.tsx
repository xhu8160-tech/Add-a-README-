import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Gauge,
  Lightbulb,
  Loader2,
  Map as MapIcon,
  MapPin,
  Minus,
  Pencil,
  Plus,
  Star,
  Ticket,
  Train,
  Wallet,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type {
  HotelPlan,
  Itinerary,
  ItinerarySpot,
  SpotOverride,
  TransportPlan,
  VisitorNotice,
} from '@/types/growth'
import { NOTICE_STYLE } from './constants'

interface Props {
  data: Itinerary
  /** 已提交给后端的点位调整，用于回显「已调整」态 */
  overrides?: SpotOverride[]
  /** 重新生成中（点位调整后自动匹配酒店时有短暂刷新） */
  refreshing?: boolean
  /** 提交点位调整 → 后端重新排酒店 */
  onApplyOverrides?: (overrides: SpotOverride[]) => void
}

export function ItineraryPanel({ data, overrides = [], refreshing, onApplyOverrides }: Props) {
  /** 本地编辑态：点位增删改，点「重新匹配酒店」后提交 */
  const [edits, setEdits] = useState<SpotOverride[]>(overrides)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [addingDay, setAddingDay] = useState<number | null>(null)
  const [newSpotName, setNewSpotName] = useState('')

  // 后端回传新结果时同步一次（覆盖掉已生效的调整）
  useEffect(() => {
    setEdits(overrides)
  }, [overrides])

  /** 合并本地编辑后的可见点位 */
  const visibleByDay = useMemo(() => {
    const removed = new Set(edits.filter((e) => e.removed).map((e) => e.spotId))
    const renamed = new Map(
      edits.filter((e) => !e.removed && e.name).map((e) => [e.spotId, e.name as string]),
    )
    const map = new Map<number, ItinerarySpot[]>()
    for (const s of data.spots) {
      if (removed.has(s.id)) continue
      const name = renamed.get(s.id) ?? s.name
      const list = map.get(s.day) ?? []
      list.push({ ...s, name, edited: name !== s.name })
      map.set(s.day, list)
    }
    // 新增的点位（spotId 形如 new-<ts>，不在原 spots 里）
    for (const e of edits) {
      if (e.removed || !e.name || e.spotId.startsWith('orig-')) continue
      if (data.spots.some((s) => s.id === e.spotId)) continue
      const list = map.get(e.day) ?? []
      list.push({
        id: e.spotId,
        name: e.name,
        day: e.day,
        timeSlot: '自由安排',
        durationHrs: 2,
        reason: '你手动加入的点位，酒店已按它所在片区重新匹配',
        ticket: 0,
        tag: '自定义',
        edited: true,
      })
      map.set(e.day, list)
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
  }, [data.spots, edits])

  const hasEdits = edits.length > 0

  const removeSpot = useCallback((spot: ItinerarySpot) => {
    setEdits((prev) => {
      const next = prev.filter((e) => e.spotId !== spot.id)
      return [...next, { spotId: spot.id, day: spot.day, removed: true }]
    })
  }, [])

  const commitRename = useCallback(
    (spot: ItinerarySpot) => {
      const name = draftName.trim()
      setEditingId(null)
      if (!name || name === spot.name) return
      setEdits((prev) => [
        ...prev.filter((e) => e.spotId !== spot.id),
        { spotId: spot.id, day: spot.day, name },
      ])
    },
    [draftName],
  )

  const addSpot = useCallback(
    (day: number) => {
      const name = newSpotName.trim()
      if (!name) return
      setEdits((prev) => [
        ...prev,
        { spotId: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, day, name },
      ])
      setNewSpotName('')
      setAddingDay(null)
    },
    [newSpotName],
  )

  const submitEdits = useCallback(() => {
    onApplyOverrides?.(edits)
  }, [edits, onApplyOverrides])

  const resetEdits = useCallback(() => {
    setEdits([])
    setEditingId(null)
    setAddingDay(null)
    onApplyOverrides?.([])
  }, [onApplyOverrides])

  return (
    <div className="space-y-6">
      {/* 给你的提示（第二人称） */}
      {data.notices.length > 0 && (
        <section>
          <SectionLabel>给你的提示</SectionLabel>
          <div className="mt-2.5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            {data.notices.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        </section>
      )}

      {/* 概要 */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/5 to-transparent px-6 py-5">
          <h2 className="text-xl font-bold tracking-tight">{data.headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
          <Metric label="目的地" value={data.overview.destination} icon={<MapPin className="h-3.5 w-3.5" />} />
          <Metric label="行程天数" value={`${data.overview.days} 天`} icon={<CalendarDays className="h-3.5 w-3.5" />} />
          <Metric label="出行人群" value={data.overview.segmentLabel} />
          <Metric label="你的预算" value={data.overview.budgetRangeLabel} />
        </div>

        {/* 本次出行最关注事项 */}
        {(data.overview.focusLabels.length > 0 || data.overview.customFocus) && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-6 py-3.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Compass className="h-3 w-3" />
              你的关注点
            </span>
            {data.overview.focusLabels.map((l) => (
              <span
                key={l}
                className="rounded-md border border-theme-blue/40 bg-info/10 px-2 py-0.5 text-[11px] font-medium text-info"
              >
                {l}
              </span>
            ))}
            {data.overview.customFocus && (
              <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                自定义：{data.overview.customFocus}
              </span>
            )}
          </div>
        )}

        {/* 行程节奏 + 酒店偏好 */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/60 px-6 py-3.5">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gauge className="h-3 w-3" />
            行程节奏
          </span>
          <span className="rounded-md border border-primary/40 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
            {data.overview.paceLabel}
          </span>
          {data.overview.hotelPrefLabels.length > 0 && (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <BedDouble className="h-3 w-3" />
                酒店偏好
              </span>
              {data.overview.hotelPrefLabels.map((l) => (
                <span
                  key={l}
                  className="rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </>
          )}
        </div>

        {/* 你勾选的兴趣偏好 */}
        {data.overview.interestLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/60 px-6 py-3.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Compass className="h-3 w-3" />
              你的兴趣偏好
            </span>
            {data.overview.interestLabels.map((l) => (
              <span
                key={l}
                className="rounded-md border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
              >
                {l}
              </span>
            ))}
            <span className="text-[11px] text-muted-foreground">已按此优先排序</span>
          </div>
        )}

        {data.overview.customPreference && (
          <div className="border-t border-border/60 px-6 py-3.5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">你的补充诉求　</span>
              {data.overview.customPreference}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-border/60 px-6 py-4">
          <span className="text-xs text-muted-foreground">这趟人均预计花费</span>
          <span className="text-2xl font-bold text-theme-red">
            ¥{data.overview.perPersonBudget.toLocaleString('zh-CN')}
          </span>
          <span className="text-xs text-muted-foreground">
            含住宿 / 门票 / 市内交通 / 餐饮（原型模拟测算）
          </span>
        </div>
      </section>

      {/* 逐日行程（可手动增删改点位） */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <PanelTitle
            icon={<CalendarDays className="h-4 w-4" />}
            tone="green"
            title="每天去哪儿"
            note="点位可以自己改，改完点「重新匹配酒店」，住宿会跟着换到更顺路的位置"
          />
          {hasEdits && (
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                已调整 {edits.length} 处
              </span>
              <Button variant="outline" size="sm" onClick={resetEdits} disabled={refreshing}>
                撤销
              </Button>
              <Button size="sm" onClick={submitEdits} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    匹配中…
                  </>
                ) : (
                  <>
                    <BedDouble className="mr-1.5 h-3.5 w-3.5" />
                    重新匹配酒店
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className={`mt-5 space-y-6 ${refreshing ? 'opacity-60 transition-opacity' : ''}`}>
          {visibleByDay.map(([day, spots]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-primary px-2 text-xs font-semibold text-primary-foreground">
                  第 {day} 天
                </span>
                <span className="h-px flex-1 bg-border/70" />
                <span className="text-xs text-muted-foreground">
                  {spots.length} 个点位 · 门票合计 ¥{spots.reduce((s, x) => s + x.ticket, 0)}
                </span>
              </div>
              <ol className="space-y-2.5 border-l border-dashed border-border pl-4">
                {spots.map((s) => (
                  <SpotItem
                    key={s.id}
                    spot={s}
                    editing={editingId === s.id}
                    draftName={draftName}
                    onDraftName={setDraftName}
                    onStartEdit={() => {
                      setEditingId(s.id)
                      setDraftName(s.name)
                    }}
                    onCancelEdit={() => setEditingId(null)}
                    onCommitEdit={() => commitRename(s)}
                    onRemove={() => removeSpot(s)}
                  />
                ))}
                {spots.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border px-3.5 py-3 text-xs text-muted-foreground">
                    这一天暂时没有点位，可以自己加一个。
                  </li>
                )}

                {/* 加入点位 */}
                <li className="pt-0.5">
                  {addingDay === day ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={newSpotName}
                        placeholder="输入想去的点位名称"
                        maxLength={30}
                        onChange={(e) => setNewSpotName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addSpot(day)
                          if (e.key === 'Escape') setAddingDay(null)
                        }}
                        className="h-8 text-xs"
                      />
                      <Button size="sm" className="h-8 shrink-0" onClick={() => addSpot(day)}>
                        加入
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 shrink-0"
                        onClick={() => setAddingDay(null)}
                      >
                        取消
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setAddingDay(day)
                        setNewSpotName('')
                      }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      加一个点位
                    </button>
                  )}
                </li>
              </ol>
            </div>
          ))}
        </div>

        {hasEdits && (
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-theme-blue/30 bg-info/5 px-4 py-3">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              点位调整还没生效。点右上角「重新匹配酒店」，我们会按新的点位重算通勤距离，
              把更顺路的住宿换给你。
            </p>
          </div>
        )}
      </section>

      {/* 优惠建议 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <PanelTitle icon={<Ticket className="h-4 w-4" />} title="这些优惠你能用" tone="red" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {data.coupons.map((c) => (
            <div key={c.name} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold">{c.name}</h4>
                <span className="shrink-0 rounded-md bg-theme-red/10 px-2 py-0.5 text-sm font-bold text-theme-red">
                  {c.value}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{c.appliesTo}</p>
              <p className="mt-1.5 text-xs text-muted-foreground/80">使用条件：{c.condition}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 景点与酒店关系地图 */}
      <MapSection groups={visibleByDay} plans={data.hotelPlans} />

      {/* 酒店方案（两种排法） */}
      <HotelPlansSection plan={data.hotelPlans} fallbackHotels={data.hotels} />

      {/* 城际交通方案比价 */}
      <TransportPlanSection plan={data.transportPlan} />

      {/* 到站之后怎么走：默认两行，其余展开 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <PanelTitle
          icon={<Car className="h-4 w-4" />}
          tone="amber"
          title="到了之后怎么走"
          note="机场/高铁站到酒店、酒店到景区，常见几种接驳方式"
        />
        <LocalTransportList rows={data.transport} />
      </section>

      {/* 预算分配 + 贴士 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <PanelTitle icon={<Wallet className="h-4 w-4" />} title="钱大概花在哪" tone="red" />
          <div className="mt-5 space-y-3">
            {data.budgetBreakdown.map((b) => {
              const pct = data.overview.perPersonBudget
                ? Math.round((b.amount / data.overview.perPersonBudget) * 100)
                : 0
              return (
                <div key={b.item}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-muted-foreground">{b.item}</span>
                    <span className="font-medium">
                      ¥{b.amount.toLocaleString('zh-CN')}
                      <span className="ml-1.5 text-xs text-muted-foreground">{pct}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
          <PanelTitle icon={<Lightbulb className="h-4 w-4" />} title="出发前记住这些" tone="amber" />
          <ul className="mt-5 space-y-2.5">
            {data.tips.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        景点票价、酒店房价与房态均为原型模拟数据，实际请以预订页面为准。
      </p>
    </div>
  )
}

/** 酒店：默认只露 2 家酒店 × 2 个房型，其余点开再看 */
function HotelPlansSection({
  plan,
  fallbackHotels,
}: {
  plan: HotelPlan[]
  fallbackHotels: Itinerary['hotels']
}) {
  /** 先让用户选住法，选完才展开酒店列表；null = 还没选 */
  const [active, setActive] = useState<'same_hotel' | 'follow_route' | null>(null)
  /** 点开后额外展示的酒店下标集合 */
  const [openHotels, setOpenHotels] = useState<number[]>([])
  /** 点开后额外展示房型的酒店下标集合 */
  const [openRooms, setOpenRooms] = useState<number[]>([])

  useEffect(() => {
    setOpenHotels([])
    setOpenRooms([])
  }, [active])

  const current = plan.find((p) => p.mode === active)
  const hotels = current?.hotels ?? []
  const shown = hotels.slice(0, 2)

  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <PanelTitle
        icon={<BedDouble className="h-4 w-4" />}
        tone="violet"
        title="住哪儿"
        note="已按「价格 + 到点位的通勤」综合排序 · 房价为原型模拟"
      />

      {plan.length > 0 ? (
        <>
          {/* 先选住法：绿=连住省心，蓝=随行就近 */}
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {plan.map((p) => {
              const on = p.mode === active
              const isSame = p.mode === 'same_hotel'
              return (
                <button
                  key={p.mode}
                  type="button"
                  onClick={() => setActive(on ? null : p.mode)}
                  className={`rounded-xl border-2 px-4 py-3.5 text-left transition-all ${
                    on
                      ? isSame
                        ? 'border-success bg-success/5 shadow-sm'
                        : 'border-info bg-info/5 shadow-sm'
                      : 'border-border/70 hover:border-foreground/25 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                        on
                          ? isSame
                            ? 'bg-success text-white'
                            : 'bg-info text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isSame ? '住' : '换'}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-theme-red">
                      ¥{p.totalCost.toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{p.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {p.tradeoff}
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 text-[11px] font-medium ${
                      on ? 'text-foreground' : 'text-muted-foreground/70'
                    }`}
                  >
                    {on ? (
                      <>
                        <Check className="h-3 w-3" /> 已选，下面是酒店
                      </>
                    ) : (
                      '点这选它，看具体酒店 →'
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {!current && (
            <div className="mt-3 rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              先选一种住法（连住更省 · 随行更近），再展开对应的酒店和房型
            </div>
          )}

          {current && (
            <>
              {/* 默认只看 2 家酒店，每家的特点一句话 */}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {shown.map((h, i) => (
                  <HotelCard
                    key={`${h.name}-${h.stayRange ?? ''}`}
                    hotel={h}
                    featured={i === 0}
                    roomsOpen={openRooms.includes(i)}
                    onToggleRooms={() =>
                      setOpenRooms((prev) =>
                        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
                      )
                    }
                  />
                ))}
              </div>

              {/* 其余酒店：折叠 */}
              {hotels.length > shown.length &&
                (openHotels.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {hotels.slice(2).map((h, k) => {
                      const key = 2 + k
                      return (
                        <HotelCard
                          key={`${h.name}-${h.stayRange ?? ''}`}
                          hotel={h}
                          featured={false}
                          compact
                          roomsOpen={openRooms.includes(key)}
                          onToggleRooms={() =>
                            setOpenRooms((prev) =>
                              prev.includes(key)
                                ? prev.filter((x) => x !== key)
                                : [...prev, key],
                            )
                          }
                        />
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setOpenHotels([])}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronUp className="h-3 w-3" />
                      收起其他酒店
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenHotels([1])}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    再看 {hotels.length - shown.length} 家备选酒店
                  </button>
                ))}

              {/* 推荐理由：收成一行可展开 */}
              <details className="group mt-4 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-primary" />
                  为什么这样排
                  <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{current.reason}</p>
              </details>
            </>
          )}
        </>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fallbackHotels.slice(0, 2).map((h) => (
            <div key={h.name} className="rounded-lg border border-border p-4">
              <h4 className="text-sm font-semibold">{h.name}</h4>
              <p className="mt-1.5 text-xs text-muted-foreground">{h.highlight}</p>
              <p className="mt-2 text-base font-bold text-theme-red">
                ¥{h.pricePerNight}
                <span className="text-xs font-normal text-muted-foreground"> / 晚</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/** 单家酒店：标题 + 一句特点 + 2 个房型，其余房型折叠 */
function HotelCard({
  hotel: h,
  featured,
  compact,
  roomsOpen,
  onToggleRooms,
}: {
  hotel: HotelPlan['hotels'][number]
  featured: boolean
  compact?: boolean
  roomsOpen: boolean
  onToggleRooms: () => void
}) {
  const rooms = h.rooms ?? []
  const visibleRooms = roomsOpen ? rooms : rooms.slice(0, 2)

  return (
    <div
      className={`relative rounded-lg border p-4 transition-colors ${
        featured ? 'border-primary/40 bg-primary/[0.03]' : 'border-border'
      }`}
    >
      {h.stayRange && (
        <Badge className="absolute -top-2 left-3 bg-primary text-primary-foreground hover:bg-primary">
          {h.stayRange}
        </Badge>
      )}
      {h.rescued && !h.stayRange && (
        <Badge className="absolute -top-2 left-3 bg-theme-gold text-white hover:bg-theme-gold">
          帮你留着
        </Badge>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold leading-snug">{h.name}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-theme-gold text-theme-gold" />
              {h.rating.toFixed(1)}
            </span>
            <span>·</span>
            <span>{h.tier}</span>
            <span>·</span>
            <span>{h.distance}</span>
            {h.isHomestay && (
              <span className="rounded border border-theme-green/40 bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
                民宿
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-base font-bold text-theme-red">¥{h.pricePerNight}</span>
          <span className="text-xs text-muted-foreground"> 起</span>
        </div>
      </div>

      {/* 一句话特点：只用 highlight，不再堆通勤分与偏好标签 */}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{h.highlight}</p>

      {!compact && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Car className="h-3 w-3" />
            通勤 {h.commuteScore} 分
          </span>
          {h.matchedPrefs.length > 0 && (
            <span className="truncate">命中：{h.matchedPrefs.join('、')}</span>
          )}
        </div>
      )}

      {/* 房型：默认 2 个，其余点开 */}
      {rooms.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {visibleRooms.map((r) => (
            <div
              key={r.name}
              className="flex items-start justify-between gap-3 rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-medium">{r.name}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  {r.feature}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-theme-red">¥{r.pricePerNight}</p>
                <p className="text-[10px] text-muted-foreground">{r.priceNote}</p>
              </div>
            </div>
          ))}
          {rooms.length > 2 && (
            <button
              type="button"
              onClick={onToggleRooms}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${roomsOpen ? 'rotate-180' : ''}`}
              />
              {roomsOpen ? '收起房型' : `其他 ${rooms.length - 2} 种房型`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** 城际交通：默认只列推荐 + 最省两条，每条一句话；比价明细点开再看 */
function TransportPlanSection({ plan }: { plan: TransportPlan }) {
  const isLocal = plan.distanceKm === 0
  const [openAll, setOpenAll] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // 默认只看推荐方案与最省方案，其余折叠
  const headIdxs: number[] = []
  const recIdx = plan.options.findIndex((o) => o.recommended)
  const cheapIdx = plan.options.findIndex((o) => o.mode === plan.cheapestMode)
  if (recIdx >= 0) headIdxs.push(recIdx)
  if (cheapIdx >= 0 && cheapIdx !== recIdx) headIdxs.push(cheapIdx)
  if (headIdxs.length === 0) headIdxs.push(0)
  const restCount = plan.options.length - headIdxs.length
  const listIdx = openAll ? plan.options.map((_, i) => i) : headIdxs

  const tierStyle: Record<TransportPlan['distanceTier'], string> = {
    short: 'border-theme-green/40 bg-success/10 text-success',
    mid: 'border-theme-blue/40 bg-info/10 text-info',
    long: 'border-theme-gold/40 bg-warning/10 text-warning',
  }

  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <PanelTitle
        icon={<Train className="h-4 w-4" />}
        tone="blue"
        title="怎么去"
        note={isLocal ? '本地出发，无需跨城交通' : '高铁 / 飞机 / 大巴 / 中转联程 比价 · 原型模拟'}
      />

      {/* 起点 → 终点 */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5">
        <span className="text-sm font-semibold">{plan.origin || '本地'}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">{plan.destination}</span>
        {!isLocal && (
          <>
            <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${tierStyle[plan.distanceTier]}`}>
              {plan.distanceLabel}
            </span>
            <span className="text-xs text-muted-foreground">约 {plan.distanceKm} 公里</span>
          </>
        )}
      </div>

      {/* 每个方案：一行标题 + 一句特点，其余点开 */}
      <div className="mt-3 space-y-2">
        {listIdx.map((i) => {
          const o = plan.options[i]
          const open = openIndex === i
          return (
            <div
              key={o.mode}
              className={`rounded-lg border transition-colors ${
                o.recommended ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{o.mode}</span>
                    {o.recommended && (
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary">推荐</Badge>
                    )}
                    {o.isTransfer && (
                      <span className="rounded border border-theme-gold/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        中转
                      </span>
                    )}
                    {i === cheapIdx && !o.recommended && (
                      <span className="rounded border border-theme-green/40 bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        最省
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {o.duration} · {o.route}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-base font-bold text-theme-red">
                    ¥{o.roundTripPrice.toLocaleString('zh-CN')}
                  </div>
                  <div className="text-[10px] text-muted-foreground">/ 人往返</div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="border-t border-border/60 px-4 py-3">
                  {/* 中转分段 */}
                  {o.segments && o.segments.length > 0 && (
                    <div className="mb-2.5 space-y-1 rounded-md bg-muted/50 px-3 py-2">
                      {o.segments.map((seg, k) => (
                        <div
                          key={k}
                          className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground"
                        >
                          <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-semibold">
                            {k + 1}
                          </span>
                          <span className="font-medium text-foreground/80">{seg.leg}</span>
                          <span>· {seg.mode}</span>
                          <span>· {seg.duration}</span>
                          <span className="ml-auto font-medium">¥{seg.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-muted-foreground">{o.reason}</p>

                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                    <ul className="space-y-0.5">
                      {o.pros.map((p) => (
                        <li key={p} className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-0.5">
                      {o.cons.map((c) => (
                        <li key={c} className="flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                          <X className="mt-0.5 h-3 w-3 shrink-0 text-theme-red/70" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {o.coupons.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Ticket className="h-3 w-3" />
                        可用券
                      </span>
                      {o.coupons.map((c) => (
                        <span
                          key={c}
                          className="rounded border border-theme-red/30 bg-theme-red/5 px-1.5 py-0.5 text-[10px] text-theme-red"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 其余方案 */}
      {restCount > 0 && (
        <button
          type="button"
          onClick={() => {
            setOpenAll((v) => !v)
            setOpenIndex(null)
          }}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${openAll ? 'rotate-180' : ''}`} />
          {openAll ? '只看推荐和最省' : `还有 ${restCount} 种走法（更快 / 更折腾）`}
        </button>
      )}

      {/* 一句话结论 */}
      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-theme-blue/30 bg-info/5 px-4 py-2.5">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
        <p className="text-xs leading-relaxed text-muted-foreground">{plan.advice}</p>
      </div>
    </section>
  )
}

/** 市内接驳：默认只露前两条，其余展开 */
function LocalTransportList({ rows }: { rows: Itinerary['transport'] }) {
  const [open, setOpen] = useState(false)
  const shown = open ? rows : rows.slice(0, 2)
  return (
    <div className="mt-4">
      <div className="divide-y divide-border/60 overflow-hidden rounded-lg border border-border/60">
        {shown.map((t, i) => (
          <div key={`${t.mode}-${i}`} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">{t.mode}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{t.route}</p>
              {open && t.note && (
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">{t.note}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold">{t.cost > 0 ? `¥${t.cost}` : '—'}</p>
              <p className="text-[11px] text-muted-foreground">{t.duration}</p>
            </div>
          </div>
        ))}
      </div>
      {rows.length > 2 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
          {open ? '收起' : `再看 ${rows.length - 2} 种走法`}
        </button>
      )}
    </div>
  )
}

function NoticeCard({ notice }: { notice: VisitorNotice }) {
  const style = NOTICE_STYLE[notice.kind]
  return (
    <div
      className={`flex h-full flex-col rounded-lg border border-l-4 border-border/60 p-3.5 shadow-sm ${style.accent}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none">{style.icon}</span>
        <h4 className="text-[13px] font-semibold leading-snug">{notice.title}</h4>
      </div>
      <p className="mt-1.5 flex-1 text-[11px] leading-relaxed text-muted-foreground">{notice.body}</p>
      <span
        className={`mt-2 inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${style.chip}`}
      >
        {notice.action}
      </span>
    </div>
  )
}

function SpotItem({
  spot,
  editing,
  draftName,
  onDraftName,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onRemove,
}: {
  spot: ItinerarySpot
  editing: boolean
  draftName: string
  onDraftName: (v: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onCommitEdit: () => void
  onRemove: () => void
}) {
  return (
    <li
      className={`group relative rounded-lg border p-3.5 transition-colors ${
        spot.edited ? 'border-theme-blue/50 bg-info/5' : 'border-border'
      }`}
    >
      <span className="absolute -left-[22px] top-5 h-2 w-2 rounded-full border-2 border-background bg-primary" />

      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={draftName}
            maxLength={30}
            onChange={(e) => onDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8 shrink-0 px-2.5" onClick={onCommitEdit}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 shrink-0 px-2.5" onClick={onCancelEdit}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-xs font-medium text-muted-foreground">{spot.timeSlot}</span>
            <span className="text-sm font-semibold">{spot.name}</span>
            <Badge variant="secondary" className="text-[10px] font-normal">
              {spot.tag}
            </Badge>
            {spot.edited && (
              <span className="rounded border border-theme-blue/40 bg-info/10 px-1.5 py-0.5 text-[10px] text-info">
                已调整
              </span>
            )}

            {/* 操作按钮：hover 显示 */}
            <span className="ml-auto flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={onStartEdit}
                title="改名字"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onRemove}
                title="删掉这个点位"
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-theme-red/10 hover:text-theme-red"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{spot.reason}</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>建议游玩 {spot.durationHrs} 小时</span>
            <span>{spot.ticket > 0 ? `门票约 ¥${spot.ticket}` : '免费开放'}</span>
          </div>
        </>
      )}
    </li>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <h3 className="text-sm font-semibold">{children}</h3>
      <span className="h-px flex-1 bg-border/70" />
    </div>
  )
}

type TitleTone = 'green' | 'blue' | 'amber' | 'red' | 'violet'
const TONE_CHIP: Record<TitleTone, string> = {
  green: 'bg-success/10 text-success',
  blue: 'bg-info/10 text-info',
  amber: 'bg-warning/10 text-warning',
  red: 'bg-theme-red/10 text-theme-red',
  violet: 'bg-violet-100 text-violet-600',
}
function PanelTitle({
  icon,
  title,
  note,
  tone,
}: {
  icon?: React.ReactNode
  title: string
  note?: string
  tone?: TitleTone
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {icon && (
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${
              tone ? TONE_CHIP[tone] : 'bg-muted text-muted-foreground'
            }`}
          >
            {icon}
          </span>
        )}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  )
}

/* =========================================================================
 * 景点-酒店关系地图（编排示意，非真实地理坐标）
 * ========================================================================= */

const DAY_COLORS = [
  '#059669', '#0d9488', '#65a30d', '#0891b2', '#7c3aed',
  '#db2777', '#ea580c', '#4f46e5', '#16a34a', '#b45309',
]

function hashCode(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function MapSection({
  groups,
  plans,
}: {
  groups: [number, ItinerarySpot[]][]
  plans: HotelPlan[]
}) {
  const [mode, setMode] = useState<'same_hotel' | 'follow_route'>(
    plans[0]?.mode ?? 'same_hotel',
  )
  useEffect(() => {
    if (!plans.some((p) => p.mode === mode) && plans[0]) setMode(plans[0].mode)
  }, [plans, mode])

  const plan = plans.find((p) => p.mode === mode) ?? plans[0]
  const days = groups.filter(([, spots]) => spots.length > 0)
  if (days.length === 0 || !plan) return null

  // 每天对应的酒店名
  const hotelByDay = new Map<number, string>()
  if (plan.mode === 'same_hotel' && plan.hotels[0]) {
    for (const [day] of days) hotelByDay.set(day, plan.hotels[0].name)
  } else {
    for (const h of plan.hotels) {
      const m = /第\s*(\d+)\s*天/.exec(h.stayRange ?? '')
      if (m) hotelByDay.set(Number(m[1]), h.name)
    }
    // 缺失的天回退到第一个
    for (const [day] of days) {
      if (!hotelByDay.has(day) && plan.hotels[0]) hotelByDay.set(day, plan.hotels[0].name)
    }
  }

  // 布局：每天一个簇，蛇形排列
  const COLS = Math.min(3, Math.max(1, days.length))
  const CW = 280
  const CH = 205
  const R = Math.min(62, 34 + days.reduce((mx, [, ss]) => Math.max(mx, ss.length), 0) * 7)
  const cols = Math.min(COLS, days.length)
  const rows = Math.ceil(days.length / cols)
  const width = cols * CW + 40
  const height = rows * CH + 40

  const clusters = days.map(([day, spots], i) => {
    const row = Math.floor(i / cols)
    const colInRow = i % cols
    const col = row % 2 === 1 ? cols - 1 - colInRow : colInRow
    const cx = 20 + col * CW + CW / 2
    const cy = 20 + row * CH + CH / 2
    const ordered = [...spots].sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    const positioned = ordered.map((sp, j) => {
      const jitter = ((hashCode(sp.name) % 14) - 7) * (Math.PI / 180)
      const angle = -Math.PI / 2 + (j / Math.max(1, ordered.length)) * Math.PI * 2 + jitter * 0.3
      return {
        spot: sp,
        x: cx + R * Math.cos(angle),
        y: cy + R * 0.82 * Math.sin(angle),
      }
    })
    return { day, cx, cy, color: DAY_COLORS[(day - 1) % DAY_COLORS.length], positioned, hotel: hotelByDay.get(day) ?? '' }
  })

  return (
    <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
      <PanelTitle
        icon={<MapIcon className="h-4 w-4" />}
        title="景点与酒店的关系图"
        note="编排示意：点位按每日分簇排布，连线表示当天住宿到景点的顺路关系"
      />

      {/* 酒店方案切换（与下方方案区联动数据） */}
      <div className="mt-4 flex flex-wrap gap-2">
        {plans.map((p) => (
          <button
            key={p.mode}
            type="button"
            onClick={() => setMode(p.mode)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              p.mode === mode
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border/60 bg-[repeating-linear-gradient(45deg,hsl(150_30%_97%)_0px,hsl(150_30%_97%)_10px,hsl(150_25%_94%)_10px,hsl(150_25%_94%)_20px)] p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[560px]" role="img" aria-label="景点与酒店关系示意地图">
          {/* 簇间连线路径（蛇形） */}
          {clusters.slice(1).map((c, i) => {
            const prev = clusters[i]
            return (
              <path
                key={`path-${c.day}`}
                d={`M ${prev.cx} ${prev.cy} C ${(prev.cx + c.cx) / 2} ${prev.cy}, ${(prev.cx + c.cx) / 2} ${c.cy}, ${c.cx} ${c.cy}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="6 5"
                opacity="0.55"
              />
            )
          })}

          {clusters.map((c) => (
            <g key={`cluster-${c.day}`}>
              {/* 当天酒店 → 各景点虚线 */}
              {c.positioned.map((pt) => (
                <line
                  key={`ln-${c.day}-${pt.spot.id}`}
                  x1={c.cx}
                  y1={c.cy}
                  x2={pt.x}
                  y2={pt.y}
                  stroke={c.color}
                  strokeWidth="1.4"
                  strokeDasharray="3 3"
                  opacity="0.65"
                />
              ))}

              {/* 景点节点 */}
              {c.positioned.map((pt) => (
                <g key={`sp-${c.day}-${pt.spot.id}`}>
                  <circle cx={pt.x} cy={pt.y} r="13" fill="#fff" stroke={c.color} strokeWidth="2" />
                  <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={c.color}>
                    {pt.spot.edited ? '✎' : c.day}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y < c.cy - 10 ? pt.y - 20 : pt.y + 26}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="#334155"
                  >
                    {pt.spot.name.length > 7 ? `${pt.spot.name.slice(0, 7)}…` : pt.spot.name}
                  </text>
                </g>
              ))}

              {/* 当天酒店（簇中心） */}
              <g>
                <circle cx={c.cx} cy={c.cy} r="19" fill="#064e3b" stroke="#fff" strokeWidth="2.5" />
                <text x={c.cx} y={c.cy + 5} textAnchor="middle" fontSize="14">🏨</text>
                <text
                  x={c.cx}
                  y={c.cy + 36}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="600"
                  fill="#064e3b"
                >
                  {c.hotel.length > 8 ? `${c.hotel.slice(0, 8)}…` : c.hotel}
                </text>
                <text
                  x={c.cx - CW / 2 + 10}
                  y={c.cy - CH / 2 + 16}
                  textAnchor="start"
                  fontSize="11"
                  fontWeight="700"
                  fill={c.color}
                >
                  Day {c.day}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-950" /> 当天入住酒店
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-emerald-600 bg-white" /> 当天游玩点位
        </span>
        <span>虚线为酒店到点位的顺路示意；切换上方方案，地图会跟着换酒店重画。</span>
      </div>
    </section>
  )
}
