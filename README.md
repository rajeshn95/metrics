# Prometheus & Grafana Learning Project

A comprehensive Node.js application designed to help you learn **Prometheus metrics collection** and **Grafana visualization** for performance monitoring. Features an interactive web dashboard and complete monitoring stack.

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
│   ├── README.md                 # Detailed documentation
│   ├── PROMETHEUS_LEARNING_GUIDE.md
│   └── GRAFANA_LEARNING_GUIDE.md
└── .gitignore                    # Git ignore rules
```

## 🚀 Quick Start

### 1. Start Everything

```bash
cd docker
docker compose up --build
```

### 2. Access Services

- **Web Dashboard**: http://localhost:3010 (Interactive monitoring)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)

### 3. Generate Load

```bash
cd server
node load-test.js normal  # Try: baseline, normal, high, stress
```

## 🎯 What You'll Learn

- **Prometheus Metrics**: Counters, Gauges, Histograms, PromQL
- **Grafana Visualization**: Time series, dashboards, alerting
- **Real-world Monitoring**: Performance analysis, troubleshooting
- **Production Patterns**: Best practices and configurations

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

1. Start the stack and explore the web dashboard
2. Read `docs/PROMETHEUS_LEARNING_GUIDE.md`
3. Practice basic queries in Prometheus UI
4. Generate load and observe metrics

### Week 2: Visualization

1. Read `docs/GRAFANA_LEARNING_GUIDE.md`
2. Explore pre-built dashboards in Grafana
3. Create custom dashboards
4. Set up basic alerting

### Week 3+: Advanced Topics

1. Master PromQL advanced queries
2. Design production dashboards
3. Configure comprehensive alerting
4. Apply to real applications

## 🎨 Key Features

- ✅ **Interactive Web Dashboard** - Real-time monitoring interface
- ✅ **Complete Monitoring Stack** - Node.js + Prometheus + Grafana
- ✅ **Pre-built Dashboards** - Auto-provisioned with production patterns
- ✅ **Advanced Load Testing** - Multiple scenarios with realistic patterns
- ✅ **Comprehensive Documentation** - Step-by-step guides and best practices

## 🔍 Essential Queries

```promql
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# CPU usage
rate(process_cpu_seconds_total[5m]) * 100
```

## 🏃‍♂️ Development

```bash
# Local development
cd server
npm install
npm start

# Load testing scenarios
node load-test.js baseline    # Light load
node load-test.js normal      # Normal load
node load-test.js high        # High load
node load-test.js stress      # Stress test
```

## 🐛 Troubleshooting

- **Port conflicts**: Change ports in `docker/docker-compose.yml`
- **Prometheus not scraping**: Check `prometheus/prometheus.yml`
- **Grafana not loading**: Check provisioning configuration
- **Web dashboard issues**: Check browser console

## 📖 Detailed Documentation

For comprehensive guides and detailed information, see:

- `docs/README.md` - Complete project documentation
- `docs/PROMETHEUS_LEARNING_GUIDE.md` - Prometheus learning guide
- `docs/GRAFANA_LEARNING_GUIDE.md` - Grafana learning guide

## 🤝 Contributing

Feel free to:

- Add new endpoints for testing
- Create new dashboards
- Improve documentation
- Enhance the web dashboard
- Share your experiences

---

**Happy monitoring and visualizing! 🎉📊**

_Complete foundation for learning modern application monitoring with Prometheus and Grafana._
