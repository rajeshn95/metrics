# Jaeger Trace Troubleshooting Guide

## Issue: Traces not visible in Jaeger Dashboard

### Root Cause Analysis

The main issue was that the Node.js application was configured to send traces using the Jaeger HTTP Thrift endpoint (`http://jaeger:14268/api/traces`), but OpenTelemetry should use the OTLP (OpenTelemetry Protocol) endpoint instead.

### Changes Made

1. **Updated Docker Compose Configuration**:

   - Added OTLP ports (4317 for gRPC, 4318 for HTTP)
   - Added OTLP environment variables for Jaeger
   - Updated Node.js app to use OTLP endpoint

2. **Updated OpenTelemetry Configuration**:
   - Replaced `@opentelemetry/exporter-jaeger` with `@opentelemetry/exporter-trace-otlp-http`
   - Updated endpoint from `http://jaeger:14268/api/traces` to `http://jaeger:4318/v1/traces`

### Verification Steps

1. **Start the services**:

   ```bash
   docker compose up -d
   ```

2. **Check if containers are running**:

   ```bash
   docker compose ps
   ```

3. **Verify Jaeger is accessible**:

   - Open http://localhost:16686 in your browser
   - You should see the Jaeger UI

4. **Generate test traces**:

   ```bash
   # From the server directory
   node test-opentelemetry.js
   ```

5. **Make API calls to generate traces**:

   ```bash
   curl http://localhost:3010/api/fast
   curl http://localhost:3010/api/medium
   curl http://localhost:3010/api/slow
   ```

6. **Check Jaeger UI**:
   - Go to http://localhost:16686
   - Select service: `nodejs-app`
   - Click "Find Traces"
   - You should see traces from your API calls

### Common Issues and Solutions

#### Issue 1: No traces appearing in Jaeger

**Symptoms**: Jaeger UI loads but shows no traces
**Solutions**:

- Check if the Node.js app is running: `docker compose logs nodejs-app`
- Verify OTLP endpoint is correct: `http://jaeger:4318/v1/traces`
- Check network connectivity between containers

#### Issue 2: Jaeger container not starting

**Symptoms**: Jaeger container fails to start
**Solutions**:

- Check Docker logs: `docker compose logs jaeger`
- Verify port 4318 is not already in use
- Check Docker daemon is running

#### Issue 3: OpenTelemetry SDK errors

**Symptoms**: Node.js app shows OpenTelemetry initialization errors
**Solutions**:

- Check if OTLP exporter package is installed: `npm install @opentelemetry/exporter-trace-otlp-http`
- Verify the Jaeger endpoint is reachable from the Node.js container
- Check environment variables are set correctly

### Debugging Commands

```bash
# Check container logs
docker compose logs nodejs-app
docker compose logs jaeger

# Check network connectivity
docker compose exec nodejs-app ping jaeger

# Test OTLP endpoint directly
curl -X POST http://localhost:4318/v1/traces

# Check if ports are exposed
netstat -an | grep 4318
netstat -an | grep 16686

# Restart services
docker compose restart nodejs-app jaeger
```

### Expected Behavior

After the fixes:

1. Node.js app should start without OpenTelemetry errors
2. API calls should generate traces
3. Traces should appear in Jaeger UI within 1-2 seconds
4. Service name should be `nodejs-app`
5. Trace spans should include HTTP method, path, and status code

### Monitoring

To monitor trace generation:

1. Watch Node.js logs: `docker compose logs -f nodejs-app`
2. Check Jaeger UI for new traces
3. Use the test script: `node test-opentelemetry.js`

### Next Steps

Once traces are visible:

1. Explore the trace details in Jaeger UI
2. Set up Grafana dashboards for trace visualization
3. Configure alerting based on trace metrics
4. Implement distributed tracing across multiple services
