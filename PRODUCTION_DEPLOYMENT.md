# Production Deployment Guide

## Current Setup (Development)

You're currently using `ElasticsearchAPIConnector` which is **fine for development** but **not recommended for production** because it exposes your API key to the browser.

## Production Setup

For production, you should use `ApiProxyConnector` which keeps your API key secure on the server side.

### Option 1: Use ApiProxyConnector (Recommended)

1. **Switch to the production version:**
   ```bash
   # Rename the production file to be the main app
   mv src/AppProduction.tsx src/App.tsx
   ```

2. **Set up a proxy server** (like the one in `proxy-server.js`) to handle API requests securely.

3. **Update your deployment** to use the proxy server.

### Option 2: Use SearchApplicationClient (Alternative)

If you prefer to use Search Applications, you can switch back to `SearchApplicationClient`:

```typescript
import SearchApplicationClient from '@elastic/search-application-client';

const request = SearchApplicationClient(
  'emory-uni-info',
  'https://ae7515e9dbf14d91a98aa3e445f80c9e.us-east-2.aws.elastic-cloud.com:443',
  'YOUR_API_KEY',
  {}
);
```

## Security Considerations

### Development (Current)
- ✅ **ElasticsearchAPIConnector** - API key exposed to browser
- ✅ **SearchApplicationClient** - API key exposed to browser
- ⚠️ **Only use for localhost development**

### Production (Recommended)
- ✅ **ApiProxyConnector** - API key stays on server
- ✅ **SearchApplicationClient** with server-side proxy
- ✅ **Secure for public deployment**

## Environment Variables

For production, use environment variables:

```env
VITE_ELASTICSEARCH_ENDPOINT=https://your-deployment.es.us-east-1.aws.cloud.es.io
VITE_ELASTICSEARCH_API_KEY=your_api_key_here
VITE_SEARCH_APPLICATION_NAME=emory-uni-info
```

## Deployment Steps

1. **Choose your approach:**
   - ApiProxyConnector (most secure)
   - SearchApplicationClient (simpler)

2. **Set up environment variables** in your hosting platform

3. **Configure CORS** for your production domain

4. **Test thoroughly** before going live

## Current Status

- ✅ **Development**: Using ElasticsearchAPIConnector (working)
- 🔄 **Production**: Ready to switch to ApiProxyConnector when needed
- ✅ **API Key**: Valid and working
- ✅ **Search**: Functioning correctly

## Next Steps

1. **Test the current setup** on localhost
2. **When ready for production**, switch to ApiProxyConnector
3. **Deploy with proper environment variables**
4. **Monitor and optimize performance** 