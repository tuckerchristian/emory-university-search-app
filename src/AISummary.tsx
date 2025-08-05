import React, { useState, useEffect, useRef } from 'react';
import { WithSearch } from '@elastic/react-search-ui';
import { trackAISummarySpan, trackRUMError } from './rum';

interface AISummaryProps {
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

const AISummary: React.FC<AISummaryProps> = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    summary: '',
    sources: [],
    isLoading: false
  });
  
  // Track current request to prevent concurrent requests
  const currentRequestRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentRequestRef.current) {
        console.log('🧹 Cleaning up AI summary request on unmount');
        currentRequestRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const debouncedGenerateAISummary = (query: string, results: any[]) => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounce timeout
    debounceTimeoutRef.current = setTimeout(() => {
      generateAISummary(query, results);
    }, 1000); // 1 second debounce
  };

  const generateAISummary = async (query: string, results: any[]) => {
    if (!query || results.length === 0) {
      return;
    }

    // Prevent duplicate requests for the same query
    if (lastQueryRef.current === query) {
      console.log('🔄 Skipping duplicate AI summary request for:', query);
      return;
    }

    // Cancel any existing request
    if (currentRequestRef.current) {
      console.log('🛑 Cancelling previous AI summary request');
      currentRequestRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    currentRequestRef.current = abortController;
    lastQueryRef.current = query;

    // Start RUM span for AI summary generation
    const span = trackAISummarySpan(query);

    setSummaryData(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      // Extract content from top results for context
      const topResults = results.slice(0, 5).map(result => ({
        title: result.title?.raw || 'Untitled',
        url: result.url?.raw || '',
        content: result.body_content?.raw || '',
        snippet: result.body_content?.raw?.substring(0, 300) || ''
      }));

      // Create context from search results
      const context = topResults.map((result, index) => 
        `[${index + 1}] ${result.title}\n${result.snippet}...`
      ).join('\n\n');

      // Call Elasticsearch inference API for chat completion streaming
      const inferenceEndpoint = import.meta.env.VITE_INFERENCE_ENDPOINT || 'openai-chat_completion-6j163wqoj8s';
      const response = await fetch(`${import.meta.env.VITE_ELASTICSEARCH_ENDPOINT}/_inference/chat_completion/${inferenceEndpoint}/_stream`, {
        method: 'POST',
        headers: {
          'Authorization': `ApiKey ${import.meta.env.VITE_ELASTICSEARCH_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        signal: abortController.signal, // Add abort signal
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Based on the following search results about "${query}" from Emory University, provide a concise summary that answers the user's question.

Search Results:
${context}

Please provide a clear, informative summary that synthesizes the information from these sources. Focus on answering what someone searching for "${query}" would want to know about Emory University.`
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Summary API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Handle streaming response - debug the actual format first
      const responseText = await response.text();
      console.log('🔍 Raw response from inference API:', responseText.substring(0, 500) + '...');
      
      // Try to parse as streaming SSE format
      let summary = '';
      const lines = responseText.split('\n');
      
      for (const line of lines) {
        console.log('📝 Processing line:', line);
        
        // Try different parsing approaches
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const data = line.substring(6).trim();
            const jsonData = JSON.parse(data);
            console.log('📦 Parsed JSON:', jsonData);
            
            // Try different response formats
            const content = jsonData.choices?.[0]?.delta?.content || 
                           jsonData.choices?.[0]?.message?.content ||
                           jsonData.content ||
                           jsonData.response;
            
            if (content) {
              summary += content;
              console.log('✅ Found content:', content);
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse JSON from line:', line, e);
          }
        } else if (line.trim() && !line.startsWith('event:') && !line.includes('[DONE]')) {
          // Try parsing as direct JSON
          try {
            const jsonData = JSON.parse(line);
            console.log('📦 Direct JSON parsed:', jsonData);
            
            const content = jsonData.choices?.[0]?.delta?.content || 
                           jsonData.choices?.[0]?.message?.content ||
                           jsonData.content ||
                           jsonData.response;
            
            if (content) {
              summary += content;
              console.log('✅ Found content in direct JSON:', content);
            }
          } catch (e) {
            // Not JSON, skip
          }
        }
      }
      
      // If no streaming content found, try parsing the entire response as a single JSON
      if (!summary && responseText.trim()) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('📦 Full response as JSON:', jsonData);
          
          summary = jsonData.choices?.[0]?.message?.content || 
                   jsonData.content ||
                   jsonData.response ||
                   '';
          
          if (summary) {
            console.log('✅ Found summary in full response:', summary.substring(0, 100) + '...');
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse full response as JSON:', e);
        }
      }
      
      // Ensure we have a summary
      if (!summary) {
        summary = 'Unable to generate summary from streaming response.';
      }

      // Set final summary data
      setSummaryData({
        summary: summary.trim(),
        sources: topResults,
        isLoading: false
      });

      // End RUM span on success
      if (span && span.addLabels && span.end) {
        try {
          span.addLabels({
            summaryLength: Number(summary.length),
            sourcesCount: Number(topResults.length),
            success: Boolean(true)
          });
          span.end();
        } catch (e) {
          console.warn('Failed to end RUM span:', e);
        }
      }

      console.log('🤖 AI Summary generated for query:', query);
      console.log('📝 Summary length:', summary.length, 'characters');
      console.log('📊 Summary preview:', summary.substring(0, 100) + '...');

    } catch (error: any) {
      // Don't show error for aborted requests
      if (error.name === 'AbortError') {
        console.log('🛑 AI summary request was cancelled');
        return;
      }
      
      console.error('Failed to generate AI summary:', error);
      
      // Track RUM error and end span
      trackRUMError(error, { 
        query, 
        operation: 'AI Summary Generation',
        resultsCount: results.length 
      });
      
      if (span && span.addLabels && span.end) {
        try {
          span.addLabels({
            success: Boolean(false),
            errorType: String(error.name || 'Unknown')
          });
          span.end();
        } catch (e) {
          console.warn('Failed to end RUM span on error:', e);
        }
      }
      
      setSummaryData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Unable to generate AI summary. Please try again.'
      }));
    } finally {
      // Clear the current request reference
      if (currentRequestRef.current === abortController) {
        currentRequestRef.current = null;
      }
    }
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
        // Generate summary when we have ELSER results (debounced)
        useEffect(() => {
          if (wasSearched && searchTerm && results && results.length > 0) {
            debouncedGenerateAISummary(searchTerm, results);
          }
        }, [searchTerm, results?.length, wasSearched]); // Use results.length instead of results object

        // Only show for searches with results
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
                <p>Generating AI summary...</p>
              </div>
            ) : summaryData.error ? (
              <div className="ai-summary-error">
                <p>⚠️ {summaryData.error}</p>
              </div>
            ) : summaryData.summary ? (
              <div className="ai-summary-content">
                <div className="ai-summary-text">
                  {summaryData.summary}
                </div>
                
                {summaryData.sources.length > 0 && (
                  <div className="ai-summary-sources">
                    <h4>Sources:</h4>
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

export default AISummary;