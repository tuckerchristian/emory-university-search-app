import React from 'react';
import ElasticsearchAPIConnector from '@elastic/search-ui-elasticsearch-connector';
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  WithSearch
} from '@elastic/react-search-ui';
import CustomSearchBox from './CustomSearchBox';
import {
  BooleanFacet,
  Layout,
  SingleLinksFacet,
  SingleSelectFacet
} from '@elastic/react-search-ui-views';
import '@elastic/react-search-ui-views/lib/styles/styles.css';
import { SearchDriverOptions } from '@elastic/search-ui';
import './App.css';

// Initialize the Elasticsearch connector
const connector = new ElasticsearchAPIConnector({
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
      _index: { raw: {} }
    },
    search_fields: {
      title: {},
      body_content: {}
    },
    disjunctiveFacets: ['_index'],
    facets: {
      _index: { type: 'value' }
    }
  },

};

function App() {
  const handleLogoLoad = () => {
    console.log('Emory logo loaded successfully');
  };

  const handleLogoError = () => {
    console.error('Failed to load Emory logo');
  };

  return (
    <SearchProvider config={config}>
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
                      <h1>Emory University</h1>
                      <p>Search across Emory University's main site and news content</p>
                      <CustomSearchBox 
                        debounceLength={300}
                        searchAsYouType={true}
                        autocompleteMinimumCharacters={3}
                        autocompleteSuggestions={true}
                      />
                    </div>
                  }
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Facet 
                          field="_index" 
                          label="Content Type"
                          filterType="any"
                        />
                      )}
                    </div>
                  }
                  bodyContent={
                    <Results
                      titleField="title"
                      urlField="url"
                      shouldTrackClickThrough
                      resultView={({ result }) => (
                        <div className="result-item">
                          <h3 className="result-title">
                            <a href={result.url?.raw} target="_blank" rel="noopener noreferrer">
                              {result.title?.raw}
                            </a>
                          </h3>
                          <div className="result-meta">
                            <span className="result-category">
                              {result._index?.raw === 'search-emory-main' ? 'Main Site' : 'News'}
                            </span>
                            {result.last_crawled_at?.raw && (
                              <span className="result-date">
                                {new Date(result.last_crawled_at.raw).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="result-content">{result.body_content?.raw}</p>
                          {result.meta_keywords?.raw && result.meta_keywords.raw.length > 0 && (
                            <div className="result-tags">
                              {result.meta_keywords.raw.map((tag: string, index: number) => (
                                <span key={index} className="result-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    />
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