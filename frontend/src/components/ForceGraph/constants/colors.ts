/**
 * Color mapping for MTG mana colors
 * Used for node rendering and color filtering
 */
export const colorMap: { [key: string]: string } = {
    'W': '#F3EACB',  // White
    'U': '#0E68AB',  // Blue
    'B': '#150B00',  // Black
    'R': '#D3202A',  // Red
    'G': '#00733E',  // Green
    'C': '#CCCCCC'   // Colorless
  };
  
  /**
   * Color labels for UI display
   */
  export const colorLabels: { [key: string]: string } = {
    'W': 'White',
    'U': 'Blue',
    'B': 'Black',
    'R': 'Red',
    'G': 'Green',
    'C': 'Colorless'
  };