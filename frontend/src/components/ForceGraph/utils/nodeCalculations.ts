import { GraphNode } from '../types/nodes';

/**
 * Utility functions for node-related calculations
 */

/**
 * Gets the source ID from a node or link source
 */
export const getSourceId = (source: string | GraphNode): string => {
  return typeof source === 'object' ? source.id : source;
};

/**
 * Gets the target ID from a node or link target
 */
export const getTargetId = (target: string | GraphNode): string => {
  return typeof target === 'object' ? target.id : target;
};

/**
 * Checks if a node has a specific color
 */
export const hasColor = (node: GraphNode, color: string): boolean => {
  return node.colors.includes(color);
};