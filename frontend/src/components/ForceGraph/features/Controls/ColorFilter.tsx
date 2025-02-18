import { Button, Group } from '@mantine/core';
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
    <Group gap="xs" wrap="wrap">
      {allColors.map(color => (
        <Button
          key={color}
          size="sm"
          variant={selectedColors.includes(color) ? "filled" : "light"}
          onClick={() => toggleColor(color)}
          styles={{
            root: {
              backgroundColor: selectedColors.includes(color) 
                ? colorMap[color] 
                : `${colorMap[color]}22`, // Light fill (13% opacity)
              borderColor: colorMap[color],
              color: '#000', // Always black text
              '&:hover': {
                backgroundColor: selectedColors.includes(color) 
                  ? colorMap[color] 
                  : `${colorMap[color]}44`, // Darker on hover (27% opacity)
              },
            }
          }}
        >
          {color}
        </Button>
      ))}
    </Group>
  );
};