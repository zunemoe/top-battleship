import { SHIP_TYPES } from '../../utils/constants.js';

/**
 * Creates a ship object with specified type and properties
 * @function Ship
 * @param {string} typeKey - The ship type key (carrier, battleship, cruiser, submarine, destroyer)
 * @returns {Object} Immutable ship object with methods and properties
 * @throws {Error} When typeKey is invalid or empty
 * 
 * @example
 * const carrier = Ship('carrier');
 * console.log(carrier.length); // 5
 * console.log(carrier.name); // 'Carrier'
 * 
 * @example
 * const destroyer = Ship('destroyer');
 * destroyer.hit();
 * destroyer.hit();
 * console.log(destroyer.isSunk()); // true (destroyer length is 2)
 */
export function Ship(typeKey) {
    const type = SHIP_TYPES[typeKey];
    if (!type) throw new Error(`Invalid ship type: ${typeKey}`);
    const length = type.length;    

    // Private state
    let hits = 0;

    // Public methods
    // hit
    const hit = () => {
        if (hits < length) hits++;
    };

    // isSunk
    const isSunk = () => hits >= length;
    
    // getHits
    const getHits = () => hits;

    // Return the public API
    return Object.freeze ({
        // Ship identity properties
        type: typeKey,
        name: type.name,
        color: type.color,
        length,

        // Ship behavior methods
        hit,
        isSunk,
        getHits
    });
}