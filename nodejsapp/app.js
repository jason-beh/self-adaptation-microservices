// Set dotenv configuration
require("dotenv").config();

// Dependencies
const path = require("path");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const logger = require("morgan");
const mongoose = require("mongoose");
const createError = require("http-errors");
const { restResponseTimeHistogram } = require("./utils/metrics");
const responseTime = require("response-time");
const client = require("prom-client");

// Routes
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const resultsRouter = require("./routes/results");
const coursesRouter = require("./routes/courses");
const requestsRouter = require("./routes/request");
const metricsRouter = require("./routes/metrics");

// Initialize express
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Express middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_CONNECTION_STRING,
      dbName: "sessions",
    }),
    proxy: true,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(csrf({ cookie: true }));
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
// app.use(passport.initialize());
// app.use(passport.session());
app.use(
  responseTime((req, res, time) => {
    if (req?.route?.path) {
      if (req.route.path !== "/metrics") {
        restResponseTimeHistogram.observe(
          {
            method: req.method,
            route: req.route.path,
            status_code: res.statusCode,
          },
          time * 1000
        );
      }
    }
  })
);

// Mounting routes
app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/", metricsRouter);
app.use("/api/v1/results", resultsRouter);
app.use("/api/v1/courses", coursesRouter);
app.use("/api/v1/requests", requestsRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Expose express app on port
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Start metric server
client.collectDefaultMetrics();

module.exports = app;
