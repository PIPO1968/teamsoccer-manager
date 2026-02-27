
import Phaser from 'phaser';
import { PathfindingManager } from './PathfindingManager';
import { BallManager } from './BallManager';

export class MovementManager {
  private player1: Phaser.GameObjects.Container;
  private player2: Phaser.GameObjects.Container;
  private possessionManager: any;
  private pathfindingManager: PathfindingManager;
  private ballManager: BallManager;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  
  private player1Position = { x: 25, y: 50 };
  private player2Position = { x: 75, y: 50 };
  private player1Path: { x: number, y: number }[] = [];
  private player2Path: { x: number, y: number }[] = [];
  private pathUpdateCounter = 0;
  private pathUpdateFrequency = 30;
  private boundaryPadding = 5;
  private player1Speed = 0.5;
  private player2Speed = 0.5;
  
  constructor(
    player1: Phaser.GameObjects.Container,
    player2: Phaser.GameObjects.Container,
    possessionManager: any,
    pathfindingManager: PathfindingManager,
    ballManager: BallManager,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.possessionManager = possessionManager;
    this.pathfindingManager = pathfindingManager;
    this.ballManager = ballManager;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
    
    // Set random player speeds with slight variations to break ties
    this.player1Speed = 0.5 + (Math.random() * 0.1 - 0.05);
    this.player2Speed = 0.5 + (Math.random() * 0.1 - 0.05);
  }
  
  movePlayersAlongPaths(): void {
    // Move player 1 along path
    if (this.player1Path.length > 1) {
      const nextPoint = this.player1Path[1];
      const currentPos = this.player1Position;
      
      const dx = nextPoint.x - currentPos.x;
      const dy = nextPoint.y - currentPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.1) {
        // Move towards next point
        const speed = this.player1Speed;
        const moveDist = Math.min(distance, speed);
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        this.updatePlayerPosition(
          1,
          currentPos.x + dirX * moveDist,
          currentPos.y + dirY * moveDist
        );
      } else {
        // Reached this point, remove it
        this.player1Path.shift();
      }
    }
    
