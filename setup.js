document.addEventListener('DOMContentLoaded', () => {
    const setupForm = document.getElementById('setup-form');
    const lettersInput = document.getElementById('letters-input');
    const wordsInput = document.getElementById('words-input');

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
        const words = formData.get('words');
        const encodedWords = encode(words);
        formData.set('words', encodedWords);
        // The 'letters' field doesn't need to be modified here because its value
        // is already correctly formatted (lowercase) and validated in the 'submit' event.
    });

    function isValidLetters(letters) {
        if (letters === null) {
            return false;
        }
        if (/[^a-z]/.test(letters)) {
            console.log('letters contains non-alpha characters');
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
        return new Set(string).size === string.length;
    }
});
