// ==================================================
// REFERENCES
// ==================================================

const sections = document.querySelectorAll('.section');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO START THE SECTION OBSERVER
function startSectionObserver() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
    });

    sections.forEach(section => { observer.observe(section);});

    return observer.disconnect;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', startSectionObserver);