    // Move player 2 along path
    if (this.player2Path.length > 1) {
      const nextPoint = this.player2Path[1];
      const currentPos = this.player2Position;
      
      const dx = nextPoint.x - currentPos.x;
      const dy = nextPoint.y - currentPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.1) {
        // Move towards next point
        const speed = this.player2Speed;
        const moveDist = Math.min(distance, speed);
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        this.updatePlayerPosition(
          2,
          currentPos.x + dirX * moveDist,
          currentPos.y + dirY * moveDist
        );
      } else {
        // Reached this point, remove it
        this.player2Path.shift();
      }
    }
  }
  
  updatePlayerPosition(playerId: number, x: number, y: number): void {
    const player = (playerId === 1) ? this.player1 : this.player2;
    const pixelX = this.convertToPixelsX(x);
    const pixelY = this.convertToPixelsY(y);
    
    player.setPosition(pixelX, pixelY);
    
    // Update stored position
    if (playerId === 1) {
      this.player1Position = { x, y };
    } else {
      this.player2Position = { x, y };
    }
    
    // Move ball with possessor
    const ballPossessor = this.possessionManager.ballPossessor;
    if (ballPossessor === playerId) {
      this.ballManager.updateBallPosition(x, y);
    }
  }
  
  calculatePathToBall(playerId: number, ballPosition: { x: number, y: number }): void {
    const playerPos = (playerId === 1) ? this.player1Position : this.player2Position;
    
    const path = this.pathfindingManager.findPath(
      playerPos.x,
      playerPos.y,
      ballPosition.x,
      ballPosition.y
    );
    
    if (playerId === 1) {
      this.player1Path = path;
    } else {
      this.player2Path = path;
    }
  }
  
  calculatePathToPlayer(sourcePlayerId: number): void {
    // This function makes one player chase the other
    const sourcePos = (sourcePlayerId === 1) ? this.player1Position : this.player2Position;
    const targetPos = (sourcePlayerId === 1) ? this.player2Position : this.player1Position;
    
    const path = this.pathfindingManager.findPath(
      sourcePos.x,
      sourcePos.y,
      targetPos.x,
      targetPos.y
    );
    
    if (sourcePlayerId === 1) {
      this.player1Path = path;
    } else {
      this.player2Path = path;
    }
  }
  
  calculateSmartEscapePath(playerId: number): void {
    const playerPos = (playerId === 1) ? this.player1Position : this.player2Position;
    const opponentPos = (playerId === 1) ? this.player2Position : this.player1Position;
    
    // Calculate direction away from opponent
    const dx = playerPos.x - opponentPos.x;
    const dy = playerPos.y - opponentPos.y;
    
    // Calculate multiple potential escape targets and pick the best one
    const escapeTargets = this.generateEscapeTargets(playerId, playerPos, opponentPos, dx, dy);
    
    // Evaluate and select the best target based on scoring
    let bestTarget = { x: playerPos.x, y: playerPos.y };
    let bestScore = -Infinity;
    
    for (const target of escapeTargets) {
      const score = this.evaluateEscapeTarget(target, playerPos, opponentPos);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }
    
    // Find path to best target
    const path = this.pathfindingManager.findPath(
      playerPos.x,
      playerPos.y,
      bestTarget.x,
      bestTarget.y
    );
    
    // Set the path
    if (playerId === 1) {
      this.player1Path = path;
    } else {
      this.player2Path = path;
    }
  }
  
  private generateEscapeTargets(
    playerId: number, 
    playerPos: {x: number, y: number}, 
    opponentPos: {x: number, y: number},
    dx: number,
    dy: number
  ): {x: number, y: number}[] {
    const targets: {x: number, y: number}[] = [];
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // If distance is too small, generate random directions
    if (dist < 5) {
      for (let angle = 0; angle < 360; angle += 45) {
        const radians = angle * (Math.PI / 180);
        targets.push({
          x: playerPos.x + Math.cos(radians) * 20,
          y: playerPos.y + Math.sin(radians) * 20
        });
      }
    } else {
      // Normalize direction away from opponent
      const normalizedDx = dx / dist;
      const normalizedDy = dy / dist;
      
      // Direct away
      targets.push({
        x: playerPos.x + normalizedDx * 20,
        y: playerPos.y + normalizedDy * 20
      });
      
      // Angle slightly to sides (flanking movements)
      targets.push({
        x: playerPos.x + normalizedDx * 15 + normalizedDy * 10,
        y: playerPos.y + normalizedDy * 15 - normalizedDx * 10
      });
      
      targets.push({
        x: playerPos.x + normalizedDx * 15 - normalizedDy * 10,
        y: playerPos.y + normalizedDy * 15 + normalizedDx * 10
      });
      
      // Add goal-oriented targets
      // For player 1 (red), right side goal is the target
      // For player 2 (blue), left side goal is the target
      const goalX = playerId === 1 ? 90 : 10;
      targets.push({
        x: (playerPos.x + goalX) / 2,
        y: 50 + (Math.random() * 20 - 10)
      });
    }
    
    // Apply boundary constraints to all targets
    return targets.map(target => ({
      x: Math.max(this.boundaryPadding, Math.min(100 - this.boundaryPadding, target.x)),
      y: Math.max(this.boundaryPadding, Math.min(100 - this.boundaryPadding, target.y))
    }));
  }
  
  private evaluateEscapeTarget(
    target: {x: number, y: number},
    playerPos: {x: number, y: number},
    opponentPos: {x: number, y: number}
  ): number {
    let score = 0;
    
    // Distance from opponent (higher is better)
    const distToOpponent = this.pathfindingManager.getDistance(target, opponentPos);
    score += distToOpponent * 2;
    
    // Distance from boundaries (higher is better, until a point)
    const distToLeftBoundary = target.x;
    const distToRightBoundary = 100 - target.x;
    const distToTopBoundary = target.y;
    const distToBottomBoundary = 100 - target.y;
    
    const minBoundaryDist = Math.min(
      distToLeftBoundary, 
      distToRightBoundary, 
      distToTopBoundary, 
      distToBottomBoundary
    );
    
    // Heavily penalize getting too close to boundaries
    if (minBoundaryDist < this.boundaryPadding) {
      score -= 50;
    }
    
    // Prefer staying in the center region of the field
    const centerPreference = 30 - Math.abs(target.y - 50);
    score += centerPreference;
    
    // Check if path to target is blocked by opponent
    const isDirectPathBlocked = this.isPathBlockedByOpponent(playerPos, target, opponentPos);
    if (isDirectPathBlocked) {
      score -= 40;
    }
    
    return score;
  }
  
  private isPathBlockedByOpponent(
    start: {x: number, y: number},
    end: {x: number, y: number},
    opponentPos: {x: number, y: number}
  ): boolean {
    // Simple check: if opponent is within a certain distance of the direct line
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return false;
    
    // Normalize direction
    const nx = dx / length;
    const ny = dy / length;
    
    // Project opponent position onto the line
    const projection = ((opponentPos.x - start.x) * nx + (opponentPos.y - start.y) * ny);
    
    // Check if projection is within the line segment
    if (projection < 0 || projection > length) {
      return false;
    }
    
    // Calculate closest point on line to opponent
    const closestX = start.x + projection * nx;
    const closestY = start.y + projection * ny;
    
    // Calculate distance from opponent to line
    const distToLine = this.pathfindingManager.getDistance(
      { x: closestX, y: closestY },
      opponentPos
    );
    
    // If opponent is within a threshold distance of the line, consider it blocked
    return distToLine < 10;
  }
  
  updatePaths(ballPossessor: number | null, ballPosition: { x: number, y: number }): void {
    this.pathUpdateCounter++;
    if (this.pathUpdateCounter >= this.pathUpdateFrequency) {
      this.pathUpdateCounter = 0;
      
      // If someone has the ball, update their escape path
      if (ballPossessor === 1) {
        this.calculateSmartEscapePath(1);
        // Make sure player 2 is actively chasing
        this.calculatePathToPlayer(2);
      } else if (ballPossessor === 2) {
        this.calculateSmartEscapePath(2);
        // Make sure player 1 is actively chasing
        this.calculatePathToPlayer(1);
      } else {
        // If nobody has the ball, both should target it
        this.calculatePathToBall(1, ballPosition);
        this.calculatePathToBall(2, ballPosition);
      }
    }
  }
  
  isApproachingBoundary(
    position: {x: number, y: number}, 
    path: {x: number, y: number}[]
  ): boolean {
    // No path or just starting position
    if (path.length <= 1) return false;
    
    // Check if any of the next few points in the path are too close to boundary
    const pointsToCheck = Math.min(3, path.length - 1);
    
    for (let i = 1; i <= pointsToCheck; i++) {
      const point = path[i];
      
      // Check if point is too close to any boundary
      if (point.x < this.boundaryPadding || 
          point.x > 100 - this.boundaryPadding ||
          point.y < this.boundaryPadding || 
          point.y > 100 - this.boundaryPadding) {
        return true;
      }
    }
    
    return false;
  }
  
  getPlayer1Path(): { x: number, y: number }[] {
    return this.player1Path;
  }
  
  getPlayer2Path(): { x: number, y: number }[] {
    return this.player2Path;
  }
  
  getPathUpdateCounter(): number {
    return this.pathUpdateCounter;
  }
}
