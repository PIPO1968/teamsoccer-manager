
import Phaser from 'phaser';
import { MatchEventData } from '../../../types/matchTypes';
import { Player } from '../../../../../components/types/match';
import { GridSystem } from './GridSystem';
import { Pathfinder } from './Pathfinding';

export interface MovementUpdate {
  playerId: number;
  x: number;
  y: number;
  direction: {
    x: number;
    y: number;
  };
  isRunning: boolean;
  path?: { x: number, y: number }[];
}

export class MovementEstimator {
  private currentPositions: { [playerId: number]: { x: number; y: number } } = {};
  private targetPositions: { [playerId: number]: { x: number; y: number } } = {};
  private movementSpeeds: { [playerId: number]: number } = {};
  private directions: { [playerId: number]: { x: number; y: number } } = {};
  private currentPaths: { [playerId: number]: { x: number; y: number }[] } = {};
  private ballPosition: { x: number; y: number } = { x: 50, y: 50 };
  private ballTarget: { x: number; y: number } = { x: 50, y: 50 };
  private ballSpeed: number = 0;
  private ballDirection: { x: number; y: number } = { x: 0, y: 0 };
  private ballPath: { x: number; y: number }[] = [];
  private lastUpdateTime: number = 0;
  private grid: GridSystem;
  private pathfinder: Pathfinder;

  constructor(
    private homePlayers: Player[],
    private awayPlayers: Player[]
  ) {
    // Initialize grid system (30x20 cells)
    this.grid = new GridSystem(30, 20);
    this.pathfinder = new Pathfinder(this.grid);
    
    this.initializePositions();
  }

  private initializePositions(): void {
    // Initialize with default 4-4-2 formation
    const allPlayers = [...this.homePlayers, ...this.awayPlayers];
    
    allPlayers.forEach(player => {
      // Set initial position based on the 4-4-2 formation
      const initialPosition = this.getInitialPosition(player);
      
      this.currentPositions[player.id] = { ...initialPosition };
      this.targetPositions[player.id] = { ...initialPosition };
      this.movementSpeeds[player.id] = this.getPlayerSpeed(player);
      this.directions[player.id] = { x: 0, y: 0 };
      this.currentPaths[player.id] = [];
    });
  }

  private getInitialPosition(player: Player): { x: number; y: number } {
    const isHomeTeam = this.homePlayers.some(p => p.id === player.id);
    
    // Base positioning (mirrored for away team)
    const homeOffsetX = 30; // Home team in their own half
    const awayOffsetX = 70; // Away team in their own half
    const baseX = isHomeTeam ? homeOffsetX : awayOffsetX;
    const mirrorX = isHomeTeam ? 1 : -1; // Mirror positions for away team
    
    // Position based on role
    if (player.position === "GK") {
      return { x: isHomeTeam ? 10 : 90, y: 50 };
    }
    
    if (player.position.includes("DEF") || player.position === "RB" || player.position === "LB" || player.position === "CB") {
      const defenderIndex = this.getPositionIndex(player, "DEF");
      const yPos = 30 + (defenderIndex * 13); // Spread defenders across the width
      return { x: isHomeTeam ? 20 : 80, y: yPos };
    }
    
    if (player.position.includes("MID") || player.position === "CM" || player.position === "RM" || player.position === "LM") {
      const midfielderIndex = this.getPositionIndex(player, "MID");
      const yPos = 30 + (midfielderIndex * 13); // Spread midfielders across the width
      return { x: isHomeTeam ? 35 : 65, y: yPos };
    }
    
    if (player.position.includes("FWD") || player.position === "ST" || player.position === "CF") {
      const forwardIndex = this.getPositionIndex(player, "FWD");
      const yPos = 40 + (forwardIndex * 20); // Spread forwards across the width
      return { x: isHomeTeam ? 50 : 50, y: yPos };
    }
    
    // Fallback position (should not reach here if positions are properly set)
    return { x: baseX, y: 50 };
  }
  
  private getPositionIndex(player: Player, positionType: string): number {
    // Find index among players of the same position type
    const isHomeTeam = this.homePlayers.some(p => p.id === player.id);
    const teamPlayers = isHomeTeam ? this.homePlayers : this.awayPlayers;
    
    const samePositionPlayers = teamPlayers.filter(p => 
      p.position.includes(positionType) || 
      (positionType === "DEF" && ["RB", "LB", "CB"].includes(p.position)) ||
      (positionType === "MID" && ["CM", "RM", "LM"].includes(p.position)) ||
      (positionType === "FWD" && ["ST", "CF"].includes(p.position))
    );
    
    return samePositionPlayers.findIndex(p => p.id === player.id);
  }

