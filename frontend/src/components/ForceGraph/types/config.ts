/**
 * Configuration types for the force graph
 */

import { GraphNode } from './nodes';
import { GraphLink } from './links';

// Re-export these types
export type { GraphNode, GraphLink };

// Weight calculation methods
export type WeightType = 
  | 'raw'
  | 'normalized'
  | 'composite'
  | 'uniqueness'
  | 'tribes'
  | 'tribes_simplified';

// Main configuration interface
export interface GraphConfig {
  weightType: WeightType;
  selectedColors: string[];
  useRankSize: boolean;  
  sidebarExpanded: boolean;
  sidebarWidth?: number;  // Width of the sidebar in pixels
  dateRange: {
    start: string;  // ISO date string
    end: string;    // ISO date string
  };

  // Optional force simulation parameters
  forceStrength?: number;
  linkDistance?: number;
  linkStrength?: number;
  centerForce?: number;
  collisionStrength?: number;
  chargeStrength?: number;
  linkSpring?: number;
  gravityStrength?: number;
  nodeSizeScale?: number;
  linkWidthScale?: number;
  dagMode?: string | null;
}

// Graph data structure
export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Force simulation configuration
export interface ForceConfig {
  velocityDecay: number;
  alphaDecay: number;
  cooldownTicks: number;
  warmupTicks: number;
}