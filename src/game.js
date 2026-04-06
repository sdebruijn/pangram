import { shuffle } from './helper.js';

export class Game {
    constructor(letters, words, guessedWords = []) {
        this.letters = letters;
        this.centerLetter = letters[0];
        this.otherLetters = letters.slice(1);
        this.words = words;
        this.guessedWords = guessedWords;

        this.levels = [
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

        this.messages = {
            tooShort: {
                message: (word) => `${word} - too short.`,
                appearance: 'incorrect-word',
            },
            missingCenterLetter: {
                message: (word) => `${word} - must contain ${this.centerLetter}.`,
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

        this.maxScore = this.calculateScore(this.words);
        this._calculateLevels();
    }

    shuffleLetters() {
        shuffle(this.otherLetters);
    }

    submitWord(wordInput) {
        const word = wordInput.toLowerCase().replaceAll('ij', 'ĳ');
        const message = this._getMessage(word);

        if (message === this.messages.correct) {
            this.guessedWords.push(word);
        }

        return {
            word,
            message: message.message(word),
            appearance: message.appearance,
            isCorrect: message === this.messages.correct,
        };
    }

    _getMessage(word) {
        if (word.length < 4) {
            return this.messages.tooShort;
        }
        if (!word.includes(this.centerLetter)) {
            return this.messages.missingCenterLetter;
        }
        if (!this.words.includes(word)) {
            return this.messages.notInList;
        }
        if (this.guessedWords.includes(word)) {
            return this.messages.alreadyFound;
        }
        return this.messages.correct;
    }

    calculateScore(words) {
        let score = 0;
        for (const word of words) {
            score += this.calculateWordScore(word);
        }
        return score;
    }

    calculateWordScore(word) {
        let points;
        if (word.length === 4) {
            points = 1;
        } else {
            points = word.length;
        }

        if (this.isPangram(word)) {
            points += 7;
        }

        return points;
    }

    isPangram(word) {
        return (new Set(word)).size === this.letters.length;
    }

    sortedGuessedWords() {
        let sortedWords = this.guessedWords.map(word => word.replaceAll('ĳ', 'ij')).sort();
        return sortedWords.map(word => word.replaceAll('ij', 'ĳ'));
    }

    createWordStats() {
        const score = this.calculateScore(this.guessedWords);
        const wordCount = this.guessedWords.length;
        let stats = `${wordCount}/${score}\n`;
        const sortedWords = this.sortedGuessedWords();
        const byStartLetter = Object.groupBy(sortedWords, (word) => word[0]);
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

    _calculateLevels() {
        for (const level of this.levels) {
            level.requiredScore = Math.ceil(level.threshold * this.maxScore);
        }
    }

    getCurrentLevel() {
        const currentScore = this.calculateScore(this.guessedWords);
        return this.levels.findLast(level => currentScore >= level.requiredScore).name;
    }

    getScore() {
        return this.calculateScore(this.guessedWords);
    }
}
