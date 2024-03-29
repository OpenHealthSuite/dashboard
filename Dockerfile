FROM --platform=$BUILDPLATFORM node:18.7.0 as webapp-builder
WORKDIR /app

COPY webapp/package*.json ./
COPY webapp/tsconfig*.json ./

RUN npm ci

COPY webapp/index.html .
COPY webapp/src src
COPY webapp/public public

ARG APP_ENV=production
ENV APP_ENV ${APP_ENV}

ARG REACT_APP_API_ROOT=/api

RUN npm run build

FROM --platform=$BUILDPLATFORM node:18.7.0 AS api-builder
WORKDIR /application
COPY api/package.json package.json
COPY api/package-lock.json package-lock.json
RUN npm ci
COPY api/tsconfig.json tsconfig.json
COPY api/src src
COPY api/types types
RUN npx tsc

FROM --platform=$BUILDPLATFORM node:18.7.0 AS api-deps
WORKDIR /application
COPY api/package.json package.json
COPY api/package-lock.json package-lock.json
RUN npm ci --omit=dev

FROM node:18.7.0-bullseye-slim AS runner
WORKDIR /application
COPY api/package.json package.json
COPY api/package-lock.json package-lock.json
COPY --from=api-deps /application/node_modules /application/node_modules
COPY --from=api-builder /application/dist /application/dist
COPY --from=webapp-builder /app/dist /application/static
EXPOSE 8080
CMD ["npm", "start"]