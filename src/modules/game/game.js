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

import { Gameboard } from '../gameboard/gameboard';

export function Game(player1, player2) {
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
    const getCurrentPlayer = () => currentPlayer;
    const getWinner = () => winner;

    const startGame = () => {
        gameState = 'playing';
        currentPlayer = player1; // Player 1 starts
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

    const processGameTurn = () => {
        if (gameState !== 'playing') throw new Error('Game is not currently playing');

        if (currentPlayer.type === 'computer') return processComputerTurn();
        else if (currentPlayer.type === 'human') return processHumanTurn();
    };

    const processComputerTurn = () => {
        if (currentPlayer.type !== 'computer') throw new Error('Current player is not a computer');

        const gameboard = player1Board;
        const { x, y } = currentPlayer.generateAttack(gameboard);
        const result = currentPlayer.makeAttack(x, y, gameboard);

        checkWinCondition();

        gameState === 'playing' && switchTurns();

        return result;
    };

    const processTurn = () => {
        checkWinCondition();
        gameState === 'playing' && switchTurns();
    }

    const resetGame = () => {
        gameState = 'not playing';
        winner = null;
        currentPlayer = player1;
        turnCount = 0;
        // Reset gameboards
    }

    // Return public API
    return {
        getPlayer1,
        getPlayer2,
        getPlayer1Board,
        getPlayer2Board,
        getCurrentPlayer,
        getWinner,
        startGame,
        getGameState,
        processComputerTurn,
        processTurn,
        resetGame
    };
}