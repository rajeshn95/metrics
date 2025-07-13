// Test script to verify OpenTelemetry traces
require("./opentelemetry");

const { trace } = require("@opentelemetry/api");
const tracer = trace.getTracer("test-tracer");

console.log("Testing OpenTelemetry trace generation...");

// Create a test span
const span = tracer.startSpan("test-operation", {
  attributes: {
    "test.type": "manual",
    "test.description": "Verification test",
  },
});

// Simulate some work
setTimeout(() => {
  console.log("Completing test span...");
  span.setStatus({ code: 0 }); // OK
  span.end();

  console.log("Test completed. Check Jaeger UI at http://localhost:16686");
  console.log("Look for service: 'nodejs-app'");

  // Keep the process alive for a moment to ensure traces are sent
  setTimeout(() => {
    console.log("Exiting...");
    process.exit(0);
  }, 2000);
}, 1000);
