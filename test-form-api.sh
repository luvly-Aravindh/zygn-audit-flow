#!/bin/bash

# Simple test script for form submission API
# Usage: bash test-form-api.sh [endpoint_url]

ENDPOINT="${1:-http://localhost:4173/api/submit-lead}"
HEALTH_ENDPOINT="${ENDPOINT%/api/submit-lead}/api/health"

echo "=========================================="
echo "Form Submission API Test"
echo "=========================================="
echo ""

# Check if health endpoint is working
echo "1. Checking API health..."
echo "   URL: $HEALTH_ENDPOINT"
echo ""

HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
echo "   Response: $HEALTH_RESPONSE"
echo ""

# Extract ok status
OK_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"ok":[^,}]*' | grep -o 'true\|false')

if [ "$OK_STATUS" != "true" ]; then
  echo "❌ API health check failed. Desk API key may not be configured correctly."
  echo ""
  echo "Fix: Set DESK_API_KEY environment variable with a valid key"
  exit 1
fi

echo "✅ API health check passed"
echo ""

# Test form submission
echo "2. Testing form submission..."
echo "   URL: $ENDPOINT"
echo ""

TEST_DATA='{
  "form_type": "flow",
  "full_name": "Test User",
  "email": "test@example.com",
  "mobile": "9876543210",
  "country_code": "+91",
  "studio_name": "Test Studio",
  "studio_city": "Bangalore",
  "role": "owner",
  "team": "s5",
  "projects": "architecture",
  "business_type": "architecture",
  "modules": ["planning", "budgeting"],
  "tools": "software",
  "timeline": "immediate",
  "budget": "yes"
}'

echo "   Sending test data..."
RESPONSE=$(curl -s -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

echo "   Response: $RESPONSE"
echo ""

# Check response
STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
MESSAGE=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)

if [ "$STATUS" = "success" ]; then
  echo "✅ Form submission successful!"
  LEAD_ID=$(echo "$RESPONSE" | grep -o '"leadId":"[^"]*"' | cut -d'"' -f4)
  echo "   Lead ID: $LEAD_ID"
else
  echo "❌ Form submission failed"
  echo "   Status: $STATUS"
  echo "   Message: $MESSAGE"
  echo ""
  echo "Possible causes:"
  echo "  - Email validation failed (must be valid format)"
  echo "  - Phone number validation failed (must be 10+ digits)"
  echo "  - Name validation failed (must be 2+ characters)"
  echo "  - Desk API key is invalid or expired"
  exit 1
fi

echo ""
echo "=========================================="
echo "Test completed successfully!"
echo "=========================================="
