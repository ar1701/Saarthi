
        // Toggle between login and signup forms
        function toggleForms() {
            const container = document.querySelector('.container');
            const signInForm = document.querySelector('.sign-in-form');
            const signUpForm = document.querySelector('.sign-up-form');
            
            if (signInForm.style.display !== 'none') {
                signInForm.style.display = 'none';
                signUpForm.style.display = 'block';
            } else {
                signInForm.style.display = 'block';
                signUpForm.style.display = 'none';
            }
        }

        // Form validation
        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function showError(inputId, errorId, message) {
            const input = document.getElementById(inputId);
            const error = document.getElementById(errorId);
            input.classList.add('shake');
            error.style.display = 'block';
            error.textContent = message;
            setTimeout(() => input.classList.remove('shake'), 500);
        }

        function hideError(errorId) {
            document.getElementById(errorId).style.display = 'none';
        }

        // Login form validation
        document.querySelector('.sign-in-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            let isValid = true;

            if (!validateEmail(email)) {
                showError('loginEmail', 'loginEmailError', 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError('loginEmailError');
            }

            if (password.length < 6) {
                showError('loginPassword', 'loginPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                hideError('loginPasswordError');
            }

            if (isValid) {
                // Handle login logic here
                console.log('Login successful');
                window.location.href="index.html";
            }
        });

        // Signup form validation
        document.querySelector('.sign-up-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            let isValid = true;

            if (name.trim() === '') {
                showError('signupName', 'signupNameError', 'Please enter your name');
                isValid = false;
            } else {
                hideError('signupNameError');
            }

            if (!validateEmail(email)) {
                showError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError('signupEmailError');
            }

            if (password.length < 6) {
                showError('signupPassword', 'signupPasswordError', 'Password must be at least 6 characters');
                isValid = false;
            } else {
                hideError('signupPasswordError');
            }

            if (isValid) {
                // Handle signup logic here
                console.log('Signup successful');
                window.location.href="index.html";
            }
        });