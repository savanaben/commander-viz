import { useState } from 'react';
import ForceGraphTest from './components/ForceGraphTest';
import Controls from './components/Controls/Controls';
import { useGraphData } from './hooks/useGraphData';
import { GraphConfig, WeightType } from './types/graph';

const App = () => {
  // Initialize config with weightType and selectedColors
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    weightType: 'composite' as WeightType,
    selectedColors: []  // Initialize empty array for colors
  });

  const graphData = useGraphData();

  // Specific handler for weight type changes
  const handleWeightTypeChange = (type: WeightType) => {
    setGraphConfig(prev => ({
      ...prev,
      weightType: type
    }));
  };

  // New handler for color changes
  const handleColorChange = (colors: string[]) => {
    setGraphConfig(prev => ({
      ...prev,
      selectedColors: colors
    }));
  };

  return (
    <div className="app">
      {graphData.nodes.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <>
          <Controls 
            weightType={graphConfig.weightType}
            selectedColors={graphConfig.selectedColors}
            onWeightTypeChange={handleWeightTypeChange}
            onColorChange={handleColorChange}
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