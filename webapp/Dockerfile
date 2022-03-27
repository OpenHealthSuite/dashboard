FROM node:16.13.1 as builder

# Note: This dockerfile is basically just for bringing it up in a stack.
# In reality, just serve the damn static files

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json .

RUN npm ci

COPY src src
COPY public public

RUN npm run test:ci

ARG APP_ENV=local
ENV APP_ENV ${APP_ENV}

ARG REACT_APP_API_ROOT=/api
# TODO: All of these env vars should be killable
ARG REACT_APP_AWS_REGION=eu-west-2
ARG REACT_APP_AWS_COOKIE_STORAGE_DOMAIN=app.paceme.info
# If it makes you feel better, these aren't really secret, just disposable...
ARG REACT_APP_AWS_USER_POOL_ID
ARG REACT_APP_AWS_USER_POOL_CLIENTID

ENV REACT_APP_API_ROOT ${REACT_APP_API_ROOT}
ENV REACT_APP_AWS_REGION ${REACT_APP_AWS_REGION}
ENV REACT_APP_AWS_COOKIE_STORAGE_DOMAIN ${REACT_APP_AWS_COOKIE_STORAGE_DOMAIN}
ENV REACT_APP_AWS_USER_POOL_ID ${REACT_APP_AWS_USER_POOL_ID}
ENV REACT_APP_AWS_USER_POOL_CLIENTID ${REACT_APP_AWS_USER_POOL_CLIENTID}

RUN npm run build

FROM nginx:mainline-alpine as host

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/build /usr/share/nginx/html

CMD ["nginx"]