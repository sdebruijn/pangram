import { encode, isValidLetters } from './helper.js';
import { loadTodayPuzzle } from './puzzle-loader.js';

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
    await loadTodayPuzzle();
});

setupForm.addEventListener('submit', (event) => {
    const letters = lettersInput.value.toLowerCase();
    const words = wordsInput.value;

    if (!isValidLetters(letters)) {
        alert('Please enter 7 unique alphabetic characters.');
        event.preventDefault(); // Prevent submission if validation fails
        return;
    }

    if (words.trim() === '') {
        alert('Please enter a list of words.');
        event.preventDefault(); // Prevent submission if validation fails
        return;
    }
    // If validation passes, do NOT call event.preventDefault();
    // Allow the form to submit naturally, which will trigger the 'formdata' event.
});

setupForm.addEventListener('formdata', (event) => {
    const formData = event.formData;
    const words = formData.get('words')
        .replaceAll(/\s+/g,',')
        .replaceAll(/,,+/g, ',');
    const encodedWords = encode(words);
    formData.set('words', encodedWords);
    // The 'letters' field doesn't need to be modified here because its value
    // is already correctly formatted (lowercase) and validated in the 'submit' event.
});
