const express = require("express");
const router = express.Router();
const courses = require("../constants/courses");
const Course = require("../models/Course");

router.get("/seed", async function (req, res, next) {
  for (let course of courses) {
    let courseDb = await Course.findOne({ code: course.code }).exec();

    if (courseDb === null) {
      const new_course = new Course(course);

      new_course.save(function (err) {
        if (err) {
          console.log(err);
          return res.send(err);
        }
      });
    }
  }

  return res.status(200).end();
});

module.exports = router;
