// Common authentication utilities

// Check if user is logged in and session is valid
function checkAuth(requiredRole = null) {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        
        // Check if user exists and has required properties
        if (!user || !user.email || !user.role || !user.sessionExpiry) {
            console.warn('Invalid user data found in localStorage');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return null;
        }

        // Check if session has expired
        if (new Date(user.sessionExpiry) < new Date()) {
            console.warn('Session expired');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return null;
        }

        // Check if user has required role
        if (requiredRole && user.role !== requiredRole) {
            console.warn('Unauthorized access attempt');
            window.location.href = 'dashboard.html';
            return null;
        }

        // Extend session
        user.sessionExpiry = new Date(Date.now() + 30 * 60000).toISOString();
        localStorage.setItem('currentUser', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return null;
    }
}

// Display user information
function displayUserInfo(user) {
    const userEmail = document.getElementById('userEmail');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');

    if (userEmail) userEmail.textContent = user.email;
    if (userRole) userRole.textContent = `Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
    if (userAvatar) userAvatar.textContent = user.email.charAt(0).toUpperCase();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again.');
        }
    }
}

// Utility functions for safe localStorage operations
function safeGetItem(key, defaultValue = []) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return defaultValue;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);
        return false;
    }
}

// Export functions
window.checkAuth = checkAuth;
window.displayUserInfo = displayUserInfo;
window.logout = logout;

// Export utility functions
window.safeGetItem = safeGetItem;
window.safeSetItem = safeSetItem; 