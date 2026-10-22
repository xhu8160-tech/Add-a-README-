# 途策 | Travel Growth Copilot — 源代码包

## 内容
- `frontend/` — React 19 + Vite 7 + TypeScript 5.9 + Tailwind CSS v4 + shadcn/ui
- `backend/` — Express 5 + TypeScript（纯规则引擎，无 LLM、无真实第三方接口）

## 本地运行

### 后端（端口 3000）
```bash
cd backend
pnpm install
pnpm dev          # 开发模式（tsx 热重载）
pnpm build && pnpm start   # 生产模式
```

### 前端（端口 5173，/api 代理到 3000）
```bash
cd frontend
pnpm install
pnpm dev
```

浏览器打开 http://localhost:5173 即可。

## 关键文件
| 文件 | 作用 |
|---|---|
| backend/src/modules/growth/engine.ts | 核心策略引擎（~2500 行）：行程打分 / 酒店匹配+房型 / 跨城交通比价 / 优惠券 / Strategy Lab |
| backend/src/modules/growth/types.ts | 全部领域模型（TravelerProfile / Itinerary / HotelPlan / HotelRoomOption / TransportPlan...） |
| backend/src/modules/growth/index.ts | `GET /api/growth/meta`（表单元数据）、`POST /api/growth/analyze`（生成） |
| frontend/src/pages/Index.tsx | 主页面：品牌区 + 上（输入）下（输出）布局 + Tab |
| frontend/src/pages/growth/ControlPanel.tsx | 输入表单：出行信息 / 关注事项 / 节奏 / 酒店偏好 / 门票偏好 / 假期标签 / 预算非线性滑块 |
| frontend/src/pages/growth/ItineraryPanel.tsx | 行程输出：提示卡 / 逐日行程 / SVG 地图 / 先选住法再看酒店 / 交通折叠 / 预算 |
| frontend/src/types/growth.ts | 前端类型（与后端 types.ts 同步 + MetaOption/MetaResponse） |

## 接口
- `GET /api/growth/meta` — 表单下拉/标签元数据
- `POST /api/growth/analyze` — 传入 TravelerProfile（+ spotOverrides 点位调整），返回 `{ ok, profile, itinerary, strategyLab }`

## 免责
全链路为业务原型模拟，天气 / 库存 / 价格 / 交通班次均为规则生成的模拟数据。
