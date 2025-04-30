let startBtn = document.querySelector(".start-btn"),
instructionCard = document.querySelector(".instruction"),
instructionExit = document.querySelectorAll(".instruction button")[0],
startQuizBtn = document.querySelectorAll(".instruction button")[1],
wrapper = document.querySelector(".wrapper"),
nxtBtn = document.querySelector(".btn button"),
resultCard = document.querySelector(".result-card"),
time = document.querySelectorAll(".Timer p")[1],
progressBar = document.querySelector(".inner"),
questionEl = document.querySelector(".question-container"),
answerContainer = document.querySelector(".option-container"),
currentQuestionNum = document.querySelector(".current-question"),
totalQuestion = document.querySelector(".total-question"),
totalScore = document.querySelector(".total-score .value"),
yourScore = document.querySelector(".user-score .value"),
unattempted = document.querySelector(".unattempted .value"),
attempted = document.querySelector(".attempted .value"),
wrong = document.querySelector(".wrong .value"),
replayQuiz = document.querySelectorAll(".score-btn button")[0],
exitQuiz = document.querySelectorAll(".score-btn button")[1];

let currentQuestion = 0;
let userAnswers = [];
let timer = null;
let score = 0;
let attemptQuestion = 0;
let unattemptedQuestion = 0;
let wrongQuestion = 0;
let activeQuiz = null;

// Load active quiz from localStorage
function loadActiveQuiz() {
    const quizId = utils.safeGetItem('activeQuiz');
    if (!quizId) {
        alert('No active quiz found. Please select a quiz first.');
        window.location.href = 'student.html';
        return false;
    }

    const quizzes = utils.safeGetItem('quizzes', []);
    activeQuiz = quizzes.find(q => q.id === quizId);
    
    if (!activeQuiz) {
        alert('Quiz not found. Please try again.');
        window.location.href = 'student.html';
        return false;
    }

    // Set quiz title and total questions
    document.getElementById('quizTitle').textContent = activeQuiz.title;
    document.getElementById('totalQuestions').textContent = activeQuiz.questions.length;
    document.getElementById('currentQuestion').textContent = currentQuestion + 1;
    
    return true;
}

// Event Listeners
replayQuiz.addEventListener("click", () => {
    resultCard.style.width = "0";
    resultCard.style.transform = "scale(0)";
    wrapper.style.transform = "scale(1)";
    wrapper.style.width = "100%";
    currentQuestion = 0;
    score = 0;
    attemptQuestion = 0;
    unattemptedQuestion = 0;
    wrongQuestion = 0;
    startQuiz();
});

exitQuiz.addEventListener("click", () => {
    resultCard.style.width = "0";
    resultCard.style.transform = "scale(0)";
    currentQuestion = 0;
    score = 0;
    attemptQuestion = 0;
    unattemptedQuestion = 0;
    wrongQuestion = 0;
    startBtn.style.transform = "scale(1)";
    startBtn.style.width = "100%";
    window.location.href = 'student.html';
});

startBtn.addEventListener("click", () => {
    instructionCard.style.transform = "scale(1)";
    instructionCard.style.width = "100%";
    instructionCard.style.opacity = "1";
    startBtn.style.transform = "scale(0)";
    startBtn.style.width = "0";
});

instructionExit.addEventListener("click", () => {
    instructionCard.style.transform = "scale(0)";
    instructionCard.style.width = "0%";
    startBtn.style.transform = "scale(1)";
    startBtn.style.width = "100%";
});

startQuizBtn.addEventListener("click", () => {
    if (!loadActiveQuiz()) return;
    
    wrapper.style.transform = "scale(1)";
    wrapper.style.width = "100%";
    instructionCard.style.transform = "scale(0)";
    instructionCard.style.width = "0%";
    startQuiz();
});

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
    if (!loadActiveQuiz()) return;
    
    // Start the quiz
    displayQuestion(currentQuestion);
    startTimer();
});

function displayQuestion(questionIndex) {
    const question = activeQuiz.questions[questionIndex];
    document.getElementById('questionText').textContent = question.text;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    Object.entries(question.options).forEach(([key, value]) => {
        const option = document.createElement('div');
        option.className = 'option p-4 border rounded-lg cursor-pointer';
        option.textContent = `${key}. ${value}`;
        option.onclick = () => checkAnswer(key);
        optionsContainer.appendChild(option);
    });
    
    updateProgress();
}

function checkAnswer(selectedKey) {
    const question = activeQuiz.questions[currentQuestion];
    attemptQuestion++;
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.style.pointerEvents = 'none');
    
    // Clear timer
    clearInterval(timer);
    
    if (selectedKey === question.correctAnswer) {
        score++;
        const selectedOption = document.querySelector(`.option:nth-child(${Object.keys(question.options).indexOf(selectedKey) + 1})`);
        selectedOption.classList.add('correct');
    } else {
        wrongQuestion++;
        const selectedOption = document.querySelector(`.option:nth-child(${Object.keys(question.options).indexOf(selectedKey) + 1})`);
        selectedOption.classList.add('wrong');
        
        // Show correct answer
        const correctOption = document.querySelector(`.option:nth-child(${Object.keys(question.options).indexOf(question.correctAnswer) + 1})`);
        correctOption.classList.add('correct');
    }
    
    userAnswers[currentQuestion] = selectedKey;
}

function nextQuestion() {
    if (userAnswers[currentQuestion] === undefined) {
        unattemptedQuestion++;
    }
    
    if (currentQuestion === activeQuiz.questions.length - 1) {
        endQuiz();
    } else {
        currentQuestion++;
        document.getElementById('currentQuestion').textContent = currentQuestion + 1;
        displayQuestion(currentQuestion);
        startTimer();
    }
}

function startTimer() {
    let timeLeft = 15; // 15 seconds per question
    document.getElementById('timer').textContent = timeLeft;
    
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            unattemptedQuestion++;
            nextQuestion();
        }
    }, 1000);
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / activeQuiz.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function endQuiz() {
    clearInterval(timer);
    
    // Get current user
    const user = utils.safeGetItem('currentUser', {});
    if (!user || !user.email) {
        console.error('No user found in session');
        return;
    }

    // Calculate percentage score
    const percentageScore = (score / activeQuiz.questions.length) * 100;
    
    // Save progress and result
    if (utils.saveProgress(user.email, activeQuiz.id, score, activeQuiz.questions.length) &&
        utils.saveStudentResult(user.email, activeQuiz.id, percentageScore)) {
        console.log('Quiz results saved successfully');
    } else {
        console.error('Error saving quiz results');
    }

    // Show results
    document.getElementById('scoreDisplay').textContent = `${score}/${activeQuiz.questions.length}`;
    document.getElementById('attemptedDisplay').textContent = attemptQuestion;
    document.getElementById('unattemptedDisplay').textContent = unattemptedQuestion;
    document.getElementById('wrongDisplay').textContent = wrongQuestion;

    // Show previous attempts
    const previousScores = document.getElementById('previousScores');
    const progress = utils.getProgress(user.email, activeQuiz.id);
    if (progress.length > 1) {
        previousScores.innerHTML = progress
            .slice(0, -1)
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

nxtBtn.addEventListener("click", nextQuestion);



totalQuestion.innerHTML = questions.length
currentQuestionNum.innerHTML=currentQuestion + 1


  