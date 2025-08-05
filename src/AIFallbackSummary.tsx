import React, { useState, useEffect, useRef } from 'react';
import { WithSearch } from '@elastic/react-search-ui';

interface AIFallbackSummaryProps {
  // No props needed - always ELSER mode
}

interface SummaryData {
  summary: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  isLoading: boolean;
  error?: string;
}

const AIFallbackSummary: React.FC<AIFallbackSummaryProps> = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    summary: '',
    sources: [],
    isLoading: false
  });
  
  // Track current request to prevent concurrent requests
  const lastQueryRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const debouncedGenerateLocalSummary = (query: string, results: any[]) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      generateLocalSummary(query, results);
    }, 1000); // 1 second debounce
  };

  const generateLocalSummary = (query: string, results: any[]) => {
    if (!query || results.length === 0) {
      return;
    }

    // Prevent duplicate requests for the same query
    if (lastQueryRef.current === query) {
      console.log('🔄 Skipping duplicate local summary request for:', query);
      return;
    }
    
    lastQueryRef.current = query;
    console.log('🤖 Starting local summary generation for:', query);
    
    setSummaryData(prev => ({ ...prev, isLoading: true }));

    // Simulate processing time
    setTimeout(() => {
      const topResults = results.slice(0, 3).map(result => ({
        title: result.title?.raw || 'Untitled',
        url: result.url?.raw || '',
        snippet: result.body_content?.raw?.substring(0, 200) || ''
      }));

      // Create a simple extractive summary
      const keyPhrases = extractKeyInformation(query, topResults);
      const summary = generateExtractiveSummary(query, keyPhrases, topResults);

      setSummaryData({
        summary,
        sources: topResults,
        isLoading: false
      });

      console.log('🤖 Local AI Summary generated for query:', query);
    }, 1500);
  };

  const extractKeyInformation = (query: string, results: any[]) => {
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    const allText = results.map(r => r.snippet.toLowerCase()).join(' ');
    
    // Simple keyword extraction
    const sentences = allText.split(/[.!?]+/).filter(s => s.length > 20);
    const relevantSentences = sentences.filter(sentence => 
      queryWords.some(word => sentence.includes(word))
    );

    return relevantSentences.slice(0, 3);
  };

  const generateExtractiveSummary = (query: string, keyPhrases: string[], sources: any[]) => {
    if (keyPhrases.length === 0) {
      return `Based on your search for "${query}", here are the most relevant results from Emory University. The search found ${sources.length} highly relevant documents that contain information related to your query.`;
    }

    const summary = `Based on your search for "${query}", here's what we found from Emory University:

${keyPhrases.slice(0, 2).map(phrase => 
  phrase.charAt(0).toUpperCase() + phrase.slice(1).trim()
).join('. ')}.

This information comes from ${sources.length} relevant sources across Emory's website and news content.`;

    return summary;
  };

  return (
    <WithSearch
      mapContextToProps={({ 
        results, 
        searchTerm, 
        wasSearched 
      }) => ({
        results,
        searchTerm,
        wasSearched
      })}
    >
      {({ results, searchTerm, wasSearched }) => {
        useEffect(() => {
          console.log('AIFallbackSummary useEffect triggered:', { 
            searchTerm, 
            resultsLength: results?.length, 
            wasSearched
          });
          
          if (wasSearched && searchTerm && results && results.length > 0) {
            debouncedGenerateLocalSummary(searchTerm, results);
          }
        }, [searchTerm, results?.length, wasSearched]); // Use results.length instead of results object

        if (!wasSearched || !results || results.length === 0) {
          return null;
        }

        return (
          <div className="ai-summary-container">
            <div className="ai-summary-header">
              <div className="ai-summary-icon">🤖</div>
              <h3>AI Summary</h3>
              <div className="ai-summary-badge">Powered by ELSER</div>
            </div>

            {summaryData.isLoading ? (
              <div className="ai-summary-loading">
                <div className="loading-spinner"></div>
                <p>Analyzing search results...</p>
              </div>
            ) : summaryData.summary ? (
              <div className="ai-summary-content">
                <div className="ai-summary-text">
                  {summaryData.summary}
                </div>
                
                {summaryData.sources.length > 0 && (
                  <div className="ai-summary-sources">
                    <h4>Key Sources:</h4>
                    <div className="sources-list">
                      {summaryData.sources.map((source, index) => (
                        <div key={index} className="source-item">
                          <span className="source-number">{index + 1}</span>
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="source-link"
                          >
                            {source.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      }}
    </WithSearch>
  );
};

export default AIFallbackSummary;