import { WeightType } from '../../types/graph';  // Import WeightType

interface WeightSettingsProps {
  weightType: WeightType;  // Change from string to WeightType
  onWeightTypeChange: (type: WeightType) => void;  // Change from string to WeightType
}

const WeightSettings = ({ weightType, onWeightTypeChange }: WeightSettingsProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Weight type changed to:', e.target.value);
    onWeightTypeChange(e.target.value as WeightType);  // Cast to WeightType
  };

  return (
    <div className="control-group">
      <label>
        Weight Type:
        <select 
          value={weightType}
          onChange={handleChange}
        >
          <option value="composite">Composite Weight</option>
          <option value="normalized">Normalized Weight</option>
          <option value="uniqueness">Uniqueness Weight</option>
          <option value="raw">Raw Weight</option>
          <option value="tribes">Tribal Weight</option>
          <option value="tribes_simplified">Simplified Tribal Weight</option>
        </select>
      </label>
    </div>
  );
};

export default WeightSettings;