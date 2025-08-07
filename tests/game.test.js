// <reference types="jest" />
// Jest test for the game module

import { Game } from '../src/modules/game/game';
import { Player } from '../src/modules/player/player';
import { Ship } from '../src/modules/ship/ship';

describe('Game Factory:', () => {
  let game;
  let player1;
  let player2;

  beforeEach(() => {
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
      expect(game.getPlayer1().getGameboard()).toBeDefined();
      expect(game.getPlayer2().getGameboard()).toBeDefined();
      expect(game.getPlayer1().getGameboard().getGridSize()).toBe(10);
      expect(game.getPlayer2().getGameboard().getGridSize()).toBe(10);
    });

    test('sets player 1 as the starting player', () => {
      expect(game.getCurrentPlayer()).toBe(player1);
    });

    test('initializes game state as active', () => {
      expect(game.isGameOver()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });
  });

  describe('Ship Placement:', () => {
    test('allows placing shps on player gameboards', () => {
      const ship = Ship(3);

      expect(() => game.placeShip(player1, ship, 0, 0, 'horizontal')).not.toThrow();
      expect(player1.getGameboard().getShipAt(0, 0)).toBe(ship);
    });

    test('tracks setup completion for both players', () => {
      expect(game.isSetupComplete(player1)).toBe(false);
      expect(game.isSetupComplete(player2)).toBe(false);

      const ships1 = [Ship(5), Ship(4), Ship(3), Ship(3), Ship(2)];
      const ships2 = [Ship(5), Ship(4), Ship(3), Ship(3), Ship(2)];

      ships1.forEach((ship, i) => game.placeShip(player1, ship, i, 0, 'horizontal'));
      ships2.forEach((ship, i) => game.placeShip(player2, ship, i, 0, 'horizontal'));

      expect(game.isSetupComplete(player1)).toBe(true);
      expect(game.isSetupComplete(player2)).toBe(true);
    });
  });

  describe('Turn Management:', () => {
    test('switches turns after valid attack', () => {
      expect(game.getCurrentPlayer()).toBe(player1);
      player1.makeAttack(0, 0);
      game.switchTurn();
      expect(() => game.getCurrentPlayer()).toBe(player2);

      player2.makeAttack(1, 1);
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(player1);
    });

    test('does not switch turn after invalid attack', () => {
      expect(game.getCurrentPlayer()).toBe(player1);
      player1.makeAttack(0, 0); // Assume this is a valid attack
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(player2);

      expect(() => game.makeAttack(10, 10)).toThrow('Attack coordinates out of bounds');
      expect(game.getCurrentPlayer()).toBe(player2); // Should still be player 2
    });

    test('handles computer turns automatically', () => {
      game.switchTurn();
      expect(game.getCurrentPlayer()).toBe(player2);
      const result = game.processComputerTurn();
      expect(result).toBeDefined();
      expect(game.getCurrentPlayer()).toBe(player1); // Should switch back to player 1
    });
  });

  describe('Attack Coordination:', () => {
    test('processes attack on opponent gameboard', () => {
      const ship = Ship(3);
      game.placeShip(player2, ship, 0, 0, 'horizontal');

      const result = game.makeAttack(0, 0);

      expect(result).toBe('hit');
      expect(player2.getGameboard().isAttacked(0, 0)).toBe(true);
    });

    test('updates player score on successful hit', () => {
      const ship = Ship(3);
      game.placeShip(player2, ship, 0, 0, 'horizontal');
      
      expect(player1.getScore()).toBe(0);
      game.makeAttack(0, 0);
      expect(player1.getScore()).toBe(1);
    });
  });

  describe('Win Conditions:', () => {
    test('detects when all ships are sunk', () => {
      const ship = Ship(2);
      game.placeShip(player2, ship, 0, 0, 'horizontal');
      game.makeAttack(0, 0);
      game.makeAttack(0, 1);

      expect(player2.getGameboard().allShipsSunk()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.getWinner()).toBe(player1);
    });

    test('continues game when ships remain', () => {
      const ship1 = Ship(2);
      const ship2 = Ship(3);
      game.placeShip(player2, ship1, 0, 0, 'horizontal');
      game.placeShip(player2, ship2, 1, 1, 'vertical');
      game.makeAttack(0, 0);
      game.makeAttack(1, 1);

      expect(player2.getGameboard().allShipsSunk()).toBe(false);
      expect(game.isGameOver()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });
  });

  describe('Game State Management:', () => {
    test('provides game state summary', () => {
      const state = game.getGameState();

      expect(state).toEqual({
        currentPlayer: player1,
        isGameOver: false,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        turnCount: 0
      });
    });

    test('resets game state', () => {
      game.makeAttack(0, 0);
      expect(game.getGameState().turnCount).toBe(1);

      game.resetGame();

      expect(game.getGameState().turnCount).toBe(0);
      expect(game.getCurrentPlayer()).toBe(player1);
      expect(game.isGameOver()).toBe(false);
      expect(game.getWinner()).toBeNull();
    });
  });
});