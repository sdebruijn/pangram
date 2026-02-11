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
const guessedWordsCount = document.getElementById('guessed-words-count');
const recentlyGuessedWordsCount = document.getElementById('recently-guessed-words-list');
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
    const errorMessage = getErrorMessage(word);

    setTimeout(() => {
        wordInput.value = ''; 
        wordInput.classList.remove('correct-word');
        wordInput.classList.remove('incorrect-word');
    }, 1000);

    if (errorMessage != null) {
        console.log(errorMessage);
        wordInput.classList.add('incorrect-word');
        return;
    }

    console.log(`${word} - correct.`);
    wordInput.classList.add('correct-word');
    guessedWords.push(word);
    updateGameState();
}

function getErrorMessage(word) {
    if (word.length < 4) {
        return `${word} - too short.`;
    }
    if (!word.includes(centerLetter)) {
        return `${word} - must contain ${centerLetter}.`;
    }
    if (!words.includes(word)) {
        return `${word} - not in list.`;
    }
    if (guessedWords.includes(word)) {
        return `${word} - already found.`;
    }
    return null;
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
    const recentWords = guessedWords.slice(-5).reverse() ?? [];
    guessedWordsCount.textContent = `(${guessedWords.length}/${words.length})`;
    recentlyGuessedWordsCount.textContent = recentWords.join(', ');

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
    const score = calculateScore();
    const wordCount = guessedWords.length;
    let stats = `${wordCount}/${score}\n`;
    const byStartLetter = Object.groupBy(guessedWords.sort(), (word) => word[0]);
    for (const [startLetter, words] of Object.entries(byStartLetter)) {
        stats += '\n';
        stats += startLetter.toUpperCase();
        words.forEach((word, index) => {
            if (index !== 0 && (index) % 4 === 0) {
                stats += '.';
            }
            if (word.length === 10) {
                stats += 'X';
            } else if (word.length > 10) {
                stats += `${word.length}`;
            } else {
                stats += word.length;
            }
        });
    }
    return stats;
}

