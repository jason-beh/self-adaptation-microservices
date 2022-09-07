const express = require("express");
const router = express.Router();
const courses = require("../constants/courses");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Result = require("../models/Result");
const protected_route = require("../middleware/protected_route");

const { dbResponseTimeHistogram } = require("../utils/metrics");

router.get("/generate-random", protected_route, async function (req, res, next) {
  let email = req.session.user.emails[0].value;

  console.log("Random: " + req.session.user);

  // Check if student exist, otherwise log them out
  let student;
  let metrics_labels = {
    operation: "check_if_student_exists",
  };
  let timer = dbResponseTimeHistogram.startTimer();
  try {
    student = await Student.findOne({ email }).exec();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }
  if (student === null) {
    return res.redirect("/auth/login");
  }

  // Delete any existing results
  let existing_results;
  metrics_labels = {
    operation: "check_if_results_exists",
  };
  timer = dbResponseTimeHistogram.startTimer();
  try {
    existing_results = await Result.find({ student: email }).exec();
    timer({ ...metrics_labels, success: true });
  } catch (e) {
    timer({ ...metrics_labels, success: false });
    throw e;
  }

  for (let result of existing_results) {
    metrics_labels = {
      operation: "delete_results",
    };
    timer = dbResponseTimeHistogram.startTimer();
    try {
      await Result.findByIdAndDelete(result.id);
      timer({ ...metrics_labels, success: true });
    } catch (e) {
      timer({ ...metrics_labels, success: false });
      throw e;
    }
  }

  // Choose 4 random courses
  const num_courses = 4;

  let indexes = [];
  while (indexes.length < num_courses) {
    let randomIndex = Math.floor(Math.random() * (courses.length - 1)) + 1;

    // Add if it doesn't exist, to ensure uniqueness
    if (indexes.indexOf(randomIndex) === -1) {
      indexes.push(randomIndex);
    }
  }

  // Save courses to db
  let promises = [];
  for (let index of indexes) {
    let promise = new Promise(async (resolve, reject) => {
      // Find course
      let course;
      metrics_labels = {
        operation: "find_course",
      };
      timer = dbResponseTimeHistogram.startTimer();
      try {
        course = await Course.findOne({ code: courses[index].code }).exec();
        timer({ ...metrics_labels, success: true });
      } catch (e) {
        timer({ ...metrics_labels, success: false });
        throw e;
      }

      // We set the minimum to be 50
      const marks = 50 + Math.floor(Math.random() * 50) + 1;
      let grade = "";

      // Determine grade based on marks
      if (marks >= 50 && marks <= 64) grade = "P";
      else if (marks >= 65 && marks <= 74) grade = "C";
      else if (marks >= 75 && marks <= 84) grade = "D";
      else grade = "HD";

      const new_result = new Result({
        student: email,
        course: course.id,
        marks: marks,
        grade: grade,
      });

      metrics_labels = {
        operation: "create_new_request",
      };
      timer = dbResponseTimeHistogram.startTimer();
      try {
        new_result.save(function (err) {
          if (err) {
            console.log(err);
            return res.send(err);
          }
          timer({ ...metrics_labels, success: true });

          resolve();
        });
      } catch (e) {
        timer({ ...metrics_labels, success: false });
        reject(e);
        throw e;
      }
    });

    // Add promise to promise array
    promises.push(promise);
  }

  // Wait for all promises to complete
  Promise.all(promises).then(function () {
    // Redirect to generate random subjects and scores
    return res.redirect(`/results`);
  });
});

module.exports = router;
