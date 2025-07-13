# OpenTelemetry Implementation Guide

This document explains the OpenTelemetry implementation in the metrics project, including setup, configuration, and usage.

## Overview

OpenTelemetry (OTel) is a collection of tools, APIs, and SDKs used to instrument, generate, collect, and export telemetry data (metrics, logs, and traces) to help analyze the performance and behavior of your applications.

## What's Implemented

### 1. **Distributed Tracing**

- Automatic HTTP request tracing
- Custom span creation for business operations
- Database operation simulation with tracing
- External API call simulation with tracing
- Span attributes and context propagation

### 2. **Metrics Collection**

- HTTP request duration histograms
- Request/response size metrics
- Active request counters
- Operation counters
- Error rate tracking
- Custom business metrics

### 3. **Auto-instrumentation**

- Express.js middleware instrumentation
- HTTP client/server instrumentation
- Automatic span creation for HTTP requests
- Request context propagation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Node.js App   │    │   Prometheus    │    │     Jaeger      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │OpenTelemetry│ │───▶│ │   Metrics   │ │    │ │   Traces    │ │
│ │   SDK       │ │    │ │  Scraping   │ │    │ │  Collection │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │    Grafana      │    │   Jaeger UI     │
         │              │                 │    │                 │
         │              │ ┌─────────────┐ │    │ ┌─────────────┐ │
         │              │ │  Dashboards │ │    │ │ Trace View  │ │
         │              │ │  & Alerts   │ │    │ │  & Search   │ │
         │              │ └─────────────┘ │    │ └─────────────┘ │
         │              └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Application   │
│     Logs        │
└─────────────────┘
```

## Components

### 1. **opentelemetry.js**

Main configuration file that sets up:

- NodeSDK with auto-instrumentations
- Prometheus exporter for metrics
- Jaeger exporter for traces
- Resource configuration with service metadata

### 2. **telemetry.js**

Custom telemetry utilities providing:

- Custom metrics creation
- Span creation helpers
- Middleware for request tracing
- Database and API call simulation with tracing

### 3. **Server Integration**

Enhanced server.js with:

- OpenTelemetry middleware
- Custom operation tracking
- Simulated database operations
- External API call simulation

## Configuration

### Environment Variables

```bash
# Service Configuration
SERVICE_NAME=metrics-testing
SERVICE_VERSION=1.0.0
NODE_ENV=production

# OpenTelemetry Configuration
JAEGER_ENDPOINT=http://jaeger:14268/api/traces
PROMETHEUS_PORT=9464

# Application Configuration
PORT=3010
LOG_LEVEL=info
```

### Docker Compose Services

1. **Jaeger**: Distributed tracing backend

   - Port: 16686 (UI), 14268 (HTTP collector)
   - All-in-one deployment for simplicity

2. **Node.js App**: Enhanced with OpenTelemetry

   - Port: 3010 (app), 9464 (OTel metrics)
   - Auto-instrumentation enabled

3. **Prometheus**: Metrics collection
   - Scrapes both traditional and OTel metrics
   - Dual job configuration

## Metrics Available

### HTTP Metrics

- `http_request_duration_seconds`: Request duration histogram
- `http_request_size_bytes`: Request size histogram
- `http_response_size_bytes`: Response size histogram
- `http_active_requests`: Active request counter

### Business Metrics

- `operation_total`: Operation counter with labels
- `errors_total`: Error counter with labels

### System Metrics

- Default Node.js metrics (CPU, memory, etc.)
- Process metrics
- Runtime metrics

## Traces Available

### Automatic Traces

- HTTP request/response spans
- Express middleware spans
- HTTP client spans

### Custom Traces

- Database operation spans
- External API call spans
- Business logic spans

## Dashboards

### OpenTelemetry Metrics Dashboard

Located at: `grafana/dashboards/opentelemetry-dashboard.json`

**Panels:**

1. Request Rate (OpenTelemetry)
2. Response Time P95/P99 (OpenTelemetry)
3. Active Requests (OpenTelemetry)
4. Error Rate (OpenTelemetry)
5. Operation Rate (OpenTelemetry)
6. Request/Response Size (OpenTelemetry)

## Usage Examples

### 1. Starting the Stack

```bash
# Install dependencies
cd server
npm install

