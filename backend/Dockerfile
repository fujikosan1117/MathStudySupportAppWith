# ---- Stage 1: ビルド ----
FROM node:18-alpine AS builder

WORKDIR /app

# package.json を先にコピーしてキャッシュを活用
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

# TypeScript → JavaScript にコンパイル (dist/ に出力)
RUN npm run build


# ---- Stage 2: 本番実行 ----
FROM node:18-alpine AS runner

WORKDIR /app

# 本番依存パッケージのみインストール
COPY package*.json ./
RUN npm ci --omit=dev

# ビルド済みの成果物のみコピー
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
