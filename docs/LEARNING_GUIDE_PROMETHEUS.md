# Prometheus Learning Guide

A comprehensive guide to learning Prometheus for monitoring your Node.js application.

## 🎯 What You'll Learn

- **Metrics Collection**: Understanding different metric types
- **PromQL Queries**: Writing powerful queries for analysis
- **Alerting**: Setting up intelligent alerting rules
- **Service Discovery**: Automatically discovering targets
- **Best Practices**: Production-ready monitoring patterns

## 🚀 Quick Start

### 1. Start the Monitoring Stack

```bash
cd docker
docker-compose up --build
```

### 2. Access Prometheus

- **URL**: http://localhost:9090
- **Targets**: http://localhost:9090/targets
- **Graph**: http://localhost:9090/graph

## 📊 Metric Types

### Counter 🔢

- Monotonically increasing values
- Examples: Total requests, errors
- Query: `rate(http_requests_total[5m])`

### Gauge 📊

- Values that can go up and down
- Examples: Memory usage, connections
- Query: `active_connections`

### Histogram 📈

- Distributions with buckets
- Examples: Request duration
- Query: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`

## 🔍 Essential PromQL Queries

### Request Monitoring

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# Success rate
(rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100
```

### Performance Metrics

```promql
# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
```

### System Metrics

```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage (MB)
process_resident_memory_bytes / 1024 / 1024
```

## 🎯 Hands-on Exercises

### Exercise 1: Basic Queries

1. Open http://localhost:9090/graph
2. Try: `http_requests_total`
3. Try: `rate(http_requests_total[5m])`
4. Filter: `rate(http_requests_total{route="/api/fast"}[5m])`

### Exercise 2: Performance Analysis

1. Run: `node load-test.js normal`
2. Monitor: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
3. Compare endpoints by adding `by (route)`

### Exercise 3: Error Monitoring

1. Monitor: `rate(http_requests_total{status_code=~"5.."}[5m])`
2. Test: Call `/api/unreliable` repeatedly
3. Calculate: Success rate percentage

## 🚨 Alerting Examples

### High Error Rate

```promql
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1
```

### Slow Response Time

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
```

### High CPU Usage

```promql
rate(process_cpu_seconds_total[5m]) > 0.8
```

## 🎨 Best Practices

1. **Metric Naming**: Use descriptive names with units
2. **Labeling**: Don't over-label (cardinality explosion)
3. **Query Optimization**: Use appropriate time ranges
4. **Alerting**: Set realistic thresholds with `for` clause
5. **Recording Rules**: Pre-aggregate complex queries

## 📚 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)

Happy monitoring! 🎉
