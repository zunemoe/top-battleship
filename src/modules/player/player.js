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

    const getLineTargets = (hit1, hit2) => {
        const targets = [];

        // Determine if horizontal or vertical line
        if (hit1.x === hit2.x) {
            // Vertical line - extend up and down
            const minY = Math.min(hit1.y, hit2.y);
            const maxY = Math.max(hit1.y, hit2.y);

            // Try extending in both directions
            if (minY - 1 >= 0) targets.push({ x: hit1.x, y: minY -1 });
            if (maxY + 1 < GRID_SIZE) targets.push({ x: hit1.x, y: maxY + 1 });
        } else if (hit1.y === hit2.y) {
            // Horizontal line - extend left and right
            const minX = Math.min(hit1.x, hit2.x);
            const maxX = Math.max(hit1.x, hit2.x);

            // Try extending in both directions
            if (minX - 1 >= 0) targets.push({ x: minX - 1, y: hit1.y });
            if (maxX + 1 < GRID_SIZE) targets.push({ x: maxX + 1, y: hit1.y });
        }

        return targets;
    };

    // Public methods
    const makeAttack = (x, y, gameboard) => {
        const result = gameboard.receiveAttack(x, y);

        // Update AI state based on attack result
        if (type === 'computer') {
            if (result === 'hit') {
                lastHit = { x, y };
                hitHistory.push({ x, y });
                isHunting = true;

                // If we have multiple hits, try to determine line direction
                if (hitHistory.length >= 2) {
                    const lineTargets = getLineTargets(hitHistory[hitHistory.length - 2], lastHit);
                    targetQueue = lineTargets.filter(target => !gameboard.isAttacked(target.x, target.y));                    
                } else {
                    // First hit, generate surrounding targets
                    const surrounding = getSurroundingCoordinates(x, y);
                    targetQueue = surrounding.filter(coord => !gameboard.isAttacked(coord.x, coord.y));
                }
            } else if (result === 'sunk') {
                // Ship sunk, reset hunting state
                isHunting = false;
                lastHit = null;
                targetQueue = [];
                hitHistory = [];
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
        makeAttack,
        generateAttack,
        // Computer-only state:
        get lastHit() { return lastHit; },
        get targetQueue() { return [...targetQueue]; },
        get isHunting() { return isHunting; }
    }
}