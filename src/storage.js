export class Storage {
    static PUZZLES_KEY = 'puzzles';
    static CURRENT_PUZZLE_KEY = 'current_puzzle_id';

    static saveGameState(puzzleId, state, revealTimestamp) {
        // 1. Save individual puzzle information
        const puzzleData = {
            ...state,
            revealTimestamp: revealTimestamp,
        };
        localStorage.setItem(puzzleId, JSON.stringify(puzzleData));

        // 2. Update current puzzle indicator
        localStorage.setItem(this.CURRENT_PUZZLE_KEY, puzzleId);

        // 3. Update list of puzzles
        const puzzles = this.getPuzzlesList();
        if (!puzzles.includes(puzzleId)) {
            puzzles.push(puzzleId);
            localStorage.setItem(this.PUZZLES_KEY, JSON.stringify(puzzles));
        }
    }

    static getGameState(puzzleId) {
        const data = localStorage.getItem(puzzleId);
        return data ? JSON.parse(data) : null;
    }

    static getPuzzlesList() {
        const puzzles = localStorage.getItem(this.PUZZLES_KEY);
        return puzzles ? JSON.parse(puzzles) : [];
    }

    static getCurrentPuzzleId() {
        return localStorage.getItem(this.CURRENT_PUZZLE_KEY);
    }
}
