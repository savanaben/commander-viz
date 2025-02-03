import { useState, useEffect } from 'react';
import type { GraphData } from '../types/config';
import type { GraphNode } from '../types/nodes';
import type { GraphLink } from '../types/links';

// Import JSON directly
const nodesData = await import('../data/nodes.json', { assert: { type: 'json' } });
const edgesData = await import('../data/edges.json', { assert: { type: 'json' } });

export const useGraphData = () => {
    const [graphData, setGraphData] = useState<GraphData>({
      nodes: [],
      links: []
    });

  useEffect(() => {
    try {
      // Access the default export from the JSON modules
      const nodes = nodesData.default;
      const edges = edgesData.default;

      console.log('Imported nodes:', nodes);
      console.log('Imported edges:', edges);

      if (!nodes || !edges) {
        console.error('Failed to load data:', { nodes, edges });
        return;
      }

      // Ensure proper typing of the data
      const formattedNodes = Object.values(nodes) as GraphNode[];
      const formattedEdges = Object.values(edges) as GraphLink[];

      // Create properly typed GraphData object
      const formattedData: GraphData = {
        nodes: formattedNodes,
        links: formattedEdges.map(edge => ({
          ...edge,
          // Ensure source and target are strings
          source: typeof edge.source === 'object' ? edge.source.id : edge.source,
          target: typeof edge.target === 'object' ? edge.target.id : edge.target
        }))
      };

      console.log('Setting formatted data:', formattedData);
      setGraphData(formattedData);
    } catch (error) {
      console.error('Error in useGraphData:', error);
    }
  }, []);

  return graphData;
};