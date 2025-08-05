/**
 * Elastic Real User Monitoring (RUM) configuration and initialization
 * Based on Elastic APM RUM documentation
 */

import { init as initApm } from '@elastic/apm-rum';

// RUM agent instance
let apm: any = null;

export const initializeRUM = () => {
  // Check if RUM is enabled
  const isEnabled = import.meta.env.VITE_ELASTIC_RUM_ENABLED === 'true';
  const serverUrl = import.meta.env.VITE_ELASTIC_RUM_SERVER_URL;
  
  console.log('🔍 RUM Initialization Check:', {
    enabled: isEnabled,
    hasServerUrl: !!serverUrl,
    environment: import.meta.env.VITE_ELASTIC_RUM_ENVIRONMENT || 'not-set',
    isDev: import.meta.env.DEV
  });
  
  if (!isEnabled) {
    console.log('📊 Elastic RUM is disabled via VITE_ELASTIC_RUM_ENABLED');
    return null;
  }
  
  if (!serverUrl) {
    console.log('📊 Elastic RUM server URL not configured, skipping initialization');
    return null;
  }
  
  // Additional safety check - don't initialize in development unless explicitly requested
  if (import.meta.env.DEV && import.meta.env.VITE_ELASTIC_RUM_ENVIRONMENT !== 'production') {
    console.log('📊 Development mode: Skipping RUM initialization for safety');
    return null;
  }

  try {
    console.log('🚀 Initializing Elastic RUM...');
    
    // Minimal, safe RUM configuration to avoid trace ID issues
    const config = {
      // Required service name - using your configuration
      serviceName: import.meta.env.VITE_ELASTIC_RUM_SERVICE_NAME || 'emory-search-frontend',
      
      // APM Server URL - using your configuration
      serverUrl: import.meta.env.VITE_ELASTIC_RUM_SERVER_URL,
      
      // Service version for deployment tracking
      serviceVersion: import.meta.env.VITE_ELASTIC_RUM_SERVICE_VERSION || '1.0.0',
      
      // Environment (development, staging, production)
      environment: import.meta.env.VITE_ELASTIC_RUM_ENVIRONMENT || 'development',
      
      // Minimal configuration to avoid trace ID issues
      instrument: false, // Disable all automatic instrumentation
      
      // Completely disable distributed tracing to avoid trace ID issues
      distributedTracing: false,
      distributedTracingOrigins: [],
      
      // Disable all page load tracking
      pageLoadTraceId: false,
      pageLoadSampled: false,
      capturePageLoadSpan: false,
      
      // Disable all automatic instrumentations
      disableInstrumentations: ['*'], // Disable everything
      
      // Very conservative sampling
      transactionSampleRate: 0.01, // 1%
      
      // Minimal logging
      logLevel: 'error',
      payloadLogLevel: 'off',
      
      // Only capture manual transactions
      ignoreTransactions: [],
      
      // Disable error capture to avoid issues
      captureErrors: false,
      errorThrottleLimit: 0,
      errorThrottleInterval: 0
    };

    console.log('📊 RUM Configuration:', {
      serviceName: config.serviceName,
      serverUrl: config.serverUrl ? '✅ Set' : '❌ Missing',
      environment: config.environment,
      serviceVersion: config.serviceVersion,
      distributedTracingOrigins: config.distributedTracingOrigins
    });

    // Initialize the RUM agent
    apm = initApm(config);
    
    if (apm) {
      console.log('✅ Elastic RUM initialized successfully');
      
      // Set user context if available (optional)
      try {
        apm.setUserContext({
          id: 'anonymous',
          username: 'anonymous-user'
        });
      } catch (e) {
        console.warn('Failed to set user context:', e);
      }
      
      // Set custom context for the application
      try {
        apm.setCustomContext({
          applicationName: 'Emory University AI Search',
          searchMode: 'ELSER',
          features: {
            aiSummary: import.meta.env.VITE_AI_SUMMARY_ENABLED === 'true',
            behavioralAnalytics: import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
          }
        });
      } catch (e) {
        console.warn('Failed to set custom context:', e);
      }
      
      return apm;
    } else {
      console.error('❌ Failed to initialize Elastic RUM');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error initializing Elastic RUM:', error);
    return null;
  }
};

// Get the RUM agent instance
export const getRUMAgent = () => apm;

// Check if RUM is initialized
export const isRUMInitialized = () => !!apm;

// Custom transaction tracking for search operations
export const trackSearchTransaction = (query: string, searchMode: string) => {
  if (!apm || !isRUMInitialized()) return null;
  
  try {
    // Create a safe transaction name (limit length and sanitize)
    const sanitizedQuery = query.substring(0, 50).replace(/[^\w\s-]/g, '');
    const transactionName = `Search: ${sanitizedQuery || 'empty-query'}`;
    
    const transaction = apm.startTransaction(transactionName, 'search');
    if (transaction && transaction.addLabels) {
      // Ensure all label values are safe strings or numbers
      transaction.addLabels({
        searchMode: String(searchMode),
        queryLength: Number(query.length),
        hasQuery: Boolean(query.trim())
      });
    }
    return transaction;
  } catch (error) {
    console.warn('Failed to track search transaction:', error);
    return null;
  }
};

// Custom span tracking for AI summary generation
export const trackAISummarySpan = (query: string, transactionOrSpan?: any) => {
  if (!apm || !isRUMInitialized()) return null;
  
  try {
    const span = apm.startSpan('AI Summary Generation', 'ai-processing', transactionOrSpan);
    if (span && span.addLabels) {
      // Ensure all label values are safe
      span.addLabels({
        summaryType: String('ELSER'),
        queryLength: Number(query.length)
      });
    }
    return span;
  } catch (error) {
    console.warn('Failed to track AI summary span:', error);
    return null;
  }
};

// Track custom errors
export const trackRUMError = (error: Error, context?: Record<string, any>) => {
  if (!apm || !isRUMInitialized()) return;
  
  try {
    if (apm.captureError) {
      apm.captureError(error, {
        custom: context || {}
      });
    }
  } catch (e) {
    console.warn('Failed to track RUM error:', e);
  }
};

// Track page views manually (for SPA routing)
export const trackPageView = (name?: string) => {
  if (!apm || !isRUMInitialized()) return;
  
  try {
    if (apm.startTransaction) {
      apm.startTransaction(name || window.location.pathname, 'page-load');
    }
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};