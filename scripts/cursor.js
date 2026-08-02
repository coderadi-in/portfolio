// ==================================================
// ELEMENT REFERENCE
// ==================================================

const wrapper = document.querySelector('.custom-cursor-wrapper');
const cursor = document.querySelector('.custom-cursor');
const interactiveElements = document.querySelectorAll('.link, .btn, .input');
const invertedElements = document.querySelectorAll(".inverted-element");

// ==================================================
// STATES
// ==================================================

const isTouch = window.matchMedia('(pointer: coarse)').matches;
const isMouse = window.matchMedia('(pointer: fine)').matches;

let mouseX = 0, mouseY = 0;
let currentX = 0, currentY = 0;

// ==================================================
// FUNCTIONS
// ==================================================

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

if (isMouse) {
    // & INITIAL DISPLAY SETTINGS
    document.addEventListener('DOMContentLoaded', animate);

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
        // Trigger when mouse enters
        element.addEventListener('mouseenter', () => {
            if (element.classList.contains('disabled')) {
                wrapper.classList.add('shrunk');
            } else { wrapper.classList.add('hovered'); }
        });

        // Revert color when mouse leaves
        element.addEventListener('mouseleave', () => {
            if (element.classList.contains('disabled')) {
                wrapper.classList.remove('shrunk');
            } else { wrapper.classList.remove('hovered'); }
        });
    });

    // & EVENT LISTENER FOR MOUSE MOVEMENT OVER INVERTED ELEMENTS
    invertedElements.forEach(elem => {
        // Trigger when mouse enters
        elem.addEventListener('mouseenter', () => {
            wrapper.style.borderColor = 'var(--color-fg-card)';
        });

        // Revert color when mouse leaves
        elem.addEventListener('mouseleave', () => {
            wrapper.style.borderColor = 'var(--color-bg-card)';
        });
    });
} else {
    cursor.style.display = "none";
    wrapper.style.display = "none";
}