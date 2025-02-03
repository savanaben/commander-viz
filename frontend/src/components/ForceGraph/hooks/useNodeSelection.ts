import { useState, useEffect } from 'react';
import type { GraphNode } from '../types/nodes';
import type { GraphLink } from '../types/links';
import type { GraphData, GraphConfig } from '../types/config';
import { getWeight } from '../utils/linkCalculations';

interface UseNodeSelectionReturn {
  selectedNode: GraphNode | null;
  visibleLinks: Map<GraphLink, number>;
  associatedNodes: Array<{node: GraphNode, weight: number}>;  // Added associated nodes to return type
  handleNodeClick: (node: GraphNode) => void;
}

/**
 * Hook to manage node selection, visible link state, and associated nodes
 */
export const useNodeSelection = (
  data: GraphData,
  config: GraphConfig,
  onNodeSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void
): UseNodeSelectionReturn => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [visibleLinks, setVisibleLinks] = useState<Map<GraphLink, number>>(new Map());
  const [associatedNodes, setAssociatedNodes] = useState<Array<{node: GraphNode, weight: number}>>([]);

  /**
   * Get top N connections for a node based on weight
   * Returns both the visible links and the associated nodes
   */
  const getTopConnections = (node: GraphNode) => {
    console.log('Finding connections for node:', node.id);

    // Filter links connected to the node
    const nodeLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return sourceId === node.id || targetId === node.id;
    });
    
    console.log('Found links:', nodeLinks.length);
    
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
      // Remove the link property as it's not needed in the UI
      nodes: nodeConnections.map(({ node, weight }) => ({ node, weight }))
    };
  };

  /**
   * Handle node click events
   * Updates selected node, visible links, and associated nodes
   */
  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node);
    
    if (selectedNode?.id === node.id) {
      // Deselect node
      console.log('Deselecting node');
      setSelectedNode(null);
      setVisibleLinks(new Map());
      setAssociatedNodes([]);
      onNodeSelect(null, []); // Notify parent of deselection
    } else {
      // Select node and show connections
      console.log('Selecting node:', node);
      const connections = getTopConnections(node);
      setSelectedNode(node);
      setVisibleLinks(connections.links);
      setAssociatedNodes(connections.nodes);
      onNodeSelect(node, connections.nodes); // Notify parent of selection
    }
  };

  // Debug logging for selection changes
  useEffect(() => {
    console.log('Selected Node:', selectedNode);
    console.log('Visible Links:', visibleLinks);
    console.log('Associated Nodes:', associatedNodes);
  }, [selectedNode, visibleLinks, associatedNodes]);

  return {
    selectedNode,
    visibleLinks,
    associatedNodes,
    handleNodeClick
  };
};