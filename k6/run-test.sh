#!/bin/bash

# K6 Load Test Runner Script
# This script allows you to run k6 tests with different configurations

set -e

# Default values
TARGET_URL=${TARGET_URL:-"http://localhost:3010"}
TEST_FILE=${TEST_FILE:-"load-test.js"}
DURATION=${DURATION:-"5m"}
VUS=${VUS:-"10"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}K6 Load Test Runner${NC}"
echo "======================"
echo -e "Target URL: ${YELLOW}${TARGET_URL}${NC}"
echo -e "Test File: ${YELLOW}${TEST_FILE}${NC}"
echo -e "Duration: ${YELLOW}${DURATION}${NC}"
echo -e "Virtual Users: ${YELLOW}${VUS}${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed.${NC}"
    echo "Please install k6 from: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo -e "${RED}Error: Test file $TEST_FILE not found.${NC}"
    exit 1
fi

# Function to run a simple load test
run_simple_test() {
    echo -e "${GREEN}Running simple load test...${NC}"
    k6 run \
        --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
        --env TARGET_URL="$TARGET_URL" \
        --duration "$DURATION" \
        --vus "$VUS" \
        "$TEST_FILE"
}

# Function to run a stress test
run_stress_test() {
    echo -e "${GREEN}Running stress test...${NC}"
    k6 run \
        --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
        --env TARGET_URL="$TARGET_URL" \
        --stage 1m:10 \
        --stage 3m:20 \
        --stage 2m:30 \
        --stage 1m:0 \
        "$TEST_FILE"
}

# Function to run a spike test
run_spike_test() {
    echo -e "${GREEN}Running spike test...${NC}"
    k6 run \
        --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
        --env TARGET_URL="$TARGET_URL" \
        --stage 1m:5 \
        --stage 1m:50 \
        --stage 1m:5 \
        "$TEST_FILE"
}

# Function to run a soak test
run_soak_test() {
    echo -e "${GREEN}Running soak test...${NC}"
    k6 run \
        --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
        --env TARGET_URL="$TARGET_URL" \
        --duration 30m \
        --vus 5 \
        "$TEST_FILE"
}

# Main menu
echo "Select test type:"
echo "1) Simple load test (${DURATION} duration, ${VUS} VUs)"
echo "2) Stress test (ramp up and down)"
echo "3) Spike test (sudden load increase)"
echo "4) Soak test (long duration, low load)"
echo "5) Custom test"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        run_simple_test
        ;;
    2)
        run_stress_test
        ;;
    3)
        run_spike_test
        ;;
    4)
        run_soak_test
        ;;
    5)
        echo "Custom test options:"
        read -p "Enter duration (e.g., 5m, 10m): " custom_duration
        read -p "Enter virtual users: " custom_vus
        echo -e "${GREEN}Running custom test...${NC}"
        k6 run \
            --out experimental-prometheus-rw=prometheus:9090/api/v1/write \
            --env TARGET_URL="$TARGET_URL" \
            --duration "$custom_duration" \
            --vus "$custom_vus" \
            "$TEST_FILE"
        ;;
    6)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting...${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Test completed!${NC}"
echo "Check Grafana dashboard at http://localhost:3000 for results."
echo "Default credentials: admin/admin" 