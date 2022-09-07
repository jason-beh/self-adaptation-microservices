const mongoose = require("mongoose");

// Connect to db using mongoose
mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
  keepAlive: 1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connection to database is successful!");
});

module.exports = db;
