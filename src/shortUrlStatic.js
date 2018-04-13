import fetch from "node-fetch";
import urlJoin from "url-join";
import { get } from "lodash";

export default ({ accessor = "content" } = {}) => (req, res) => {
  fetch(urlJoin(process.env.RIFF_API, req.params.shortUrl))
    .then(r => r.json())
    .then(data => {
      let content = get(data, contentAccessor, {});
      let html = `
        <html>
          <head>
            <meta property="og:title" content="${content["og:title"]}" />
            <meta
              property="og:description"
              content="${content["og:description"]}"
            />
            <meta property="og:image" content="${content["og:image"]}" />
          </head>
          <body>
            <script>window.location.href = "${content.longUrl}"</script>
          </body>
        </html>
      )`;

      res.send(html);
    })
    .catch(err => res.send(err.message));
};
