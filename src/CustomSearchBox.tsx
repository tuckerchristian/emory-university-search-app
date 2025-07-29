import React, { useState, useEffect, useRef } from 'react';
import { SearchBox } from '@elastic/react-search-ui';

interface CustomSearchBoxProps {
  debounceLength?: number;
  searchAsYouType?: boolean;
  autocompleteMinimumCharacters?: number;
  autocompleteSuggestions?: boolean;
}

const CustomSearchBox: React.FC<CustomSearchBoxProps> = ({
  debounceLength = 300,
  searchAsYouType = true,
  autocompleteMinimumCharacters = 3,
  autocompleteSuggestions = true
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < autocompleteMinimumCharacters) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const suggestionQuery = {
        size: 0,
        query: {
          multi_match: {
            query: query,
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

      const response = await fetch(
        `${import.meta.env.VITE_ELASTICSEARCH_ENDPOINT}/search-emory-combined/_search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${import.meta.env.VITE_ELASTICSEARCH_API_KEY}`
          },
          body: JSON.stringify(suggestionQuery)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Suggestion query response:', data);
      
      // Extract suggestions from aggregations.suggestions.buckets path
      const newSuggestions = data.aggregations?.suggestions?.buckets?.map(
        (bucket: any) => bucket.key
      ) || [];
      
      console.log('Extracted suggestions:', newSuggestions);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      if (autocompleteSuggestions) {
        fetchSuggestions(value);
      }
    }, debounceLength);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // Trigger search with the selected suggestion
    console.log('Selected suggestion:', suggestion);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <SearchBox 
        debounceLength={debounceLength}
        searchAsYouType={searchAsYouType}
        autocompleteMinimumCharacters={autocompleteMinimumCharacters}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
                             style={{
                 padding: '0.75rem 1rem',
                 cursor: 'pointer',
                 borderBottom: '1px solid #f1f5f9'
               }}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSearchBox; 