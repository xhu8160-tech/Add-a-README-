FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm ci --prefix frontend && npm ci --prefix backend
COPY frontend ./frontend
COPY backend ./backend
RUN npm run build --prefix frontend && npm run build --prefix backend

FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3000 API_PREFIX=/api
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/frontend/dist /app/frontend/dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
