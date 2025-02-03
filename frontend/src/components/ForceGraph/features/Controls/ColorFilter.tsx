import { colorMap } from '../../constants/colors';

interface ColorFilterProps {
  selectedColors: string[];
  onColorSelect: (colors: string[]) => void;
}

/**
 * Color selection filter component
 * Allows users to filter nodes based on commander colors
 */
export const ColorFilter: React.FC<ColorFilterProps> = ({
  selectedColors = [],
  onColorSelect
}) => {
  // All possible colors including colorless
  const allColors = [...Object.keys(colorMap), 'C'];

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorSelect(selectedColors.filter(c => c !== color));
    } else {
      onColorSelect([...selectedColors, color]);
    }
  };

  return (
    <div className="color-filter">
      <h3>Filter by Color</h3>
      <div className="color-buttons">
        {allColors.map(color => (
          <button
            key={color}
            onClick={() => toggleColor(color)}
            className={`color-button ${selectedColors.includes(color) ? 'selected' : ''}`}
            style={{
              backgroundColor: color === 'C' ? '#ccc' : colorMap[color],
              color: ['W', 'C'].includes(color) ? '#000' : '#fff'
            }}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
};