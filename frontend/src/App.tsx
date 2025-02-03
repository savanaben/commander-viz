import { useState, useCallback, useRef } from 'react';
import { ForceGraphContainer } from './components/ForceGraph/ForceGraphContainer';
import { Sidebar } from './components/Sidebar';
import { useGraphData } from './components/ForceGraph/hooks/useGraphData';
import type { 
  GraphConfig, 
  WeightType,
  GraphNode 
} from './components/ForceGraph/types/config';
import { ForceGraphMethods } from 'react-force-graph-2d';
import './App.css';

const App = () => {
  // Graph configuration state
  // This includes the sidebar expansion state and all visualization controls
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    weightType: 'normalized' as WeightType,
    selectedColors: [],
    useRankSize: false,
    sidebarExpanded: true  // Controls the sidebar expansion state
  });

  // State for selected node and associated nodes
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [associatedNodes, setAssociatedNodes] = useState<Array<{node: GraphNode, weight: number}>>([]);

  // Load graph data using custom hook
  const graphData = useGraphData();
  
  // Reference to ForceGraph methods for external control
  const graphRef = useRef<ForceGraphMethods>(null);

  // Handle node selection from graph
  const handleNodeSelect = useCallback((node: GraphNode | null, nodes: Array<{node: GraphNode, weight: number}>) => {
    setSelectedNode(node);
    setAssociatedNodes(nodes);
    
    // If a node is selected and has coordinates, center and zoom on it
    if (node && graphRef.current && node.x !== undefined && node.y !== undefined) {
      graphRef.current.centerAt(node.x, node.y, 1000);
      setTimeout(() => {
        graphRef.current?.zoom(5, 1000);
      }, 50);
    }
  }, []);

  
  // Show loading state while graph data is being fetched
  if (!graphData.nodes.length) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <div className="app-container">
        {/* Main Force Graph visualization */}
        <ForceGraphContainer 
          ref={graphRef}
          data={graphData}
          config={graphConfig}
          onNodeSelect={handleNodeSelect}
        />
        
        {/* Right-hand sidebar containing controls and associated cards */}
        <Sidebar 
          config={graphConfig}
          onConfigChange={setGraphConfig}
          nodes={graphData.nodes}
          onNodeSelect={handleNodeSelect}  // Should be passed to sidebar
          selectedNode={selectedNode}
          associatedNodes={associatedNodes}
        />
      </div>
    </div>
  );
};

export default App;