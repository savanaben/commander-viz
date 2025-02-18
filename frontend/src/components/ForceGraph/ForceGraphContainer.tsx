import { memo, forwardRef, useMemo, useState, useEffect, useCallback, MutableRefObject } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import type { GraphData, GraphConfig, GraphNode, GraphLink } from './types/config';
import { useNodeImages } from './hooks/useNodeImages';
import { useFilteredData } from './hooks/useFilteredData';
import { useForceSimulation } from './hooks/useForceSimulation';
import { useNodeSelection } from './hooks/useNodeSelection';
import { NodeRenderer } from './renderers/NodeRenderer';
import { useGraphStore } from '../../store/GraphContext';
import './ForceGraph.css';

interface ForceGraphProps {
  data: GraphData;
  config: GraphConfig;
}

/**
 * Main ForceGraph container component
 * Uses forwardRef to expose graph methods to parent for search/zoom functionality
 */
export const ForceGraphContainer = memo(
  forwardRef<ForceGraphMethods, ForceGraphProps>(({ data, config }, ref) => {
    // State for container dimensions and position
    const [dimensions, setDimensions] = useState({ 
      width: window.innerWidth,
      height: window.innerHeight,
      left: 0
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
      selectNode 
    } = useNodeSelection(data, config);
    
    // Initialize force simulation with forwarded ref
    useForceSimulation({
      fgRef: ref as React.MutableRefObject<ForceGraphMethods>,
      data: filteredData,
      config,
      selectedNode: selectedNode?.id ?? null
    });

    // Get selected tribe from global context
    const { selectedTribe } = useGraphStore();

    // Handle window resize and sidebar toggle
    const updateDimensions = useCallback(() => {
      const sidebarWidth = config.sidebarWidth || 300;
      const totalWidth = window.innerWidth;
      const graphWidth = totalWidth;
      
      // Calculate the offset to maintain center position
      // We want the graph to be centered in the available space (total width - sidebar width)
      const availableWidth = totalWidth - sidebarWidth;
      const offset = -((graphWidth - availableWidth) / 2);

      setDimensions({
        width: graphWidth, // Full window width
        height: window.innerHeight,
        left: offset // Negative offset to shift left
      });
    }, [config.sidebarWidth]);

    useEffect(() => {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }, [updateDimensions]);

    // Handle node click events
    const onNodeClicked = useCallback((node: GraphNode) => {
      if (!ref) return;
      selectNode(node, { current: (ref as MutableRefObject<ForceGraphMethods>).current });
    }, [selectNode, ref]);

    if (!data.nodes.length || !data.links.length) {
      return <div>Loading graph data...</div>;
    }

    return (
      <div 
        className="force-graph-container"
        style={{
          position: 'fixed',
          top: 0,
          left: dimensions.left,
          width: dimensions.width,
          height: dimensions.height,
          overflow: 'hidden'
        }}
      >
        <ForceGraph2D
          ref={ref as React.MutableRefObject<ForceGraphMethods>}
          graphData={filteredData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#f8f9fa"
          onNodeClick={(node) => onNodeClicked(node as unknown as GraphNode)}
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
              maxRank,
              selectedTribe
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