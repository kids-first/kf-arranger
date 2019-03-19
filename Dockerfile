FROM nikolaik/python-nodejs:python2.7-nodejs11

WORKDIR /usr/src

COPY . .

RUN pip install -r resource/py/requirements.txt

RUN npm install pm2 -g
RUN npm ci


CMD ["pm2-runtime", "index.js"]