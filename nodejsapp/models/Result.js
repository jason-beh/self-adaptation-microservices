const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResultSchema = new Schema({
  student: { type: String, required: true },
  course: { type: String, required: true },
  marks: { type: Integer, required: true },
  grade: { type: String, enum: ["HD", "D", "C", "P", "F"], required: true },
});

module.exports = mongoose.model("Result", ResultSchema, "results");
