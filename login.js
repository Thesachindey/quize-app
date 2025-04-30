// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Function to show error message
    function showError(message) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = message;
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    // Function to validate email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate password
    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Function to validate role
    function validateRole(role) {
        return ['student', 'teacher', 'admin'].includes(role);
    }

    // Function to hash password (in a real app, this would be done server-side)
    function hashPassword(password) {
        // This is a simple hash for demo purposes
        // In a real application, use a proper hashing algorithm
        return btoa(password);
    }

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        // Validate email
        if (!email) {
            showError('Please enter your email address');
            return;
        }
        
        if (!validateEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Validate password
        if (!password) {
            showError('Please enter your password');
            return;
        }
        
        if (!validatePassword(password)) {
            showError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            return;
        }
        
        // Validate role
        if (!role) {
            showError('Please select your role');
            return;
        }
        
        if (!validateRole(role)) {
            showError('Please select a valid role');
            return;
        }
        
        try {
            // Create user object
            const user = {
                email: email,
                role: role,
                loginTime: new Date().toISOString(),
                sessionExpiry: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes session
            };
            
            // In a real application, you would:
            // 1. Send credentials to server
            // 2. Server would validate and return a session token
            // 3. Store the token in localStorage or cookies
            
            // For demo purposes, we'll store the user object
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Show success message
            errorMessage.style.display = 'block';
            errorMessage.style.color = '#37BB11';
            errorMessage.textContent = 'Login successful! Redirecting...';
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    });
}); 