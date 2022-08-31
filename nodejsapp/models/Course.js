const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  unit: { type: Number, required: true },
});

module.exports = mongoose.model("Course", CourseSchema, "courses");
