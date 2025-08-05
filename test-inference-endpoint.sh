#!/bin/bash

# Test script for the inference endpoint using curl
# Usage: ./test-inference-endpoint.sh your_api_key_here
# Or: ELASTICSEARCH_API_KEY=your_key ./test-inference-endpoint.sh

ELASTICSEARCH_ENDPOINT="https://ae7515e9dbf14d91a98aa3e445f80c9e.us-east-2.aws.elastic-cloud.com"
INFERENCE_ENDPOINT="openai-chat_completion-6j163wqoj8s"

# Get API key from parameter or environment
if [ -n "$1" ]; then
    API_KEY="$1"
elif [ -n "$ELASTICSEARCH_API_KEY" ]; then
    API_KEY="$ELASTICSEARCH_API_KEY"
else
    echo "❌ Please provide API key as parameter or set ELASTICSEARCH_API_KEY environment variable"
    echo "Usage: ./test-inference-endpoint.sh your_api_key_here"
    echo "Or: ELASTICSEARCH_API_KEY=your_key ./test-inference-endpoint.sh"
    exit 1
fi

FULL_URL="${ELASTICSEARCH_ENDPOINT}/_inference/chat_completion/${INFERENCE_ENDPOINT}/_stream"

echo "🧪 Testing streaming inference endpoint..."
echo "📍 Endpoint: $FULL_URL"
echo ""

# Make the request (streaming)
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST "$FULL_URL" \
  -H "Authorization: ApiKey $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Test: What is Emory University? Please provide a brief summary."
      }
    ]
  }')

# Extract HTTP status and body
http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

echo "📊 Response status: $http_code"
echo ""

if [ "$http_code" -eq 200 ]; then
    echo "✅ Success! Streaming response received:"
    echo "$body"
    echo ""
    
    # Try to extract content from streaming response
    content=$(echo "$body" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$content" ]; then
        echo "🤖 AI Response preview: $content..."
        echo "✅ Streaming endpoint is working correctly!"
    else
        echo "⚠️ Received streaming data but couldn't extract content"
        echo "✅ Endpoint responded successfully (streaming format)"
    fi
else
    echo "❌ Error response:"
    echo "$body"
    
    if [ "$http_code" -eq 403 ]; then
        echo ""
        echo "💡 403 Forbidden suggests:"
        echo "   - Check API key has 'manage_inference' permission"
        echo "   - Verify endpoint name is correct"
        echo "   - Ensure endpoint exists in your cluster"
    elif [ "$http_code" -eq 404 ]; then
        echo ""
        echo "💡 404 Not Found suggests:"
        echo "   - Endpoint name might be wrong"
        echo "   - Check: GET _inference/chat_completion in Kibana"
    fi
fi