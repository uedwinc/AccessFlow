#!/bin/bash

echo "Testing AccessFlow Backend..."
echo ""

echo "1. Checking if backend is running..."
if curl -s http://localhost:3001/api/analyze > /dev/null 2>&1; then
    echo "✓ Backend is responding"
else
    echo "✗ Backend is NOT responding on port 3001"
    echo "  Please start backend with: npm run dev:backend"
    exit 1
fi

echo ""
echo "2. Testing API endpoint..."
response=$(curl -s -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Software Engineer position requiring React and TypeScript experience.",
    "resumeText": "Experienced developer with 5 years in web development using React and TypeScript.",
    "preferences": {
      "workStyle": "Remote work preferred",
      "accommodations": "",
      "disclosureFlag": false,
      "includeInterviewPrep": true
    }
  }')

if echo "$response" | grep -q "sessionId"; then
    echo "✓ API endpoint working correctly"
    echo ""
    echo "Sample response:"
    echo "$response" | head -c 200
    echo "..."
else
    echo "✗ API endpoint returned error:"
    echo "$response"
    exit 1
fi

echo ""
echo "✓ All tests passed! Backend is working correctly."
