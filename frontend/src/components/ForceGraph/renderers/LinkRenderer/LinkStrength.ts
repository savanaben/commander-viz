import { GraphLink } from '../../types/links';
import { GraphConfig } from '../../types/config';

/**
 * Handles link force/weight calculations
 * Used by force simulation to determine link distances and strengths
 */
export class LinkStrength {
  /**
   * Calculate link weight based on config type
   */
  static getWeight(link: GraphLink, config: GraphConfig): number {
    switch (config.weightType) {
      case 'normalized': return link.normalized_weight;
      case 'composite': return link.composite_weight;
      case 'uniqueness': return link.uniqueness_weight;
      case 'tribes': return link.tribes_weight;
      case 'tribes_simplified': return link.tribes_simplified_weight;
      default: return link.raw_weight;
    }
  }

  /**
   * Calculate link distance based on weight
   */
  static getDistance(link: GraphLink, config: GraphConfig): number {
    const weight = this.getWeight(link, config);
    const maxDistance = 300;
    const minDistance = 30;
    
    // Square the inverse weight for more dramatic close relationships
    return maxDistance * Math.pow(1 - weight, 2) + minDistance;
  }

  /**
   * Calculate link strength based on weight and whether it's a top connection
   */
  static getStrength(
    link: GraphLink, 
    config: GraphConfig, 
    isTopConnection: boolean
  ): number {
    if (!isTopConnection) {
      return 0; // No force for non-top connections
    }

    const weight = this.getWeight(link, config);
    return weight < 0.0 ? 0 : weight * 3;
  }
}