const express = require("express");
const router = express.Router();
const protected_route = require("../middleware/protected_route");
const Student = require("../models/Student");

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/results", function (req, res, next) {
  res.render("results");
});

router.get("/test-add", function (req, res, next) {
  const newStudent = new Student({
    email: "aaa@gmail.com",
    nickname: "aaa",
  });

  newStudent.save(function (err) {
    if (err) {
      if (err.code === 11000) {
        return res.send("The account exists");
      }
      return res.send(err);
    }

    res.send(newStudent);
  });
});

// Protected route example
router.get("/protected", protected_route, function (req, res, next) {
  res.send("protected");
});

// Test DB
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
