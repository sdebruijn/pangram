const COLOR_SCHEMES = ['', 'light', 'dark'];

const themeToggleButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const THEME_ICONS = { '': 'brightness_auto', 'light': 'light_mode', 'dark': 'dark_mode' };

function applyTheme(theme) {
    localStorage.setItem('color-scheme', theme);
    document.documentElement.classList.remove('light', 'dark'); // Remove any existing theme classes
    if (theme !== '') {
        document.documentElement.classList.add(theme);
    }
    if (themeIcon) {
        themeIcon.textContent = THEME_ICONS[theme] || THEME_ICONS['']; // Fallback to auto
    }
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('color-scheme') || '';
    const currentIndex = COLOR_SCHEMES.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
    const nextTheme = COLOR_SCHEMES[nextIndex];
    applyTheme(nextTheme);
}

// Initialize theme on page load
const savedTheme = localStorage.getItem('color-scheme');
const initialTheme = COLOR_SCHEMES.includes(savedTheme) ? savedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : ''));
applyTheme(initialTheme);

// Add event listener to the theme toggle button
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}
