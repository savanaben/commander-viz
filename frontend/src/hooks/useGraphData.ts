import { useState, useEffect } from 'react';
import { GraphData, GraphNode, GraphLink } from '../types/graph';

// Import JSON directly
const nodesData = await import('../data/nodes.json', { assert: { type: 'json' } });
const edgesData = await import('../data/edges.json', { assert: { type: 'json' } });

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });

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

      const formattedData: GraphData = {
        nodes: nodes as GraphNode[],
        links: edges as GraphLink[]
      };

      console.log('Setting formatted data:', formattedData);
      setGraphData(formattedData);
    } catch (error) {
      console.error('Error in useGraphData:', error);
    }
  }, []);

  return graphData;
};