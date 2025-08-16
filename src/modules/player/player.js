/**
 * Creates a player object with attack capabilities and AI logic for computer players
 * @function Player
 * @param {string} name - The player's display name
 * @param {string} type - Player type ('human' or 'computer')
 * @returns {Object} Immutable player object with attack methods and AI logic
 * @throws {Error} When name is invalid or type is not 'human' or 'computer'
 * 
 * @example
 * const humanPlayer = Player('John', 'human');
 * const result = humanPlayer.makeAttack(5, 5, opponentBoard);
 * 
 * @example
 * const computerPlayer = Player('AI', 'computer');
 * const coords = computerPlayer.generateAttack(opponentBoard);
 * const result = computerPlayer.makeAttack(coords.x, coords.y, opponentBoard);
 */
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

    /**
     * Executes an attack on the opponent's gameboard and updates player score
     * @method makeAttack
     * @param {number} x - X coordinate to attack
     * @param {number} y - Y coordinate to attack
     * @param {Object} gameboard - Target gameboard object
     * @returns {string} Attack result ('hit', 'miss', 'sunk', 'already attacked')
     * @throws {Error} When coordinates are invalid or gameboard is missing
     * 
     * @example
     * const result = player.makeAttack(3, 4, enemyBoard);
     * if (result === 'hit') {
     *   console.log('Direct hit!');
     * }
     */
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
            } else if (result === 'sunk') {
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

    /**
     * Generates attack coordinates for the player (random for human, AI-driven for computer)
     * @method generateAttack
     * @param {Object} gameboard - Target gameboard to analyze
     * @returns {{x: number, y: number}} Coordinates to attack
     * @throws {Error} When gameboard is invalid
     * 
     * @example
     * const coords = computerPlayer.generateAttack(playerBoard);
     * const result = computerPlayer.makeAttack(coords.x, coords.y, playerBoard);
     */
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

    //==============================================
    // AI HELPER FUNCTIONS
    //==============================================
    /**
     * Gets surrounding coordinates for a given position
     * @private
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {Array<{x: number, y: number}>} Array of valid surrounding coordinates
     */
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

    /**
     * Gets targets in a specific direction from a starting hit
     * @private
     * @param {Object} startHit - Starting hit coordinates
     * @param {Object} direction - Direction object with dx, dy properties
     * @param {Object} gameboard - Target gameboard
     * @returns {Array<{x: number, y: number}>} Array of target coordinates
     */
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

    /**
     * Determines direction between two hits
     * @private
     * @param {Object} hit1 - First hit coordinates
     * @param {Object} hit2 - Second hit coordinates
     * @returns {Object|null} Direction object or null if not a valid line
     */
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

    // Return the public API
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