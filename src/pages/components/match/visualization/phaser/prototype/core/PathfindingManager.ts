import { GridSystem } from '../../utils/GridSystem';
import { Pathfinder } from '../../utils/Pathfinding';

export class PathfindingManager {
  private grid: GridSystem;
  private pathfinder: Pathfinder;
  private boundaryPadding = 5;
  
  constructor(gridWidth: number, gridHeight: number) {
    this.grid = new GridSystem(gridWidth, gridHeight);
    this.pathfinder = new Pathfinder(this.grid);
  }
  
  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): { x: number, y: number }[] {
    return this.pathfinder.findPath(startX, startY, endX, endY);
  }
  
  getGridDimensions(): { width: number, height: number } {
    return this.grid.getGridDimensions();
  }
  
  getCellDimensions(): { width: number, height: number } {
    return this.grid.getCellDimensions();
  }
  
  areInSameGridCell(pos1: {x: number, y: number}, pos2: {x: number, y: number}): boolean {
    const { width: gridWidth, height: gridHeight } = this.getGridDimensions();
    
    // Calculate grid cell indices
    const cell1X = Math.floor(pos1.x / (100 / gridWidth));
    const cell1Y = Math.floor(pos1.y / (100 / gridHeight));
    
    const cell2X = Math.floor(pos2.x / (100 / gridWidth));
    const cell2Y = Math.floor(pos2.y / (100 / gridHeight));
    
    // Check if they're in the same cell
    return cell1X === cell2X && cell1Y === cell2Y;
  }
  
  getDistance(point1: {x: number, y: number}, point2: {x: number, y: number}): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  getBoundaryPadding(): number {
    return this.boundaryPadding;
  }
  
  // Update obstacles on the grid based on player positions for pathfinding
  updateObstacles(playerPositions: { [id: number]: { x: number, y: number } }): void {
    // Reset grid to default state
    this.grid.resetGrid();
    
    // Mark cells with players as higher cost but still walkable
    for (const playerId in playerPositions) {
      const pos = playerPositions[playerId];
      const cell = this.grid.getCell(pos.x, pos.y);
      
      if (cell) {
        // Don't mark as unwalkable, but increase cost
        // to make pathfinding prefer paths around other players
        const surroundingCells = this.grid.getNeighbors(cell);
        surroundingCells.forEach(neighborCell => {
          const currentCell = this.grid.getCellByGridCoordinates(neighborCell.x, neighborCell.y);
          if (currentCell) {
            currentCell.cost = currentCell.cost * 1.5; // Increase cost
          }
        });
      }
    }
  }
  
  // Find open space in a given area
  findOpenSpace(
    nearPosition: { x: number, y: number },
    direction: { x: number, y: number },
    maxDistance: number
  ): { x: number, y: number } {
    // Start with the near position
    let bestPosition = { ...nearPosition };
    let bestScore = -1;
    
    // Try different positions in the direction
    for (let dist = 5; dist <= maxDistance; dist += 5) {
      const testX = nearPosition.x + (direction.x * dist);
      const testY = nearPosition.y + (direction.y * dist);
      
      // Keep position within field bounds
      const constrainedX = Math.max(5, Math.min(95, testX));
      const constrainedY = Math.max(5, Math.min(95, testY));
      
      // Get cell at this position
      const cell = this.grid.getCell(constrainedX, constrainedY);
      
      if (cell) {
        // Calculate a score based on cell cost (lower is better)
        const cellCost = cell.cost;
        const score = 1 / cellCost;
        
        if (score > bestScore) {
          bestScore = score;
          bestPosition = { x: constrainedX, y: constrainedY };
        }
      }
    }
    
    return bestPosition;
  }
}
