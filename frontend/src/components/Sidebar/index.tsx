import React from 'react';
import { Controls } from '../ForceGraph/features/Controls';
import { Accordion } from '../Accordion'; 
import { AssociatedCards } from './AssociatedCards'; 
import './Sidebar.css';
import type { GraphConfig } from '../ForceGraph/types/config';
import type { GraphNode } from '../ForceGraph/types/nodes';

interface SidebarProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
  nodes: GraphNode[];
  onNodeSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;
  selectedNode: GraphNode | null;
  associatedNodes: Array<{node: GraphNode, weight: number}>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onConfigChange,
  nodes,
  onNodeSelect,
  selectedNode,
  associatedNodes
}) => {
  // Determine sidebar class based on state
  const sidebarClass = `sidebar ${config.sidebarExpanded ? 'expanded' : 'collapsed'} ${
    selectedNode ? 'has-cards' : ''
  }`;

  return (
    <div className={sidebarClass}>
      {/* Sidebar Header with Toggle Button */}
      <div className="sidebar-header">
        <button 
          onClick={() => onConfigChange({ ...config, sidebarExpanded: !config.sidebarExpanded })}
          className="sidebar-toggle"
        >
          {config.sidebarExpanded ? '←' : '→'}
        </button>
      </div>

      {/* Main Sidebar Content */}
      {config.sidebarExpanded && (
        <div className="sidebar-content">
          {/* Controls Section */}
          <Accordion title="Controls">
            <Controls
              config={config}
              onConfigChange={onConfigChange}
              nodes={nodes}
              onNodeSelect={onNodeSelect}
              onNodeAndAssociatedSelect={onNodeSelect}
            />
          </Accordion>

          {/* Associated Cards Section */}
          {selectedNode && (
            <Accordion title="Related Cards" defaultExpanded={true}>
              <AssociatedCards
                selectedNode={selectedNode}
                associatedNodes={associatedNodes}
              />
            </Accordion>
          )}
        </div>
      )}
    </div>
  );
};