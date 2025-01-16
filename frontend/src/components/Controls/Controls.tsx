
import WeightSettings from './WeightSettings';
import ColorFilter from './ColorFilter';
import { WeightType } from '../../types/graph';

interface ControlsProps {
  weightType: WeightType;
  selectedColors: string[];
  onWeightTypeChange: (type: WeightType) => void;
  onColorChange: (colors: string[]) => void;
}

const Controls = ({ 
  weightType, 
  selectedColors, 
  onWeightTypeChange, 
  onColorChange 
}: ControlsProps) => {
  return (
    <div style={{ 
      position: 'absolute', 
      top: 10, 
      left: 10, 
      zIndex: 1,
      background: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    }}>
      <WeightSettings 
        weightType={weightType} 
        onWeightTypeChange={onWeightTypeChange} 
      />
      <ColorFilter 
        selectedColors={selectedColors} 
        onColorChange={onColorChange} 
      />
    </div>
  );
};

export default Controls;