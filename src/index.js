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

    // Place some test ships for testing
    const carrier = Ship('carrier');
    const battleship = Ship('battleship');
    const cruiser = Ship('cruiser');
    const submarine = Ship('submarine');

    game.getPlayer1Board().placeShip(carrier, 0, 0, 'horizontal');
    game.getPlayer1Board().placeShip(battleship, 1, 0, 'vertical');

    game.getPlayer2Board().placeShip(cruiser, 5, 5, 'horizontal');
    game.getPlayer2Board().placeShip(submarine, 6, 5, 'vertical');

    game.getPlayer1Board().updateDisplay();
    game.getPlayer2Board().updateDisplay();

    window.game = game; // Expose game for debugging
    console.log('Game initialized:', game);
});