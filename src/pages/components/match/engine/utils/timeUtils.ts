
/**
 * Utility functions for handling match time related operations
 */

/**
 * Generate random key minutes for match events
 * @param startMinute Start of the time period
 * @param endMinute End of the time period
 * @param count Number of key minutes to generate
 * @returns Array of minutes in ascending order
 */
export const generateKeyMinutes = (startMinute: number, endMinute: number, count: number): number[] => {
  // Create a range of possible minutes
  const possibleMinutes: number[] = [];
  for (let i = startMinute; i <= endMinute; i++) {
    possibleMinutes.push(i);
  }
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = possibleMinutes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possibleMinutes[i], possibleMinutes[j]] = [possibleMinutes[j], possibleMinutes[i]];
  }
  
  // Take the first 'count' elements and sort them
  return possibleMinutes.slice(0, count).sort((a, b) => a - b);
};
