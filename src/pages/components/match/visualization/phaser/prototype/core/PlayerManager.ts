import Phaser from 'phaser';

export interface PlayerData {
  id: number;
  position: string;
  role: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
  initialX: number;
  initialY: number;
  teamId: number; // 1 for home, 2 for away
}

export class PlayerManager {
  private scene: Phaser.Scene;
  private convertToPixelsX: (percentage: number) => number;
  private convertToPixelsY: (percentage: number) => number;
  
  // Player containers and positions
  private players: { [playerId: number]: Phaser.GameObjects.Container } = {};
  private playerPositions: { [playerId: number]: { x: number; y: number } } = {};
  private playerRoles: { [playerId: number]: string } = {};
  private playerTeams: { [playerId: number]: number } = {}; // 1 for home, 2 for away
  
  // Formation positions (4-4-2)
  private homeFormation: PlayerData[] = [
    // Goalkeeper
    { id: 1, position: 'GK', role: 'goalkeeper', initialX: 10, initialY: 50, teamId: 1 },
    // Defenders (4)
    { id: 2, position: 'LB', role: 'defender', initialX: 20, initialY: 25, teamId: 1 },
    { id: 3, position: 'CB', role: 'defender', initialX: 20, initialY: 40, teamId: 1 },
    { id: 4, position: 'CB', role: 'defender', initialX: 20, initialY: 60, teamId: 1 },
    { id: 5, position: 'RB', role: 'defender', initialX: 20, initialY: 75, teamId: 1 },
    // Midfielders (4)
    { id: 6, position: 'LM', role: 'midfielder', initialX: 35, initialY: 25, teamId: 1 },
    { id: 7, position: 'CM', role: 'midfielder', initialX: 35, initialY: 40, teamId: 1 },
    { id: 8, position: 'CM', role: 'midfielder', initialX: 35, initialY: 60, teamId: 1 },
    { id: 9, position: 'RM', role: 'midfielder', initialX: 35, initialY: 75, teamId: 1 },
    // Forwards (2)
    { id: 10, position: 'ST', role: 'forward', initialX: 45, initialY: 40, teamId: 1 },
    { id: 11, position: 'ST', role: 'forward', initialX: 45, initialY: 60, teamId: 1 }
  ];
  
  private awayFormation: PlayerData[] = [
    // Goalkeeper
    { id: 12, position: 'GK', role: 'goalkeeper', initialX: 90, initialY: 50, teamId: 2 },
    // Defenders (4)
    { id: 13, position: 'RB', role: 'defender', initialX: 80, initialY: 25, teamId: 2 },
    { id: 14, position: 'CB', role: 'defender', initialX: 80, initialY: 40, teamId: 2 },
    { id: 15, position: 'CB', role: 'defender', initialX: 80, initialY: 60, teamId: 2 },
    { id: 16, position: 'LB', role: 'defender', initialX: 80, initialY: 75, teamId: 2 },
    // Midfielders (4)
    { id: 17, position: 'RM', role: 'midfielder', initialX: 65, initialY: 25, teamId: 2 },
    { id: 18, position: 'CM', role: 'midfielder', initialX: 65, initialY: 40, teamId: 2 },
    { id: 19, position: 'CM', role: 'midfielder', initialX: 65, initialY: 60, teamId: 2 },
    { id: 20, position: 'LM', role: 'midfielder', initialX: 65, initialY: 75, teamId: 2 },
    // Forwards (2)
    { id: 21, position: 'ST', role: 'forward', initialX: 55, initialY: 40, teamId: 2 },
    { id: 22, position: 'ST', role: 'forward', initialX: 55, initialY: 60, teamId: 2 }
  ];
  
  // Active players (those currently chasing the ball or involved in play)
  private activePlayerIds: { [teamId: number]: number[] } = {
    1: [], // Home team
    2: [] // Away team
  };
  
  // Maximum number of active players per team
  private maxActivePlayersPerTeam = 3;
  
