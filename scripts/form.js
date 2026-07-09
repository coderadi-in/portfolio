// ==================================================
// ELEMENT REFERENCE
// ==================================================

const challengeForm = document.getElementById('challengeForm');
const successPage = document.getElementById('successPage');

const challengeDesc = document.getElementById('challengeDesc');
const challengeName = document.getElementById('challengeName');
const challengeEmail = document.getElementById('challengeEmail');

const challengeSend = document.querySelector('.work-form .btn');
const hideSuccessPage = document.querySelector('.success-page .btn');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO TOGGLE SEND-BTN STATE
function toggleSendBtnState() {
    challengeSend.classList.toggle('disabled', challengeDesc.value.trim() === '' || challengeName.value.trim() === '' || challengeEmail.value.trim() === '');
}

// * FUNCTION TO UPDATE INPUT STATES
function updateInputState(elem) {
    if (elem.value.trim() === '') {
        elem.style.borderColor = 'var(--color-state-red)';
        const msg = elem.parentElement.querySelector('.err-msg');
        if (!msg) { return; }
        msg.classList.remove('hidden');
        msg.textContent = 'This field is required';
    }

    else {
        elem.style.borderColor = 'var(--color-state-green)';
        const msg = elem.parentElement.querySelector('.err-msg');
        if (!msg) { return; }
        msg.classList.add('hidden');
        msg.textContent = '';
    }
}

// * FUNCTION TO CREATE A FORM DATA OBJECT
function createFormData() {
    const formData = new FormData();
    formData.append('entry.63267066', challengeDesc.value);
    formData.append('entry.1411531399', challengeName.value);
    formData.append('entry.584943803', challengeEmail.value);
    return formData;
}

// * FUNCTION TO RESET INPUTS
function resetInputs() {
    challengeDesc.value = '';
    challengeName.value = '';
    challengeEmail.value = '';
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR SETTINGS POPOVER TOGGLE
challengeForm.addEventListener('beforetoggle', (event) => {
    setTimeout(() => {
        challengeForm.classList.toggle('open', event.newState === 'open');
    }, 100);
});

// & EVENT LISTENER FOR INPUT VALIDATION
challengeDesc.addEventListener('input', () => {
    updateInputState(challengeDesc);
    toggleSendBtnState();
});

challengeName.addEventListener('input', () => {
    updateInputState(challengeName);
    toggleSendBtnState();
});

challengeEmail.addEventListener('input', () => {
    updateInputState(challengeEmail);
    toggleSendBtnState();
});

// & EVENT LISTENER FOR SUCCESS PAGE CLOSE
hideSuccessPage.addEventListener('click', () => {
    successPage.classList.remove('open');
});

// & EVENT LISTENER FOR FORM SUBMISSION
challengeSend.addEventListener('click', () => {
    // Validate inputs
    if (challengeDesc.value.trim() === '' || challengeName.value.trim() === '' || challengeEmail.value.trim() === '') {
        updateInputState(challengeDesc);
        updateInputState(challengeName);
        updateInputState(challengeEmail);
        return;
    }

    try {
        const formData = createFormData();    
        fetch('https://docs.google.com/forms/d/e/1FAIpQLSevf1sFPc3Rp5Ewv3AZZnaidtxGksUsDJZpnqPrixrWPV1rPg/formResponse', {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        resetInputs();

        challengeForm.classList.remove('open');
        setTimeout(() => {
            successPage.classList.add('open');
        }, 400);

    } catch {
        challengeForm.style.borderColor = 'var(--color-state-red)';
        challengeSend.textContent = "Error submitting form.";
        
        challengeForm.querySelector('.fs-20').textContent = "Error submitting form.";
        challengeForm.querySelector('.para').textContent = "Please try again later.";
    }
});