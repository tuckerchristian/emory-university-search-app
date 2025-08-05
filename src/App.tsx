import React, { useState, useRef, useEffect } from 'react';
import { HybridSearchConnector } from './HybridSearchConnector';
import {
  ErrorBoundary,
  SearchProvider,
  PagingInfo,
  ResultsPerPage,
  Paging,
  WithSearch
} from '@elastic/react-search-ui';
import ElserSearchBox from './ElserSearchBox';
import IndexSelector from './IndexSelector';
import AnalyticsResults from './AnalyticsResults';
import AISummary from './AISummary';
import AIFallbackSummary from './AIFallbackSummary';
import {
  Layout
} from '@elastic/react-search-ui-views';
import '@elastic/react-search-ui-views/lib/styles/styles.css';
import { SearchDriverOptions } from '@elastic/search-ui';
import { initializeAnalytics } from './analytics';
import './App.css';

// Initialize the hybrid search connector
const connector = new HybridSearchConnector({
  host: import.meta.env.VITE_ELASTICSEARCH_ENDPOINT || 'https://ae7515e9dbf14d91a98aa3e445f80c9e.us-east-2.aws.elastic-cloud.com:443',
  apiKey: import.meta.env.VITE_ELASTICSEARCH_API_KEY || '',
  index: 'search-emory-combined'
});

const config: SearchDriverOptions = {
  alwaysSearchOnInitialLoad: true,
  apiConnector: connector,
  hasA11yNotifications: true,
  searchQuery: {
    result_fields: {
      title: { raw: {} },
      body_content: { raw: {} },
      url: { raw: {} },
      meta_keywords: { raw: {} },
      last_crawled_at: { raw: {} },
      domains: { raw: {} },
      url_host: { raw: {} },
      _index: { raw: {} },
      
    },
    search_fields: {
      title: {},
      body_content: {}
    },
    
  },

};

  function App() {
    // Fixed to ELSER mode only - always use 'elser'
    const [selectedIndex, setSelectedIndex] = useState<'both' | 'main' | 'news'>('both');
    const connectorRef = useRef(connector);
    const [searchKey, setSearchKey] = useState(0); // Force re-render when index changes

    // Set connector to ELSER mode
    useEffect(() => {
      connectorRef.current.setSearchMode('elser');
    }, []);

    // Log AI Summary configuration - now using correct chat_completion endpoint
    const aiSummaryEnabled = import.meta.env.VITE_AI_SUMMARY_ENABLED === 'true';
    const inferenceEndpoint = import.meta.env.VITE_INFERENCE_ENDPOINT;
    
    useEffect(() => {
      console.log('🤖 AI Summary Configuration:', {
        enabled: aiSummaryEnabled,
        inferenceEndpoint: inferenceEndpoint || 'openai-chat_completion-6j163wqoj8s (default)',
        component: aiSummaryEnabled ? 'AISummary (Full AI with Chat Completion)' : 'AIFallbackSummary (Local)',
        searchMode: 'ELSER (AI-Powered Search Only)',
        apiType: 'chat_completion (OpenAI format)'
      });
    }, [aiSummaryEnabled, inferenceEndpoint]);

  // Initialize Behavioral Analytics
  useEffect(() => {
    const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    const collectionName = import.meta.env.VITE_ANALYTICS_COLLECTION_NAME;
    const analyticsDebug = import.meta.env.VITE_ANALYTICS_DEBUG === 'true';

    if (analyticsEnabled && collectionName) {
      const analyticsApiKey = import.meta.env.VITE_ANALYTICS_API_KEY || import.meta.env.VITE_ELASTICSEARCH_API_KEY;
      const endpoint = import.meta.env.VITE_ELASTICSEARCH_ENDPOINT;
      
      console.log(`🔑 Using ${import.meta.env.VITE_ANALYTICS_API_KEY ? 'dedicated analytics' : 'main application'} API key for analytics`);
      
      // Debug mode logging
      if (analyticsDebug) {
        console.log('🧪 Analytics debug mode enabled');
      }
      
      initializeAnalytics({
        endpoint: endpoint,
        collectionName: collectionName,
        apiKey: analyticsApiKey,
        debug: analyticsDebug
      });
    }
  }, []);

  const handleLogoLoad = () => {
    console.log('Emory logo loaded successfully');
  };

  const handleLogoError = () => {
    console.error('Failed to load Emory logo');
  };

      // Search mode handling removed - ELSER only

  const handleIndexChange = (index: 'both' | 'main' | 'news') => {
    setSelectedIndex(index);
    connectorRef.current.setSelectedIndex(index);
    setSearchKey(prev => prev + 1); // Force re-render
    console.log(`Switched to ${index.toUpperCase()} index`);
  };

  return (
    <SearchProvider key={searchKey} config={config}>
      <WithSearch
        mapContextToProps={({ wasSearched, error }) => ({
          wasSearched,
          error
        })}
      >
        {({ wasSearched, error }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                {error && (
                  <div style={{ 
                    background: '#fee2e2', 
                    color: '#dc2626', 
                    padding: '1rem', 
                    margin: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #fecaca'
                  }}>
                    <strong>Search Error:</strong> {error}
                  </div>
                )}
                <Layout
                  header={
                    <div className="search-header">
                      <div className="emory-logo">
                        <img 
                          src="/emory-logo.png" 
                          alt="Emory University" 
                          onLoad={handleLogoLoad}
                          onError={handleLogoError}
                        />
                        <span>Emory Logo</span>
                      </div>
                      <h1>Emory University AI Search</h1>
                      <p>Ask questions about Emory using AI-powered Semantic Search</p>
                                  <IndexSelector
                                    selectedIndex={selectedIndex}
                                    onIndexChange={handleIndexChange}
                                  />
                                  <ElserSearchBox
                                    debounceLength={500}
                                  />
                    </div>
                  }
                                                sideContent={
                                <div>
                                  {/* Pre-search index selector is now in the header */}
                                </div>
                              }
                  bodyContent={
                    <div>
                      {aiSummaryEnabled ? (
                        <AISummary />
                      ) : (
                        <AIFallbackSummary />
                      )}
                      <AnalyticsResults 
                        searchMode="elser"
                        selectedIndex={selectedIndex}
                      />
                    </div>
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}

export default App; 