  private getPlayerSpeed(player: Player): number {
    // Base speed with a small random variation
    const baseSpeed = 0.15;
    const energyFactor = player.energy / 100;
    const speedModifier = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2 modifier
    
    return baseSpeed * energyFactor * speedModifier;
  }

  public updateForEvent(event: MatchEventData): void {
    // Update positions based on the event
    if (event.positions && event.positions.positions) {
      // Update player target positions
      event.positions.positions.forEach(position => {
        if (this.currentPositions[position.id]) {
          // Calculate path from current to target position
          const path = this.pathfinder.findPath(
            this.currentPositions[position.id].x,
            this.currentPositions[position.id].y,
            position.x,
            position.y
          );
          
          // Store the path for this player
          this.currentPaths[position.id] = path;
          
          // Update the target position
          this.targetPositions[position.id] = { 
            x: position.x, 
            y: position.y 
          };
          
          // Calculate direction
          const dx = position.x - this.currentPositions[position.id].x;
          const dy = position.y - this.currentPositions[position.id].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            this.directions[position.id] = { 
              x: dx / distance, 
              y: dy / distance 
            };
          }
        }
      });
      
      // Handle ball movement for shots, goals, and passes
      if (event.type === 'shot' || event.type === 'goal') {
        // Find the player position
        const playerId = event.playerId;
        if (playerId && this.targetPositions[playerId]) {
          // Set ball position to player's position
          this.ballPosition = { ...this.currentPositions[playerId] };
          
          // Set target position based on event type
          // Ball moves toward goal
          const isHomeTeam = this.homePlayers.some(p => p.id === playerId);
          this.ballTarget = {
            x: isHomeTeam ? 90 : 10, // Opposite goal
            y: 50 + (Math.random() * 10 - 5) // Slight variation in y
          };
          
          // Calculate ball path
          this.ballPath = this.pathfinder.findPath(
            this.ballPosition.x,
            this.ballPosition.y,
            this.ballTarget.x,
            this.ballTarget.y
          );
        }
      } else if (event.involvedPlayers && event.involvedPlayers.length > 1) {
        // Handle possible pass event using involvedPlayers
        const sourcePlayerId = event.involvedPlayers[0]?.id;
        const targetPlayerId = event.involvedPlayers[1]?.id;
        
        if (sourcePlayerId && targetPlayerId && 
            this.currentPositions[sourcePlayerId] && 
            this.targetPositions[targetPlayerId]) {
          // Set ball position to source player's position
          this.ballPosition = { ...this.currentPositions[sourcePlayerId] };
          
          // Ball target is the target player's position
          this.ballTarget = { ...this.targetPositions[targetPlayerId] };
          
          // Calculate ball path
          this.ballPath = this.pathfinder.findPath(
            this.ballPosition.x,
            this.ballPosition.y,
            this.ballTarget.x,
            this.ballTarget.y
          );
          
          // Calculate ball direction and speed
          const dx = this.ballTarget.x - this.ballPosition.x;
          const dy = this.ballTarget.y - this.ballPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            this.ballDirection = { 
              x: dx / distance, 
              y: dy / distance 
            };
            
            // Ball speed is faster than player speed
            this.ballSpeed = 0.3 + (Math.random() * 0.2);
          }
        }
      }
    }
  }

  public update(deltaTime: number): { 
    playerMovements: MovementUpdate[],
    ballPosition: { x: number; y: number }
  } {
    const slowdownFactor = 0.25; // Make everything 4x slower for better visualization
    const adjustedDelta = deltaTime * slowdownFactor;
    const updates: MovementUpdate[] = [];
    
    // Update player positions
    for (const playerId in this.currentPositions) {
      const id = parseInt(playerId);
      const current = this.currentPositions[id];
      const target = this.targetPositions[id];
      const path = this.currentPaths[id];
      const speed = this.movementSpeeds[id] * adjustedDelta;
      
      // If we have a path to follow
      if (path && path.length > 1) {
        const nextPoint = path[1]; // First point is current position
        
        // Calculate distance to next point
        const dx = nextPoint.x - current.x;
        const dy = nextPoint.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.1) {
          // Moving toward next point in path
          const moveDist = Math.min(distance, speed);
          const direction = {
            x: dx / distance,
            y: dy / distance
          };
          
          // Update position
          current.x += direction.x * moveDist;
          current.y += direction.y * moveDist;
          
          // Update direction
          this.directions[id] = { ...direction };
          
          // Add to updates
          updates.push({
            playerId: id,
            x: current.x,
            y: current.y,
            direction: { ...direction },
            isRunning: true,
            path: path.slice(1) // Include remaining path for visualization
          });
          
          // If we've reached this point, remove it from the path
          if (distance <= speed) {
            path.shift();
          }
        } else if (path.length > 2) {
          // Move to next point in path
          path.shift();
          
          // Process next point on next update
          updates.push({
            playerId: id,
            x: current.x,
            y: current.y,
            direction: this.directions[id],
            isRunning: true,
            path: path
          });
        } else {
          // Reached final destination
          this.currentPaths[id] = [];
          
          // Add final update
          updates.push({
            playerId: id,
            x: target.x,
            y: target.y,
            direction: { x: 0, y: 0 },
            isRunning: false
          });
          
          // Set current position to target
          this.currentPositions[id] = { ...target };
        }
      } else {
        // Calculate direct distance to target
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Determine if we need to move
        if (distance > 0.1) {
          // Moving toward target
          const moveDist = Math.min(distance, speed);
          const direction = {
            x: dx / distance,
            y: dy / distance
          };
          
          // Update position
          current.x += direction.x * moveDist;
          current.y += direction.y * moveDist;
          
          // Update directions
          this.directions[id] = { ...direction };
          
          // Add to updates
          updates.push({
            playerId: id,
            x: current.x,
            y: current.y,
            direction: { ...direction },
            isRunning: distance > 1 // Only consider running if distance is significant
          });
        } else {
          // Already at target, just make small idle movements
          const jitterAmount = 0.05 * adjustedDelta;
          if (Math.random() < 0.1) { // Only jitter occasionally
            current.x += (Math.random() * jitterAmount) - (jitterAmount / 2);
            current.y += (Math.random() * jitterAmount) - (jitterAmount / 2);
            
            // Add to updates
            updates.push({
              playerId: id,
              x: current.x,
              y: current.y,
              direction: { x: 0, y: 0 },
              isRunning: false
            });
          }
        }
      }
    }
    
    // Update ball position
    if (this.ballPath && this.ballPath.length > 1) {
      const nextPoint = this.ballPath[1];
      
      // Calculate distance to next point
      const ballDx = nextPoint.x - this.ballPosition.x;
      const ballDy = nextPoint.y - this.ballPosition.y;
      const ballDistance = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
      
      if (ballDistance > 0.1) {
        // Moving along path
        const ballMoveDist = Math.min(ballDistance, this.ballSpeed * adjustedDelta);
        const ballDirection = {
          x: ballDx / ballDistance,
          y: ballDy / ballDistance
        };
        
        // Update position
        this.ballPosition.x += ballDirection.x * ballMoveDist;
        this.ballPosition.y += ballDirection.y * ballMoveDist;
        
        // Update direction
        this.ballDirection = { ...ballDirection };
        
        // If we've reached this point, remove it from the path
        if (ballDistance <= this.ballSpeed * adjustedDelta) {
          this.ballPath.shift();
        }
      } else if (this.ballPath.length > 2) {
        // Move to next point in path
        this.ballPath.shift();
      } else {
        // Reached final destination
        this.ballPath = [];
        this.ballPosition = { ...this.ballTarget };
      }
    } else {
      const ballDx = this.ballTarget.x - this.ballPosition.x;
      const ballDy = this.ballTarget.y - this.ballPosition.y;
      const ballDistance = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
      
      if (ballDistance > 0.1) {
        const ballMoveDist = Math.min(ballDistance, this.ballSpeed * adjustedDelta);
        this.ballPosition.x += this.ballDirection.x * ballMoveDist;
        this.ballPosition.y += this.ballDirection.y * ballMoveDist;
      }
    }
    
    return {
      playerMovements: updates,
      ballPosition: { ...this.ballPosition }
    };
  }
  
  public getBallPosition(): { x: number; y: number } {
    return { ...this.ballPosition };
  }
  
  public getBallPath(): { x: number; y: number }[] {
    return [...this.ballPath];
  }
  
  public getPlayerPositions(): { [playerId: number]: { x: number; y: number } } {
    return { ...this.currentPositions };
  }
  
  public resetPositions(): void {
    this.initializePositions();
    this.ballPosition = { x: 50, y: 50 };
    this.ballTarget = { x: 50, y: 50 };
    this.ballPath = [];
  }
  
  // Method to update obstacles (areas where players can't go)
  public updateObstacles(playerPositions: { [id: number]: { x: number, y: number } }): void {
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
}
