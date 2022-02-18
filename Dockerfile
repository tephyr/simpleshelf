FROM node:16.14.0-bullseye-slim AS assets
LABEL maintainer="Andrew Ittner <projects@rhymingpanda.com>"

WORKDIR /app/frontend

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && mkdir -p /node_modules && chown node:node -R /node_modules /app

USER node

# Enable global npm installation to user-owned directory.
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
# optionally if you want to run npm global bin without specifying path
ENV PATH=$PATH:/home/node/.npm-global/bin

COPY --chown=node:node frontend/package.json ./

RUN npm install --global gulp-cli

RUN npm install && npm cache verify

ARG NODE_ENV="production"
ENV NODE_ENV="${NODE_ENV}" \
    PATH="${PATH}:/node_modules/.bin" \
    USER="node"

COPY --chown=node:node . ..

RUN if [ "${NODE_ENV}" != "development" ]; then \
  ../run gulp:build:all; else mkdir -p /app/public; fi

CMD ["bash"]

###############################################################################

FROM node:16.14.0-bullseye-slim AS app
LABEL maintainer="Andrew Ittner <projects@rhymingpanda.com>"

WORKDIR /app/backend

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl libpq-dev \
  && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
  && apt-get clean \
  && mkdir -p /node_modules && chown node:node -R /node_modules /app

RUN mkdir -p /var/log/pm2
RUN chown -R node:node /var/log/pm2

USER node

COPY --chown=node:node backend/package.json ./

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN npm install --global pm2@latest

RUN npm install && npm cache verify

ARG NODE_ENV="production"
ENV NODE_ENV="${NODE_ENV}" \
    PATH="${PATH}:/node_modules/.bin" \
    USER="node"

COPY --chown=node:node --from=assets /app/public /public
COPY --chown=node:node backend/ ./
COPY --chown=node:node bin/ /app/bin

ENTRYPOINT ["/app/bin/docker-entrypoint-web"]

EXPOSE 8000

CMD ["pm2", "start", "/app/backend/server/config/server-process-config.json", "--no-daemon"]
