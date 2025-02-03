import { GraphNode } from '../../types/nodes';
import { colorMap } from '../../constants/colors';
import { NODE_SIZES } from '../../constants/sizes';

interface CircleNodeOptions {
  x: number;
  y: number;
  size: number;
  useRankSize: boolean; 
  maxRank: number; 
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
 
  static render(node: GraphNode, ctx: CanvasRenderingContext2D, options: CircleNodeOptions) {
    const { x, y, useRankSize, maxRank } = options;
    const radius = this.getNodeSize(node.rank, useRankSize, maxRank);

    if (node.colors.length > 1) {
      this.renderPieChart(node, ctx, x, y, radius);
    } else {
      this.renderSingleColorCircle(node, ctx, x, y, radius);
    }
  }

  private static renderPieChart(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ) {
    const sliceAngle = (2 * Math.PI) / node.colors.length;
    node.colors.forEach((color, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
      this.drawPieSlice(ctx, x, y, radius, startAngle, endAngle, colorMap[color]);
    });
  }

  private static renderSingleColorCircle(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = node.colors?.length === 1 ? colorMap[node.colors[0]] : '#666';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
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
    ctx.stroke();
  }
}