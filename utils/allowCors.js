module.exports = app => {
  let allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL];
  app.use(function(req, res, next) {
    var origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    return next();
  });
};
