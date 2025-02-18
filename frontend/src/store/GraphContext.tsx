/**
 * GraphContext: Global state management for the Force Graph visualization
 * 
 * This context manages state that needs to be accessed by multiple, potentially distant components
 * in the component tree. Specifically, it handles:
 * 1. Graph configuration (weightType, colors, date ranges, etc.)
 * 2. Selected node state
 * 3. Associated nodes for the selected node
 * 
 * WHEN TO USE CONTEXT VS PROPS:
 * 
 * Use Context (Global State) when:
 * - State needs to be accessed by many components at different levels
 * - State updates need to trigger changes in distant/unrelated components
 * - You want to avoid "prop drilling" through many intermediate components
 * - The state represents app-wide configuration or user preferences
 * 
 * Use Props (Local State) when:
 * - State is only needed by a component and its immediate children
 * - The state flow is clear and follows the component hierarchy
 * - You want to maintain clear data flow and component coupling
 * - The state is specific to a component's internal logic
 * 
 * Example in this app:
 * - Graph filters (colors, dates) -> Context because they affect both visualization and sidebar
 * - Sidebar expansion state -> Props because it's specific to the sidebar component
 * - Node selection -> Context because it's shared between visualization and sidebar
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import type { GraphConfig, GraphNode, WeightType, GraphLink } from '../components/ForceGraph/types/config';

// Define the shape of our context
interface GraphContextType {
  // Global configuration state for the graph
  config: GraphConfig;
  updateConfig: (config: GraphConfig) => void;
  
  // Selected node and its associated nodes
  selectedNode: GraphNode | null;
  associatedNodes: Array<{node: GraphNode, weight: number}>;
  visibleLinks: Map<GraphLink, number>;
  updateSelection: (
    node: GraphNode | null, 
    nodes: Array<{node: GraphNode, weight: number}>,
    links: Map<GraphLink, number>
  ) => void;

  // Tribe selection
  selectedTribe: string | null;
  updateSelectedTribe: (tribe: string | null) => void;
}

// Default configuration for the graph
const defaultConfig: GraphConfig = {
  weightType: 'normalized' as WeightType,
  selectedColors: [],
  useRankSize: false,
  sidebarExpanded: true,
  dateRange: {
    start: '1993-01-01', // Magic's beginning
    end: new Date().toISOString() // Current date
  }
};

// Create the context with default values
export const GraphContext = createContext<GraphContextType>({
  config: defaultConfig,
  updateConfig: () => {},
  selectedNode: null,
  associatedNodes: [],
  visibleLinks: new Map(),
  updateSelection: () => {},
  selectedTribe: null,
  updateSelectedTribe: () => {}
});

// Custom hook for easier context consumption
export const useGraphStore = () => useContext(GraphContext);

// Props type for the provider component
interface GraphProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the app and manages global state
 * 
 * Usage:
 * <GraphProvider>
 *   <App />
 * </GraphProvider>
 */
export const GraphProvider = ({ children }: GraphProviderProps) => {
  // State for graph configuration
  const [config, setConfig] = useState<GraphConfig>(defaultConfig);
  
  // State for selected node and its associations
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [associatedNodes, setAssociatedNodes] = useState<Array<{node: GraphNode, weight: number}>>([]);
  const [visibleLinks, setVisibleLinks] = useState<Map<GraphLink, number>>(new Map());
  
  // Add tribe selection state
  const [selectedTribe, setSelectedTribe] = useState<string | null>(null);

  // Update handlers
  const updateConfig = (newConfig: GraphConfig) => {
    setConfig(newConfig);
  };

  const updateSelection = (
    node: GraphNode | null, 
    nodes: Array<{node: GraphNode, weight: number}>,
    links: Map<GraphLink, number>
  ) => {
    setSelectedNode(node);
    setAssociatedNodes(nodes);
    setVisibleLinks(links);
  };

  // Add tribe update handler
  const updateSelectedTribe = (tribe: string | null) => {
    setSelectedTribe(tribe);
  };

  return (
    <GraphContext.Provider value={{
      config,
      updateConfig,
      selectedNode,
      associatedNodes,
      visibleLinks,
      updateSelection,
      selectedTribe,
      updateSelectedTribe
    }}>
      {children}
    </GraphContext.Provider>
  );
}; 