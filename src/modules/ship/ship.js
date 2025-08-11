import { SHIP_TYPES } from '../../utils/constants.js';

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
    return {
        type: typeKey,
        name: type.name,
        color: type.color,
        length,
        hit,
        isSunk,
        getHits
    };
}