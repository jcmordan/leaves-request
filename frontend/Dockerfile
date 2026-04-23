FROM node:24-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace files from root context
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copy frontend package.json
COPY frontend/package.json ./frontend/

# Install dependencies for the frontend workspace
RUN pnpm install --frozen-lockfile

# --- Builder ---
FROM base AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY --from=deps /app ./
COPY frontend ./frontend

# Build-time environment variables (if any)
ARG GRAPHQL_ENDPOINT
ENV GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT}

WORKDIR /app/frontend
RUN pnpm build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/frontend/public ./frontend/public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# ENV HOSTNAME="[::]"

CMD ["node", "frontend/server.js"]
