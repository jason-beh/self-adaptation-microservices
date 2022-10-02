const express = require("express");
const router = express.Router();
const courses = require("../constants/courses");
const Course = require("../models/Course");
const { dbResponseTimeHistogram } = require("../utils/metrics");
const protected_route = require("../middleware/protected_route");

router.get("/seed", async function (req, res, next) {
  for (let course of courses) {
    let courseDb;

    let metrics_labels = {
      operation: "check_if_course_exists",
    };
    let timer = dbResponseTimeHistogram.startTimer();
    try {
      courseDb = await Course.findOne({ code: course.code }).read("n").exec();
      timer({ ...metrics_labels, success: true });
    } catch (e) {
      timer({ ...metrics_labels, success: false });
      throw e;
    }

    if (courseDb === null) {
      let new_course = new Course(course);

      let metrics_labels = {
        operation: "create_new_course",
      };
      let timer = dbResponseTimeHistogram.startTimer();
      try {
        new_course.save(function (err) {
          if (err) {
            console.log(err);
            return res.send(err);
          }

          timer({ ...metrics_labels, success: true });
        });
      } catch (e) {
        timer({ ...metrics_labels, success: false });
        throw e;
      }
    }
  }

  return res.status(200).end();
});

module.exports = router;
