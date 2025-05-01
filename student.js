let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let userAnswers = [];

// Display available quizzes
function displayQuizzes() {
    const unfinishedList = document.getElementById('unfinishedQuizList');
    const finishedList = document.getElementById('finishedQuizList');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const userEmail = JSON.parse(localStorage.getItem('currentUser')).email;

    let unfinishedQuizzes = [];
    let finishedQuizzes = [];

    // Sort quizzes into finished and unfinished
    quizzes.forEach(quiz => {
        const quizProgress = getProgress(userEmail, quiz.id);
        const bestScore = quizProgress.length > 0
            ? Math.max(...quizProgress.map(attempt => attempt.score))
            : null;
        const lastAttempt = quizProgress.length > 0
            ? quizProgress[quizProgress.length - 1]
            : null;
        
        const quizWithProgress = {
            ...quiz,
            bestScore,
            lastAttempt,
            progress: quizProgress
        };

        if (quizProgress.length > 0) {
            finishedQuizzes.push(quizWithProgress);
        } else {
            unfinishedQuizzes.push(quizWithProgress);
        }
    });

    // Update counters
    document.getElementById('completedCount').textContent = finishedQuizzes.length;
    document.getElementById('availableCount').textContent = unfinishedQuizzes.length;

    // Display unfinished quizzes
    if (unfinishedQuizzes.length === 0) {
        unfinishedList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">No unfinished quizzes available.</p>
            </div>
        `;
    } else {
        unfinishedList.innerHTML = unfinishedQuizzes.map(quiz => `
            <div class="bg-gray-50 rounded-lg p-6 border-2 border-yellow-400">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Questions: ${quiz.questions.length}</p>
                    <p>Time Limit: ${quiz.timeLimit} minutes</p>
                    <p class="text-yellow-600">Status: Not attempted yet</p>
                </div>
                <button 
                    onclick="startQuiz(${quiz.id})"
                    class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Start Quiz
                </button>
            </div>
        `).join('');
    }

    // Display finished quizzes
    if (finishedQuizzes.length === 0) {
        finishedList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">No completed quizzes yet.</p>
            </div>
        `;
    } else {
        finishedList.innerHTML = finishedQuizzes.map(quiz => `
            <div class="bg-gray-50 rounded-lg p-6 border-2 border-green-400">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <p>Questions: ${quiz.questions.length}</p>
                    <p>Time Limit: ${quiz.timeLimit} minutes</p>
                    <p class="text-green-600">Best Score: ${quiz.bestScore}/${quiz.questions.length}</p>
                    <p class="text-blue-600">Last Attempt: ${new Date(quiz.lastAttempt.date).toLocaleDateString()}</p>
                </div>
                <button 
                    onclick="startQuiz(${quiz.id})"
                    class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Retake Quiz
                </button>
            </div>
        `).join('');
    }
}

// Start a quiz
function startQuiz(quizId) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    currentQuiz = quizzes.find(quiz => quiz.id === quizId);

    if (!currentQuiz) {
        alert('Quiz not found!');
        return;
    }

    currentQuestionIndex = 0;
    score = 0;
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    timeLeft = currentQuiz.timeLimit * 60;

    document.getElementById('quizModal').classList.remove('hidden');
    document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
    updateNavigationButtons();
    displayQuestion();
    startTimer();
}

// Start the quiz timer
function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert('Time is up!');
            endQuiz();
            return;
        }

        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

// Display the current question
function displayQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.text;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = Object.entries(question.options).map(([key, value]) => `
        <label class="flex items-center space-x-3 p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
            <input 
                type="radio" 
                name="answer" 
                value="${key}"
                class="h-5 w-5 text-blue-600 focus:ring-blue-500"
                ${userAnswers[currentQuestionIndex] === key ? 'checked' : ''}
            >
            <span class="text-gray-900 text-lg">${key}. ${value}</span>
        </label>
    `).join('');

    // Add event listeners to radio buttons
    const radioButtons = optionsContainer.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', (e) => {
            userAnswers[currentQuestionIndex] = e.target.value;
            updateNavigationButtons();
        });
    });

    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    updateNavigationButtons();
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const finishBtn = document.getElementById('finishQuizBtn');

    // Previous button
    prevBtn.disabled = currentQuestionIndex === 0;

    // Next/Finish button
    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
        nextBtn.classList.add('hidden');
        finishBtn.classList.remove('hidden');
        // Enable finish button only if all questions are answered
        finishBtn.disabled = userAnswers.includes(null);
    } else {
        nextBtn.classList.remove('hidden');
        finishBtn.classList.add('hidden');
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    }
}

// Calculate score
function calculateScore() {
    score = 0;
    for (let i = 0; i < currentQuiz.questions.length; i++) {
        if (userAnswers[i] === currentQuiz.questions[i].correctAnswer) {
            score++;
        }
    }
    return score;
}

// Save progress
function saveProgress(userEmail, quizId, score, totalQuestions) {
    const progress = JSON.parse(localStorage.getItem('progress')) || [];
    progress.push({
        userEmail,
        quizId,
        score,
        totalQuestions,
        date: new Date().toISOString()
    });
    localStorage.setItem('progress', JSON.stringify(progress));
    return true;
}

// Get progress for a specific user and quiz
function getProgress(userEmail, quizId) {
    const progress = JSON.parse(localStorage.getItem('progress')) || [];
    return progress.filter(p => p.userEmail === userEmail && p.quizId === quizId);
}

// End the quiz
function endQuiz() {
    clearInterval(timer);
    score = calculateScore();
    
    const userEmail = JSON.parse(localStorage.getItem('currentUser')).email;
    saveProgress(userEmail, currentQuiz.id, score, currentQuiz.questions.length);
    
    document.getElementById('quizModal').classList.add('hidden');
    showResults();
}

// Show quiz results
function showResults() {
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

    document.getElementById('resultsModal').classList.remove('hidden');
}

// Close results modal
function closeResultsModal() {
    document.getElementById('resultsModal').classList.add('hidden');
    displayQuizzes(); // Refresh quiz list to show updated scores
}

// Initialize the student page
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        alert('Access denied. This page is for students only.');
        window.location.href = 'login.html';
        return;
    }

    // Set personalized welcome message
    const currentHour = new Date().getHours();
    let greeting = '';
    if (currentHour < 12) {
        greeting = 'Good morning';
    } else if (currentHour < 17) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    document.getElementById('welcomeMessage').textContent = `${greeting}, ${user.name}!`;
    document.getElementById('welcomeSubtext').textContent = `Ready to challenge yourself? Choose a quiz below to get started!`;

    displayQuizzes();

    // Add navigation button event listeners
    document.getElementById('prevQuestionBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextQuestionBtn').addEventListener('click', nextQuestion);
    document.getElementById('finishQuizBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to finish the quiz? Make sure you have answered all questions.')) {
            endQuiz();
        }
    });
});