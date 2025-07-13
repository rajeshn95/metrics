#!/bin/bash

# Jaeger SPM Verification Script
# This script checks the status of your Jaeger SPM (Service Performance Monitoring) setup

set -e

echo "🔍 Jaeger SPM Verification Script"
echo "=================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command_exists docker; then
    print_status "ERROR" "Docker is not installed or not in PATH"
    exit 1
fi

if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
    print_status "ERROR" "Docker Compose is not installed or not in PATH"
    exit 1
fi

if ! command_exists curl; then
    print_status "ERROR" "curl is not installed"
    exit 1
fi

if ! command_exists jq; then
    print_status "WARN" "jq is not installed - some JSON parsing will be skipped"
fi

print_status "OK" "Prerequisites check passed"
echo

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_status "ERROR" "docker-compose.yml not found. Please run this script from the metrics project root."
    exit 1
fi

print_status "OK" "Running from correct directory"
echo

# Check container status
echo "🐳 Checking container status..."
CONTAINERS=$(docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}")

if echo "$CONTAINERS" | grep -q "Up"; then
    print_status "OK" "Containers are running"
    echo "$CONTAINERS" | grep "Up" | while read line; do
        print_status "INFO" "  $line"
    done
else
    print_status "ERROR" "No containers are running. Start the stack with: docker compose up -d"
    exit 1
fi
echo

# Check service health
echo "🏥 Checking service health..."

# Check Node.js app
if curl -s http://localhost:3010/health >/dev/null 2>&1; then
    print_status "OK" "Node.js app is healthy"
else
    print_status "ERROR" "Node.js app is not responding"
fi

# Check Prometheus
if curl -s http://localhost:9090/-/healthy >/dev/null 2>&1; then
    print_status "OK" "Prometheus is healthy"
else
    print_status "ERROR" "Prometheus is not responding"
fi

# Check Jaeger UI
if curl -s http://localhost:16686 >/dev/null 2>&1; then
    print_status "OK" "Jaeger UI is accessible"
else
    print_status "ERROR" "Jaeger UI is not accessible"
fi

# Check Jaeger metrics endpoint
if curl -s http://localhost:8889/metrics >/dev/null 2>&1; then
    print_status "OK" "Jaeger metrics endpoint is accessible"
else
    print_status "ERROR" "Jaeger metrics endpoint is not accessible"
fi
echo

# Check traces
echo "📊 Checking trace flow..."

