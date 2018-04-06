import "babel-polyfill";
import express from "express";
import socketIO from "socket.io";
import { Server } from "http";
import { rainbow } from "chalk-animation";
import Arranger from "@arranger/server";
import egoToken from "ego-token-middleware";
import shortUrlStatic from "./shortUrlStatic";
import cors from "cors";
import bodyParser from "body-parser";

const port = process.env.PORT || 5050;
const egoURL = process.env.EGO_API;
const app = express();
const http = Server(app);
const io = socketIO(http);
app.use(cors());
app.get("/s/:shortUrl", shortUrlStatic);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// This middleware extracts the authorization key from form submissions and
// attaches it on the request header for the middleware to process.
app.use((req, res, next) => {
  if (req.body && req.body.httpHeaders) {
    const httpHeaders = JSON.parse(req.body.httpHeaders);
    Object.entries(httpHeaders).forEach(([key, value]) => {
      req.headers[key] = value;
    });
  }
  next();
}, egoToken({ required: true, egoURL }));

Arranger({ io }).then(router => {
  app.use(router);
  http.listen(port, async () => {
    rainbow(`⚡️ Listening on port ${port} ⚡️`);
  });
});
