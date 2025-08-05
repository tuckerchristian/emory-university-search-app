import React from 'react';

interface IndexSelectorProps {
  selectedIndex: 'both' | 'main' | 'news';
  onIndexChange: (index: 'both' | 'main' | 'news') => void;
}

const IndexSelector: React.FC<IndexSelectorProps> = ({ selectedIndex, onIndexChange }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem',
      gap: '0.5rem'
    }}>
      <span style={{
        fontSize: '0.875rem',
        color: '#6b7280',
        fontWeight: '500'
      }}>
        Search in:
      </span>
      
      <div style={{
        display: 'flex',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => onIndexChange('both')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: selectedIndex === 'both' ? '#3b82f6' : '#f8fafc',
            color: selectedIndex === 'both' ? 'white' : '#374151',
            fontWeight: selectedIndex === 'both' ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
        >
          Both
        </button>
        <button
          onClick={() => onIndexChange('main')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: selectedIndex === 'main' ? '#3b82f6' : '#f8fafc',
            color: selectedIndex === 'main' ? 'white' : '#374151',
            fontWeight: selectedIndex === 'main' ? '600' : '400',
            transition: 'all 0.2s ease',
            borderLeft: '1px solid #e2e8f0'
          }}
        >
          Main Site
        </button>
        <button
          onClick={() => onIndexChange('news')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: selectedIndex === 'news' ? '#3b82f6' : '#f8fafc',
            color: selectedIndex === 'news' ? 'white' : '#374151',
            fontWeight: selectedIndex === 'news' ? '600' : '400',
            transition: 'all 0.2s ease',
            borderLeft: '1px solid #e2e8f0'
          }}
        >
          News
        </button>
      </div>
    </div>
  );
};

export default IndexSelector; 