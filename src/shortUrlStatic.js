import fetch from "node-fetch";

export default async (req, res) => {
  fetch(
    `https://13gqusdt40.execute-api.us-east-1.amazonaws.com/Dev/${
      req.params.shortUrl
    }`,
  )
    .then(r => r.json())
    .then(data => {
      let { content } = data.value;

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
