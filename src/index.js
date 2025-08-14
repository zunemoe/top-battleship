// Import CSS files
import './styles/base.css';

import { Game } from './modules/game/game.js';
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

    window.game = game; // Expose game for debugging
    console.log('Game initialized:', game);
});