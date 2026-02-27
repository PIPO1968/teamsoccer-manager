
import { useRef, useCallback } from 'react';
import { MovementQueue, PlayerMovement } from './types';
import { Player } from '../../components/types/match';

export const useMovementSystem = () => {
  const sourcePositions = useRef<{[key: number]: {x: number, y: number}}>({});
  const targetPositions = useRef<{[key: number]: {x: number, y: number}}>({});
  const movementQueue = useRef<MovementQueue>({});

  const initializePositions = useCallback((homePlayers: Player[], awayPlayers: Player[]) => {
    const initialPositions: {[key: number]: {x: number, y: number}} = {};
    const queues: MovementQueue = {};
    
    [...homePlayers, ...awayPlayers].forEach(player => {
      if (player?.id) {
        initialPositions[player.id] = { x: player.x, y: player.y };
        queues[player.id] = [];
      }
    });
    
    sourcePositions.current = { ...initialPositions };
    targetPositions.current = { ...initialPositions };
    movementQueue.current = queues;
    
    return initialPositions;
  }, []);

  const updatePositions = useCallback((
    currentPositions: {[key: number]: {x: number, y: number}},
    deltaTime: number,
    speedMultiplier: number
  ) => {
    const updatedPositions = { ...currentPositions };
    let positionsChanged = false;
    
    Object.keys(updatedPositions).forEach(playerIdStr => {
      const playerId = parseInt(playerIdStr);
      const currentPos = updatedPositions[playerId];
      
      if (!currentPos) return;
      
      if (movementQueue.current[playerId]?.length > 0) {
        const targetPos = movementQueue.current[playerId][0];
        
        const dx = targetPos.x - currentPos.x;
        const dy = targetPos.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const speed = 20 * speedMultiplier;
        const moveDistance = Math.min(distance, speed * deltaTime);
        
        if (moveDistance > 0) {
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          updatedPositions[playerId] = {
            x: currentPos.x + dirX * moveDistance,
            y: currentPos.y + dirY * moveDistance
          };
          
          positionsChanged = true;
        }
        
        if (moveDistance >= distance || distance < 0.5) {
          updatedPositions[playerId] = targetPos;
          movementQueue.current[playerId].shift();
        }
      } else {
        const jitterAmount = 0.02 * speedMultiplier;
        updatedPositions[playerId] = {
          x: Math.max(5, Math.min(95, currentPos.x + (Math.random() * jitterAmount - jitterAmount/2))),
          y: Math.max(5, Math.min(95, currentPos.y + (Math.random() * jitterAmount - jitterAmount/2)))
        };
      }
    });
    
    return { updatedPositions, positionsChanged };
  }, []);

  const queueMovements = useCallback((movements: PlayerMovement[]) => {
    movements.forEach(movement => {
      if (movementQueue.current[movement.id]) {
        movementQueue.current[movement.id] = [{ x: movement.x, y: movement.y }];
      }
    });
  }, []);

  return {
    initializePositions,
    updatePositions,
    queueMovements,
    movementQueue: movementQueue.current
  };
};
