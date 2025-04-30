// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth("teacher");
});

// Show create quiz modal
function showCreateQuizModal() {
    if (!checkTeacherAccess()) return;
    const modal = document.getElementById('createQuizModal');
    modal.classList.remove('hidden');
    document.getElementById('createQuizForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    document.getElementById('successMessage').classList.add('hidden');
    questionCount = 0;
    addQuestion(); // Add first question by default
}

// Hide create quiz modal
function hideCreateQuizModal() {
    const modal = document.getElementById('createQuizModal');
    modal.classList.add('hidden');
    document.getElementById('createQuizForm').reset();
    document.getElementById('questionsContainer').innerHTML = '';
    document.getElementById('successMessage').classList.add('hidden');
    questionCount = 0;
}

// Add new question fields
function addQuestion() {
    questionCount++;
    const questionHtml = `
        <div class="question-block border-t pt-4 mt-4">
            <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-gray-900">Question ${questionCount}</h4>
                ${questionCount > 1 ? `
                    <button 
                        type="button"
                        onclick="removeQuestion(this)"
                        class="text-red-600 hover:text-red-700"
                    >
                        Remove
                    </button>
                ` : ''}
            </div>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                    <input 
                        type="text" 
                        name="question" 
                        required 
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your question"
                    >
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Option A</label>
                        <input 
                            type="text" 
                            name="optionA" 
                            required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter option A"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Option B</label>
                        <input 
                            type="text" 
                            name="optionB" 
                            required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter option B"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Option C</label>
                        <input 
                            type="text" 
                            name="optionC" 
                            required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter option C"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Option D</label>
                        <input 
                            type="text" 
                            name="optionD" 
                            required 
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Enter option D"
                        >
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                    <select 
                        name="correctAnswer" 
                        required
                        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                        <option value="">Select correct answer</option>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHtml);
}

// Remove question
function removeQuestion(button) {
    button.closest('.question-block').remove();
    questionCount--;
    updateQuestionNumbers();
}

// Update question numbers
function updateQuestionNumbers() {
    const questions = document.querySelectorAll('.question-block');
    questions.forEach((question, index) => {
        question.querySelector('h4').textContent = `Question ${index + 1}`;
    });
    questionCount = questions.length;
}

// Display teacher's quizzes
function displayQuizzes() {
    if (!checkTeacherAccess()) return;
    
    const quizList = document.getElementById('quizList');
    const quizzes = utils.safeGetItem('quizzes', []);
    const currentUserEmail = utils.safeGetItem('currentUser', {}).email;
    
    // Filter quizzes created by this teacher
    const teacherQuizzes = quizzes.filter(quiz => quiz.createdBy === currentUserEmail);
    
    if (teacherQuizzes.length === 0) {
        quizList.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-600">You haven't created any quizzes yet.</p>
            </div>
        `;
        return;
    }

    quizList.innerHTML = teacherQuizzes.map(quiz => `
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <p>Questions: ${quiz.questions.length}</p>
                <p>Time Limit: ${quiz.timeLimit} minutes</p>
                <p>Created: ${new Date(quiz.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="space-y-4">
                ${quiz.questions.map((q, index) => `
                    <div class="border-t pt-2">
                        <p class="font-medium">Q${index + 1}: ${q.text}</p>
                        <p class="text-green-600">Correct Answer: ${q.correctAnswer}</p>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 flex gap-2">
                <button 
                    onclick="editQuiz(${quiz.id})"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Edit Quiz
                </button>
                <button 
                    onclick="deleteQuiz(${quiz.id})"
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Delete Quiz
                </button>
            </div>
        </div>
    `).join('');
}

// Edit quiz function
function editQuiz(quizId) {
    if (!checkTeacherAccess()) return;
    
    const quizzes = utils.safeGetItem('quizzes', []);
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
        alert('Quiz not found!');
        return;
    }

    // Populate form with quiz data
    document.getElementById('quizTitle').value = quiz.title;
    document.getElementById('timeLimit').value = quiz.timeLimit;
    
    // Clear existing questions
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    // Add questions
    quiz.questions.forEach((q, index) => {
        addQuestion();
        const questionBlock = questionsContainer.lastElementChild;
        
        questionBlock.querySelector('[name="question"]').value = q.text;
        questionBlock.querySelector('[name="optionA"]').value = q.options.A;
        questionBlock.querySelector('[name="optionB"]').value = q.options.B;
        questionBlock.querySelector('[name="optionC"]').value = q.options.C;
        questionBlock.querySelector('[name="optionD"]').value = q.options.D;
        questionBlock.querySelector('[name="correctAnswer"]').value = q.correctAnswer;
    });

    // Show modal
    showCreateQuizModal();
}

// Delete quiz function
function deleteQuiz(quizId) {
    if (!checkTeacherAccess()) return;
    
    if (!confirm('Are you sure you want to delete this quiz?')) {
        return;
    }

    if (utils.deleteQuiz(quizId)) {
        displayQuizzes(); // Refresh the list
    } else {
        alert('Error deleting quiz!');
    }
}

// Check teacher access
function checkTeacherAccess() {
    const user = utils.safeGetItem('currentUser');
    if (!user || user.role !== 'teacher') {
        alert('Access denied. This page is for teachers only.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize variables
let questionCount = 0;

// Create quiz function
function createQuiz() {
    if (!checkTeacherAccess()) return;

    // Get form elements
    const titleInput = document.getElementById('quizTitle');
    const timeInput = document.getElementById('timeLimit');
    const questionsContainer = document.getElementById('questionsContainer');

    // Validate inputs
    if (!titleInput.value.trim()) {
        alert('Please enter a quiz title');
        return;
    }

    if (!timeInput.value || timeInput.value < 1) {
        alert('Please enter a valid time limit (minimum 1 minute)');
        return;
    }

    // Collect questions
    const questions = [];
    const questionBlocks = questionsContainer.getElementsByClassName('question-block');

    if (questionBlocks.length === 0) {
        alert('Please add at least one question');
        return;
    }

    for (let block of questionBlocks) {
        const questionText = block.querySelector('[name="question"]').value.trim();
        const optionA = block.querySelector('[name="optionA"]').value.trim();
        const optionB = block.querySelector('[name="optionB"]').value.trim();
        const optionC = block.querySelector('[name="optionC"]').value.trim();
        const optionD = block.querySelector('[name="optionD"]').value.trim();
        const correctAnswer = block.querySelector('[name="correctAnswer"]').value;

        // Validate question inputs
        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            alert('Please fill in all fields for all questions');
            return;
        }

        questions.push({
            text: questionText,
            options: {
                A: optionA,
                B: optionB,
                C: optionC,
                D: optionD
            },
            correctAnswer: correctAnswer
        });
    }

    // Create quiz object
    const quiz = {
        id: Date.now(),
        title: titleInput.value.trim(),
        timeLimit: parseInt(timeInput.value),
        questions: questions,
        createdAt: new Date().toISOString(),
        createdBy: utils.safeGetItem('currentUser', {}).email
    };

    // Save quiz using utils function
    if (utils.saveQuiz(quiz)) {
        // Show success message
        const successMessage = document.getElementById('successMessage');
        successMessage.textContent = 'Quiz created successfully!';
        successMessage.classList.remove('hidden');

        // Clear form and hide modal after 2 seconds
        setTimeout(() => {
            document.getElementById('createQuizForm').reset();
            questionsContainer.innerHTML = '';
            hideCreateQuizModal();
            displayQuizzes(); // Refresh quiz list
        }, 2000);
    } else {
        alert('Error saving quiz. Please try again.');
    }
}

// Add event listener for save button
document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveQuizBtn');
    if (saveButton) {
        saveButton.addEventListener('click', createQuiz);
    }
}); 