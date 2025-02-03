import { useMemo } from 'react';
import { GraphData, GraphConfig } from '../types/config';

/**
 * Hook to filter graph data based on selected colors
 * Currently handles color filtering, but structured to support future filtering options
 */
export const useFilteredData = (data: GraphData, config: GraphConfig): { filteredData: GraphData } => {
  const filteredData = useMemo(() => {
    // If no colors selected, show all nodes
    if (!config.selectedColors.length) {
      return data;
    }

    // Filter nodes based on selected colors
    const filteredNodes = data.nodes.filter(node => {
      // Special handling for colorless commanders
      if (node.colors.length === 0) {
        return config.selectedColors.includes('C');
      }

      // For colored commanders, ALL of their colors must be in the selected colors
      return node.colors.every(color => config.selectedColors.includes(color));
    });

    // Filter links - only keep links where both nodes are in filtered set
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks
    };
  }, [data, config.selectedColors]);

  return { filteredData };
};