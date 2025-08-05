// Test script for the inference endpoint
// Run with: ELASTICSEARCH_API_KEY=your_key_here node test-inference-endpoint.js
// Or install node-fetch: npm install node-fetch && node test-inference-endpoint.js

const https = require('https');
const { URL } = require('url');

const ELASTICSEARCH_ENDPOINT = 'https://ae7515e9dbf14d91a98aa3e445f80c9e.us-east-2.aws.elastic-cloud.com';
const INFERENCE_ENDPOINT = 'openai-chat_completion-6j163wqoj8s';
const API_KEY = process.env.ELASTICSEARCH_API_KEY; // Set this in your environment

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData, body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testInferenceEndpoint() {
  if (!API_KEY) {
    console.error('❌ Please set ELASTICSEARCH_API_KEY environment variable');
    console.log('Example: ELASTICSEARCH_API_KEY=your_key_here node test-inference-endpoint.js');
    console.log('Or: export ELASTICSEARCH_API_KEY=your_key_here && node test-inference-endpoint.js');
    return;
  }

  const fullUrl = `${ELASTICSEARCH_ENDPOINT}/_inference/chat_completion/${INFERENCE_ENDPOINT}/_stream`;
  console.log('🧪 Testing inference endpoint...');
  console.log('📍 Endpoint:', fullUrl);

  const url = new URL(fullUrl);
  const requestData = JSON.stringify({
    messages: [
      {
        role: "user",
        content: "Test: What is Emory University? Please provide a brief summary."
      }
    ]
  });

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Authorization': `ApiKey ${API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  try {
    const response = await makeRequest(url, options, requestData);
    
    console.log('📊 Response status:', response.status);

    if (response.status !== 200) {
      console.error('❌ Error response:', response.body);
      return;
    }

    if (response.data) {
      console.log('✅ Success! Response structure:');
      console.log('📋 Keys:', Object.keys(response.data));
      console.log('⚠️ This appears to be a single JSON response, but streaming should return SSE format');
      
      if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        console.log('🤖 AI Response:', response.data.choices[0].message.content);
        console.log('✅ Endpoint is working correctly!');
      } else {
        console.log('⚠️ Unexpected response format:', JSON.stringify(response.data, null, 2));
      }
    } else {
      // This is expected for streaming - parse the SSE format
      console.log('📡 Streaming response received (SSE format):');
      
      // Extract content from streaming response
      const lines = response.body.split('\n');
      let extractedContent = '';
      
      for (const line of lines) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = line.substring(6);
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              extractedContent += content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
      
      if (extractedContent) {
        console.log('🤖 Extracted AI Response:');
        console.log(extractedContent);
        console.log('');
        console.log('✅ Streaming endpoint is working correctly!');
        console.log('📝 Total characters:', extractedContent.length);
      } else {
        console.log('⚠️ Could not extract content from streaming response');
        console.log('Raw response preview:', response.body.substring(0, 500) + '...');
      }
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testInferenceEndpoint();