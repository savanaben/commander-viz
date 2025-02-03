/**
 * Utility functions for text manipulation and rendering
 */

/**
 * Wraps text into multiple lines based on maximum width
 * Used for node labels to prevent text overflow
 */
export const wrapText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    maxWidth: number
  ): string[] => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
  
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };