import "babel-polyfill";

import express from "express";
import socketIO from "socket.io";
import { Server } from "http";
import { rainbow } from "chalk-animation";
import Arranger from "@arranger/server";
import egoTokenMiddleware from "ego-token-middleware";
import cors from "cors";
import bodyParser from "body-parser";

// needed for email stuff
import md5 from "crypto-js/md5";
import fetch from "node-fetch";

import {
  port,
  egoURL,
  projectId,
  esHost,
  mailchimpListId,
  nihSubscriptionEmail
} from "./env";
import shortUrlStatic from "./shortUrlStatic";
import { onlyAdminMutations, injectBodyHttpHeaders } from "./middleware";

const app = express();
const http = Server(app);
const io = socketIO(http);

app.use(cors());
app.get("/s/:shortUrl", shortUrlStatic());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(injectBodyHttpHeaders());
app.use(
  egoTokenMiddleware({
    egoURL,
    required: true,
    accessRules: [
      {
        type: "allow",
        route: ["/", "/(.*)"],
        role: "admin"
      },
      {
        type: "deny",
        route: ["/", "/(.*)"],
        role: ["user"]
      },
      {
        type: "allow",
        route: [`/(.*)/graphql`, `/(.*)/graphql/(.*)`, `/(.*)/download`],
        status: ["approved"],
        role: "user"
      },
      {
        type: "allow",
        route: [`/(.*)/ping`]
      }
    ]
  })
);

app.use(
  "/subscribe",
  egoTokenMiddleware({
    egoURL,
    required: true
  }),
  async (req, res) => {
    const { user = {} } = req.body;
    const { acceptedKfOptIn, acceptedNihOptIn } = user;

    // mailchimp configs
    const kfMailchimpListId = process.env.KF_MAILCHIMP_LIST_ID;
    const kfMailchimpApiKey = process.env.KF_MAILCHIMP_API_KEY;
    const kfMailchimpUserName = process.env.KF_MAILCHIMP_USERNAME;

    // nih email configs
    const nihEmail = process.env.NIH_SUBSCRIPTION_EMAIL;
    const nihFromEmail = process.env.NIH_FROM_EMAIL;
    if (acceptedKfOptIn) {
      const hash = md5(user.email.toLowerCase()).toString();
      const mailChimpDataCenter = kfMailchimpApiKey.split("-")[1];
      const buff = new Buffer(`${kfMailchimpUserName}:${kfMailchimpApiKey}`);
      const b64 = buff.toString("base64");
      await fetch(
        `https://${mailChimpDataCenter}.api.mailchimp.com/3.0/lists/${kfMailchimpListId}/members/`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${b64}`
          },
          body: JSON.stringify({
            email_address: user.email,
            status: "subscribed",
            merge_fields: {
              FNAME: user.firstName,
              LNAME: user.lastName
            }
          })
        }
      );
      res.end();
    }
    if (acceptedNihOptIn) {
    }
    res.end();
  }
);

Arranger({
  io,
  projectId,
  esHost,
  graphqlOptions: {
    context: ({ jwt }) => ({ jwt }),
    middleware: [onlyAdminMutations]
  }
}).then(router => {
  app.use(router);
  http.listen(port, async () => {
    rainbow(`⚡️ Listening on port ${port} ⚡️`);
  });
});
