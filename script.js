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
console.log(`Center letter: ${centerLetter}`);
console.log(`Other letters: ${otherLetters}`);

const wordsParam = url.searchParams.get('words');
const words = wordsParam !== null ? decode(wordsParam).split(',') : DEFAULT_WORDS;
console.log('Words', words);
    

let guessedWords = [];

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
    console.log(`Submitting word: ${word}`);
    wordInput.value = '';

    if (word.length < 4) {
        console.log('Word too short.');
        return;
    }
    if (!word.includes(centerLetter)) {
        console.log('Word does not contain center letter.');
        return;
    }
    if (!words.includes(word)) {
        console.log('Word not in list.');
        return;
    }
    if (guessedWords.includes(word)) {
        console.log('Word already guessed.');
        return;
    }

    console.log('Word is valid.');
    guessedWords.push(word);
    updateGameState();
}

function updateGameState() {
    updateGuessedWords();
    updateScore();
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
    console.log(`Score updated: ${score} points.`);
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

function isValidLetters(letters) {
    if (letters === null) {
        return false;
    }
    let filteredString = letters.replace(/[^a-z]/g, '');
    if (filteredString.length !== letters.length) {
        console.log('letters contains non a-z characters');
        return false;
    }
    if (letters.length !== 7) {
        console.log('letters does not contain exactly 7 characters');
        return false;
    }
    if (!hasUniqueChars(letters)) {
        console.log('letters does not contain 7 unique characters');
        return false;
    }
    return true;
}

function hasUniqueChars(string) {
    const uniqueCharacters = [...new Set(string)];
    return uniqueCharacters.length === string.length;
}

function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}


