# K6 Debugging

This covers common issues and troubleshooting steps when setting up and running k6 with Prometheus and Grafana.

## Table of Contents

1. [Common Issues](#common-issues)
2. [Prometheus Remote Write Issues](#prometheus-remote-write-issues)
3. [k6 Configuration Issues](#k6-configuration-issues)
4. [Network Connectivity Issues](#network-connectivity-issues)
5. [Grafana Dashboard Issues](#grafana-dashboard-issues)
6. [Performance Issues](#performance-issues)
7. [Debugging Commands](#debugging-commands)
8. [Best Practices](#best-practices)

## Common Issues

### Issue: k6 fails to start or run

**Symptoms:**

- k6 container exits immediately
- "k6: command not found" errors
- Permission denied errors

**Solutions:**

1. Check if k6 is properly installed:

   ```bash
   k6 version
   ```

2. Verify Docker image:

   ```bash
   docker pull grafana/k6:latest
   ```

3. Check container logs:
   ```bash
   docker compose logs k6
   ```

### Issue: Test script not found

**Symptoms:**

- "Test file not found" errors
- Script path issues

**Solutions:**

1. Verify file exists and path is correct:

   ```bash
   ls -la k6/load-test.js
   ```

2. Check volume mounting in docker-compose.yml:

   ```yaml
   volumes:
     - ./k6:/scripts
   ```

3. Use absolute paths if needed:
   ```bash
   docker compose run --rm k6 run /scripts/load-test.js
   ```

## Prometheus Remote Write Issues

### Issue: 404 errors when k6 tries to send metrics

**Symptoms:**

```
ERRO[0001] Failed to send the time series data to the endpoint  error="got status code: 404 instead expected a 2xx successful status code"
```

**Root Cause:** Prometheus remote write receiver is not enabled.

**Solutions:**

1. **Add the required flag to Prometheus configuration:**

   ```yaml
   # In docker-compose.yml
   prometheus:
     command:
       - "--web.enable-remote-write-receiver" # Add this line
   ```

2. **Restart Prometheus:**

   ```bash
   docker compose restart prometheus
   ```

3. **Test the endpoint:**
   ```bash
   curl -X POST http://localhost:9090/api/v1/write -d "test" -v
   ```
   - **Expected:** 400 Bad Request (invalid data, but endpoint exists)
   - **Wrong:** 404 with "remote write receiver needs to be enabled" message

### Issue: Prometheus not accepting remote write data

**Symptoms:**

- 400 Bad Request errors
- "snappy: corrupt input" errors

**Solutions:**

1. Verify k6 output configuration:

   ```bash
   k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js
   ```

2. Check environment variables:

   ```bash
   export K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write
   export K6_PROMETHEUS_RW_PUSH_INTERVAL=1s
   ```

3. Ensure proper network connectivity between k6 and Prometheus containers.

### Issue: Metrics not appearing in Prometheus

**Symptoms:**

- k6 runs successfully but no metrics in Prometheus
- Empty query results

**Solutions:**

1. **Check if metrics are being sent:**

   ```bash
   # List all k6 metrics
   curl -s "http://localhost:9090/api/v1/label/__name__/values" | jq '.data[] | select(contains("k6"))'
   ```

2. **Query specific metrics:**

   ```bash
   curl -s "http://localhost:9090/api/v1/query?query=k6_http_reqs_total" | jq '.data.result'
   ```

3. **Check Prometheus targets:**
   ```bash
   curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job == "k6")'
   ```

## k6 Configuration Issues

### Issue: Wrong output format

**Symptoms:**

- "Unknown output type" errors
- Metrics not being sent

**Solutions:**

1. Use correct output format:

   ```bash
   # Correct
   k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js

   # Wrong
   k6 run --out prometheus=prometheus:9090/api/v1/write load-test.js
   ```

2. Check k6 version compatibility:
   ```bash
   k6 version
   ```

### Issue: Environment variables not working

**Symptoms:**

- Configuration not applied
- Default values being used

**Solutions:**

1. Set environment variables in docker-compose.yml:

   ```yaml
   environment:
     - K6_OUT=experimental-prometheus-rw=prometheus:9090/api/v1/write
     - K6_PROMETHEUS_RW_SERVER_URL=http://prometheus:9090/api/v1/write
     - K6_PROMETHEUS_RW_PUSH_INTERVAL=1s
     - K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max
   ```

2. Or set them in the command line:
   ```bash
   K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max \
   k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js
   ```

## Network Connectivity Issues

### Issue: k6 cannot reach target application

**Symptoms:**

- Connection refused errors
- Timeout errors
- "dial tcp: lookup" errors

**Solutions:**

1. **Check if target application is running:**

   ```bash
   docker compose ps
   curl http://localhost:3010/health
   ```

2. **Verify network connectivity:**

   ```bash
   # From k6 container
   docker compose exec k6 ping nodejs-app
   docker compose exec k6 curl http://nodejs-app:3010/health
   ```

3. **Check Docker network:**
   ```bash
   docker network ls
   docker network inspect metrics_loki-network
   ```

### Issue: k6 cannot reach Prometheus

**Symptoms:**

- Connection refused to Prometheus
- DNS resolution issues

**Solutions:**

1. **Test connectivity from k6 to Prometheus:**

   ```bash
   docker compose exec k6 curl http://prometheus:9090/api/v1/write
   ```

2. **Check Prometheus is running:**

   ```bash
   docker compose ps prometheus
   curl http://localhost:9090/api/v1/status/config
   ```

3. **Verify container names and network:**
   ```bash
   docker compose exec k6 nslookup prometheus
   ```

## Grafana Dashboard Issues

### Issue: Dashboard not showing k6 metrics

**Symptoms:**

- Empty graphs
- "No data" messages
- Missing panels

**Solutions:**

1. **Check data source configuration:**

   - Verify Prometheus data source is configured
   - Check URL: `http://prometheus:9090`

2. **Verify metrics exist:**

   ```bash
   # In Grafana, go to Explore and query:
   k6_http_reqs_total
   ```

3. **Check time range:**

   - Ensure time range includes when k6 tests ran
   - Use "Last 1 hour" or custom range

4. **Import dashboard:**
   ```bash
   # Import the k6 dashboard
   # File: k6/k6-dashboard.json
   ```

### Issue: Dashboard panels not updating

**Symptoms:**

- Stale data
- Panels not refreshing

**Solutions:**

1. **Check refresh interval:**

   - Set dashboard refresh to 5s or 10s
   - Enable auto-refresh

2. **Verify data is being written:**

   ```bash
   curl -s "http://localhost:9090/api/v1/query?query=k6_http_reqs_total" | jq '.data.result | length'
   ```

3. **Check Prometheus scrape interval:**
   ```yaml
   # In prometheus.yml
   global:
     scrape_interval: 5s
   ```

## Performance Issues

### Issue: High memory usage

**Symptoms:**

- Container memory limits exceeded
- Out of memory errors

**Solutions:**

1. **Limit k6 resources:**

   ```yaml
   k6:
     deploy:
       resources:
         limits:
           memory: 512M
         reservations:
           memory: 256M
   ```

2. **Reduce virtual users:**

   ```bash
   k6 run --vus 5 --duration 30s load-test.js
   ```

3. **Use streaming output:**
   ```bash
   k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js
   ```

### Issue: Slow test execution

**Symptoms:**

- Tests taking longer than expected
- High response times

**Solutions:**

1. **Check target application performance:**

   ```bash
   curl -w "@curl-format.txt" http://localhost:3010/health
   ```

2. **Monitor system resources:**

   ```bash
   docker stats
   ```

3. **Reduce load:**
   ```bash
   k6 run --vus 1 --duration 10s load-test.js
   ```

## Debugging Commands

### Container and Service Status

```bash
# Check all services
docker compose ps

# Check service logs
docker compose logs k6
docker compose logs prometheus
docker compose logs grafana

# Check service health
curl http://localhost:3010/health
curl http://localhost:9090/api/v1/status/config
curl http://localhost:3000/api/health
```

### Prometheus Debugging

```bash
# Check targets
curl -s http://localhost:9090/api/v1/targets | jq '.'

# List all metrics
curl -s "http://localhost:9090/api/v1/label/__name__/values" | jq '.'

# Query specific metrics
curl -s "http://localhost:9090/api/v1/query?query=k6_http_reqs_total" | jq '.'

# Check remote write endpoint
curl -X POST http://localhost:9090/api/v1/write -d "test" -v
```

### k6 Debugging

```bash
# Test k6 locally
k6 run --out json=results.json load-test.js

# Run with verbose output
k6 run --verbose load-test.js

# Test specific endpoints
k6 run --env TARGET_URL=http://localhost:3010 load-test.js

# Check k6 version
k6 version
```

### Network Debugging

```bash
# Check network connectivity
docker compose exec k6 ping prometheus
docker compose exec k6 curl http://prometheus:9090/api/v1/write

# Check DNS resolution
docker compose exec k6 nslookup prometheus
docker compose exec k6 nslookup nodejs-app

# Check network configuration
docker network inspect metrics_loki-network
```

## Best Practices

### 1. Configuration Management

- Use environment variables for configuration
- Keep test scripts in version control
- Document configuration changes

### 2. Monitoring Setup

- Always enable remote write receiver in Prometheus
- Use proper labeling for metrics
- Set up alerts for critical failures

### 3. Testing Strategy

- Start with small tests and scale up
- Use different test types (load, stress, spike)
- Monitor system resources during tests

### 4. Troubleshooting Workflow

1. Check service status
2. Verify network connectivity
3. Check configuration
4. Review logs
5. Test individual components
6. Validate metrics flow

### 5. Performance Optimization

- Use appropriate virtual user counts
- Monitor target application performance
- Set resource limits for containers
- Use streaming outputs for large tests

## Common Error Messages and Solutions

| Error Message                               | Cause                               | Solution                                 |
| ------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `remote write receiver needs to be enabled` | Prometheus config missing flag      | Add `--web.enable-remote-write-receiver` |
| `got status code: 404`                      | Remote write endpoint not available | Enable remote write receiver             |
| `snappy: corrupt input`                     | Invalid data format                 | Check k6 output configuration            |
| `dial tcp: lookup`                          | DNS resolution issue                | Check container names and network        |
| `connection refused`                        | Service not running                 | Start required services                  |
| `permission denied`                         | File permissions                    | Check file ownership and permissions     |

## Getting Help

If you're still experiencing issues:

1. **Check the logs:**

   ```bash
   docker compose logs --tail=100 k6
   ```

2. **Verify configuration:**

   - Review all configuration files
   - Check environment variables
   - Validate network settings

3. **Test components individually:**

   - Test k6 with local output
   - Test Prometheus remote write endpoint
   - Test Grafana data source

4. **Consult documentation:**
   - [k6 Documentation](https://k6.io/docs/)
   - [Prometheus Remote Write](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#remote_write)
   - [Grafana k6 Integration](https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/)

---

_This guide is based on troubleshooting experience with k6, Prometheus, and Grafana integration. Update as needed for your specific environment and requirements._
