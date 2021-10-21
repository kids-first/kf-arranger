import express from 'express';
import socketIO from 'socket.io';
import { Server } from 'http';
import Arranger from '@kfarranger/server';
import Keycloak from 'keycloak-connect';
import cors from 'cors';
import bodyParser from 'body-parser';

import { port, keycloakURL, projectId, esHost } from './env';
import keycloakConfig from './keycloak';
import { version, dependencies } from '../package.json';
import { shortUrlStatic, statistics, survival, searchByIds } from './endpoints';
import { onlyAdminMutations, injectBodyHttpHeaders, setMutations } from './middleware';
import { postProcessSets } from './utils/sets';
import SQS from 'aws-sdk/clients/sqs';

const app = express();
const http = Server(app);
const io = socketIO(http);

const keycloak = new Keycloak({}, keycloakConfig);
const sqs = new SQS({ apiVersion: '2012-11-05' });

app.use(cors());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use(injectBodyHttpHeaders());

app.use(
  keycloak.middleware({
      logout: '/logout',
      admin: '/',
  }),
);

/*
 * ===== PUBLIC ROUTES =====
 */

app.get('/s/:shortUrl', shortUrlStatic());
app.get('/statistics', statistics());
app.get('/status', (req, res) =>
  res.send({
    dependencies,
    version,
    keycloak: keycloakURL,
    project: projectId,
    elasticsearch: esHost,
  }),
);

/*
 * ===== RESTRICTED ROUTES =====
 */

app.post('/survival', keycloak.protect(), survival());
app.post('/searchByIds', keycloak.protect(), searchByIds());

const externalContext = (req, _res, _con) => ({ auth: req.kauth?.grant?.access_token || {} });

Arranger({
  io,
  projectId,
  esHost,
  graphqlOptions: {
    context: externalContext,
    middleware: [onlyAdminMutations, setMutations],
  },
  callbacks: {
    resolvers: {
      postProcessSets: postProcessSets(sqs),
    },
  },
}).then(router => {
  app.get('/*/ping', router);
  app.use(keycloak.protect(), router);
  http.listen(port, async () => {
    console.log(`⚡️ Listening on port ${port} ⚡️`);
  });
});
