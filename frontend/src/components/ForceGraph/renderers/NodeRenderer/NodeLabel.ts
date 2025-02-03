import { GraphNode } from '../../types/nodes';
import { DETAIL_THRESHOLD } from '../../constants/thresholds';
import { wrapText } from '../../utils/textHandling';
import { TEXT_SIZES } from '../../constants/sizes';

interface NodeLabelOptions {
  x: number;
  y: number;
  size: number;
  globalScale: number;
}

/**
 * Renders node labels with background highlighting and text wrapping
 */
export class NodeLabel {
  static render(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    options: NodeLabelOptions
  ) {
    const { x, y, size, globalScale } = options;
    
    // Calculate font size based on zoom level, but cap at max size
    const fontSize = Math.min(TEXT_SIZES.BASE_FONT_SIZE/globalScale, TEXT_SIZES.MAX_FONT_SIZE);
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Calculate maximum width for text wrapping
    const maxWidth = TEXT_SIZES.MAX_LABEL_WIDTH/globalScale;

    // Calculate vertical position for label
    const textY = this.getLabelY(globalScale, y, size, fontSize);
    
    // Split text into wrapped lines
    const lines = wrapText(ctx, node.id, maxWidth);
    
    // Setup text rendering properties
    const lineHeight = fontSize * TEXT_SIZES.LINE_HEIGHT;
    const padding = TEXT_SIZES.LABEL_PADDING/globalScale;  // Scale padding with zoom
    
    // Configure text alignment
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Render each line with its own highlight background
    lines.forEach((line, i) => {
      const lineY = textY + (i * lineHeight);
      
      // Calculate background dimensions
      const metrics = ctx.measureText(line);
      const bgWidth = metrics.width + (padding * 2);
      const bgHeight = fontSize + (padding * 2);
      const bgX = x - (bgWidth/2);
      const bgY = lineY - (bgHeight/2);

      // Render background with rounded corners
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';  // Semi-transparent white
      this.roundRect(ctx, bgX, bgY, bgWidth, bgHeight, 3/globalScale);  // Scale corner radius with zoom

      // Render text
      ctx.fillStyle = '#000';
      ctx.fillText(line, x, lineY);
    });
  }

  /**
   * Calculates the vertical position for the label based on zoom level
   * Uses different positioning for circle nodes vs card nodes
   */
  private static getLabelY(
    globalScale: number,
    y: number,
    size: number,
    fontSize: number
  ): number {
    if (globalScale < DETAIL_THRESHOLD) {
      // Circle node: Add minimum offset for better spacing
      const MIN_OFFSET = 0;  // Minimum pixels between node and label
      return y + (size) + MIN_OFFSET + (fontSize/2);
    } else {
      // Image node: Keep original card-based calculation
      const cardAspectRatio = 63/88;
      const cardWidth = size * 0.8;  // Original card scaling
      const cardHeight = cardWidth / cardAspectRatio;
      return y + (cardHeight/2) + (fontSize/2);
    }
  }

  /**
   * Helper method to draw a rectangle with rounded corners
   * Used for the text highlight background
   */
  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }
}