import React from 'react';
import { WithSearch } from '@elastic/react-search-ui';
import { trackClick, trackSearch, isAnalyticsInitialized } from './analytics';

interface ResultItem {
  id: { raw: string };
  title: { raw: string };
  url: { raw: string };
  body_content: { raw: string };
  url_host: { raw: string };
  _index: { raw: string };
  _score: { raw: number };
}

interface AnalyticsResultsProps {
  searchMode: 'text' | 'elser';
  selectedIndex: string;
}

const AnalyticsResults: React.FC<AnalyticsResultsProps> = ({ searchMode, selectedIndex }) => {
  const handleResultClick = (result: ResultItem, position: number, searchTerm: string) => {
    if (!isAnalyticsInitialized()) return;

    const documentId = result.id?.raw || result.url?.raw || 'unknown';
    const documentUrl = result.url?.raw || '';
    const documentTitle = result.title?.raw || 'Untitled';

    trackClick(
      searchTerm,
      documentId,
      documentUrl,
      documentTitle,
      position,
      'elser'
    );
  };

  return (
    <WithSearch
      mapContextToProps={({ 
        results, 
        searchTerm, 
        totalResults, 
        wasSearched 
      }) => ({
        results,
        searchTerm,
        totalResults,
        wasSearched
      })}
    >
      {({ results, searchTerm, totalResults, wasSearched }) => {
        // Track search when results are displayed
        React.useEffect(() => {
          if (wasSearched && searchTerm && isAnalyticsInitialized()) {
            trackSearch(searchTerm, searchMode, selectedIndex, totalResults || 0);
          }
        }, [searchTerm, totalResults, wasSearched, searchMode, selectedIndex]);

        if (!results || results.length === 0) {
          return wasSearched ? (
            <div className="no-results">
              <p>No results found. Try different keywords or search mode.</p>
            </div>
          ) : null;
        }

        return (
          <div className="results-container">
            <div className="results-info">
              <p><strong>{totalResults}</strong> results found</p>
            </div>
            
            <div className="results-list">
              {results.map((result: ResultItem, index: number) => (
                <div key={result.id?.raw || index} className="result-item">
                  <div className="result-content">
                    <h3 className="result-title">
                      <a
                        href={result.url?.raw}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResultClick(result, index + 1, searchTerm || '')}
                      >
                        {result.title?.raw || 'Untitled'}
                      </a>
                    </h3>
                    
                    <p className="result-snippet">
                      {result.body_content?.raw?.substring(0, 300)}
                      {result.body_content?.raw?.length > 300 ? '...' : ''}
                    </p>
                    
                    <div className="result-meta">
                      <span className="result-source">{result.url_host?.raw}</span>
                      <span className="result-score">Score: {result._score?.raw?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }}
    </WithSearch>
  );
};

export default AnalyticsResults;