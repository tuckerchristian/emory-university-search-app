import React from 'react';
import { SearchBox } from '@elastic/react-search-ui';

interface ElserSearchBoxProps {
  debounceLength?: number;
}

const ElserSearchBox: React.FC<ElserSearchBoxProps> = ({
  debounceLength = 500
}) => {
  return (
    <div className="elser-search-box">
      <div className="search-input-container">
        <SearchBox
          searchAsYouType={false} // Disabled for ELSER - only search on submit
          debounceLength={debounceLength}
          inputProps={{
            placeholder: "Ask a question about Emory University...",
            className: "search-input elser-mode"
          }}
        />
        
        {/* Search mode indicator positioned inside the search box */}
        <div className="search-mode-indicator-inside">
          <span className="ai-icon">🤖</span>
          <span className="mode-text">AI-Powered</span>
        </div>
      </div>
      
      <div className="elser-search-hint">
        <p>💡 Ask natural language questions like "What are Emory's admission requirements?" or "Tell me about Emory's research programs"</p>
      </div>
    </div>
  );
};

export default ElserSearchBox;