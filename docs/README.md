# Complete Project Documentation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This document contains comprehensive information about the Prometheus & Grafana Learning Project, including detailed guides, advanced topics, and troubleshooting.

## 🏗️ Project Structure

```
metrics/
├── 📁 server/                    # Node.js application
│   ├── Dockerfile                # Node.js container configuration
│   ├── server.js                 # Main application with metrics
│   ├── metrics.js                # Prometheus metrics definitions
│   ├── opentelemetry.js          # OpenTelemetry configuration
│   ├── telemetry.js              # Custom telemetry utilities
│   ├── test-opentelemetry.js     # OpenTelemetry test script
│   ├── index.html                # Web dashboard interface
│   ├── dashboard.js              # Dashboard functionality
│   ├── package.json              # Dependencies
│   └── load-test.js              # Advanced load testing script
├── prometheus.yml                # Prometheus configuration
├── loki-config.yml               # Loki log aggregation config
├── promtail-config.yml           # Promtail log collection config
├── 📁 grafana/                   # Grafana configuration
│   ├── 📁 provisioning/          # Auto-configuration
│   │   ├── 📁 datasources/       # Data sources
│   │   │   ├── prometheus.yml    # Prometheus datasource
│   │   │   └── loki.yml          # Loki datasource
│   │   └── 📁 dashboards/        # Dashboard provisioning
│   │       └── dashboard.yml     # Dashboard provisioning config
│   └── 📁 dashboards/            # Pre-built dashboards
│       ├── nodejs-metrics-dashboard.json    # Main metrics dashboard
│       ├── logs-dashboard.json              # Log monitoring dashboard
│       ├── alerts-dashboard.json            # Alerts dashboard
│       ├── k6-load-test-dashboard.json      # K6 load test dashboard
│       └── opentelemetry-dashboard.json     # OpenTelemetry metrics dashboard
├── docker-compose.yml            # Multi-service setup
├── 📁 docs/                      # Learning documentation
│   ├── README.md                 # This file
│   ├── LEARNING_GUIDE_PROMETHEUS.md
│   ├── LEARNING_GUIDE_GRAFANA.md
│   ├── LEARNING_GUIDE_LOKI.md    # Loki log aggregation guide
│   ├── LEARNING_GUIDE_PROMTAIL.md # Promtail log collection guide
│   ├── LEARNING_GUIDE_K6.md      # K6 load testing guide
│   ├── LEARNING_GUIDE_OPENTELEMETRY.md # OpenTelemetry implementation guide
│   ├── DEBUGGING_PROMETHEUS.md   # Prometheus debugging guide
│   ├── DEBUGGING_GRAFANA.md      # Grafana debugging guide
│   ├── DEBUGGING_K6.md           # K6 debugging guide
│   └── DEBUGGING_JAEGER.md       # Jaeger debugging guide
├── 📁 k6/                        # K6 load testing
│   ├── load-test.js              # Main k6 test script
│   └── run-test.sh               # Interactive test runner
└── .gitignore                    # Git ignore rules
```

## 🎨 Web Dashboard

The project includes a beautiful **interactive web dashboard** at http://localhost:3010 that provides:

- **Real-time metrics visualization**
- **Live API endpoint testing**
- **Performance monitoring**
- **Load testing controls**
- **System health overview**

### Dashboard Features

- **Live Metrics Display**: Real-time updates of key performance indicators
- **API Testing Interface**: Test all endpoints directly from the browser
- **Performance Charts**: Visual representation of response times and throughput
- **System Health**: CPU, memory, and connection monitoring
- **Load Testing Controls**: Start and stop load tests with different scenarios

## 📊 What You'll Learn

### Prometheus Metrics

- **Counter**: Request counts, error totals, operation counters
- **Gauge**: Active connections, memory usage
- **Histogram**: Response time distributions with percentiles
- **PromQL**: Powerful query language for metrics analysis
- **Alerting**: Intelligent alert rules and thresholds

### Grafana Visualization

- **Time Series**: Request rates, response times, trends
- **Stat Panels**: Error rates, success rates, current values
- **Gauge Panels**: CPU, memory, connection monitoring
- **Pie Charts**: Request distribution by endpoint
- **Dashboards**: Interactive monitoring with drill-downs

