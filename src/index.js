import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'http';
import { rainbow } from 'chalk-animation';
import Arranger from '@arranger/server';

import shortUrlStatic from './shortUrlStatic';

const port = process.env.PORT || 5050;
const app = express();
const http = Server(app);
const io = socketIO(http);

app.get('/s/:shortUrl', shortUrlStatic);

Arranger({ io }).then(router => {
  app.use(router);
  http.listen(port, async () => {
    rainbow(`⚡️ Listening on port ${port} ⚡️`);
  });
});