# Start the entire stack
docker-compose up -d
```

### 2. Accessing Services

- **Application**: http://localhost:3010
- **Grafana**: http://localhost:3000 (admin/admin)
- **Jaeger UI**: http://localhost:16686
- **Prometheus**: http://localhost:9090

### 3. Testing the API

```bash
# Fast endpoint
curl http://localhost:3010/api/fast

# Medium endpoint (with DB simulation)
curl http://localhost:3010/api/medium

# Slow endpoint (with DB + external API simulation)
curl http://localhost:3010/api/slow
```

### 4. Viewing Traces

1. Open Jaeger UI: http://localhost:16686
2. Select service: `metrics-testing`
3. Click "Find Traces"
4. View trace details with spans

### 5. Viewing Metrics

1. Open Grafana: http://localhost:3000
2. Navigate to "OpenTelemetry Metrics Dashboard"
3. View real-time metrics and trends

## Custom Instrumentation

### Adding Custom Metrics

```javascript
const { meter } = require("./telemetry");

// Create a custom counter
const customCounter = meter.createCounter("custom_operation_total", {
  description: "Total number of custom operations",
});

// Record a value
customCounter.add(1, { "operation.type": "custom" });
```

### Adding Custom Spans

```javascript
const { tracer } = require("./telemetry");

// Create a custom span
const span = tracer.startSpan("custom_operation", {
  attributes: {
    "operation.type": "custom",
    "custom.attribute": "value",
  },
});

try {
  // Your business logic here
  span.setStatus({ code: trace.SpanStatusCode.OK });
} catch (error) {
  span.setStatus({
    code: trace.SpanStatusCode.ERROR,
    message: error.message,
  });
  span.recordException(error);
} finally {
  span.end();
}
```

### Adding Database Tracing

```javascript
const { simulateDatabaseOperation } = require("./telemetry");

// Simulate database operation with tracing
const result = await simulateDatabaseOperation(
  "user_query",
  100, // duration in ms
  req.span // parent span
);
```

## Best Practices

### 1. **Span Naming**

- Use descriptive names: `db.user_query`, `http.external_api_call`
- Include operation type in attributes

### 2. **Error Handling**

- Always set span status on errors
- Record exceptions with `span.recordException()`
- Use appropriate error codes

### 3. **Metrics Design**

- Use histograms for duration metrics
- Use counters for cumulative values
- Include relevant labels/attributes

### 4. **Performance**

- Keep spans lightweight
- Avoid expensive operations in span creation
- Use batch processing for high-volume scenarios

## Troubleshooting

### Common Issues

1. **Traces not appearing in Jaeger**

   - Check Jaeger endpoint configuration
   - Verify network connectivity
   - Check Jaeger logs

2. **Metrics not appearing in Prometheus**

   - Verify Prometheus scraping configuration
   - Check metrics endpoint accessibility
   - Review Prometheus targets

3. **High memory usage**
   - Monitor span buffer size
   - Adjust batch processing settings
   - Check for memory leaks in custom instrumentation

### Debug Mode

Enable debug logging:

```bash
export OTEL_LOG_LEVEL=debug
export OTEL_TRACES_SAMPLER=always_on
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Request Rate**: `rate(http_request_duration_seconds_count[5m])`
2. **Error Rate**: `rate(errors_total[5m])`
3. **Response Time**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
4. **Active Requests**: `http_active_requests`

### Sample Alerts

```yaml
# High Error Rate
- alert: HighErrorRate
  expr: rate(errors_total[5m]) > 0.1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High error rate detected"

# High Response Time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High response time detected"
```

## Future Enhancements

1. **Additional Exporters**

   - OTLP exporter for cloud-native deployments
   - Zipkin exporter for compatibility
   - Custom exporters for specific backends

2. **Advanced Features**

   - Sampling configuration
   - Baggage propagation
   - Custom propagators
   - Resource detection

3. **Integration**
   - Kubernetes deployment
   - Service mesh integration
   - Cloud provider integration

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Node.js Instrumentation](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
