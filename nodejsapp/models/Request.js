const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RequestSchema = new Schema({
  result: { type: mongoose.Schema.Types.ObjectId, ref: "Result", required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Request", RequestSchema, "requests");
