/**
 * Creates a gameboard object with grid management, ship placement, and attack handling capabilities
 * @function Gameboard
 * @returns {Object} Gameboard object with grid management and DOM manipulation methods
 * 
 * @example
 * const playerBoard = Gameboard();
 * const ship = Ship('destroyer');
 * playerBoard.placeShip(ship, 0, 0, 'horizontal');
 * 
 * @example
 * const result = computerBoard.receiveAttack(5, 5);
 * if (result === 'hit') {
 *   console.log('Ship hit!');
 * }
 */
export function Gameboard() {
    //==============================================
    // CONSTANTS & PRIVATE STATE
    //==============================================
    const GRID_SIZE = 10;

    // Private state
    const grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    const attackedCoordinates = new Set();
    const ships = [];    

    //==============================================
    // DOM STATE
    //==============================================
    let gridElement = null;
    let isPlayerBoard = false;

    // Helper functions
    const isValidCoordinate = (x, y) => { return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE; };
    const coordinateKey = (x, y) => `${x},${y}`;

    //==============================================
    // GRID STATE METHODS
    //==============================================

    // Gets the size of the game grid
    const getGridSize = () => GRID_SIZE;

    // Gets the ship at specified coordinates
    const getShipAt = (x, y) => {
        if (!isValidCoordinate(x, y)) return null;
        return grid[x][y];
    };

    // Checks if coordinates have been attacked
    const isAttacked = (x, y) => {
        return attackedCoordinates.has(coordinateKey(x, y));
    };  

    //==============================================
    // SHIP PLACEMENT METHODS
    //==============================================

    /**
     * Places a ship on the gameboard at specified coordinates
     * @method placeShip
     * @param {Object} ship - Ship object to place
     * @param {number} x - Starting X coordinate
     * @param {number} y - Starting Y coordinate
     * @param {string} orientation - Ship orientation ('horizontal' or 'vertical')
     * @throws {Error} When ship placement is invalid (out of bounds or overlapping)
     * 
     * @example
     * const ship = Ship('carrier');
     * gameboard.placeShip(ship, 0, 0, 'horizontal');
     * 
     * @example
     * try {
     *   gameboard.placeShip(ship, 9, 9, 'horizontal'); // Will throw error
     * } catch (error) {
     *   console.log('Invalid placement:', error.message);
     * }
     */
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

    //==============================================
    // ATTACK COORDINATION METHODS
    //==============================================

    /**
     * Processes an attack on the gameboard
     * @method receiveAttack
     * @param {number} x - X coordinate to attack
     * @param {number} y - Y coordinate to attack
     * @returns {string} Attack result ('hit', 'miss', 'sunk', 'already attacked')
     * @throws {Error} When attack coordinates are out of bounds
     * 
     * @example
     * const result = gameboard.receiveAttack(5, 5);
     * switch (result) {
     *   case 'hit': console.log('Ship hit!'); break;
     *   case 'miss': console.log('Missed!'); break;
     *   case 'sunk': console.log('Ship sunk!'); break;
     * }
     */
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

    //==============================================
    // GAME STATE METHODS
    //==============================================

    // Checks if all ships on the board have been sunk
    const allShipsSunk = () => {
        return ships.length > 0 && ships.every(ship => ship.isSunk());
    };  

    // Resets the gameboard to initial state
    const resetBoard = () => {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                grid[row][col] = null;
            }
        }

        attackedCoordinates.clear();
        ships.length = 0;
        updateDisplay();
    };

    //==============================================
    // DOM CREATION METHODS
    //==============================================

    /**
     * Creates and renders the gameboard grid in the specified container
     * @method createGrid
     * @param {string} containerID - ID of the container element
     * @param {boolean} [playerBoard=false] - Whether this is a player board
     * @returns {HTMLElement} The created grid element
     * @throws {Error} When container is not found
     * 
     * @example
     * const gridElement = gameboard.createGrid('player-board-container', true);
     */
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

    // Gets a specific cell element from the grid
    const getCellElement = (row, col) => {
        if (!gridElement) return null;
        return gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    };

    //==============================================
    // DOM EVENT HANDLERS
    //==============================================

    // Handles ship placement clicks on player board
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

    // Handles cell hover events for ship placement preview
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

    // Handles cell leave events for ship placement preview
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

    // Handles attack clicks on opponent board
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

    // Gets a reference object for external use
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

    //==============================================
    // DOM MANIPULATION METHODS
    //==============================================

    /**
     * Updates the visual display of the gameboard
     * @method updateDisplay
     * @returns {void}
     * 
     * @example
     * gameboard.updateDisplay(); // Refreshes grid appearance
     */
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

    /**
     * Highlights a specific cell with a CSS class temporarily
     * @method highlightCell
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @param {string} className - CSS class to apply
     * @returns {void}
     * 
     * @example
     * gameboard.highlightCell(5, 5, 'highlight-hit');
     */
    const highlightCell = (row, col, className) => {
        const cell = getCellElement(row, col);
        if (cell) {
            cell.classList.add(className);
            setTimeout(() => cell.classList.remove(className), 1000);
        }
    };

    // Shows ship placement on player board
    const showShipPlacement = () => {
        if (isPlayerBoard) updateDisplay();
    };    

    /**
     * Sets the board interaction mode
     * @method setBoardMode
     * @param {string} mode - Board mode ('placement' or 'attack')
     * @returns {void}
     * 
     * @example
     * gameboard.setBoardMode('attack'); // Switch to attack mode
     */
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

            if (mode === 'placement' && isPlayerBoard) {
                cell.addEventListener('click', handleShipPlacement);
                cell.addEventListener('mouseenter', handleCellHover);
                cell.addEventListener('mouseleave', handleCellLeave);
            } else if (mode === 'attack' && !isPlayerBoard) {
                cell.addEventListener('click', handleCellClick);
            }
        });
    };    

    //==============================================
    // BOARD CONTROL METHODS
    //==============================================

    // Enables board interactions
    const enableBoard = () => {
        if (!gridElement) return;
        gridElement.classList.remove('disabled');
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.pointerEvents = 'auto';
        });
    }

    // Disables board interactions
    const disableBoard = () => {
        if (!gridElement) return;
        gridElement.classList.add('disabled');
        gridElement.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.pointerEvents = 'none';
        });
    };

    // Return the public API
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