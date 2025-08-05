# API Keys Setup Guide

This guide explains how to create separate API keys for your Emory Search application and behavioral analytics.

## 🔐 Why Separate API Keys?

- **Security**: Each key has only the permissions it needs
- **Monitoring**: Track usage separately for search vs analytics
- **Management**: Easier to rotate or revoke specific functionality
- **Compliance**: Better audit trails and access control

## 📋 Required Permissions

### Main Application API Key (Search Operations)
```json
{
  "indices": [
    {
      "names": ["search-emory-main-v2", "search-emory-news-v3", "search-emory-combined"],
      "privileges": ["read", "view_index_metadata"]
    }
  ],
  "cluster": ["monitor"]
}
```

### Analytics API Key (Behavioral Analytics)
```json
{
  "indices": [
    {
      "names": ["behavioral_analytics-*"],
      "privileges": ["write", "create_index", "auto_configure"]
    }
  ],
  "cluster": ["manage_behavioral_analytics", "monitor"]
}
```

## 🛠️ Creating API Keys

### Method 1: Elasticsearch Cloud Console

1. **Access Your Deployment**:
   - Go to [Elasticsearch Cloud Console](https://cloud.elastic.co)
   - Select your deployment
   - Click "Security" in the left sidebar

2. **Create Main Application API Key**:
   - Click "API Keys" → "Create API Key"
   - **Name**: `emory-search-main-app`
   - **Expiration**: Set appropriate expiration (e.g., 1 year)
   - **Permissions**: 
     ```json
     {
       "indices": [
         {
           "names": ["search-emory-main-v2", "search-emory-news-v3", "search-emory-combined"],
           "privileges": ["read", "view_index_metadata"]
         }
       ],
       "cluster": ["monitor"]
     }
     ```
   - Click "Create API Key"
   - **Save the key** - you won't see it again!

3. **Create Analytics API Key**:
   - Click "Create API Key" again
   - **Name**: `emory-search-analytics`
   - **Expiration**: Set appropriate expiration
   - **Permissions**:
     ```json
     {
       "indices": [
         {
           "names": ["behavioral_analytics-*"],
           "privileges": ["write", "create_index", "auto_configure"]
         }
       ],
       "cluster": ["manage_behavioral_analytics", "monitor"]
     }
     ```
   - Click "Create API Key"
   - **Save the key**

### Method 2: Kibana Dev Tools

1. **Open Kibana**: Go to your deployment's Kibana
2. **Open Dev Tools**: Click "Dev Tools" in the left sidebar
3. **Create Main Application API Key**:
   ```json
   POST /_security/api_key
   {
     "name": "emory-search-main-app",
     "expiration": "365d",
     "role_descriptors": {
       "emory_search_role": {
         "indices": [
           {
             "names": ["search-emory-main-v2", "search-emory-news-v3", "search-emory-combined"],
             "privileges": ["read", "view_index_metadata"]
           }
         ],
         "cluster": ["monitor"]
       }
     }
   }
   ```

4. **Create Analytics API Key**:
   ```json
   POST /_security/api_key
   {
     "name": "emory-search-analytics",
     "expiration": "365d",
     "role_descriptors": {
       "emory_analytics_role": {
         "indices": [
           {
             "names": ["behavioral_analytics-*"],
             "privileges": ["write", "create_index", "auto_configure"]
           }
         ],
         "cluster": ["manage_behavioral_analytics", "monitor"]
       }
     }
   }
   ```

### Method 3: REST API (Advanced)

Using curl or similar HTTP client:

```bash
# Create main application API key
curl -X POST "https://your-deployment.es.us-east-1.aws.cloud.es.io/_security/api_key" \
  -H "Authorization: ApiKey YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "emory-search-main-app",
    "expiration": "365d",
    "role_descriptors": {
      "emory_search_role": {
        "indices": [
          {
            "names": ["search-emory-main-v2", "search-emory-news-v3", "search-emory-combined"],
            "privileges": ["read", "view_index_metadata"]
          }
        ],
        "cluster": ["monitor"]
      }
    }
  }'
```

## 🔧 Configuration

### Update Your .env File

```env
# Main Application API Key (for search operations)
VITE_ELASTICSEARCH_API_KEY=your_main_app_api_key_here

# Analytics API Key (for behavioral analytics)
VITE_ANALYTICS_API_KEY=your_analytics_api_key_here

# Other settings...
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_DEBUG=true
VITE_ANALYTICS_COLLECTION_NAME=emory-news
```

### Fallback Behavior

The application will:
1. **First**: Try to use `VITE_ANALYTICS_API_KEY` for analytics
2. **Fallback**: Use `VITE_ELASTICSEARCH_API_KEY` if analytics key is not set
3. **Log**: Which key type is being used (visible in console when debug is enabled)

## 🔍 Verification

### Check API Key Permissions

In Kibana Dev Tools, verify your keys work:

```json
# Test main application key
GET /_security/_authenticate

# Test search access
GET /search-emory-main-v2/_search
{
  "size": 1
}

# Test analytics key (switch to analytics API key)
GET /_security/_authenticate

# Test analytics collection access
GET /_application/analytics/emory-news
```

### Monitor Usage

1. **Kibana Stack Monitoring**: View API key usage
2. **Elasticsearch Logs**: Check for authentication errors
3. **Application Console**: Look for the key type log message

## 🚨 Security Best Practices

### Key Management
- **Rotate Regularly**: Set reasonable expiration dates
- **Monitor Usage**: Watch for unusual patterns
- **Principle of Least Privilege**: Only grant necessary permissions
- **Secure Storage**: Never commit keys to version control

### Environment Variables
- **Production**: Use secure secret management
- **Development**: Use `.env` files (git-ignored)
- **Testing**: Use separate test keys with limited scope

### Access Control
- **Network Security**: Restrict access by IP if possible
- **Application Security**: Validate all inputs
- **Monitoring**: Set up alerts for failed authentication

## 🛠️ Troubleshooting

### Common Issues

**403 Forbidden Errors**:
- Check API key permissions match required operations
- Verify key hasn't expired
- Ensure correct index names in permissions

**Analytics Not Working**:
- Verify `VITE_ANALYTICS_API_KEY` has `manage_behavioral_analytics` permission
- Check collection name matches in both Kibana and environment
- Enable debug mode to see detailed error messages

**Search Errors**:
- Verify `VITE_ELASTICSEARCH_API_KEY` has read access to search indices
- Check index names match your actual indices
- Test key with simple search query

### Debug Commands

```bash
# Check which API key is being used (look in browser console)
npm run dev

# Test API key manually
curl -X GET "https://your-deployment/_security/_authenticate" \
  -H "Authorization: ApiKey YOUR_API_KEY"
```

## 📊 Monitoring

### Key Metrics to Track
- **Search Request Volume**: Monitor main API key usage
- **Analytics Event Volume**: Monitor analytics API key usage
- **Error Rates**: Watch for authentication failures
- **Performance**: Ensure keys don't impact response times

### Alerts to Set Up
- API key expiration warnings (30 days before)
- High error rates on either key
- Unusual usage patterns
- Failed authentication attempts

This setup provides better security, monitoring, and management of your Elasticsearch access while maintaining full functionality for both search and analytics operations.