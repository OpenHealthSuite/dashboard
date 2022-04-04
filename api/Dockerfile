FROM node:16.13.1-bullseye-slim AS builder
WORKDIR /application
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i
COPY tsconfig.json tsconfig.json
COPY src src
COPY types types
RUN npx tsc

FROM node:16.13.1-bullseye-slim AS runner
WORKDIR /application
COPY --from=builder /application/package.json /application/package.json 
COPY --from=builder /application/package-lock.json /application/package-lock.json
RUN npm install --only=prod
COPY --from=builder /application/dist /application/dist
COPY migrations migrations
ENV RUNNING_IN_CONTAINER=true
EXPOSE 8080
CMD ["npm", "start"]