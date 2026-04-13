const { test, expect } = require('@playwright/test');

function encode(string) {
    return Buffer.from(encodeURIComponent(string)).toString('base64')
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
}

test.describe('Menu Functionality', () => {
    const letters = 'waegrnz';
    const words = ['waag', 'waan', 'weer', 'wegen'];
    const encodedWords = encode(words.join(','));
    const gameUrl = `/?letters=${letters}&words=${encodedWords}&date=2026-04-13`;

    test.beforeEach(async ({ page }) => {
        await page.goto(gameUrl);
        // Ensure initial state is saved so it shows up in the menu if we navigate away
        await page.evaluate(() => {
             // Trigger a save by submitting a word
             document.getElementById('word-input').value = 'waag';
             document.getElementById('submit-btn').click();
        });
    });

    test('should open and close the menu', async ({ page }) => {
        const menuButton = page.locator('#menu-button');
        const mainMenu = page.locator('#main-menu');

        // Check if menu is hidden initially
        await expect(mainMenu).not.toBeVisible();

        // Click menu button to open
        await menuButton.click();
        await expect(mainMenu).toBeVisible();

        // Click outside (on header) to close
        await page.click('header h1');
        await expect(mainMenu).not.toBeVisible();
    });

    test('should show "Vandaag" in the menu', async ({ page }) => {
        const menuButton = page.locator('#menu-button');
        const todayItem = page.locator('#today-puzzle-menu-item');

        await menuButton.click();
        await expect(todayItem).toBeVisible();
        await expect(todayItem).toHaveText('Vandaag');
    });

    test('should list and navigate to historical puzzles from localStorage', async ({ page }) => {
        // Add a historical puzzle to localStorage
        const letters = 'abcdefg';
        const date = '2026-04-11';
        const puzzleId = `puzzle_${date}_${letters}`;

        await page.evaluate(({ puzzleId, letters }) => {
            const state = {
                letters: letters.split(''),
                words: ['bad', 'deaf'],
                guessedWords: [],
                timeOfNextPuzzle: null
            };
            localStorage.setItem(puzzleId, JSON.stringify(state));
            const puzzles = JSON.parse(localStorage.getItem('puzzles') || '[]');
            if (!puzzles.includes(puzzleId)) {
                puzzles.push(puzzleId);
                localStorage.setItem('puzzles', JSON.stringify(puzzles));
            }
        }, { puzzleId, letters });

        // Reload to let populateMenu run again
        await page.reload();

        const menuButton = page.locator('#menu-button');
        const mainMenu = page.locator('#main-menu');

        await menuButton.click();

        // Check for the historical item
        const historicalItem = mainMenu.locator(`li:has-text("${date}")`);
        await expect(historicalItem).toBeVisible();
        await expect(historicalItem).toContainText(letters.toUpperCase());

        // Click it to navigate
        await historicalItem.click();

        // Check if URL updated
        await expect(page).toHaveURL(new RegExp(`date=${date}`));
        await expect(page).toHaveURL(new RegExp(`letters=${letters}`));

        // Check if game loaded with new letters
        const centerKey = page.locator('#center-key');
        await expect(centerKey).toHaveText(letters[0]);
    });
});
