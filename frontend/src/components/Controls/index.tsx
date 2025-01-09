import { useState } from 'react';
import WeightSettings from './WeightSettings.tsx';
import ForceControls from './ForceControls.tsx';
import { GraphConfig } from '../../types/graph';
import './Controls.css';

interface ControlsProps {
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
}

const Controls = ({ config, onConfigChange }: ControlsProps) => {
  const [activeSection, setActiveSection] = useState<string>('weight');

  const handleSectionToggle = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <div className="controls">
      <div className="control-section">
        <div 
          className="control-header" 
          onClick={() => handleSectionToggle('weight')}
        >
          Weight Settings
        </div>
        <div className={`control-content ${activeSection === 'weight' ? 'active' : ''}`}>
          <WeightSettings 
            weightType={config.weightType}
            onWeightTypeChange={(type) => onConfigChange({ ...config, weightType: type as GraphConfig['weightType'] })}
          />
        </div>
      </div>

      <div className="control-section">
        <div 
          className="control-header" 
          onClick={() => handleSectionToggle('force')}
        >
          Force Controls
        </div>
        <div className={`control-content ${activeSection === 'force' ? 'active' : ''}`}>
          <ForceControls 
            config={config}
            onConfigChange={onConfigChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;