FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY server ./server

EXPOSE 3000

# NOTE: .env is NOT copied into the image (see .dockerignore).
# DESK_API_KEY, DESK_URL, ZYGN_WEBHOOK_URL, ZYGN_TOKEN must be set as
# environment variables on the host / platform (Coolify, Dokploy, Railway, etc).
# GET /api/health reports whether the key the container loaded is valid.
# The healthcheck below only proves the process answers HTTP. A wrong Desk key
# is reported in /api/health JSON and in the boot logs, not by killing the container.
HEALTHCHECK --interval=60s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "server/production.mjs"]