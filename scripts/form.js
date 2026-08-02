// ==================================================
// ELEMENT REFERENCE
// ==================================================

const successPage = document.getElementById('successPage');

const challengeName = document.getElementById('challengeName');
const challengeEmail = document.getElementById('challengeEmail');
const challengePhone = document.getElementById('challengePhone');
const challengeDesc = document.getElementById('challengeDesc');

const challengeSend = document.querySelector('#challengeForm .send');
const hideSuccessPage = document.querySelector('.success-page .btn');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO TOGGLE SEND-BTN STATE
function toggleSendBtnState(btn) {
    btn.classList.toggle('disabled', challengeName.value.trim() === '' || challengeEmail.value.trim() === '' || challengePhone.value.trim() === '' || challengeDesc.value.trim() === '');
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
function createFormData(entries) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(entries)) {
        formData.append(key, value.value);
    }

    return formData;
}

// * FUNCTION TO RESET INPUTS
function resetInputs(inputs) {
    inputs.forEach(element => {
        element.value = '';
    });
}

// * FUNCTION TO ADD EVENT LISTENER FOR UPDATING INPUT STATE
function addUpdateStateChanger(input, submitBtn) {
    input.addEventListener('input', () => {
        updateInputState(input);
        toggleSendBtnState(submitBtn);
    });
}

// * FUNCTION TO SUBMIT A FORM
function addSubmissionListener(submitBtn, entries, submitURL) {
    const inputs = Object.values(entries);

    submitBtn.addEventListener('click', () => {
        let isValid = true;

        // Validate inputs
        inputs.forEach((input) => {
            if (input.value.trim() == '') {
                isValid = false;
                updateInputState(input);
            }
        });

        if (!isValid) {
            submitBtn.classList.add('shake');
            setTimeout(() => {
                submitBtn.classList.remove('shake');
            }, 2000);
            return;
        }

        // Submit form
        try {
            const formData = createFormData(entries);
            fetch(submitURL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });
            resetInputs(inputs);

            submitBtn.classList.remove('open');
            setTimeout(() => {
                successPage.classList.add('open');
            }, 400);

        } catch {
            submitBtn.style.borderColor = 'var(--color-state-red)';
            submitBtn.textContent = "Error submitting form.";
        }
    });
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
addUpdateStateChanger(challengeName, challengeSend);
addUpdateStateChanger(challengeEmail, challengeSend);
addUpdateStateChanger(challengePhone, challengeSend);
addUpdateStateChanger(challengeDesc, challengeSend);

// & EVENT LISTENER FOR SUCCESS PAGE CLOSE
hideSuccessPage.addEventListener('click', () => {
    successPage.classList.remove('open');
});

// & EVENT LISTENER FOR CHALLENGE FORM SUBMISSION
addSubmissionListener(
    challengeSend,
    {
        'entry.1411531399': challengeName,
        'entry.584943803': challengeEmail,
        'entry.650751546': challengePhone,
        'entry.63267066': challengeDesc,
    },
    'https://docs.google.com/forms/d/e/1FAIpQLSevf1sFPc3Rp5Ewv3AZZnaidtxGksUsDJZpnqPrixrWPV1rPg/formResponse'
);