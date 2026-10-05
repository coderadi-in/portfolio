// ==================================================
// IMPORTS
// ==================================================

import { createSectionObserver } from '../fade.js';

// ==================================================
// REFERENCES
// ==================================================

const sections = document.querySelectorAll('.section');
const observer = createSectionObserver(0);

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    sections.forEach(element => { observer.observe(element); });
});