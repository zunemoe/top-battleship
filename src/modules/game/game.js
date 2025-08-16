import { Gameboard } from '../gameboard/gameboard.js';
import { Ship } from '../ship/ship.js';
import { SHIP_TYPES } from '../../utils/constants.js';

/**
 * Creates a complete Battleship game with two players, gameboards, and full UI management
 * @function Game
 * @param {Object} player1 - First player object (typically human)
 * @param {Object} player2 - Second player object (typically computer)
 * @returns {Object} Game object with gameplay methods and UI controls
 * @throws {Error} When players are invalid or missing
 * 
 * @example
 * const humanPlayer = Player('John', 'human');
 * const computerPlayer = Player('AI', 'computer');
 * const game = Game(humanPlayer, computerPlayer);
 * game.initializeGameUI('game-container');
 * 
 * @example
 * game.startGame();
 * const result = game.makeGameAttack(5, 5);
 * console.log('Attack result:', result);
 */
export function Game(player1, player2) {
    //==============================================
    // INPUT VALIDATION
    //==============================================
    if (!player1 || !player2) throw new Error('Two players are required');
    
    //==============================================
    // GAME STATE
    //==============================================
    let currentPlayer = player1;
    let gameState = 'not playing'; // 'not playing', 'playing'
    let winner = null;
    let turnCount = 0;

    //==============================================
    // GAME BOARDS
    //==============================================
    const player1Board = Gameboard();
    const player2Board = Gameboard();

    //==============================================
    // SHIP PLACEMENT STATE
    //==============================================
    let selectedShip = null;
    let currentOrientation = 'horizontal';
    let isPlacingShip = false;

    //==============================================
    // DOM REFERENCES
    //==============================================
    let gameContainer = null;
    let statusElement = null;
    let player1ScoreElement = null;
    let player2ScoreElement = null;

    //==============================================
    // PLAYER ACCESS METHODS
    //==============================================
    const getPlayer1 = () => player1;
    const getPlayer2 = () => player2;
    const getPlayer1Board = () => player1Board;
    const getPlayer2Board = () => player2Board;

    //==============================================
    // GAME STATE METHODS
    //==============================================
    const getGameState = () => {
        return {
            currentPlayer,
            gameState,
            winner,
            player1Score: player1.score,
            player2Score: player2.score,
            turnCount
        };
    };

    //==============================================
    // TURN MANAGEMENT METHODS
    //==============================================

    // Switches the active player and increments turn counter
    const switchTurns = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        turnCount++;
    };

    // Checks if either player has won the game
    const checkWinCondition = () => {
        if (player1Board.allShipsSunk()) {
            gameState = 'not playing';
            winner = player2;
        } else if (player2Board.allShipsSunk()) {
            gameState = 'not playing';
            winner = player1;
        }
    };

    //==============================================
    // GAME SETUP METHODS
    //==============================================

    /**
     * Checks if all required ships have been placed for game start
     * @private
     * @returns {boolean} True if all ships are placed
     */
    const areAllShipsPlaced = () => {
        const requiredShips = Object.keys(SHIP_TYPES);
        const placedShips = document.querySelectorAll('.ship-item.placed');
        return placedShips.length === requiredShips.length;
    }

    /**
     * Starts the game if all ships are placed
     * @method startGame
     * @returns {void}
     * @throws {Error} When ships are not properly placed
     * 
     * @example
     * game.startGame();
     */
    const startGame = () => {
        if (!areAllShipsPlaced()) {
            updateStatusDisplay('Please place all ships before starting the game');
            return;
        }

        gameState = 'playing';
        currentPlayer = player1; // Player 1 starts
        initializeComputerShips(); // Place computer ships if player2 is a computer
        updateStatusDisplay();
        updateScoreDisplay();
        updateBoardInteractivity();
    };    

    // Initializes computer player's ships with random placement
    const initializeComputerShips = () => {
        player2Board.resetBoard();
        placeShipsRandomly(player2Board);
        console.log('Computer ships placed randomly');
    };

    /**
     * Resets the entire game to initial state
     * @method resetGame
     * @returns {void}
     * 
     * @example
     * game.resetGame(); // Clears all ships, scores, and resets UI
     */
    const resetGame = () => {
        // Reset game state
        gameState = 'not playing';
        winner = null;
        currentPlayer = player1;
        turnCount = 0;

        // Reset gameboards
        if (player1Board.resetBoard) player1Board.resetBoard();
        if (player2Board.resetBoard) player2Board.resetBoard();

        // Reset ship placement state
        selectedShip = null;
        isPlacingShip = false;
        currentOrientation = 'horizontal';

        // Reset player scores
        player1.resetScore();
        player2.resetScore();

        resetShipInventory();

        if (gameContainer) {
            gameContainer.innerHTML = '';
            initializeGameUI('game-container');
        }

        // Update displays
        updateStatusDisplay();
        updateScoreDisplay();
        updateBoardInteractivity();
    };

    //==============================================
    // ATTACK COORDINATION METHODS
    //==============================================

    /**
     * Executes a game attack at specified coordinates
     * @method makeGameAttack
     * @param {number} x - X coordinate to attack
     * @param {number} y - Y coordinate to attack
     * @returns {string} Attack result ('hit', 'miss', 'sunk', 'already attacked')
     * @throws {Error} When game is not in playing state
     * 
     * @example
     * const result = game.makeGameAttack(5, 5);
     */
    const makeGameAttack = (x, y) => {
        if (gameState !== 'playing') throw new Error('Game is not currently playing');

        const opponentBoard = currentPlayer === player1 ? player2Board : player1Board;
        const result = currentPlayer.makeAttack(x, y, opponentBoard);

        checkWinCondition();
        gameState === 'playing' && switchTurns();
        
        updateBoardInteractivity();
        
        return result;
    }

    // Generates and executes a computer player attack
    const generateComputerAttack = () => {
        if (currentPlayer.type !== 'computer') throw new Error('Current player is not a computer');

        const gameboard = player1Board;
        const { x, y } = currentPlayer.generateAttack(gameboard);
        
        return makeGameAttack(x, y);
    };    

    //==============================================
    // SHIP PLACEMENT METHODS
    //==============================================

    /**
     * Validates ship placement considering adjacency rules
     * @private
     * @param {Object} gameboard - Target gameboard
     * @param {Object} ship - Ship object to place
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} orientation - Ship orientation
     * @returns {boolean} True if placement is valid
     */
    const isValidShipPlacement = (gameboard, ship, x, y, orientation) => {
        const shipLength = ship.length;

        for (let i = -1; i <= shipLength; i++) {
            for (let j = -1; j <= 1; j++) {
                let checkX, checkY;

                if (orientation === 'horizontal') {
                    checkX = x + j;
                    checkY = y + i;
                } else {
                    checkX = x + i;
                    checkY = y + j;
                }

                if (checkX < 0 || checkX >= 10 || checkY < 0 || checkY >= 10) continue;

                if (orientation === 'horizontal' && i >= 0 && i < shipLength && j === 0) {
                    if (checkY < 0 || checkY >= 10) return false;
                } else if (orientation === 'vertical' && j === 0 && i >= 0 && i < shipLength) {
                    // This is a cell the ship will occupy - just check bounds  
                    if (checkX < 0 || checkX >= 10) return false;
                } else {
                    // This is an adjacent cell - check if it has a ship
                    if (gameboard.getShipAt(checkX, checkY) !== null) return false; // Adjacent ship found
                }
            }
        }   
        
        return true;
    };

    // Places ships randomly on a gameboard for setup
    const placeShipsRandomly = (gameboard) => {
        const shipTypes = Object.keys(SHIP_TYPES);

        shipTypes.forEach(typeKey => {
            let placed = false;
            
            while (!placed) {
                const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                const row = Math.floor(Math.random() * gameboard.getGridSize());
                const col = Math.floor(Math.random() * gameboard.getGridSize());

                try {
                    const ship = Ship(typeKey);
                    if (isValidShipPlacement(gameboard, ship, row, col, orientation)) {
                        gameboard.placeShip(ship, row, col, orientation);
                        placed = true;                    
                    }                    
                } catch (error) {
                    // console.error(`Error placing ship ${shipType.name}:`, error);
                }
            }

            if (!placed) {
                let fallbackPlaced = false;

                while (!fallbackPlaced) {
                    const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
                    const row = Math.floor(Math.random() * gameboard.getGridSize());
                    const col = Math.floor(Math.random() * gameboard.getGridSize());

                    try {
                        const ship = Ship(typeKey);
                        gameboard.placeShip(ship, row, col, orientation);
                        fallbackPlaced = true;
                    } catch (error) {

                    }
                }
            }
        });
    };

    // Shuffles player ships with random placement
    const shuffleShips = () => {
        if (gameState !== 'not playing') return;

        player1Board.resetBoard();
        resetShipInventory();
        placeShipsRandomly(player1Board);
        player1Board.updateDisplay();
        markAllShipsAsPlaced();
    };

    //==============================================
    // SHIP INVENTORY MANAGEMENT
    //==============================================

    // Resets ship inventory UI to initial state
    const resetShipInventory = () => {
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected', 'placed');
        });
        selectedShip = null;
        isPlacingShip = false;
    };

    // Marks all ships as placed in the UI
    const markAllShipsAsPlaced = () => {
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.add('placed');
        });
    };

    // Selects a ship type for manual placement
    const selectShipForPlacement = (typeKey, shipType) => {
        // Deselect previously selected ship
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Mark current selection
        document.querySelector(`[data-type="${typeKey}"]`).classList.add('selected');
        
        // Set selected ship for placement
        selectedShip =  { typeKey, ...shipType };
        isPlacingShip = true;        
    };

    // Rotates the current ship orientation
    const rotateShip = () => {        
        currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        console.log(`Ship orientation changed to: ${currentOrientation}`);
    };

    //==============================================
    // DOM INITIALIZATION METHODS
    //==============================================

    /**
     * Initializes the complete game UI in the specified container
     * @method initializeGameUI
     * @param {string} containerId - ID of the DOM container element
     * @returns {void}
     * @throws {Error} When container is not found
     * 
     * @example
     * game.initializeGameUI('game-container');
     * // Creates complete game interface with boards, controls, etc.
     */
    const initializeGameUI = (containerId) => {
        gameContainer = document.getElementById(containerId);
        if (!gameContainer) throw new Error(`Container ${containerId} not found`);

        // Create game layout
        gameContainer.innerHTML = `
            <h1 class="game-title">Battlesh<span class="material-symbols-outlined">anchor</span>p</h1>
            <div class="game-header">
                <div class="player-info">
                    <h3>${player1.name}</h3>
                    <span class="score" id="player1-score">0</span>
                </div>
                <div class="game-status" id="game-status">Place your ships to start the game</div>
                <div class="player-info">
                    <h3>${player2.name}</h3>
                    <span class="score" id="player2-score">0</span>
                </div>
            </div>
            <div class="game-boards">
                <div class="board-container">
                    <h4>Your Board</h4>
                    <div id="player1-board"></div>
                </div>
                <div class="board-container">
                    <h4>Computer's Board</h4>
                    <div id="player2-board"></div>
                </div>
            </div>
            <div class="game-controls">
                <button id="start-game"><span class="material-symbols-outlined">play_arrow</span></button>
                <button id="reset-game"><span class="material-symbols-outlined">laps</span></button>
                <button id="shuffle-ships"><span class="material-symbols-outlined">shuffle</span></button>
                <button id="rotate-ship"><span class="material-symbols-outlined">cached</span></button>
            </div>
            <div class="ship-inventory">
                <h4>Select a ship to place</h4>
                <div id="ship-list">
                </div>             
            </div>
        `;

        // Reference DOM elements
        statusElement = document.getElementById('game-status');
        player1ScoreElement = document.getElementById('player1-score');
        player2ScoreElement = document.getElementById('player2-score');

        player1Board.createGrid('player1-board', true);
        player2Board.createGrid('player2-board', false);

        // Create ship inventory
        setupShipInventory();

        // Event listeners
        setupEventListeners();
        updateStatusDisplay();
    };

    // Creates the ship inventory UI with selectable ships
    const setupShipInventory = () => {
        const shipList = document.getElementById('ship-list');
        if (!shipList) throw new Error('Ship list container not found');

        Object.keys(SHIP_TYPES).forEach(typeKey => {
            const shipType = SHIP_TYPES[typeKey];
            const shipItem = document.createElement('div');
            shipItem.classList.add('ship-item');
            shipItem.dataset.type = typeKey;

            const shipboxes = Array.from({ length: shipType.length }, () => {
                return `<div class="ship-box" style="background-color: ${shipType.color}"></div>`;
            }).join('');

            shipItem.innerHTML = `
                <p>${shipType.name}</p>
                <div class="ship-boxes">${shipboxes}</div>
            `;

            shipItem.addEventListener('click', () => {
                selectShipForPlacement(typeKey, shipType);
            });

            shipList.appendChild(shipItem);
        });
    };

    // Sets up all game event listeners
    const setupEventListeners = () => {
        document.addEventListener('boardAttack', handleBoardAttack);
        document.addEventListener('boardHover', handleBoardHover);
        document.addEventListener('boardLeave', handleBoardLeave);
        document.addEventListener('shipPlacement', handleShipPlacement);

        document.getElementById('start-game').addEventListener('click', startGame);
        document.getElementById('reset-game').addEventListener('click', resetGame);
        document.getElementById('shuffle-ships').addEventListener('click', shuffleShips);
        document.getElementById('rotate-ship').addEventListener('click', rotateShip);
    };

    //==============================================
    // DOM EVENT HANDLERS
    //==============================================

    // Handles board hover events for ship placement preview
    const handleBoardHover = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { row, col, gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        showShipPreview(row, col, gameboard);
    };

    // Handles board leave events for ship placement preview
    const handleBoardLeave = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        clearShipPreview(gameboard);
    };

    // Handles ship placement click events
    const handleShipPlacement = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { row, col, gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        try {
            const ship = Ship(selectedShip.typeKey);
            gameboard.placeShip(ship, row, col, currentOrientation);

            clearShipPreview(gameboard);
            const shipElement = document.querySelector(`[data-type="${selectedShip.typeKey}"]`);
            if (shipElement) {
                shipElement.classList.add('placed');                
            }

            selectedShip = null;
            isPlacingShip = false;
            player1Board.updateDisplay();
        } catch (error) {
            console.error('Error placing ship:', error);
            updateStatusDisplay(error.message);
            clearShipPreview(gameboard);
        }
    };

    // Handles board attack click events
    const handleBoardAttack = (event) => {
        const { row, col, gameboard } = event.detail;

        if (gameState !== 'playing') {
            updateStatusDisplay('Game is not currently playing');
            return;
        }

        if (gameboard === player1Board) {
            updateStatusDisplay('Cannot attack your own board');
            return;
        }

        try {
            const result = makeGameAttack(row, col);

            if (winner) {
                updateStatusDisplay();
                return;
            }

            updateStatusDisplay(`${getGameState().currentPlayer.name} ${result}!`);
            updateScoreDisplay();

            if (getGameState().currentPlayer.type === 'computer' && gameState === 'playing') {
                setTimeout(() => {
                    const computerResult = generateComputerAttack();
                    
                    if (winner) {
                        updateStatusDisplay();
                        return;
                    }

                    updateStatusDisplay(`Computer ${computerResult}!`);
                    updateScoreDisplay();
                }, 1000);
            }
        } catch (error) {
            updateStatusDisplay(error.message);
        }
    };

    //==============================================
    // SHIP PREVIEW METHODS
    //==============================================

    /**
     * Shows ship placement preview on hover
     * @private
     * @param {number} row - Row coordinate
     * @param {number} col - Column coordinate
     * @param {Object} gameboard - Target gameboard
     * @returns {void}
     */
    const showShipPreview = (row, col, gameboard) => {
        clearShipPreview(gameboard);

        const coordinates = [];
        let hasOverlap = false;

        // Calculate ship coordinates based on orientation
        for (let i = 0; i < selectedShip.length; i++) {
            const x = currentOrientation === 'vertical' ? row + i : row;
            const y = currentOrientation === 'horizontal' ? col + i : col;

            coordinates.push({ x, y });

            // Check if coordinates are valid and not overlapping
            if (x >= 10 || y >= 10 || x < 0 || y < 0) hasOverlap = true;
            else if (gameboard.getShipAt(x, y) !== null) hasOverlap = true;            
        }

        coordinates.forEach( ({ x, y }) => {
            if (x >= 0 && x < 10 && y >= 0 && y < 10) {
                const cell = document.querySelector(`#player1-board [data-row="${x}"][data-col="${y}"]`);
                if (cell) {
                    cell.classList.add('ship-preview');
                    if (hasOverlap) cell.classList.add('ship-preview-invalid');
                    else {
                        cell.style.backgroundColor = selectedShip.color;
                        cell.style.opacity = '0.7';
                    }
                }
            }
        });
    };

    // Clears ship placement preview
    const clearShipPreview = (gameboard) => {
        const previewCells = document.querySelectorAll('#player1-board .ship-preview');
        previewCells.forEach(cell => {
            cell.classList.remove('ship-preview', 'ship-preview-invalid');
            cell.style.backgroundColor = '';
            cell.style.opacity = '';
        });
        player1Board.updateDisplay();
    };

    //==============================================
    // UTILITY METHODS
    //==============================================

    // Checks if a gameboard belongs to the player
    const isPlayerBoard = (gameboard) => {
        // Compare the gameboard methods to determine if it's player1Board
        return gameboard === player1Board || 
            (gameboard.getGridSize && gameboard.getGridSize() === player1Board.getGridSize());
    };

    // Updates board interactivity based on current game state and player
    const updateBoardInteractivity = () => {
        if (gameState !== 'playing') {
            player2Board.disableBoard();
            return;
        }
        if (currentPlayer === player1) player2Board.enableBoard();
        else player2Board.disableBoard();
    };

    //==============================================
    // DISPLAY UPDATE METHODS
    //==============================================

    /**
     * Updates the game status display with current information
     * @method updateStatusDisplay
     * @param {string} [message] - Optional custom message to display
     * @returns {void}
     * 
     * @example
     * game.updateStatusDisplay('Player hit!');
     * game.updateStatusDisplay(); // Shows default status based on game state
     */
    const updateStatusDisplay = (message) => {
        if (!statusElement) return;

        if (message) statusElement.textContent = message;
        else {
            if (winner) statusElement.textContent = `🎉 ${winner.name} wins! 🎉`;
            else if (gameState === 'playing') statusElement.textContent = `${getGameState().currentPlayer.name}'s turn`;
            else statusElement.textContent = 'Place your ships to start the game';                                    
        }
    };

    /**
     * Updates the score display for both players
     * @method updateScoreDisplay
     * @returns {void}
     * 
     * @example
     * game.updateScoreDisplay(); // Refreshes both player scores
     */
    const updateScoreDisplay = () => {
        if (player1ScoreElement) player1ScoreElement.textContent = player1.score;
        if (player2ScoreElement) player2ScoreElement.textContent = player2.score;
    };

    // Return public API
    return {
        getPlayer1,
        getPlayer2,
        getPlayer1Board,
        getPlayer2Board,
        startGame,
        getGameState,
        generateComputerAttack,
        makeGameAttack,
        resetGame,

        initializeGameUI,
        updateStatusDisplay,
        updateScoreDisplay,
    };
}