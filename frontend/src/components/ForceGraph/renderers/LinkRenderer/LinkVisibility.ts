import { GraphLink } from '../../types/links';

/**
 * Handles link visibility and width calculations
 * Currently based on selected node's top connections
 */
export class LinkVisibility {
  static isVisible(link: GraphLink, visibleLinks: Map<GraphLink, number>): boolean {
    return visibleLinks.has(link);
  }

  static getWidth(link: GraphLink, visibleLinks: Map<GraphLink, number>): number {
    return visibleLinks.get(link) || 0;
  }
}