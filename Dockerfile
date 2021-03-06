FROM nikolaik/python-nodejs:python3.7-nodejs11

WORKDIR /usr/src

COPY . .

RUN pip3 install -r resource/py/requirements.txt

RUN npm install pm2 -g
RUN npm ci


CMD ["pm2-runtime", "index.js"]