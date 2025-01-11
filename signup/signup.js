// Helper functions
function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    input.classList.add('shake'); // Add a shake animation for emphasis
    error.style.display = 'block';
    error.textContent = message;
    setTimeout(() => input.classList.remove('shake'), 500); // Remove shake after animation
}

function hideError(errorId) {
    const error = document.getElementById(errorId);
    error.style.display = 'none';
    error.textContent = ''; // Clear any previous message
}

// Email validation helper
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Form validation logic
document.querySelector('.sign-up-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Gather inputs
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    let isValid = true;

    // Name validation
    if (name === '') {
        showError('signupName', 'signupNameError', 'Please enter your name');
        isValid = false;
    } else {
        hideError('signupNameError');
    }

    // Email validation
    if (!validateEmail(email)) {
        showError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
        isValid = false;
    } else {
        hideError('signupEmailError');
    }

    // Phone validation (simple check for numeric input)
    if (!/^\d{10}$/.test(phone)) {
        showError('signupPhone', 'signupPhoneError', 'Please enter a valid 10-digit phone number');
        isValid = false;
    } else {
        hideError('signupPhoneError');
    }

    // Password validation
    if (password.length < 6) {
        showError('signupPassword', 'signupPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        hideError('signupPasswordError');
    }

    // If all inputs are valid, proceed with signup logic
    if (isValid) {
        console.log('Signup successful');
        window.location.href = "../index.html";
    }
});
