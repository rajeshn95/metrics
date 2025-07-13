# Jaeger SPM (Service Performance Monitoring) Debugging Guide

This guide helps you debug and verify the Jaeger SPM (Monitor tab) setup. The SPM feature provides RED (Request, Error, Duration) metrics by aggregating span data.

## Quick Status Check

### 1. Check All Services Are Running

```bash
docker compose ps
```

All services should show `Up` status.

### 2. Check Service Health

```bash
# Check Node.js app health
curl http://localhost:3010/health

# Check Prometheus
curl http://localhost:9090/-/healthy

# Check Jaeger UI
curl http://localhost:16686

# Check Jaeger metrics endpoint
curl http://localhost:8889/metrics
```

## Step-by-Step Debugging

### Step 1: Verify Container Status and Logs

#### Check Container Status

```bash
docker compose ps
```

Expected output:

```
NAME           COMMAND                  SERVICE             STATUS              PORTS
grafana        "/run.sh"                grafana             Up                  0.0.0.0:3000->3000/tcp
jaeger         "/go/bin/jaeger --c…"    jaeger              Up                  0.0.0.0:16686->16686/tcp, 0.0.0.0:4317->4317/tcp, 0.0.0.0:4318->4318/tcp, 0.0.0.0:8888->8888/tcp, 0.0.0.0:8889->8889/tcp
k6             "k6 run --out experi…"   k6                  Up                  0.0.0.0:6565->6565/tcp
loki           "/usr/bin/loki -conf…"   loki                Up                  0.0.0.0:3100->3100/tcp
nodejs-app     "docker-entrypoint.s…"   nodejs-app          Up                  0.0.0.0:3010->3010/tcp, 0.0.0.0:9464->9464/tcp
prometheus     "/bin/prometheus --c…"   prometheus          Up                  0.0.0.0:9090->9090/tcp
promtail       "/usr/bin/promtail -…"   promtail            Up
```

#### Check Jaeger Logs

```bash
docker compose logs jaeger
```

Look for:

- ✅ "Starting Jaeger with config"
- ✅ "Starting HTTP server"
- ✅ "Starting gRPC server"
- ❌ Any error messages

#### Check Node.js App Logs

```bash
docker compose logs nodejs-app
```

Look for:

- ✅ "OpenTelemetry SDK initialized successfully"
- ✅ "OTLP HTTP traces being sent to: http://jaeger:4318/v1/traces"
- ✅ "Manual test span ended"
- ❌ Any error messages

### Step 2: Verify Trace Flow

#### Generate Test Traffic

```bash
# Generate some HTTP requests to create traces
curl http://localhost:3010/
curl http://localhost:3010/metrics
curl http://localhost:3010/health
```

#### Check Jaeger UI for Traces

