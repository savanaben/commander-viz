import { useRef } from 'react';
import { ForceGraphContainer } from './components/ForceGraph/ForceGraphContainer';
import { Sidebar } from './components/Sidebar';
import { MantineProvider } from '@mantine/core';
import { useGraphData } from './components/ForceGraph/hooks/useGraphData';
import type { GraphNode } from './components/ForceGraph/types/config';
import { ForceGraphMethods } from 'react-force-graph-2d';
import { useGraphStore } from './store/GraphContext';
import './App.css';

const App = () => {
  // Use global store instead of local state
  const { config, updateConfig } = useGraphStore();
  
  // Load graph data using custom hook
  const graphData = useGraphData();
  
  // Reference to ForceGraph methods for external control
  const graphRef = useRef<ForceGraphMethods>(null);

  // Show loading state while graph data is being fetched
  if (!graphData.nodes.length) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <MantineProvider
      theme={{
        components: {
          RangeSlider: {
            styles: {
              root: { width: '100%' }
            }
          }
        }
      }}
    >
      <div className="app">
        <div className="app-container">
          {/* Main Force Graph visualization */}
          <ForceGraphContainer 
            ref={graphRef}
            data={graphData}
            config={config}
          />
          
          {/* Right-hand sidebar containing controls and associated cards */}
          <Sidebar 
            config={config}
            onConfigChange={updateConfig}
            nodes={graphData.nodes}
            data={graphData}
            graphRef={graphRef}
          />
        </div>
      </div>
    </MantineProvider>
  );
};

export default App;