import { useEffect, RefObject } from 'react';
import type { GraphNode } from '../types/nodes';
import type { GraphLink } from '../types/links';
import type { GraphData, GraphConfig } from '../types/config';
import { getWeight } from '../utils/linkCalculations';
import { useGraphStore } from '../../../store/GraphContext';
import { ForceGraphMethods } from 'react-force-graph-2d';

interface UseNodeSelectionReturn {
  selectedNode: GraphNode | null;
  visibleLinks: Map<GraphLink, number>;
  selectNode: (node: GraphNode | null, graphRef?: RefObject<ForceGraphMethods>) => void;
}

/**
 * Hook to manage node selection, visible link state, and associated nodes
 */
export const useNodeSelection = (
  data: GraphData,
  config: GraphConfig,
): UseNodeSelectionReturn => {
  const { selectedNode, visibleLinks, updateSelection } = useGraphStore();

  /**
   * Navigate to a node with smooth animation
   */
  const navigateToNode = (node: GraphNode, graphRef?: RefObject<ForceGraphMethods>) => {
    if (node && graphRef?.current && node.x !== undefined && node.y !== undefined) {
      // First center on the node
      graphRef.current.centerAt(node.x, node.y, 1000);
      
      // Then zoom in with a slight delay for smooth transition
      setTimeout(() => {
        graphRef.current?.zoom(4, 1000);
      }, 50);
    }
  };

  /**
   * Get top N connections for a node based on weight
   */
  const getTopConnections = (node: GraphNode) => {
    // Filter links connected to the node
    const nodeLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === node.id || targetId === node.id;
    });
    
    // Get associated nodes with weights and sort by weight
    const nodeConnections = nodeLinks
      .map(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const connectedNodeId = sourceId === node.id ? targetId : sourceId;
        const connectedNode = data.nodes.find(n => n.id === connectedNodeId);
        
        return {
          node: connectedNode!,
          link,
          weight: getWeight(link, config)
        };
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 20);  // Take top 20 connections

    // Create map of visible links with scaled weights (4 to 1)
    const linkMap = new Map<GraphLink, number>();
    nodeConnections.forEach((conn, index) => {
      linkMap.set(conn.link, (20 - index) / 5);
    });

    return {
      links: linkMap,
      nodes: nodeConnections.map(({ node, weight }) => ({ node, weight }))
    };
  };

  /**
   * Select a node and handle all associated state updates
   */
  const selectNode = (node: GraphNode | null, graphRef?: RefObject<ForceGraphMethods>) => {
    if (selectedNode?.id === node?.id) {
      // Deselect node
      updateSelection(null, [], new Map()); // Update global state with empty links
    } else if (node) {
      // Select node and show connections
      const connections = getTopConnections(node);
      updateSelection(node, connections.nodes, connections.links); // Update global state with new links
      
      // Navigate to the selected node if graphRef is provided
      navigateToNode(node, graphRef);
    }
  };

  return {
    selectedNode,
    visibleLinks,
    selectNode
  };
};