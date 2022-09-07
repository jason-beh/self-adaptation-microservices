const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require("../utils/db");

const CourseSchema = new Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  unit: { type: Number, required: true },
});

module.exports = db.model("Course", CourseSchema, "courses");