  constructor(
    scene: Phaser.Scene,
    convertToPixelsX: (percentage: number) => number,
    convertToPixelsY: (percentage: number) => number
  ) {
    this.scene = scene;
    this.convertToPixelsX = convertToPixelsX;
    this.convertToPixelsY = convertToPixelsY;
  }
  
  createPlayers(homeTeamColor: number, awayTeamColor: number): void {
    // Create home team players
    this.homeFormation.forEach(playerData => {
      const player = this.createPlayer(
        playerData.id, 
        homeTeamColor, 
        playerData.position
      );
      
      this.players[playerData.id] = player;
      this.playerPositions[playerData.id] = { x: playerData.initialX, y: playerData.initialY };
      this.playerRoles[playerData.id] = playerData.role;
      this.playerTeams[playerData.id] = playerData.teamId;
      
      // Initial position
      const pixelX = this.convertToPixelsX(playerData.initialX);
      const pixelY = this.convertToPixelsY(playerData.initialY);
      player.setPosition(pixelX, pixelY);
    });
    
    // Create away team players
    this.awayFormation.forEach(playerData => {
      const player = this.createPlayer(
        playerData.id, 
        awayTeamColor, 
        playerData.position
      );
      
      this.players[playerData.id] = player;
      this.playerPositions[playerData.id] = { x: playerData.initialX, y: playerData.initialY };
      this.playerRoles[playerData.id] = playerData.role;
      this.playerTeams[playerData.id] = playerData.teamId;
      
      // Initial position
      const pixelX = this.convertToPixelsX(playerData.initialX);
      const pixelY = this.convertToPixelsY(playerData.initialY);
      player.setPosition(pixelX, pixelY);
    });
  }
  
