
import Phaser from 'phaser';

export interface GridCell {
  x: number;
  y: number;
  walkable: boolean;
  cost: number;
}

export interface GridNode {
  cell: GridCell;
  f: number;
  g: number;
  h: number;
  parent: GridNode | null;
}

export class GridSystem {
  private grid: GridCell[][];
  private cellWidth: number;
  private cellHeight: number;
  private gridWidth: number;
  private gridHeight: number;
  
  constructor(gridWidth = 30, gridHeight = 20) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.cellWidth = 100 / gridWidth; // Field coordinates in percentage (0-100)
    this.cellHeight = 100 / gridHeight;
    this.grid = this.initializeGrid();
  }
  
  private initializeGrid(): GridCell[][] {
    const grid: GridCell[][] = [];
    
    // Initialize all cells as walkable by default
    for (let x = 0; x < this.gridWidth; x++) {
      grid[x] = [];
      for (let y = 0; y < this.gridHeight; y++) {
        // Make edges of the field slightly higher cost
        const isEdge = x === 0 || y === 0 || x === this.gridWidth - 1 || y === this.gridHeight - 1;
        const cost = isEdge ? 2.0 : 1.0;
        
        grid[x][y] = {
          x,
          y,
          walkable: true,
          cost
        };
      }
    }
    
    return grid;
  }
  
  public getCell(percentX: number, percentY: number): GridCell | null {
    // Convert percentage coordinates to grid indices
    const gridX = Math.floor(percentX / this.cellWidth);
    const gridY = Math.floor(percentY / this.cellHeight);
    
    // Check if within bounds
    if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
      return this.grid[gridX][gridY];
    }
    
    return null;
  }
  
  public getCellByGridCoordinates(x: number, y: number): GridCell | null {
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      return this.grid[x][y];
    }
    return null;
  }
  
  public getCellCenter(cell: GridCell): { x: number, y: number } {
    // Get center of the cell in percentage coordinates
    const centerX = (cell.x * this.cellWidth) + (this.cellWidth / 2);
    const centerY = (cell.y * this.cellHeight) + (this.cellHeight / 2);
    
    return { x: centerX, y: centerY };
  }
  
  public getNeighbors(cell: GridCell): GridCell[] {
    const neighbors: GridCell[] = [];
    const { x, y } = cell;
    
    // Check all 8 surrounding cells (including diagonals)
    const directions = [
      { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
      { x: -1, y: 0 },                    { x: 1, y: 0 },
      { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
    ];
    
    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;
      
      // Check if the neighbor is within bounds
      if (newX >= 0 && newX < this.gridWidth && newY >= 0 && newY < this.gridHeight) {
        const neighbor = this.grid[newX][newY];
        if (neighbor.walkable) {
          neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  }
  
  public getGridDimensions(): { width: number, height: number } {
    return { width: this.gridWidth, height: this.gridHeight };
  }
  
  public getCellDimensions(): { width: number, height: number } {
    return { width: this.cellWidth, height: this.cellHeight };
  }
  
  public setWalkable(x: number, y: number, walkable: boolean): void {
    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
      this.grid[x][y].walkable = walkable;
    }
  }
  
  public resetGrid(): void {
    this.grid = this.initializeGrid();
  }
}
