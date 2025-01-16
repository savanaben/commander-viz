import { memo, useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { GraphData, GraphConfig, GraphNode, GraphLink } from '../types/graph';
import * as d3 from 'd3';


// helper function at the top of the file
const drawPieSlice = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    startAngle: number, 
    endAngle: number, 
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  };


// Color mappings
const colorMap: Record<string, string> = {
  'W': '#F3EACB',
  'U': '#0E68AB',
  'B': '#150B00',
  'R': '#D3202A',
  'G': '#00733E'
};

interface ForceGraphTestProps {
  data: GraphData;
  config: GraphConfig;
}

const ForceGraphTest = memo(({ data, config }: ForceGraphTestProps) => {
  const fgRef = useRef<ForceGraphMethods>();


  // state for selected node
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [visibleLinks, setVisibleLinks] = useState<Map<GraphLink, number>>(new Map());

  //  helper function to get weight based on type
  const getWeight = (link: GraphLink) => {
    switch (config.weightType) {
      case 'normalized': return link.normalized_weight;
      case 'composite': return link.composite_weight;
      case 'uniqueness': return link.uniqueness_weight;
      case 'tribes': return link.tribes_weight;
      case 'tribes_simplified': return link.tribes_simplified_weight;
      default: return link.raw_weight;
    }
  };



// Filter nodes based on selected colors
const filteredData = useMemo(() => {
  if (!config.selectedColors.length) {
    return data; // Show all if no colors selected
  }

  const filteredNodes = data.nodes.filter(node => {
    // Handle colorless commanders
    if (node.colors.length === 0) {
      return config.selectedColors.includes('C');
    }

    // For colored commanders, ALL of their colors must be in the selected colors
    return node.colors.every(color => config.selectedColors.includes(color));
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
}, [data, config.selectedColors]);





//  function to get top 10 connections for a node
const getTopConnections = (nodeId: string) => {
    // Debug log to check incoming links
    console.log('Finding connections for node:', nodeId);

  const nodeLinks = data.links.filter(link => {
    // Handle both string IDs and object references
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === nodeId || targetId === nodeId;
  });
  
  console.log('Found links:', nodeLinks.length);
  
  return nodeLinks
    .sort((a, b) => getWeight(b) - getWeight(a))
    .slice(0, 20)  //number of edge connections shown
    .reduce((acc, link) => {
      acc.set(link, (20 - acc.size) / 5); // it's 20/5 to maintain 4 to 1 width range
      return acc;
    }, new Map<GraphLink, number>());
};


  // Update link visibility when node is clicked
  const handleNodeClick = (node: GraphNode) => {
    console.log('Node clicked:', node);
    
    if (selectedNode === node.id) {
      console.log('Deselecting node');
      setSelectedNode(null);
      setVisibleLinks(new Map());
    } else {
      console.log('Selecting node:', node.id);
      setSelectedNode(node.id);
      const connections = getTopConnections(node.id);
      console.log('New connections:', connections);
      setVisibleLinks(connections);
    }
  };

  //  debug logging for link showing
  useEffect(() => {
    console.log('Selected Node:', selectedNode);
    console.log('Visible Links:', visibleLinks);
  }, [selectedNode, visibleLinks]);





// Effect to update forces and reheat simulation when weight type changes
useEffect(() => {
  // Only proceed if we have both the ref and valid data
  if (fgRef.current && data.nodes.length > 0 && data.links.length > 0) {
    console.log('Weight type changed to:', config.weightType);
    
    // Create a new simulation with the current data
    const fg = fgRef.current;

    // Initial setup to prevent clustering
    fg.d3Force('link', null);  // Clear existing forces
    fg.d3Force('charge', null);
    fg.d3Force('center', null);
    fg.d3Force('collide', null);
    
    // Wait longer on initial setup to ensure nodes are properly registered
    setTimeout(() => {
      //  repulsion force is negative
      fg.d3Force('charge', d3.forceManyBody()
        .strength(-50)
        .distanceMax(400)
      );
      
      // Modified link force with dynamic distance
      fg.d3Force('link', d3.forceLink(data.links)
        .id((d: any) => d.id)


        // .distance((link: any) => {
        //   const weight = config.weightType === 'normalized' ? link.normalized_weight :
        //                 config.weightType === 'composite' ? link.composite_weight :
        //                 config.weightType === 'uniqueness' ? link.uniqueness_weight :
        //                 config.weightType === 'tribes' ? link.tribes_weight :
        //                 link.raw_weight;
          
        //   const maxDistance = 400;  // Maximum distance for weight = 0
        //   const minDistance = 50;   // Minimum distance for weight = 0.6
        //   const maxWeight = .8;    // Maximum expected weight
          
        //   // Distance scaling (exponential decay)
        //   return maxDistance * Math.exp(-(weight/maxWeight) * 2) + minDistance;
        // })


          // Option 2: Quadratic scaling (more aggressive for high weights)
          .distance((link: any) => {
            const weight = getWeight(link);
            const maxDistance = 400;
            const minDistance = 50;
            
            // Square the inverse weight for more dramatic close relationships
            return maxDistance * Math.pow(1 - weight, 2) + minDistance;
          })

          

        .strength((link: any) => {
          // Use same weight type for strength
          const weight = config.weightType === 'normalized' ? link.normalized_weight :
                        config.weightType === 'composite' ? link.composite_weight :
                        config.weightType === 'uniqueness' ? link.uniqueness_weight :
                        config.weightType === 'tribes' ? link.tribes_weight :
                        link.raw_weight;
               //lets you set a threshold where below you ignore weight
              return weight < 0.1 ? 0 : weight * .5;
           })
      );
      
      fg.d3Force('center', d3.forceCenter()
        .strength(0.03)
      );
      
      fg.d3Force('collide', d3.forceCollide()
        .radius(5)
        .strength(0.1)
      );

      // Reheat simulation after forces are initialized
      fg.d3ReheatSimulation();
      
      // Additional reheat after a short delay to ensure proper force application
      setTimeout(() => {
        fg.d3ReheatSimulation();
      }, 100);
    }, 100); //  initial delay
  }
}, [config.weightType, data.nodes, data.links]);



  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  if (!data.nodes.length || !data.links.length) {
    return <div>Loading graph data...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={filteredData}
        width={window.innerWidth}
        height={window.innerHeight}
        backgroundColor="#ffffff"
        onNodeClick={handleNodeClick}
        linkVisibility={(link: GraphLink) => visibleLinks.has(link)}
        linkWidth={(link: GraphLink) => visibleLinks.get(link) || 0}
        linkColor={() => '#666'}
        
// Update the nodeCanvasObject prop in the ForceGraph2D component
nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const radius = 5;
    const x = node.x!;
    const y = node.y!;
  
    // Draw node as pie chart if multiple colors, or solid circle if single color
    if (node.colors.length > 1) {
      const sliceAngle = (2 * Math.PI) / node.colors.length;
      node.colors.forEach((color, i) => {
        const startAngle = i * sliceAngle - Math.PI / 2; // Start from top
        const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
        drawPieSlice(
          ctx,
          x,
          y,
          radius,
          startAngle,
          endAngle,
          colorMap[color]
        );
      });
    } else {
      // Single color node
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.colors?.length === 1 ? colorMap[node.colors[0]] : '#666';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
    }

          // Label settings
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const maxWidth = 100/globalScale;
          
          // Wrap text into multiple lines
          const lines = wrapText(ctx, node.id, maxWidth);
          const lineHeight = fontSize * 1.2;
          const totalHeight = lineHeight * lines.length;
          
          // Position text below node
          const textY = node.y! + radius + (fontSize/2);
          
          // Draw background
          const padding = 2;
          const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
          const bgWidth = maxLineWidth + (padding * 2);
          const bgHeight = totalHeight + (padding * 2);
          const bgX = node.x! - (bgWidth/2);
          const bgY = textY - (fontSize/2);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(bgX, bgY, bgWidth, bgHeight);

          // Draw text lines
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';
          lines.forEach((line, i) => {
            const y = textY + (i * lineHeight);
            ctx.fillText(line, node.x!, y);
          });
        }}
        nodeRelSize={5}
        
        // linkVisibility={false}
        // linkWidth={(link: any) => {
        //   const weight = link.raw_weight;
        //   return weight * 5;
        // }}
        // linkColor={() => '#999'}
        
        d3VelocityDecay={0.3}      // Increased from 0.1 (more damping)
        d3AlphaDecay={0.01}        // Increased from 0.01 (faster settling)
        cooldownTicks={500}         // Reduced from 100 (quicker initial stabilization)
        warmupTicks={0}           // Add warmup ticks to pre-stabilize
      />
    </div>
  );
});

ForceGraphTest.displayName = 'ForceGraphTest';

export default ForceGraphTest;