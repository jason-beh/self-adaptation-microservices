const express = require("express");
const router = express.Router();
const protected_route = require("../middleware/protected_route");
const { dbResponseTimeHistogram } = require("../utils/metrics");

const Result = require("../models/Result");
const Student = require("../models/Student");

router.get("/", function (req, res, next) {
  return res.render("index", {
    isLoggedIn: typeof req.session.user !== "undefined",
  });
});

router.get("/success-request-remark", protected_route, function (req, res, next) {
  let { is_redirected } = req.query;

  if (is_redirected !== "yes") {
    return res.redirect("/results");
  }

  return res.render("success-request-remark", {
    isLoggedIn: typeof req.session.user !== "undefined",
  });
});

router.get("/request-remark", protected_route, async function (req, res, next) {
  let email = req.session.user.emails[0].value;

  // Check if student exist, otherwise log them out
  let student;
  let metrics_labels = {
    operation: "check_if_student_exists",
  };
  let timer = dbResponseTimeHistogram.startTimer();
  try {
    student = await Student.findOne({ email }).read("n").exec();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }
  if (student === null) {
    return res.redirect("/auth/login");
  }

  // Check if results exists for the current user
  let results;
  metrics_labels = {
    operation: "check_if_result_exists",
  };
  timer = dbResponseTimeHistogram.startTimer();
  try {
    results = await Result.find({ student: email }).populate("course").lean();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }
  if (results.length === 0) {
    return res.redirect("/api/v1/results/generate-random");
  }

  let options = [];
  for (let result of results) {
    options.push({
      course: result.course.title,
      id: result._id,
    });
  }

  return res.render("remark", {
    id: email,
    options: options,
    csrfToken: req.csrfToken(),
    isLoggedIn: typeof req.session.user !== "undefined",
  });
});

router.get("/results", protected_route, async function (req, res, next) {
  let email = req.session.user.emails[0].value;

  // Check if student exist, otherwise log them out
  let student;
  let metrics_labels = {
    operation: "check_if_student_exists",
  };
  let timer = dbResponseTimeHistogram.startTimer();
  try {
    student = await Student.findOne({ email }).read("n").exec();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }
  if (student === null) {
    return res.redirect("/auth/login");
  }

  // Check if results exists for the current user
  let results;
  metrics_labels = {
    operation: "check_if_result_exists",
  };
  timer = dbResponseTimeHistogram.startTimer();
  try {
    results = await Result.find({ student: email }).populate("course").lean();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }
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
    isLoggedIn: typeof req.session.user !== "undefined",
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
