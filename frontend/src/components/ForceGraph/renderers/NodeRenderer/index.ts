import { GraphNode } from '../../types/nodes';
import { CircleNode } from './CircleNode';
import { ImageNode } from './ImageNode';
import { NodeLabel } from './NodeLabel';
import { DETAIL_THRESHOLD } from '../../constants/thresholds';
import { NODE_SIZES } from '../../constants/sizes';

interface RenderOptions {
  loadImage: (node: GraphNode) => Promise<HTMLImageElement>;
  nodeImages: Map<string, HTMLImageElement>;
  selectedNode: GraphNode | null;
  globalScale: number;
  useRankSize: boolean;
  maxRank: number;
  selectedTribe: string | null;
}

/**
 * Main orchestrator for node rendering
 * Decides between circle/pie or image rendering based on zoom level
 * Renders labels first, then nodes on top for proper z-indexing
 */
export class NodeRenderer {
  static render(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
    options: RenderOptions
  ) {
    const {
      loadImage,
      nodeImages,
      selectedNode,
      useRankSize,
      maxRank,
      selectedTribe
    } = options;

    const x = node.x || 0;
    const y = node.y || 0;

    // Calculate size based on view mode
    const nodeSize = globalScale < DETAIL_THRESHOLD 
      ? CircleNode.getNodeSize(node.rank, useRankSize, maxRank)
      : NODE_SIZES.CARD_BASE_SIZE;

    // Render label first (will be underneath node)
    NodeLabel.render(node, ctx, { 
      x, 
      y, 
      size: globalScale < DETAIL_THRESHOLD ? nodeSize : NODE_SIZES.CARD_BASE_SIZE, 
      globalScale 
    });

    // Render node on top
    if (globalScale < DETAIL_THRESHOLD) {
      CircleNode.render(node, ctx, { x, y, size: nodeSize, useRankSize, maxRank, selectedTribe });
    } else {
      ImageNode.render(node, ctx, { x, y, size: NODE_SIZES.CARD_BASE_SIZE, globalScale, loadImage });
    }
  }

  private static renderNodeImage(
    node: GraphNode,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    loadImage: (node: GraphNode) => Promise<HTMLImageElement>,
    nodeImages: Map<string, HTMLImageElement>
  ) {
    const imageUrl = node.image_uris?.small;
    if (!nodeImages.has(imageUrl)) {
      loadImage(node);
      return;
    }

    const img = nodeImages.get(imageUrl);
    if (img) {
      const size = 30;
      ctx.drawImage(img, x - size/2, y - size/2, size, size);
    }
  }
}

// Export the RenderOptions type
export type { RenderOptions };