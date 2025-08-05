# Elastic Real User Monitoring (RUM) Setup

This document provides comprehensive setup instructions for Elastic RUM monitoring in the Emory Search application.

## 🎯 Overview

Elastic RUM (Real User Monitoring) has been integrated to monitor:
- **Frontend Performance**: Page loads, Core Web Vitals, resource loading
- **User Interactions**: Search queries, clicks, navigation patterns  
- **Search Performance**: Elasticsearch query response times
- **AI Summary Performance**: AI generation latency and success rates
- **Error Tracking**: JavaScript errors and API failures

## 📋 Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Elastic RUM Configuration
VITE_ELASTIC_RUM_ENABLED=true
VITE_ELASTIC_RUM_SERVER_URL=https://f52d24ebc8934f7b836364719f22e258.apm.us-east-2.aws.elastic-cloud.com:443
VITE_ELASTIC_RUM_SERVICE_NAME=emory-search-frontend
VITE_ELASTIC_RUM_SERVICE_VERSION=1.0.0
VITE_ELASTIC_RUM_ENVIRONMENT=production
```

### Configuration Values

| Setting | Value | Description |
|---------|-------|-------------|
| `serviceName` | `emory-search-frontend` | Identifies your service in APM |
| `serverUrl` | `https://f52d24ebc8934f7b836364719f22e258.apm.us-east-2.aws.elastic-cloud.com:443` | Your Elastic APM server endpoint |
| `serviceVersion` | `1.0.0` | Version for deployment tracking |
| `environment` | `production` | Environment identifier |

## 🚀 Implementation Details

### Architecture

```
Browser (React App)
    ↓ RUM Agent
Elastic APM Server
    ↓ Data Pipeline  
Elasticsearch Cluster
    ↓ Visualization
Kibana APM UI
```

### Key Components

1. **`src/rum.ts`** - RUM configuration and utilities
2. **`src/main.tsx`** - RUM initialization (first import)
3. **`src/HybridSearchConnector.ts`** - Search transaction tracking
4. **`src/AISummary.tsx`** - AI summary span tracking

### Monitored Operations

#### Search Transactions
- **Transaction Name**: `Search: {query}`
- **Type**: `search`
- **Labels**: `searchMode`, `queryLength`, `totalResults`, `targetIndex`

#### AI Summary Spans  
- **Span Name**: `AI Summary Generation`
- **Type**: `ai-processing`
- **Labels**: `summaryLength`, `sourcesCount`, `success`

#### Error Tracking
- **Search Errors**: Elasticsearch API failures
- **AI Summary Errors**: Inference API failures
- **JavaScript Errors**: Automatic capture

## 📊 Metrics Collected

### Performance Metrics
- **Page Load Time**: First contentful paint, largest contentful paint
- **Core Web Vitals**: CLS, FID, LCP scores
- **Search Latency**: Time from query to results display
- **AI Summary Generation Time**: End-to-end AI processing duration

### User Experience Metrics
- **Search Success Rate**: Percentage of successful searches
- **AI Summary Success Rate**: Percentage of successful AI generations
- **Error Rates**: JavaScript and API error frequencies
- **User Journey**: Search → Results → Summary flow

### Business Metrics
- **Search Volume**: Number of searches per time period
- **Popular Queries**: Most frequently searched terms
- **Index Usage**: Distribution across main/news/combined indices
- **Feature Adoption**: AI summary usage rates

## 🔧 Customization

### Adding Custom Transactions

```typescript
import { getRUMAgent } from './rum';

const apm = getRUMAgent();
if (apm) {
  const transaction = apm.startTransaction('Custom Operation', 'custom');
  // ... perform operation
  transaction.end();
}
```

### Adding Custom Spans

```typescript
import { getRUMAgent } from './rum';

const apm = getRUMAgent();
if (apm) {
  const span = apm.startSpan('Custom Process', 'processing');
  span.addLabels({ customLabel: 'value' });
  // ... perform process
  span.end();
}
```

### Custom Error Tracking

```typescript
import { trackRUMError } from './rum';

try {
  // risky operation
} catch (error) {
  trackRUMError(error, { 
    context: 'additional context',
    userId: 'user123' 
  });
}
```

## 📈 Viewing Data in Kibana

### Access APM UI
1. Navigate to your Kibana instance
2. Go to **Observability** → **APM**
3. Select the `emory-search-frontend` service

### Key Dashboards
- **Service Overview**: Overall performance and error rates
- **Transactions**: Search performance breakdown
- **Dependencies**: Elasticsearch API performance
- **Errors**: Error tracking and debugging

### Useful Queries

**Top Search Queries:**
```
transaction.name:"Search: *" AND labels.searchMode:"elser"
```

**AI Summary Performance:**
```
span.name:"AI Summary Generation" AND labels.success:true
```

**Error Analysis:**
```
error.exception.type:* AND service.name:"emory-search-frontend"
```

## 🛠️ Troubleshooting

### Common Issues

**RUM Not Initializing:**
- Check `VITE_ELASTIC_RUM_ENABLED=true`
- Verify `VITE_ELASTIC_RUM_SERVER_URL` is correct
- Check browser console for initialization errors

**No Data in Kibana:**
- Verify APM server URL is accessible
- Check network requests in browser dev tools
- Ensure service name matches in configuration

**400 Bad Request / Trace ID Errors:**
- The RUM configuration has been optimized to prevent trace ID format issues
- All automatic instrumentation is disabled to avoid malformed trace data
- Only manual transactions are captured with proper data type validation
- If issues persist, disable RUM with `VITE_ELASTIC_RUM_ENABLED=false`

**High Error Rates:**
- Review error details in APM UI
- Check Elasticsearch connectivity
- Verify AI inference endpoint availability

### Debug Mode

Enable debug logging in development:

```env
# Development only
VITE_ELASTIC_RUM_ENVIRONMENT=development
```

This will show detailed RUM logs in the browser console.

## 🔒 Security Considerations

### Data Privacy
- RUM collects performance data, not sensitive user content
- Search queries are tracked for performance analysis
- No personal user information is collected by default

### Network Security
- All data sent over HTTPS to Elastic APM server
- APM server endpoint should be properly secured
- Consider IP allowlisting for production deployments

## 📚 Resources

- [Elastic RUM Documentation](https://www.elastic.co/guide/en/apm/agent/rum-js/current/index.html)
- [APM Best Practices](https://www.elastic.co/guide/en/observability/current/apm-best-practices.html)
- [Kibana APM UI Guide](https://www.elastic.co/guide/en/kibana/current/apm-ui.html)

## 🚀 Next Steps

1. **Set up your `.env` file** with the provided configuration
2. **Deploy the application** with RUM enabled
3. **Monitor data flow** in Kibana APM UI
4. **Set up alerts** for performance thresholds
5. **Create custom dashboards** for business metrics

Your Emory Search application now has comprehensive monitoring capabilities! 🎉