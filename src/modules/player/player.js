export function Player(name, type = 'human') {
    // Input validation
    if (!name || typeof name !== 'string') throw new Error('Invalid player name');
    if (type !== 'human' && type !== 'computer') throw new Error('Invalid player type');

    // Private state
    let score = 0;

    // Computer AI state
    let lastHit = null;
    let targetQueue = [];
    let isHunting = false;
    let hitHistory = [];
    let huntDirection = null;

    // Constants
    const GRID_SIZE = 10;

    // Helper functions for AI
    const getSurroundingCoordinates = (x, y) => {
        const directions = [
            { x: x -1, y }, // Up
            { x: x + 1, y },  // Down
            { x, y: y -1 }, // Left
            { x, y: y + 1 }   // Right
        ];

        return directions.filter(coord => 
            coord.x >= 0 && coord.x < GRID_SIZE &&
            coord.y >= 0 && coord.y < GRID_SIZE
        );
    };

    const getDirectionalTargets = (startHit, direction, gameboard) => {
        const targets = [];
        let currentX = startHit.x;
        let currentY = startHit.y;

        while (true) {
            currentX += direction.dx;
            currentY += direction.dy;

            if (currentX < 0 || currentX >= GRID_SIZE || currentY < 0 || currentY >= GRID_SIZE) break;

            if (gameboard.isAttacked(currentX, currentY)) break; // Stop if already attacked
            targets.push({ x: currentX, y: currentY });
        }
        return targets;
    };

    const determineDirection = (hit1, hit2) => {
        if (hit1.x === hit2.x) return hit2.y > hit1.y ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 }; // Vertical
        else if (hit1.y === hit2.y) return hit2.x > hit1.x ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 }; // Horizontal
        return null; // Not a valid line
    };

    // Public methods
    const resetScore = () => {
        score = 0;
        lastHit = null;
        targetQueue = [];
        isHunting = false;
        hitHistory = [];
        huntDirection = null;
    };

    const makeAttack = (x, y, gameboard) => {
        const result = gameboard.receiveAttack(x, y);

        // Update AI state based on attack result
        if (type === 'computer') {
            if (result === 'hit') {
                const currentHit = { x, y };
                lastHit = currentHit;
                hitHistory.push(currentHit);
                isHunting = true;

                // If we have multiple hits, try to determine line direction
                if (hitHistory.length === 1) {
                    // First hit, generate surrounding targets
                    const surrounding = getSurroundingCoordinates(x, y);
                    targetQueue = surrounding.filter(coord => !gameboard.isAttacked(coord.x, coord.y));                                        
                } else if (hitHistory.length === 2) {
                    const direction = determineDirection(hitHistory[0], hitHistory[1]);
                    if (direction) {
                        huntDirection = direction;
                        targetQueue = [];
                        
                        const forwardTargets = getDirectionalTargets(currentHit, direction, gameboard);
                        const backwardTargets = getDirectionalTargets(hitHistory[0], {
                            dx: -direction.dx,
                            dy: -direction.dy
                        }, gameboard);

                        targetQueue = [...forwardTargets, ...backwardTargets].filter(coord => !gameboard.isAttacked(coord.x, coord.y));
                    }
                } else {
                    if (huntDirection) {
                        const newTargets = getDirectionalTargets(currentHit, huntDirection, gameboard);
                        targetQueue = [...targetQueue, ...newTargets].filter(coord => !gameboard.isAttacked(coord.x, coord.y));
                    }
                }
            } else if (result === 'miss' && isHunting) {
                // if (huntDirection && targetQueue.length === 0) {
                //     if (hitHistory.length > 0) {
                //         const lastValidHit = hitHistory[hitHistory.length - 1];
                //         const surrounding = getSurroundingCoordinates(lastValidHit.x, lastValidHit.y);
                //         targetQueue = surrounding.filter(coord => !gameboard.isAttacked(coord.x, coord.y));
                //         huntDirection = null; // Reset direction since we missed
                //     }
                // }
            } 
            else if (result === 'sunk') {
                // Ship sunk, reset hunting state
                isHunting = false;
                lastHit = null;
                targetQueue = [];
                hitHistory = [];
                huntDirection = null;
            }
        }

        if (result === 'hit' || result === 'sunk') score++;

        return result;
    };

    const generateAttack = (gameboard) => {
        // Smart targeting for AI
        if (type === 'computer' && isHunting && targetQueue.length > 0) {
            // Remove invalid targets - those already attacked
            targetQueue = targetQueue.filter(target => !gameboard.isAttacked(target.x, target.y));

            if (targetQueue.length > 0) return targetQueue.shift(); // Return first target in queue
            else {
                isHunting = false;
                lastHit = null;
                hitHistory = [];
                huntDirection = null;
            }
        }

        // Fallback to random attack
        let x, y;
        do {
            x = Math.floor(Math.random() * GRID_SIZE);
            y = Math.floor(Math.random() * GRID_SIZE);
        } while (gameboard.isAttacked(x, y));

        return { x, y };
    };

    return {
        name,
        type,
        get score() { return score; },
        resetScore,
        makeAttack,
        generateAttack,
        // Computer-only state:
        get lastHit() { return lastHit; },
        get targetQueue() { return [...targetQueue]; },
        get isHunting() { return isHunting; },
        get hitHistory() { return [...hitHistory]; },
    }
}