import { memo, forwardRef, useMemo, useState, useEffect, useCallback } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import type { GraphData, GraphConfig, GraphNode, GraphLink } from './types/config';
import { useNodeImages } from './hooks/useNodeImages';
import { useFilteredData } from './hooks/useFilteredData';
import { useForceSimulation } from './hooks/useForceSimulation';
import { useNodeSelection } from './hooks/useNodeSelection';
import { NodeRenderer } from './renderers/NodeRenderer';
import './ForceGraph.css';

interface ForceGraphProps {
  data: GraphData;
  config: GraphConfig;
  onNodeSelect: (node: GraphNode | null, associatedNodes: Array<{node: GraphNode, weight: number}>) => void;
}

/**
 * Main ForceGraph container component
 * Uses forwardRef to expose graph methods to parent for search/zoom functionality
 */
export const ForceGraphContainer = memo(
  forwardRef<ForceGraphMethods, ForceGraphProps>(({ data, config, onNodeSelect }, ref) => {
    // State for container dimensions
    const [dimensions, setDimensions] = useState({ 
      width: window.innerWidth - (config.sidebarExpanded ? 300 : 50),
      height: window.innerHeight 
    });
    
    // Calculate max rank once when data changes
    const maxRank = useMemo(() => 
      Math.max(...data.nodes.map(node => node.rank)), 
      [data.nodes]
    );

    // Custom hooks for various functionalities
    const { nodeImages, loadImage } = useNodeImages();
    const { filteredData } = useFilteredData(data, config);
    const { 
      selectedNode, 
      visibleLinks,
      handleNodeClick 
    } = useNodeSelection(data, config, onNodeSelect);
    
    // Initialize force simulation with forwarded ref
    useForceSimulation({
      fgRef: ref as React.MutableRefObject<ForceGraphMethods>,
      data: filteredData,
      config,
      selectedNode: selectedNode?.id ?? null
    });

    // Handle window resize and sidebar toggle
    const updateDimensions = useCallback(() => {
      const sidebarWidth = config.sidebarExpanded ? 300 : 50;
      setDimensions({
        width: window.innerWidth - sidebarWidth,
        height: window.innerHeight
      });
    }, [config.sidebarExpanded]);

    useEffect(() => {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    if (!data.nodes.length || !data.links.length) {
      return <div>Loading graph data...</div>;
    }

    return (
      <div className="force-graph-container">
        <ForceGraph2D
          ref={ref as React.MutableRefObject<ForceGraphMethods>}
          graphData={filteredData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#ffffff"
          onNodeClick={(node) => handleNodeClick(node as unknown as GraphNode)}
          linkVisibility={(link: LinkObject) => visibleLinks.has(link as unknown as GraphLink)}
          linkWidth={(link: LinkObject) => visibleLinks.get(link as unknown as GraphLink) || 0}
          linkColor={() => '#666'}
          nodeCanvasObject={(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => 
            NodeRenderer.render(node as unknown as GraphNode, ctx, globalScale, {
              loadImage,
              nodeImages,
              selectedNode,
              globalScale,
              useRankSize: config.useRankSize,
              maxRank   
            })
          }
          nodeRelSize={5}
          d3VelocityDecay={0.3}
          d3AlphaDecay={0.01}
          cooldownTicks={1000}
          warmupTicks={0}
        />
      </div>
    );
  })
);

ForceGraphContainer.displayName = 'ForceGraphContainer';