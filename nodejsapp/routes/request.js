const express = require("express");
const router = express.Router();
const Result = require("../models/Result");

router.post("/create-request", async function (req, res, next) {
  let { result_id, description } = req.body;

  if (!result_id || !description) {
    return res.status(400).send("Insufficient Data");
  }

  let new_request = new Result({
    request: request_id,
    description: description,
  });

  new_request.save(function (err) {
    if (err) {
      console.log(err);
      return res.send(err);
    }

    return res.redirect("/requests");
  });
});

module.exports = router;
