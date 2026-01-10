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
const centerLetter = letters[0];
let otherLetters = letters.slice(1);

const wordsParam = url.searchParams.get('words');
const words = wordsParam !== null ? decode(wordsParam).split(',') : DEFAULT_WORDS;

const localStorageKey = `game-${letters.join('')}`;
const storedWords = localStorage.getItem(localStorageKey);
let guessedWords = storedWords ? storedWords.split(',') : [];

const wordInput = document.getElementById('word-input');
const letterKeys = document.querySelectorAll('.letter-key');
const normalLetterKeys = document.querySelectorAll(".letter-key:not(.center-key)");
const centerLetterKey = document.getElementById("center-key");
const backspaceBtn = document.getElementById('backspace-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreSpan = document.getElementById('score');
const guessedWordsSummary = document.querySelector('#guessed-words-container summary');
const guessedWordsList = document.getElementById('guessed-words-list');
const copyStatsBtn = document.getElementById('copy-stats-btn');

centerLetterKey.innerText = centerLetter;
shuffleLetters();
updateGameState();

function shuffleLetters() {
    shuffle(otherLetters);
    normalLetterKeys.forEach((key,idx) => key.innerText = otherLetters[idx]);
}

copyStatsBtn.addEventListener('click', () => {
    const wordStats = createWordStats(guessedWords);
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
        wordInput.value += key.textContent;
    });
});

backspaceBtn.addEventListener('click', () => wordInput.value = wordInput.value.slice(0, -1));
shuffleBtn.addEventListener('click', () => shuffleLetters());
submitBtn.addEventListener('click', () => submitWord());

wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        submitWord();
    }
});

function submitWord() {
    const word = wordInput.value.toLowerCase();
    wordInput.value = '';

    if (word.length < 4) {
        console.log(`${word} - too short.`);
        return;
    }
    if (!word.includes(centerLetter)) {
        console.log(`${word} - must contain ${centerLetter}.`);
        return;
    }
    if (!words.includes(word)) {
        console.log(`${word} - not in list.`);
        return;
    }
    if (guessedWords.includes(word)) {
        console.log(`${word} - already found.`);
        return;
    }

    console.log(`${word} - correct.`);
    guessedWords.push(word);
    updateGameState();
}

function updateGameState() {
    updateGuessedWords();
    updateScore();
    saveGuessedWords();
}

function saveGuessedWords() {
    localStorage.setItem(localStorageKey, guessedWords.join(','));
}

function updateGuessedWords() {
    // Update summary
    const recentWords = guessedWords.slice(-5).reverse();
    guessedWordsSummary.textContent = `Woorden (${guessedWords.length}/${words.length})    ${recentWords.join(', ')}`;

    // Update details list
    guessedWordsList.innerHTML = '';
    const sortedWords = [...guessedWords].sort();
    sortedWords.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        guessedWordsList.appendChild(li);
    });
}

function updateScore() {
    const score = calculateScore();
    scoreSpan.textContent = score;
}

function calculateScore() {
    let score = 0;
    for (const word of guessedWords) {
        score += calculateWordScore(word);
    }
    return score;
}

function calculateWordScore(word) {
    let points = 0;
    if (word.length === 4) {
        points = 1;
    } else {
        points = word.length;
    }

    const isPangram = new Set(word).size === letters.length;
    if (isPangram) {
        points += 7;
    }

    return points;
}

function createWordStats(guessedWords) {
    let stats = '';
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(97 + i);
        const wordsStartingWithLetter = guessedWords.filter(word => word.startsWith(letter));
        if (wordsStartingWithLetter.length > 0) {
            stats += letter.toUpperCase();
            wordsStartingWithLetter.forEach((word, index) => {
                if (index !== 0 && (index) % 4 === 0) {
                    stats += '.';
                }
                if (word.length === 10) {
                    stats += 'X';
                } else if (word.length > 10) {
                    stats += ` ${word.length} `;
                } else {
                    stats += word.length;
                }
            });
            stats += '\n';
        }
    }
    return stats;
}

