# 途策 · Travel Growth Copilot

保留 React 19 + TypeScript + Vite / Express 的旅行规划原型，在现有绿色卡片风格的 Strategy Lab 中增量加入数据驱动增长分析。C端原有行程、酒店与景点调整逻辑保留。原有单用户策略组件仍保存在源码中，但B端主入口使用群体行为分析，不再由出行表单直接推断运营结论。

> **全部数据为 synthetic data**：无真实用户、订单、投放或商业结果。策略使用确定性模板读取分析聚合，未调用外部大模型，未运行线上实验。

## 启动

需要 Node 22.12+ 和 Python 3.10+。Python只使用标准库。

```bash
python data/generate_travel_data.py
python data/analysis.py
cd backend
npm ci
npm run dev
```

另一终端：

```bash
cd frontend
npm ci
npm run dev
```

Vite端口5173代理 `/api` 到Express端口3000。B端JSON随前端构建，无需Python服务、数据库或模型密钥；C端仍调用现有Express规则引擎。选择“Strategy Lab 运营后台”进入B端。

```bash
python -m unittest discover -s data -p 'test_*.py'
cd frontend && npm run build
# 在仓库根目录另行执行：
cd backend && npm run build
```

## 数据及血缘

固定随机种子8160，观察期2026-09-21至2026-10-20，生成10,000名用户。新注册用户只有注册后的每日记录，所以每日表小于300,000行；无访问日记录为0。

- `data/travel_users.csv`：用户属性及30天聚合。
- `data/travel_events.csv`：逐用户逐日行为计数，是所有窗口指标的数据源。
- `data/user_segments.csv`：用户ID、分层及RFM结果。
- `frontend/src/data/growth-analysis.json`：Python分析产物，包含周期指标、漏斗、分层聚合、偏好、渠道表现及带数据引用的策略；重新运行分析后前端同步更新。

| 字段 | 含义 |
|---|---|
| user_id | SYN前缀的合成ID |
| age_group / city | 模拟年龄段、城市 |
| register_date / last_active_date | 注册日、末次活跃日；从未活跃时以注册日作为分层保守代理 |
| visit_frequency | 30天访问天数 |
| search_count / detail_clicks / favorites | 30天搜索次数、详情次数、收藏次数 |
| orders / gmv / avg_order_value | 30天订单数、人民币GMV、GMV/订单数 |
| coupon_received / coupon_used | 领券张数、使用张数；最多每单一张 |
| destination_type / travel_type | 模拟目的地与出游类型偏好 |
| price_preference / channel | low/medium/premium价格偏好、模拟归因渠道 |
| historical_orders / historical_gmv | 观察期前历史订单数/GMV，不与30天指标重复相加 |
| last_order_date | 末次订单日；从未支付为空 |
| synthetic_data | 每行固定true |

每日表含 user_id/date/visits/search_count/detail_clicks/favorites/orders/gmv/coupon_received/coupon_used/synthetic_data。嵌套行为生成保证同一天订单必先收藏、收藏必先详情等。偏好是用户属性计数，渠道是单一用户归因；不是多触点归因。模拟数据用于验证产品链路，不用于推断真实市场。

## 分层规则（互斥，按以下顺序）

R=距末次订单天数（无订单为空）；F=历史+观察期订单；M=历史+观察期GMV。旅游业务补充最近活跃与低频决策行为，非通用RFM分位打分。

1. 新用户：注册≤7天且30天访问<4天。
2. 高价值：最近活跃≤7天、30天访问≥10天且M≥5000。
3. 高意向未转化：30天搜索≥5、详情≥5、收藏≥2且最近7天订单=0。
4. 价格敏感：已用券/已领券≥20%且价格偏好low。
5. 潜在流失：F>0且最近活跃间隔≥14天，或F>0且前15天访问≥4、后15天访问≤前期30%。
6. 其他：规则兜底。

优先级影响群体归属；高价值用户即使偏好低价仍先归高价值。高意向群体近7天未下单不等于整个30天从未支付。界面提供 Segmentation Logic 入口展示规则和指标口径。

## 指标公式

