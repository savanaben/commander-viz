import { GraphNode } from '../../types/nodes';
import { colorMap } from '../../constants/colors';
import { NODE_SIZES } from '../../constants/sizes';

interface CircleNodeOptions {
  x: number;
  y: number;
  size: number;
  useRankSize: boolean; 
  maxRank: number;
  selectedTribe: string | null;
}

/**
 * Renders nodes as circles or pie charts based on color count
 */
export class CircleNode {
  static getNodeSize(rank: number, useRankSize: boolean, maxRank: number): number {
    // If rank sizing is off, return base circle radius as defined in constants
    if (!useRankSize) return NODE_SIZES.CIRCLE_RADIUS;
    
    // Normalize rank based on actual maximum rank in dataset
    const normalizedRank = (rank - 1) / (maxRank - 1);  // rank 1 = 0.0, maxRank = 1.0
    
    // Linear interpolation (lerp) between MAX and MIN sizes
    return NODE_SIZES.RANK_MAX_SIZE * (1 - normalizedRank) + NODE_SIZES.RANK_MIN_SIZE;
  }

  static getTribeBorderWidth(node: GraphNode, selectedTribe: string | null): number {
    if (!selectedTribe || !node.tribes) return 0;
    
    // Find the tribe's position in the node's tribes array
    const tribeIndex = node.tribes.findIndex(t => t.name === selectedTribe);
    
    // Return border width based on position (3px for first, 2px for second, 1px for third)
    if (tribeIndex === 0) return 3;
    if (tribeIndex === 1) return 2;
    if (tribeIndex === 2) return 1;
    return 0;
  }
 
  static render(node: GraphNode, ctx: CanvasRenderingContext2D, options: CircleNodeOptions) {
    const { x, y, useRankSize, maxRank, selectedTribe } = options;
    const radius = this.getNodeSize(node.rank, useRankSize, maxRank);
    const borderWidth = this.getTribeBorderWidth(node, selectedTribe);

    if (node.colors.length > 1) {
      this.renderPieChart(node, ctx, x, y, radius, borderWidth);
    } else {
      this.renderSingleColorCircle(node, ctx, x, y, radius, borderWidth);
    }
  }

  private static renderPieChart(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    borderWidth: number
  ) {
    // Save context state
    ctx.save();
    
    // Draw tribe border if needed
    if (borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(x, y, radius + borderWidth, 0, 2 * Math.PI);
      ctx.fillStyle = '#228be6'; // Mantine blue
      ctx.fill();
    }

    // Draw pie slices
    const sliceAngle = (2 * Math.PI) / node.colors.length;
    node.colors.forEach((color, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
      this.drawPieSlice(ctx, x, y, radius, startAngle, endAngle, colorMap[color]);
    });

    // Restore context state
    ctx.restore();
  }

  private static renderSingleColorCircle(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    borderWidth: number
  ) {
    // Save context state
    ctx.save();
    
    // Draw tribe border if needed
    if (borderWidth > 0) {
      ctx.beginPath();
      ctx.arc(x, y, radius + borderWidth, 0, 2 * Math.PI);
      ctx.fillStyle = '#228be6'; // Mantine blue
      ctx.fill();
    }

    // Draw main circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.colors?.length === 1 ? colorMap[node.colors[0]] : '#666';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Restore context state
    ctx.restore();
  }

  private static drawPieSlice(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: string
  ) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}