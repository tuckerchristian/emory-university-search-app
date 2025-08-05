# Behavioral Analytics Setup Guide

This guide explains how to set up and use Behavioral Analytics in your Emory Search application.

## What is Behavioral Analytics?

Based on the [Elastic Behavioral Analytics documentation](https://www.elastic.co/guide/en/elasticsearch/reference/8.18/behavioral-analytics-overview.html), Behavioral Analytics is an analytics event collection platform that helps you:

- Analyze users' searching and clicking behavior
- Improve the relevance of your search results
- Identify gaps in your content
- Track user engagement patterns

## Features Implemented

✅ **Search Tracking**: Automatically tracks all search queries with metadata
✅ **Click Tracking**: Tracks when users click on search results
✅ **Page View Tracking**: Tracks page visits and navigation
✅ **Custom Properties**: Includes search mode, index selection, and Emory-specific data
✅ **GDPR Compliant**: No personal data collection, only anonymous session tracking

## Setup Instructions

### 1. Create Analytics Collection in Kibana

First, you need to create a Behavioral Analytics collection in your Elasticsearch deployment:

1. **Access Kibana**: Go to your Elasticsearch Cloud deployment
2. **Navigate to Analytics**: Go to `Analytics` > `Behavioral Analytics`
3. **Create Collection**: Click "Create collection"
4. **Name**: Use `emory-search-analytics` (or your preferred name)
5. **Save**: Your collection is now ready

### 2. Configure Environment Variables

Update your `.env` file with the analytics configuration:

```env
# Main Application API Key (for search operations)
VITE_ELASTICSEARCH_API_KEY=your_main_app_api_key_here

# Analytics API Key (for behavioral analytics) - Optional but recommended
VITE_ANALYTICS_API_KEY=your_analytics_api_key_here

# Behavioral Analytics Configuration
VITE_ANALYTICS_COLLECTION_NAME=emory-search-analytics
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_DEBUG=false
```

**Note**: If you don't provide a separate `VITE_ANALYTICS_API_KEY`, the system will use the main `VITE_ELASTICSEARCH_API_KEY` for analytics. For better security, create separate API keys as described in `API_KEYS_SETUP.md`.

### 3. Verify Installation

The analytics package has been installed and configured:

```bash
npm install @elastic/behavioral-analytics-javascript-tracker
```

## What Gets Tracked

### Search Events
- **Query**: The search term entered by the user
- **Search Mode**: Text search or ELSER semantic search
- **Selected Index**: Which index was searched (Both/Main/News)
- **Total Results**: Number of results returned
- **Timestamp**: When the search occurred

### Click Events
- **Document URL**: The clicked result URL
- **Document Title**: The title of the clicked result
- **Click Position**: Position in the search results (1, 2, 3, etc.)
- **Search Context**: The original query that led to the click
- **Search Mode**: Which search mode was used

### Page View Events
- **Page URL**: Current page URL
- **Page Title**: Document title
- **Referrer**: Previous page
- **Session Info**: Anonymous session tracking

## Privacy & GDPR Compliance

The implementation is fully GDPR compliant:

- ✅ **No Personal Data**: No IP addresses, names, or personal information collected
- ✅ **Anonymous Sessions**: Uses anonymous user and session tokens
- ✅ **Cookie-Based**: `EA_UID` (24 hours) and `EA_SID` (30 minutes) cookies only
- ✅ **Transparent**: All tracking is logged to console in debug mode

## Analytics Data Structure

### Search Event Example
```json
{
  "search": {
    "query": "emory university admissions",
    "results": {
      "total_results": 42
    }
  },
  "custom_properties": {
    "search_mode": "elser",
    "selected_index": "both",
    "source": "emory_search_ui"
  }
}
```

### Click Event Example
```json
{
  "search": {
    "query": "emory university admissions"
  },
  "document": {
    "id": "https://emory.edu/admissions"
  },
  "custom_properties": {
    "document_url": "https://emory.edu/admissions",
    "document_title": "Emory University Admissions",
    "click_position": 1,
    "search_mode": "elser",
    "source": "emory_search_ui"
  }
}
```

## Viewing Analytics Data

### In Kibana
1. Go to `Analytics` > `Behavioral Analytics`
2. Select your collection (`emory-search-analytics`)
3. View dashboards showing:
   - Search volume and trends
   - Popular queries
   - Click-through rates
   - User journey patterns

### Custom Dashboards
The analytics data is stored in Elasticsearch indices, so you can create custom visualizations:

- **Search Patterns**: Most popular search terms
- **Content Gaps**: Searches with no clicks
- **Search Mode Performance**: Text vs ELSER effectiveness
- **Index Usage**: Which content sources are most popular

## Debugging

### Enable Debug Mode
Set `VITE_ANALYTICS_DEBUG=true` in your `.env` file to see detailed console logs.

### Console Output
When debug mode is enabled, you'll see:
```
🔍 Behavioral Analytics initialized for collection: emory-search-analytics
📊 Search tracked: { query: "admissions", searchMode: "text", selectedIndex: "both", totalResults: 15 }
🖱️ Click tracked: { query: "admissions", documentId: "...", documentUrl: "...", position: 1 }
📄 Page view tracked: { pageUrl: "...", pageTitle: "..." }
```

### Troubleshooting

**Analytics not initializing?**
- Check that `VITE_ANALYTICS_ENABLED=true`
- Verify `VITE_ANALYTICS_COLLECTION_NAME` matches your Kibana collection
- Ensure your API key has analytics permissions

**Events not appearing in Kibana?**
- Wait a few minutes for data to process
- Check browser console for error messages
- Verify CORS settings allow analytics requests

**Performance concerns?**
- Analytics events are sent asynchronously
- Minimal impact on search performance
- Events are batched for efficiency

## Advanced Usage

### Custom Event Tracking
You can track custom events using the analytics utilities:

```typescript
import { trackCustomEvent } from './analytics';

// Track custom user interactions
trackCustomEvent('filter_applied', {
  filter_type: 'source',
  filter_value: 'emory.edu'
});
```

### Analytics API Access
Access the raw analytics tracker for advanced features:

```typescript
import { getAnalyticsTracker } from './analytics';

const tracker = getAnalyticsTracker();
if (tracker) {
  // Use advanced tracker features
}
```

## Benefits for Emory

### Content Strategy
- **Popular Topics**: See what users search for most
- **Content Gaps**: Identify missing content areas
- **Search Success**: Measure search satisfaction

### Technical Insights
- **Search Mode Effectiveness**: Compare text vs semantic search
- **Performance Monitoring**: Track search response times
- **User Experience**: Understand navigation patterns

### Continuous Improvement
- **A/B Testing**: Test different search configurations
- **Content Optimization**: Improve based on user behavior
- **Search Tuning**: Refine search algorithms based on real usage

## Next Steps

1. **Monitor Initial Data**: Let the system collect data for a few days
2. **Create Dashboards**: Build custom Kibana dashboards for your needs
3. **Analyze Patterns**: Look for trends in search behavior
4. **Optimize Content**: Use insights to improve your content strategy
5. **Refine Search**: Adjust search algorithms based on user behavior

The Behavioral Analytics implementation provides valuable insights into how users interact with your search system, helping you continuously improve the Emory University search experience.