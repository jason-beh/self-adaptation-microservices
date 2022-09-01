const express = require("express");
const router = express.Router();
const client = require("prom-client");

router.get("/metrics", async (req, res, next) => {
  res.set("Content-Type", client.register.contentType);

  return res.send(await client.register.metrics());
});

module.exports = router;
