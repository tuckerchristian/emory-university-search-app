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
  host: 'https://ae7515e9dbf14d91a98aa3e445f80c9e.us-east-2.aws.elastic-cloud.com:443',
  apiKey: 'T3M5M1Q1Z0Jtdl96N1dGNjN5emY6NkExLXJNbHMxblpndVRsT01ZZ3hkZw==',
  index: 'search-emory-main,search-emory-news'
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
  }
};

function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch
        mapContextToProps={({ wasSearched }) => ({
          wasSearched
        })}
      >
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <div className="search-header">
                      <h1>Emory Search</h1>
                      <p>Search across Emory University's main site and news content</p>
                      <SearchBox 
                        debounceLength={300}
                        searchAsYouType={true}
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