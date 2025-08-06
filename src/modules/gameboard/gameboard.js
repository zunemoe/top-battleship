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
        
        // Place the ship
    }

    // Attack Coordination
    const receiveAttack = (x, y) => {
        // Validate bounds

        // Check for duplicate attack

        // Mark as attacked

        // Check if hit

        // Hit the ship

        // Check if sunk
    }

    const allShipsSunk = () => {
    }

    const isAttacked = (row, col) => {
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