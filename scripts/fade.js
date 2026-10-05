// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO CREATE AN SECTION OBSERVER
export function createSectionObserver(threshold = 0.2) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: threshold,
    });

    return observer;
}