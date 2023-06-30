function togglePasswordVisibility() {
    const passwordField = document.getElementById('password-field');
    const toggleButton = document.querySelector('.toggle-password');
    const passwordFieldSignup = document.getElementById('password-field-signup');
    const toggleButtonSignup = document.querySelector('.toggle-password-signup');

    toggleButton.addEventListener('click', function() {
        // toggle the type attribute
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        // toggle the eye / eye slash icon
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });

    toggleButtonSignup.addEventListener('click', function() {
        // toggle the type attribute
        const typeSignup = passwordFieldSignup.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordFieldSignup.setAttribute('type', typeSignup);

        // toggle the eye / eye slash icon
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });
}

