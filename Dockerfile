FROM node:22.13.0-alpine AS dev

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install --immutable

CMD ["yarn", "start:dev"]

FROM node:22.13.0-alpine AS deps-runtime

WORKDIR /app

COPY ./package.json ./yarn.lock /app/

RUN yarn install --production

FROM node:22.13.0-alpine AS build

WORKDIR /app

COPY ./package.json ./yarn.lock

RUN yarn install --immutable

COPY . .
RUN yarn build

FROM node:22.13.0-alpine AS runtime

WORKDIR /app

COPY --from=build /app/package.json .
COPY --from=deps-runtime /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config ./config

CMD ["node", "dist/main.js"]