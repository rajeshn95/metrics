const express = require("express");
const promClient = require("prom-client");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Prometheus metrics setup
const register = promClient.register;

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

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

const customBusinessMetric = new promClient.Counter({
  name: "business_operations_total",
  help: "Total number of business operations",
  labelNames: ["operation_type"],
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();

  // Track active connections
  activeConnections.inc();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds

    // Record request duration
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);

    // Record total requests
    httpRequestsTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();

    // Decrease active connections
    activeConnections.dec();
  });

  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Fast API endpoint (for baseline performance)
app.get("/api/fast", (req, res) => {
  customBusinessMetric.labels("fast_operation").inc();
  res.json({
    message: "Fast response",
    timestamp: new Date().toISOString(),
    performance: "instant",
  });
});

// Medium API endpoint (simulates some processing)
app.get("/api/medium", async (req, res) => {
  customBusinessMetric.labels("medium_operation").inc();

  // Simulate some processing time
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 200)
  );

  res.json({
    message: "Medium response",
    timestamp: new Date().toISOString(),
    performance: "medium",
    processing_time: "100-300ms",
  });
});

// Slow API endpoint (simulates heavy processing)
app.get("/api/slow", async (req, res) => {
  customBusinessMetric.labels("slow_operation").inc();

  // Simulate heavy processing
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  res.json({
    message: "Slow response",
    timestamp: new Date().toISOString(),
    performance: "slow",
    processing_time: "1-3 seconds",
  });
});

// Error-prone endpoint (randomly fails)
app.get("/api/unreliable", (req, res) => {
  customBusinessMetric.labels("unreliable_operation").inc();

  // 20% chance of failure
  if (Math.random() < 0.2) {
    res.status(500).json({
      error: "Random failure occurred",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.json({
    message: "Unreliable but successful response",
    timestamp: new Date().toISOString(),
    reliability: "80% success rate",
  });
});

// CPU intensive endpoint
app.get("/api/cpu-intensive", (req, res) => {
  customBusinessMetric.labels("cpu_intensive_operation").inc();

  // Simulate CPU intensive work
  const start = Date.now();
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  const duration = Date.now() - start;

  res.json({
    message: "CPU intensive operation completed",
    timestamp: new Date().toISOString(),
    calculation_result: result.toFixed(2),
    processing_time_ms: duration,
  });
});

// Memory intensive endpoint
app.get("/api/memory-intensive", (req, res) => {
  customBusinessMetric.labels("memory_intensive_operation").inc();

  // Simulate memory usage
  const largeArray = new Array(1000000).fill(0).map((_, i) => i);
  const sum = largeArray.reduce((acc, val) => acc + val, 0);

  res.json({
    message: "Memory intensive operation completed",
    timestamp: new Date().toISOString(),
    array_size: largeArray.length,
    sum_result: sum,
  });
});

// Root endpoint (remove or comment out this block)
// app.get("/", (req, res) => {
//   res.json({
//     message: "Prometheus Metrics Learning Server",
//     version: "1.0.0",
//     endpoints: {
//       metrics: "/metrics",
//       health: "/health",
//       fast: "/api/fast",
//       medium: "/api/medium",
//       slow: "/api/slow",
//       unreliable: "/api/unreliable",
//       cpu_intensive: "/api/cpu-intensive",
//       memory_intensive: "/api/memory-intensive",
//     },
//     instructions:
//       "Use these endpoints to generate different types of load and observe metrics in Prometheus",
//   });
// });

// Serve index.html for all other routes (including '/')
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log("\n📈 Available API endpoints for testing:");
  console.log("  GET /api/fast - Instant response");
  console.log("  GET /api/medium - 100-300ms response");
  console.log("  GET /api/slow - 1-3 second response");
  console.log("  GET /api/unreliable - 20% failure rate");
  console.log("  GET /api/cpu-intensive - CPU intensive operation");
  console.log("  GET /api/memory-intensive - Memory intensive operation");
});
