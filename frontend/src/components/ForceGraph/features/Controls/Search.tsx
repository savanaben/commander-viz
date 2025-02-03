import React, { useState, useCallback } from 'react';
import type { GraphNode } from '../../types/nodes';

interface SearchProps {
  nodes: GraphNode[];
  onSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;  // Updated signature
  onNodeSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;
}

export const Search: React.FC<SearchProps> = ({ nodes, onSelect, onNodeSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<GraphNode[]>([]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    const matches = nodes.filter(node => 
      node.id.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 10);

    setSuggestions(matches);
  }, [nodes]);

  const handleNodeSelect = (node: GraphNode) => {
    onSelect(node, []);  
    onNodeSelect(node, []); 
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <div className="control-section">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search commanders..."
        className="control-input"
      />
      {suggestions.length > 0 && (
        <ul className="control-suggestions">
          {suggestions.map(node => (
            <li 
              key={node.id}
              onClick={() => handleNodeSelect(node)}
            >
              {node.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};