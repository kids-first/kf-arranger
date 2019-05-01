import 'babel-polyfill';

import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'http';
import Arranger from '@kfarranger/server';
import egoTokenMiddleware from 'ego-token-middleware';
import cors from 'cors';
import bodyParser from 'body-parser';

import { port, egoURL, projectId, esHost } from './env';
import { version, dependencies } from '../package.json';
import { shortUrlStatic, statistics, survival } from './endpoints';
import { onlyAdminMutations, injectBodyHttpHeaders } from './middleware';

const app = express();
const http = Server(app);
const io = socketIO(http);

app.use(cors());

/*
 * ===== PUBLIC ROUTES =====
 * Adding routes before ego middleware makes them available to all public
 */
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
        route: [`/(.*)/graphql`, `/(.*)/graphql/(.*)`, `/(.*)/download`, `/survival`],
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

/*
 * ===== RESTRICTED ROUTES =====
 * Adding routes after ego middleware makes them require a valid Bearer Token (Ego JWT)
 */

app.post('/survival', survival());

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
