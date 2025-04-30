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
let timer,
  progressInterval,
  width = 1,
  score = 0,
  attemptQuestion = 0,
  unattemptedQuestion = 0,
  wrongQuestion = 0,
  activeQuiz = null;

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

    // Set total questions count
    totalQuestion.innerHTML = activeQuiz.questions.length;
    currentQuestionNum.innerHTML = currentQuestion + 1;
    
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

function startQuiz() {
    // Display the first question and its options
    displayQuestion(currentQuestion);

    // Start the timer
    timer = setInterval(updateTimer, 1000);

    // Update the progress bar
    updateProgress();
}

function displayQuestion(questionIndex) {
    updateProgress();
    
    // Get the question and options from the active quiz
    let question = activeQuiz.questions[questionIndex].text;
    let options = Object.values(activeQuiz.questions[questionIndex].options);

    // Display the question and options in their respective containers
    questionEl.innerHTML = question;
    answerContainer.innerHTML = '';

    for (let i = 0; i < options.length; i++) {
        let option = `<option onclick="checkAnswer(${i})">${options[i]}</option>`;
        answerContainer.insertAdjacentHTML("beforeend", option);
    }
}

function checkAnswer(selectedIndex) {
    attemptQuestion++;
    answerContainer.style.pointerEvents = "none";
    clearInterval(timer);
    
    let selectedAnswer = activeQuiz.questions[currentQuestion].options[Object.keys(activeQuiz.questions[currentQuestion].options)[selectedIndex]];
    let correctAnswer = activeQuiz.questions[currentQuestion].options[activeQuiz.questions[currentQuestion].correctAnswer];

    if (selectedAnswer === correctAnswer) {
        score++;
        setTimeout(() => {
            document.querySelectorAll("option")[selectedIndex].style.backgroundColor = "#37BB1169";
            document.querySelectorAll("option")[selectedIndex].style.color = "#fff";
            document.querySelectorAll("option")[selectedIndex].style.borderColor = "green";
        }, 100);

        userAnswers[currentQuestion] = selectedIndex;
    } else {
        wrongQuestion++;
        setTimeout(() => {
            document.querySelectorAll("option")[selectedIndex].style.backgroundColor = "#B6141469";
            document.querySelectorAll("option")[selectedIndex].style.color = "#fff";
            document.querySelectorAll("option")[selectedIndex].style.borderColor = "red";
            
            // Show correct answer
            const correctIndex = Object.keys(activeQuiz.questions[currentQuestion].options).indexOf(activeQuiz.questions[currentQuestion].correctAnswer);
            document.querySelectorAll("option")[correctIndex].style.backgroundColor = "#37BB1169";
            document.querySelectorAll("option")[correctIndex].style.color = "#fff";
            document.querySelectorAll("option")[correctIndex].style.borderColor = "green";
        }, 100);
    }
}

function nextQuestion() {
    answerContainer.style.pointerEvents = "initial";
    time.innerHTML = "15";
    updateProgress();
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    answerContainer.innerHTML = "";

    if (userAnswers[currentQuestion] === undefined) {
        unattemptedQuestion++;
    }

    if (currentQuestion === activeQuiz.questions.length - 1) {
        resultCard.style.width = "300px";
        resultCard.style.transform = "scale(1)";
        totalScore.innerHTML = activeQuiz.questions.length;
        yourScore.innerHTML = score;
        attempted.innerHTML = attemptQuestion;
        unattempted.innerHTML = unattemptedQuestion;
        wrong.innerHTML = wrongQuestion;
        wrapper.style.width = "0";
        wrapper.style.transform = "scale(0)";
        endQuiz();
    } else {
        currentQuestion++;
        currentQuestionNum.innerHTML = currentQuestion + 1;
        displayQuestion(currentQuestion);
    }
}

function updateTimer() {
    let remainingTime = parseInt(time.innerHTML) - 1;
    time.innerHTML = remainingTime > 9 ? remainingTime : "0" + remainingTime;

    if (remainingTime === 0) {
        unattemptedQuestion++;
        const correctIndex = Object.keys(activeQuiz.questions[currentQuestion].options).indexOf(activeQuiz.questions[currentQuestion].correctAnswer);
        document.querySelectorAll("option")[correctIndex].style.backgroundColor = "#37BB1169";
        document.querySelectorAll("option")[correctIndex].style.color = "#fff";
        document.querySelectorAll("option")[correctIndex].style.borderColor = "green";
        answerContainer.style.pointerEvents = "none";
        endQuiz();
    }
}

function updateProgress() {
    progressBar.style.width = ((currentQuestion + 1) / activeQuiz.questions.length * 100) + "%";
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
}

nxtBtn.addEventListener("click", nextQuestion);



totalQuestion.innerHTML = questions.length
currentQuestionNum.innerHTML=currentQuestion + 1


  