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
    const words = formData.get('words').replaceAll(' ','');
    const encodedWords = encode(words);
    formData.set('words', encodedWords);
    // The 'letters' field doesn't need to be modified here because its value
    // is already correctly formatted (lowercase) and validated in the 'submit' event.
});


async function getPuzzle() {
    const url ="https://api.42puzzles.com/player/dpg/ox1MyqZaR2yMnteGqHdf?userId=6fee8bb0-3163-40f6-ab97-d2fafaf77611&sessionId=1c686796-1a11-42e5-bac0-6df17c66e5fc&playerId=dpg-ox1MyqZaR2yMnteGqHdf";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();

        const letters = result.puzzle.originId.toLowerCase();

        const words = result.puzzle.words.map((obj) => obj.p);
        console.log(letters, words);
        const wordList = words.join(',');

        return { letters, words: wordList} ;
    } catch (error) {
        console.error(error.message);
    }
}
