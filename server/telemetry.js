const { trace, metrics } = require("@opentelemetry/api");

// Get the tracer and meter
const tracer = trace.getTracer("metrics-testing");
const meter = metrics.getMeter("metrics-testing");

// Create custom metrics
const requestDuration = meter.createHistogram("http_request_duration_seconds", {
  description: "Duration of HTTP requests in seconds",
  unit: "s",
});

const requestSize = meter.createHistogram("http_request_size_bytes", {
  description: "Size of HTTP requests in bytes",
  unit: "By",
});

const responseSize = meter.createHistogram("http_response_size_bytes", {
  description: "Size of HTTP responses in bytes",
  unit: "By",
});

const activeRequests = meter.createUpDownCounter("http_active_requests", {
  description: "Number of active HTTP requests",
});

const operationCounter = meter.createCounter("operation_total", {
  description: "Total number of operations",
});

const errorCounter = meter.createCounter("errors_total", {
  description: "Total number of errors",
});

// Custom span attributes
const spanAttributes = {
  "service.name": "metrics-testing",
  "service.version": "1.0.0",
};

// Function to create a span for API operations
function createApiSpan(operationName, attributes = {}) {
  return tracer.startSpan(operationName, {
    attributes: {
      ...spanAttributes,
      "operation.type": "api",
      ...attributes,
    },
  });
}

// Function to record request metrics
function recordRequestMetrics(
  method,
  path,
  statusCode,
  duration,
  requestSizeBytes,
  responseSizeBytes
) {
  const attributes = {
    "http.method": method,
    "http.route": path,
    "http.status_code": statusCode,
  };

  requestDuration.record(duration, attributes);

  if (requestSizeBytes) {
    requestSize.record(requestSizeBytes, attributes);
  }

  if (responseSizeBytes) {
    responseSize.record(responseSizeBytes, attributes);
  }
}

// Function to record operation metrics
function recordOperation(operationType, attributes = {}) {
  operationCounter.add(1, {
    "operation.type": operationType,
    ...attributes,
  });
}

// Function to record errors
function recordError(errorType, attributes = {}) {
  errorCounter.add(1, {
    "error.type": errorType,
    ...attributes,
  });
}

// Middleware for OpenTelemetry instrumentation
function otelMiddleware(req, res, next) {
  const startTime = process.hrtime.bigint();
  const requestId = Math.random().toString(36).substring(7);

  // Increment active requests
  activeRequests.add(1, {
    "http.method": req.method,
    "http.route": req.route?.path || req.path,
  });

  // Create span for the request
  const span = tracer.startSpan(`${req.method} ${req.path}`, {
    kind: 1, // SERVER
    attributes: {
      ...spanAttributes,
      "http.method": req.method,
      "http.url": req.url,
      "http.route": req.route?.path || req.path,
      "http.request_id": requestId,
      "http.user_agent": req.get("User-Agent"),
      "http.client_ip": req.ip,
    },
  });

  // Add span context to request
  req.span = span;
  req.requestId = requestId;

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1e9; // Convert to seconds

    // Decrement active requests
    activeRequests.add(-1, {
      "http.method": req.method,
      "http.route": req.route?.path || req.path,
    });

    // Record request metrics
    const requestSizeBytes = req.headers["content-length"]
      ? parseInt(req.headers["content-length"])
      : 0;
    const responseSizeBytes = chunk ? Buffer.byteLength(chunk, encoding) : 0;

    recordRequestMetrics(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration,
      requestSizeBytes,
      responseSizeBytes
    );

    // Set span attributes for response
    span.setAttributes({
      "http.status_code": res.statusCode,
      "http.response_size": responseSizeBytes,
      "http.request_duration": duration,
    });

    // Record errors if status code indicates error
    if (res.statusCode >= 400) {
      recordError("http_error", {
        "http.method": req.method,
        "http.route": req.route?.path || req.path,
        "http.status_code": res.statusCode,
      });

      span.setStatus({
        code:
          res.statusCode >= 500
            ? 1 // ERROR
            : 0, // UNSET
        message: `HTTP ${res.statusCode}`,
      });
    } else {
      span.setStatus({ code: 0 }); // OK
    }

    // End the span
    span.end();

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

// Function to create child spans for operations
function createOperationSpan(parentSpan, operationName, attributes = {}) {
  return tracer.startSpan(operationName, {
    parent: parentSpan,
    attributes: {
      ...spanAttributes,
      "operation.type": "business_logic",
      ...attributes,
    },
  });
}

// Function to simulate database operation with tracing
async function simulateDatabaseOperation(operation, duration, parentSpan) {
  const span = createOperationSpan(parentSpan, `db.${operation}`, {
    "db.operation": operation,
    "db.system": "simulated",
  });

  try {
    // Simulate database operation
    await new Promise((resolve) => setTimeout(resolve, duration));

    span.setAttributes({
      "db.duration_ms": duration,
    });

    span.setStatus({ code: 0 }); // OK
    return { success: true, duration };
  } catch (error) {
    span.setStatus({
      code: 1, // ERROR
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}

// Function to simulate external API call with tracing
async function simulateExternalApiCall(apiName, duration, parentSpan) {
  const span = createOperationSpan(parentSpan, `http.${apiName}`, {
    "http.url": `https://api.example.com/${apiName}`,
    "http.method": "GET",
    "peer.service": apiName,
  });

  try {
    // Simulate external API call
    await new Promise((resolve) => setTimeout(resolve, duration));

    span.setAttributes({
      "http.duration_ms": duration,
    });

    span.setStatus({ code: 0 }); // OK
    return { success: true, duration };
  } catch (error) {
    span.setStatus({
      code: 1, // ERROR
      message: error.message,
    });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}

module.exports = {
  tracer,
  meter,
  createApiSpan,
  createOperationSpan,
  recordRequestMetrics,
  recordOperation,
  recordError,
  otelMiddleware,
  simulateDatabaseOperation,
  simulateExternalApiCall,
  requestDuration,
  requestSize,
  responseSize,
  activeRequests,
  operationCounter,
  errorCounter,
};
