const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require("../utils/db");

const StudentSchema = new Schema({
  email: { type: String, required: true, unique: true },
  nickname: { type: String },
});

module.exports = db.model("Student", StudentSchema, "students");
