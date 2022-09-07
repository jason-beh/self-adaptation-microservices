const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const db = require("../utils/db");

const RequestSchema = new Schema({
  result: { type: mongoose.Schema.Types.ObjectId, ref: "Result", required: true },
  student: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = db.model("Request", RequestSchema, "requests");
