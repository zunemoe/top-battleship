// Handle ship placement
// Handle attack coordination
// Handle dupliate attack prevention
// Handle duplicate ship placement prevention
// Handle grid state management
// Handle game state management

export function Gameboard() {
    // Constants
    const GRID_SIZE = 10;

    // Private state
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    const attackedCoordinates = new Set();
    const ships = [];

    // Helper functions
    const isValidCoordinate = (x, y) => { return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE; };
    const coordinateKey = (x, y) => `${x},${y}`;

    // Public methods
    const getGridSize = () => GRID_SIZE;

    const getShipAt = (x, y) => {
        if (!isValidCoordinate(x, y)) return null;
        return grid[x][y];
    }

    const placeShip = (ship, x, y, orientation) => {
        // Validate bounds
        if (orientation === 'horizontal') {
            if (y + ship.length > GRID_SIZE) throw new Error('Ship placement out of bounds');
        } else if (orientation === 'vertical') {
            if (x + ship.length > GRID_SIZE) throw new Error('Ship placement out of bounds');
        }

        // Check for overlapping ships    
        for (let i = 0; i < ship.length; i++) {
            const checkX = orientation === 'vertical' ? x + i : x;
            const checkY = orientation === 'horizontal' ? y + i : y;

            if (grid[checkX][checkY] !== null) throw new Error('Ships cannot overlap');
        }

        // Place the ship
        for (let i = 0; i < ship.length; i++) {
            const placeX = orientation === 'vertical' ? x + i : x;
            const placeY = orientation === 'horizontal' ? y + i : y;

            grid[placeX][placeY] = ship;
        }

        // Add ship to the ships array for tracking
        ships.push(ship);
    }

    // Attack Coordination
    const receiveAttack = (x, y) => {
        // Validate bounds
        if (!isValidCoordinate(x, y)) throw new Error('Attack coordinates out of bounds');

        // Check for duplicate attack
        const coordKey = coordinateKey(x, y);
        if (attackedCoordinates.has(coordKey)) return 'already attacked';

        // Mark as attacked
        attackedCoordinates.add(coordKey);

        // Check if hit
        const ship = grid[x][y];
        if (ship === null) return 'miss';

        // Hit the ship
        ship.hit();

        // Check if sunk
        if (ship.isSunk()) {
            return 'sunk';
        }

        return 'hit';
    }

    const allShipsSunk = () => {
        return ships.length > 0 && ships.every(ship => ship.isSunk());
    }

    const isAttacked = (x, y) => {
        return attackedCoordinates.has(coordinateKey(x, y));
    }

    // Game State
    return {
        getGridSize,
        getShipAt,
        placeShip,
        receiveAttack,
        allShipsSunk,
        isAttacked
    };
}