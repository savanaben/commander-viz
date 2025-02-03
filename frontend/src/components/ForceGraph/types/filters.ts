/**
 * Filter-related type definitions
 */

export interface ColorFilter {
    color: string;
    selected: boolean;
    label: string;
  }
  
  export interface FilterState {
    colors: ColorFilter[];
    deckCount?: {
      min: number;
      max: number;
    };
    // Future filter types can be added here
  }
  
  export interface FilterConfig {
    minWeight?: number;          // Minimum weight threshold for showing links
    maxConnections?: number;     // Maximum number of connections per node
    showLabels?: boolean;        // Whether to show node labels
    minDeckCount?: number;       // Minimum deck count for showing nodes
    maxDeckCount?: number;       // Maximum deck count for showing nodes
  }