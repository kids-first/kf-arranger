import 'babel-polyfill';

import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'http';
import Arranger, { getProject } from '@arranger/server';
import egoTokenMiddleware from 'ego-token-middleware';
import cors from 'cors';
import bodyParser from 'body-parser';

import { port, egoURL, projectId, esHost } from './env';
import { version, dependencies } from '../package.json';
import { shortUrlStatic, statistics } from './endpoints';
import { onlyAdminMutations, injectBodyHttpHeaders } from './middleware';

const app = express();
const http = Server(app);
const io = socketIO(http);

app.use(cors());
app.get('/s/:shortUrl', shortUrlStatic());
app.get('/statistics', statistics());
app.get('/status', (req, res) =>
  res.send({
    dependencies,
    version,
    ego: egoURL,
    project: projectId,
    elasticsearch: esHost,
  }),
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(injectBodyHttpHeaders());
app.use(
  egoTokenMiddleware({
    egoURL,
    accessRules: [
      {
        type: 'allow',
        route: ['/', '/(.*)'],
        role: 'admin',
      },
      {
        type: 'deny',
        route: ['/', '/(.*)'],
        role: ['user'],
      },
      {
        type: 'allow',
        route: [`/(.*)/graphql`, `/(.*)/graphql/(.*)`, `/(.*)/download`],
        status: ['approved'],
        role: 'user',
      },
      {
        type: 'allow',
        route: [`/(.*)/ping`],
        tokenExempt: true,
      },
    ],
  }),
);

Arranger({
  io,
  projectId,
  esHost,
  graphqlOptions: {
    context: ({ jwt }) => ({ jwt }),
    middleware: [onlyAdminMutations],
  },
}).then(router => {
  app.use(router);
  http.listen(port, async () => {
    console.log(`⚡️ Listening on port ${port} ⚡️`);
  });
});
