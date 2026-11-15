FROM node:22-alpine AS build
WORKDIR /app
# Workspace manifests first, so dependency installs are cached between source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/schemas/package.json packages/schemas/
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
# Path of the account API behind the same origin (e.g. /api/v1/). Empty: no account features.
ARG VITE_SYNC_API=""
ENV VITE_SYNC_API=$VITE_SYNC_API
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1/ || exit 1
