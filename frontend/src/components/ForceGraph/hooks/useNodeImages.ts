import { useState } from 'react';
import { GraphNode } from '../types/nodes';

interface UseNodeImagesReturn {
  nodeImages: Map<string, HTMLImageElement>;
  loadImage: (node: GraphNode) => Promise<HTMLImageElement>;
}

/**
 * Hook to manage loading and caching of card images
 * Maintains a cache of loaded images to prevent repeated loading
 */
export const useNodeImages = (): UseNodeImagesReturn => {
  // Cache of loaded images indexed by node ID
  const [nodeImages] = useState<Map<string, HTMLImageElement>>(new Map());

  /**
   * Load and cache an image for a given node
   * Returns cached image if already loaded
   */
  const loadImage = (node: GraphNode): Promise<HTMLImageElement> => {
    // Return cached image if available
    if (nodeImages.has(node.id)) {
      return Promise.resolve(nodeImages.get(node.id)!);
    }

    // Load and cache new image
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        nodeImages.set(node.id, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = node.image_uris.normal; // Using normal size image
    });
  };

  return { nodeImages, loadImage };
};