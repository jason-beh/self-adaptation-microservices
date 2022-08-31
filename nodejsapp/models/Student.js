const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  email: { type: String, required: true, unique: true },
  nickname: { type: String },
});

module.exports = mongoose.model("Student", StudentSchema, "students");
