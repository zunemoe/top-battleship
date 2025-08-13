// Handle ship placement
// Handle attack coordination
// Handle dupliate attack prevention
// Handle duplicate ship placement prevention
// Handle grid state management
// Handle game state management

import { SHIP_TYPES } from "../../utils/constants.js";

export function Gameboard() {
    //-----------------------//
    // Gameboard Module Logic
    //-----------------------//
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
    };

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
    };

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
        if (ship === null) {
            updateDisplay();
            return 'miss';
        } 

        // Hit the ship
        ship.hit();
        updateDisplay();

        // Check if sunk
        if (ship.isSunk()) return 'sunk';        
        return 'hit';
    };

    const allShipsSunk = () => {
        return ships.length > 0 && ships.every(ship => ship.isSunk());
    };

    const isAttacked = (x, y) => {
        return attackedCoordinates.has(coordinateKey(x, y));
    };

    //-----------------------//
    // DOM Manipulation
    //-----------------------//
    let gridElement = null;
    let isPlayerBoard = false;

    // DOM Methods
    const createGrid = (containerID, playerBoard = false) => {
        isPlayerBoard = playerBoard;
        const container = document.getElementById(containerID);
        if (!container) throw new Error(`Container ${containerID} not found`);

        gridElement = document.createElement('div');
        gridElement.classList.add('gameboard-grid');

        // Create 10x10 grid cells
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (!playerBoard) cell.addEventListener('click', handleCellClick);
                else {
                    cell.addEventListener('click', handleShipPlacement);
                    cell.addEventListener('mouseenter', handleCellHover);
                    cell.addEventListener('mouseleave', handleCellLeave);
                }

                gridElement.appendChild(cell);
            }
        }

        container.appendChild(gridElement);
        updateDisplay();
        return gridElement;
    };

    const handleShipPlacement = (event) => {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        const placementEvent = new CustomEvent('shipPlacement', {
            detail: {
                row,
                col,
                gameboard: getGameboardReference(),
                boardElement: gridElement,
            }
        });
        document.dispatchEvent(placementEvent);
    };

    const handleCellHover = (event) => {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        const hoverEvent = new CustomEvent('boardHover', {
            detail: {
                row,
                col,
                gameboard: getGameboardReference(),
                boardElement: gridElement,                
            }
        });
        document.dispatchEvent(hoverEvent);
    };

    const handleCellLeave = (event) => {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        const leaveEvent = new CustomEvent('boardLeave', {
            detail: {
                row,
                col,
                gameboard: getGameboardReference(),
                boardElement: gridElement,                
            }
        });
        document.dispatchEvent(leaveEvent);
    };

    const getGameboardReference = () => {
        return {
            getGridSize,
            getShipAt,
            placeShip,
            receiveAttack,
            allShipsSunk,
            isAttacked,
        };
    };

    const setBoardMode = (mode) => {
        if (!gridElement) return;
    
        // Remove all existing event listeners
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            // Clone node to remove all event listeners
            const newCell = cell.cloneNode(true);
            cell.parentNode.replaceChild(newCell, cell);
        });

        // Add appropriate event listeners based on mode
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            if (mode === 'placement' && isPlayerBoard) {
                cell.addEventListener('click', handleShipPlacement);
                cell.addEventListener('mouseenter', handleCellHover);
                cell.addEventListener('mouseleave', handleCellLeave);
            } else if (mode === 'attack' && !isPlayerBoard) {
                cell.addEventListener('click', handleCellClick);
            }
        });
    };

    const handleCellClick = (event) => {
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);

        // Prevent attack if cell is already attacked
        if (isAttacked(row, col)) return;

        // Emit custom event for attack
        const attackEvent = new CustomEvent('boardAttack', {
            detail: { row, col, board: this }
        });
        document.dispatchEvent(attackEvent);
    };

    const updateDisplay = () => {
        if (!gridElement) return;

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const cell = getCellElement(row, col);
                if (!cell) continue;

                // Clear previous content
                cell.classList.add('grid-cell');
                cell.style.backgroundColor = '';
                cell.innerHTML = '';

                const ship = grid[row][col];
                const attacked = isAttacked(row, col);

                // Show ships on player board
                if (isPlayerBoard && ship) {
                    cell.classList.add('has-ship');
                    cell.style.backgroundColor = ship.color;
                }

                if (attacked) {
                    if (ship) {
                        cell.classList.add('hit');
                        

                        if (!isPlayerBoard) cell.style.backgroundColor = ship.color;

                        if (ship.isSunk()) {
                            cell.classList.add('sunk');
                            cell.innerHTML = '<span class="material-symbols-outlined">mode_heat</span>';
                        } else cell.innerHTML = '<span class="material-symbols-outlined">close_small</span>';
                    } else cell.classList.add('miss');
                } else {
                    if (!isPlayerBoard) cell.style.backgroundColor = '';
                }
            }
        }
    };

    const getCellElement = (row, col) => {
        if (!gridElement) return null;
        return gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    };

    const highlightCell = (row, col, className) => {
        const cell = getCellElement(row, col);
        if (cell) {
            cell.classList.add(className);
            setTimeout(() => cell.classList.remove(className), 1000);
        }
    };

    const showShipPlacement = () => {
        if (isPlayerBoard) updateDisplay();
    };

    const resetBoard = () => {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                grid[row][col] = null;
            }
        }

        attackedCoordinates.clear();
        ships.length = 0;
        updateDisplay();
    }

    const enableBoard = () => {
        if (!gridElement) return;
        gridElement.classList.remove('disabled');
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.pointerEvents = 'auto';
        });
    }

    const disableBoard = () => {
        if (!gridElement) return;
        gridElement.classList.add('disabled');
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.pointerEvents = 'none';
        });
    };

    // Game State
    return {
        getGridSize,
        getShipAt,
        placeShip,
        receiveAttack,
        allShipsSunk,
        isAttacked,

        createGrid,
        updateDisplay,
        highlightCell,
        showShipPlacement,
        resetBoard,
        enableBoard,
        disableBoard,
        setBoardMode,
    };
}