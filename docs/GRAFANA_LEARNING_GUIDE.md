# Grafana Learning Guide

A comprehensive guide to learning Grafana for visualizing Prometheus metrics from your Node.js application.

## 🎯 What You'll Learn

- **Dashboard Creation**: Build beautiful, interactive dashboards
- **Query Writing**: Master PromQL queries for Grafana
- **Visualization Types**: Choose the right charts for your data
- **Alerting**: Set up intelligent alerts and notifications
- **Best Practices**: Design effective monitoring dashboards

## 🚀 Quick Start with Grafana

### 1. Access Grafana

```bash
# Start all services
docker-compose up --build

# Access Grafana
open http://localhost:3000
```

**Login Credentials**: `admin` / `admin`

### 2. Explore Pre-built Dashboards

- **Node.js Prometheus Metrics Dashboard**: Main performance dashboard
- **Node.js Alerts & Thresholds**: Alerting and threshold monitoring

## 📊 Dashboard Components Explained

### Panel Types You'll Use

#### 1. **Time Series** 📈

- **Best for**: Metrics that change over time
- **Examples**: Request rates, response times, CPU usage
- **PromQL Example**: `rate(http_requests_total[5m])`

#### 2. **Stat Panels** 📊

- **Best for**: Single values with thresholds
- **Examples**: Current error rate, success rate, active connections
- **PromQL Example**: `active_connections`

#### 3. **Gauge Panels** 🎯

- **Best for**: Values with min/max ranges
- **Examples**: CPU usage, memory usage, connection count
- **PromQL Example**: `process_resident_memory_bytes / 1024 / 1024`

#### 4. **Pie Charts** 🥧

- **Best for**: Distribution of values
- **Examples**: Request distribution by endpoint, error types
- **PromQL Example**: `business_operations_total`

#### 5. **Tables** 📋

- **Best for**: Detailed data comparison
- **Examples**: Endpoint health status, metric breakdowns
- **PromQL Example**: `rate(http_requests_total[5m])`

## 🎨 Creating Your First Dashboard

### Step 1: Create New Dashboard

1. Click **"+"** → **"Dashboard"**
2. Click **"Add new panel"**

### Step 2: Write Your First Query

```promql
# Request rate over 5 minutes
rate(http_requests_total[5m])
```

### Step 3: Choose Visualization

- Select **"Time series"** for metrics over time
- Select **"Stat"** for single values
- Select **"Gauge"** for percentage/range values

### Step 4: Customize Panel

- **Title**: "Request Rate"
- **Legend**: `{{method}} {{route}}`
- **Thresholds**: Set color thresholds
- **Units**: Select appropriate units

### Step 5: Save Dashboard

- Click **"Save"** (💾)
- Give it a name: "My Custom Dashboard"
- Choose folder: "General"

## 🔍 Essential PromQL Queries for Grafana

### Request Monitoring

```promql
# Total requests per second
rate(http_requests_total[5m])

# Requests by endpoint
rate(http_requests_total[5m]) by (route)

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])
```

### Performance Metrics

```promql
# Average response time
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# 95th percentile response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# 99th percentile response time
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### Success Metrics

```promql
# Success rate percentage
(rate(http_requests_total{status_code=~"2.."}[5m]) / rate(http_requests_total[5m])) * 100

# Error rate percentage
(rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])) * 100
```

### System Metrics

```promql
# CPU usage
rate(process_cpu_seconds_total[5m]) * 100

# Memory usage (MB)
process_resident_memory_bytes / 1024 / 1024

# Active connections
active_connections
```

## 🎯 Hands-on Exercises

### Exercise 1: Basic Dashboard Creation

1. **Create a new dashboard**
2. **Add a time series panel** showing request rate
3. **Add a stat panel** showing current error rate
4. **Add a gauge** showing active connections
5. **Save and test** with load testing

### Exercise 2: Performance Analysis

1. **Create response time panels**:
   - Average response time
   - 95th percentile
   - 99th percentile
2. **Add thresholds** for slow responses
3. **Run load tests** and observe patterns

### Exercise 3: Error Monitoring

1. **Create error rate panels**:
   - Error rate over time
   - Error rate by endpoint
   - Success rate percentage
2. **Set up alerts** for high error rates
3. **Test with unreliable endpoint**

### Exercise 4: Business Metrics

1. **Create business operation panels**:
   - Operations by type (pie chart)
   - Operation rate over time
2. **Add custom metrics** to your application
3. **Visualize business KPIs**

## 🚨 Setting Up Alerts

### Step 1: Create Alert Rule

1. Go to **Alerting** → **Alert Rules**
2. Click **"New alert rule"**

### Step 2: Define Query

```promql
# High error rate alert
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1
```

### Step 3: Set Conditions

- **For**: 2m (alert after 2 minutes)
- **Condition**: Above 0.1 (10% error rate)

### Step 4: Configure Notifications

- **Contact point**: Email, Slack, etc.
- **Message**: Custom alert message

### Common Alert Conditions

```promql
# High error rate
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.1

