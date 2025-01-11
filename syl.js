document.addEventListener('DOMContentLoaded', () => {
    const classSelect = document.getElementById('class');
    const subjectContainer = document.getElementById('subjectContainer');
    const subjectInput = document.getElementById('subject');
    const generateButton = document.getElementById('generateButton');

    // Listen for changes in the "Class" dropdown
    classSelect.addEventListener('change', () => {
        if (classSelect.value) {
            // Show the subject input field if a class is selected
            subjectContainer.style.display = 'block';
        } else {
            // Hide the subject input field if no class is selected
            subjectContainer.style.display = 'none';
        }

        // Check if both class and subject inputs are valid
        validateForm();
    });

    // Listen for input changes in the "Subject" field
    subjectInput.addEventListener('input', validateForm);

    // Validate the form to enable/disable the button
    function validateForm() {
        if (classSelect.value && subjectInput.value.trim() !== '') {
            generateButton.disabled = false; // Enable the button
        } else {
            generateButton.disabled = true; // Disable the button
        }
    }
});
