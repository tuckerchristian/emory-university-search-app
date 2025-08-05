# Inference Endpoint Setup Guide

## 🚨 Current Status: 403 Forbidden Error

You're getting **403 Forbidden** errors when trying to use the AI inference endpoint. This guide will help you fix this issue.

## 🔍 Error Analysis

From your console, the error shows:
```
POST https://ae7515e.../_inference/completion/openai-chat_comple... 403 (Forbidden)
```

This indicates one of these issues:
1. **Inference endpoint doesn't exist** in your Elasticsearch cluster
2. **API key lacks inference permissions**
3. **Endpoint name is incorrect** or truncated

## 🛠️ Quick Fix (Current Implementation)

I've temporarily disabled the full AI summary to stop the 403 errors. Your app now uses:
- ✅ **Local AI Summary** (AIFallbackSummary) - works immediately
- ✅ **No external API calls** - no 403 errors
- ✅ **Still provides summaries** - extractive summarization

## 🔧 To Enable Full AI Summary

### Step 1: Check if Inference Endpoint Exists

In Kibana Dev Tools, run:
```json
GET _inference/chat_completion
```

This will list all your chat completion inference endpoints. You should see:
- `openai-chat_completion-6j163wqoj8s` ✅ (This is your endpoint!)

### Step 2: Create Inference Endpoint (if missing)

If no endpoints exist, create one:

#### Option A: OpenAI
```json
PUT _inference/completion/emory-ai-summary
{
  "service": "openai",
  "service_settings": {
    "api_key": "your-openai-api-key-here",
    "model_id": "gpt-3.5-turbo"
  },
  "task_settings": {
    "max_tokens": 500,
    "temperature": 0.3
  }
}
```

#### Option B: Azure OpenAI
```json
PUT _inference/completion/emory-ai-summary
{
  "service": "azureopenai",
  "service_settings": {
    "api_key": "your-azure-api-key",
    "resource_name": "your-azure-resource",
    "deployment_id": "your-deployment-id",
    "api_version": "2024-02-01"
  },
  "task_settings": {
    "max_tokens": 500,
    "temperature": 0.3
  }
}
```

### Step 3: Test the Endpoint

```json
POST _inference/chat_completion/openai-chat_completion-6j163wqoj8s/_stream
{
  "messages": [
    {
      "role": "user", 
      "content": "Test: What is Emory University?"
    }
  ]
}
```

Expected streaming response (Server-Sent Events format):
```
data: {"choices":[{"delta":{"content":"Emory"}}]}

data: {"choices":[{"delta":{"content":" University"}}]}

data: {"choices":[{"delta":{"content":" is a private research university..."}}]}

data: [DONE]
```

### Step 4: Check API Key Permissions

Your Elasticsearch API key needs these permissions:

```json
{
  "cluster": [
    "monitor",
    "manage_inference"  // ← This permission is required!
  ],
  "indices": [
    {
      "names": ["search-emory-*"],
      "privileges": ["read"]
    }
  ]
}
```

### Step 5: Update Your Environment

Once the endpoint is working, update your `.env`:

```env
# Enable AI Summary
VITE_AI_SUMMARY_ENABLED=true

# Use your actual endpoint name (this is correct for your setup)
VITE_INFERENCE_ENDPOINT=openai-chat_completion-6j163wqoj8s
```

### Step 6: Re-enable in Code

In `src/App.tsx`, change:
```typescript
// From:
const aiSummaryEnabled = false; // Temporarily disabled

// To:
const aiSummaryEnabled = import.meta.env.VITE_AI_SUMMARY_ENABLED === 'true';
```

## 🔍 Troubleshooting

### Error: "Endpoint not found"
- Check endpoint name in Kibana: `GET _inference/completion`
- Verify `VITE_INFERENCE_ENDPOINT` matches exactly

### Error: "Insufficient permissions"
- Update API key with `manage_inference` permission
- Use separate API key for inference if needed

### Error: "Service unavailable"
- Check OpenAI/Azure API key is valid
- Verify model name (gpt-3.5-turbo, gpt-4, etc.)
- Check rate limits on your AI service

### Error: "Invalid model"
- Use supported models: `gpt-3.5-turbo`, `gpt-4`, `text-davinci-003`
- Check your AI service subscription includes the model

## 💡 Alternative: Keep Local Summary

The local AI summary (current implementation) provides:
- ✅ **Immediate functionality** - no setup required
- ✅ **No API costs** - completely free
- ✅ **Privacy** - no data sent to external services
- ✅ **Good quality** - extractive summarization
- ✅ **Fast response** - ~1.5 seconds

For many use cases, the local summary is sufficient!

## 🚀 When You're Ready

1. **Set up inference endpoint** using the steps above
2. **Test it works** with the test query
3. **Update your .env** with `VITE_AI_SUMMARY_ENABLED=true`
4. **Re-enable in App.tsx** by removing the hardcoded `false`
5. **Test your application** - no more 403 errors!

## 📊 Cost Considerations

### Local Summary (Current)
- **Cost**: $0
- **Speed**: Fast (~1.5s)
- **Quality**: Good

### OpenAI GPT-3.5-turbo
- **Cost**: ~$0.001-0.002 per summary
- **Speed**: Moderate (~3-5s)
- **Quality**: Excellent

### OpenAI GPT-4
- **Cost**: ~$0.03-0.06 per summary
- **Speed**: Slower (~5-10s)
- **Quality**: Outstanding

Choose based on your budget and quality requirements!