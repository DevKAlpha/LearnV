# Build from the repository root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/schemas/package.json packages/schemas/
RUN corepack enable && pnpm install --frozen-lockfile --filter @learnv/api...
COPY packages/schemas packages/schemas
COPY apps/api apps/api
RUN pnpm --filter @learnv/api build

# The bundle carries its dependencies: the runtime image is Node, one file and the migrations.
FROM node:22-alpine
ENV NODE_ENV=production PORT=3001
WORKDIR /app
COPY --from=build /app/apps/api/dist dist
COPY --from=build /app/apps/api/drizzle drizzle
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3001/api/v1/health').then((r)=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "dist/server.mjs"]
