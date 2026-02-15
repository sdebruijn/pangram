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
const levels = [
    { name: "Opwarmronde", threshold: 0},
    { name: "Aardig begin", threshold: 0.02},
    { name: "Goed bezig", threshold: 0.05},
    { name: "Ga zo door", threshold: 0.08},
    { name: "Topper", threshold: 0.15},
    { name: "Indrukwekkend", threshold: 0.25},
    { name: "Meesterlijk", threshold: 0.4},
    { name: "Briljant", threshold: 0.5},
    { name: "Genie", threshold: 0.7},
    { name: "Maximaal", threshold: 1}
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
const maxScoreSpan = document.getElementById('max-score');
const levelSpan = document.getElementById('level');
const guessedWordsCount = document.getElementById('guessed-words-count');
const recentlyGuessedWordsCount = document.getElementById('recently-guessed-words-list');
const guessedWordsList = document.getElementById('guessed-words-list');
const copyStatsBtn = document.getElementById('copy-stats-btn');

centerLetterKey.innerText = centerLetter;
shuffleLetters();
const maxScore = calculateScore(words);
maxScoreSpan.textContent = maxScore;
calculateLevels(maxScore);
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
        interruptWordResultAnimation();
        wordInput.value += key.textContent;
    });
});

backspaceBtn.addEventListener('click', () => wordInput.value = wordInput.value.slice(0, -1));
shuffleBtn.addEventListener('click', () => shuffleLetters());
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
    const word = wordInput.value.toLowerCase();
    const message = getMessage(word);

    wordResultAnimationTimeout = setTimeout(() => {
        resetInput();
    }, 1000);

    console.log(message.message(word));
    wordInput.classList.add(message.appearance);
    isSubmitted = true;
    if (message === messages.correct) {
        guessedWords.push(word);
        updateGameState();
    }
}

const messages = {
    tooShort: {
        message: (word) => `${word} - too short.`,
        appearance: 'incorrect-word',
    },
    missingCenterLetter: {
        message: (word) => `${word} - must contain ${centerLetter}.`,
        appearance: 'incorrect-word',
    },
    notInList: {
        message: (word) => `${word} - not in list.`,
        appearance: 'incorrect-word',
    },
    alreadyFound: {
        message: (word) => `${word} - already found.`,
        appearance: 'already-guessed-word',
    },
    correct: {
        message: (word) => `${word} - correct.`,
        appearance: 'correct-word',
    },
};

function getMessage(word) {
    if (word.length < 4) {
        return messages.tooShort;
    }
    if (!word.includes(centerLetter)) {
        return messages.missingCenterLetter;
    }
    if (!words.includes(word)) {
        return messages.notInList;
    }
    if (guessedWords.includes(word)) {
        return messages.alreadyFound;
    }
    return messages.correct;
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
    scoreSpan.textContent = calculateScore(guessedWords);
    levelSpan.textContent = levels.findLast(level => calculateScore(guessedWords) >= level.requiredScore).name;
}

function calculateScore(words) {
    let score = 0;
    for (const word of words) {
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
    const score = calculateScore(guessedWords);
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

function calculateLevels(maxScore) {
    for (const level of levels) {
        level.requiredScore = Math.ceil(level.threshold * maxScore);
    }
}
