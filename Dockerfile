# syntax=docker/dockerfile:1

# Alpine is safe here even though next/image needs sharp: package-lock.json
# carries the musl prebuilds (@img/sharp-linuxmusl-x64), so no glibc base or
# source compile is required.
FROM node:22.19.0-alpine AS base

# ============================================
# Stage 1: Dependencies
# ============================================
FROM base AS deps
# https://github.com/nodejs/docker-node#nodealpine — sharp needs glibc shims.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# package-lock.json (not bun.lock) is the source of truth for the image. Both
# lockfiles are committed; if you ever switch the image to bun, regenerate and
# re-verify the sharp musl prebuilds before doing it.
COPY --link package.json package-lock.json ./

# npm ci installs optionalDependencies by default, and that is the ONLY route
# by which sharp (an optional dep of next) reaches the image. Never add
# --omit=optional here: next/image would fall back to unoptimized at runtime.
RUN --mount=type=cache,target=/root/.npm npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle by `next build`, so
# they must be present HERE, not at runtime. In Dokploy these go in "Build
# Arguments", not "Environment" — passing them only as runtime env leaves them
# undefined in the browser and every Supabase image URL 404s.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

# BETTER_AUTH_URL is needed at BUILD time as well as runtime, which is easy to
# miss because it is not a NEXT_PUBLIC_ variable. siteConfig.url (src/lib/seo.ts)
# reads it and falls back to http://localhost:3000, and four things bake that
# value into static output during `next build`:
#
#   src/app/robots.ts     -> the Sitemap: line in /robots.txt   (prerendered)
#   src/app/sitemap.ts    -> every <loc> in /sitemap.xml        (prerendered)
#   src/app/layout.tsx:16 -> metadataBase, which every og:image and twitter:image
#                            URL is resolved against
#   src/app/layout.tsx:33 -> og:url
#
# Supplying it only as runtime Environment ships a production site whose
# robots.txt, sitemap and social preview images all point at localhost:3000.
# On Vercel this was invisible because Vercel exposes env vars to the build.
ARG BETTER_AUTH_URL
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Runs `prisma generate && next build`.
#
# Prisma 7's driver-adapter client is plain TypeScript — no engine binary — so
# no musl binaryTargets are needed, and `generate` never opens a connection.
# Verified: `prisma generate` succeeds with DATABASE_URL and DIRECT_URL unset,
# which is exactly the state of this stage.
#
# This step DOES need outbound network: src/app/layout.tsx uses
# next/font/google, which downloads the font files at build time.
RUN npm run build

# ============================================
# Stage 3: Runner (production)
# ============================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Bind every interface. Traefik reaches this container across dokploy-network,
# so a 127.0.0.1 bind would make every proxied request fail with a 502.
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# Create .next (and the cache dir under it) owned by nextjs BEFORE the COPYs.
# COPY creates missing parent directories as root, and the image optimizer
# writes resized assets to .next/cache/images at runtime — as a non-root user
# it cannot mkdir under a root-owned .next, and next/image starts 500ing.
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Output file tracing: standalone bundles only the modules actually imported,
# which leaves the Prisma CLI and its tooling (hono, kysely, effect, lodash…)
# out of the runtime image entirely. sharp IS traced in — Next only excludes it
# when building on Vercel (see collect-build-traces.js `hasNextSupport`).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Documentation only — docker-compose uses `expose`, and nothing is published
# to the host. Traefik routes to this port over the shared overlay network.
EXPOSE 3000

CMD ["node", "server.js"]
