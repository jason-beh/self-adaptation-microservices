const express = require("express");
const router = express.Router();
const protected_route = require("../middleware/protected_route");

const Result = require("../models/Result");
const Student = require("../models/Student");

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/results", protected_route, async function (req, res, next) {
  let email = req.user.emails[0].value;

  // Check if student exist, otherwise log them out
  const student = await Student.findOne({ email }).exec();
  if (student === null) {
    res.redirect("/auth/login");
  }

  const results = await Result.find({ student: student.id }).populate("course").lean();
  if (results.length === 0) {
    return res.redirect("/api/v1/results/generate-random");
  }

  // Calculate weighted average and points
  const grade_point_map = {
    HD: 7,
    D: 6,
    C: 5,
    P: 4,
    F: 1.5,
  };

  let weighted_sum_points = 0;
  let points_sum = 0;
  let units_sum = 0;
  for (let result of results) {
    let unit = result.course.unit;
    let marks = result.marks;
    let grade = result.grade;

    let point = grade_point_map[grade];
    points_sum += point;
    result["point"] = point;

    weighted_sum_points += unit * marks;
    units_sum += unit;
  }

  return res.render("results", {
    results: results,
    weighted_average_marks: weighted_sum_points / units_sum,
    gpa: points_sum / results.length,
    id: email,
  });
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
