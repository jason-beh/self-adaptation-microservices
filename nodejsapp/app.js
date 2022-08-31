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

// Routes
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");

// Initialize express
const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Connect to db using mongoose
mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection to database is successful!");
});

// Express middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
app.use(csrf());
app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(passport.initialize());
app.use(passport.session());

// Mounting routes
app.use("/", indexRouter);
app.use("/auth", authRouter);

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

module.exports = app;
