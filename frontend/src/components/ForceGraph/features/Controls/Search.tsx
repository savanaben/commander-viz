import { useState, useEffect, RefObject } from 'react';
import { Box } from '@mantine/core';
import type { GraphNode } from '../../types/nodes';
import type { GraphData, GraphConfig } from '../../types/config';
import { useNodeSelection } from '../../hooks/useNodeSelection';
import { ForceGraphMethods } from 'react-force-graph-2d';
import './Search.css';

interface SearchProps {
  nodes: GraphNode[];
  data: GraphData;
  config: GraphConfig;
  graphRef: RefObject<ForceGraphMethods>;
}

export const Search: React.FC<SearchProps> = ({
  nodes,
  data,
  config,
  graphRef
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { selectNode } = useNodeSelection(data, config);

  // Filter nodes based on search term
  const suggestions = searchTerm.length >= 2 
    ? nodes.filter(node => 
        node.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10)
    : [];

  // Handle suggestion selection
  const handleSelect = (node: GraphNode) => {
    setSearchTerm(node.name || node.id);
    setShowSuggestions(false);
    selectNode(node, graphRef);
  };

  return (
    <Box className="search-container">
      <input
        type="text"
        className="search-input"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder="Search commanders..."
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((node) => (
            <li
              key={node.id}
              className="suggestion-item"
              onClick={() => handleSelect(node)}
            >
              {node.name || node.id}
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
};