// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
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
function addQuestion(question) {
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
                        value="${question?.text || ''}"
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
                            value="${question?.options?.A || ''}"
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
                            value="${question?.options?.B || ''}"
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
                            value="${question?.options?.C || ''}"
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
                            value="${question?.options?.D || ''}"
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
                        <option value="A" ${question?.correctAnswer === 'A' ? 'selected' : ''}>Option A</option>
                        <option value="B" ${question?.correctAnswer === 'B' ? 'selected' : ''}>Option B</option>
                        <option value="C" ${question?.correctAnswer === 'C' ? 'selected' : ''}>Option C</option>
                        <option value="D" ${question?.correctAnswer === 'D' ? 'selected' : ''}>Option D</option>
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

// Save quiz to localStorage
function saveQuiz(quiz) {
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    quizzes.push(quiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    return true;
}

// Display teacher's quizzes
function displayQuizzes() {
    if (!checkTeacherAccess()) return;

    const quizList = document.getElementById('quizList');
    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const currentUserEmail = JSON.parse(localStorage.getItem('currentUser')).email;

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

    quizList.innerHTML = teacherQuizzes.map(quiz => {
        const participations = JSON.parse(localStorage.getItem(`quiz_participations_${quiz.id}`)) || [];
        const comments = JSON.parse(localStorage.getItem(`quiz_comments_${quiz.id}`)) || [];
        
        // Get student scores for this quiz
        const studentScores = participations.map(studentEmail => {
            const progress = JSON.parse(localStorage.getItem(`quiz_progress_${studentEmail}_${quiz.id}`)) || [];
            const bestScore = progress.length > 0 ? Math.max(...progress.map(attempt => attempt.score)) : 0;
            return {
                email: studentEmail,
                bestScore: bestScore,
                totalQuestions: quiz.questions.length,
                lastAttempt: progress.length > 0 ? new Date(progress[progress.length - 1].date).toLocaleDateString() : 'N/A'
            };
        });

        return `
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${quiz.title}</h3>
            <div class="space-y-2 text-sm text-gray-600 mb-4">
                <p>Questions: ${quiz.questions.length}</p>
                <p>Time Limit: ${quiz.timeLimit} minutes</p>
                <p>Created: ${new Date(quiz.createdAt).toLocaleDateString()}</p>
                <p class="text-blue-600">Participants: ${participations.length}</p>
            </div>
            
            <!-- Student Participation Section -->
            <div class="mt-4 border-t pt-4">
                <h4 class="font-medium text-gray-900 mb-2">Student Participation Details</h4>
                <div class="space-y-2 max-h-60 overflow-y-auto mb-3">
                    ${studentScores.length > 0 ? `
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Email</th>
                                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Score</th>
                                    <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Attempt</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${studentScores.map(student => `
                                    <tr>
                                        <td class="px-3 py-2 text-sm text-gray-900">${student.email}</td>
                                        <td class="px-3 py-2 text-sm text-gray-900">${student.bestScore}/${student.totalQuestions}</td>
                                        <td class="px-3 py-2 text-sm text-gray-900">${student.lastAttempt}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p class="text-sm text-gray-500">No students have participated yet</p>'}
                </div>
            </div>
            
            <!-- Comments Section -->
            <div class="mt-4 border-t pt-4">
                <h4 class="font-medium text-gray-900 mb-2">Comments</h4>
                <div class="space-y-2 max-h-40 overflow-y-auto mb-3">
                    ${comments.length > 0 ? comments.map(comment => `
                        <div class="bg-white p-2 rounded">
                            <p class="text-sm text-gray-600">${comment.text}</p>
                            <p class="text-xs text-gray-500">By ${comment.author} on ${new Date(comment.timestamp).toLocaleDateString()}</p>
                        </div>
                    `).join('') : '<p class="text-sm text-gray-500">No comments yet</p>'}
                </div>
                
                <!-- Add Comment Form -->
                <div class="mt-2">
                    <textarea 
                        id="comment_${quiz.id}"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a comment..."
                        rows="2"
                    ></textarea>
                    <button 
                        onclick="addComment(${quiz.id})"
                        class="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    >
                        Add Comment
                    </button>
                </div>
            </div>

            <div class="mt-6 flex gap-3">
                <button 
                    onclick="editQuiz(${quiz.id})"
                    class="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Edit Quiz</span>
                </button>
                <button 
                    onclick="deleteQuiz(${quiz.id})"
                    class="flex-1 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>Delete Quiz</span>
                </button>
            </div>
        </div>
    `}).join('');
}

// Edit quiz function
function editQuiz(quizId) {
    if (!checkTeacherAccess()) return;

    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
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
        addQuestion(q);
    });

    // Show modal
    showCreateQuizModal();
}

// Delete quiz function
function deleteQuiz(quizId) {
    if (!checkTeacherAccess()) return;

    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        return;
    }

    const quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
    localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));

    showToast('Quiz deleted successfully');
    displayQuizzes(); // Refresh the list
}

// Check teacher access
function checkTeacherAccess() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'teacher') {
        alert('Access denied. This page is for teachers only.');
        window.location.href = 'dashboard.html';
        return false;
    }
    return true;
}

// Initialize variables
let questionCount = 0;

// Create quiz function
function createQuiz(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitQuizBtn');
    const loadingIcon = document.getElementById('submitLoadingIcon');
    const submitText = submitBtn.querySelector('span');
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        loadingIcon.classList.remove('hidden');
        submitText.textContent = 'Creating...';
        
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
            createdBy: JSON.parse(localStorage.getItem('currentUser')).email
        };

        // Save quiz
        if (saveQuiz(quiz)) {
            // Show success message
            showToast('Quiz created successfully!');
            
            // Reset form and hide modal
            document.getElementById('createQuizForm').reset();
            questionsContainer.innerHTML = '';
            hideCreateQuizModal();
            displayQuizzes(); // Refresh quiz list
        } else {
            alert('Error saving quiz. Please try again.');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        loadingIcon.classList.add('hidden');
        submitText.textContent = 'Create Quiz';
    }
}

// Add comment to a quiz
function addComment(quizId) {
    const commentText = document.getElementById(`comment_${quizId}`).value.trim();
    if (!commentText) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const comments = JSON.parse(localStorage.getItem(`quiz_comments_${quizId}`)) || [];
    
    comments.push({
        text: commentText,
        author: currentUser.email,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem(`quiz_comments_${quizId}`, JSON.stringify(comments));
    document.getElementById(`comment_${quizId}`).value = '';
    displayQuizzes(); // Refresh the display
}

// Add event listener for save button
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('saveQuizBtn');
    if (saveButton) {
        saveButton.addEventListener('click', createQuiz);
    }

    // Display quizzes on page load
    displayQuizzes();
});

// Add search functionality
document.getElementById('searchQuiz').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const quizCards = document.querySelectorAll('.quiz-card');
    
    quizCards.forEach(card => {
        const title = card.querySelector('.quiz-title').textContent.toLowerCase();
        const description = card.querySelector('.quiz-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`;
    toast.innerHTML = `
        <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 ${type === 'success' ? 'text-green-500' : 'text-red-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}"></path>
            </svg>
            <p>${message}</p>
        </div>
    `;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(full)';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}