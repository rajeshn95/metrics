# Complete Project Documentation

This document contains comprehensive information about the Prometheus & Grafana Learning Project, including detailed guides, advanced topics, and troubleshooting.

## 🏗️ Project Structure

```
metrics/
├── 📁 server/                    # Node.js application
│   ├── server.js                 # Main application with metrics
│   ├── metrics.js                # Prometheus metrics definitions
│   ├── index.html                # Web dashboard interface
│   ├── dashboard.js              # Dashboard functionality
│   ├── package.json              # Dependencies
│   └── load-test.js              # Advanced load testing script
├── 📁 prometheus/                # Prometheus configuration
│   └── prometheus.yml            # Prometheus config
├── 📁 grafana/                   # Grafana configuration
│   ├── 📁 provisioning/          # Auto-configuration
│   │   ├── 📁 datasources/       # Prometheus datasource
│   │   └── 📁 dashboards/        # Dashboard provisioning
│   ├── 📁 dashboards/            # Pre-built dashboards
│   └── debugging-dashboard-provisioning.md
├── 📁 docker/                    # Docker configuration
│   ├── docker-compose.yml        # Multi-service setup
│   └── Dockerfile                # Node.js container
├── 📁 docs/                      # Learning documentation
│   ├── README.md                 # This file
│   ├── PROMETHEUS_LEARNING_GUIDE.md
│   └── GRAFANA_LEARNING_GUIDE.md
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

# Start Prometheus & Grafana separately
cd ../docker
docker-compose up prometheus grafana
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
# Update configuration in prometheus/prometheus.yml
# Enhance web dashboard in index.html and dashboard.js
```

## 🐛 Troubleshooting

### Common Issues

- **Port conflicts**: Change ports in `docker/docker-compose.yml`
- **Prometheus not scraping**: Check `prometheus/prometheus.yml` configuration
- **Grafana not loading dashboards**: Check provisioning configuration
- **Metrics not appearing**: Ensure `/metrics` endpoint is accessible
- **Web dashboard issues**: Check browser console for JavaScript errors

### Debugging Steps

1. **Check targets**: http://localhost:9090/targets
2. **Verify metrics**: http://localhost:3010/metrics
3. **Test queries**: http://localhost:9090/graph
4. **Check logs**: `docker-compose logs`
5. **Web dashboard**: http://localhost:3010 (check browser console)

## 📚 Additional Resources

### Documentation

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
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
5. **Apply to production**: Use these skills in real applications
6. **Share your learnings**: Contribute to the community

## 🤝 Contributing

This project is designed for learning and community growth. Feel free to:

- **Add new endpoints** to test different scenarios
- **Create new dashboards** for specific use cases
- **Improve documentation** with your learnings
- **Enhance the web dashboard** with new features
- **Share your experiences** with the community

---

**For quick start and essential information, see the main README.md file.**
