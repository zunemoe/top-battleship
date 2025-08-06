// <reference types="jest" />
// Jest test for the ship module

import { Ship } from '../src/modules/ship/ship';

describe('Ship Factory:', () => {
  test('creates a ship with a given length', () => {
    const ship = Ship(3);
    expect(ship.length).toBe(3);
  });

  test('creates a ship that is not sunk initially', () => {
    const ship = Ship(3);
    expect(ship.isSunk()).toBe(false);
  });

  test('ship starts with zero hits', () => {
    const ship = Ship(3);
    expect(ship.getHits()).toBe(0);
  });

  test('ship can be hit and tracks hits correctly', () => {
    const ship = Ship(3);
    ship.hit();
    expect(ship.getHits()).toBe(1);
    ship.hit();
    expect(ship.getHits()).toBe(2);
    expect(ship.isSunk()).toBe(false);
  });

  test('ship is sunk when hits equal length', () => {
    const ship = Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });

  test('ship cannot be hit more than its length', () => {
    const ship = Ship(2);
    ship.hit();
    ship.hit();
    ship.hit(); // This hit should not increase hits beyond length
    expect(ship.getHits()).toBe(2);
    expect(ship.isSunk()).toBe(true);
  });

  test('throws error for invalid ship length', () => {
    expect(() => Ship(0)).toThrow('Invalid ship length');
    expect(() => Ship(-1)).toThrow('Invalid ship length');
  });
});