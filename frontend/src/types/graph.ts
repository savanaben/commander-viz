export interface GraphNode {
    id: string;
    deck_count: number;
    rank: number;
    colors: string[];
    card_counts: {
      "High Synergy Cards": number;
      "New Cards": number;
      Creatures: number;
      Instants: number;
      Sorceries: number;
      Enchantments: number;
      "Mana Artifacts": number;
      Planeswalkers: number;
      "Utility Lands": number;
      Lands: number;
    };
  }
  
  export interface GraphLink {
    source: string;
    target: string;
    raw_weight: number;
    normalized_weight: number;
    uniqueness_weight: number;
    tribes_weight: number;          
    tribes_simplified_weight: number;
    composite_weight: number;
  }
  
  // Create a type for the weight types
  export type WeightType = 'normalized' | 'composite' | 'uniqueness' | 'raw' | 'tribes' | 'tribes_simplified';
  
  export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
  }
  
  export interface GraphConfig {
    weightType: WeightType; 
    selectedColors: string[];
    // forceStrength: number;
    // linkDistance: number;
    // linkStrength: number; 
    // centerForce: number;
    // collisionStrength: number;
    // chargeStrength: number;    // Node repulsion strength
    // linkSpring: number;        // Link spring strength
    // gravityStrength: number;   // Global gravity strength
    // nodeSizeScale: number;     // Scale factor for node sizes
    // linkWidthScale: number;    // Scale factor for link widths
    // dagMode: string | null;    // DAG layout mode (null, 'td', 'bu', 'lr', 'rl', 'radialout', 'radialin')
  }