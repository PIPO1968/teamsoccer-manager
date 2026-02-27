
// Helper utility to convert hex colors to RGB
export const hexToRgb = (hex: string): { color: number; r: number; g: number; b: number } => {
  // Remove # if present
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;
  
  // Parse hex
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Convert to Phaser color integer (0xRRGGBB)
  const color = (r << 16) | (g << 8) | b;
  
  return { color, r, g, b };
};
