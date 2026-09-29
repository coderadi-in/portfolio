// ==================================================
// ELEMENT REFERENCE
// ==================================================

const menuBtn = document.querySelector('.menu-btn');
const closeNav = document.getElementById('closeNav');
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

// & EVENT LISTENER FOR MENU-BTN & CLOSE-NAV CLICK
menuBtn.addEventListener('click', toggleNavbar);
closeNav.addEventListener('click', toggleNavbar);

// & EVENT LISTENER FOR BODY-CLICK TO CLOSE NAVBAR
document.body.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !e.target.closest('.nav') && !e.target.closest('.menu-btn')) {
        toggleNavbar();
    }
});