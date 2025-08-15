// <reference types="jest" />
// Jest test for the player module

import { Player } from '../src/modules/player/player.js';
import { Gameboard } from '../src/modules/gameboard/gameboard.js';
import { Ship } from '../src/modules/ship/ship.js';

describe('Player Factory:', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = Gameboard();
  });

  describe('Player Creation:', () => {
    test('creates a human player with name', () => {
      const player = Player('Alice', 'human');

      expect(player.name).toBe('Alice');
      expect(player.type).toBe('human');
      expect(player.score).toBe(0);
    });

    test('creates a computer player', () => {
      const player = Player('Computer', 'computer');

      expect(player.name).toBe('Computer');
      expect(player.type).toBe('computer');
      expect(player.score).toBe(0);
    });
  });

  describe('Human Player Attacks:', () => {
    test('can make valid attack', () => {
      const player = Player('Alice', 'human');
      
      expect(() => player.makeAttack(5, 5, gameboard)).not.toThrow();
    });

    test('increments score on successful hit', () => {
      const player = Player('Alice', 'human');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      const attackResult = player.makeAttack(0, 0, gameboard);

      expect(attackResult).toBe('hit');
      expect(player.score).toBe(1);
    });

    test('does not increment score on miss', () => {
      const player = Player('Alice', 'human');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      const attackResult = player.makeAttack(1, 1, gameboard);

      expect(attackResult).toBe('miss');
      expect(player.score).toBe(0);
    });
  });

  describe('Computer Random Attacks:', () => {
    test('generates valid attack coordinates', () => {
      const player = Player('Computer', 'computer');
      const attack = player.generateAttack(gameboard);

      expect(attack.x).toBeGreaterThanOrEqual(0);
      expect(attack.x).toBeLessThan(10);
      expect(attack.y).toBeGreaterThanOrEqual(0);
      expect(attack.y).toBeLessThan(10);
    });

    test('does not attack same coordinate twice', () => {
      const player = Player('Computer', 'computer');
      const attack1 = player.generateAttack(gameboard);
      const attack2 = player.generateAttack(gameboard);

      expect(attack1.x !== attack2.x || attack1.y !== attack2.y).toBe(true);
    });

    test('increments score on successful hit', () => {
      const player = Player('Computer', 'computer');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      
      const result = player.makeAttack(0, 0, gameboard);
      expect(result).toBe('hit');
      expect(player.score).toBe(1);
    });

    test('does not increment score on miss', () => {
      const player = Player('Computer', 'computer');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      
      const result = player.makeAttack(1, 1, gameboard);
      expect(result).toBe('miss');
      expect(player.score).toBe(0);
    });
  });

  describe('Computer Smart Targeting:', () => {
    test('targets surrounding cells after a hit', () => {
      const player = Player('Computer', 'computer');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 5, 5, 'horizontal');

      player.makeAttack(5, 5, gameboard); // First hit

      const nextAttack = player.generateAttack(gameboard);
      const surroundingCells = [
        { x: 4, y: 5 }, // Up
        { x: 6, y: 5 },  // Down
        { x: 5, y: 4 }, // Left
        { x: 5, y: 6 } // Right
      ];

      const isTargetingSurrounding = surroundingCells.some(cell => cell.x === nextAttack.x && cell.y === nextAttack.y);

      expect(isTargetingSurrounding).toBe(true);
    });

    test('continues hunting along line after second hit', () => {
      const player = Player('Computer', 'computer');
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 5, 5, 'horizontal');

      player.makeAttack(5, 5, gameboard); // First hit
      player.makeAttack(5, 6, gameboard); // Second hit

      const nextAttack = player.generateAttack(gameboard);

      expect(nextAttack.y === 4 || nextAttack.y === 7).toBe(true); // Should target left or right
      expect(nextAttack.x).toBe(5); // Should stay in the same row
    });

    test('switches to random targeting after sinking a ship', () => {
      const player = Player('Computer', 'computer');
      const ship = Ship('destroyer');
      gameboard.placeShip(ship, 5, 5, 'horizontal');

      // Sink the ship completely
      player.makeAttack(5, 5, gameboard);
      const result = player.makeAttack(5, 6, gameboard);

      expect(result).toBe('sunk');

      player.generateAttack(gameboard);
      
      expect(player.isHunting).toBe(false); // Should switch to random targeting
    });
  });
});

