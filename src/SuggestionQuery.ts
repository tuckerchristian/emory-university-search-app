// Example suggestion query implementation
// This shows how to build the exact query format you specified

export const buildSuggestionQuery = (searchText: string) => {
  return {
    size: 0,
    query: {
      multi_match: {
        query: searchText,
        fields: [
          "suggest_title",
          "suggest_title._2gram", 
          "suggest_title._3gram"
        ],
        type: "bool_prefix"
      }
    },
    aggs: {
      suggestions: {
        terms: {
          field: "title.keyword",
          size: 3
        }
      }
    }
  };
};

// Example usage with fetch:
export const fetchSuggestions = async (searchText: string) => {
  const query = buildSuggestionQuery(searchText);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_ELASTICSEARCH_ENDPOINT}/search-emory-combined/_search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `ApiKey ${import.meta.env.VITE_ELASTICSEARCH_API_KEY}`
        },
        body: JSON.stringify(query)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Suggestion query response:', data);
    
    // Extract suggestions from aggregations.suggestions.buckets path
    const suggestions = data.aggregations?.suggestions?.buckets?.map(
      (bucket: any) => bucket.key
    ) || [];
    
    console.log('Extracted suggestions:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

// Example of how to integrate this with Search UI
export const createSuggestionConnector = () => {
  return {
    onSearch: async (state: any, queryConfig: any) => {
      // This would be called when user types
      const searchTerm = state.searchTerm;
      
      if (searchTerm && searchTerm.length >= 3) {
        const suggestions = await fetchSuggestions(searchTerm);
        return {
          results: suggestions.map((suggestion: string) => ({
            id: { raw: suggestion },
            title: { raw: suggestion },
            suggestion: { raw: suggestion }
          })),
          totalResults: suggestions.length
        };
      }
      
      return { results: [], totalResults: 0 };
    }
  };
};

// Test function to verify suggestion query
export const testSuggestionQuery = async (searchText: string = "emory") => {
  console.log('Testing suggestion query with:', searchText);
  const suggestions = await fetchSuggestions(searchText);
  console.log('Test results:', suggestions);
  return suggestions;
}; 