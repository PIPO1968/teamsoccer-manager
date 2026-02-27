
import Phaser from 'phaser';
import { BallManager } from './BallManager';
import { PlayerManager } from './PlayerManager';
import { PathfindingManager } from './PathfindingManager';

export class PossessionManager {
  private scene: Phaser.Scene;
  private ball: Phaser.GameObjects.Arc;
  private ballManager: BallManager;
  private playerManager: PlayerManager;
  private pathfindingManager: PathfindingManager;
  private stealCooldown: number = 0;
  private maxStealCooldown: number = 90; // Frames before steal is possible again
  private lastStealTime: number = 0;
  private possessionThreshold: number = 12; // Distance to possess the ball
  private passingEnabled: boolean = true;
  private shootingEnabled: boolean = true;
  private teamInPossession: number | null = null;
  private aiDecisionCounter: number = 0;
  private aiDecisionRate: number = 30; // Make decisions every 30 frames
  
  constructor(
    scene: Phaser.Scene,
    ball: Phaser.GameObjects.Arc,
    ballManager: BallManager,
    playerManager: PlayerManager,
    pathfindingManager: PathfindingManager
  ) {
    this.scene = scene;
    this.ball = ball;
    this.ballManager = ballManager;
    this.playerManager = playerManager;
    this.pathfindingManager = pathfindingManager;
  }
  
  checkBallPossession(): number | null {
    // Get ball position
    const ballPos = this.ballManager.getBallPosition();
    const ballSpeed = this.ballManager.getBallSpeed();
    const currentPossessor = this.ballManager.getBallPossessor();
    
    // If ball is moving fast, no possession check
    if (ballSpeed > 0.5) {
      this.ballManager.setBallPossessor(null);
      return null;
    }
    
    // Check if current possessor still has the ball
    if (currentPossessor !== null) {
      const playerPos = this.playerManager.getPlayerPosition(currentPossessor);
      const distance = this.pathfindingManager.getDistance(playerPos, ballPos);
      
      if (distance > this.possessionThreshold) {
        // Player lost possession
        this.ballManager.setBallPossessor(null);
      } else {
        // Still in possession
        return currentPossessor;
      }
    }
    
    // Get all player data
    const allPlayers = this.playerManager.getAllPlayersData();
    
    // Sort players by distance to ball
    const playersByDistance = allPlayers.map(player => ({
      id: player.id,
      distance: this.pathfindingManager.getDistance(player.position, ballPos),
      team: player.teamId
    })).sort((a, b) => a.distance - b.distance);
    
    // Check if any player is close enough to possess the ball
    if (playersByDistance.length > 0 && playersByDistance[0].distance < this.possessionThreshold) {
      const closestPlayerId = playersByDistance[0].id;
      
      // Check if steal cooldown is active
      if (this.stealCooldown > 0) {
        const lastPossessorTeam = currentPossessor !== null 
          ? this.playerManager.getPlayerTeam(currentPossessor) 
          : null;
          
        const closestPlayerTeam = this.playerManager.getPlayerTeam(closestPlayerId);
        
        // If different team trying to steal during cooldown, don't allow
        if (lastPossessorTeam !== null && closestPlayerTeam !== lastPossessorTeam) {
          return currentPossessor;
        }
      }
      
      // Set the new possessor
      this.ballManager.setBallPossessor(closestPlayerId);
      this.teamInPossession = this.playerManager.getPlayerTeam(closestPlayerId);
      
      // If this is a steal, set cooldown
      if (currentPossessor !== null && 
          currentPossessor !== closestPlayerId && 
          this.playerManager.getPlayerTeam(currentPossessor) !== this.teamInPossession) {
        this.stealCooldown = this.maxStealCooldown;
        this.lastStealTime = this.scene.time.now;
      }
      
      return closestPlayerId;
    }
    
    // No player has possession
    this.ballManager.setBallPossessor(null);
    return null;
  }
  
  decrementStealCooldown(): void {
    if (this.stealCooldown > 0) {
      this.stealCooldown--;
    }
  }
  
  makeAIDecisions(): void {
    // Increment decision counter
    this.aiDecisionCounter++;
    
    // Only make decisions at the specified rate
    if (this.aiDecisionCounter < this.aiDecisionRate) {
      return;
    }
    
    // Reset counter
    this.aiDecisionCounter = 0;
    
    // Get current ball possessor
    const possessorId = this.ballManager.getBallPossessor();
    
    if (possessorId === null) {
      return; // No decisions if no one has the ball
    }
    
    const possessorTeam = this.playerManager.getPlayerTeam(possessorId);
    const possessorRole = this.playerManager.getPlayerRole(possessorId);
    const possessorPos = this.playerManager.getPlayerPosition(possessorId);
    
    // Decision logic based on position and role
    // Simple heuristic: 
    // - Pass if teammates available and under pressure
    // - Shoot if near goal
    // - Dribble otherwise
    
    // Check if near opponent goal for shooting
    const opponentGoalX = possessorTeam === 1 ? 90 : 10;
    const distanceToGoal = Math.abs(possessorPos.x - opponentGoalX);
    
    // Get nearest opponent
    const opponentTeam = possessorTeam === 1 ? 2 : 1;
    const opponentPlayers = this.playerManager.getTeamPlayers(opponentTeam);
    
    let nearestOpponentDistance = 100;
    
    for (const opponentId of opponentPlayers) {
      const opponentPos = this.playerManager.getPlayerPosition(opponentId);
      const distance = this.pathfindingManager.getDistance(possessorPos, opponentPos);
      
      if (distance < nearestOpponentDistance) {
        nearestOpponentDistance = distance;
      }
    }
    
    // Shoot if near goal and has space
    if (this.shootingEnabled && 
        distanceToGoal < 25 && 
        possessorPos.y > 30 && 
        possessorPos.y < 70 && 
        nearestOpponentDistance > 10) {
      
      // Calculate direction toward goal
      const goalCenter = { x: opponentGoalX, y: 50 };
      const direction = {
        x: goalCenter.x - possessorPos.x,
        y: goalCenter.y - possessorPos.y
      };
      
      // Add some randomness to y direction for variation
      direction.y += (Math.random() - 0.5) * 10;
      
      // Shoot with high power
      this.ballManager.kickBall(direction, 2.5, possessorId);
      return;
    }
    
    // Pass if under pressure or in appropriate role
    if (this.passingEnabled && 
        (nearestOpponentDistance < 12 || 
        Math.random() < 0.3)) { // 30% random chance to pass
      
      // Find suitable teammate to pass to
      const teammateId = this.findPassTarget(possessorId, possessorTeam);
      
      if (teammateId !== null) {
        const teammatePos = this.playerManager.getPlayerPosition(teammateId);
        
        // Calculate pass direction
        const direction = {
          x: teammatePos.x - possessorPos.x,
          y: teammatePos.y - possessorPos.y
        };
        
        // Calculate appropriate power based on distance
        const distance = this.pathfindingManager.getDistance(possessorPos, teammatePos);
        const power = Math.min(1.5, Math.max(0.8, distance / 30));
        
        // Execute the pass
        this.ballManager.kickBall(direction, power, possessorId);
        return;
      }
    }
    
    // If no pass or shot, dribble in an appropriate direction
    this.dribble(possessorId, possessorTeam, possessorPos);
  }
  