### Loki Log Aggregation

- **LogQL**: Powerful query language for log analysis
- **Log Streams**: Real-time log collection and processing
- **Log Dashboards**: Visual log monitoring and analysis
- **Log Alerting**: Intelligent log-based alerting
- **Container Logs**: Docker container log collection

### Promtail Log Collection

- **Service Discovery**: Automatic container log discovery
- **Log Parsing**: Structured log parsing and extraction
- **Label Management**: Dynamic log labeling and filtering
- **Performance**: High-performance log collection
- **Reliability**: Robust log delivery and retry mechanisms

## 🛠️ API Endpoints

| Endpoint                | Performance | Purpose               | Features                  |
| ----------------------- | ----------- | --------------------- | ------------------------- |
| `/api/fast`             | Instant     | Baseline performance  | Counter tracking          |
| `/api/medium`           | 100-300ms   | Medium processing     | Simulated delay           |
| `/api/slow`             | 1-3 seconds | Slow processing       | Heavy workload simulation |
| `/api/unreliable`       | Variable    | Error monitoring      | 20% failure rate          |
| `/api/cpu-intensive`    | Variable    | CPU stress testing    | Mathematical calculations |
| `/api/memory-intensive` | Variable    | Memory stress testing | Large array operations    |

## 🔍 Essential Queries

### Request Monitoring

```promql
# Request rate by endpoint
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# Success rate percentage
(rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100

# Request distribution by endpoint
sum(rate(http_requests_total[5m])) by (path)
```

### Performance Metrics

```promql
# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Response time by endpoint
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (path)
```

### System Metrics

```promql
# CPU usage percentage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage in MB
process_resident_memory_bytes / 1024 / 1024

# Active connections
active_connections
```

### Log Analysis (LogQL)

```logql
# All logs from Node.js application
{container="nodejs-app"}

# Error logs only
{container="nodejs-app"} |= "error"

# Request logs with response time over 1 second
{container="nodejs-app"} |= "request" | json | response_time > 1000

# Log rate by log level
rate({container="nodejs-app"} | json | level=~"error|warn"[5m])

# Structured log parsing
{container="nodejs-app"} | json | method="GET" | status_code=500

# Log correlation with metrics
{container="nodejs-app"} |= "error" | json | timestamp > "2024-01-01T00:00:00Z"
```

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

### High Memory Usage

```promql
process_resident_memory_bytes / 1024 / 1024 > 500
```

### Log-based Alerts (LogQL)

```logql
# High error log rate
rate({container="nodejs-app"} |= "error"[5m]) > 10

# Critical errors
{container="nodejs-app"} |= "CRITICAL" | json | level="fatal"

# Authentication failures
{container="nodejs-app"} |= "auth" | json | success=false
```

## 🎨 Dashboard Types

### Time Series 📈

- **Best for**: Metrics over time, trends, patterns
- **Examples**: Request rates, response times, error rates
- **Use case**: Performance analysis and capacity planning

### Stat Panels 📊

- **Best for**: Single values with thresholds and trends
- **Examples**: Error rates, success rates, current values
- **Use case**: Quick status overview and alerting

### Gauge Panels 🎯

- **Best for**: Values with ranges and thresholds
- **Examples**: CPU usage, memory usage, active connections
- **Use case**: Resource monitoring and capacity alerts

### Pie Charts 🥧

- **Best for**: Distribution and composition analysis
- **Examples**: Request distribution by endpoint, error types
- **Use case**: Understanding traffic patterns and issues

### Log Panels 📝

- **Best for**: Log stream visualization and analysis
- **Examples**: Application logs, error logs, access logs
- **Use case**: Debugging, troubleshooting, and audit trails

## 🏃‍♂️ Development Workflow

### Local Development

```bash
# Install dependencies
cd server
npm install

# Start application with hot reload
npm start
# or
npm run dev

# Start complete monitoring stack
docker-compose up prometheus grafana loki promtail
```

### Load Testing

