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

    });
  });

  describe('Ship Placement:', () => {
  });

  describe('Turn Management:', () => {

  });

  describe('Attack Coordination:', () => {

  });

  describe('Win Conditions:', () => {

  });

  describe('Game State Management:', () => {
    
  });
});