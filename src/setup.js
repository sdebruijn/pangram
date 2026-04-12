import { encode, isValidLetters } from './helper.js';

const setupForm = document.getElementById('setup-form');
const lettersInput = document.getElementById('letters-input');
const wordsInput = document.getElementById('words-input');
const dailyPuzzleBtn = document.getElementById('daily-puzzle-btn');
const useOutputBoxCheckbox = document.getElementById('use-output-box');

const useOutputBox = localStorage.getItem('use-output-box') === 'true';
useOutputBoxCheckbox.checked = useOutputBox;
useOutputBoxCheckbox.onchange = (event) => {
    localStorage.setItem('use-output-box', event.target.checked);
}

dailyPuzzleBtn.addEventListener('click', async () => {
    const puzzle = await getPuzzle();
    if (puzzle) {
        const { letters, words, date, timeOfNextPuzzle } = puzzle;
        const encodedWords = encode(words);

        const url = new URL('index.html', window.location.href);
        url.searchParams.set('letters', letters);
        url.searchParams.set('words', encodedWords);
        url.searchParams.set('date', date);
        if (timeOfNextPuzzle) {
            url.searchParams.set('timeOfNextPuzzle', timeOfNextPuzzle);
        }
        window.location.href = url.href;
    }
});

setupForm.addEventListener('submit', (event) => {
    // ... rest of the code ...
});

setupForm.addEventListener('formdata', (event) => {
    // ... rest of the code ...
});


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
        console.log(letters, words);
        const wordList = words.join(',');

        return { letters, words: wordList, date, timeOfNextPuzzle } ;
    } catch (error) {
        console.error(error.message);
    }
}
