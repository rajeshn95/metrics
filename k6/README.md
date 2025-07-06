# K6 Load Testing Setup

This directory contains the k6 load testing configuration for your Node.js application with Prometheus and Grafana integration.

## Overview

K6 is a modern load testing tool that can send metrics directly to Prometheus, which can then be visualized in Grafana dashboards.

## Files

- `load-test.js` - Main k6 test script that tests your Node.js application endpoints
- `run-test.sh` - Interactive script to run different types of load tests
- `README.md` - This documentation file

## Prerequisites

1. **Docker and Docker Compose** - Your monitoring stack should be running
2. **K6** - Install k6 locally for running tests outside of Docker

### Installing K6

**macOS:**

```bash
brew install k6
```

**Linux:**

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows:**

```bash
choco install k6
```

## Quick Start

1. **Start your monitoring stack:**

   ```bash
   docker-compose up -d
   ```

2. **Run a load test using the interactive script:**

   ```bash
   cd k6
   ./run-test.sh
   ```

3. **View results in Grafana:**
   - Open http://localhost:3000
   - Login with admin/admin
   - Navigate to the "K6 Load Test Dashboard"

## Test Types

### 1. Simple Load Test

- Fixed number of virtual users for a specified duration
- Good for baseline performance testing

### 2. Stress Test

- Gradually increases load to find breaking points
- Pattern: 1m:10 → 3m:20 → 2m:30 → 1m:0

### 3. Spike Test

- Sudden increase in load to test system resilience
- Pattern: 1m:5 → 1m:50 → 1m:5

### 4. Soak Test

- Long duration with moderate load
- Good for finding memory leaks and stability issues

## Manual K6 Commands

### Basic Test

```bash
k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js
```

**With environment variables:**

```bash
K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max \
k6 run --out experimental-prometheus-rw=prometheus:9090/api/v1/write load-test.js
```

### Custom Duration and VUs

```bash
k6 run \
  --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
  --duration 10m \
  --vus 20 \
  load-test.js
```

**With test ID for better tracking:**

```bash
k6 run \
  --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
  --tag testid=my-load-test-001 \
  --duration 10m \
  --vus 20 \
  load-test.js
```

### Environment Variables

```bash
TARGET_URL=http://localhost:3010 k6 run \
  --out prometheus=remote_write/prometheus:9090/api/v1/write \
  load-test.js
```

## Docker Integration

The `docker-compose.yml` includes a k6 service that can run tests automatically:

```bash
# Run k6 test via Docker
docker-compose run --rm k6

# Run with custom parameters
docker-compose run --rm k6 k6 run --duration 5m --vus 10 /scripts/load-test.js
```

## Metrics Available

K6 sends the following metrics to Prometheus:

- `k6_http_reqs_total` - Total HTTP requests
- `k6_http_req_duration_seconds` - Request duration histogram
- `k6_http_req_failed_total` - Failed requests
- `k6_vus` - Current virtual users
- `k6_vus_max` - Maximum virtual users
- `k6_iterations_total` - Total iterations
- `k6_data_received` - Data received
- `k6_data_sent` - Data sent

## Grafana Dashboard

The K6 dashboard includes:

1. **Requests per Second** - Overall throughput
2. **95th Percentile Response Time** - Performance metrics
3. **Error Rate** - Percentage of failed requests
4. **Virtual Users** - Current load level
5. **Requests per Second by Endpoint** - Detailed endpoint analysis

## Customizing Tests

### Adding New Endpoints

Edit `load-test.js` and add new HTTP requests:

```javascript
// Test a new endpoint
const newEndpointResponse = http.get(`${BASE_URL}/api/new-endpoint`);
check(newEndpointResponse, {
  "new endpoint status is 200": (r) => r.status === 200,
});
```

### Custom Metrics

Add custom metrics to track specific business logic:

```javascript
import { Counter, Rate } from "k6/metrics";

const customCounter = new Counter("custom_metric");
const customRate = new Rate("custom_rate");

export default function () {
  // Your test logic
  customCounter.add(1);
  customRate.add(true); // or false
}
```

### Test Scenarios

Modify the `options` object in `load-test.js`:

```javascript
export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up
    { duration: "5m", target: 10 }, // Stay at 10
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"], // 95% under 300ms
    http_req_failed: ["rate<0.05"], // Less than 5% errors
  },
};
```

## Troubleshooting

### K6 Not Sending Metrics to Prometheus

- Check that Prometheus is running: `docker-compose ps`
- Verify network connectivity: `docker-compose exec k6 ping prometheus`
- Check Prometheus logs: `docker-compose logs prometheus`

### High Error Rates

- Verify your application is healthy: `curl http://localhost:3010/health`
- Check application logs: `docker-compose logs nodejs-app`
- Reduce load or increase application resources

### No Data in Grafana

- Ensure Prometheus data source is configured
- Check time range in Grafana (should be recent)
- Verify k6 metrics are being collected in Prometheus

## Best Practices

1. **Start Small** - Begin with low VU counts and short durations
2. **Monitor Resources** - Watch CPU, memory, and network usage
3. **Set Realistic Thresholds** - Base thresholds on your application's requirements
4. **Test Regularly** - Run tests as part of your CI/CD pipeline
5. **Document Results** - Keep track of performance baselines and trends

## Resources

- [K6 Documentation](https://k6.io/docs/)
- [K6 Prometheus Integration](https://k6.io/docs/results-output/real-time/prometheus/)
- [Grafana K6 Dashboards](https://grafana.com/grafana/dashboards/2587-k6-load-testing/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