窗口内按user_id去重：Active Users=visits>0；Search Users=search_count>0；Detail UV=detail_clicks>0；Favorite Users=favorites>0；Paying Users=orders>0。

- GMV：窗口内日GMV求和（本原型未模拟退款，不称净收入）。
- 全站/群体CVR：支付UV/活跃UV。
- AOV：GMV/订单数。GMV贡献：群体GMV/全部GMV。
- Coupon Redemption Rate：已用券张数/已领券张数，不是用券用户占比。
- Search Rate：搜索UV/访问UV；Detail CTR：详情UV/搜索UV；Favorite Rate：收藏UV/详情UV；漏斗末段Purchase CVR：支付UV/收藏UV。
- 最大流失：相邻步骤中`1-下游UV/上游UV`最大者；同时展示损失人数。相对流失与绝对损失不是同一指标。
- 首页变化：后15天 vs 前15天。人数/金额展示相对变化，比例展示百分点差；上期为0时相对变化显示N/A。其余分析使用完整30天窗口。
- 分母为0时聚合返回0；实验对照无券的领券指标应报告N/A。

该漏斗是跨日去重的嵌套行为覆盖漏斗，不是会话漏斗或严格的事件序列耗时分析。生成模型天然具有嵌套关系，上线需用时间戳和真实事件定义重算。

## 核心业务闭环

**What happened**：Overview指标和周期变化 → **Who**：Audience数据规则分层与Segment Explorer → **Why**：Funnel定位流失，结合目的地和渠道分析提出解释假设 → **Action**：读取所选分层结果，生成包含Target、Insight、Action、Channel、Offer、Timing、Metric、Evidence的策略 → **Does it work**：由策略创建A/B实验草案。

Growth Analytics分布在Overview、Audience、Funnel导航，复用模块而非额外重复页面，共六类图表；图下洞察由对应聚合数据生成。诊断是描述性关联，不证明原因。优惠额度、触达时机是显式待验证假设，不冒充观察结果。

策略演示为无外部依赖的规则模板，按钮明确标注这一点。未来接模型应仅传入脱敏聚合结果，校验输出引用的数据字段与数值；不能让模型自己编造用户洞察。

实验草案含目标群体、Control/Treatment、ITT主指标、次指标、ROI/退款护栏、稳定用户级1:1分流、样本量规划及停止规则。没有实际随机分配、发送或结果；当前没有成本、授权及退款数据，因此不展示虚构ROI/退款率。实验状态为当前页面内存，不是持久化实验管理系统。

## 本次验证与运行修复

- 数据一致性4项测试通过：用户群互斥覆盖、GMV守恒、嵌套漏斗/优惠券约束、策略引用一致性。
- 前端TypeScript/Vite生产构建及后端TypeScript构建通过。
- 原后端系统测试7项通过；原C端`POST /api/growth/analyze`经前端代理返回200，包含行程与原策略结构。
- B端入口、分析JSON及模块经本地HTTP加载成功；尚未执行浏览器自动化或线上部署验证。
- 将锁文件腾讯镜像地址切换为官方npm源，保留已有版本与integrity校验，补齐原锁文件遗漏的GSAP依赖。
- 修复原后端`type: module`与CommonJS产物冲突：使用NodeNext并为本地模块导入补`.js`后缀，生产`node dist/index.js`已启动验证。
- Vite仍有主包体积提示（约985KB未gzip），不影响构建；本次未做大规模拆包重构。

实验样本量参考使用双侧两比例正态近似：每组n≈[1.96√(2p̄(1−p̄))+0.84√(p₀(1−p₀)+p₁(1−p₁))]²/(p₁−p₀)²，p₁=1.2p₀。仅作可行性估算，30天观察基线不能直接作为14天ITT实验基线；实际实验需重新估计、核对可触达样本与成本护栏。

## 发布新网站

参见[Render部署说明](DEPLOY.md)。根目录`render.yaml`可创建一个同时托管前后端的Web Service；生产环境Express提供前端dist与API，保留C端全部接口。本地生产模式的页面、构建资源、图片、健康检查与行程生成接口已通过HTTP验证。尚未创建Render服务或取得线上地址；需要账号持有者在Render授权GitHub并创建Blueprint。
