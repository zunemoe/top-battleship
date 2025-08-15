// <reference types="jest" />
// Jest test for the gameboard module

import { Gameboard } from '../src/modules/gameboard/gameboard.js';
import { Ship } from '../src/modules/ship/ship.js';

describe('Gameboard Factory:', () => {
  let gameboard;

  beforeEach(() => {
    gameboard = Gameboard();
  });

  describe('Grid Creation:', () => {
    test('creates a 10x10 grid', () => {
      expect(gameboard.getGridSize()).toBe(10);
    });

    test('grid starts empty', () => {
      expect(gameboard.getShipAt(0, 0)).toBeNull();
      expect(gameboard.getShipAt(9, 9)).toBeNull();
    });
  });

  describe('Ship Placement:', () => {
    test('places ship horizontally', () => {
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');

      expect(gameboard.getShipAt(0, 0)).toBe(ship);
      expect(gameboard.getShipAt(0, 1)).toBe(ship);
      expect(gameboard.getShipAt(0, 2)).toBe(ship);
      expect(gameboard.getShipAt(0, 3)).toBeNull();
    });

    test('places ship vertically', () => {
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'vertical');

      expect(gameboard.getShipAt(0, 0)).toBe(ship);
      expect(gameboard.getShipAt(1, 0)).toBe(ship);
      expect(gameboard.getShipAt(2, 0)).toBe(ship);
      expect(gameboard.getShipAt(3, 0)).toBeNull();
    });

    test('prevents ship placement out of bounds', () => {
      const ship = Ship('cruiser');
      expect(() => gameboard.placeShip(ship, 8, 8, 'horizontal')).toThrow('Ship placement out of bounds');
      expect(() => gameboard.placeShip(ship, 8, 8, 'vertical')).toThrow('Ship placement out of bounds');
    });

    test('prevents overlapping ship placement', () => {
      const ship1 = Ship('cruiser');
      const ship2 = Ship('submarine');
      gameboard.placeShip(ship1, 0, 0, 'horizontal');
      expect(() => gameboard.placeShip(ship2, 0, 0, 'vertical')).toThrow('Ships cannot overlap');
    });
  });

  describe('Attack Coordination', () => {
    test('returns miss for empty coordinates', () => {
      expect(gameboard.receiveAttack(5, 5)).toBe('miss');
    });

    test('returns hit for attacking a ship', () => {
      const ship = Ship('cruiser');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      expect(gameboard.receiveAttack(0, 1)).toBe('hit');
    });

    test('returns sunk when ship is destroyed', () => {
      const ship = Ship('destroyer');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      gameboard.receiveAttack(0, 0);
      expect(gameboard.receiveAttack(0, 1)).toBe('sunk');
      expect(ship.isSunk()).toBe(true);
    });

    test('prevents duplicate attacks', () => {
      const ship = Ship('destroyer');
      gameboard.placeShip(ship, 0, 0, 'horizontal');
      gameboard.receiveAttack(0, 0);
      expect(gameboard.receiveAttack(0, 0)).toBe('already attacked');
    });

    test('throws error for out of bounds attack', () => {
      expect(() => gameboard.receiveAttack(-1, 0)).toThrow('Attack coordinates out of bounds');
      expect(() => gameboard.receiveAttack(10, 10)).toThrow('Attack coordinates out of bounds');
    });
  });

  describe('Game State', () => {
    test('reports not all ships sunk initially', () => {
      const ship1 = Ship('destroyer');
      const ship2 = Ship('cruiser');
      gameboard.placeShip(ship1, 0, 0, 'horizontal');
      gameboard.placeShip(ship2, 1, 1, 'vertical');
      expect(gameboard.allShipsSunk()).toBe(false);
    });

    test('reports all ships sunk when all ships are destroyed', () => {
      const ship1 = Ship('destroyer');
      const ship2 = Ship('destroyer');
      gameboard.placeShip(ship1, 0, 0, 'horizontal');
      gameboard.placeShip(ship2, 1, 1, 'vertical');
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(0, 1);
      gameboard.receiveAttack(1, 1);
      gameboard.receiveAttack(2, 1);

      expect(gameboard.allShipsSunk()).toBe(true);
    });

    test('tracks attacked coordinates', () => {
      gameboard.receiveAttack(0, 0);
      gameboard.receiveAttack(0, 1);

      expect(gameboard.isAttacked(0, 0)).toBe(true);
      expect(gameboard.isAttacked(0, 1)).toBe(true);
      expect(gameboard.isAttacked(1, 0)).toBe(false);
    });
  });
});