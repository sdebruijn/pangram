import { Game } from './game.js';
import { isValidLetters, decode } from './helper.js';

const DEFAULT_LETTERS = ["w", "a", "e", "g", "n", "r", "z"];
const DEFAULT_WORDS = [
    "aangewezen", "aanwennen", "argwaan", "geween", "geweer", "gewennen", "gewezen",
    "nawee", "nawegen", "regenweer", "renwagen", "waag", "waan", "waar", "waaraan",
    "waarna", "waarnaar", "waarzeggen", "waarzegger", "wagen", "wanen", "wang",
    "wanneer", "waren", "weer", "wegen", "weger", "weggaan", "wegrennen",
    "wegrenner", "wegwezen", "wegzagen", "wenen", "wennen", "weren", "wezen",
    "wrang", "zeeweg", "zeewezen", "zwaan", "zwaar", "zwager", "zwanenzang",
    "zwanger", "zwangere", "zwanzen", "zweer", "zweren"
];

const url = new URL(window.location.href);

const lettersParam = url.searchParams.get('letters');
const letters = isValidLetters(lettersParam) ? lettersParam.split('') : DEFAULT_LETTERS;

const wordsParam = url.searchParams.get('words');
const words = wordsParam !== null ? decode(wordsParam).split(',') : DEFAULT_WORDS;

const localStorageKey = `game-${letters.join('')}`;
const storedWords = localStorage.getItem(localStorageKey);
let guessedWords = storedWords ? storedWords.split(',') : [];

const game = new Game(letters, words, guessedWords);

const wordInput = document.getElementById('word-input');
const letterKeys = document.querySelectorAll('.letter-key');
const normalLetterKeys = document.querySelectorAll(".letter-key:not(.center-key)");
const centerLetterKey = document.getElementById("center-key");
const backspaceBtn = document.getElementById('backspace-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreSpan = document.getElementById('score');
const maxScoreSpan = document.getElementById('max-score');
const levelSpan = document.getElementById('level');
const guessedWordsCount = document.getElementById('guessed-words-count');
const recentlyGuessedWordsCount = document.getElementById('recently-guessed-words-list');
const guessedWordsList = document.getElementById('guessed-words-list');
const copyStatsBtn = document.getElementById('copy-stats-btn');
const statsOutput = document.getElementById('stats-output');

const useOutputBox = localStorage.getItem('use-output-box') === 'true';
if (useOutputBox) {
    // For users without support of the Clipboard API.
    copyStatsBtn.style.display = 'none';
    statsOutput.style.display = 'block';
}

centerLetterKey.innerText = game.centerLetter;
updateLetters();
maxScoreSpan.textContent = game.maxScore;
updateGameStateDisplay();

function updateLetters() {
    normalLetterKeys.forEach((key,idx) => key.innerText = game.otherLetters[idx]);
}

copyStatsBtn.addEventListener('click', () => {
    const wordStats = game.createWordStats();
    navigator.clipboard.writeText(wordStats)
        .then(() => {
            console.log('Stats copied to clipboard.');
            console.log(wordStats);
        })
        .catch(err => {
            console.error('Failed to copy stats: ', err);
        });
});

letterKeys.forEach(key => {
    key.addEventListener('click', () => {
        interruptWordResultAnimation();
        wordInput.value += key.textContent;
    });
});

backspaceBtn.addEventListener('click', () => wordInput.value = wordInput.value.slice(0, -1));
shuffleBtn.addEventListener('click', () => {
    game.shuffleLetters();
    updateLetters();
});
submitBtn.addEventListener('click', () => submitWord());

wordInput.addEventListener('keydown', (e) => {
    interruptWordResultAnimation();
    if (e.key === 'Enter') {
        submitWord();
    }
});

let wordResultAnimationTimeout = null;
let isSubmitted = false;

function interruptWordResultAnimation() {
    if (isSubmitted) {
        clearTimeout(wordResultAnimationTimeout);
        resetInput();
    }
}

function resetInput() {
    wordInput.value = '';
    wordInput.classList.remove('correct-word', 'incorrect-word', 'already-guessed-word');
    wordResultAnimationTimeout = null;
    isSubmitted = false;
}

function submitWord() {
    if (!wordInput.value) return;
    const result = game.submitWord(wordInput.value);

    wordResultAnimationTimeout = setTimeout(() => {
        resetInput();
    }, 1000);

    console.log(result.message);
    wordInput.classList.add(result.appearance);
    isSubmitted = true;
    if (result.isCorrect) {
        updateGameStateDisplay();
    }
}

function updateGameStateDisplay() {
    updateGuessedWordsDisplay();
    updateScoreDisplay();
    saveGuessedWords();

    if (useOutputBox) {
        statsOutput.textContent = game.createWordStats();
    }
}

function saveGuessedWords() {
    localStorage.setItem(localStorageKey, game.guessedWords.join(','));
}

function updateGuessedWordsDisplay() {
    const recentWords = game.guessedWords.slice(-5).reverse() ?? [];
    guessedWordsCount.textContent = `(${game.guessedWords.length}/${game.words.length})`;
    recentlyGuessedWordsCount.textContent = recentWords.join(', ');

    guessedWordsList.innerHTML = '';
    game.sortedGuessedWords().forEach(word => {
        const li = document.createElement('li');
        if (game.isPangram(word)) li.classList.add('pangram')
        li.textContent = word;
        guessedWordsList.appendChild(li);
    });
}

function updateScoreDisplay() {
    scoreSpan.textContent = game.getScore();
    levelSpan.textContent = game.getCurrentLevel();
}
