import createServer from "@arranger/server";
import shortUrlStatic from "./shortUrlStatic";

let server = createServer({
  esHost: process.env.ES_HOST,
});

server.app.get("/s/:shortUrl", shortUrlStatic);

server.listen(process.env.PORT || 5050);
