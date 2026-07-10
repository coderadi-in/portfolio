// ==================================================
// ELEMENT REFERENCE
// ==================================================

const categories = document.querySelectorAll('.category');
const voiceSection = document.querySelector('.voice');
const formDesc = document.getElementById('challengeDesc');

// ==================================================
// FUNCTION
// ==================================================

// * FUNCTION TO ADD THE .TEXT ELEMENT OF CATEGORY IN THE .FORMDESC INPUT
function addCategoryText(category) {
    formDesc.value = category.querySelector('.text').innerText;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

categories.forEach(category => {
    category.addEventListener('click', () => {
        addCategoryText(category);
        voiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});