# Slow response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3

# High CPU usage
rate(process_cpu_seconds_total[5m]) > 0.8

# High memory usage
process_resident_memory_bytes / 1024 / 1024 > 1000
```

## 🎨 Dashboard Design Best Practices

### 1. **Layout Principles**

- **Top to bottom**: Most important metrics first
- **Left to right**: Related metrics together
- **Consistent sizing**: Use standard panel sizes
- **Proper spacing**: Don't overcrowd dashboards

### 2. **Color Coding**

- **Green**: Good/healthy metrics
- **Yellow**: Warning thresholds
- **Red**: Critical/alerting thresholds
- **Blue**: Neutral information

### 3. **Panel Organization**

- **Overview panels**: High-level metrics at top
- **Detailed panels**: Specific metrics below
- **Alert panels**: Critical thresholds prominently displayed
- **Trend panels**: Historical data at bottom

### 4. **Refresh Intervals**

- **Real-time dashboards**: 5-10 seconds
- **Operational dashboards**: 30-60 seconds
- **Business dashboards**: 5-15 minutes

## 🔧 Advanced Features

### 1. **Dashboard Variables**

Create reusable variables for filtering:

```promql
# Variable: endpoint
/api/fast, /api/medium, /api/slow, /api/unreliable

# Use in query
rate(http_requests_total{route="$endpoint"}[5m])
```

### 2. **Annotations**

Mark important events on graphs:

- Load test start/end times
- Deployments
- Incidents
- Performance changes

### 3. **Templating**

Create reusable dashboard templates:

- Export dashboards as JSON
- Modify for different environments
- Share with team members

### 4. **Dashboard Links**

Connect related dashboards:

- Link from overview to detailed views
- Create drill-down navigation
- Cross-reference related metrics

## 📈 Testing Your Dashboards

### 1. **Generate Load**

```bash
# Run different load scenarios
node load-test.js baseline
node load-test.js normal
node load-test.js high
node load-test.js stress
```

### 2. **Observe Changes**

- Watch real-time updates
- Check threshold triggers
- Verify alert conditions
- Test different time ranges

### 3. **Validate Metrics**

- Compare with raw Prometheus data
- Check metric accuracy
- Verify query performance
- Test edge cases

## 🎓 Learning Path

### Beginner (Week 1)

- [ ] Explore pre-built dashboards
- [ ] Understand basic panel types
- [ ] Create simple time series charts
- [ ] Learn basic PromQL queries

### Intermediate (Week 2)

- [ ] Build custom dashboards
- [ ] Master different visualization types
- [ ] Set up basic alerts
- [ ] Use dashboard variables

### Advanced (Week 3)

- [ ] Create complex queries
- [ ] Design production dashboards
- [ ] Set up comprehensive alerting
- [ ] Optimize dashboard performance

### Expert (Week 4+)

- [ ] Create dashboard templates
- [ ] Implement advanced alerting
- [ ] Optimize query performance
- [ ] Share and collaborate

## 🐛 Common Issues & Solutions

### Dashboard Not Loading

- **Check datasource**: Ensure Prometheus is connected
- **Verify queries**: Test PromQL in Prometheus first
- **Check permissions**: Ensure proper access rights

### Queries Not Working

- **Validate PromQL**: Test in Prometheus UI
- **Check time range**: Ensure data exists for selected period
- **Verify labels**: Check metric labels and values

### Alerts Not Firing

- **Test conditions**: Verify alert query works
- **Check thresholds**: Ensure conditions are realistic
- **Verify notifications**: Test contact points

### Performance Issues

- **Optimize queries**: Use efficient PromQL
- **Reduce refresh rate**: Increase refresh intervals
- **Limit time range**: Use shorter time periods

## 📚 Additional Resources

- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
- [Grafana Community](https://community.grafana.com/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)

## 🎯 Next Steps

1. **Master the basics**: Complete all beginner exercises
2. **Build custom dashboards**: Create dashboards for specific use cases
3. **Set up alerting**: Configure comprehensive alerting rules
4. **Optimize performance**: Learn query optimization techniques
5. **Share knowledge**: Export and share dashboards with others

Happy visualizing! 🎉📊
