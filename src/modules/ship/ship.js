export function Ship(length) {
    // Input validation
    if (length <= 0) throw new Error('Invalid ship length');

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
        length,
        hit,
        isSunk,
        getHits
    };
}