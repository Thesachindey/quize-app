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
    if (!quiz.title || !quiz.timeLimit || !quiz.questions || !Array.isArray(quiz.questions)) {
        return false;
    }
    
    return quiz.questions.every(q => 
        q.text && 
        q.options && 
        typeof q.options === 'object' && 
        q.correctAnswer && 
        ['A', 'B', 'C', 'D'].includes(q.correctAnswer)
    );
}

function saveQuiz(quiz) {
    try {
        // Get existing quizzes
        const quizzes = safeGetItem('quizzes', []);
        
        // Add unique ID and creation timestamp if not present
        if (!quiz.id) {
            quiz.id = Date.now();
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
    const quizzes = safeGetItem('quizzes', []);
    const index = quizzes.findIndex(q => q.id === quizId);
    if (index !== -1) {
        quizzes[index] = updatedQuiz;
        return safeSetItem('quizzes', quizzes);
    }
    return false;
}

function deleteQuiz(quizId) {
    const quizzes = safeGetItem('quizzes', []);
    const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
    return safeSetItem('quizzes', updatedQuizzes);
}

// User utility functions
function validateUser(user) {
    return user && 
           user.name && 
           user.email && 
           user.role && 
           ['student', 'teacher', 'admin'].includes(user.role);
}

function saveUser(user) {
    const users = safeGetItem('users', []);
    if (users.some(u => u.email === user.email)) {
        return false;
    }
    users.push(user);
    return safeSetItem('users', users);
}

function updateUser(email, updatedUser) {
    const users = safeGetItem('users', []);
    const index = users.findIndex(u => u.email === email);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        return safeSetItem('users', users);
    }
    return false;
}

function deleteUser(email) {
    const users = safeGetItem('users', []);
    const updatedUsers = users.filter(u => u.email !== email);
    return safeSetItem('users', updatedUsers);
}

// Progress utility functions
function saveProgress(userEmail, quizId, score, totalQuestions) {
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
}

function getProgress(userEmail, quizId) {
    const progress = safeGetItem('studentProgress', {});
    return progress[userEmail]?.[quizId] || [];
}

// Student results utility functions
function saveStudentResult(email, quizId, score) {
    try {
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
    const results = safeGetItem('studentResults', {});
    return results[email] || [];
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