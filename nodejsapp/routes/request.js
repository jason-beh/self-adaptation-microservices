const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const protected_route = require("../middleware/protected_route");

router.post("/create", protected_route, async function (req, res, next) {
  let { result, description } = req.body;

  if (!result || !description) {
    return res.status(400).send("Insufficient Data");
  }

  let new_request = new Request({
    student: req.user.emails[0].value,
    result: result,
    description: description,
  });

  new_request.save(function (err) {
    if (err) {
      console.log(err);
      return res.send(err);
    }

    return res.redirect("/results");
  });
});

module.exports = router;
