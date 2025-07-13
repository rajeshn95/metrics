#!/bin/bash

echo "🔍 Jaeger Trace Verification Script"
echo "==================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_success "Docker is running"

# Check if containers are running
print_status "Checking container status..."
if ! docker compose ps | grep -q "Up"; then
    print_warning "Containers are not running. Starting them..."
    docker compose up -d
    sleep 10
fi

# Check specific containers
print_status "Checking specific containers..."

if docker compose ps | grep -q "nodejs-app.*Up"; then
    print_success "Node.js app is running"
else
    print_error "Node.js app is not running"
fi

if docker compose ps | grep -q "jaeger.*Up"; then
    print_success "Jaeger is running"
else
    print_error "Jaeger is not running"
fi

# Check if Jaeger UI is accessible
print_status "Checking Jaeger UI accessibility..."
if curl -s http://localhost:16686 > /dev/null; then
    print_success "Jaeger UI is accessible at http://localhost:16686"
else
    print_error "Jaeger UI is not accessible"
fi

# Check if Node.js app is accessible
print_status "Checking Node.js app accessibility..."
if curl -s http://localhost:3010/health > /dev/null; then
    print_success "Node.js app is accessible at http://localhost:3010"
else
    print_error "Node.js app is not accessible"
fi

# Generate test traces
print_status "Generating test traces..."

# Make API calls to generate traces
echo "Making API calls to generate traces..."
curl -s http://localhost:3010/api/fast > /dev/null
curl -s http://localhost:3010/api/medium > /dev/null
curl -s http://localhost:3010/api/slow > /dev/null

print_success "API calls completed"

# Wait a moment for traces to be sent
print_status "Waiting for traces to be sent..."
sleep 3

# Check container logs for any errors
print_status "Checking container logs for errors..."

NODEJS_ERRORS=$(docker compose logs nodejs-app 2>&1 | grep -i "error\|exception" | wc -l)
JAEGER_ERRORS=$(docker compose logs jaeger 2>&1 | grep -i "error\|exception" | wc -l)

if [ "$NODEJS_ERRORS" -eq 0 ]; then
    print_success "No errors found in Node.js app logs"
else
    print_warning "Found $NODEJS_ERRORS errors in Node.js app logs"
    docker compose logs nodejs-app | grep -i "error\|exception" | tail -5
fi

if [ "$JAEGER_ERRORS" -eq 0 ]; then
    print_success "No errors found in Jaeger logs"
else
    print_warning "Found $JAEGER_ERRORS errors in Jaeger logs"
    docker compose logs jaeger | grep -i "error\|exception" | tail -5
fi

echo ""
echo "🎯 Verification Complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Open Jaeger UI: http://localhost:16686"
echo "2. Select service: 'nodejs-app'"
echo "3. Click 'Find Traces'"
echo "4. You should see traces from the API calls"
echo ""
echo "If you don't see traces:"
echo "1. Check the troubleshooting guide: docs/JAEGER_TROUBLESHOOTING.md"
echo "2. Run: docker compose logs nodejs-app"
echo "3. Run: docker compose logs jaeger"
echo ""
echo "To generate more traces, run:"
echo "curl http://localhost:3010/api/fast"
echo "curl http://localhost:3010/api/medium"
echo "curl http://localhost:3010/api/slow" 