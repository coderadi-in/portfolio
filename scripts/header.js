// ==================================================
// ELEMENT REFERENCE
// ==================================================

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO TOGGLE NAVIGATION
function toggleNavbar() {
    menuBtn.classList.toggle('active');
    nav.classList.toggle('active');
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR MENU-BTN CLICK
menuBtn.addEventListener('click', toggleNavbar);

// & EVENT LISTENER FOR BODY-CLICK TO CLOSE NAVBAR
document.body.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !e.target.closest('.nav') && !e.target.closest('.menu-btn')) {
        toggleNavbar();
    }
});