import { memo, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, GraphConfig, GraphLink, GraphNode } from '../types/graph';
import * as d3 from 'd3';  // Add this import

interface ForceGraphProps {
  data: GraphData;
  config: GraphConfig;
}

const ForceGraph = memo(({ data, config }: ForceGraphProps) => {
 
  // Debug: Log when weight type changes
  useEffect(() => {
    console.log('Current weight type:', config.weightType);
    console.log('Sample of weights being used:', data.links.slice(0, 3).map(link => ({
      source: link.source,
      target: link.target,
      weight: config.weightType === 'normalized' ? link.normalized_weight :
             config.weightType === 'composite' ? link.composite_weight :
             config.weightType === 'uniqueness' ? link.uniqueness_weight :
             link.raw_weight
    })));
  }, [config.weightType, data]);



  if (!data.nodes.length || !data.links.length) {
    return <div>Loading graph data...</div>;
  }



  useEffect(() => {
    // Log all links with significant raw weights
    const significantLinks = data.links
      .filter(link => link.raw_weight > 0.5)  // Adjust threshold as needed
      .map(link => ({
        source: link.source.id || link.source,
        target: link.target.id || link.target,
        weight: link.raw_weight
      }));
    
    console.log('Significant raw weight connections:', significantLinks);
  }, [data]);


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



  const accentuateWeight = (weight: number): number => {
    // Exponential function to emphasize differences
    // Values < 0.5 will become much smaller
    // Values > 0.5 will become larger
    // return Math.pow(weight, 2);  // Cube the weight to create more extreme differences
    return weight;
    // Alternative: Even more extreme curve
    // return Math.pow(weight, 4);  // Fourth power for more extreme separation
  };



  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ForceGraph2D
        graphData={data}
        width={2000}
        height={2000}
        d3Force="charge"
        d3VelocityDecay={0.1} // Keep momentum longer
        d3AlphaDecay={0.0228}  // Much slower decay (default 0.0228)
        cooldownTicks={1000}  // Run simulation longer
        nodeRelSize={6}
        nodeCanvasObject={(node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
          // Node circle
          const radius = 20; // Base radius
          const scaledRadius = radius * config.nodeSizeScale;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, scaledRadius, 0, 2 * Math.PI);
          ctx.fillStyle = node.colors?.length === 1 ? colorMap[node.colors[0]] : '#666';
          ctx.fill();

          // Label settings
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const maxWidth = 100/globalScale; // Max width for text wrapping
          
          // Wrap text into multiple lines
          const lines = wrapText(ctx, node.id, maxWidth);
          const lineHeight = fontSize * 1.2;
          const totalHeight = lineHeight * lines.length;
          
          // Position text below node with padding
          const textY = node.y! + scaledRadius + (fontSize/2); // Start below node
          
          // Draw background for all lines
          const padding = 2;
          const maxLineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
          const bgWidth = maxLineWidth + (padding * 2);
          const bgHeight = totalHeight + (padding * 2);
          const bgX = node.x! - (bgWidth/2);
          const bgY = textY - (fontSize/2);
          
          // Draw background
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
        linkVisibility={false}  // Change to true to see the links
        linkWidth={(link: any) => {
          const weight = config.weightType === 'normalized' ? link.normalized_weight :
                        config.weightType === 'composite' ? link.composite_weight :
                        config.weightType === 'uniqueness' ? link.uniqueness_weight :
                        link.raw_weight;
          // Multiply by 5 to make differences more obvious
          return weight * config.linkWidthScale * 5;  
        }}
        // Optional: Add link color based on weight for even more visibility
        linkColor={(link: any) => {
          const weight = config.weightType === 'normalized' ? link.normalized_weight :
                        config.weightType === 'composite' ? link.composite_weight :
                        config.weightType === 'uniqueness' ? link.uniqueness_weight :
                        link.raw_weight;
          // Darker color means stronger connection
          const opacity = Math.max(0.1, weight);
          return `rgba(50, 50, 50, ${opacity})`;
        }}


   ref={(el: any) => {
      if (el) {
    // Set charge force
      el.d3Force('charge').strength(config.chargeStrength);
            
    // Set link force with dynamic weight selection and strength multiplier
    el.d3Force('link')
      .distance(config.linkDistance)
      .strength((link: any) => {
        const weight = config.weightType === 'normalized' ? link.normalized_weight :
                      config.weightType === 'composite' ? link.composite_weight :
                      config.weightType === 'uniqueness' ? link.uniqueness_weight :
                      link.raw_weight
              const accentuatedWeight = accentuateWeight(weight);
              console.log(`Original weight: ${weight}, Accentuated: ${accentuatedWeight}`);
             return accentuatedWeight * config.linkStrength;
      });
              
            // Set center force
            el.d3Force('center').strength(config.centerForce);


         // Remove any other forces if they exist
            el.d3Force('radial', null);
            el.d3Force('x', null);
            el.d3Force('y', null);

            // Add collision force
            el.d3Force('collide', d3.forceCollide()
              .radius(10)  // Adjust this value to control spacing between nodes
              .strength(1)
            );
            
            // Reheat the simulation
            el.d3ReheatSimulation();
          }
        }}
      />
    </div>
  );
});

// Color mappings
const colorMap: Record<string, string> = {
  'W': '#F9FAF4',
  'U': '#0E68AB',
  'B': '#150B00',
  'R': '#D3202A',
  'G': '#00733E'
};

ForceGraph.displayName = 'ForceGraph';

export default ForceGraph;