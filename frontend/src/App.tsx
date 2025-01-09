import { useState } from 'react';
import ForceGraphTest from './components/ForceGraphTest';
import WeightSettings from './components/Controls/WeightSettings';  // Import WeightSettings instead
import { useGraphData } from './hooks/useGraphData';
import { GraphConfig, WeightType } from './types/graph';

const App = () => {
  // Initialize config with only weightType
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    weightType: 'composite' as WeightType
  });

  const graphData = useGraphData();

  // Specific handler for weight type changes
  const handleWeightTypeChange = (type: WeightType) => {
    setGraphConfig(prev => ({
      ...prev,
      weightType: type
    }));
  };

  return (
    <div className="app">
      {graphData.nodes.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          <WeightSettings 
            weightType={graphConfig.weightType}
            onWeightTypeChange={handleWeightTypeChange}
          />
          <ForceGraphTest 
            data={graphData}
            config={graphConfig}
          />
        </>
      )}
    </div>
  );
};

export default App;