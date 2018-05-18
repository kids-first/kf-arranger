// This middleware extracts the authorization key from form submissions and
// attaches it on the request header for the middleware to process.

export default () => (req, res, next) => {
  if (req.body && req.body.httpHeaders) {
    const httpHeaders = JSON.parse(req.body.httpHeaders);
    Object.entries(httpHeaders).forEach(([key, value]) => {
      req.headers[key] = value;
    });
  }
  next();
};
