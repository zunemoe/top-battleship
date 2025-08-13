// Import CSS files
import './styles/base.css';
import './styles/layout.css';
import './styles/variables.css';
import './styles/responsive.css';

import { Game } from './modules/game/game.js';
import { Gameboard } from './modules/gameboard/gameboard.js';
import { Ship } from './modules/ship/ship.js';
import { Player } from './modules/player/player.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create players
    const player1 = Player('Player 1', 'human');
    const player2 = Player('Player 2', 'computer');

    // Create game
    const game = Game(player1, player2);

    // Initialize game UI
    game.initializeGameUI('game-container');

    // game.getPlayer1Board().updateDisplay();
    // game.getPlayer2Board().updateDisplay();

    window.game = game; // Expose game for debugging
    console.log('Game initialized:', game);
});