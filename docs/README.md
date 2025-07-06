# Prometheus Metrics Learning Project

A comprehensive Node.js application designed to help you learn Prometheus metrics and performance monitoring with beautiful Grafana visualizations. This project includes various API endpoints with different performance characteristics to demonstrate different types of metrics and monitoring scenarios.

## 🚀 Features

- **Multiple API Endpoints** with different performance characteristics
- **Prometheus Metrics Integration** with custom and default metrics
- **Grafana Dashboards** with pre-configured visualizations
- **Load Testing Script** to generate realistic traffic patterns
- **Docker Support** for easy deployment
- **Real-time Metrics** collection and monitoring
- **Alerting Dashboards** for threshold monitoring

## 📊 Available Metrics

### Default Metrics (automatically collected)

- CPU usage
- Memory usage
- Event loop lag
- Active handles
- Active requests

### Custom Metrics

- `http_request_duration_seconds` - Request duration histogram
- `http_requests_total` - Total request counter
- `active_connections` - Active connections gauge
- `operation_count_total` - Total operation counter

## 🛠️ API Endpoints

| Endpoint                | Performance | Description                            |
| ----------------------- | ----------- | -------------------------------------- |
| `/api/fast`             | Instant     | Fast response for baseline performance |
| `/api/medium`           | 100-300ms   | Medium processing time                 |
| `/api/slow`             | 1-3 seconds | Slow processing simulation             |
| `/api/unreliable`       | Variable    | 20% failure rate for error monitoring  |
| `/api/cpu-intensive`    | Variable    | CPU-intensive calculations             |
| `/api/memory-intensive` | Variable    | Memory-intensive operations            |

## 🏃‍♂️ Quick Start

### Option 1: Using Docker (Recommended)

1. **Start the application with Prometheus and Grafana:**

   ```bash
   docker-compose up --build
   ```

2. **Access the services:**

   - **Node.js App**: http://localhost:3010
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3000 (admin/admin)
   - **Raw Metrics**: http://localhost:3010/metrics

3. **Grafana Setup (First Time):**
   - Login with `admin` / `admin`
   - Prometheus datasource is automatically configured
   - Pre-built dashboards are automatically loaded

### Option 2: Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the application:**

   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Start Prometheus and Grafana separately:**

   ```bash
   # Using Docker
   docker run -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus
   docker run -p 3000:3000 -e GF_SECURITY_ADMIN_PASSWORD=admin grafana/grafana
   ```

## 📈 Load Testing

Use the included load testing script to generate traffic and observe metrics:

```bash
# Run different load scenarios
node load-test.js baseline    # Light load
node load-test.js normal      # Normal load
node load-test.js high        # High load
node load-test.js stress      # Stress test
```

## 📊 Grafana Dashboards

### 1. Main Metrics Dashboard

**Location**: Automatically loaded in Grafana
**Features**:

- Request rate monitoring
- Response time percentiles
- Error rate tracking
- Success rate visualization
- Request duration over time
- Total requests by endpoint
- Active connections gauge
- Business operations pie chart
- Node.js process metrics

### 2. Alerts & Thresholds Dashboard

**Location**: Automatically loaded in Grafana
**Features**:

- High error rate alerts
- Slow response time monitoring
- CPU usage thresholds
- Memory usage alerts
- Request rate spike detection
- Active connections monitoring
- Endpoint health status table

## 🎯 Learning Exercises

### 1. Basic Metrics Exploration

1. Start the application with `docker-compose up --build`
2. Visit http://localhost:3000 (Grafana)
3. Explore the pre-built dashboards
4. Try different time ranges and refresh intervals
5. Hover over panels to see detailed metrics

### 2. Performance Testing with Visualization

1. Open Grafana dashboard
2. Run load test: `node load-test.js normal`
3. Watch real-time metrics update in Grafana
4. Compare different endpoints' performance
5. Observe correlation between metrics

### 3. Alerting and Thresholds

1. Open the "Node.js Alerts & Thresholds" dashboard
2. Run stress test: `node load-test.js stress`
3. Watch panels change color based on thresholds
4. Identify which metrics trigger alerts
5. Understand alert conditions

### 4. Custom Dashboard Creation

