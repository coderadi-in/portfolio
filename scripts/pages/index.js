// ==================================================
// ELEMENT REFERENCE
// ==================================================

const challengeForm = document.getElementById('challengeForm');
const closeChallenge = document.querySelector('.close-challenge');
const challengeFormTriggers = document.querySelectorAll('.challenge-form-trigger');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO OPEN A FORM
function openForm(form) {
    form.classList.add('active');
}

// * FUNCTION TO CLOSE A FORM
function closeForm(form) {
    form.classList.remove('active');
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR CHALLENGE-FORM-TRIGGER CLICK
challengeFormTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
        openForm(challengeForm);
    });
});

// & EVENT LISTENER FOR CLOSE-CHALLENGE CLICK
closeChallenge.addEventListener('click', () => {
    closeForm(challengeForm);
});