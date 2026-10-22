# 发布新网站：Render

本项目已配置为一个Render Web Service：Express提供前端构建资源和`/api`接口。不要仅部署成Static Site，否则C端行程API无法工作。

## 1. 上传GitHub

解压Render部署包，将包内文件及frontend、backend、data目录直接放在GitHub仓库根目录。`render.yaml`应位于根目录，而非再嵌套一层文件夹。可使用当前空仓库`xhu8160-tech/Add-a-README-`或新建仓库；不要上传node_modules、.env或任何密钥。

## 2. 在Render创建Blueprint

登录 https://dashboard.render.com/ ，选择 **New → Blueprint**，连接GitHub并选择上述仓库和包含代码的分支。Render读取根目录`render.yaml`后，检查配置并创建服务。

配置定义为free计划；如果账号/地区不提供该计划，先检查可用计划及费用，再选择是否改为付费。免费服务可能冷启动，演示前提前访问等待唤醒。

本原型不需要数据库、模型API Key或其他密钥。Render注入PORT，服务读取该端口。数据JSON已包含在源码中，无需在Render安装Python。数据更新可在本地运行两个Python脚本，再提交CSV和JSON。

## 手动创建Web Service（Blueprint不可用时）

- Runtime：Node
- Root Directory：留空（仓库根目录）
- Build Command：

```bash
npm ci --include=dev --prefix frontend && npm run build --prefix frontend && npm ci --include=dev --prefix backend && npm run build --prefix backend
```

- Start Command：`cd backend && npm start`
- Health Check Path：`/api/health`
- Environment：`NODE_VERSION=22.16.0`、`NODE_ENV=production`、`API_PREFIX=/api`

必须包含`--include=dev`：构建需要TypeScript和Vite，即使NODE_ENV为production。

## 3. 验收

部署显示Live后，使用Render生成的实际HTTPS地址：

1. 首页图片与样式加载；C端可生成行程。
2. 点击“Strategy Lab 运营后台”，查看指标、Audience、Funnel、策略到实验的跳转。
3. `/api/health`返回健康JSON。
4. 直接打开`/?tab=lab`可进入B端。

本地已验证生产进程同时提供HTML、JS/CSS、图片、健康检查和C端行程API。实际Render发布、地址与远程验收必须等用户在Render完成仓库授权/创建服务后确认；本包不是已上线证明。

如失败，请提供Render Build/Deploy日志中的错误片段；不要发送密钥。

## 自有服务器（可选）

根目录提供Dockerfile，构建`docker build -t travel-growth .`并运行`docker run -p 3000:3000 travel-growth`。Docker构建未在当前环境执行；Render推荐直接使用已验证的Node构建流程。
