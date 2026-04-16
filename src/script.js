import { Game } from './game.js';
import { isValidLetters, decode, dateToday } from './helper.js';
import { Storage } from './storage.js';
import { loadTodayPuzzle, loadPuzzle } from './puzzle-loader.js';

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

const date = url.searchParams.get('date');
const timeOfNextPuzzle = url.searchParams.get('timeOfNextPuzzle') ? parseInt(url.searchParams.get('timeOfNextPuzzle')) : null;

let puzzleId = (date && lettersParam) ? `puzzle_${date}_${lettersParam.toLowerCase()}` : null;
const savedState = puzzleId ? Storage.getGameState(puzzleId) : null;

let game;
if (savedState) {
    game = Game.fromState(savedState);
    if (!game.timeOfNextPuzzle && timeOfNextPuzzle) {
        game.timeOfNextPuzzle = timeOfNextPuzzle;
    }
} else {
    game = new Game(letters, words, [], timeOfNextPuzzle);
}

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
const revealContainer = document.getElementById('reveal-container');
const showSolutionBtn = document.getElementById('show-solution-btn');
const hideSolutionBtn = document.getElementById('hide-solution-btn');
const unguessedWordsList = document.getElementById('unguessed-words-list');
const copyStatsBtn = document.getElementById('copy-stats-btn');
const statsOutput = document.getElementById('stats-output');
const todayPuzzleMenuItem = document.getElementById('today-puzzle-menu-item');
const mainMenu = document.getElementById('main-menu');

todayPuzzleMenuItem.addEventListener('click', async () => {
    const reloaded = await loadTodayPuzzle(puzzleId);
    if (!reloaded) {
        mainMenu.hidePopover();
    }
});

populateMenu();

function populateMenu() {
    const today = dateToday();
    const puzzles = Storage.getPuzzlesList()
        .filter(id => !id.startsWith(`puzzle_${today}_`))
        .sort()
        .reverse();

    puzzles.forEach(id => {
        // Expected format: puzzle_YYYY-MM-DD_letters or puzzle_custom_letters
        const parts = id.split('_');
        let dateStr = 'Custom';
        let lettersStr = '';

        if (parts.length >= 3) {
            dateStr = parts[1] === 'custom' ? 'Custom' : parts[1];
            lettersStr = parts[2].toUpperCase();
        } else if (parts.length === 2) {
            lettersStr = parts[1].toUpperCase();
        }

        const li = document.createElement('li');
        li.role = 'menuitem';
        
        if (lettersStr) {
            const centerLetter = lettersStr[0];
            const otherLetters = lettersStr.slice(1);
            li.innerHTML = `${dateStr} (<span class="menu-center-letter">${centerLetter}</span>${otherLetters})`;
        } else {
            li.textContent = dateStr;
        }

        li.addEventListener('click', () => {
            if (id === puzzleId) {
                mainMenu.hidePopover();
            } else {
                loadPuzzle(id);
            }
        });
        mainMenu.appendChild(li);
    });
}

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
updateRevealDisplay();

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
    saveGameState(); // Save shuffle state
});
submitBtn.addEventListener('click', () => submitWord());

showSolutionBtn.addEventListener('click', () => {
    unguessedWordsList.style.display = 'block';
    showSolutionBtn.style.display = 'none';
    showSolutionBtn.disabled = true;
    hideSolutionBtn.style.display = 'block';
    hideSolutionBtn.disabled = false;
    updateUnguessedWordsDisplay();
});

hideSolutionBtn.addEventListener('click', () => {
    unguessedWordsList.style.display = 'none';
    showSolutionBtn.style.display = 'block';
    showSolutionBtn.disabled = false;
    hideSolutionBtn.style.display = 'none';
    hideSolutionBtn.disabled = true;
});

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
    updateRevealDisplay();
}

function updateGameStateDisplay() {
    updateGuessedWordsDisplay();
    updateScoreDisplay();
    saveGameState();

    if (useOutputBox) {
        statsOutput.textContent = game.createWordStats();
    }
}

function updateRevealDisplay() {
    if (game.timeOfNextPuzzle && Date.now() > game.timeOfNextPuzzle) {
        revealContainer.style.display = 'block';
    } else {
        revealContainer.style.display = 'none';
    }
}

function updateUnguessedWordsDisplay() {
    unguessedWordsList.innerHTML = '';
    const unguessedWords = game.words.filter(word => !game.guessedWords.includes(word));
    unguessedWords.map(word => word.replaceAll('ĳ', 'ij')).sort().map(word => word.replaceAll('ij', 'ĳ')).forEach(word => {
        const li = document.createElement('li');
        if (game.isPangram(word)) li.classList.add('pangram')
        li.textContent = word;
        unguessedWordsList.appendChild(li);
    });
}

function saveGameState() {
    if (puzzleId) {
        Storage.saveGameState(puzzleId, game.getState(), timeOfNextPuzzle);
    }
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
