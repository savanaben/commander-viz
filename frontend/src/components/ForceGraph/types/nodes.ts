/**
 * Core node type definitions for the force graph
 */

export interface GraphNode {
    id: string;
    name?: string; 
    deck_count: number;
    rank: number;
    colors: string[];
    card_counts: {
      'High Synergy Cards': number;
      'New Cards': number;
      Creatures: number;
      Instants: number;
      Sorceries: number;
      Enchantments: number;
      'Mana Artifacts': number;
      Planeswalkers: number;
      'Utility Lands': number;
      Lands: number;
    };
    released_at: string;
    image_uris: {
      small: string;
      normal: string;
    };
    edhrec_rank: number;
    type_line: string;
    // Force graph properties
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    index?: number;
  }
  
  // For node image caching
  export type NodeImageMap = Map<string, HTMLImageElement>;