# Loki Learning Guide

## Table of Contents

1. [What is Loki?](#what-is-loki)
2. [Why Use Loki?](#why-use-loki)
3. [Loki Architecture](#loki-architecture)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [Log Ingestion](#log-ingestion)
7. [Querying Logs](#querying-logs)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Features](#advanced-features)

## What is Loki?

**Loki** is a horizontally-scalable, highly-available, multi-tenant log aggregation system inspired by Prometheus. It's designed to be very cost-effective and easy to operate, as it doesn't index the contents of the logs, but rather a set of labels for each log stream.

### Key Characteristics:

- **Log aggregation**: Collects logs from multiple sources
- **Label-based indexing**: Uses labels (like Prometheus) instead of full-text indexing
- **Cost-effective**: Stores logs in object storage (S3, GCS, etc.)
- **Multi-tenant**: Supports multiple organizations/teams
- **Horizontally scalable**: Can handle massive log volumes

## Why Use Loki?

### Advantages:

1. **Cost Efficiency**: Much cheaper than traditional log aggregation systems
2. **Simple Architecture**: Fewer moving parts than ELK stack
3. **Prometheus-like**: Familiar query language and concepts
4. **Cloud-Native**: Designed for containerized environments
5. **High Performance**: Fast queries with minimal resource usage

### Use Cases:

- Container log aggregation
- Application monitoring
- Security event logging
- Infrastructure monitoring
- Debugging and troubleshooting

## Loki Architecture

### Core Components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Promtail      │    │   Fluentd       │    │   Other Agents  │
│   (Log Agent)   │    │   (Log Agent)   │    │   (Log Agent)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │         Loki              │
                    │   (Log Aggregator)        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     Object Storage        │
                    │   (S3, GCS, etc.)         │
                    └───────────────────────────┘
```

### Components Explained:

1. **Log Agents** (Promtail, Fluentd, etc.)

   - Collect logs from various sources
   - Add labels to log streams
   - Send logs to Loki

2. **Loki**

   - Receives logs from agents
   - Stores logs in object storage
   - Handles queries from Grafana

3. **Object Storage**
   - Stores actual log data
   - Provides durability and scalability

## Installation & Setup

### This Project's Configuration

This project demonstrates a production-ready Loki configuration that balances performance, storage efficiency, and ease of use. Let's examine this specific setup:

#### Docker Compose Configuration

```yaml
# From our docker-compose.yml
loki:
  image: grafana/loki:2.9.0
  container_name: loki
  ports:
    - "3100:3100"
  command: -config.file=/etc/loki/config.yml
  volumes:
    - ./loki-config.yml:/etc/loki/config.yml
    - loki_data:/loki
  networks:
    - loki-network
  restart: unless-stopped
```

#### This Loki Configuration Explained

```yaml
# loki-config.yml - This project's specific configuration
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://localhost:9093

compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 5m
  retention_enabled: true
  retention_delete_delay: 1h
  retention_delete_worker_count: 150

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
  ingestion_rate_mb: 64
  ingestion_burst_size_mb: 128

analytics:
  reporting_enabled: false
```

### Configuration Breakdown

#### 1. **Authentication & Security**

```yaml
auth_enabled: false
```

- **Why**: We're running in a development environment with internal network access
- **Production**: Should be `true` with proper authentication

#### 2. **Server Configuration**

```yaml
server:
  http_listen_port: 3100
```

- **Port**: Standard Loki port for HTTP API
- **Access**: Available at `http://localhost:3100`

#### 3. **Storage Configuration**

```yaml
common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
```

- **Storage Type**: Filesystem (good for development, S3/GCS for production)
- **Chunks**: Raw log data storage
- **Rules**: Alerting and recording rules storage

#### 4. **Schema Configuration**

```yaml
schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
```

- **Store**: `boltdb-shipper` for efficient index management
- **Object Store**: Filesystem (local storage)
- **Index Period**: 24-hour chunks for optimal query performance

#### 5. **Compaction & Retention**

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 5m
  retention_enabled: true
  retention_delete_delay: 1h
  retention_delete_worker_count: 150
```

- **Compaction**: Merges small chunks every 5 minutes
- **Retention**: Automatically deletes old logs
- **Workers**: 150 parallel workers for deletion

#### 6. **Rate Limiting**

```yaml
limits_config:
  ingestion_rate_mb: 64
  ingestion_burst_size_mb: 128
```

- **Rate Limit**: 64 MB/s sustained ingestion
- **Burst**: 128 MB/s burst capacity
- **Protection**: Prevents overwhelming the system

## Configuration

### Key Configuration Sections:

#### 1. Server Configuration

```yaml
server:
  http_listen_port: 3100
  http_listen_address: 0.0.0.0
```

#### 2. Ingester Configuration

```yaml
ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
  chunk_idle_period: 5m
  chunk_retain_period: 30s
```

#### 3. Storage Configuration

```yaml
storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    cache_ttl: 24h
    shared_store: filesystem
```

#### 4. Schema Configuration

```yaml
schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h
```

## Log Ingestion

### This Project's Node.js Application Logging Setup

This project includes a comprehensive logging setup that demonstrates best practices for structured logging with Loki:

#### 1. **Node.js Application Logging**

The `server.js` file uses Pino for structured logging:

```javascript
// From our server.js
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: SERVICE_NAME,
    env: process.env.NODE_ENV || "development",
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});
```

#### 2. **Structured Log Format**

The application generates structured logs like this:

```json
{
  "level": 30,
  "time": 1640995200000,
  "pid": 1,
  "hostname": "nodejs-app",
  "service": "nodejs-app",
  "env": "production",
  "timestamp": "2023-01-01T12:00:00.000Z",
  "message": "Request completed",
  "request_id": "abc123",
  "method": "GET",
  "path": "/api/fast",
  "status_code": 200,
  "duration_ms": 5,
  "event_type": "request_end"
}
```

#### 3. **Log Collection Flow**

```
Node.js App (Pino) → Docker Logs → Promtail → Loki → Grafana
```

1. **Application**: Generates structured JSON logs
2. **Docker**: Captures stdout/stderr as JSON log files
3. **Promtail**: Discovers and reads Docker log files
4. **Loki**: Stores and indexes logs with labels
5. **Grafana**: Queries and visualizes logs

#### 4. **Using Promtail (Our Setup)**

Promtail is the preferred log collection agent for Loki. It's designed to work seamlessly with Loki and provides excellent performance.

#### Basic Promtail Configuration:

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ["__meta_docker_container_name"]
        regex: "/(.*)"
        target_label: "container"
      - source_labels: ["__meta_docker_container_log_stream"]
        target_label: "logstream"
```

### Log Labels

Labels are crucial in Loki. They determine how logs are organized and queried:

```yaml
# Example labels
labels:
  job: "nodejs-app"
  environment: "production"
  service: "api"
  level: "info"
```

## Querying Logs

### LogQL Query Language

Loki uses LogQL, a query language similar to PromQL but for logs.

#### Basic Queries:

```logql
# All logs
{job="nodejs-app"}

# Logs with specific label
{container="nodejs-app"}

# Multiple label matchers
{job="nodejs-app", level="error"}

# Log line filtering
{job="nodejs-app"} |= "error"

# Log line filtering with regex
{job="nodejs-app"} |~ "error|exception"

# Excluding patterns
{job="nodejs-app"} != "debug"
```

#### Advanced Queries:

```logql
# Rate queries (logs per second)
rate({job="nodejs-app"}[5m])

# Count over time
count_over_time({job="nodejs-app"}[5m])

# Sum by label
sum by (level) (count_over_time({job="nodejs-app"}[5m]))

# Log line parsing
{job="nodejs-app"} | json | level="error"

# Extracting fields
{job="nodejs-app"} | json | unwrap duration | duration > 1000
```

### Query Examples (This Project):

#### 1. **Error Rate Monitoring**

```logql
# Monitor error logs from our Node.js app
rate({container="nodejs-app"} |= "error" [5m])

# Error rate by endpoint
sum by (endpoint) (rate({container="nodejs-app"} |= "error" [5m]))
```

#### 2. **Request Volume by Endpoint**

```logql
# Count requests by endpoint
sum by (endpoint) (count_over_time({container="nodejs-app"} |= "Incoming request" [5m]))

# Request rate by method
sum by (method) (rate({container="nodejs-app"} |= "Incoming request" [5m]))
```

#### 3. **Response Time Analysis**

```logql
# Slow requests (>1 second)
{container="nodejs-app"} | json | unwrap duration_ms | duration_ms > 1000

# Average response time by endpoint
avg by (endpoint) (unwrap duration_ms ({container="nodejs-app"} | json))
```

#### 4. **Memory Usage Monitoring**

```logql
# High memory usage operations
{container="nodejs-app"} | json | unwrap estimated_memory_mb | estimated_memory_mb > 50

# Memory usage by operation type
sum by (event_type) (count_over_time({container="nodejs-app"} |= "memory_intensive" [5m]))
```

#### 5. **Request Tracing**

```logql
# Follow a specific request through the system
{container="nodejs-app"} | json | request_id="abc123"

# Request lifecycle (start to end)
{container="nodejs-app"} | json | request_id="abc123" | line_format "{{.timestamp}} [{{.event_type}}] {{.message}}"
```

#### 6. **Performance Monitoring**

```logql
# CPU intensive operations
{container="nodejs-app"} | json | event_type="api_cpu_intensive_end"

# Slow API endpoints
{container="nodejs-app"} | json | unwrap total_duration_ms | total_duration_ms > 2000
```

#### 7. **Error Analysis**

```logql
# Error logs with stack traces
{container="nodejs-app"} | json | level="error"

# Failed requests by endpoint
{container="nodejs-app"} | json | status_code=~"5.."
```

#### 8. **System Health**

```logql
# Application startup logs
{container="nodejs-app"} | json | event_type="startup"

# Health check requests
{container="nodejs-app"} | json | path="/health"
```

## Best Practices

### 1. Label Strategy

**Good Labels:**

- `job`: Application/service name
- `environment`: prod, staging, dev
- `level`: info, warn, error, debug
- `container`: Container name
- `instance`: Host/instance identifier

**Avoid:**

- High cardinality labels (user IDs, session IDs)
- Too many unique label combinations
- Labels that change frequently

### 2. Log Format

**Structured Logging (Recommended):**

```json
{
  "timestamp": "2023-01-01T12:00:00Z",
  "level": "info",
  "message": "Request processed",
  "request_id": "abc123",
  "duration_ms": 150,
  "status_code": 200
}
```

### 3. Performance Optimization

- Use appropriate log levels
- Implement log rotation
- Monitor log volume
- Use efficient label combinations

### 4. Storage Considerations

- Configure retention policies
- Use appropriate storage backends
- Monitor storage usage
- Implement backup strategies

## Troubleshooting

### Issues I Encountered & Solutions

In this project setup, I faced several real-world issues that are common in Loki deployments:

#### 1. **Network Connectivity Issues**

**Problem:** Prometheus couldn't scrape metrics from Node.js app

```bash
# Error: connection refused
curl: (7) Failed to connect to nodejs-app port 3010: Connection refused
```

**Root Cause:** Services not on the same Docker network
**Solution:** Added all services to `loki-network` in docker-compose.yml

#### 2. **Grafana Data Source Conflicts**

**Problem:** Multiple default data sources causing confusion

```yaml
# Multiple datasources with isDefault: true
datasources:
  - name: Prometheus
    isDefault: true # ❌ Conflict
  - name: Loki
    isDefault: true # ❌ Conflict
```

**Solution:** Removed duplicate default data sources, kept only one

#### 3. **Loki Readiness Issues**

**Problem:** Promtail couldn't connect to Loki initially

```bash
# Error: Loki not ready
curl: (7) Failed to connect to loki port 3100: Connection refused
```

**Solution:** Added `depends_on` with health checks in docker-compose.yml

#### 4. **Dashboard Data Source UID Mismatch**

**Problem:** Dashboard panels showing "No data" due to wrong datasource UID

```json
// Wrong UID in dashboard JSON
"datasource": {
  "type": "loki",
  "uid": "wrong-uid-here"  // ❌ Mismatch
}
```

**Solution:** Updated all datasource UIDs to match the actual Loki datasource UID

### Common Issues:

#### 1. High Cardinality

**Problem:** Too many unique label combinations
**Solution:** Reduce label cardinality, use log line filtering

#### 2. Slow Queries

**Problem:** Queries taking too long
**Solution:** Optimize label usage, use time ranges, add indexes

#### 3. Memory Issues

**Problem:** High memory usage
**Solution:** Adjust chunk settings, reduce concurrent queries

#### 4. Storage Issues

**Problem:** Storage filling up
**Solution:** Configure retention, use object storage

### Debug Commands:

```bash
# Check Loki health
curl http://localhost:3100/ready

# Check metrics
curl http://localhost:3100/metrics

# Test query
curl -G -s "http://localhost:3100/loki/api/v1/query_range" \
  --data-urlencode 'query={job="nodejs-app"}' \
  --data-urlencode 'start=1640995200' \
  --data-urlencode 'end=1640998800' \
  --data-urlencode 'step=1s'
```

## Advanced Features

### 1. Multi-tenancy

```yaml
auth_enabled: true
auth:
  type: basic
  basic_auth:
    username: admin
    password: admin
```

### 2. Alerting

```yaml
# ruler.yaml
groups:
  - name: example
    rules:
      - alert: HighErrorRate
        expr: rate({job="nodejs-app"} |= "error" [5m]) > 0.1
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: High error rate detected
```

### 3. Recording Rules

```yaml
groups:
  - name: recording_rules
    rules:
      - record: job:errors:rate5m
        expr: rate({job="nodejs-app"} |= "error" [5m])
```

### 4. Log Retention

```yaml
table_manager:
  retention_deletes_enabled: true
  retention_period: 744h # 31 days
```

## Integration with Grafana

### This Project's Dashboard Setup

This project includes a comprehensive logs dashboard that demonstrates real-world usage of Loki with Grafana.

#### 1. **Data Source Configuration**

The Loki data source is automatically provisioned:

```yaml
# grafana/provisioning/datasources/loki.yml
apiVersion: 1

datasources:
  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    version: 1
    editable: true
```

#### 2. **This Project's Logs Dashboard**

The project includes `grafana/dashboards/logs-dashboard.json` with:

- **Application Logs Panel**: Real-time log stream from Node.js app
- **Log Volume by Level**: Timeseries of log levels (info, warn, error)
- **Request Volume by Method**: HTTP method distribution over time
- **Request Distribution by Path**: Pie chart of endpoint usage
- **Log Level Distribution**: Pie chart of log levels
- **Error Logs Panel**: Dedicated panel for error logs only

#### 3. **Dashboard Features**

- **Auto-refresh**: Every 5 seconds
- **Time range**: Last 15 minutes (adjustable)
- **Filters**: Container and Log Level dropdowns
- **Real-time**: Shows live logs as they come in

#### 4. **Access Information**

- **URL**: http://localhost:3000/d/nodejs-logs-dashboard/node-js-application-logs-dashboard
- **Login**: `admin` / `1234567890`
- **Data Source**: Loki (UID: `P8E80F9AEF21F6940`)

#### 5. **Dashboard Panels Explained**

**Application Logs Panel:**

```logql
{container="nodejs-app"}
```

- Shows all logs from the Node.js application
- Real-time updates
- Structured JSON display

**Log Volume by Level:**

```logql
sum by (level) (count_over_time({container="nodejs-app"} [5m]))
```

- Tracks log volume by severity level
- Helps identify log level distribution

**Request Volume by Method:**

```logql
sum by (method) (count_over_time({container="nodejs-app"} |= "Incoming request" [5m]))
```

- Monitors HTTP method usage
- Shows traffic patterns

**Error Logs Panel:**

```logql
{container="nodejs-app"} |= "error"
```

- Dedicated view for error logs
- Helps with debugging and monitoring

### 6. **Set Up Alerts**

- Create alert rules based on LogQL queries
- Configure notification channels
- Set up escalation policies

## Monitoring Loki

### Key Metrics to Monitor:

1. **Ingestion Rate**: `rate(loki_build_cortex_ingester_samples_per_second[5m])`
2. **Query Performance**: `histogram_quantile(0.95, rate(loki_query_duration_seconds_bucket[5m]))`
3. **Storage Usage**: `loki_build_cortex_ingester_memory_series`
4. **Error Rate**: `rate(loki_build_cortex_ingester_ingest_samples_failures_total[5m])`

### Health Checks:

```bash
# Ready check
curl http://localhost:3100/ready

# Health check
curl http://localhost:3100/health

# Metrics
curl http://localhost:3100/metrics
```

## Conclusion

Loki provides a powerful, cost-effective solution for log aggregation. By following these best practices and understanding the architecture, you can build a robust logging infrastructure that scales with your application needs.

### Next Steps:

1. Set up Loki in your environment
2. Configure Promtail for log collection
3. Create Grafana dashboards
4. Implement alerting rules
5. Monitor and optimize performance

### Resources:

- [Official Loki Documentation](https://grafana.com/docs/loki/latest/)
- [LogQL Reference](https://grafana.com/docs/loki/latest/logql/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/)
- [Grafana Loki GitHub](https://github.com/grafana/loki)
- [loki-grafana-promtail](https://kubernetestraining.io/blog/loki-grafana-promtail-quickstart-with-docker-compose)
