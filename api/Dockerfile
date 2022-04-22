FROM --platform=$BUILDPLATFORM node:16.13.1-bullseye-slim AS builder
WORKDIR /application
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
COPY tsconfig.json tsconfig.json
COPY src src
COPY types types
RUN npx tsc

FROM node:16.13.1-bullseye-slim AS runner
WORKDIR /application
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --only=prod
COPY --from=builder /application/dist /application/dist
COPY migrations migrations
EXPOSE 8080
CMD ["npm", "start"]