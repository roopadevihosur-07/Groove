# ── Backend ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# ── Frontend build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ── Production image: backend + static frontend served by Express ──────────────
FROM node:20-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY backend/ .

# Copy built frontend into backend/public so Express can serve it
COPY --from=frontend-builder /app/frontend/dist ./public

# Serve frontend static files from Express
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001
CMD ["node", "server.js"]
