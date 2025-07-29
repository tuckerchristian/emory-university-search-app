import React, { useState } from 'react';
import { testSuggestionQuery } from './SuggestionQuery';

const TestSuggestions: React.FC = () => {
  const [testQuery, setTestQuery] = useState('emory');
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const suggestions = await testSuggestionQuery(testQuery);
      setResults(suggestions);
    } catch (error) {
      console.error('Test failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Test Suggestion Query</h3>
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          placeholder="Enter test query"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={handleTest}
          disabled={loading}
          style={{ padding: '5px 10px' }}
        >
          {loading ? 'Testing...' : 'Test Query'}
        </button>
      </div>
      
      {results.length > 0 && (
        <div>
          <h4>Suggestions:</h4>
          <ul>
            {results.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      
      {results.length === 0 && !loading && (
        <p>No suggestions found. Check console for details.</p>
      )}
    </div>
  );
};

export default TestSuggestions; 