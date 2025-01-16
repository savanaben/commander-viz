
const colors = [
  { id: 'W', label: 'White', color: '#F3EACB' },
  { id: 'U', label: 'Blue', color: '#0E68AB' },
  { id: 'B', label: 'Black', color: '#150B00' },
  { id: 'R', label: 'Red', color: '#D3202A' },
  { id: 'G', label: 'Green', color: '#00733E' },
  { id: 'C', label: 'Colorless', color: '#CCCCCC' }
];

interface ColorFilterProps {
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
}

const ColorFilter = ({ selectedColors, onColorChange }: ColorFilterProps) => {
  const handleColorToggle = (colorId: string) => {
    const newColors = selectedColors.includes(colorId)
      ? selectedColors.filter(c => c !== colorId)
      : [...selectedColors, colorId];
    onColorChange(newColors);
  };

  return (
    <div className="control-group">
      <label>Color Filter:</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {colors.map(({ id, label, color }) => (
          <div key={id} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id={`color-${id}`}
              checked={selectedColors.includes(id)}
              onChange={() => handleColorToggle(id)}
            />
            <label 
              htmlFor={`color-${id}`}
              style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: color,
                border: '1px solid black',
                marginLeft: '4px',
                cursor: 'pointer'
              }}
              title={label}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorFilter;