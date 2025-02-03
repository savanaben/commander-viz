import { useEffect } from 'react';
import { ForceGraphMethods } from 'react-force-graph-2d';
import * as d3 from 'd3';
import { GraphData, GraphConfig } from '../types/config';
import { getWeight } from '../utils/linkCalculations';
import { FORCE_CONSTANTS } from '../constants/thresholds';

interface UseForceSimulationProps {
  fgRef: React.MutableRefObject<ForceGraphMethods | undefined>;
  data: GraphData;
  config: GraphConfig;
  selectedNode: string | null;
}

/**
 * Hook to manage D3 force simulation configuration
 * Handles force setup, updates, and node positioning
 */
export const useForceSimulation = ({ fgRef, data, config, selectedNode }: UseForceSimulationProps) => {
  useEffect(() => {
    // Only proceed if we have both the ref and valid data
    if (!fgRef.current || !data.nodes.length || !data.links.length) return;

    console.log('Weight type changed to:', config.weightType);
    
    const fg = fgRef.current;

    // Clear existing forces to prevent clustering
    fg.d3Force('link', null);
    fg.d3Force('charge', null);
    fg.d3Force('center', null);
    fg.d3Force('collide', null);
    
    // Create a map of top N connections for each node
    const topConnectionsMap = new Map<string, Set<string>>();
    
    // Process each node to find its top N connections
    data.nodes.forEach(node => {
      const nodeConnections = data.links
        .filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return sourceId === node.id || targetId === node.id;
        })
        .sort((a, b) => getWeight(b, config) - getWeight(a, config))
        .slice(0, 4)  // Keep top n connections, cut the rest
        .map(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return sourceId === node.id ? targetId : sourceId;
        });
      
      topConnectionsMap.set(node.id, new Set(nodeConnections));
    });

    // Setup forces with a slight delay to ensure proper initialization
    setTimeout(() => {
      // Repulsion force
      fg.d3Force('charge', d3.forceManyBody()
        .strength(-50)
        .distanceMax(400)
      );
      
      // Link force with dynamic distance and strength
      fg.d3Force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)
        .distance((link: any) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          // Check if this is a top connection for either node
          const isTopConnection = 
            (topConnectionsMap.get(sourceId)?.has(targetId) || 
             topConnectionsMap.get(targetId)?.has(sourceId));

          if (!isTopConnection) {
            return 400; // Maximum distance for non-top connections
          }

          const weight = getWeight(link, config);
          const maxDistance = 300;
          const minDistance = 30;
          
          // Quadratic scaling for top connections
          return maxDistance * Math.pow(1 - weight, 2) + minDistance;
        })
        .strength((link: any) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          
          // Only apply strength to top connections
          const isTopConnection = 
            (topConnectionsMap.get(sourceId)?.has(targetId) || 
             topConnectionsMap.get(targetId)?.has(sourceId));

          if (!isTopConnection) {
            return 0; // No force for non-top connections
          }

          const weight = getWeight(link, config);
          return weight < 0.0 ? 0 : weight * 3;
        })
      );
      
      // Center and collision forces
      fg.d3Force('center', d3.forceCenter().strength(0.03));
      fg.d3Force('collide', d3.forceCollide().radius(10).strength(0.1));

      // Initial reheat
      fg.d3ReheatSimulation();
      
      // Secondary reheat after short delay
      setTimeout(() => {
        fg.d3ReheatSimulation();
      }, 100);
    }, 100);

  }, [config.weightType, data.nodes, data.links]);
};