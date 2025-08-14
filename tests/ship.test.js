// <reference types="jest" />
// Jest test for the ship module

import { Ship } from '../src/modules/ship/ship.js';
let carrier, destroyer;
describe('Ship Factory:', () => {
  beforeEach(() => {
    carrier = Ship('carrier');
    destroyer = Ship('destroyer');
  });

  test('creates a ship with a given type', () => {
    expect(carrier.length).toBe(5);
    expect(destroyer.length).toBe(2);
  });

  test('creates a ship that is not sunk initially', () => {
    expect(carrier.isSunk()).toBe(false);
  });

  test('ship starts with zero hits', () => {
    expect(carrier.getHits()).toBe(0);
  });

  test('ship can be hit and tracks hits correctly', () => {
    carrier.hit();
    expect(carrier.getHits()).toBe(1);
    carrier.hit();
    expect(carrier.getHits()).toBe(2);
    expect(carrier.isSunk()).toBe(false);
  });

  test('ship is sunk when hits equal length', () => {
    destroyer.hit();
    destroyer.hit();
    expect(destroyer.isSunk()).toBe(true);
  });

  test('ship cannot be hit more than its length', () => {
    destroyer.hit();
    destroyer.hit();
    destroyer.hit(); // This hit should not increase hits beyond length
    expect(destroyer.getHits()).toBe(2);
    expect(destroyer.isSunk()).toBe(true);
  });

  test('throws error for invalid ship type', () => {
    expect(() => Ship('invalid-type')).toThrow('Invalid ship type: invalid-type');
  });
});