  createPlayer(id: number, color: number, position: string): Phaser.GameObjects.Container {
    // Player body
    const playerCircle = this.scene.add.circle(0, 0, 10, color);
    playerCircle.setStrokeStyle(2, 0xffffff);
    
    // Player number
    const text = this.scene.add.text(0, 0, id.toString(), {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Position label
    const posText = this.scene.add.text(0, -15, position, {
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Create container
    const container = this.scene.add.container(0, 0, [playerCircle, text, posText]);
    container.setData('id', id);
    container.setName(`player${id}`);
    
    return container;
  }
  
  updatePlayerPosition(playerId: number, x: number, y: number): void {
    const player = this.players[playerId];
    
    if (player) {
      const pixelX = this.convertToPixelsX(x);
      const pixelY = this.convertToPixelsY(y);
      player.setPosition(pixelX, pixelY);
      
      // Update stored position
      this.playerPositions[playerId] = { x, y };
    }
  }
  
  getPlayer(playerId: number): Phaser.GameObjects.Container {
    if (!this.players[playerId]) {
      throw new Error(`Player ${playerId} not initialized`);
    }
    return this.players[playerId];
  }
  
  getPlayerPosition(playerId: number): { x: number, y: number } {
    return this.playerPositions[playerId] || { x: 50, y: 50 };
  }
  
  getPlayerRole(playerId: number): string {
    return this.playerRoles[playerId] || 'midfielder';
  }
  
  getPlayerTeam(playerId: number): number {
    return this.playerTeams[playerId] || 1;
  }
  
  getTeamPlayers(teamId: number): number[] {
    return Object.keys(this.playerTeams)
      .filter(id => this.playerTeams[parseInt(id)] === teamId)
      .map(id => parseInt(id));
  }
  
  // Get nearest player to a position by role and team
  getNearestPlayerByRole(
    position: { x: number, y: number }, 
    role: string, 
    teamId: number,
    excludeIds: number[] = []
  ): number | null {
    const teamPlayers = this.getTeamPlayers(teamId);
    
    // Filter by role
    const rolePlayers = teamPlayers.filter(id => 
      this.playerRoles[id] === role && !excludeIds.includes(id)
    );
    
    if (rolePlayers.length === 0) {
      return null;
    }
    
    // Find closest player
    let nearestId = rolePlayers[0];
    let nearestDistance = this.getDistance(
      position, 
      this.playerPositions[nearestId]
    );
    
    for (const playerId of rolePlayers) {
      const distance = this.getDistance(
        position, 
        this.playerPositions[playerId]
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = playerId;
      }
    }
    
    return nearestId;
  }
  
  // Get distance between two positions
  getDistance(pos1: { x: number, y: number }, pos2: { x: number, y: number }): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Set active players for a team based on ball position
  updateActivePlayersBasedOnBallPosition(
    ballPosition: { x: number, y: number },
    ballPossessorTeam: number | null
  ): void {
    // Reset active players
    this.activePlayerIds[1] = [];
    this.activePlayerIds[2] = [];
    
    // For both teams
    for (let teamId = 1; teamId <= 2; teamId++) {
      const isAttacking = ballPossessorTeam === teamId;
      
      // Get team players
      const teamPlayers = this.getTeamPlayers(teamId);
      
      // Sort by distance to ball
      const playersByDistance = teamPlayers.map(id => ({
        id,
        distance: this.getDistance(ballPosition, this.playerPositions[id]),
        role: this.playerRoles[id]
      })).sort((a, b) => a.distance - b.distance);
      
      // Select active players based on team situation and roles
      let selectedCount = 0;
      
      // Role priority depends on whether team is attacking or defending
      const rolePriority = isAttacking
        ? ['forward', 'midfielder', 'defender', 'goalkeeper']
        : ['defender', 'midfielder', 'forward', 'goalkeeper'];
      
      // Always add closest player regardless of role
      if (playersByDistance.length > 0 && playersByDistance[0].role !== 'goalkeeper') {
        this.activePlayerIds[teamId].push(playersByDistance[0].id);
        selectedCount++;
      }
      
      // Add players by role priority until max is reached
      for (const role of rolePriority) {
        if (selectedCount >= this.maxActivePlayersPerTeam) break;
        
        const rolePlayersNotSelected = playersByDistance.filter(
          p => p.role === role && !this.activePlayerIds[teamId].includes(p.id)
        );
        
        for (const player of rolePlayersNotSelected) {
          if (selectedCount >= this.maxActivePlayersPerTeam) break;
          
          // Goalkeepers only become active if ball is close to goal
          if (role === 'goalkeeper') {
            const goalX = teamId === 1 ? 10 : 90;
            const ballToGoalDistance = Math.abs(ballPosition.x - goalX);
            
            if (ballToGoalDistance < 15) {
              this.activePlayerIds[teamId].push(player.id);
              selectedCount++;
            }
          } else {
            this.activePlayerIds[teamId].push(player.id);
            selectedCount++;
          }
        }
      }
    }
  }
  
  getActivePlayerIds(teamId: number): number[] {
    return this.activePlayerIds[teamId] || [];
  }
  
  isPlayerActive(playerId: number): boolean {
    const teamId = this.playerTeams[playerId];
    return this.activePlayerIds[teamId]?.includes(playerId) || false;
  }
  
  // Move players according to their roles and game state
  movePlayersBasedOnRoles(
    ballPosition: { x: number, y: number },
    ballPossessorId: number | null
  ): void {
    const ballPossessorTeam = ballPossessorId ? this.playerTeams[ballPossessorId] : null;
    
    // Update active players
    this.updateActivePlayersBasedOnBallPosition(ballPosition, ballPossessorTeam);
    
    // Process all players
    for (const playerId in this.players) {
      const id = parseInt(playerId);
      const role = this.playerRoles[id];
      const teamId = this.playerTeams[id];
      const position = this.playerPositions[id];
      const isActive = this.isPlayerActive(id);
      
      // Get target position based on role, ball position, and game situation
      const targetPosition = this.getTargetPositionByRole(
        id, role, ballPosition, ballPossessorTeam, isActive
      );
      
      // Move toward target position
      if (targetPosition) {
        // If active, move faster
        const moveSpeed = isActive ? 0.5 : 0.2;
        
        // Calculate direction and distance
        const dx = targetPosition.x - position.x;
        const dy = targetPosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0.5) { // Only move if not close enough
          // Calculate new position with speed applied
          const moveDistance = Math.min(distance, moveSpeed);
          const newX = position.x + (dx / distance) * moveDistance;
          const newY = position.y + (dy / distance) * moveDistance;
          
          // Update player position
          this.updatePlayerPosition(id, newX, newY);
        }
      }
    }
  }
  
  // Determine target position based on player's role and game state
  getTargetPositionByRole(
    playerId: number,
    role: string,
    ballPosition: { x: number, y: number },
    ballPossessorTeam: number | null,
    isActive: boolean
  ): { x: number, y: number } {
    const teamId = this.playerTeams[playerId];
    const currentPosition = this.playerPositions[playerId];
    const isAttacking = ballPossessorTeam === teamId;
    
    // Team's direction of play
    const attackingDirection = teamId === 1 ? 1 : -1; // 1 = right, -1 = left
    
    // Role-based positioning
    switch (role) {
      case 'goalkeeper':
        // Goalkeepers stay in goal area
        const goalX = teamId === 1 ? 10 : 90;
        
        // If ball is very close, move toward it
        if (isActive && this.getDistance(ballPosition, { x: goalX, y: 50 }) < 12) {
          // Move toward ball but stay near goal line
          const maxAdvance = 5;
          const targetX = teamId === 1 
            ? Math.max(goalX, Math.min(goalX + maxAdvance, ballPosition.x))
            : Math.min(goalX, Math.max(goalX - maxAdvance, ballPosition.x));
          
          // Adjust y position toward ball
          const yOffset = ballPosition.y > 50 ? 5 : -5;
          return { x: targetX, y: Math.min(Math.max(50 + yOffset, 30), 70) };
        }
        
        // Otherwise stay in position
        return { x: goalX, y: 50 };
        
      case 'defender':
        if (isActive) {
          if (isAttacking) {
            // Attacking defenders move up but not too far
            const maxX = teamId === 1 ? 40 : 60;
            const targetX = teamId === 1 
              ? Math.min(maxX, ballPosition.x - 10) 
              : Math.max(maxX, ballPosition.x + 10);
            
            // Move toward ball's y-position
            return { x: targetX, y: ballPosition.y };
          } else {
            // Defending defenders chase the ball or mark attackers
            if (this.getDistance(currentPosition, ballPosition) < 15) {
              // Close to ball - chase it
              return { x: ballPosition.x, y: ballPosition.y };
            } else {
              // Mark nearby attackers
              const opponentTeamId = teamId === 1 ? 2 : 1;
              const opponentForwards = this.getTeamPlayers(opponentTeamId)
                .filter(id => this.playerRoles[id] === 'forward');
              
              if (opponentForwards.length > 0) {
                // Find closest forward to mark
                let closestForward = opponentForwards[0];
                let closestDist = this.getDistance(
                  currentPosition, 
                  this.playerPositions[closestForward]
                );
                
                for (const fwdId of opponentForwards) {
                  const dist = this.getDistance(
                    currentPosition, 
                    this.playerPositions[fwdId]
                  );
                  if (dist < closestDist) {
                    closestDist = dist;
                    closestForward = fwdId;
                  }
                }
                
                // Mark the forward
                const fwdPos = this.playerPositions[closestForward];
                const goalX = teamId === 1 ? 10 : 90;
                
                // Position between forward and goal
                return {
                  x: (fwdPos.x + goalX) / 2,
                  y: fwdPos.y
                };
              }
            }
          }
        }
        
        // Default defensive positioning based on ball position
        const defenseLineX = teamId === 1 
          ? 25 + (ballPosition.x > 50 ? 10 : 0) 
          : 75 - (ballPosition.x < 50 ? 10 : 0);
        
        // Get original formation position's y-value
        const formationData = teamId === 1 
          ? this.homeFormation.find(p => p.id === playerId) 
          : this.awayFormation.find(p => p.id === playerId);
        
        const baseY = formationData ? formationData.initialY : 50;
        
        // Adjust based on ball position but maintain formation shape
        const yAdjustment = (ballPosition.y - 50) * 0.3;
        return { x: defenseLineX, y: baseY + yAdjustment };
        
      case 'midfielder':
        if (isActive) {
          if (isAttacking) {
            // Support attack - move toward ball but maintain spacing
            const supportX = ballPosition.x + (attackingDirection * 10);
            return { x: supportX, y: ballPosition.y };
          } else {
            // Defending - drop back or press
            return { x: ballPosition.x, y: ballPosition.y };
          }
        }
        
        // Default midfield positioning
        const midfieldX = teamId === 1 
          ? 40 + (ballPosition.x > 60 ? 10 : 0) 
          : 60 - (ballPosition.x < 40 ? 10 : 0);
        
        // Get original formation position
        const midFormationData = teamId === 1 
          ? this.homeFormation.find(p => p.id === playerId) 
          : this.awayFormation.find(p => p.id === playerId);
        
        const midBaseY = midFormationData ? midFormationData.initialY : 50;
        
        // Adjust based on ball position
        const midYAdjustment = (ballPosition.y - 50) * 0.4;
        return { x: midfieldX, y: midBaseY + midYAdjustment };
        
      case 'forward':
        if (isActive) {
          if (isAttacking) {
            // Attacking forwards move toward goal or ball
            if (teamId === 1) {
              // For home team - move toward goal or support ball
              return ballPosition.x > 70 
                ? { x: 80, y: ballPosition.y } // Near goal - get in position
                : { x: ballPosition.x + 10, y: ballPosition.y }; // Support play
            } else {
              // For away team
              return ballPosition.x < 30 
                ? { x: 20, y: ballPosition.y } // Near goal - get in position
                : { x: ballPosition.x - 10, y: ballPosition.y }; // Support play
            }
          } else {
            // Defending forwards - press but don't track back too far
            const pressX = teamId === 1 
              ? Math.max(30, ballPosition.x) 
              : Math.min(70, ballPosition.x);
            return { x: pressX, y: ballPosition.y };
          }
        }
        
        // Default forward positioning
        const attackX = teamId === 1 
          ? 65 + (ballPosition.x > 70 ? 10 : 0) 
          : 35 - (ballPosition.x < 30 ? 10 : 0);
        
        // Get original formation position
        const fwdFormationData = teamId === 1 
          ? this.homeFormation.find(p => p.id === playerId) 
          : this.awayFormation.find(p => p.id === playerId);
        
        const fwdBaseY = fwdFormationData ? fwdFormationData.initialY : 50;
        
        // Adjust based on ball position
        const fwdYAdjustment = (ballPosition.y - 50) * 0.5;
        return { x: attackX, y: fwdBaseY + fwdYAdjustment };
        
      default:
        // Default behavior - return to initial position
        const defaultData = teamId === 1 
          ? this.homeFormation.find(p => p.id === playerId) 
          : this.awayFormation.find(p => p.id === playerId);
        
        return defaultData 
          ? { x: defaultData.initialX, y: defaultData.initialY } 
          : { x: 50, y: 50 };
    }
  }
  
  getAllPlayersData(): { id: number, position: { x: number, y: number }, teamId: number, role: string }[] {
    const result = [];
    
    for (const playerId in this.players) {
      const id = parseInt(playerId);
      result.push({
        id,
        position: this.playerPositions[id],
        teamId: this.playerTeams[id],
        role: this.playerRoles[id]
      });
    }
    
    return result;
  }
  
  getPlayerCount(): number {
    return Object.keys(this.players).length;
  }
  
  resetPositions(): void {
    // Reset all players to their initial positions
    this.homeFormation.forEach(playerData => {
      if (this.players[playerData.id]) {
        this.updatePlayerPosition(playerData.id, playerData.initialX, playerData.initialY);
      }
    });
    
    this.awayFormation.forEach(playerData => {
      if (this.players[playerData.id]) {
        this.updatePlayerPosition(playerData.id, playerData.initialX, playerData.initialY);
      }
    });
    
    // Reset active players
    this.activePlayerIds[1] = [];
    this.activePlayerIds[2] = [];
  }
}
