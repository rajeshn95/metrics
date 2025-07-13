# Prometheus, Grafana & OpenTelemetry Learning Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-orange.svg)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Visualization-red.svg)](https://grafana.com/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Observability-purple.svg)](https://opentelemetry.io/)

A comprehensive Node.js application designed to help you learn **Prometheus metrics collection**, **Grafana visualization**, **Loki log aggregation**, and **OpenTelemetry distributed tracing** for complete application monitoring. Features an interactive web dashboard and complete monitoring stack with modern observability practices.

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
│   ├── README.md                 # Detailed documentation
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

## 🚀 Quick Start

### 1. Start Everything

```bash
docker compose up --build
```

### 2. Access Services

- **Web Dashboard**: http://localhost:3010 (Interactive monitoring)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Loki**: http://localhost:3100
- **Jaeger UI**: http://localhost:16686 (Distributed tracing)

### 3. Generate Load

```bash
# Using built-in load tester
cd server
node load-test.js normal  # Try: baseline, normal, high, stress

# Using K6 (professional load testing)
cd k6
./run-test.sh  # Interactive menu with different test types

# Using docker
docker compose run --rm k6 run --duration 30s --vus 3 /scripts/load-test.js
```

## 🎯 What You'll Learn

- **Prometheus Metrics**: Counters, Gauges, Histograms, PromQL
- **Grafana Visualization**: Time series, dashboards, alerting
- **OpenTelemetry**: Distributed tracing, custom metrics, auto-instrumentation
- **K6 Load Testing**: Professional load testing, performance analysis
- **Loki Log Aggregation**: LogQL queries, log monitoring, log analysis
- **Promtail Log Collection**: Container log collection, service discovery
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

## 🎨 Key Features

- ✅ **Interactive Web Dashboard** - Real-time monitoring interface
- ✅ **Complete Monitoring Stack** - Node.js + Prometheus + Grafana + Loki + Promtail + Jaeger
- ✅ **OpenTelemetry Integration** - Distributed tracing, custom metrics, auto-instrumentation
- ✅ **Pre-built Dashboards** - Auto-provisioned with production patterns
- ✅ **Advanced Load Testing** - Multiple scenarios with realistic patterns
- ✅ **K6 Load Testing** - Professional load testing with Prometheus integration
- ✅ **Log Aggregation** - Centralized log collection and analysis
- ✅ **Comprehensive Documentation** - Step-by-step guides and best practices

## 🏃‍♂️ Development

```bash
# Local development
cd server
npm install
npm start

# Test OpenTelemetry implementation
node test-opentelemetry.js

# Load testing scenarios
node load-test.js baseline    # Light load
node load-test.js normal      # Normal load
node load-test.js high        # High load
node load-test.js stress      # Stress test
```

## 🐛 Troubleshooting

- **Port conflicts**: Change ports in `docker-compose.yml`
- **Prometheus not scraping**: Check `prometheus.yml`
- **Grafana not loading**: Check provisioning configuration
- **Loki not collecting logs**: Check `loki-config.yml` and `promtail-config.yml`
- **Web dashboard issues**: Check browser console

## 📖 Detailed Documentation

For comprehensive guides and detailed information, see:

- `docs/README.md` - Complete project documentation
- `docs/LEARNING_GUIDE_PROMETHEUS.md` - Prometheus learning guide
- `docs/LEARNING_GUIDE_GRAFANA.md` - Grafana learning guide
- `docs/LEARNING_GUIDE_LOKI.md` - Loki log aggregation guide
- `docs/LEARNING_GUIDE_PROMTAIL.md` - Promtail log collection guide
- `docs/LEARNING_GUIDE_K6.md` - K6 load testing guide
- `docs/LEARNING_GUIDE_OPENTELEMETRY.md` - OpenTelemetry implementation guide

## 🤝 Contributing

Feel free to:

- Add new endpoints for testing
- Create new dashboards
- Improve documentation
- Enhance the web dashboard
- Share your experiences

---

**Happy monitoring and visualizing! 🎉📊**

_Complete foundation for learning modern application monitoring with Prometheus, Grafana, and Loki._
