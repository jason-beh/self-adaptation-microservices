const client = require("prom-client");
const express = require("express");

const app = express();

const restResponseTimeHistogram = new client.Histogram({
  name: "rest_response_time_duration_seconds",
  help: "REST API response in seconds",
  labelNames: ["method", "route", "status_code"],
});

const dbResponseTimeHistogram = new client.Histogram({
  name: "db_response_time_duration_seconds",
  help: "Database response in seconds",
  labelNames: ["operation", "success"],
});

const startMetricsServer = () => {
  const collectDefaultMetrics = client.collectDefaultMetrics;

  collectDefaultMetrics();

  app.get("/metrics", async (req, res, next) => {
    res.set("Content-Type", client.register.contentType);

    return res.send(await client.register.metrics());
  });

  app.listen(3010, () => {
    console.log("Metrics server listening on port 3010");
  });
};

module.exports = {
  restResponseTimeHistogram,
  dbResponseTimeHistogram,
  startMetricsServer,
};
