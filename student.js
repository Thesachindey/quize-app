let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let userAnswers = [];

// Display available quizzes
function displayQuizzes() {
    const quizList = document.getElementById('quizList');
    const quizzes = utils.safeGetItem('quizzes', []);
    const userEmail = utils.safeGetItem('currentUser', {}).email;
    
    if (quizzes.length === 0) {
        quizList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">No quizzes available yet.</p>
            </div>
        `;
        return;
    }

    quizList.innerHTML = quizzes.map(quiz => {
        const quizProgress = utils.getProgress(userEmail, quiz.id);
        const bestScore = quizProgress.length > 0 
            ? Math.max(...quizProgress.map(attempt => attempt.score))
            : null;
        const lastAttempt = quizProgress.length > 0 
            ? quizProgress[quizProgress.length - 1]
            : null;

        return `
            <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Questions: ${quiz.questions.length}</p>
                    <p>Time Limit: ${quiz.timeLimit} minutes</p>
                    ${bestScore !== null ? `
                        <p class="text-green-600">Best Score: ${bestScore}/${quiz.questions.length}</p>
                    ` : ''}
                    ${lastAttempt ? `
                        <p class="text-blue-600">Last Attempt: ${new Date(lastAttempt.date).toLocaleDateString()}</p>
                    ` : ''}
                </div>
                <button 
                    onclick="startQuiz(${quiz.id})"
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Start Quiz
                </button>
            </div>
        `;
    }).join('');
}

// Initialize student page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = utils.safeGetItem('currentUser');
    if (!user) {
        alert('Please login to access this page');
        window.location.href = 'login.html';
        return;
    }

    // Check if user has student role
    if (user.role !== 'student') {
        alert('Access denied. This page is for students only.');
        window.location.href = 'login.html';
        return;
    }

    // Set user info and welcome message
    displayUserInfo(user);
    const users = utils.safeGetItem('users', []);
    const currentUser = users.find(u => u.email === user.email);
    if (currentUser) {
        document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.name}`;
    }

    // Initialize page content
    displayQuizzes();
    displayQuizHistory();
});

// Add role check to all quiz participation functions
function checkStudentAccess() {
    const user = utils.safeGetItem('currentUser');
    if (!user || user.role !== 'student') {
        alert('Access denied. This page is for students only.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Update quiz participation functions to include role check
function startQuiz(quizId) {
    if (!checkStudentAccess()) return;
    
    // Save active quiz ID to localStorage
    if (!utils.safeSetItem('activeQuiz', quizId)) {
        alert('Error starting quiz. Please try again.');
        return;
    }
    
    // Navigate to quiz page
    window.location.href = 'quiz.html';
}

// Display current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.text;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = Object.entries(question.options).map(([key, value]) => `
        <label class="flex items-center space-x-3 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input 
                type="radio" 
                name="answer" 
                value="${key}"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                ${userAnswers[currentQuestionIndex] === key ? 'checked' : ''}
            >
            <span class="text-gray-900">${key}. ${value}</span>
        </label>
    `).join('');

    // Update progress bar
    const progress = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Handle answer selection
function selectAnswer(selectedOption) {
    if (!checkStudentAccess()) return;
    if (!currentQuiz || currentQuestionIndex >= currentQuiz.questions.length) return;
    
    const question = currentQuiz.questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = selectedOption;
    
    if (selectedOption === question.correctAnswer) {
        score++;
    }
}

// Move to next question
function nextQuestion() {
    if (!checkStudentAccess()) return;
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        endQuiz();
    }
}

// Start timer
function startTimer() {
    clearInterval(timer);
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// End quiz
function endQuiz() {
    if (!checkStudentAccess()) return;
    clearInterval(timer);
    document.getElementById('quizModal').classList.add('hidden');

    const userEmail = utils.safeGetItem('currentUser', {}).email;
    if (!userEmail) {
        alert('Error: User session not found!');
        return;
    }

    if (!utils.saveProgress(userEmail, currentQuiz.id, score, currentQuiz.questions.length)) {
        alert('Error saving quiz progress!');
        return;
    }

    showResults();
}

// Show results
function showResults() {
    const userEmail = utils.safeGetItem('currentUser', {}).email;
    const quizProgress = utils.getProgress(userEmail, currentQuiz.id);

    document.getElementById('scoreDisplay').textContent = `${score}/${currentQuiz.questions.length}`;
    
    const percentage = (score / currentQuiz.questions.length) * 100;
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! Great job!';
    } else if (percentage >= 60) {
        message = 'Good work! Keep practicing!';
    } else {
        message = 'Keep practicing to improve your score!';
    }
    document.getElementById('scoreMessage').textContent = message;

    // Show previous attempts
    const previousScores = document.getElementById('previousScores');
    if (quizProgress.length > 1) {
        previousScores.innerHTML = quizProgress
            .slice(0, -1) // Exclude current attempt
            .map(attempt => `
                <div class="flex justify-between items-center py-1">
                    <span>${new Date(attempt.date).toLocaleDateString()}</span>
                    <span>${attempt.score}/${attempt.totalQuestions}</span>
                </div>
            `).join('');
    } else {
        previousScores.innerHTML = '<p>No previous attempts</p>';
    }

    document.getElementById('resultsModal').classList.remove('hidden');
}

// Close results modal
function closeResultsModal() {
    document.getElementById('resultsModal').classList.add('hidden');
    displayQuizzes(); // Refresh quiz list to show updated scores
}

function displayQuizHistory() {
    const user = utils.safeGetItem('currentUser', {});
    if (!user || !user.email) {
        console.error('No user found in session');
        return;
    }

    // Get all quizzes and student results
    const quizzes = utils.safeGetItem('quizzes', []);
    const results = utils.getStudentResults(user.email);

    // Create progress table
    const progressTable = document.createElement('div');
    progressTable.className = 'progress-table';
    progressTable.innerHTML = `
        <h2>Your Quiz History</h2>
        <table>
            <thead>
                <tr>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Attempts</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => {
                    const quiz = quizzes.find(q => q.id === result.quizId);
                    if (!quiz) return '';
                    
                    const attempts = utils.getProgress(user.email, result.quizId).length;
                    const date = new Date(result.date).toLocaleDateString();
                    
                    return `
                        <tr>
                            <td>${quiz.title}</td>
                            <td>${result.score.toFixed(1)}%</td>
                            <td>${date}</td>
                            <td>${attempts}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .progress-table {
            margin: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-table h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .progress-table table {
            width: 100%;
            border-collapse: collapse;
        }
        .progress-table th, .progress-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .progress-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .progress-table tr:hover {
            background-color: #f9f9f9;
        }
    `;
    document.head.appendChild(style);

    // Add table to the page
    const container = document.querySelector('.container');
    container.appendChild(progressTable);
} 