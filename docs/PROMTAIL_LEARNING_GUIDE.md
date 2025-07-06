# Promtail Learning Guide

## Table of Contents

1. [What is Promtail?](#what-is-promtail)
2. [Why Use Promtail?](#why-use-promtail)
3. [Promtail Architecture](#promtail-architecture)
4. [Installation & Setup](#installation--setup)
5. [Configuration](#configuration)
6. [Log Discovery](#log-discovery)
7. [Log Processing](#log-processing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Features](#advanced-features)

## What is Promtail?

**Promtail** is a log collection agent designed specifically for Loki. It's the preferred way to ship logs to Loki and is built to be lightweight, efficient, and easy to configure. Promtail is inspired by Prometheus and follows similar patterns for service discovery and configuration.

### Key Characteristics:

- **Log collection**: Collects logs from various sources
- **Service discovery**: Automatically discovers log sources
- **Label management**: Adds labels to log streams
- **Position tracking**: Remembers where it left off reading
- **Reliable delivery**: Ensures logs reach Loki
- **Lightweight**: Minimal resource footprint

## Why Use Promtail?

### Advantages:

1. **Loki Native**: Designed specifically for Loki
2. **Service Discovery**: Automatic log source discovery
3. **Position Tracking**: Reliable log reading with resume capability
4. **Label Management**: Flexible label assignment
5. **Performance**: High-throughput log processing
6. **Reliability**: Handles failures gracefully

### Use Cases:

- Container log collection
- Application log shipping
- System log aggregation
- File-based log collection
- Real-time log streaming

## Promtail Architecture

### Core Components:

```
┌─────────────────────────────────────────────────────────────┐
│                        Promtail                             │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Service       │   File          │   Systemd               │
│   Discovery     │   Targets       │   Journal               │
├─────────────────┼─────────────────┼─────────────────────────┤
│   Docker SD     │   Static        │   Kubernetes SD         │
│   Kubernetes SD │   Targets       │   Consul SD             │
├─────────────────┼─────────────────┼─────────────────────────┤
│   Log           │   Label         │   Position              │
│   Processing    │   Management    │   Tracking              │
├─────────────────┼─────────────────┼─────────────────────────┤
│   Client        │   Batch         │   Retry                 │
│   Management    │   Processing    │   Logic                 │
└─────────────────┴─────────────────┴─────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │       Loki          │
                    │   (Log Aggregator)  │
                    └─────────────────────┘
```

### Components Explained:

1. **Service Discovery**

   - Discovers log sources automatically
   - Supports Docker, Kubernetes, Consul, etc.
   - Dynamic target management

2. **Target Management**

   - Manages log file targets
   - Handles file rotation and truncation
   - Tracks reading positions

3. **Log Processing**

   - Parses and transforms logs
   - Adds labels and metadata
   - Filters and enriches log data

4. **Client Management**
   - Sends logs to Loki
   - Handles batching and retries
   - Manages connection pools

## Installation & Setup

### This Project's Configuration

This project demonstrates Promtail configured to automatically discover and collect logs from Docker containers, with a focus on the Node.js application. Let's examine this specific setup:

#### Docker Compose Configuration

```yaml
# From our docker-compose.yml
promtail:
  image: grafana/promtail:2.9.0
  container_name: promtail
  user: "0:0" # Run as root to ensure access
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - ./promtail-config.yml:/etc/promtail/config.yml
    - /var/lib/docker/containers:/var/lib/docker/containers:ro
  command: -config.file=/etc/promtail/config.yml
  networks:
    - loki-network
  depends_on:
    - loki
  restart: unless-stopped
```

#### This Promtail Configuration Explained

```yaml
# promtail-config.yml - This project's specific configuration
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

  - job_name: container_logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: container_logs
          __path__: /var/lib/docker/containers/*/*-json.log
```

### Configuration Breakdown

#### 1. **Server Configuration**

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0
```

- **HTTP Port**: 9080 for metrics and health checks
- **gRPC Port**: Disabled (not needed for our setup)
- **Access**: Available at `http://localhost:9080`

#### 2. **Position Tracking**

```yaml
positions:
  filename: /tmp/positions.yaml
```

- **Purpose**: Remembers where Promtail left off reading each log file
- **Location**: `/tmp/positions.yaml` inside the container
- **Benefit**: Survives container restarts and prevents log duplication

#### 3. **Loki Client Configuration**

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
```

- **Target**: Our Loki instance on the `loki-network`
- **Protocol**: HTTP push API
- **Network**: Uses Docker network for service discovery

#### 4. **Docker Service Discovery**

```yaml
scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
```

- **Discovery**: Automatically finds all Docker containers
- **Socket**: Accesses Docker daemon via Unix socket
- **Refresh**: Updates container list every 5 seconds
- **Dynamic**: No manual configuration needed for new containers

#### 5. **Label Management**

```yaml
relabel_configs:
  - source_labels: ["__meta_docker_container_name"]
    regex: "/(.*)"
    target_label: "container"
  - source_labels: ["__meta_docker_container_log_stream"]
    target_label: "logstream"
```

- **Container Name**: Extracts container name from Docker metadata
- **Log Stream**: Tracks stdout/stderr streams separately
- **Labels**: Makes logs easily queryable in Loki

#### 6. **Static Log Collection**

```yaml
- job_name: container_logs
  static_configs:
    - targets:
        - localhost
      labels:
        job: container_logs
        __path__: /var/lib/docker/containers/*/*-json.log
```

- **Backup Method**: Direct file access to Docker log files
- **Pattern**: Matches all JSON log files from containers
- **Redundancy**: Ensures no logs are missed

## Configuration

### Key Configuration Sections:

#### 1. Server Configuration

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0
  log_level: info
```

#### 2. Positions Configuration

```yaml
positions:
  filename: /tmp/positions.yaml
  sync_period: 10s
```

#### 3. Clients Configuration

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
    batchwait: 1s
    batchsize: 1024
    timeout: 10s
    retry_on_failure:
      enabled: true
      initial_delay: 1s
      max_delay: 5s
      max_retries: 10
```

#### 4. Scrape Configs

```yaml
scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/*.log
```

## Log Discovery

### Service Discovery Types:

#### 1. Docker Service Discovery

```yaml
scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
        filters:
          - name: name
            values: ["/nodejs-app"]
    relabel_configs:
      - source_labels: ["__meta_docker_container_name"]
        regex: "/(.*)"
        target_label: "container"
      - source_labels: ["__meta_docker_container_log_stream"]
        target_label: "logstream"
      - source_labels:
          ["__meta_docker_container_label_com_docker_compose_service"]
        target_label: "service"
```

#### 2. Kubernetes Service Discovery

```yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: ["__meta_kubernetes_pod_label_app"]
        target_label: "app"
      - source_labels: ["__meta_kubernetes_namespace"]
        target_label: "namespace"
      - source_labels: ["__meta_kubernetes_pod_name"]
        target_label: "pod"
```

#### 3. Static Targets

```yaml
scrape_configs:
  - job_name: static-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: static-logs
          __path__: /var/log/application/*.log
```

#### 4. File Targets

```yaml
scrape_configs:
  - job_name: file-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: file-logs
          __path__: /var/log/**/*.log
```

## Log Processing

### Pipeline Stages:

#### 1. Parsing Stages

**JSON Parsing:**

```yaml
pipeline_stages:
  - json:
      expressions:
        timestamp: timestamp
        level: level
        message: message
        request_id: request_id
```

**Regex Parsing:**

```yaml
pipeline_stages:
  - regex:
      expression: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) (?P<level>\w+) (?P<message>.*)$'
```

**Logfmt Parsing:**

```yaml
pipeline_stages:
  - logfmt:
      mapping:
        timestamp: timestamp
        level: level
        message: msg
```

#### 2. Label Management

**Adding Labels:**

```yaml
pipeline_stages:
  - labels:
      level:
      request_id:
      endpoint:
```

**Label Filtering:**

```yaml
pipeline_stages:
  - match:
      selector: '{job="nodejs-app"}'
      stages:
        - labels:
            level:
            request_id:
```

#### 3. Transformation Stages

**Timestamp Parsing:**

```yaml
pipeline_stages:
  - timestamp:
      source: timestamp
      format: RFC3339Nano
```

**Line Formatting:**

```yaml
pipeline_stages:
  - template:
      source: message
      template: "{{.timestamp}} [{{.level}}] {{.message}}"
```

**Field Extraction:**

```yaml
pipeline_stages:
  - regex:
      expression: 'duration=(?P<duration>\d+)ms'
  - labels:
      duration:
```

### Complete Pipeline Example:

```yaml
scrape_configs:
  - job_name: nodejs-app
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ["__meta_docker_container_name"]
        regex: "/(.*)"
        target_label: "container"
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            request_id: request_id
            endpoint: endpoint
            duration_ms: duration_ms
      - timestamp:
          source: timestamp
          format: RFC3339Nano
      - labels:
          level:
          request_id:
          endpoint:
          duration_ms:
      - match:
          selector: '{level="error"}'
          stages:
            - template:
                source: message
                template: "ERROR: {{.message}}"
```

## Best Practices

### 1. Label Strategy

**Good Labels:**

- `job`: Application/service name
- `container`: Container name
- `level`: Log level (info, warn, error)
- `service`: Service name
- `environment`: Environment (prod, staging, dev)

**Avoid:**

- High cardinality labels
- Labels that change frequently
- Too many unique label combinations

### 2. Position Management

```yaml
positions:
  filename: /tmp/positions.yaml
  sync_period: 10s
  ignore_invalid_yaml: true
```

### 3. Performance Optimization

**Batch Configuration:**

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
    batchwait: 1s
    batchsize: 1024
    timeout: 10s
    retry_on_failure:
      enabled: true
      initial_delay: 1s
      max_delay: 5s
      max_retries: 10
```

### 4. Resource Management

**Memory Limits:**

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0
  log_level: info
  graceful_shutdown_timeout: 30s
```

### 5. Log Rotation Handling

```yaml
scrape_configs:
  - job_name: rotating-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: rotating-logs
          __path__: /var/log/application/*.log
    pipeline_stages:
      - match:
          selector: '{job="rotating-logs"}'
          stages:
            - regex:
                expression: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)'
            - timestamp:
                source: timestamp
                format: RFC3339
```

## Troubleshooting

### Common Issues:

#### 1. Position File Issues

**Problem:** Promtail not reading from correct position
**Solution:** Check position file permissions and location

```bash
# Check position file
ls -la /tmp/positions.yaml

# Reset position file (if needed)
rm /tmp/positions.yaml
```

#### 2. Docker Socket Access

**Problem:** Cannot access Docker socket
**Solution:** Ensure proper permissions and volume mounts

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
  - /var/lib/docker/containers:/var/lib/docker/containers:ro
```

#### 3. High Memory Usage

**Problem:** Promtail using too much memory
**Solution:** Adjust batch settings and reduce concurrent targets

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
    batchwait: 5s
    batchsize: 512
```

#### 4. Log Duplication

**Problem:** Logs appearing multiple times
**Solution:** Check position file and restart Promtail

```bash
# Restart Promtail
docker restart promtail

# Check logs
docker logs promtail
```

### Debug Commands:

```bash
# Check Promtail health
curl http://localhost:9080/ready

# Check metrics
curl http://localhost:9080/metrics

# Check targets
curl http://localhost:9080/api/v1/targets

# Check positions
curl http://localhost:9080/api/v1/positions
```

### Log Analysis:

```bash
# View Promtail logs
docker logs promtail -f

# Check specific target
curl -s http://localhost:9080/api/v1/targets | jq '.data[] | select(.labels.job=="nodejs-app")'

# Monitor metrics
curl -s http://localhost:9080/metrics | grep promtail
```

## Advanced Features

### 1. Multi-Tenant Configuration

```yaml
clients:
  - url: http://loki:3100/loki/api/v1/push
    external_labels:
      tenant: team-a
  - url: http://loki:3100/loki/api/v1/push
    external_labels:
      tenant: team-b
```

### 2. Conditional Processing

```yaml
pipeline_stages:
  - match:
      selector: '{level="error"}'
      stages:
        - labels:
            severity: high
  - match:
      selector: '{level="warn"}'
      stages:
        - labels:
            severity: medium
```

### 3. Log Filtering

```yaml
pipeline_stages:
  - match:
      selector: '{job="nodejs-app"}'
      stages:
        - regex:
            expression: "error|exception|fail"
            action: keep
```

### 4. Custom Labels

```yaml
relabel_configs:
  - source_labels: ["__meta_docker_container_label_environment"]
    target_label: "environment"
  - source_labels: ["__meta_docker_container_label_version"]
    target_label: "version"
  - source_labels: ["__meta_docker_container_label_region"]
    target_label: "region"
```

### 5. Log Enrichment

```yaml
pipeline_stages:
  - template:
      source: message
      template: "{{.timestamp}} [{{.level}}] [{{.request_id}}] {{.message}}"
  - labels:
      request_id:
      level:
```

## Monitoring Promtail

### Our Project Monitoring Setup

In our project, we monitor Promtail's performance and health to ensure reliable log collection:

#### 1. **Key Metrics We Track**

```bash
# Log processing rate
rate(promtail_files_active_total[5m])

# Error rate in log processing
rate(promtail_agent_metrics_entry_errors_total[5m])

# Number of active targets (containers)
promtail_targets_active_total

# Client performance (Loki push requests)
rate(promtail_client_request_duration_seconds_count[5m])
```

#### 2. **Health Check Commands**

```bash
# Check if Promtail is ready
curl http://localhost:9080/ready

# Get detailed metrics
curl http://localhost:9080/metrics

# Check target discovery
curl http://localhost:9080/targets
```

#### 3. **This Project's Monitoring Dashboard**

The project integrates Promtail metrics into the Grafana setup:

- **Log Collection Rate**: Tracks logs per second
- **Target Health**: Shows which containers are being monitored
- **Error Rate**: Alerts on log processing failures
- **Client Performance**: Monitors Loki push performance

#### 4. **Troubleshooting Commands**

```bash
# Check if Promtail can access Docker socket
docker exec promtail ls -la /var/run/docker.sock

# Verify log file access
docker exec promtail ls -la /var/lib/docker/containers/*/*-json.log

# Test Loki connectivity
docker exec promtail curl -s http://loki:3100/ready

# Check position file
docker exec promtail cat /tmp/positions.yaml
```

### Key Metrics to Monitor:

1. **Target Health**: `promtail_targets_health`
2. **Log Processing Rate**: `rate(promtail_log_entries_total[5m])`
3. **Client Errors**: `rate(promtail_client_dropped_entries_total[5m])`
4. **Position Tracking**: `promtail_positions_current`
5. **Memory Usage**: `promtail_memory_usage_bytes`

### Health Checks:

```bash
# Ready check
curl http://localhost:9080/ready

# Health check
curl http://localhost:9080/health

# Targets status
curl http://localhost:9080/api/v1/targets
```

### Alerting Rules:

```yaml
groups:
  - name: promtail
    rules:
      - alert: PromtailTargetDown
        expr: promtail_targets_health == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: Promtail target is down

      - alert: PromtailHighErrorRate
        expr: rate(promtail_client_dropped_entries_total[5m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: High log drop rate detected
```

## Integration Examples

### 1. This Project's Node.js Application Setup

This project includes a comprehensive setup that demonstrates real-world Promtail integration:

#### **This Project's Configuration**

```yaml
# From this project's promtail-config.yml
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

  - job_name: container_logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: container_logs
          __path__: /var/lib/docker/containers/*/*-json.log
```

#### **How It Works**

1. **Docker Service Discovery**: Automatically finds the `nodejs-app` container
2. **Label Extraction**: Creates `container` and `logstream` labels
3. **Log Collection**: Reads JSON log files from Docker
4. **Backup Method**: Static config ensures no logs are missed

#### **Log Processing Pipeline**

The Node.js app generates structured logs that Promtail processes:

```json
// Input log from Node.js app
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

#### **Querying in Loki**

```logql
# All logs from the app
{container="nodejs-app"}

# Error logs only
{container="nodejs-app"} |= "error"

# Request logs with performance data
{container="nodejs-app"} | json | unwrap duration_ms | duration_ms > 1000

# Request tracing
{container="nodejs-app"} | json | request_id="abc123"
```

### 2. Node.js Application (Generic Example)

```yaml
scrape_configs:
  - job_name: nodejs-app
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ["__meta_docker_container_name"]
        regex: "/(.*)"
        target_label: "container"
      - source_labels:
          ["__meta_docker_container_label_com_docker_compose_service"]
        target_label: "service"
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            request_id: request_id
            endpoint: endpoint
            duration_ms: duration_ms
      - timestamp:
          source: timestamp
          format: RFC3339Nano
      - labels:
          level:
          request_id:
          endpoint:
          duration_ms:
```

### 2. System Logs

```yaml
scrape_configs:
  - job_name: system-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: system-logs
          __path__: /var/log/syslog
    pipeline_stages:
      - regex:
          expression: '^(?P<timestamp>\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})'
      - timestamp:
          source: timestamp
          format: Jan 2 15:04:05
      - labels:
          facility:
          priority:
```

### 3. Application Logs

```yaml
scrape_configs:
  - job_name: app-logs
    static_configs:
      - targets:
          - localhost
        labels:
          job: app-logs
          __path__: /var/log/application/*.log
    pipeline_stages:
      - logfmt:
          mapping:
            timestamp: time
            level: level
            message: msg
            request_id: req_id
      - timestamp:
          source: timestamp
          format: RFC3339
      - labels:
          level:
          request_id:
```

## Conclusion

Promtail is a powerful and efficient log collection agent that works seamlessly with Loki. By following these best practices and understanding the configuration options, you can build a robust log collection infrastructure.

### Next Steps:

1. Set up Promtail in your environment
2. Configure service discovery for your log sources
3. Implement log processing pipelines
4. Monitor Promtail performance
5. Optimize configuration for your use case

### Resources:

- [Official Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
- [Promtail Configuration Reference](https://grafana.com/docs/loki/latest/clients/promtail/configuration/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
- [Grafana Promtail GitHub](https://github.com/grafana/loki/tree/main/clients/cmd/promtail)