1. In Grafana, click "+" → "Dashboard"
2. Add new panel → "Add Query"
3. Use PromQL queries like:
   - `rate(http_requests_total[5m])`
   - `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
4. Customize visualization types and thresholds
5. Save your custom dashboard

### 5. Advanced Grafana Features

1. **Variables**: Create dashboard variables for endpoint filtering
2. **Annotations**: Add load test markers to graphs
3. **Alerting**: Set up Grafana alerts based on thresholds
4. **Templating**: Create reusable dashboard templates
5. **Sharing**: Export dashboards as JSON

## 🔍 Key Prometheus Queries for Grafana

### Request Rate

```
rate(http_requests_total[5m])
```

### Error Rate

```
rate(http_requests_total{status_code=~"5.."}[5m])
```

### Response Time Percentiles

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Success Rate

```
rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])
```

### Active Connections

```
active_connections
```

### Business Operations by Type

```
operation_count_total
```

## 🎨 Grafana Visualization Types to Learn

### 1. Time Series

- **Best for**: Metrics over time
- **Use cases**: Request rates, response times, CPU usage
- **Example**: `rate(http_requests_total[5m])`

### 2. Stat Panels

- **Best for**: Single values with thresholds
- **Use cases**: Current error rate, success rate, active connections
- **Example**: `active_connections`

### 3. Gauge Panels

- **Best for**: Values with min/max ranges
- **Use cases**: CPU usage, memory usage, connection count
- **Example**: `process_resident_memory_bytes / 1024 / 1024`

### 4. Pie Charts

- **Best for**: Distribution of values
- **Use cases**: Request distribution by endpoint, error types
- **Example**: `operation_count_total`

### 5. Tables

- **Best for**: Detailed data comparison
- **Use cases**: Endpoint health status, metric breakdowns
- **Example**: `rate(http_requests_total[5m])`

## 📁 Project Structure

```
.
├── server.js              # Main Node.js application
├── package.json           # Dependencies and scripts
├── prometheus.yml         # Prometheus configuration
├── docker-compose.yml     # Docker services (Node.js + Prometheus + Grafana)
├── Dockerfile            # Node.js container
├── load-test.js          # Load testing script
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml          # Prometheus datasource config
│   │   └── dashboards/
│   │       └── dashboard.yml           # Dashboard provisioning config
│   └── dashboards/
│       ├── nodejs-metrics-dashboard.json    # Main metrics dashboard
│       └── alerts-dashboard.json            # Alerts dashboard
└── README.md             # This file
```

## 🎓 Learning Path

### Phase 1: Basic Understanding

1. **Start Simple**: Run the app and explore basic metrics
2. **Visual Exploration**: Use Grafana dashboards to understand data
3. **Load Generation**: Use the load test script to create traffic
4. **Pattern Recognition**: Look for correlations between different metrics

### Phase 2: Advanced Monitoring

1. **Custom Dashboards**: Create your own visualizations
2. **Alerting**: Set up threshold-based alerts
3. **Variables**: Use dashboard variables for filtering
4. **Annotations**: Mark important events on graphs

### Phase 3: Production Skills

1. **Dashboard Design**: Learn best practices for dashboard layout
2. **Query Optimization**: Write efficient PromQL queries
3. **Alert Management**: Set up proper alerting rules
4. **Dashboard Sharing**: Export and share dashboards

## 🔧 Customization

### Adding New Metrics

Edit `server.js` to add new Prometheus metrics:

```javascript
const customMetric = new promClient.Counter({
  name: "my_custom_metric",
  help: "Description of my metric",
  labelNames: ["label1", "label2"],
});
```

### Adding New Endpoints

Add new API endpoints to test different scenarios:

```javascript
app.get("/api/my-endpoint", (req, res) => {
  customMetric.labels("my_operation").inc();
  // Your endpoint logic here
  res.json({ message: "Success" });
});
```

### Creating Custom Grafana Dashboards

1. **Export existing dashboard**: Save as JSON
2. **Modify JSON**: Add new panels or modify queries
3. **Import back**: Load the modified dashboard
4. **Share**: Export and share with others

## 🚨 Alerting Setup

### Grafana Alerts

1. **Create Alert Rule**: In Grafana, go to Alerting → Alert Rules
2. **Set Conditions**: Define threshold conditions
3. **Configure Notifications**: Set up notification channels
4. **Test Alerts**: Trigger alerts with load tests

### Example Alert Conditions

- **High Error Rate**: `rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1`
- **Slow Response Time**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3`
- **High CPU Usage**: `rate(process_cpu_seconds_total[5m]) > 0.8`

## 🐛 Troubleshooting

- **Port conflicts**: Change ports in `docker-compose.yml` or `server.js`
- **Prometheus not scraping**: Check `prometheus.yml` configuration
- **Grafana not loading dashboards**: Check provisioning configuration
- **Metrics not appearing**: Ensure the `/metrics` endpoint is accessible
- **Load test errors**: Make sure the Node.js app is running first
- **Grafana login issues**: Default credentials are admin/admin

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Node.js Prometheus Client](https://github.com/siimon/prom-client)
- [Grafana Documentation](https://grafana.com/docs/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)

## 🎯 Next Steps

1. **Master the basics**: Understand all metrics and dashboards
2. **Create custom dashboards**: Build dashboards for specific use cases
3. **Set up alerting**: Configure proper alerting rules
4. **Scale up**: Apply these concepts to real applications
5. **Advanced topics**: Learn about service discovery, recording rules, and federation

Happy monitoring and visualizing! 🎉📊

## PROMETHEUS

- run the following command: `docker run -p 9090:9090 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus`

## GRAFANA

- Run the following command: `docker run -d -p 3001:3000 grafana/grafana`

Useful Links:

- [Mastering Latency Metrics: P90, P95, P99](https://medium.com/javarevisited/mastering-latency-metrics-p90-p95-p99-d5427faea879)
- [How to properly measure latency in seven minutes](https://www.ibm.com/think/topics/measure-latency?mhsrc=ibmsearch_a&mhq=how%20to%20properly%20measure%20latency)
-
