import { GraphLink } from '../../types/links';
import { LinkVisibility } from './LinkVisibility';
import { LinkStrength } from './LinkStrength';

interface RenderOptions {
  visibleLinks: Map<GraphLink, number>;
}

/**
 * Main orchestrator for link rendering
 * Handles link visibility and width calculations
 */
export class LinkRenderer {
  static getVisibility(link: GraphLink, options: RenderOptions): boolean {
    return LinkVisibility.isVisible(link, options.visibleLinks);
  }

  static getWidth(link: GraphLink, options: RenderOptions): number {
    return LinkVisibility.getWidth(link, options.visibleLinks);
  }

  static getColor(): string {
    return '#666';
  }
}