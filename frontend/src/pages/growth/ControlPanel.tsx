import { useMemo } from 'react'
import {
  CalendarDays,
  Check,
  Gauge,
  Loader2,
  MapPin,
  Navigation,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type {
  BudgetMode,
  BudgetTier,
  FocusTag,
  HotelPrefTag,
  TicketPref,
  TravelPace,
  TravelerProfile,
  TravelerSegment,
} from '@/types/growth'
import {
  BUDGET_STOPS,
  BUDGET_ZONES,
  CUSTOM_FOCUS_MAX_LEN,
  FOCUS_RULE_HINT,
  HOLIDAY_OPTIONS,
} from './constants'

interface Props {
  profile: TravelerProfile
  destinationDraft: string
  originDraft: string
  budgetTotalDraft: string
  onDestinationDraft: (v: string) => void
  onOriginDraft: (v: string) => void
  onBudgetTotalDraft: (v: string) => void
  onCommitDestination: (v: string) => void
  onCommitOrigin: (v: string) => void
  segments: { value: TravelerSegment; label: string }[]
  budgets: { value: BudgetTier; label: string }[]
  budgetModes: { value: BudgetMode; label: string }[]
  focuses: { value: FocusTag; label: string; desc?: string }[]
  maxFocus: number
  paces: { value: TravelPace; label: string; hint?: string }[]
  hotelPrefs: { value: HotelPrefTag; label: string; desc?: string }[]
  ticketPrefs: { value: TicketPref; label: string; desc?: string }[]
  presets: string[]
  originPresets: string[]
  loading: boolean
  onPatch: <K extends keyof TravelerProfile>(key: K, value: TravelerProfile[K]) => void
  onToggleFocus: (v: FocusTag) => void
  onToggleHotelPref: (v: HotelPrefTag) => void
  onRangeChange: (min: number, max: number) => void
  onRun: () => void
}

export function ControlPanel({
  profile,
  destinationDraft,
  originDraft,
  budgetTotalDraft,
  onDestinationDraft,
  onOriginDraft,
  onBudgetTotalDraft,
  onCommitDestination,
  onCommitOrigin,
  segments,
  budgetModes,
  focuses,
  maxFocus,
  paces,
  hotelPrefs,
  ticketPrefs,
  presets,
  originPresets,
  loading,
  onPatch,
  onToggleFocus,
  onToggleHotelPref,
  onRangeChange,
  onRun,
}: Props) {
  // 输入模式：总预算 → 折算每日人均
  const perDayFromTotal = useMemo(() => {
    const total = Number(budgetTotalDraft)
    if (!Number.isFinite(total) || total <= 0) return null
    return Math.round(total / Math.max(1, profile.days))
  }, [budgetTotalDraft, profile.days])

  const totalFromRange = useMemo(
    () => Math.round(((profile.budgetMin + profile.budgetMax) / 2) * profile.days),
    [profile.budgetMin, profile.budgetMax, profile.days],
  )

  return (
    <div className="space-y-4">
      {/* 步骤 1：基础信息 */}
      <section>
        <StepTitle index="01" title="你的出行信息" />

        <div className="mt-3.5 grid gap-x-6 gap-y-4 lg:grid-cols-2">
          {/* 出发地 → 目的地 */}
          <div>
            <FieldLabel icon={<Navigation className="h-3 w-3" />}>从哪儿出发</FieldLabel>
            <Input
              id="origin"
              value={originDraft}
              placeholder="如：北京（可留空表示本地出发）"
              onChange={(e) => onOriginDraft(e.target.value)}
              onBlur={(e) => onCommitOrigin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitOrigin(originDraft)
              }}
              className="mt-1.5"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {originPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onCommitOrigin(profile.origin === p ? '' : p)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    profile.origin === p
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {profile.origin && profile.origin !== profile.destination
                ? `将为你规划 ${profile.origin} → ${profile.destination} 的往返交通与预算占比。`
                : '选出发地后，会额外给一份城际往返交通预算规划。'}
            </p>
          </div>

          {/* 目的地 */}
          <div>
            <FieldLabel icon={<MapPin className="h-3 w-3" />}>要去哪里</FieldLabel>
            <Input
              id="destination"
              value={destinationDraft}
              placeholder="如：杭州"
              onChange={(e) => onDestinationDraft(e.target.value)}
              onBlur={(e) => onCommitDestination(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCommitDestination(destinationDraft)
              }}
              className="mt-1.5"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onCommitDestination(p)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    profile.destination === p
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 天数 */}
          <div>
            <FieldLabel icon={<CalendarDays className="h-3 w-3" />}>玩几天</FieldLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onPatch('days', d)}
                  className={`h-8 w-8 rounded-md border text-sm transition-colors ${
                    profile.days === d
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {d}
                </button>
              ))}
              <span className="self-center text-xs text-muted-foreground">天</span>
            </div>
          </div>

          {/* 什么时候去（选填） */}
          <div>
            <FieldLabel>什么时候去</FieldLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {HOLIDAY_OPTIONS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => onPatch('holiday', profile.holiday === h ? undefined : h)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    profile.holiday === h
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* 预算：双模式 */}
          <div>
            <div className="flex items-center justify-between">
              <FieldLabel icon={<Wallet className="h-3 w-3" />}>预算怎么给</FieldLabel>
              <div className="flex rounded-md border border-border p-0.5">
                {budgetModes.map((m) => {
                  const active = profile.budgetMode === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => onPatch('budgetMode', m.value)}
                      className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {profile.budgetMode === 'range' ? (
              <div className="mt-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">每日人均</span>
                  <span className="text-base font-bold text-theme-green">
                    ¥{profile.budgetMin}
                    <span className="mx-1 font-normal text-muted-foreground">—</span>
                    ¥{profile.budgetMax}
                  </span>
                </div>
                <RangeSlider
                  stops={BUDGET_STOPS as unknown as number[]}
                  valueMin={profile.budgetMin}
                  valueMax={profile.budgetMax}
                  onChange={onRangeChange}
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  {[0, 300, 1000, 3000, 10000].map((t) => (
                    <span key={t}>{t >= 10000 ? '¥1万' : `¥${t}`}</span>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {BUDGET_ZONES.map((z) => {
                    const on =
                      (z.label === '易达成' && profile.budgetMax <= 300) ||
                      (z.label === '舒适' && profile.budgetMax > 300 && profile.budgetMax <= 1500) ||
                      (z.label === '高端' && profile.budgetMax > 1500)
                    return (
                      <div
                        key={z.label}
                        className={`rounded-md border px-2 py-1.5 text-center transition-colors ${
                          on ? 'border-primary bg-primary/5' : 'border-border/70'
                        }`}
                      >
                        <div className={`text-[11px] font-semibold ${on ? 'text-primary' : 'text-muted-foreground'}`}>
                          {z.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{z.range}</div>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  按这个区间，{profile.days} 天总共约　
                  <span className="font-semibold text-foreground">
                    ¥{totalFromRange.toLocaleString('zh-CN')}
                  </span>
                  ／人
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <Label htmlFor="budgetTotal" className="text-xs text-muted-foreground">
                  这趟总预算（每人，元）
                </Label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ¥
                  </span>
                  <Input
                    id="budgetTotal"
                    inputMode="numeric"
                    value={budgetTotalDraft}
                    placeholder="例如 4500"
                    onChange={(e) => onBudgetTotalDraft(e.target.value.replace(/[^\d]/g, ''))}
                    className="pl-7"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[2000, 3500, 5000, 8000, 15000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onBudgetTotalDraft(String(v))}
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        budgetTotalDraft === String(v)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      ¥{v.toLocaleString('zh-CN')}
                    </button>
                  ))}
                </div>
                {perDayFromTotal !== null && (
                  <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    按 {profile.days} 天折算，相当于每日人均　
                    <span className="font-semibold text-foreground">
                      ¥{perDayFromTotal.toLocaleString('zh-CN')}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 出行人群 */}
          <div>
            <FieldLabel>和谁一起</FieldLabel>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {segments.map((s) => {
                const active = profile.segment === s.value
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onPatch('segment', s.value)}
                    title={s.label}
                    className={`flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
                    }`}
                  >
                    {active && <Check className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 步骤 2：本次出行最关注事项（多选） */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <StepTitle index="02" title="本次出行最关注事项" note="多选" />
          <span className="shrink-0 text-[10px] text-muted-foreground">
            已选 {profile.focusTags.length} / {maxFocus}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          勾选的关注点会直接作为输入条件，决定行程、交通与酒店的生成方向。
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {focuses.map((f) => {
            const active = profile.focusTags.includes(f.value)
            const atLimit = !active && profile.focusTags.length >= maxFocus
            return (
              <button
                key={f.value}
                type="button"
                disabled={atLimit}
                onClick={() => onToggleFocus(f.value)}
                title={atLimit ? `最多选择 ${maxFocus} 个关注点` : undefined}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
                    : atLimit
                      ? 'cursor-not-allowed border-border/60 opacity-45'
                      : 'border-border hover:border-foreground/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      active ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium leading-snug">{f.label}</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {f.desc ?? FOCUS_RULE_HINT[f.value]}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 自定义出行关注点（选填） */}
        <div className="mt-4">
          <Label htmlFor="customFocus" className="text-xs text-muted-foreground">
            自定义出行关注点（选填）
          </Label>
          <Input
            id="customFocus"
            value={profile.customFocus}
            maxLength={CUSTOM_FOCUS_MAX_LEN}
            placeholder="例如：想住有院子的民宿、避开人多的时段"
            onChange={(e) => onPatch('customFocus', e.target.value)}
            className="mt-1.5 text-sm"
          />
          <p className="mt-1 text-right text-[10px] text-muted-foreground">
            {profile.customFocus.length}/{CUSTOM_FOCUS_MAX_LEN}
          </p>
        </div>
      </section>

      {/* 步骤 3：行程节奏（单选） */}
      <section>
        <StepTitle index="03" title="行程节奏" note="单选" />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          决定每天排几个点位，以及是否预留休息时间。
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {paces.map((p) => {
            const active = profile.pace === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onPatch('pace', p.value)}
                className={`rounded-lg border px-3 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
                    : 'border-border hover:border-foreground/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm font-medium">{p.label}</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{p.hint}</p>
              </button>
            )
          })}
        </div>
      </section>

      {/* 步骤 4：酒店偏好（多选） */}
      <section>
        <div className="flex items-center justify-between gap-2">
          <StepTitle index="04" title="酒店偏好" note="多选" />
          <span className="shrink-0 text-[10px] text-muted-foreground">
            已选 {profile.hotelPrefs.length} / {hotelPrefs.length}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          酒店推荐会同时权衡价格与到每日点位的通勤便利性，勾选越多匹配越精准。
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {hotelPrefs.map((h) => {
            const active = profile.hotelPrefs.includes(h.value)
            return (
              <button
                key={h.value}
                type="button"
                onClick={() => onToggleHotelPref(h.value)}
                className={`w-full rounded-lg border px-3.5 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
                    : 'border-border hover:border-foreground/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      active ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-primary-foreground" />}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium leading-snug">{h.label}</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {h.desc}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

      </section>

      {/* 步骤 5：门票偏好（单选） */}
      <section>
        <StepTitle index="05" title="门票怎么打算" note="单选" />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          直接影响排不排收费景点，避免给你塞不想要的高价门票。
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {ticketPrefs.map((t) => {
            const active = profile.ticketPref === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onPatch('ticketPref', t.value)}
                className={`w-full rounded-lg border px-3.5 py-3 text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/25'
                    : 'border-border hover:border-foreground/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      active ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {active && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-medium leading-snug">{t.label}</span>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {t.desc}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <Button className="w-full" size="lg" onClick={onRun} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在生成…
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            生成我的行程和策略
          </>
        )}
      </Button>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        改完任意条件后点生成，行程方案和运营策略会一起更新。
      </p>
    </div>
  )
}

/** 双滑块区间选择器 */
function RangeSlider({
  stops,
  valueMin,
  valueMax,
  onChange,
}: {
  stops: number[]
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}) {
  const last = stops.length - 1
  // 把金额映射到最近的档位索引
  const toIdx = (v: number) => {
    let best = 0
    let diff = Infinity
    stops.forEach((s, i) => {
      const d = Math.abs(s - v)
      if (d < diff) {
        diff = d
        best = i
      }
    })
    return best
  }
  const idxMin = toIdx(valueMin)
  const idxMax = Math.max(idxMin + 1, toIdx(valueMax))
  const pct = (i: number) => (i / last) * 100

  return (
    <div>
      <div className="relative h-8 select-none">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct(idxMin)}%`, width: `${Math.max(0, pct(idxMax) - pct(idxMin))}%` }}
        />
        {/* 低区间高亮：0-300 更容易拉到 */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-l-full bg-primary/25"
          style={{ left: 0, width: `${pct(toIdx(300))}%` }}
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={idxMin}
          onChange={(e) => {
            const i = Math.min(Number(e.target.value), idxMax - 1)
            onChange(stops[i], stops[idxMax])
          }}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
          style={{ zIndex: idxMin > last * 0.85 ? 5 : 3 }}
          aria-label="预算下限"
        />
        <input
          type="range"
          min={0}
          max={last}
          step={1}
          value={idxMax}
          onChange={(e) => {
            const i = Math.max(Number(e.target.value), idxMin + 1)
            onChange(stops[idxMin], stops[i])
          }}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-8 w-full -translate-y-1/2 appearance-none bg-transparent
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
          style={{ zIndex: 4 }}
          aria-label="预算上限"
        />
      </div>
    </div>
  )
}

function StepTitle({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
        {index}
      </span>
      <h2 className="text-sm font-semibold">{title}</h2>
      {note && (
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {note}
        </span>
      )}
    </div>
  )
}

function FieldLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {icon}
      {children}
    </div>
  )
}
