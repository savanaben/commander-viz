import React from 'react';
import type { GraphNode } from '../ForceGraph/types/nodes';
import './Sidebar.css';

interface AssociatedCardsProps {
  selectedNode: GraphNode;
  associatedNodes: Array<{node: GraphNode, weight: number}>;
}

export const AssociatedCards: React.FC<AssociatedCardsProps> = ({
  selectedNode,
  associatedNodes
}) => {
  return (
    <div className="associated-cards">
      <div className="selected-card">
        <img 
          src={selectedNode.image_uris.normal} 
          alt={selectedNode.name}
          className="card-image"
        />
      </div>
      <div className="associated-cards-grid">
        {associatedNodes.map(({ node, weight }) => (
          <div key={node.id} className="card-item">
            <img 
              src={node.image_uris.normal} 
              alt={node.name}
              className="card-image"
            />
            <div className="card-weight">
              {weight.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};