import ElasticsearchAPIConnector from '@elastic/search-ui-elasticsearch-connector';
import { trackSearchTransaction, trackRUMError } from './rum';

export class HybridSearchConnector extends ElasticsearchAPIConnector {
  private searchMode: 'elser' = 'elser'; // ELSER only
  private selectedIndex: 'both' | 'main' | 'news' = 'both';
  private host: string;
  private index: string;
  private apiKey: string;

  constructor(options: any) {
    super(options);
    this.host = options.host;
    this.index = options.index;
    this.apiKey = options.apiKey;
  }

  setSearchMode(mode: 'elser') {
    this.searchMode = mode;
  }

  setSelectedIndex(index: 'both' | 'main' | 'news') {
    this.selectedIndex = index;
  }

  private buildFilters(filters: any): any[] {
    const filterArray: any[] = [];
    
    if (!filters) return filterArray;

    // Handle source filter (url_host)
    if (filters.source_filter && filters.source_filter.length > 0) {
      filterArray.push({
        terms: {
          "url_host": filters.source_filter
        }
      });
    }

    return filterArray;
  }



  async onSearch(state: any, queryConfig: any) {
    const searchTerm = state.searchTerm;
    
    // Start RUM transaction for search
    const transaction = trackSearchTransaction(searchTerm || '', this.searchMode);
    
    if (!searchTerm || searchTerm.trim() === '') {
      return {
        results: [],
        totalResults: 0,
        facets: {},
        requestId: state.requestId || Date.now().toString(),
        resultSearchTerm: searchTerm,
        totalPages: 0,
        pagingStart: 0,
        pagingEnd: 0,
        wasSearched: true,
        rawResponse: { hits: { hits: [], total: { value: 0 } } }
      };
    }

    // Determine which index to search based on selection
    let targetIndex = this.index;
    if (this.selectedIndex === 'main') {
      targetIndex = 'search-emory-main-v2';
    } else if (this.selectedIndex === 'news') {
      targetIndex = 'search-emory-news-v2';
    }
    // If 'both' is selected, use the combined index
    
    console.log(`Searching in index: ${targetIndex} (selection: ${this.selectedIndex})`);

    let query: any;

    // Build ELSER search query
    const baseQuery = {
      bool: {
        should: [
          {
            multi_match: {
              query: searchTerm,
              fields: [
                "title^2",
                "headings",
                "body_content",
                "meta_description"
              ],
              type: "best_fields"
            }
          },
          {
            sparse_vector: {
              "field": "emory_main_semantic_text",
              "inference_id": ".elser-2-elasticsearch",
              "query": searchTerm
            }
          }
        ]
      }
    };

    // Build the complete query with filters
    query = {
      query: {
        bool: {
          must: [baseQuery],
          filter: this.buildFilters(state.filters)
        }
      }
    };

    console.log("Constructed query:", JSON.stringify(query, null, 2));

    try {
      const response = await fetch(
        `${this.host}/${targetIndex}/_search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${this.apiKey}`
          },
          body: JSON.stringify({
            ...query,
            size: state.resultsPerPage || 10,
            from: (state.current - 1) * (state.resultsPerPage || 10)
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${this.searchMode.toUpperCase()} search response:`, data);

      // Ensure data has the expected structure
      if (!data || !data.hits) {
        const error = new Error('Invalid response structure from Elasticsearch');
        trackRUMError(error, { 
          searchTerm, 
          searchMode: this.searchMode, 
          targetIndex,
          responseStatus: response.status 
        });
        throw error;
      }

      const results = data.hits.hits.map((hit: any) => ({
        id: { raw: hit._id },
        title: { raw: hit._source.title },
        body_content: { raw: hit._source.body_content },
        url: { raw: hit._source.url },
        meta_keywords: { raw: hit._source.meta_keywords },
        last_crawled_at: { raw: hit._source.last_crawled_at },
        domains: { raw: hit._source.domains },
        url_host: { raw: hit._source.url_host },
        _index: { raw: hit._index },

        score: { raw: hit._score }
      }));

      const totalResults = data.hits.total.value;
      const resultsPerPage = state.resultsPerPage || 10;
      const totalPages = Math.ceil(totalResults / resultsPerPage);
      const currentPage = state.current || 1;
      const pagingStart = (currentPage - 1) * resultsPerPage + 1;
      const pagingEnd = Math.min(currentPage * resultsPerPage, totalResults);



      // End RUM transaction on success
      if (transaction && transaction.addLabels && transaction.end) {
        try {
          transaction.addLabels({
            totalResults: Number(totalResults),
            targetIndex: String(targetIndex),
            resultsPerPage: Number(state.resultsPerPage || 10),
            success: Boolean(true)
          });
          transaction.end();
        } catch (e) {
          console.warn('Failed to end RUM transaction:', e);
        }
      }

      return {
        results,
        totalResults,
        facets: {},
        rawResponse: data,
        requestId: state.requestId || Date.now().toString(),
        resultSearchTerm: searchTerm,
        totalPages,
        pagingStart,
        pagingEnd,
        wasSearched: true
      };
    } catch (error) {
      console.error(`Error in ${this.searchMode} search:`, error);
      
      // Track RUM error and end transaction
      trackRUMError(error as Error, { 
        searchTerm, 
        searchMode: this.searchMode, 
        targetIndex 
      });
      
      if (transaction && transaction.end) {
        try {
          transaction.end();
        } catch (e) {
          console.warn('Failed to end RUM transaction on error:', e);
        }
      }
      
      throw error;
    }
  }
} 