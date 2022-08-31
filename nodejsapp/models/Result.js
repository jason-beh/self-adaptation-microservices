const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
  student: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  marks: { type: Number, required: true },
  grade: { type: String, enum: ["HD", "D", "C", "P", "F"], required: true },
});

module.exports = mongoose.model("Result", ResultSchema, "results");
