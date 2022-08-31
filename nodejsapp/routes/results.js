const express = require("express");
const router = express.Router();
const courses = require("../constants/courses");
const Student = require("../models/Student");
const Course = require("../models/Course");
const Result = require("../models/Result");

router.get("/generate-random", async function (req, res, next) {
  let email = req.user.emails[0].value;

  // Check if student exist, otherwise log them out
  const student = await Student.findOne({ email }).exec();
  if (student === null) {
    res.redirect("/auth/login");
  }

  // Delete any existing results
  const existing_results = await Result.find({ student }).exec();
  for (let result of existing_results) {
    await Result.findByIdAndDelete(result.id);
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
  for (let index of indexes) {
    const course = await Course.findOne({ code: courses[index].code }).exec();

    // We set the minimum to be 50
    const marks = 50 + Math.floor(Math.random() * 50) + 1;
    let grade = "";

    // Determine grade based on marks
    if (marks >= 50 && marks <= 64) grade = "P";
    else if (marks >= 65 && marks <= 74) grade = "C";
    else if (marks >= 75 && marks <= 84) grade = "D";
    else grade = "HD";

    const new_result = new Result({
      student: student.id,
      course: course.id,
      marks: marks,
      grade: grade,
    });

    new_result.save(function (err) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
    });
  }

  // Redirect to generate random subjects and scores
  return res.redirect(`/results`);
});

module.exports = router;
