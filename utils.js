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

// Quiz utility functions
function validateQuiz(quiz) {
    if (!quiz || typeof quiz !== 'object') return false;
    if (!quiz.title || !quiz.timeLimit || !quiz.questions || !Array.isArray(quiz.questions)) {
        return false;
    }
    
    return quiz.questions.every(q => 
        q && 
        typeof q === 'object' &&
        q.text && 
        q.options && 
        typeof q.options === 'object' && 
        q.correctAnswer && 
        ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
    );
}

function saveQuiz(quiz) {
    try {
        if (!validateQuiz(quiz)) {
            console.error('Invalid quiz data');
            return false;
        }

        // Get existing quizzes
        const quizzes = safeGetItem('quizzes', []);
        
        // Add unique ID and creation timestamp if not present
        if (!quiz.id) {
            quiz.id = Date.now().toString();
        }
        if (!quiz.createdAt) {
            quiz.createdAt = new Date().toISOString();
        }
        
        // Add to quizzes array
        quizzes.push(quiz);
        
        // Save back to localStorage
        return safeSetItem('quizzes', quizzes);
    } catch (error) {
        console.error('Error saving quiz:', error);
        return false;
    }
}

function updateQuiz(quizId, updatedQuiz) {
    try {
        if (!validateQuiz(updatedQuiz)) {
            console.error('Invalid quiz data');
            return false;
        }

        const quizzes = safeGetItem('quizzes', []);
        const index = quizzes.findIndex(q => q.id === quizId);
        if (index !== -1) {
            quizzes[index] = { ...quizzes[index], ...updatedQuiz };
            return safeSetItem('quizzes', quizzes);
        }
        return false;
    } catch (error) {
        console.error('Error updating quiz:', error);
        return false;
    }
}

function deleteQuiz(quizId) {
    try {
        const quizzes = safeGetItem('quizzes', []);
        const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
        return safeSetItem('quizzes', updatedQuizzes);
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return false;
    }
}

// User utility functions
function validateUser(user) {
    return user && 
           typeof user === 'object' &&
           user.name && 
           user.email && 
           user.role && 
           ['student', 'teacher', 'admin'].includes(user.role);
}

function saveUser(user) {
    try {
        if (!validateUser(user)) {
            console.error('Invalid user data');
            return false;
        }

        const users = safeGetItem('users', []);
        if (users.some(u => u.email === user.email)) {
            console.error('User with this email already exists');
            return false;
        }
        users.push(user);
        return safeSetItem('users', users);
    } catch (error) {
        console.error('Error saving user:', error);
        return false;
    }
}

function updateUser(email, updatedUser) {
    try {
        if (!validateUser(updatedUser)) {
            console.error('Invalid user data');
            return false;
        }

        const users = safeGetItem('users', []);
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            return safeSetItem('users', users);
        }
        return false;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

function deleteUser(email) {
    try {
        const users = safeGetItem('users', []);
        const updatedUsers = users.filter(u => u.email !== email);
        return safeSetItem('users', updatedUsers);
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// Progress utility functions
function saveProgress(userEmail, quizId, score, totalQuestions) {
    try {
        if (!userEmail || !quizId || typeof score !== 'number' || typeof totalQuestions !== 'number') {
            console.error('Invalid progress data');
            return false;
        }

        const progress = safeGetItem('studentProgress', {});
        if (!progress[userEmail]) {
            progress[userEmail] = {};
        }
        if (!progress[userEmail][quizId]) {
            progress[userEmail][quizId] = [];
        }
        
        progress[userEmail][quizId].push({
            score,
            totalQuestions,
            date: new Date().toISOString()
        });
        
        return safeSetItem('studentProgress', progress);
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
}

function getProgress(userEmail, quizId) {
    try {
        const progress = safeGetItem('studentProgress', {});
        return progress[userEmail]?.[quizId] || [];
    } catch (error) {
        console.error('Error getting progress:', error);
        return [];
    }
}

// Student results utility functions
function saveStudentResult(email, quizId, score) {
    try {
        if (!email || !quizId || typeof score !== 'number') {
            console.error('Invalid result data');
            return false;
        }

        const results = safeGetItem('studentResults', {});
        
        // Initialize user's results if not exists
        if (!results[email]) {
            results[email] = [];
        }
        
        // Add new result
        results[email].push({
            quizId,
            score,
            date: new Date().toISOString()
        });
        
        return safeSetItem('studentResults', results);
    } catch (error) {
        console.error('Error saving student result:', error);
        return false;
    }
}

function getStudentResults(email) {
    try {
        const results = safeGetItem('studentResults', {});
        return results[email] || [];
    } catch (error) {
        console.error('Error getting student results:', error);
        return [];
    }
}

// Export all utility functions
window.utils = {
    safeGetItem,
    safeSetItem,
    validateQuiz,
    saveQuiz,
    updateQuiz,
    deleteQuiz,
    validateUser,
    saveUser,
    updateUser,
    deleteUser,
    saveProgress,
    getProgress,
    saveStudentResult,
    getStudentResults
}; 