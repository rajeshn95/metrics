# Prometheus & Grafana Learning Project

A comprehensive Node.js application designed to help you learn **Prometheus metrics collection** and **Grafana visualization** for performance monitoring. This project provides a complete monitoring stack with hands-on learning materials.

## 🏗️ Project Structure

```
metrics/
├── 📁 server/                    # Node.js application
│   ├── server.js                 # Main application with metrics
│   ├── package.json              # Dependencies
│   └── load-test.js              # Load testing script
├── 📁 prometheus/                # Prometheus configuration
│   └── prometheus.yml            # Prometheus config
├── 📁 grafana/                   # Grafana configuration
│   ├── 📁 provisioning/          # Auto-configuration
│   │   ├── 📁 datasources/       # Prometheus datasource
│   │   └── 📁 dashboards/        # Dashboard provisioning
│   └── 📁 dashboards/            # Pre-built dashboards
├── 📁 docker/                    # Docker configuration
│   ├── docker-compose.yml        # Multi-service setup
│   └── Dockerfile                # Node.js container
├── 📁 docs/                      # Learning documentation
│   ├── README.md                 # This file
│   ├── PROMETHEUS_LEARNING_GUIDE.md
│   └── GRAFANA_LEARNING_GUIDE.md
└── .gitignore                    # Git ignore rules
```

## 🚀 Quick Start

### 1. Start Everything

```bash
# Start all services (Node.js + Prometheus + Grafana)
cd docker
docker-compose up --build
```

### 2. Access Services

- **Node.js App**: http://localhost:3010
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### 3. Generate Load

```bash
# From project root
cd server
node load-test.js normal
```

## 📊 What You'll Learn

### Prometheus Metrics

- **Counter**: Request counts, error totals
- **Gauge**: Active connections, memory usage
- **Histogram**: Response time distributions
- **PromQL**: Powerful query language
- **Alerting**: Intelligent alert rules

### Grafana Visualization

- **Time Series**: Request rates, response times
- **Stat Panels**: Error rates, success rates
- **Gauge Panels**: CPU, memory, connections
- **Pie Charts**: Business operations
- **Dashboards**: Interactive monitoring

## 🛠️ API Endpoints

| Endpoint                | Performance | Purpose                        |
| ----------------------- | ----------- | ------------------------------ |
| `/api/fast`             | Instant     | Baseline performance           |
| `/api/medium`           | 100-300ms   | Medium processing              |
| `/api/slow`             | 1-3 seconds | Slow processing                |
| `/api/unreliable`       | Variable    | Error monitoring (20% failure) |
| `/api/cpu-intensive`    | Variable    | CPU stress testing             |
| `/api/memory-intensive` | Variable    | Memory stress testing          |

## 📚 Learning Path

### Week 1: Fundamentals

1. **Start the stack** and explore services
2. **Read Prometheus Guide**: `docs/PROMETHEUS_LEARNING_GUIDE.md`
3. **Practice basic queries** in Prometheus UI
4. **Generate load** and observe metrics

### Week 2: Visualization

1. **Read Grafana Guide**: `docs/GRAFANA_LEARNING_GUIDE.md`
2. **Explore pre-built dashboards**
3. **Create custom dashboards**
4. **Set up basic alerting**

### Week 3: Advanced Topics

1. **Master PromQL** advanced queries
2. **Design production dashboards**
3. **Configure comprehensive alerting**
4. **Optimize performance**

### Week 4+: Production Skills

1. **Apply to real applications**
2. **Set up service discovery**
3. **Implement high availability**
4. **Share knowledge with team**

## 🎯 Key Features

### ✅ Complete Monitoring Stack

- **Node.js Application** with comprehensive metrics
- **Prometheus** for metrics collection and storage
- **Grafana** for beautiful visualizations
- **Docker** for easy deployment

### ✅ Pre-built Dashboards

- **Main Metrics Dashboard**: Performance overview
- **Alerts Dashboard**: Threshold monitoring
- **Auto-provisioning**: No manual setup required

### ✅ Load Testing

- **Multiple scenarios**: baseline, normal, high, stress
- **Realistic patterns**: Weighted endpoint selection
- **Performance reporting**: Success rates, response times

### ✅ Learning Materials

- **Step-by-step guides**: Prometheus and Grafana
- **Hands-on exercises**: Practical examples
- **Best practices**: Production-ready patterns
- **Troubleshooting**: Common issues and solutions

## 🔍 Essential Queries

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

## 🎨 Dashboard Types

### Time Series 📈

- **Best for**: Metrics over time
- **Examples**: Request rates, response times
- **Use case**: Trend analysis

### Stat Panels 📊

- **Best for**: Single values with thresholds
- **Examples**: Error rates, success rates
- **Use case**: Current status

### Gauge Panels 🎯

- **Best for**: Values with ranges
- **Examples**: CPU usage, memory usage
- **Use case**: Resource monitoring

### Pie Charts 🥧

- **Best for**: Distribution of values
- **Examples**: Request distribution by endpoint
- **Use case**: Composition analysis

## 🏃‍♂️ Development Workflow

### Local Development

```bash
# Install dependencies
cd server
npm install

# Start application
npm start
# or
npm run dev

# Start Prometheus & Grafana separately
cd ../docker
docker-compose up prometheus grafana
```

### Load Testing

```bash
# Different scenarios
node load-test.js baseline    # Light load
node load-test.js normal      # Normal load
node load-test.js high        # High load
node load-test.js stress      # Stress test
```

### Customization

```bash
# Add new metrics to server.js
# Modify dashboards in grafana/dashboards/
# Update configuration in prometheus/prometheus.yml
```

## 🐛 Troubleshooting

### Common Issues

- **Port conflicts**: Change ports in `docker/docker-compose.yml`
- **Prometheus not scraping**: Check `prometheus/prometheus.yml`
- **Grafana not loading**: Check provisioning configuration
- **Metrics not appearing**: Ensure `/metrics` endpoint is accessible

### Debugging Steps

1. **Check targets**: http://localhost:9090/targets
2. **Verify metrics**: http://localhost:3010/metrics
3. **Test queries**: http://localhost:9090/graph
4. **Check logs**: `docker-compose logs`

## 📚 Additional Resources

### Documentation

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)

### Community

- [Prometheus Community](https://prometheus.io/community/)
- [Grafana Community](https://community.grafana.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/prometheus)

### Best Practices

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Best Practices](https://grafana.com/docs/grafana/latest/best-practices/)

## 🎯 Next Steps

1. **Complete the learning path**: Follow the guides in `docs/`
2. **Practice with real data**: Use the load testing scripts
3. **Create custom dashboards**: Build your own visualizations
4. **Set up alerting**: Configure intelligent notifications
5. **Apply to production**: Use these skills in real applications

## 🤝 Contributing

This project is designed for learning. Feel free to:

- **Add new endpoints** to test different scenarios
- **Create new dashboards** for specific use cases
- **Improve documentation** with your learnings
- **Share your experiences** with the community

---

**Happy monitoring and visualizing! 🎉📊**

_This project provides a complete foundation for learning modern application monitoring with Prometheus and Grafana._
