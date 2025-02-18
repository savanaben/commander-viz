import { useMemo } from 'react';
import { GraphData, GraphConfig } from '../types/config';

/**
 * Hook to filter graph data based on selected colors
 * Currently handles color filtering, but structured to support future filtering options
 */
export const useFilteredData = (data: GraphData, config: GraphConfig): { filteredData: GraphData } => {
  const filteredData = useMemo(() => {
    // Start with color filtering
    let filteredNodes = data.nodes;
    
    // Apply color filter if colors are selected
    if (config.selectedColors.length) {
      filteredNodes = filteredNodes.filter(node => {
        if (node.colors.length === 0) {
          return config.selectedColors.includes('C');
        }
        return node.colors.every(color => config.selectedColors.includes(color));
      });
    }

    // Apply date range filter
    filteredNodes = filteredNodes.filter(node => {
      const releaseDate = new Date(node.released_at);
      const startDate = new Date(config.dateRange.start);
      const endDate = new Date(config.dateRange.end);
      return releaseDate >= startDate && releaseDate <= endDate;
    });

    // Filter links based on remaining nodes
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
  }, [data, config.selectedColors, config.dateRange]);

  return { filteredData };
};