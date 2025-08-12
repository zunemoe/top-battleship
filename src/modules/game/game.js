// Flow
// 1. Game Initialization
// 2. Turn Management
// 3. Attack Coordination
// 4. Game State
// 5. Win Condition

// Game States
// 1. Setup Phase
// 2. Playing Phase
// 3. Game Over Phase

import { Gameboard } from '../gameboard/gameboard.js';
import { SHIP_TYPES } from '../../utils/constants.js';

export function Game(player1, player2) {
    //-----------------------//
    // Game Module Logic
    //-----------------------//
    // Input validation
    if (!player1 || !player2) throw new Error('Two players are required');
    
    // Private state
    let currentPlayer = player1;
    let gameState = 'not playing'; // 'not playing', 'playing'
    let winner = null;
    let turnCount = 0;

    // Create gameboards for each player
    const player1Board = Gameboard();
    const player2Board = Gameboard();

    // Helper functions
    const switchTurns = () => {
        currentPlayer = currentPlayer === player1 ? player2 : player1;
        turnCount++;
    };

    const checkWinCondition = () => {
        if (player1Board.allShipsSunk()) {
            gameState = 'not playing';
            winner = player2;
        } else if (player2Board.allShipsSunk()) {
            gameState = 'not playing';
            winner = player1;
        }
    };

    // Public methods
    const getPlayer1 = () => player1;
    const getPlayer2 = () => player2;
    const getPlayer1Board = () => player1Board;
    const getPlayer2Board = () => player2Board;

    const startGame = () => {
        gameState = 'playing';
        currentPlayer = player1; // Player 1 starts
        updateStatusDisplay();
        updateScoreDisplay();
        updateBoardInteractivity();
    };

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

    const makeGameAttack = (x, y) => {
        if (gameState !== 'playing') throw new Error('Game is not currently playing');

        const opponentBoard = currentPlayer === player1 ? player2Board : player1Board;
        const result = currentPlayer.makeAttack(x, y, opponentBoard);

        checkWinCondition();
        gameState === 'playing' && switchTurns();
        
        updateBoardInteractivity();
        
        return result;
    }

    const generateComputerAttack = () => {
        if (currentPlayer.type !== 'computer') throw new Error('Current player is not a computer');

        const gameboard = player1Board;
        const { x, y } = currentPlayer.generateAttack(gameboard);
        
        return makeGameAttack(x, y);
    };

    const resetGame = () => {
        gameState = 'not playing';
        winner = null;
        currentPlayer = player1;
        turnCount = 0;
        // Reset gameboards
        if (player1Board.resetBoard) player1Board.resetBoard();
        if (player2Board.resetBoard) player2Board.resetBoard();

        if (gameContainer) {
            gameContainer.innerHTML = '';
            initializeGameUI('game-container');
        }
    }

    //-----------------------//
    // Game DOM Manipulation
    //-----------------------//    
    let gameContainer = null;
    let statusElement = null;
    let player1ScoreElement = null;
    let player2ScoreElement = null;

    // DOM Methods
    const initializeGameUI = (containerId) => {
        gameContainer = document.getElementById(containerId);
        if (!gameContainer) throw new Error(`Container ${containerId} not found`);

        // Create game layout
        gameContainer.innerHTML = `
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

    let selectedShip = null;
    let currentOrientation = 'horizontal';
    let isPlacingShip = false;

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

    const setupEventListeners = () => {
        document.addEventListener('boardAttack', handleBoardAttack);
        document.addEventListener('boardHover', handleBoardHover);
        document.addEventListener('boardLeave', handleBoardLeave);
        document.addEventListener('shipPlacement', handleShipPlacement);

        document.getElementById('start-game').addEventListener('click', startGame);
        document.getElementById('reset-game').addEventListener('click', resetGame);
        document.getElementById('rotate-ship').addEventListener('click', rotateShip);
    };

    const handleBoardHover = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { row, col, gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        showShipPreview(row, col, gameboard);
    };

    const handleBoardLeave = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        clearShipPreview(gameboard);
    };

    const handleShipPlacement = (event) => {
        if (!isPlacingShip || !selectedShip) return;

        const { row, col, gameboard } = event.detail;

        if (!isPlayerBoard(gameboard)) return;

        try {
            import('../ship/ship.js').then(({ Ship }) => {
                const ship = Ship(selectedShip.typeKey);
                gameboard.placeShip(ship, row, col, currentOrientation);

                clearShipPreview(gameboard);
                document.querySelector(`[data-type="${selectedShip.typeKey}"]`).remove();

                selectedShip = null;
                isPlacingShip = false;
            });
        } catch (error) {
            console.error('Error placing ship:', error);
            updateStatusDisplay(error.message);
            clearShipPreview(gameboard);
        }
    };

    // Helper function to check if it's the player's board
    const isPlayerBoard = (gameboard) => {
        // Compare the gameboard methods to determine if it's player1Board
        return gameboard === player1Board || 
            (gameboard.getGridSize && gameboard.getGridSize() === player1Board.getGridSize());
    };

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

    const clearShipPreview = (gameboard) => {
        const previewCells = document.querySelectorAll('#player1-board .ship-preview');
        previewCells.forEach(cell => {
            cell.classList.remove('ship-preview', 'ship-preview-invalid');
            cell.style.backgroundColor = '';
            cell.style.opacity = '';
        });
    };

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
            updateStatusDisplay(`${getGameState().currentPlayer.name} ${result}!`);
            updateScoreDisplay();

            if (getGameState().currentPlayer.type === 'computer' && gameState === 'playing') {
                setTimeout(() => {
                    const computerResult = generateComputerAttack();
                    updateStatusDisplay(`Computer ${computerResult}!`);
                    updateScoreDisplay();
                }, 1000);
            }
        } catch (error) {
            updateStatusDisplay(error.message);
        }
    };

    const updateStatusDisplay = (message) => {
        if (!statusElement) return;

        if (message) statusElement.textContent = message;
        else {
            if (gameState === 'not playing' && winner) statusElement.textContent = `${winner.name} wins!`; 
            else if (gameState === 'playing') statusElement.textContent = `${getGameState().currentPlayer.name}'s turn`;
            else statusElement.textContent = 'Place your ships to start the game';
        }
    };

    const updateScoreDisplay = () => {
        if (player1ScoreElement) player1ScoreElement.textContent = player1.score;
        if (player2ScoreElement) player2ScoreElement.textContent = player2.score;
    };

    const rotateShip = () => {        
        if (!selectedShip) return;

        currentOrientation = currentOrientation === 'horizontal' ? 'vertical' : 'horizontal';
        console.log(`Ship orientation changed to: ${currentOrientation}`);
    };

    const updateBoardInteractivity = () => {
        if (gameState !== 'playing') {
            player2Board.disableBoard();
            return;
        }
        if (currentPlayer === player1) player2Board.enableBoard();
        else player2Board.disableBoard();
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