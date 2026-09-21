FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1 AS runner

WORKDIR /app

COPY --from=base /app/.output ./.output
COPY --from=base /app/package.json ./

ENV NODE_ENV=production
ENV PORT=7319
ENV HOST=0.0.0.0

EXPOSE 7319

CMD ["bun", "run", ".output/server/index.mjs"]
