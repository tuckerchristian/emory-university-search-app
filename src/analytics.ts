/**
 * Behavioral Analytics configuration and utilities for Emory Search
 * Based on Elastic Behavioral Analytics documentation
 */

import { createTracker } from '@elastic/behavioral-analytics-javascript-tracker';

// Analytics configuration interface
interface AnalyticsConfig {
  endpoint: string;
  collectionName: string;
  apiKey?: string;
  debug?: boolean;
}

// Initialize analytics tracker
let tracker: any = null;

export const initializeAnalytics = (config: AnalyticsConfig) => {
  try {
    console.log('🔧 Initializing analytics with config:', {
      endpoint: config.endpoint,
      collectionName: config.collectionName,
      hasApiKey: !!config.apiKey,
      debug: config.debug
    });

    tracker = createTracker({
      endpoint: config.endpoint,
      collectionName: config.collectionName,
      apiKey: config.apiKey,
      debug: config.debug || false,
    });

    console.log('🔍 Behavioral Analytics initialized for collection:', config.collectionName);
    
    return tracker;
  } catch (error) {
    console.error('❌ Failed to initialize Behavioral Analytics:', error);
    console.error('Config used:', { 
      endpoint: config.endpoint, 
      collectionName: config.collectionName, 
      hasApiKey: !!config.apiKey 
    });
    return null;
  }
};

// Track search events
export const trackSearch = (query: string, searchMode: 'text' | 'elser', selectedIndex: string, totalResults: number) => {
  if (!tracker) return;

  try {
    tracker.trackSearch({
      search: {
        query,
        results: {
          total_results: totalResults,
          items: []
        }
      }
    });

    console.log('📊 Search tracked:', { query, searchMode, selectedIndex, totalResults });
  } catch (error) {
    console.error('Failed to track search:', error);
  }
};

// Track search result clicks
export const trackClick = (
  query: string, 
  documentId: string, 
  documentUrl: string, 
  documentTitle: string,
  position: number,
  searchMode: 'text' | 'elser'
) => {
  if (!tracker) return;

  try {
    tracker.trackSearchClick({
      search: {
        query,
        results: {
          items: [{
            document: {
              id: documentId,
              index: 'emory-search'
            }
          }]
        }
      },
      document: {
        id: documentId,
        index: 'emory-search'
      }
    });

    console.log('🖱️ Click tracked:', { query, documentId, documentUrl, position, searchMode });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
};

// Check if analytics is initialized
export const isAnalyticsInitialized = () => !!tracker;