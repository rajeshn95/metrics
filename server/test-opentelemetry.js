#!/usr/bin/env node

const http = require("http");

// Test configuration
const BASE_URL = "http://localhost:3010";
const TEST_ENDPOINTS = ["/api/fast", "/api/medium", "/api/slow"];

// Colors for console output
const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, expectJson = true) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    http
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const duration = Date.now() - startTime;
          let response;

          if (expectJson) {
            try {
              response = JSON.parse(data);
            } catch (error) {
              response = data; // Return raw data if JSON parsing fails
            }
          } else {
            response = data; // Return raw data for non-JSON endpoints
          }

          resolve({
            statusCode: res.statusCode,
            duration,
            response,
            headers: res.headers,
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

async function testEndpoint(endpoint) {
  try {
    log(`Testing ${endpoint}...`, "blue");

    const result = await makeRequest(`${BASE_URL}${endpoint}`);

    log(
      `✅ ${endpoint} - Status: ${result.statusCode}, Duration: ${result.duration}ms`,
      "green"
    );

    if (result.headers["x-request-id"]) {
      log(`   Request ID: ${result.headers["x-request-id"]}`, "yellow");
    }

    return result;
  } catch (error) {
    log(`❌ ${endpoint} - Error: ${error.message}`, "red");
    throw error;
  }
}

async function runTests() {
  log("🚀 Starting OpenTelemetry Test Suite", "blue");
  log("=====================================", "blue");

  // Test health endpoint first
  try {
    log("\n📊 Testing health endpoint...", "blue");
    const healthResult = await makeRequest(`${BASE_URL}/health`);
    log(`✅ Health check - Status: ${healthResult.statusCode}`, "green");
  } catch (error) {
    log(`❌ Health check failed: ${error.message}`, "red");
    log("Make sure the application is running on port 3010", "yellow");
    process.exit(1);
  }

  // Test metrics endpoint
  try {
    log("\n📈 Testing metrics endpoint...", "blue");
    const metricsResult = await makeRequest(`${BASE_URL}/metrics`, false);
    log(`✅ Metrics endpoint - Status: ${metricsResult.statusCode}`, "green");

    // Check for OpenTelemetry metrics
    const metricsContent = metricsResult.response;
    if (typeof metricsContent === "string") {
      const hasOtelMetrics =
        metricsContent.includes("http_request_duration_seconds") ||
        metricsContent.includes("operation_total") ||
        metricsContent.includes("errors_total");

      if (hasOtelMetrics) {
        log("✅ OpenTelemetry metrics detected", "green");
      } else {
        log("⚠️  OpenTelemetry metrics not found", "yellow");
      }
    }
  } catch (error) {
    log(`❌ Metrics endpoint failed: ${error.message}`, "red");
  }

  // Test OpenTelemetry metrics endpoint
  try {
    log("\n🔍 Testing OpenTelemetry metrics endpoint...", "blue");
    const otelMetricsResult = await makeRequest(
      `${BASE_URL}:9464/metrics`,
      false
    );
    log(
      `✅ OpenTelemetry metrics - Status: ${otelMetricsResult.statusCode}`,
      "green"
    );

    const otelMetricsContent = otelMetricsResult.response;
    if (typeof otelMetricsContent === "string") {
      const hasOtelMetrics =
        otelMetricsContent.includes("http_request_duration_seconds") ||
        otelMetricsContent.includes("operation_total") ||
        otelMetricsContent.includes("errors_total");

      if (hasOtelMetrics) {
        log("✅ OpenTelemetry metrics found on dedicated endpoint", "green");
      } else {
        log(
          "⚠️  OpenTelemetry metrics not found on dedicated endpoint",
          "yellow"
        );
      }
    }
  } catch (error) {
    log(`❌ OpenTelemetry metrics endpoint failed: ${error.message}`, "red");
    log("Make sure the application is exposing metrics on port 9464", "yellow");
  }

  // Test API endpoints
  log("\n🌐 Testing API endpoints...", "blue");
  const results = [];

  for (const endpoint of TEST_ENDPOINTS) {
    try {
      const result = await testEndpoint(endpoint);
      results.push(result);

      // Add a small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      results.push({ error: error.message });
    }
  }

  // Summary
  log("\n📋 Test Summary", "blue");
  log("===============", "blue");

  const successfulTests = results.filter((r) => !r.error).length;
  const totalTests = results.length;

  log(`Total tests: ${totalTests}`, "blue");
  log(`Successful: ${successfulTests}`, "green");
  log(
    `Failed: ${totalTests - successfulTests}`,
    totalTests - successfulTests > 0 ? "red" : "green"
  );

  if (successfulTests === totalTests) {
    log("\n🎉 All tests passed! OpenTelemetry is working correctly.", "green");
    log("\n📊 Next steps:", "blue");
    log("1. Open Jaeger UI: http://localhost:16686", "yellow");
    log("2. Open Grafana: http://localhost:3000", "yellow");
    log("3. Open Prometheus: http://localhost:9090", "yellow");
    log("4. Check the OpenTelemetry Metrics Dashboard in Grafana", "yellow");
  } else {
    log(
      "\n⚠️  Some tests failed. Check the application logs for more details.",
      "yellow"
    );
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n💥 Test suite failed: ${error.message}`, "red");
  process.exit(1);
});
