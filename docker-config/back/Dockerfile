# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine

WORKDIR /home/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm i -g @nestjs/cli

RUN npm install --save-dev @types/express

RUN npm install --save-dev @types/bcrypt

RUN npm run build

ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/main"]
