import 'babel-polyfill';
import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'http';
import { rainbow } from 'chalk-animation';
import Arranger from '@arranger/server';
import egoToken from 'ego-token-middleware';
import shortUrlStatic from './shortUrlStatic';
import cors from 'cors';

const port = process.env.PORT || 5050;
const app = express();
const http = Server(app);
const io = socketIO(http);
app.use(cors());
app.get('/s/:shortUrl', shortUrlStatic);

app.use(egoToken({ required: false }));

Arranger({ io }).then(router => {
  app.use(router);
  http.listen(port, async () => {
    rainbow(`⚡️ Listening on port ${port} ⚡️`);
  });
});
