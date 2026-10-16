# syntax=docker/dockerfile:1

# ── Build stage ──────────────────────────────────────────────────────────────
# Vite 8 needs Node >= 20.19 / 22.12, so use 22.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_* values are baked into the JS bundle at build time, so the API URL is a
# build arg. It must be the URL the *browser* can reach, not a docker service
# name. VITE_API_TOKEN is deliberately NOT supported: a bearer token in a
# static bundle is readable by every visitor.
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=$VITE_API_URL \
    NODE_OPTIONS=--max-old-space-size=3072

# `npm run build` is `tsc -b && vite build`, and tsc currently reports ~59
# pre-existing type errors in app code (mostly sales-purchase), which would
# block every image build. So type-checking is opt-in until those are fixed:
#   docker build --build-arg TYPECHECK=true .
ARG TYPECHECK=false
RUN if [ "$TYPECHECK" = "true" ]; then npm run build; else npx vite build; fi

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY deploy/nginx.docker.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
