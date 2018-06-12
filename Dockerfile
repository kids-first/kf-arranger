FROM mhart/alpine-node:latest

WORKDIR /usr/src

COPY . .

RUN apk add --update --no-cache git

RUN npm install pm2 -g
RUN npm ci

CMD ["pm2-runtime", "index.js"]