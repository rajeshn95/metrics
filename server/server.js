const express = require("express");
const promClient = require("prom-client");
const {
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  operationCounter,
} = require("./metrics");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const pino = require("pino");

const app = express();

// Environment variables
const PORT = process.env.PORT || 3010;
const SERVICE_NAME = process.env.SERVICE_NAME || "payment-processor";

// Configure Pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: SERVICE_NAME,
    env: process.env.NODE_ENV || "development",
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Prometheus metrics setup
const register = promClient.register;

// Enable default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Middleware to track metrics and logging
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Track active connections
  activeConnections.inc();

  // Add request ID to response headers for tracing
  res.setHeader("X-Request-ID", requestId);

  // Log incoming request
  logger.info({
    message: "Incoming request",
    request_id: requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    client_ip: req.ip,
    user_agent: req.get("User-Agent"),
    endpoint: `${req.method} ${req.path}`,
    event_type: "request_start",
    timestamp: new Date().toISOString(),
  });

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

    // Log request completion
    const logLevel = res.statusCode >= 400 ? "warn" : "info";
    logger[logLevel]({
      message: "Request completed",
      request_id: requestId,
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: Math.round(duration * 1000),
      content_length: res.get("Content-Length") || 0,
      event_type: "request_end",
      timestamp: new Date().toISOString(),
    });
  });

  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    logger.debug({
      message: "Metrics endpoint accessed",
      event_type: "metrics_request",
      timestamp: new Date().toISOString(),
    });

    res.set("Content-Type", register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);

    logger.debug({
      message: "Metrics endpoint served successfully",
      event_type: "metrics_response",
      metrics_size: metrics.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({
      message: "Error serving metrics",
      error: err.message,
      stack: err.stack,
      event_type: "metrics_error",
      timestamp: new Date().toISOString(),
    });
    res.status(500).end(err);
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  logger.debug({
    message: "Health check requested",
    event_type: "health_check",
    timestamp: new Date().toISOString(),
  });

  const healthStatus = {
    status: "OK",
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    version: "1.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  res.json(healthStatus);

  logger.debug({
    message: "Health check completed",
    event_type: "health_response",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Fast API endpoint (for baseline performance)
app.get("/api/fast", (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "Fast API endpoint called",
    endpoint: "/api/fast",
    event_type: "api_fast_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("fast_operation").inc();

  const response = {
    message: "Fast response",
    timestamp: new Date().toISOString(),
    performance: "instant",
  };

  res.json(response);

  const duration = Date.now() - startTime;
  logger.info({
    message: "Fast API endpoint completed",
    endpoint: "/api/fast",
    duration_ms: duration,
    event_type: "api_fast_end",
    timestamp: new Date().toISOString(),
  });
});

// Medium API endpoint (simulates some processing)
app.get("/api/medium", async (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "Medium API endpoint called",
    endpoint: "/api/medium",
    event_type: "api_medium_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("medium_operation").inc();

  // Simulate some processing time
  const processingTime = 100 + Math.random() * 200;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const response = {
    message: "Medium response",
    timestamp: new Date().toISOString(),
    performance: "medium",
    processing_time: "100-300ms",
    actual_processing_time_ms: Math.round(processingTime),
  };

  res.json(response);

  const totalDuration = Date.now() - startTime;
  logger.info({
    message: "Medium API endpoint completed",
    endpoint: "/api/medium",
    processing_time_ms: Math.round(processingTime),
    total_duration_ms: totalDuration,
    event_type: "api_medium_end",
    timestamp: new Date().toISOString(),
  });
});

// Slow API endpoint (simulates heavy processing)
app.get("/api/slow", async (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "Slow API endpoint called",
    endpoint: "/api/slow",
    event_type: "api_slow_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("slow_operation").inc();

  // Simulate heavy processing
  const processingTime = 1000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const response = {
    message: "Slow response",
    timestamp: new Date().toISOString(),
    performance: "slow",
    processing_time: "1-3 seconds",
    actual_processing_time_ms: Math.round(processingTime),
  };

  res.json(response);

  const totalDuration = Date.now() - startTime;
  logger.info({
    message: "Slow API endpoint completed",
    endpoint: "/api/slow",
    processing_time_ms: Math.round(processingTime),
    total_duration_ms: totalDuration,
    event_type: "api_slow_end",
    timestamp: new Date().toISOString(),
  });
});

// Error-prone endpoint (randomly fails)
app.get("/api/unreliable", (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "Unreliable API endpoint called",
    endpoint: "/api/unreliable",
    event_type: "api_unreliable_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("unreliable_operation").inc();

  // 20% chance of failure
  const randomValue = Math.random();
  if (randomValue < 0.2) {
    logger.warn({
      message: "Unreliable API endpoint failed",
      endpoint: "/api/unreliable",
      random_value: randomValue,
      failure_threshold: 0.2,
      event_type: "api_unreliable_failure",
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Random failure occurred",
      timestamp: new Date().toISOString(),
      random_value: randomValue,
    });
    return;
  }

  const response = {
    message: "Unreliable but successful response",
    timestamp: new Date().toISOString(),
    reliability: "80% success rate",
    random_value: randomValue,
  };

  res.json(response);

  const duration = Date.now() - startTime;
  logger.info({
    message: "Unreliable API endpoint succeeded",
    endpoint: "/api/unreliable",
    random_value: randomValue,
    duration_ms: duration,
    event_type: "api_unreliable_success",
    timestamp: new Date().toISOString(),
  });
});

// CPU intensive endpoint
app.get("/api/cpu-intensive", (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "CPU intensive API endpoint called",
    endpoint: "/api/cpu-intensive",
    event_type: "api_cpu_intensive_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("cpu_intensive_operation").inc();

  // Simulate CPU intensive work
  const computationStart = Date.now();
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }
  const computationDuration = Date.now() - computationStart;

  const response = {
    message: "CPU intensive operation completed",
    timestamp: new Date().toISOString(),
    calculation_result: result.toFixed(2),
    processing_time_ms: computationDuration,
    iterations: 1000000,
  };

  res.json(response);

  const totalDuration = Date.now() - startTime;
  logger.info({
    message: "CPU intensive API endpoint completed",
    endpoint: "/api/cpu-intensive",
    computation_time_ms: computationDuration,
    total_duration_ms: totalDuration,
    result: result.toFixed(2),
    iterations: 1000000,
    event_type: "api_cpu_intensive_end",
    timestamp: new Date().toISOString(),
  });
});

// Memory intensive endpoint
app.get("/api/memory-intensive", (req, res) => {
  const startTime = Date.now();

  logger.info({
    message: "Memory intensive API endpoint called",
    endpoint: "/api/memory-intensive",
    event_type: "api_memory_intensive_start",
    timestamp: new Date().toISOString(),
  });

  operationCounter.labels("memory_intensive_operation").inc();

  // Simulate memory usage
  const memoryStart = Date.now();
  const largeArray = new Array(1000000).fill(0).map((_, i) => i);
  const sum = largeArray.reduce((acc, val) => acc + val, 0);
  const memoryDuration = Date.now() - memoryStart;

  const response = {
    message: "Memory intensive operation completed",
    timestamp: new Date().toISOString(),
    array_size: largeArray.length,
    sum_result: sum,
    memory_usage_mb: (largeArray.length * 8) / (1024 * 1024), // Approximate memory usage
  };

  res.json(response);

  const totalDuration = Date.now() - startTime;
  logger.info({
    message: "Memory intensive API endpoint completed",
    endpoint: "/api/memory-intensive",
    memory_operation_time_ms: memoryDuration,
    total_duration_ms: totalDuration,
    array_size: largeArray.length,
    sum_result: sum,
    estimated_memory_mb: (largeArray.length * 8) / (1024 * 1024),
    event_type: "api_memory_intensive_end",
    timestamp: new Date().toISOString(),
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

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: "Unhandled error occurred",
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    event_type: "unhandled_error",
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn({
    message: "Route not found",
    method: req.method,
    path: req.path,
    event_type: "route_not_found",
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    error: "Route not found",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Serve index.html for all other routes (including '/')
app.get("*", (req, res) => {
  logger.debug({
    message: "Serving static file",
    path: req.path,
    event_type: "static_file_served",
    timestamp: new Date().toISOString(),
  });

  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
const server = app.listen(PORT, () => {
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

  logger.info({
    message: `${SERVICE_NAME} started successfully`,
    port: PORT,
    service: SERVICE_NAME,
    env: process.env.NODE_ENV || "development",
    pid: process.pid,
    node_version: process.version,
    platform: process.platform,
    memory_usage: process.memoryUsage(),
    event_type: "startup",
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  logger.info({
    message: "SIGTERM received, shutting down gracefully",
    event_type: "shutdown_start",
    timestamp: new Date().toISOString(),
  });

  server.close(() => {
    logger.info({
      message: "Server closed successfully",
      event_type: "shutdown_complete",
      timestamp: new Date().toISOString(),
    });
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info({
    message: "SIGINT received, shutting down gracefully",
    event_type: "shutdown_start",
    timestamp: new Date().toISOString(),
  });

  server.close(() => {
    logger.info({
      message: "Server closed successfully",
      event_type: "shutdown_complete",
      timestamp: new Date().toISOString(),
    });
    process.exit(0);
  });
});

// Uncaught exception handling
process.on("uncaughtException", (err) => {
  logger.error({
    message: "Uncaught exception",
    error: err.message,
    stack: err.stack,
    event_type: "uncaught_exception",
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});

// Unhandled promise rejection handling
process.on("unhandledRejection", (reason, promise) => {
  logger.error({
    message: "Unhandled promise rejection",
    reason: reason,
    promise: promise,
    event_type: "unhandled_rejection",
    timestamp: new Date().toISOString(),
  });
  process.exit(1);
});
