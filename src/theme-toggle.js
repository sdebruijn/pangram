const COLOR_SCHEMES = ['', 'light', 'dark'];

const themeToggleButton = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-moon icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const MONITOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-monitor icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;

const THEME_ICONS = { '': MONITOR_SVG, 'light': SUN_SVG, 'dark': MOON_SVG };

function applyTheme(theme) {
    localStorage.setItem('color-scheme', theme);
    document.documentElement.classList.remove('light', 'dark'); // Remove any existing theme classes
    if (theme !== '') {
        document.documentElement.classList.add(theme);
    }
    if (themeIcon) {
        themeIcon.innerHTML = THEME_ICONS[theme] || THEME_ICONS[''];
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
