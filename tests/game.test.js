// <reference types="jest" />
// Jest test for the game module

import { Game } from '../src/modules/game/game.js';
import { Player } from '../src/modules/player/player.js';
import { Ship } from '../src/modules/ship/ship.js';

describe('Game Factory:', () => {
  let game;
  let player1;
  let player2;

  beforeEach(() => {
    document.body.innerHTML = `
        <div class="ship-item placed" data-type="carrier"></div>
        <div class="ship-item placed" data-type="battleship"></div>
        <div class="ship-item placed" data-type="cruiser"></div>
        <div class="ship-item placed" data-type="submarine"></div>
        <div class="ship-item placed" data-type="destroyer"></div>        
    `;

    player1 = Player('Player 1', 'human');
    player2 = Player('Player 2', 'computer');
    game = Game(player1, player2);
  });

  describe('Game Creation & Setup:', () => {
    test('creates a game with two players', () => {
      expect(game.getPlayer1()).toBe(player1);
      expect(game.getPlayer2()).toBe(player2);
    });

    test('initializes gameboards for both players', () => {
      expect(game.getPlayer1Board()).toBeDefined();
      expect(game.getPlayer2Board()).toBeDefined();
      expect(game.getPlayer1Board().getGridSize()).toBe(10);
      expect(game.getPlayer2Board().getGridSize()).toBe(10);
    });

    test('sets player 1 as the starting player', () => {
      expect(game.getGameState().currentPlayer).toBe(player1);
    });
  });

  describe('Ship Placement:', () => {
    test('allows placing ships on player gameboards', () => {
      const ship = Ship('cruiser');

      expect(() => game.getPlayer1Board().placeShip(ship, 0, 0, 'horizontal')).not.toThrow();
      expect(game.getPlayer1Board().getShipAt(0, 0)).toBe(ship);
    });

    test('tracks setup completion for both players', () => {
      const ships1 = [Ship('carrier'), Ship('battleship'), Ship('cruiser'), Ship('submarine'), Ship('destroyer')];
      const ships2 = [Ship('carrier'), Ship('battleship'), Ship('cruiser'), Ship('submarine'), Ship('destroyer')];

      const positions = [
        [0, 0], [2, 0], [4, 0], [6, 0], [8, 0]
      ];

      ships1.forEach((ship, i) => game.getPlayer1Board().placeShip(ship, positions[i][0], positions[i][1], 'horizontal'));
      ships2.forEach((ship, i) => game.getPlayer2Board().placeShip(ship, positions[i][0], positions[i][1], 'horizontal'));

      game.startGame();
      expect(game.getGameState().gameState).toBe('playing');
    });
  });

  describe("Turn Management:", () => {
    beforeEach(() => {
      // Set up game with ships

      game.getPlayer1Board().placeShip(Ship("cruiser"), 0, 0, "horizontal");
      game.getPlayer2Board().placeShip(Ship("cruiser"), 0, 0, "horizontal");

      game.startGame();
    });

    test("switches turns after valid attack", () => {
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer1());

      game.makeGameAttack(0, 0);
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer2());

      game.makeGameAttack(1, 1);
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer1());
    });

    test("does not switch turn after invalid attack", () => {
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer1());

      game.makeGameAttack(0, 0);
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer2());

      expect(() => game.makeGameAttack(10, 10)).toThrow(
        "Attack coordinates out of bounds"
      );
      expect(game.getGameState().currentPlayer).toBe(game.getPlayer2()); // Should still be player 2
    });
  });

  describe('Attack Coordination:', () => {
    beforeEach(() => {
      // Set up game with ships
      const ship = Ship('cruiser');
      game.startGame();
      game.getPlayer2Board().resetBoard();
      expect(() => game.getPlayer2Board().placeShip(ship, 0, 0, 'horizontal')).not.toThrow();
    });

    test('processes attack on opponent gameboard', () => {
      const result = game.makeGameAttack(0, 0);
      expect(result).toBe('hit');
      expect(game.getPlayer2Board().isAttacked(0, 0)).toBe(true);
    });

    test('updates player score on successful hit', () => {
      expect(player1.score).toBe(0);
      game.makeGameAttack(0, 0);
      expect(player1.score).toBe(1);
    });
  });

  describe('Win Conditions:', () => {
    beforeEach(() => {
      // Set up game with ships
      const ship = Ship('destroyer');
      game.startGame();
      game.getPlayer2Board().resetBoard();
      expect(() => game.getPlayer2Board().placeShip(ship, 0, 0, 'horizontal')).not.toThrow();
    });

    test('detects when all ships are sunk', () => {
      game.makeGameAttack(0, 0); // Player 1 attacks
      game.makeGameAttack(0, 0); // Player 2 attacks
      game.makeGameAttack(0, 1); // Player 1 attacks and sinks ship

      expect(game.getPlayer2Board().allShipsSunk()).toBe(true);
      expect(game.getGameState().gameState).toBe('not playing');
      expect(game.getGameState().winner).toBe(player1);
    });

    test('continues game when ships remain', () => {
      game.makeGameAttack(0, 0); // Player 1 attacks
      game.makeGameAttack(0, 1); // Player 2 attacks      

      expect(game.getPlayer1Board().allShipsSunk()).toBe(false);
      expect(game.getPlayer2Board().allShipsSunk()).toBe(false);
      expect(game.getGameState().gameState).toBe('playing');
      expect(game.getGameState().winner).toBeNull();
    });
  });

  describe('Game State Management:', () => {
    beforeEach(() => {
      // Set up game with ships
      game.getPlayer1Board().placeShip(Ship('destroyer'), 0, 0, 'horizontal');
      game.getPlayer2Board().placeShip(Ship('destroyer'), 0, 0, 'horizontal');

      game.startGame();
    });

    test('provides game state summary', () => {
      const state = game.getGameState();

      expect(state).toEqual({
        currentPlayer: player1,
        gameState: 'playing',
        winner: null,
        player1Score: 0,
        player2Score: 0,
        turnCount: 0
      });
    });

    test('resets game state', () => {
      game.makeGameAttack(0, 0);
      expect(game.getGameState().turnCount).toBe(1);

      game.resetGame();

      expect(game.getGameState().gameState).toBe('not playing');
      expect(game.getGameState().currentPlayer).toBe(player1);
      expect(game.getGameState().winner).toBeNull();
    });
  });
});