# Jaeger SPM Quick Reference

## 🚀 Quick Start

### Start the Stack

```bash
docker compose up -d
```

### Verify Setup

```bash
./verify-spm.sh
```

### Generate Test Traffic

```bash
curl http://localhost:3010/
curl http://localhost:3010/health
curl http://localhost:3010/metrics
```

## 🔗 Key URLs

| Service         | URL                    | Purpose                                 |
| --------------- | ---------------------- | --------------------------------------- |
| **Jaeger UI**   | http://localhost:16686 | Main tracing interface with Monitor tab |
| **Prometheus**  | http://localhost:9090  | Metrics storage and querying            |
| **Grafana**     | http://localhost:3000  | Dashboard visualization                 |
| **Node.js App** | http://localhost:3010  | Application endpoints                   |
| **Loki**        | http://localhost:3100  | Log aggregation                         |

## 📊 Key Metrics to Monitor

### SPM Metrics (in Prometheus)

```promql
# Request rate
rate(traces_spanmetrics_calls_total[5m])

# Error rate
rate(traces_spanmetrics_calls_total{status_code="STATUS_CODE_ERROR"}[5m])

# Latency percentiles
histogram_quantile(0.95, rate(traces_spanmetrics_duration_milliseconds_bucket[5m]))

# By service
traces_spanmetrics_calls_total{service_name="nodejs-app"}

# By operation
traces_spanmetrics_calls_total{span_name="GET /"}
```

### Jaeger Internal Metrics

```promql
# Metric store requests
jaeger_metricstore_requests_total{result="ok"}

# Query performance
jaeger_metricstore_latency_bucket{operation="get_call_rates"}
```

## 🔧 Key Commands

### Container Management

```bash
# Check status
docker compose ps

# View logs
docker compose logs jaeger
docker compose logs nodejs-app

# Restart services
docker compose restart jaeger
docker compose restart nodejs-app

# Full restart
docker compose down && docker compose up -d
```

### Health Checks

```bash
# Check all services
curl http://localhost:3010/health
curl http://localhost:9090/-/healthy
curl http://localhost:16686

# Check SPM metrics
curl http://localhost:8889/metrics | grep traces_spanmetrics

# Check Jaeger internal metrics
curl http://localhost:8888/metrics | grep jaeger_metricstore
```

### Debugging

```bash
# Check trace flow
curl "http://localhost:16686/api/services" | jq

# Check Prometheus targets
curl "http://localhost:9090/api/v1/targets" | jq

# Check UI config
curl "http://localhost:16686/api/config" | jq
```

## 🐛 Common Issues

### No Traces in Jaeger

```bash
# Check if app is sending traces
docker compose logs nodejs-app | grep -i "trace\|span"

# Generate traffic
for i in {1..10}; do curl http://localhost:3010/; sleep 1; done
```

### No SPM Metrics

```bash
# Check if metrics are generated
curl http://localhost:8889/metrics | grep traces_spanmetrics

# Check Prometheus target
curl "http://localhost:9090/api/v1/targets" | jq '.data.activeTargets[] | select(.labels.job == "aggregated-trace-metrics")'
```

### Monitor Tab Not Visible

```bash
# Check UI config
curl "http://localhost:16686/api/config" | jq '.monitor'

# Restart Jaeger
docker compose restart jaeger
```

## 📁 Configuration Files

| File                         | Purpose             | Location |
| ---------------------------- | ------------------- | -------- |
| `docker-compose.yml`         | Service definitions | Root     |
| `otel-collector-config.yaml` | Jaeger SPM config   | Root     |
| `prometheus.yml`             | Prometheus targets  | Root     |
| `ui-config.json`             | Jaeger UI config    | Root     |

## 🔍 Verification Checklist

- [ ] All containers running (`docker compose ps`)
- [ ] Jaeger UI accessible (http://localhost:16686)
- [ ] Monitor tab visible in Jaeger UI
- [ ] Traces appearing in Search tab
- [ ] SPM metrics in Prometheus (`traces_spanmetrics_*`)
- [ ] No errors in container logs
- [ ] Test traffic generates traces

## 📚 Documentation

- **Full Debugging Guide**: `docs/JAEGER_SPM_DEBUGGING.md`
- **Official Jaeger SPM Docs**: https://www.jaegertracing.io/docs/2.8/architecture/spm/
- **OpenTelemetry Docs**: https://opentelemetry.io/docs/

## 🎯 Success Indicators

When working correctly, you should see:

1. **Monitor Tab**: Visible in Jaeger UI with RED metrics
2. **Prometheus**: `traces_spanmetrics_calls_total` increasing
3. **Logs**: No errors, traces being processed
4. **Performance**: Reasonable latency and throughput

The Monitor tab should display your `nodejs-app` service with:

- Request rates (calls per second)
- Error rates (percentage of failed requests)
- Duration percentiles (P50, P75, P95)
- Operation-level breakdowns
