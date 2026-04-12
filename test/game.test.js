import { Game } from '../src/game.js';

describe('Game', () => {
    const letters = ['w', 'a', 'e', 'g', 'n', 'r', 'z'];
    const words = ['weer', 'wegen', 'wagen', 'zwaar', 'zweren'];
    let game;

    beforeEach(() => {
        game = new Game(letters, words);
    });

    test('should initialize with correct letters and words', () => {
        expect(game.letters).toEqual(letters);
        expect(game.centerLetter).toBe('w');
        expect(game.otherLetters).toEqual(['a', 'e', 'g', 'n', 'r', 'z']);
        expect(game.words).toEqual(words);
        expect(game.guessedWords).toEqual([]);
    });

    test('should calculate correct max score', () => {
        // weer (4) -> 1
        // wegen (5) -> 5
        // wagen (5) -> 5
        // zwaar (5) -> 5
        // zweren (6) -> 6
        // Total: 1 + 5 + 5 + 5 + 6 = 22
        expect(game.maxScore).toBe(22);
    });

    test('should submit a correct word', () => {
        const result = game.submitWord('weer');
        expect(result.isCorrect).toBe(true);
        expect(game.guessedWords).toContain('weer');
        expect(game.getScore()).toBe(1);
    });

    test('should not submit an incorrect word (too short)', () => {
        const result = game.submitWord('wee');
        expect(result.isCorrect).toBe(false);
        expect(result.appearance).toBe('incorrect-word');
        expect(game.guessedWords).not.toContain('wee');
    });

    test('should not submit a word missing center letter', () => {
        const result = game.submitWord('gaan');
        expect(result.isCorrect).toBe(false);
        expect(result.appearance).toBe('incorrect-word');
    });

    test('should not submit a word not in list', () => {
        const result = game.submitWord('water');
        expect(result.isCorrect).toBe(false);
        expect(result.appearance).toBe('incorrect-word');
    });

    test('should not submit a word already found', () => {
        game.submitWord('weer');
        const result = game.submitWord('weer');
        expect(result.isCorrect).toBe(false);
        expect(result.appearance).toBe('already-guessed-word');
    });

    test('should detect a pangram', () => {
        // Create a game where one word is a pangram
        const pangramLetters = ['w', 'a', 'e', 'g', 'n', 'r', 'z'];
        const pangramWords = ['weer', 'waarzegger']; // 'waarzegger' contains all 7 letters: w, a, r, z, e, g, r (wait, waarzegger has w,a,r,z,e,g,n? no, n is missing in waarzegger)
        // Let's use a real pangram: 'zwanenzang' (z, w, a, n, e, g) - that's 6 letters.
        // DEFAULT_LETTERS = ["w", "a", "e", "g", "n", "r", "z"];
        // "waarzeggen" -> w, a, r, z, e, g, n (all 7!)
        
        const gameWithPangram = new Game(pangramLetters, ['waarzeggen']);
        expect(gameWithPangram.isPangram('waarzeggen')).toBe(true);
        const result = gameWithPangram.submitWord('waarzeggen');
        // score for 'waarzeggen' (10 letters) = 10 + 7 (pangram) = 17
        expect(gameWithPangram.getScore()).toBe(17);
    });

    test('should calculate correct level', () => {
        // levels[0] threshold 0 -> "Opwarmronde"
        expect(game.getCurrentLevel()).toBe("Opwarmronde");
        
        // Let's find a score that hits "Aardig begin" (0.02 * 22 = 0.44 -> 1)
        game.submitWord('weer'); // score 1
        expect(game.getCurrentLevel()).toBe("Aardig begin");
    });

    test('should create word stats', () => {
        const moreWords = ['waag', 'waan', 'waar', 'wang', 'weer', 'zwaar', 'zweer'];
        const gameWithMoreWords = new Game(letters, moreWords);
        moreWords.forEach(w => gameWithMoreWords.submitWord(w));

        const stats = gameWithMoreWords.createWordStats();
        // 7 words. Scores: 4:1, 4:1, 4:1, 4:1, 4:1, 5:5, 5:5 -> Total score: 1+1+1+1+1+5+5 = 15
        expect(stats).toContain('7/15');
        
        // W: waag(4), waan(4), waar(4), wang(4), weer(4) -> W4444.4
        expect(stats).toContain('W4444.4');
        
        // Z: zwaar(5), zweer(5) -> Z55
        expect(stats).toContain('Z55');
    });

    test('should return correct state from getState', () => {
        game.submitWord('weer');
        const state = game.getState();
        expect(state.letters).toEqual(letters);
        expect(state.words).toEqual(words);
        expect(state.guessedWords).toEqual(['weer']);
    });

    test('should create Game instance from state using fromState', () => {
        game.submitWord('weer');
        const state = game.getState();
        const restoredGame = Game.fromState(state);
        expect(restoredGame.letters).toEqual(letters);
        expect(restoredGame.words).toEqual(words);
        expect(restoredGame.guessedWords).toEqual(['weer']);
    });
});
