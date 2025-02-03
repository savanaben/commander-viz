import { GraphNode } from '../../types/nodes';

interface ImageNodeOptions {
  x: number;
  y: number;
  size: number;
  globalScale: number;
  loadImage: (node: GraphNode) => Promise<HTMLImageElement>;
}

/**
 * Renders nodes as card images when zoomed in
 */
export class ImageNode {
  static render(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    options: ImageNodeOptions
  ) {
    const { x, y, size, globalScale, loadImage } = options;
    const cardAspectRatio = 63/88;
    const width = size * .8;
    const height = width / cardAspectRatio;

    loadImage(node).then(img => {
      ctx.save();
      
      // Draw card image
      ctx.drawImage(
        img,
        x - width/2,
        y - height/2,
        width,
        height
      );
      
      // Draw border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 / globalScale;
      ctx.strokeRect(
        x - width/2,
        y - height/2,
        width,
        height
      );
      
      ctx.restore();
    });
  }
}