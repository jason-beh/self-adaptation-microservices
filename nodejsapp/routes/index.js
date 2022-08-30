const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/results", function (req, res, next) {
  res.render("results");
});

router.get("/db", function (req, res, next) {
  var MongoClient = require("mongodb").MongoClient;
  var url = process.env.MONGODB_CONNECTION_STRING;

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("uni");
    dbo
      .collection("students")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.send(result);
        db.close();
      });
  });
});

module.exports = router;
