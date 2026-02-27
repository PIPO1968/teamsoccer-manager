
import { GridSystem, GridCell, GridNode } from './GridSystem';

export class Pathfinder {
  private grid: GridSystem;
  
  constructor(grid: GridSystem) {
    this.grid = grid;
  }
  
  public findPath(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ): { x: number, y: number }[] {
    // Get grid cells for start and end positions
    const startCell = this.grid.getCell(startX, startY);
    const endCell = this.grid.getCell(endX, endY);
    
    if (!startCell || !endCell) {
      return [{ x: startX, y: startY }, { x: endX, y: endY }]; // Direct path if cells not found
    }
    
    if (!endCell.walkable) {
      // Try to find the closest walkable cell to the target
      const closestCell = this.findClosestWalkableCell(endCell);
      if (closestCell) {
        endCell.x = closestCell.x;
        endCell.y = closestCell.y;
      }
    }
    
    // A* algorithm
    const openSet: GridNode[] = [];
    const closedSet: Map<string, boolean> = new Map();
    
    // Create start node
    const startNode: GridNode = {
      cell: startCell,
      f: 0,
      g: 0,
      h: this.heuristic(startCell, endCell),
      parent: null
    };
    
    openSet.push(startNode);
    
    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openSet[currentIndex];
      
      // Check if reached destination
      if (current.cell.x === endCell.x && current.cell.y === endCell.y) {
        return this.reconstructPath(current);
      }
      
      // Remove current from openSet and add to closedSet
      openSet.splice(currentIndex, 1);
      closedSet.set(`${current.cell.x},${current.cell.y}`, true);
      
      // Process neighbors
      const neighbors = this.grid.getNeighbors(current.cell);
      
      for (const neighborCell of neighbors) {
        // Skip if in closedSet
        if (closedSet.has(`${neighborCell.x},${neighborCell.y}`)) {
          continue;
        }
        
        // Calculate g score for this path
        // Diagonal movement costs more
        const isDiagonal = current.cell.x !== neighborCell.x && current.cell.y !== neighborCell.y;
        const movementCost = isDiagonal ? 1.4 : 1.0;
        const tentativeG = current.g + (movementCost * neighborCell.cost);
        
        // Find if neighbor is in openSet
        let neighborNode = openSet.find(node => 
          node.cell.x === neighborCell.x && node.cell.y === neighborCell.y
        );
        
        if (!neighborNode) {
          // Add new node to openSet
          neighborNode = {
            cell: neighborCell,
            f: 0,
            g: tentativeG,
            h: this.heuristic(neighborCell, endCell),
            parent: current
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          // Update existing node with better path
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }
    
    // No path found, return direct line
    return [
      { x: startX, y: startY },
      { x: endX, y: endY }
    ];
  }
  
  private findClosestWalkableCell(cell: GridCell): GridCell | null {
    // Simple breadth-first search to find closest walkable cell
    const visited: Set<string> = new Set();
    const queue: GridCell[] = [];
    
    // Start with the cell's neighbors
    const neighbors = this.grid.getNeighbors(cell);
    neighbors.forEach(neighbor => {
      queue.push(neighbor);
      visited.add(`${neighbor.x},${neighbor.y}`);
    });
    
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      
      if (current.walkable) {
        return current;
      }
      
      const nextNeighbors = this.grid.getNeighbors(current);
      for (const neighbor of nextNeighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(key)) {
          queue.push(neighbor);
          visited.add(key);
        }
      }
    }
    
    return null;
  }
  
  private heuristic(a: GridCell, b: GridCell): number {
    // Octile distance (allows for diagonal movement)
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return (dx + dy) + (Math.sqrt(2) - 2) * Math.min(dx, dy);
  }
  
  private reconstructPath(node: GridNode): { x: number, y: number }[] {
    const path: { x: number, y: number }[] = [];
    let current: GridNode | null = node;
    
    while (current) {
      // Convert grid coordinates to percentage coordinates
      const cellCenter = this.grid.getCellCenter(current.cell);
      path.unshift({ x: cellCenter.x, y: cellCenter.y });
      current = current.parent;
    }
    
    return path;
  }
}
