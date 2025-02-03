import { GraphLink } from '../types/links';
import { GraphConfig } from '../types/config';

/**
 * Utility functions for link-related calculations
 */

/**
 * Gets the weight value for a link based on the current weight type
 */
export const getWeight = (link: GraphLink, config: GraphConfig): number => {
  switch (config.weightType) {
    case 'normalized':
      return link.normalized_weight;
    case 'composite':
      return link.composite_weight;
    case 'uniqueness':
      return link.uniqueness_weight;
    case 'tribes':
      return link.tribes_weight;
    case 'tribes_simplified':
      return link.tribes_simplified_weight;
    default:
      return link.raw_weight;
  }
};

/**
 * Calculates the display width for a link based on its position in the top connections
 */
export const getLinkWidth = (
  link: GraphLink, 
  topConnectionsCount: number, 
  maxWidth: number = 4
): number => {
  return (topConnectionsCount - 1) / maxWidth;
};