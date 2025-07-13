const { NodeSDK } = require("@opentelemetry/sdk-node");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");
const { Resource } = require("@opentelemetry/resources");
const {
  SemanticResourceAttributes,
} = require("@opentelemetry/semantic-conventions");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const {
  OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-node");
const { MeterProvider } = require("@opentelemetry/sdk-metrics");

// Environment variables
const SERVICE_NAME = process.env.SERVICE_NAME || "metrics-testing";
const SERVICE_VERSION = process.env.SERVICE_VERSION || "1.0.0";
const ENVIRONMENT = process.env.NODE_ENV || "development";
const OTEL_COLLECTOR_ENDPOINT =
  process.env.OTEL_COLLECTOR_ENDPOINT || "jaeger:4318";
const PROMETHEUS_PORT = process.env.PROMETHEUS_PORT || 9464;

// Create resource with service information
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
});

// Configure Prometheus exporter for metrics
const prometheusExporter = new PrometheusExporter({
  port: PROMETHEUS_PORT,
  endpoint: "/metrics",
  appendTimestamp: true,
});

// Configure OTLP HTTP exporter for traces
const otlpExporter = new OTLPTraceExporter({
  url: `http://${OTEL_COLLECTOR_ENDPOINT}/v1/traces`,
});

// Create meter provider
const meterProvider = new MeterProvider({
  resource: resource,
});

// Register meter provider
const { metrics } = require("@opentelemetry/api");
metrics.setGlobalMeterProvider(meterProvider);

// Create and configure the NodeSDK
const sdk = new NodeSDK({
  resource: resource,
  spanProcessor: new BatchSpanProcessor(otlpExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Enable all auto-instrumentations
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-fs": {
        enabled: false, // Disable file system instrumentation to reduce noise
      },
    }),
  ],
  metricReader: prometheusExporter,
});

// Initialize the SDK
try {
  sdk.start();
  console.log("OpenTelemetry SDK initialized successfully");
  console.log(
    `Prometheus metrics available at http://localhost:${PROMETHEUS_PORT}/metrics`
  );
  console.log(
    `OTLP HTTP traces being sent to: http://${OTEL_COLLECTOR_ENDPOINT}/v1/traces`
  );

  // Manual test span
  const { trace } = require("@opentelemetry/api");
  const tracer = trace.getTracer("manual-test");
  const span = tracer.startSpan("manual-test-span", { kind: 1 });
  setTimeout(() => {
    span.end();
    console.log("Manual test span ended");
  }, 1000);
} catch (error) {
  console.error("Error initializing OpenTelemetry SDK:", error);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  try {
    sdk.shutdown();
    console.log("OpenTelemetry SDK terminated");
  } catch (error) {
    console.error("Error terminating OpenTelemetry SDK:", error);
  } finally {
    process.exit(0);
  }
});

module.exports = { sdk, prometheusExporter, otlpExporter };