  findPassTarget(possessorId: number, team: number): number | null {
    const possessorPos = this.playerManager.getPlayerPosition(possessorId);
    const possessorRole = this.playerManager.getPlayerRole(possessorId);
    const teamPlayers = this.playerManager.getTeamPlayers(team)
      .filter(id => id !== possessorId);
    
    if (teamPlayers.length === 0) {
      return null;
    }
    
    // Prefer teammates who are:
    // 1. In front of possessor (attacking direction)
    // 2. Not closely marked by opponents
    // 3. In better field position (forwards if possessor is defender, etc.)
    
    const direction = team === 1 ? 1 : -1; // Attacking direction
    const opponentTeam = team === 1 ? 2 : 1;
    const opponentPlayers = this.playerManager.getTeamPlayers(opponentTeam);
    
    // Score each potential receiver
    const rankedTeammates = teamPlayers.map(teammateId => {
      const teammatePos = this.playerManager.getPlayerPosition(teammateId);
      const teammateRole = this.playerManager.getPlayerRole(teammateId);
      
      // Distance to pass
      const passDistance = this.pathfindingManager.getDistance(possessorPos, teammatePos);
      
      // Forward progress score
      let forwardProgress = direction * (teammatePos.x - possessorPos.x);
      
      // Role progression score
      let roleScore = 0;
      if (possessorRole === 'goalkeeper' && 
          (teammateRole === 'defender' || teammateRole === 'midfielder')) {
        roleScore = 2;
      } else if (possessorRole === 'defender' && 
                (teammateRole === 'midfielder' || teammateRole === 'forward')) {
        roleScore = 2;
      } else if (possessorRole === 'midfielder' && teammateRole === 'forward') {
        roleScore = 3;
      }
      
      // Space score - inversely proportional to nearest opponent distance
      let spaceScore = 10;
      let nearestOpponentDistance = 100;
      
      for (const opponentId of opponentPlayers) {
        const opponentPos = this.playerManager.getPlayerPosition(opponentId);
        const distance = this.pathfindingManager.getDistance(teammatePos, opponentPos);
        
        if (distance < nearestOpponentDistance) {
          nearestOpponentDistance = distance;
        }
      }
      
      spaceScore = Math.min(10, nearestOpponentDistance * 2);
      
      // Combine scores with appropriate weights
      const totalScore = 
        (forwardProgress * 1.5) + 
        (roleScore * 2) + 
        (spaceScore * 1.5) - 
        (passDistance * 0.2);
      
      return { id: teammateId, score: totalScore };
    }).sort((a, b) => b.score - a.score);
    
    // Return the highest-ranked teammate
    return rankedTeammates.length > 0 ? rankedTeammates[0].id : null;
  }
  
  dribble(playerId: number, team: number, position: { x: number, y: number }): void {
    const direction = team === 1 ? 1 : -1; // Attacking direction
    
    // Calculate dribble direction with some randomness
    const dribbleDirection = {
      x: direction + (Math.random() * 0.4 - 0.2),
      y: (Math.random() * 0.8 - 0.4)
    };
    
    // Check if near sideline and adjust
    if (position.y < 15) {
      dribbleDirection.y += 0.5;
    } else if (position.y > 85) {
      dribbleDirection.y -= 0.5;
    }
    
    // Lower power for better control
    const dribblePower = 0.3;
    
    // Execute the dribble
    this.ballManager.kickBall(dribbleDirection, dribblePower, playerId);
  }
  
  getStealCooldown(): number {
    return this.stealCooldown;
  }
  
  getMaxStealCooldown(): number {
    return this.maxStealCooldown;
  }
  
  getLastStealTime(): number {
    return this.lastStealTime;
  }
  
  getTeamInPossession(): number | null {
    return this.teamInPossession;
  }
  
  resetCooldown(): void {
    this.stealCooldown = 0;
  }
  
  randomizeTieBreaker(): void {
    // Random number to tiebreak first possession
    this.lastStealTime = Math.random() * 1000;
  }
  
  setPassingEnabled(enabled: boolean): void {
    this.passingEnabled = enabled;
  }
  
  setShootingEnabled(enabled: boolean): void {
    this.shootingEnabled = enabled;
  }
}
