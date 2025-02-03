import { WeightType } from '../../types/config';

interface WeightSettingsProps {
  weightType: WeightType;
  onWeightTypeChange: (type: WeightType) => void;
}

/**
 * Weight type selection component
 * Controls how node relationships are weighted
 */
export const WeightSettings: React.FC<WeightSettingsProps> = ({ 
  weightType, 
  onWeightTypeChange 
}) => {
  return (
    <div className="control-group">
      <label>
        Weight Type:
        <select 
          value={weightType}
          onChange={(e) => onWeightTypeChange(e.target.value as WeightType)}
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