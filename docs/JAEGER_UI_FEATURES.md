# Jaeger UI Features Guide

The Jaeger UI provides powerful tools for exploring, comparing, and monitoring distributed traces. Here’s a breakdown of the main features and how to use them effectively.

---

## 1. Search

**Purpose:** Find and view traces for a specific service, operation, or time range.

**How to Use:**

- Select your service (e.g., `nodejs-app`) from the dropdown.
- Optionally, select an operation or time window.
- Click **Find Traces** to view trace data.
- Click on a trace to see its detailed timeline and span information.

**Setup:**

- No extra setup required. Just ensure your services are sending traces to Jaeger.

---

## 2. Compare

**Purpose:** Compare two traces side-by-side to analyze differences in performance, errors, or structure.

**How to Use:**

- Use the **Search** feature to find traces.
- Select two traces using the checkboxes on the left.
- Click **Compare** to view them side-by-side.

**Setup:**

- No extra setup required. Works automatically with your trace data.

---

## 3. System Architecture

**Purpose:** Visualize the service dependency graph (how services call each other).

**How to Use:**

- Click on **System Architecture** in the Jaeger UI menu.
- View the graph showing services and their relationships based on trace data.

**Setup & Best Practices:**

- Works automatically if your traces include multiple services and parent-child relationships.
- For richer graphs, instrument more services with OpenTelemetry and ensure trace context is propagated between them (OpenTelemetry auto-instrumentation handles this for HTTP/gRPC calls).

---

## 4. Monitor (Service Performance Monitoring)

**Purpose:** Monitor trace-derived RED metrics (Request rate, Error rate, Duration) for your services and operations.

**How to Enable and Configure:**

### Step 1: Add the SpanMetrics Connector to OpenTelemetry Collector

Run an OpenTelemetry Collector with a pipeline that includes the `spanmetrics` connector. This generates metrics from your traces and exposes them for Prometheus to scrape.

**Example `otel-collector-config.yaml`:**

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  prometheus:
    endpoint: "0.0.0.0:8889"

connectors:
  spanmetrics:

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger, spanmetrics]
    metrics/spanmetrics:
      receivers: [spanmetrics]
      exporters: [prometheus]
```

### Step 2: Configure Prometheus to Scrape the Collector

Add a scrape job in your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: "otel-collector-spanmetrics"
    static_configs:
      - targets: ["otel-collector:8889"]
```

### Step 3: Configure Jaeger to Use Prometheus as the Metrics Backend

Tell Jaeger Query to use Prometheus for metrics:

```yaml
extensions:
  jaeger_storage:
    backends:
      my_trace_storage: ...
    metric_backends:
      my_metrics_storage:
        prometheus:
          endpoint: http://prometheus:9090
          normalize_calls: true
          normalize_duration: true

  jaeger_query:
    traces: my_trace_storage
    metrics_storage: my_metrics_storage
```

### Step 4: Enable the Monitor Tab in Jaeger UI

Set the following in your Jaeger UI config:

```yaml
monitor.menuEnabled: true
```

### Step 5: Restart All Components

Restart your OpenTelemetry Collector, Prometheus, and Jaeger services.

### Step 6: Generate Trace Traffic

Use your app or a load generator to create traces, so metrics are generated.

### Step 7: Verify

Open the Jaeger UI and click the **Monitor** tab. You should see RED metrics for your services and operations.

---

## Troubleshooting

- If the Monitor tab is empty:
  - Check that Prometheus is scraping the spanmetrics endpoint.
  - Query Prometheus for `traces_span_metrics_calls_total` and `traces_span_metrics_duration_milliseconds_bucket`.
  - Check Jaeger logs for errors about metrics queries.
  - See the [official troubleshooting section](https://www.jaegertracing.io/docs/2.8/architecture/spm/#troubleshooting).

---

## Best Practices

- **Instrument More Services:** To get the most out of System Architecture and Monitor, add OpenTelemetry tracing to all your services.
- **Propagate Trace Context:** Ensure trace headers are passed between services (OpenTelemetry does this automatically for HTTP/gRPC if auto-instrumentation is enabled).
- **Generate Traffic:** Use your app or load testing tools (like k6) to generate traces for richer data.

---

## Advanced Customization

If you want to:

- Add authentication to Jaeger
- Change the storage backend (e.g., use Elasticsearch or Cassandra)
- Integrate Jaeger with Grafana

...please refer to the Jaeger documentation or ask for specific guidance.

---

## References

- [Jaeger SPM Architecture & Setup](https://www.jaegertracing.io/docs/2.8/architecture/spm/)
- [SpanMetrics Connector](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/spanmetricsconnector)

---

## Summary

All these features are available out-of-the-box with Jaeger, except for the Monitor tab, which requires additional setup as described above. Just ensure your services are sending traces, and use the UI to search, compare, visualize, and monitor your distributed traces.

For more details, see the official Jaeger documentation: https://www.jaegertracing.io/docs/latest/
