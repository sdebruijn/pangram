import { encode, dateToday } from './helper.js';
import { Storage } from './storage.js';

export async function loadTodayPuzzle(currentPuzzleId) {
    const today = dateToday();

    if (currentPuzzleId && currentPuzzleId.startsWith(`puzzle_${today}_`)) {
        return false;
    }

    const puzzles = Storage.getPuzzlesList();
    const todayPuzzleId = puzzles.find(id => id.startsWith(`puzzle_${today}_`));

    if (todayPuzzleId) {
        const savedState = Storage.getGameState(todayPuzzleId);
        if (savedState) {
            console.log("Loaded today's puzzle from local storage...");
            redirectToGame(savedState.letters.join(''), encode(savedState.words.join(',')), today, savedState.timeOfNextPuzzle);
            return true;
        }
    }

    console.log("Loading today's puzzle from the API");
    const puzzle = await getPuzzle();
    if (puzzle) {
        redirectToGame(puzzle.letters, encode(puzzle.words), puzzle.date, puzzle.timeOfNextPuzzle);
        return true;
    }
    return false;
}

export function loadPuzzle(puzzleId) {
    const savedState = Storage.getGameState(puzzleId);
    if (savedState) {
        const dateMatch = puzzleId.match(/^puzzle_([^_]+)_/);
        const date = dateMatch ? dateMatch[1] : 'custom';
        redirectToGame(savedState.letters.join(''), encode(savedState.words.join(',')), date, savedState.timeOfNextPuzzle);
        return true;
    }
    return false;
}

function redirectToGame(letters, encodedWords, date, timeOfNextPuzzle) {
    const url = new URL('index.html', window.location.origin + window.location.pathname);
    url.searchParams.set('letters', letters);
    url.searchParams.set('words', encodedWords);
    url.searchParams.set('date', date);
    if (timeOfNextPuzzle) {
        url.searchParams.set('timeOfNextPuzzle', timeOfNextPuzzle);
    }
    window.location.href = url.href;
}

async function getPuzzle() {
    const url ="https://api.42puzzles.com/player/dpg/ox1MyqZaR2yMnteGqHdf?userId=6fee8bb0-3163-40f6-ab97-d2fafaf77611&sessionId=1c686796-1a11-42e5-bac0-6df17c66e5fc&playerId=dpg-ox1MyqZaR2yMnteGqHdf";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();

        const letters = result.puzzle.originId.toLowerCase();
        const date = result.date;
        const timeOfNextPuzzle = result.timeOfNextPuzzle;

        const words = result.puzzle.words.map((obj) => obj.p);
        const wordList = words.join(',');

        return { letters, words: wordList, date, timeOfNextPuzzle } ;
    } catch (error) {
        console.error(error.message);
    }
}
