const letters = ["a", "e", "g", "n", "r", "w", "z"];
const centerLetter = "r";
const words = [
    "aangewezen", "aanwennen", "argwaan", "geween", "geweer", "gewennen", "gewezen",
    "nawee", "nawegen", "regenweer", "renwagen", "waag", "waan", "waar", "waaraan",
    "waarna", "waarnaar", "waarzeggen", "waarzegger", "wagen", "wanen", "wang",
    "wanneer", "waren", "weer", "wegen", "weger", "weggaan", "wegrennen",
    "wegrenner", "wegwezen", "wegzagen", "wenen", "wennen", "weren", "wezen",
    "wrang", "zeeweg", "zeewezen", "zwaan", "zwaar", "zwager", "zwanenzang",
    "zwanger", "zwangere", "zwanzen", "zweer", "zweren"
];

let guessedWords = [];
let score = 0;

const wordInput = document.getElementById('word-input');
const letterKeys = document.querySelectorAll('.letter-key');
const backspaceBtn = document.getElementById('backspace-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const submitBtn = document.getElementById('submit-btn');
const guessedWordsContainer = document.getElementById('guessed-words');
const scoreSpan = document.getElementById('score');
const guessedWordsCount = document.querySelector('#guessed-words-container p');

letterKeys.forEach(key => {
    key.addEventListener('click', () => {
        wordInput.value += key.textContent;
    });
});

backspaceBtn.addEventListener('click', () => {
    wordInput.value = wordInput.value.slice(0, -1);
});

submitBtn.addEventListener('click', () => {
    submitWord();
});

wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        submitWord();
    }
});

function submitWord() {
    const word = wordInput.value.toLowerCase();
    wordInput.value = '';

    if (word.length < 4) {
        // alert("Word must be at least 4 letters long.");
        return;
    }
    if (!word.includes(centerLetter)) {
        // alert(`Word must contain the center letter "${centerLetter.toUpperCase()}".`);
        return;
    }
    if (!words.includes(word)) {
        // alert("Word not in list.");
        return;
    }
    if (guessedWords.includes(word)) {
        // alert("Word already guessed.");
        return;
    }

    guessedWords.push(word);
    updateGuessedWords();
    score += calculateScore(word);
    scoreSpan.textContent = score;
}

function updateGuessedWords() {
    guessedWordsContainer.innerHTML = '';
    guessedWords.forEach(word => {
        const wordElement = document.createElement('span');
        wordElement.textContent = word;
        guessedWordsContainer.appendChild(wordElement);
    });
    guessedWordsCount.textContent = `Woorden (${guessedWords.length})`;
}

function calculateScore(word) {
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
