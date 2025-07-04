const http = require("http");

const BASE_URL = "http://localhost:3010";
const ENDPOINTS = [
  "/api/fast",
  "/api/medium",
  "/api/slow",
  "/api/unreliable",
  "/api/cpu-intensive",
  "/api/memory-intensive",
];

// Load test configuration
const CONFIG = {
  duration: 60000, // 1 minute
  requestsPerSecond: 10,
  concurrent: 5,
};

let requestCount = 0;
let successCount = 0;
let errorCount = 0;
let totalResponseTime = 0;

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const start = Date.now();

    http
      .get(`${BASE_URL}${endpoint}`, (res) => {
        const duration = Date.now() - start;
        totalResponseTime += duration;
        requestCount++;

        if (res.statusCode === 200) {
          successCount++;
        } else {
          errorCount++;
        }

        resolve({ statusCode: res.statusCode, duration });
      })
      .on("error", (err) => {
        const duration = Date.now() - start;
        totalResponseTime += duration;
        requestCount++;
        errorCount++;
        resolve({ statusCode: 0, duration, error: err.message });
      });
  });
}

function getRandomEndpoint() {
  return ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
}

function getWeightedEndpoint() {
  // Weight endpoints to create realistic load patterns
  const weights = {
    "/api/fast": 0.4, // 40% fast requests
    "/api/medium": 0.3, // 30% medium requests
    "/api/slow": 0.1, // 10% slow requests
    "/api/unreliable": 0.1, // 10% unreliable requests
    "/api/cpu-intensive": 0.05, // 5% CPU intensive
    "/api/memory-intensive": 0.05, // 5% memory intensive
  };

  const random = Math.random();
  let cumulative = 0;

  for (const [endpoint, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return endpoint;
    }
  }

  return "/api/fast"; // fallback
}

async function runLoadTest() {
  console.log("🚀 Starting load test...");
  console.log(`📊 Duration: ${CONFIG.duration / 1000} seconds`);
  console.log(`⚡ Requests per second: ${CONFIG.requestsPerSecond}`);
  console.log(`🔄 Concurrent requests: ${CONFIG.concurrent}`);
  console.log("");

  const startTime = Date.now();
  const interval = 1000 / CONFIG.requestsPerSecond;

  // Start concurrent request loops
  const workers = Array.from(
    { length: CONFIG.concurrent },
    async (_, workerId) => {
      while (Date.now() - startTime < CONFIG.duration) {
        const endpoint = getWeightedEndpoint();
        const result = await makeRequest(endpoint);

        console.log(
          `Worker ${workerId + 1}: ${endpoint} - ${result.statusCode} (${
            result.duration
          }ms)`
        );

        // Wait for next request
        await new Promise((resolve) =>
          setTimeout(resolve, interval * CONFIG.concurrent)
        );
      }
    }
  );

  await Promise.all(workers);

  // Print results
  const testDuration = (Date.now() - startTime) / 1000;
  const avgResponseTime = totalResponseTime / requestCount;
  const successRate = (successCount / requestCount) * 100;

  console.log("\n📈 Load Test Results:");
  console.log("====================");
  console.log(`⏱️  Test Duration: ${testDuration.toFixed(2)} seconds`);
  console.log(`📊 Total Requests: ${requestCount}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success Rate: ${successRate.toFixed(2)}%`);
  console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(
    `🚀 Requests per second: ${(requestCount / testDuration).toFixed(2)}`
  );

  console.log("\n🎯 Check Prometheus at http://localhost:9090 to see metrics!");
}

// Run different load test scenarios
async function runScenario(scenario) {
  console.log(`\n🎭 Running scenario: ${scenario}`);
  console.log("=".repeat(50));

  switch (scenario) {
    case "baseline":
      CONFIG.requestsPerSecond = 5;
      CONFIG.concurrent = 3;
      break;
    case "normal":
      CONFIG.requestsPerSecond = 10;
      CONFIG.concurrent = 5;
      break;
    case "high":
      CONFIG.requestsPerSecond = 20;
      CONFIG.concurrent = 10;
      break;
    case "stress":
      CONFIG.requestsPerSecond = 50;
      CONFIG.concurrent = 20;
      break;
    default:
      console.log("Unknown scenario. Using normal load.");
  }

  await runLoadTest();
}

// Main execution
const scenario = process.argv[2] || "normal";
runScenario(scenario).catch(console.error);
