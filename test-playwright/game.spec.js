const { test, expect } = require('@playwright/test');

function encode(string) {
    // Re-implementing the encode function from helper.js for the test environment
    return Buffer.from(encodeURIComponent(string)).toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}

test.describe('Pangram Game', () => {
    const letters = 'waegrnz';
    const words = ['waag', 'waan', 'weer', 'wegen'];
    const encodedWords = encode(words.join(','));
    const gameUrl = `/?letters=${letters}&words=${encodedWords}`;

    test('should play a game with buttons, backspace and validation', async ({ page }) => {
        // 1. Navigate to the game URL
        await page.goto(gameUrl);

        // 2. Input a valid word using the buttons. Word: "waag"
        await page.click('button.letter-key:has-text("w")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("g")');
        
        // Hit the submit button.
        await page.click('#submit-btn');

        // Assert that the word is in the word list
        const guessedWordsList = page.locator('#guessed-words-list');
        await expect(guessedWordsList).toContainText('waag');

        // Assert that the points are displayed
        const score = page.locator('#score');
        await expect(score).toHaveText('1');

        // Assert that the number of correctly guessed words count is updated
        const guessedWordsCount = page.locator('#guessed-words-count');
        await expect(guessedWordsCount).toContainText('(1/4)');

        // 3. Input an invalid word using the buttons. Word: "gaag" (missing center letter 'w')
        await page.click('button.letter-key:has-text("g")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("g")');

        // Hit the submit button.
        await page.click('#submit-btn');

        // Assert that the word is NOT added to the word list
        // It should still only contain "waag"
        await expect(guessedWordsList).not.toContainText('gaag');
        
        // Assert that the number of points is still the same
        await expect(score).toHaveText('1');

        // Assert that the number of correctly guessed words is still the same
        await expect(guessedWordsCount).toContainText('(1/4)');

        // 4. Input a word with a typo. Use the backspace button to correct it.
        // Word: "waaa" -> backspace -> "n" -> "waan"
        await page.click('button.letter-key:has-text("w")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("a")');
        await page.click('button.letter-key:has-text("a")');
        
        // Use the backspace button to correct it
        await page.click('#backspace-btn');
        
        // Type the correct letter
        await page.click('button.letter-key:has-text("n")');

        // Submit the word
        await page.click('#submit-btn');

        // Asserts the word is added to the word list
        await expect(guessedWordsList).toContainText('waan');

        // Assert the correct number of points is added
        // "waag" (1) + "waan" (1) = 2
        await expect(score).toHaveText('2');

        // Assert the correctly guessed word count is updated
        await expect(guessedWordsCount).toContainText('(2/4)');
    });

    test('should play a game using keyboard input', async ({ page }) => {
        // 1. Navigate to the game URL
        await page.goto(gameUrl);

        const wordInput = page.locator('#word-input');
        const guessedWordsList = page.locator('#guessed-words-list');
        const score = page.locator('#score');
        const guessedWordsCount = page.locator('#guessed-words-count');

        // 2. Input a valid word using the keyboard.
        // Word: "waag"
        await wordInput.fill('waag');
        await page.keyboard.press('Enter');

        // Assertions
        await expect(guessedWordsList).toContainText('waag');
        await expect(score).toHaveText('1');
        await expect(guessedWordsCount).toContainText('(1/4)');

        // 3. Input an invalid word using the keyboard.
        // Word: "gaag" (missing center letter 'w')
        await wordInput.fill('gaag');
        await page.keyboard.press('Enter');

        // Assertions
        await expect(guessedWordsList).not.toContainText('gaag');
        await expect(score).toHaveText('1');
        await expect(guessedWordsCount).toContainText('(1/4)');

        // 4. Input a word with a typo and correct it.
        // Word: "waaa" -> backspace -> "n" -> "waan"
        await wordInput.fill('waaa');
        await page.keyboard.press('Backspace');
        await page.keyboard.type('n');
        await page.keyboard.press('Enter');

        // Assertions
        await expect(guessedWordsList).toContainText('waan');
        await expect(score).toHaveText('2');
        await expect(guessedWordsCount).toContainText('(2/4)');
    });

    test('should have all 7 letter buttons present', async ({ page }) => {
        // 1. Navigate to the game URL
        await page.goto(gameUrl);

        // 2. Assert there are exactly 7 letter buttons
        const buttons = page.locator('.letter-key');
        await expect(buttons).toHaveCount(7);

        // 3. Assert all letters from the URL are present in the buttons
        const buttonTexts = (await buttons.allInnerTexts()).map(t => t.toLowerCase());
        for (const char of letters.split('')) {
            expect(buttonTexts).toContain(char);
        }

        // 4. Assert the center key displays the first letter
        const centerKeyText = (await page.locator('#center-key').innerText()).toLowerCase();
        expect(centerKeyText).toBe(letters[0]);
    });
});