1. Open [http://localhost:16686](http://localhost:16686)
2. Go to the **Search** tab
3. Look for traces from `nodejs-app` service
4. Verify you can see HTTP spans

#### Check Jaeger API for Traces

```bash
# Check if traces are being received
curl "http://localhost:16686/api/services" | jq
```

Expected output should include `nodejs-app` in the services list.

### Step 3: Verify SPM Metrics Generation

#### Check Jaeger Metrics Endpoint

```bash
curl http://localhost:8889/metrics | grep traces_spanmetrics
```

Expected metrics:

- `traces_spanmetrics_calls_total`
- `traces_spanmetrics_duration_milliseconds_bucket`
- `traces_spanmetrics_duration_milliseconds_count`
- `traces_spanmetrics_duration_milliseconds_sum`

#### Check Prometheus for SPM Metrics

1. Open [http://localhost:9090](http://localhost:9090)
2. Go to **Status** → **Targets**
3. Verify `aggregated-trace-metrics` target is **UP**
4. Go to **Graph** and search for:
   - `traces_spanmetrics_calls_total`
   - `traces_spanmetrics_duration_milliseconds_bucket`

#### Query SPM Metrics in Prometheus

```promql
# Check if calls are being counted
traces_spanmetrics_calls_total

# Check duration metrics
traces_spanmetrics_duration_milliseconds_bucket

# Check by service
traces_spanmetrics_calls_total{service_name="nodejs-app"}

# Check by operation
traces_spanmetrics_calls_total{span_name="GET /"}
```

### Step 4: Verify Monitor Tab

#### Check Jaeger UI Configuration

```bash
# Verify UI config is loaded
curl http://localhost:16686/api/config
```

Look for:

```json
{
  "monitor": {
    "menuEnabled": true
  }
}
```

#### Check Monitor Tab

1. Open [http://localhost:16686](http://localhost:16686)
2. Look for the **Monitor** tab in the top navigation
3. If visible, click on it and check for:
   - Service list with `nodejs-app`
   - RED metrics (Request, Error, Duration)
   - Operation-level metrics

### Step 5: Check Jaeger Internal Telemetry

#### Check Jaeger Metrics Store Requests

```bash
curl http://localhost:8888/metrics | grep jaeger_metricstore
```

Look for these metrics:

- `jaeger_metricstore_requests_total{operation="get_call_rates",result="ok"}`
- `jaeger_metricstore_requests_total{operation="get_error_rates",result="ok"}`
- `jaeger_metricstore_requests_total{operation="get_latencies",result="ok"}`

If you see `result="err"` metrics, there's an issue with Prometheus connectivity.

#### Check Jaeger Query Logs

```bash
docker compose logs jaeger | grep -i "metric\|prometheus\|error"
```

### Step 6: Network Connectivity Tests

#### Test Internal Network

```bash
# Test Node.js to Jaeger connectivity
docker compose exec nodejs-app curl -v http://jaeger:4318/v1/traces

# Test Jaeger to Prometheus connectivity
docker compose exec jaeger curl -v http://prometheus:9090/api/v1/query?query=up

# Test Prometheus to Jaeger metrics connectivity
docker compose exec prometheus curl -v http://jaeger:8889/metrics
```

## Common Issues and Solutions

### Issue 1: No Traces in Jaeger UI

**Symptoms:**

- Jaeger UI shows no services
- No traces in Search tab

**Debugging:**

```bash
# Check if Node.js app is sending traces
docker compose logs nodejs-app | grep -i "trace\|span"

# Check Jaeger OTLP receiver
docker compose logs jaeger | grep -i "otlp\|receiver"

# Test trace endpoint directly
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[{"resource":{"attributes":[{"key":"service.name","value":{"stringValue":"test"}}]},"scopeSpans":[{"spans":[{"traceId":"00000000000000000000000000000001","spanId":"0000000000000001","name":"test-span","kind":1,"startTimeUnixNano":"1640995200000000000","endTimeUnixNano":"1640995201000000000"}]}]}]}'
```

**Solutions:**

- Verify Node.js app is using correct OTLP endpoint
- Check Jaeger OTLP receiver is enabled
- Ensure network connectivity between containers

### Issue 2: No SPM Metrics in Prometheus

**Symptoms:**

- `traces_spanmetrics_*` metrics missing in Prometheus
- Monitor tab shows no data

**Debugging:**

```bash
# Check Jaeger metrics endpoint
curl http://localhost:8889/metrics | grep traces_spanmetrics

# Check Prometheus target status
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job == "aggregated-trace-metrics")'

# Check Prometheus scrape logs
docker compose logs prometheus | grep -i "aggregated-trace-metrics"
```

**Solutions:**

- Verify Prometheus is scraping `jaeger:8889`
- Check Jaeger spanmetrics connector is working
- Ensure traces are being processed by Jaeger

### Issue 3: Monitor Tab Not Visible

**Symptoms:**

- Monitor tab missing from Jaeger UI
- UI config not loaded

**Debugging:**

```bash
# Check UI config
curl http://localhost:16686/api/config

# Check Jaeger startup logs
docker compose logs jaeger | grep -i "config\|ui"

# Verify config file is mounted
docker compose exec jaeger ls -la /etc/jaeger/
```

**Solutions:**

- Verify `ui-config.json` is properly mounted
- Check Jaeger version supports SPM
- Restart Jaeger container

### Issue 4: Empty Monitor Tab

**Symptoms:**

- Monitor tab visible but shows no services/operations
- No RED metrics displayed

**Debugging:**

```bash
# Check if metrics are in Prometheus
curl "http://localhost:9090/api/v1/query?query=traces_spanmetrics_calls_total" | jq

# Check Jaeger metricstore requests
curl http://localhost:8888/metrics | grep jaeger_metricstore_requests_total

# Check span kinds in traces
curl "http://localhost:16686/api/traces?service=nodejs-app&limit=1" | jq '.data[0].spans[0].kind'
```

**Solutions:**

- Ensure spans have `SPAN_KIND_SERVER` (kind=1)
- Verify Prometheus connectivity from Jaeger
- Check metric normalization settings

### Issue 5: High Latency or Timeouts

**Symptoms:**

- Slow response times
- Timeout errors in logs

**Debugging:**

```bash
# Check container resource usage
docker stats --no-stream

# Check network latency
docker compose exec nodejs-app ping jaeger
docker compose exec jaeger ping prometheus

# Check for memory/CPU issues
docker compose logs jaeger | grep -i "memory\|cpu\|timeout"
```

**Solutions:**

- Increase container resources if needed
- Check for network congestion
- Optimize Prometheus scrape intervals

## Advanced Debugging

### Enable Debug Logging

#### Jaeger Debug Logs

```bash
# Stop current stack
docker compose down

# Edit docker-compose.yml to add debug logging
# Add to jaeger service:
# environment:
#   - LOG_LEVEL=debug

# Restart
docker compose up -d
```

#### Node.js Debug Logs

```bash
# Check OpenTelemetry debug logs
docker compose logs nodejs-app | grep -i "opentelemetry\|trace\|span"
```

### Manual Trace Generation

```bash
# Generate manual traces for testing
for i in {1..10}; do
  curl http://localhost:3010/
  sleep 1
done
```

### Verify Configuration Files

#### Check Jaeger Config

```bash
docker compose exec jaeger cat /etc/jaeger/config.yml
```

#### Check Prometheus Config

```bash
docker compose exec prometheus cat /etc/prometheus/prometheus.yml
```

## Performance Monitoring

### Key Metrics to Monitor

1. **Trace Processing Rate**

   ```promql
   rate(traces_spanmetrics_calls_total[5m])
   ```

2. **Error Rate**

   ```promql
   rate(traces_spanmetrics_calls_total{status_code="STATUS_CODE_ERROR"}[5m])
   ```

3. **Latency Percentiles**

   ```promql
   histogram_quantile(0.95, rate(traces_spanmetrics_duration_milliseconds_bucket[5m]))
   ```

4. **Jaeger Internal Metrics**
   ```promql
   jaeger_metricstore_requests_total{result="ok"}
   ```

### Health Check Script

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

echo "=== Jaeger SPM Health Check ==="

# Check services
echo "1. Checking services..."
docker compose ps

# Check Jaeger UI
echo "2. Checking Jaeger UI..."
curl -s http://localhost:16686 > /dev/null && echo "✅ Jaeger UI accessible" || echo "❌ Jaeger UI not accessible"

# Check traces
echo "3. Checking traces..."
SERVICES=$(curl -s http://localhost:16686/api/services | jq -r '.data[]' 2>/dev/null)
if [[ $SERVICES == *"nodejs-app"* ]]; then
    echo "✅ Traces found for nodejs-app"
else
    echo "❌ No traces found for nodejs-app"
fi

# Check SPM metrics
echo "4. Checking SPM metrics..."
METRICS=$(curl -s http://localhost:8889/metrics | grep traces_spanmetrics | wc -l)
if [ $METRICS -gt 0 ]; then
    echo "✅ SPM metrics found ($METRICS metrics)"
else
    echo "❌ No SPM metrics found"
fi

# Check Prometheus targets
echo "5. Checking Prometheus targets..."
TARGETS=$(curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job == "aggregated-trace-metrics") | .health' 2>/dev/null)
if [[ $TARGETS == "up" ]]; then
    echo "✅ Prometheus target healthy"
else
    echo "❌ Prometheus target unhealthy"
fi

echo "=== Health Check Complete ==="
```

## Troubleshooting Checklist

- [ ] All containers are running (`docker compose ps`)
- [ ] Node.js app is sending traces (check logs)
- [ ] Jaeger is receiving traces (check UI)
- [ ] SPM metrics are generated (`curl localhost:8889/metrics`)
- [ ] Prometheus is scraping metrics (check targets)
- [ ] Monitor tab is visible in Jaeger UI
- [ ] RED metrics are displayed in Monitor tab
- [ ] No errors in container logs
- [ ] Network connectivity between services
- [ ] Configuration files are properly mounted

## Getting Help

If you're still experiencing issues:

1. **Collect Debug Information:**

   ```bash
   # Save all logs
   docker compose logs > debug-logs.txt

   # Save configurations
   docker compose exec jaeger cat /etc/jaeger/config.yml > jaeger-config.yml
   docker compose exec prometheus cat /etc/prometheus/prometheus.yml > prometheus-config.yml
   ```

2. **Check Official Documentation:**

   - [Jaeger SPM Documentation](https://www.jaegertracing.io/docs/2.8/architecture/spm/)
   - [OpenTelemetry Collector Documentation](https://opentelemetry.io/docs/collector/)

3. **Verify Against Official Example:**
   - Compare your configuration with the [official Jaeger SPM example](https://github.com/jaegertracing/jaeger/tree/main/docker-compose/monitor)

## Success Indicators

When everything is working correctly, you should see:

1. **Jaeger UI**: Monitor tab visible with RED metrics
2. **Prometheus**: `traces_spanmetrics_*` metrics present
3. **Logs**: No errors, traces being processed
4. **Network**: All services can communicate
5. **Performance**: Reasonable latency and throughput

The Monitor tab should show your `nodejs-app` service with request rates, error rates, and duration percentiles (P50, P75, P95).
