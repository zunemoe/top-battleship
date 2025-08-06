export function Player(name, type = 'human') {

    return {
        name: string,
        type: 'human' | 'computer',
        score: number,
        generateAttack: (enemyGameboard) => { x, y }, // Different logic per type
        // Computer-only state:
        lastHit: { x, y } | null,
        targetQueue: [{ x, y }], // Surrounding cells to try after hit
    }
}