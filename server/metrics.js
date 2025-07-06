const promClient = require("prom-client");

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

const operationCounter = new promClient.Counter({
  name: "operation_count_total",
  help: "Total number of business operations",
  labelNames: ["operation_type"],
});

module.exports = {
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  operationCounter,
};
