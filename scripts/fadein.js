// ==================================================
// ELEMENT REFERENCE
// ==================================================

const sections = document.querySelectorAll('.section');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO CREATE AN INTERSECTION OBSERVER
export function createIntersectionObserver() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    return observer;
}

// ==================================================
// FADE-IN SETUP
// ==================================================

const observer = createIntersectionObserver();

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    sections.forEach((section) => {
        observer.observe(section);
    });
});