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
  // Test the /api/fast endpoint
  const fastResponse = http.get(`${BASE_URL}/api/fast`);
  check(fastResponse, {
    "fast endpoint status is 200": (r) => r.status === 200,
    "fast endpoint response time < 100ms": (r) => r.timings.duration < 100,
  });
  errorRate.add(fastResponse.status !== 200);
  responseTime.add(fastResponse.timings.duration);

  // Test the /api/medium endpoint
  const mediumResponse = http.get(`${BASE_URL}/api/medium`);
  check(mediumResponse, {
    "medium endpoint status is 200": (r) => r.status === 200,
    "medium endpoint response time < 500ms": (r) => r.timings.duration < 500,
  });
  errorRate.add(mediumResponse.status !== 200);
  responseTime.add(mediumResponse.timings.duration);

  // Test the /api/slow endpoint
  const slowResponse = http.get(`${BASE_URL}/api/slow`);
  check(slowResponse, {
    "slow endpoint status is 200": (r) => r.status === 200,
    "slow endpoint response time < 5000ms": (r) => r.timings.duration < 5000,
  });
  errorRate.add(slowResponse.status !== 200);
  responseTime.add(slowResponse.timings.duration);

  // Test the /api/unreliable endpoint
  const unreliableResponse = http.get(`${BASE_URL}/api/unreliable`);
  check(unreliableResponse, {
    "unreliable endpoint response time < 2000ms": (r) =>
      r.timings.duration < 2000,
  });
  // Note: unreliable endpoint is expected to fail sometimes, so we don't check for 200 status
  errorRate.add(unreliableResponse.status !== 200);
  responseTime.add(unreliableResponse.timings.duration);

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
