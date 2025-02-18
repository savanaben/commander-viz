import React, { useEffect, useState, useCallback } from 'react';
import { Controls } from '../ForceGraph/features/Controls';
import { Accordion } from '../Accordion'; 
import { AssociatedCards } from './AssociatedCards'; 
import { useGraphStore } from '../../store/GraphContext';
import { Paper, Box } from '@mantine/core';
import { ForceGraphMethods } from 'react-force-graph-2d';
import { RefObject } from 'react';
import './Sidebar.css';
import type { GraphConfig } from '../ForceGraph/types/config';
import type { GraphNode } from '../ForceGraph/types/nodes';
import type { GraphData } from '../ForceGraph/types/config';

interface SidebarProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
  nodes: GraphNode[];
  data: GraphData;
  graphRef: RefObject<ForceGraphMethods>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  onConfigChange,
  nodes,
  data,
  graphRef
}) => {
  // Get selected node and associated nodes from global store
  const { selectedNode, associatedNodes, updateConfig } = useGraphStore();
  
  // State for sidebar width
  const [width, setWidth] = useState(300); // Default to collapsed width
  const [isResizing, setIsResizing] = useState(false);
  const [wasNodeSelected, setWasNodeSelected] = useState(false);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, []);

  // Handle mouse move while resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Calculate new width based on mouse position
      const newWidth = window.innerWidth - e.clientX;
      
      // Enforce min/max constraints (70% of screen width max)
      const constrainedWidth = Math.min(Math.max(newWidth, 300), window.innerWidth * 0.7);
      setWidth(constrainedWidth);
      
      // Update global config
      updateConfig({
        ...config,
        sidebarWidth: constrainedWidth
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, config, updateConfig]);

  // Update width only when transitioning between selected and not selected states
  useEffect(() => {
    const hasSelectedNode = Boolean(selectedNode);
    if (hasSelectedNode !== wasNodeSelected) {
      setWidth(hasSelectedNode ? 650 : 300);
      setWasNodeSelected(hasSelectedNode);
    }
  }, [selectedNode, wasNodeSelected]);

  return (
    <>
      {/* Resize Handle - Now outside the sidebar */}
      <div 
        className="resize-handle"
        onMouseDown={handleMouseDown}
        style={{
          left: `${window.innerWidth - width - 10}px` // Position handle at sidebar edge
        }}
      />
      
      <Paper 
        className="sidebar"
        shadow="sm"
        style={{
          width: `${width}px`,
          minWidth: '300px',
          maxWidth: '70vw'
        }}
      >
        <Box className="sidebar-content">
          {/* Controls Section */}
          <Accordion title="Controls">
            <Controls
              config={config}
              onConfigChange={onConfigChange}
              nodes={nodes}
              data={data}
              graphRef={graphRef}
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
        </Box>
      </Paper>
    </>
  );
};