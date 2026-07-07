// ==================================================
// ELEMENT REFERENCE
// ==================================================

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
const wrapper = document.querySelector('.custom-cursor-wrapper');
const cursor = document.querySelector('.custom-cursor');
const interactiveElements = document.querySelectorAll('.link, .btn');

// ==================================================
// STATES
// ==================================================

let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO TOGGLE NAVIGATION
function toggleNavbar() {
    menuBtn.classList.toggle('active');
    nav.classList.toggle('active');
}

// * FUNCTION TO ANIMATE WRAPPER SMOOTHLY TOWARDS THE CURSOR POSITION
function animate() {
    const ease = 0.15;
    currentX += (mouseX - currentX) * ease;
    currentY += (mouseY - currentY) * ease;

    const rect = wrapper.getBoundingClientRect();
    const offsetX = rect.width / 2;
    const offsetY = rect.height / 2;

    wrapper.style.left = (currentX - offsetX) + 'px';
    wrapper.style.top = (currentY - offsetY) + 'px';

    requestAnimationFrame(animate);
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', animate);

// & EVENT LISTENER FOR MENU-BTN CLICK
menuBtn.addEventListener('click', toggleNavbar);

// & EVENT LISTENER FOR BODY-CLICK TO CLOSE NAVBAR
document.body.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !e.target.closest('.nav') && !e.target.closest('.menu-btn')) {
        toggleNavbar();
    }
});

// & EVENT LISTENER FOR MOUSE MOVEMENT
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Dot moves instantly to the mouse
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// & EVENT LISTENER FOR MOUSE MOVEMENT OVER INTERACTIVE ELEMENTS
interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
        wrapper.classList.add('hovered');
    });

    element.addEventListener('mouseleave', () => {
        wrapper.classList.remove('hovered');
    });
});