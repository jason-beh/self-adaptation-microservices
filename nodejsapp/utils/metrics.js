const client = require("prom-client");

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

module.exports = {
  restResponseTimeHistogram,
  dbResponseTimeHistogram,
};
