# Prometheus, Grafana & OpenTelemetry Learning Project

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Required-blue.svg)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-orange.svg)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-Visualization-red.svg)](https://grafana.com/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-Observability-purple.svg)](https://opentelemetry.io/)

> 🚀 **Master modern application monitoring and observability with hands-on practice!**

A comprehensive Node.js application designed to help you learn **Prometheus metrics collection**, **Grafana visualization**, **Loki log aggregation**, and **OpenTelemetry distributed tracing** for complete application monitoring. Features an interactive web dashboard and complete monitoring stack with modern observability practices.

### 🌟 **Why This Project?**

- ✅ **Learn by Doing** - Real application with realistic monitoring scenarios
- ✅ **Complete Stack** - Prometheus + Grafana + Loki + OpenTelemetry + Jaeger
- ✅ **Interactive Dashboard** - Beautiful web interface for real-time monitoring
- ✅ **Production Ready** - Industry-standard configurations and best practices
- ✅ **Comprehensive Docs** - 6 learning guides + 4 debugging guides
- ✅ **Load Testing** - K6 integration for performance analysis
- ✅ **Open Source** - MIT licensed, community-driven learning

### 🎯 **Perfect For**

- **Developers** learning monitoring and observability
- **DevOps Engineers** practicing monitoring stack setup
- **Students** studying application performance
- **Teams** implementing monitoring in their projects
- **Anyone** wanting hands-on experience with modern observability tools

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

## 🎬 **Quick Demo**

<div align="center">
  <img src="https://img.shields.io/badge/Web%20Dashboard-Interactive%20Monitoring-blue?style=for-the-badge" alt="Interactive Dashboard">
  <img src="https://img.shields.io/badge/Real--time%20Metrics-Live%20Updates-green?style=for-the-badge" alt="Real-time Metrics">
  <img src="https://img.shields.io/badge/Load%20Testing-K6%20Integration-orange?style=for-the-badge" alt="Load Testing">
</div>

### 🚀 **Start in 30 Seconds**

```bash
# Clone and start everything
git clone https://github.com/rajeshn95/metrics.git
cd metrics
docker compose up --build

# Access your monitoring stack
# 🌐 Web Dashboard: http://localhost:3010
# 📊 Grafana: http://localhost:3000 (admin/admin)
# 📈 Prometheus: http://localhost:9090
# 📝 Loki: http://localhost:3100
# 🔍 Jaeger: http://localhost:16686
```

## 🎯 **What You'll Learn**

<div align="center">
  <img src="https://img.shields.io/badge/Prometheus-Metrics%20Collection-orange?style=for-the-badge" alt="Prometheus">
  <img src="https://img.shields.io/badge/Grafana-Visualization%20%26%20Alerting-red?style=for-the-badge" alt="Grafana">
  <img src="https://img.shields.io/badge/OpenTelemetry-Distributed%20Tracing-purple?style=for-the-badge" alt="OpenTelemetry">
</div>

### 📚 **Comprehensive Learning Topics**

- 📊 **Prometheus Metrics** - Counters, Gauges, Histograms, PromQL queries
- 📈 **Grafana Dashboards** - Time series, alerts, visualizations, best practices
- 📝 **Log Aggregation** - Loki, LogQL, structured logging, log analysis
- 🔍 **Distributed Tracing** - OpenTelemetry, Jaeger, spans, correlation
- ⚡ **Load Testing** - K6 integration, performance analysis, stress testing
- 🏭 **Production Patterns** - Industry-standard configurations and practices

### 🛠️ **Hands-on Practice Areas**

- **Real Application Monitoring** - Monitor a live Node.js application
- **Interactive Dashboard** - Beautiful web interface for real-time metrics
- **Load Testing Scenarios** - Multiple realistic performance tests
- **Log Analysis** - Centralized log collection and querying
- **Distributed Tracing** - End-to-end request tracking
- **Alerting & Notifications** - Production-ready alert configurations

## 🛠️ API Endpoints

| Endpoint                | Performance | Purpose                        |
| ----------------------- | ----------- | ------------------------------ |
| `/api/fast`             | Instant     | Baseline performance           |
| `/api/medium`           | 100-300ms   | Medium processing              |
| `/api/slow`             | 1-3 seconds | Slow processing                |
| `/api/unreliable`       | Variable    | Error monitoring (20% failure) |
| `/api/cpu-intensive`    | Variable    | CPU stress testing             |
| `/api/memory-intensive` | Variable    | Memory stress testing          |

## 🎨 **Key Features**

- ✅ **Interactive Web Dashboard** - Real-time monitoring interface
- ✅ **Complete Monitoring Stack** - Node.js + Prometheus + Grafana + Loki + Promtail + Jaeger
- ✅ **OpenTelemetry Integration** - Distributed tracing, custom metrics, auto-instrumentation
- ✅ **Pre-built Dashboards** - Auto-provisioned with production patterns
- ✅ **Advanced Load Testing** - Multiple scenarios with realistic patterns
- ✅ **K6 Load Testing** - Professional load testing with Prometheus integration
- ✅ **Log Aggregation** - Centralized log collection and analysis
- ✅ **Comprehensive Documentation** - Step-by-step guides and best practices

## 🧪 **Testing & Development**

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

# K6 load testing
cd k6
./run-test.sh                 # Interactive menu

# Docker load testing
docker compose run --rm k6 run --duration 30s --vus 3 /scripts/load-test.js
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

## 🌟 **Community & Support**

<div align="center">
  <a href="https://github.com/rajeshn95/metrics/stargazers">
    <img src="https://img.shields.io/github/stars/rajeshn95/metrics?style=social" alt="Stars">
  </a>
  <a href="https://github.com/rajeshn95/metrics/network">
    <img src="https://img.shields.io/github/forks/rajeshn95/metrics?style=social" alt="Forks">
  </a>
  <a href="https://github.com/rajeshn95/metrics/issues">
    <img src="https://img.shields.io/github/issues/rajeshn95/metrics" alt="Issues">
  </a>
  <a href="https://github.com/rajeshn95/metrics/pulls">
    <img src="https://img.shields.io/github/issues-pr/rajeshn95/metrics" alt="Pull Requests">
  </a>
</div>

### 🤝 **Contributing**

We welcome contributions! This project is designed to help the community learn monitoring and observability.

**Quick Start:**

1. ⭐ **Star this repo** (it motivates us!)
2. 🍴 **Fork the project**
3. 🔧 **Create a feature branch**
4. 📝 **Make your changes**
5. 🧪 **Test thoroughly**
6. 📤 **Submit a pull request**

**What we're looking for:**

- 📚 **Documentation improvements** - Better explanations, examples
- 🎨 **New dashboards** - Creative visualizations
- 🧪 **Load testing scenarios** - Realistic performance tests
- 🐛 **Bug fixes** - Issues with the monitoring stack
- 💡 **Feature ideas** - New learning scenarios

### 📞 **Getting Help**

- 📖 **Documentation**: Check the [docs](docs/) folder first
- 🐛 **Issues**: [Report bugs](https://github.com/rajeshn95/metrics/issues)
- 💬 **Discussions**: [Start a discussion](https://github.com/rajeshn95/metrics/discussions)
- 📧 **Contact**: Open an issue for questions

### 🙏 **Show Your Support**

If this project helped you learn monitoring and observability, please:

- ⭐ **Star this repository**
- 🔄 **Share with your network**
- 📝 **Leave feedback**
- 🤝 **Contribute back**

**Every star motivates us to create better learning content!** 🌟

## 👥 **Contributors**

<div align="center">
  <a href="https://github.com/rajeshn95/metrics/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=rajeshn95/metrics" alt="Contributors" />
  </a>
</div>

### 🌟 **Special Thanks**

We'd like to thank all contributors who help make this learning project better:

- **Documentation Contributors** - Improving guides and explanations
- **Code Contributors** - Adding features and fixing bugs
- **Community Members** - Providing feedback and suggestions
- **Learning Advocates** - Sharing knowledge and best practices

_Want to see your name here? Check out our [Contributing Guidelines](CONTRIBUTING.md)!_

---

## 🔗 **Quick Links**

<div align="center">
  <a href="docs/README.md">📖 Complete Documentation</a> •
  <a href="docs/LEARNING_GUIDE_PROMETHEUS.md">📊 Prometheus Guide</a> •
  <a href="docs/LEARNING_GUIDE_GRAFANA.md">📈 Grafana Guide</a> •
  <a href="docs/LEARNING_GUIDE_OPENTELEMETRY.md">🔍 OpenTelemetry Guide</a> •
  <a href="CONTRIBUTING.md">🤝 Contributing</a>
</div>

---

<div align="center">
  <strong>Happy monitoring and visualizing! 🎉📊</strong>
  
  <em>Complete foundation for learning modern application monitoring with Prometheus, Grafana, and Loki.</em>
  
  <br><br>
  
  <a href="https://github.com/rajeshn95/metrics">
    <img src="https://img.shields.io/badge/GitHub-View%20on%20GitHub-black?style=for-the-badge&logo=github" alt="View on GitHub">
  </a>
</div>