```bash
# Different scenarios with realistic patterns
node load-test.js baseline    # Light load (5 req/s, 3 concurrent)
node load-test.js normal      # Normal load (10 req/s, 5 concurrent)
node load-test.js high        # High load (20 req/s, 10 concurrent)
node load-test.js stress      # Stress test (50 req/s, 20 concurrent)
```

### Customization

```bash
# Add new metrics to metrics.js
# Modify dashboards in grafana/dashboards/
# Update configuration in prometheus.yml
# Configure log collection in promtail-config.yml
# Enhance web dashboard in index.html and dashboard.js
```

## 🐛 Troubleshooting

### Common Issues

- **Port conflicts**: Change ports in `docker-compose.yml`
- **Prometheus not scraping**: Check `prometheus.yml` configuration
- **Grafana not loading dashboards**: Check provisioning configuration
- **Loki not collecting logs**: Check `loki-config.yml` and `promtail-config.yml`
- **Metrics not appearing**: Ensure `/metrics` endpoint is accessible
- **Web dashboard issues**: Check browser console for JavaScript errors

### Debugging Steps

1. **Check targets**: http://localhost:9090/targets
2. **Verify metrics**: http://localhost:3010/metrics
3. **Test queries**: http://localhost:9090/graph
4. **Check Loki**: http://localhost:3100/ready
5. **Check logs**: `docker-compose logs`
6. **Web dashboard**: http://localhost:3010 (check browser console)

## 📚 Learning Guides

### Comprehensive Documentation

This project includes detailed learning guides for all components, with a focus on our specific implementation:

- **[Prometheus Learning Guide](LEARNING_GUIDE_PROMETHEUS.md)** - Complete guide to Prometheus metrics, queries, and alerting
- **[Grafana Learning Guide](LEARNING_GUIDE_GRAFANA.md)** - Dashboard creation, visualization, and best practices
- **[Loki Learning Guide](LEARNING_GUIDE_LOKI.md)** - Log aggregation, LogQL queries, and log management with this project's specific configuration and real-world examples
- **[Promtail Learning Guide](LEARNING_GUIDE_PROMTAIL.md)** - Log collection, service discovery, and log processing with this project's Docker setup and troubleshooting experience
- **[K6 Learning Guide](LEARNING_GUIDE_K6.md)** - Professional load testing with K6, performance analysis, and Prometheus integration
- **[OpenTelemetry Learning Guide](LEARNING_GUIDE_OPENTELEMETRY.md)** - Distributed tracing, custom metrics, auto-instrumentation, and observability implementation

### What's Special About This Project's Guides

This project's learning guides go beyond generic documentation by including:

- **Real Configuration Examples**: The actual `loki-config.yml` and `promtail-config.yml` files with detailed explanations
- **Project-Specific Setup**: How the Node.js application integrates with the logging stack
- **Troubleshooting Experience**: Real issues encountered and how they were solved
- **Practical Query Examples**: LogQL queries using the actual container names and log structure
- **Dashboard Integration**: How the Grafana dashboards work with this specific setup
- **Monitoring Commands**: Actual commands you can run to debug and monitor this deployment

### Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
- [Node.js Prometheus Client](https://github.com/siimon/prom-client)

### Community

- [Prometheus Community](https://prometheus.io/community/)
- [Grafana Community](https://community.grafana.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/prometheus)

### Best Practices

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)
- [Monitoring Best Practices](https://prometheus.io/docs/practices/naming/)

## 🎯 Next Steps

1. **Complete the learning path**: Follow the guides in `docs/`
2. **Practice with real data**: Use the load testing scripts
3. **Create custom dashboards**: Build your own visualizations
4. **Set up alerting**: Configure intelligent notifications
5. **Master log analysis**: Practice LogQL queries and log monitoring
6. **Apply to production**: Use these skills in real applications
7. **Share your learnings**: Contribute to the community

## 🤝 Contributing

This project is designed for learning and community growth. Feel free to:

- **Add new endpoints** to test different scenarios
- **Create new dashboards** for specific use cases
- **Improve documentation** with your learnings
- **Enhance the web dashboard** with new features
- **Share your experiences** with the community

---

**For quick start and essential information, see the main README.md file.**