# Check if traces are being received
if command_exists jq; then
    SERVICES=$(curl -s http://localhost:16686/api/services 2>/dev/null | jq -r '.data[]' 2>/dev/null || echo "")
    if [[ $SERVICES == *"nodejs-app"* ]]; then
        print_status "OK" "Traces found for nodejs-app service"
    else
        print_status "WARN" "No traces found for nodejs-app service"
        print_status "INFO" "  Generate some traffic: curl http://localhost:3010/"
    fi
else
    print_status "INFO" "Skipping trace check (jq not available)"
fi

# Generate some test traffic if no traces found
if [[ $SERVICES != *"nodejs-app"* ]]; then
    echo "🔄 Generating test traffic..."
    for i in {1..3}; do
        curl -s http://localhost:3010/ >/dev/null 2>&1
        curl -s http://localhost:3010/health >/dev/null 2>&1
        curl -s http://localhost:3010/metrics >/dev/null 2>&1
        sleep 1
    done
    print_status "INFO" "Test traffic generated"
fi
echo

# Check SPM metrics
echo "📈 Checking SPM metrics..."

# Check Jaeger metrics endpoint for SPM metrics
SPM_METRICS=$(curl -s http://localhost:8889/metrics 2>/dev/null | grep traces_span_metrics | wc -l || echo "0")

if [ "$SPM_METRICS" -gt 0 ]; then
    print_status "OK" "SPM metrics found ($SPM_METRICS metrics)"
    
    # Show some metric names
    METRIC_NAMES=$(curl -s http://localhost:8889/metrics 2>/dev/null | grep traces_span_metrics | head -3 | cut -d' ' -f1 || echo "")
    if [ ! -z "$METRIC_NAMES" ]; then
        echo "$METRIC_NAMES" | while read metric; do
            print_status "INFO" "  Found: $metric"
        done
    fi
else
    print_status "WARN" "No SPM metrics found"
    print_status "INFO" "  This might be normal if no traces have been processed yet"
fi

# Check Prometheus targets
if command_exists jq; then
    TARGET_STATUS=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null | jq -r '.data.activeTargets[] | select(.labels.job == "aggregated-trace-metrics") | .health' 2>/dev/null || echo "")
    if [[ $TARGET_STATUS == "up" ]]; then
        print_status "OK" "Prometheus target for SPM metrics is healthy"
    else
        print_status "WARN" "Prometheus target for SPM metrics is not healthy"
    fi
else
    print_status "INFO" "Skipping Prometheus target check (jq not available)"
fi
echo

# Check Monitor tab configuration
echo "🖥️  Checking Monitor tab configuration..."

# Check if UI config file exists and is properly formatted
if [ -f "ui-config.json" ]; then
    if command_exists jq; then
        UI_CONFIG_CHECK=$(jq -r '.monitor.menuEnabled' ui-config.json 2>/dev/null || echo "")
        if [[ $UI_CONFIG_CHECK == "true" ]]; then
            print_status "OK" "UI config file has Monitor tab enabled"
        else
            print_status "WARN" "UI config file does not have Monitor tab enabled"
        fi
    else
        print_status "INFO" "UI config file exists (jq not available for validation)"
    fi
else
    print_status "WARN" "UI config file not found"
fi

# Check if Jaeger is using the UI config (from logs)
UI_CONFIG_USED=$(docker compose logs jaeger 2>/dev/null | grep -i "using ui configuration" | wc -l || echo "0")
if [ "$UI_CONFIG_USED" -gt 0 ]; then
    print_status "OK" "Jaeger is using UI configuration"
else
    print_status "WARN" "Jaeger might not be using UI configuration"
fi

# Check Jaeger internal telemetry
JAEGER_METRICS=$(curl -s http://localhost:8888/metrics 2>/dev/null | grep jaeger_metricstore_requests_total | wc -l || echo "0")
if [ "$JAEGER_METRICS" -gt 0 ]; then
    print_status "OK" "Jaeger internal telemetry metrics found"
else
    print_status "INFO" "Jaeger internal telemetry not yet available"
fi
echo

# Check for errors in logs
echo "📝 Checking for errors in logs..."

# Check Jaeger logs for errors
JAEGER_ERRORS=$(docker compose logs jaeger 2>/dev/null | grep -i "error\|failed\|panic" | wc -l || echo "0")
if [ "$JAEGER_ERRORS" -eq 0 ]; then
    print_status "OK" "No errors found in Jaeger logs"
else
    print_status "WARN" "Found $JAEGER_ERRORS potential errors in Jaeger logs"
    print_status "INFO" "  Check with: docker compose logs jaeger | grep -i error"
fi

# Check Node.js app logs for errors
NODEJS_ERRORS=$(docker compose logs nodejs-app 2>/dev/null | grep -i "error\|failed\|exception" | wc -l || echo "0")
if [ "$NODEJS_ERRORS" -eq 0 ]; then
    print_status "OK" "No errors found in Node.js app logs"
else
    print_status "WARN" "Found $NODEJS_ERRORS potential errors in Node.js app logs"
    print_status "INFO" "  Check with: docker compose logs nodejs-app | grep -i error"
fi
echo

# Summary and next steps
echo "📋 Summary and Next Steps"
echo "========================="

if [ "$SPM_METRICS" -gt 0 ] && [ "$JAEGER_ERRORS" -eq 0 ] && [ "$NODEJS_ERRORS" -eq 0 ]; then
    print_status "OK" "SPM setup appears to be working correctly!"
    echo
    print_status "INFO" "Next steps:"
    print_status "INFO" "  1. Open Jaeger UI: http://localhost:16686"
    print_status "INFO" "  2. Look for the Monitor tab in the top navigation"
    print_status "INFO" "  3. Check for RED metrics (Request, Error, Duration)"
    print_status "INFO" "  4. Explore Prometheus: http://localhost:9090"
    print_status "INFO" "  5. Query: traces_span_metrics_calls_total"
else
    print_status "WARN" "Some issues detected. Please check the warnings above."
    echo
    print_status "INFO" "Troubleshooting steps:"
    print_status "INFO" "  1. Check the debugging guide: docs/JAEGER_SPM_DEBUGGING.md"
    print_status "INFO" "  2. Generate more traffic: curl http://localhost:3010/"
    print_status "INFO" "  3. Check container logs: docker compose logs"
    print_status "INFO" "  4. Restart the stack: docker compose restart"
fi

echo
print_status "INFO" "For detailed debugging, see: docs/JAEGER_SPM_DEBUGGING.md" 