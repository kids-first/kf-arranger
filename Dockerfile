FROM keymetrics/pm2:latest-alpine

WORKDIR /usr/src/app

RUN npm install pm2 -g
RUN npm install

COPY . .

CMD ["pm2-runtime", "index.js"]

