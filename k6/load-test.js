import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const responseTime = new Trend("response_time");

// Test configuration
export const options = {
  stages: [
    { duration: "1m", target: 10 }, // Ramp up to 10 users
    // { duration: "3m", target: 10 }, // Stay at 10 users
    // { duration: "1m", target: 20 }, // Ramp up to 20 users
    // { duration: "3m", target: 20 }, // Stay at 20 users
    // { duration: "1m", target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests should be below 500ms
    http_req_failed: ["rate<0.1"], // Error rate should be below 10%
    errors: ["rate<0.1"], // Custom error rate should be below 10%
  },
};

// Base URL for the application
const BASE_URL = __ENV.TARGET_URL || "http://nodejs-app:3010";

export default function () {
  // Test the main endpoint
  const mainResponse = http.get(`${BASE_URL}/`);
  check(mainResponse, {
    "main page status is 200": (r) => r.status === 200,
    "main page response time < 500ms": (r) => r.timings.duration < 500,
  });
  errorRate.add(mainResponse.status !== 200);
  responseTime.add(mainResponse.timings.duration);

  // Test the health endpoint
  const healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    "health endpoint status is 200": (r) => r.status === 200,
    "health endpoint response time < 200ms": (r) => r.timings.duration < 200,
  });
  errorRate.add(healthResponse.status !== 200);
  responseTime.add(healthResponse.timings.duration);

  // Test the metrics endpoint
  const metricsResponse = http.get(`${BASE_URL}/metrics`);
  check(metricsResponse, {
    "metrics endpoint status is 200": (r) => r.status === 200,
    "metrics endpoint contains prometheus format": (r) =>
      r.body.includes("# HELP"),
  });
  errorRate.add(metricsResponse.status !== 200);
  responseTime.add(metricsResponse.timings.duration);

  // Test the dashboard endpoint
  const dashboardResponse = http.get(`${BASE_URL}/dashboard`);
  check(dashboardResponse, {
    "dashboard endpoint status is 200": (r) => r.status === 200,
    "dashboard endpoint response time < 1000ms": (r) =>
      r.timings.duration < 1000,
  });
  errorRate.add(dashboardResponse.status !== 200);
  responseTime.add(dashboardResponse.timings.duration);

  // Simulate some load with random delays
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

// Setup function (runs once before the test)
export function setup() {
  console.log("Starting k6 load test against:", BASE_URL);

  // Verify the application is running
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(
      `Application is not healthy. Status: ${healthCheck.status}`
    );
  }

  console.log("Application is healthy, starting load test...");
}

// Teardown function (runs once after the test)
export function teardown(data) {
  console.log("Load test completed");
}
