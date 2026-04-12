const { test, expect } = require('@playwright/test');

function encode(string) {
    return Buffer.from(encodeURIComponent(string)).toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}

test.describe('Reveal Words Functionality', () => {
    const letters = 'waegrnz';
    const words = ['waag', 'waan', 'weer', 'wegen'];
    const encodedWords = encode(words.join(','));
    const date = '2026-04-12';

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => {
            if (msg.type() === 'log') console.log(`BROWSER LOG: ${msg.text()}`);
        });
    });

    test('should NOT show reveal button when timeOfNextPuzzle is in the future', async ({ page }) => {
        const futureTime = Date.now() + 3600000; // 1 hour
        const gameUrl = `/?letters=${letters}&words=${encodedWords}&date=${date}&timeOfNextPuzzle=${futureTime}`;
        
        await page.goto(gameUrl);
        const revealContainer = page.locator('#reveal-container');
        await expect(revealContainer).toBeHidden();
    });

    test('should show reveal button when timeOfNextPuzzle is in the past', async ({ page }) => {
        const pastTime = Date.now() - 3600000; // 1 hour
        const gameUrl = `/?letters=${letters}&words=${encodedWords}&date=${date}&timeOfNextPuzzle=${pastTime}`;
        
        await page.goto(gameUrl);

        // Open details to see the container
        await page.click('#guessed-words-container summary');

        const revealContainer = page.locator('#reveal-container');
        await expect(revealContainer).toBeVisible();
        
        const showSolutionBtn = page.locator('#show-solution-btn');
        await expect(showSolutionBtn).toHaveText('Oplossing');
        await expect(showSolutionBtn).toBeEnabled();

        const hideSolutionBtn = page.locator('#hide-solution-btn');
        await expect(hideSolutionBtn).toBeHidden();
        await expect(hideSolutionBtn).toBeDisabled();
    });

    test('should reveal unguessed words when button is clicked', async ({ page }) => {
        const pastTime = Date.now() - 3600000;
        const gameUrl = `/?letters=${letters}&words=${encodedWords}&date=${date}&timeOfNextPuzzle=${pastTime}`;
        
        await page.goto(gameUrl);
        
        // Guess one word
        await page.fill('#word-input', 'waag');
        await page.keyboard.press('Enter');
        
        const guessedWordsList = page.locator('#guessed-words-list');
        await expect(guessedWordsList).toContainText('waag');
        
        // Open details to see words
        await page.click('#guessed-words-container summary');
        
        const showSolutionBtn = page.locator('#show-solution-btn');
        const hideSolutionBtn = page.locator('#hide-solution-btn');
        const unguessedWordsList = page.locator('#unguessed-words-list');
        
        await expect(unguessedWordsList).toBeHidden();
        
        await showSolutionBtn.click();
        
        await expect(unguessedWordsList).toBeVisible();
        await expect(showSolutionBtn).toBeHidden();
        await expect(hideSolutionBtn).toBeVisible();
        await expect(hideSolutionBtn).toHaveText('Verberg oplossing');
        
        // Check that unguessed words are present
        await expect(unguessedWordsList).toContainText('waan');
        await expect(unguessedWordsList).toContainText('weer');
        await expect(unguessedWordsList).toContainText('wegen');
        await expect(unguessedWordsList).not.toContainText('waag');
        
        // Toggle back
        await hideSolutionBtn.click();
        await expect(unguessedWordsList).toBeHidden();
        await expect(showSolutionBtn).toBeVisible();
        await expect(hideSolutionBtn).toBeHidden();
    });
});
