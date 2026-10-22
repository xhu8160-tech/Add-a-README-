import {
  AlertTriangle,
  BellRing,
  Copy,
  EyeOff,
  Gauge,
  Megaphone,
  Percent,
  ShieldAlert,
  Tag,
  Target,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { StrategyReport, TravelerProfile } from '@/types/growth'
import { PRIORITY_STYLE, RISK_STYLE, SOURCE_STYLE } from './constants'

interface Props {
  report: StrategyReport
  profile: TravelerProfile
}

export function StrategyLabPanel({ report, profile }: Props) {
  const risk = RISK_STYLE[report.risk.level]
  const prio = PRIORITY_STYLE[report.priority]

  return (
    <div className="space-y-6">
      {/* 顶部状态条 */}
      <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Strategy Lab 运营策略报告</h2>
            <span className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
              <EyeOff className="h-2.5 w-2.5" />
              平台运营后台视图 · 游客不可见
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${prio.chip}`}>
              {prio.label}
            </span>
            <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${risk.chip}`}>
              {risk.label} · {report.risk.score}
            </span>
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">自动推理依据　</span>
            {report.ruleNote}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground/80">
            策略生成时间 {new Date(report.generatedAt).toLocaleString('zh-CN')} ·
            客群 {profile.destination} / {profile.days} 天
          </p>
        </div>
      </section>

      {/* 报告级模拟声明 */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          本报告为业务原型模拟，非真实业务数据；触达渠道、文案方向与效果预估均用于策略演示，未接入任何真实投放或第三方接口。
        </p>
      </div>

      {/* 1. 用户画像 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <SectionTitle
          index="1"
          icon={<Tag className="h-4 w-4" />}
          title="用户画像"
          note="由全部表单字段自动推导，不依赖用户手动选择行为"
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {report.persona.tags.map((t) => {
                const s = SOURCE_STYLE[t.source]
                return (
                  <span
                    key={t.code}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${s.cls}`}
                  >
                    {t.label}
                    <span className="text-[10px] opacity-70">{t.weight.toFixed(2)}</span>
                  </span>
                )
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {report.persona.summary}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4">
            <MiniStat label="消费能力指数" value={`${report.persona.valueIndex}`} suffix="/ 100" />
            <div className="h-px bg-border/60" />
            <MiniStat label="决策阶段" value={report.persona.decisionStage} small />
          </div>
        </div>

        {/* 画像冲突 */}
        <div className="mt-5">
          {report.persona.conflicts.length > 0 ? (
            <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                <span className="text-xs font-semibold text-warning">
                  检测到 {report.persona.conflicts.length} 项画像冲突，已更新画像
                </span>
              </div>
              <ul className="mt-3 space-y-3">
                {report.persona.conflicts.map((c, i) => (
                  <li key={i} className="text-xs leading-relaxed">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 text-muted-foreground line-through">
                        {c.from}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 font-medium text-warning">
                        {c.to}
                      </span>
                    </div>
                    <p className="mt-1.5 text-muted-foreground">
                      <span className="font-medium text-foreground/80">变化原因：</span>
                      {c.reason}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              各字段之间一致，未触发冲突修正。
            </div>
          )}
        </div>
      </section>

      {/* 2. 流失风险判定 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <SectionTitle
          index="2"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="流失风险判定"
          note={`高风险优先推送 · 挽留窗口 ${report.risk.windowMinutes} 分钟`}
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${riskText(report.risk.level)}`}>
                {report.risk.score}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
              <span className={`ml-auto rounded px-2 py-0.5 text-xs font-semibold ${risk.chip}`}>
                {risk.label}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${risk.bar}`}
                style={{ width: `${report.risk.score}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>低</span>
              <span>中</span>
              <span>高</span>
            </div>
          </div>

          <ul className="space-y-2.5">
            {report.risk.reasons.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${risk.dot}`} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. 运营干预策略 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <SectionTitle
          index="3"
          icon={<Megaphone className="h-4 w-4" />}
          title="运营干预策略"
          note="触达渠道 + 时机 + 文案方向"
        />

        <div className="mt-5 space-y-4">
          {report.interventions.map((iv, idx) => (
            <div key={iv.id} className="rounded-lg border border-border p-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-semibold text-muted-foreground">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-semibold">{iv.name}</h4>
                <Badge
                  className={`text-[11px] ${
                    iv.channel === 'app_popup'
                      ? 'bg-info/10 text-info hover:bg-info/10'
                      : 'bg-muted text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {iv.channel === 'app_popup' ? (
                    <BellRing className="mr-1 h-3 w-3" />
                  ) : (
                    <Megaphone className="mr-1 h-3 w-3" />
                  )}
                  {iv.channelLabel}
                </Badge>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="触达时机" value={iv.timing} />
                <Field label="运营目标" value={iv.objective} />
                <Field label="文案方向" value={iv.copyDirection} className="md:col-span-2" />
                <Field label="权益钩子" value={iv.hook} />
                <div className="md:col-span-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">文案示例</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-muted-foreground"
                      onClick={() => {
                        void navigator.clipboard
                          ?.writeText(iv.copySample)
                          .then(() => toast.success('文案已复制'))
                          .catch(() => toast.error('复制失败'))
                      }}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      复制
                    </Button>
                  </div>
                  <p className="rounded-md border border-border/60 bg-muted/40 px-3.5 py-3 text-sm leading-relaxed">
                    {iv.copySample}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 预估效果 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <SectionTitle
          index="4"
          icon={<TrendingUp className="h-4 w-4" />}
          title="预估效果"
          note="策略模拟评估 · 非真实业务数据"
        />

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <EffectStat
            icon={<Percent className="h-3.5 w-3.5" />}
            label="转化率提升"
            value={`+${report.effect.liftPct}`}
            suffix="pp"
            tone="red"
          />
          <EffectStat label="基线转化率" value={`${report.effect.baselineCvr}`} suffix="%" />
          <EffectStat
            label="预估转化率"
            value={`${report.effect.projectedCvr}`}
            suffix="%"
            tone="red"
          />
          <EffectStat
            label="预估增量 GMV"
            value={`¥${(report.effect.incrementalGmv / 10000).toFixed(1)}`}
            suffix="万 / 日"
            tone="red"
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {report.effect.disclaimer}
            <span className="ml-1">
              预估置信度：
              <span className="font-medium text-foreground">
                {report.effect.confidence === 'high' ? '高' : '中'}
              </span>
            </span>
          </p>
        </div>
      </section>

      {/* 5. 策略优先级 */}
      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
        <SectionTitle
          index="5"
          icon={<Target className="h-4 w-4" />}
          title="策略优先级标注"
          note="高风险优先推送"
        />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`rounded-md px-3 py-1.5 text-sm font-bold ${prio.chip}`}>
            {prio.label}
          </span>
          <span className="text-xs text-muted-foreground">{prio.desc}</span>
        </div>
        <p className="mt-3.5 text-sm leading-relaxed text-muted-foreground">
          {report.priorityReason}
        </p>
      </section>

      <p className="px-1 text-xs leading-relaxed text-muted-foreground">
        本报告所有外部信息（景点库存、酒店房价、交通班次、天气）均为业务原型模拟，未接入任何真实第三方接口；
        效果预估为策略模拟评估，非真实业务数据。
      </p>
    </div>
  )
}

function riskText(level: 'high' | 'mid' | 'low') {
  return level === 'high' ? 'text-theme-red' : level === 'mid' ? 'text-warning' : 'text-success'
}

function SectionTitle({
  index,
  icon,
  title,
  note,
}: {
  index: string
  icon: React.ReactNode
  title: string
  note?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
        {index}
      </span>
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-semibold">{title}</h3>
      {note && <span className="text-xs text-muted-foreground">· {note}</span>}
    </div>
  )
}

function Field({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  suffix,
  small,
}: {
  label: string
  value: string
  suffix?: string
  small?: boolean
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-0.5 font-semibold ${small ? 'text-sm' : 'text-xl'}`}>
        {value}
        {suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}

function EffectStat({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  suffix?: string
  tone?: 'red'
}) {
  return (
    <div className="rounded-lg border border-border/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`mt-1.5 text-2xl font-bold ${tone === 'red' ? 'text-theme-red' : ''}`}>
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  )
}
