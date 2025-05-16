// Dummy data for demonstration
const dummyData = {
    users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'teacher' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'student' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'teacher' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'student' },
        { id: 5, name: 'Admin User', email: 'admin@example.com', role: 'admin' }
    ],
    quizzes: [
        { id: 1, title: 'Math Quiz', createdBy: 'John Doe', totalQuestions: 10 },
        { id: 2, title: 'Science Quiz', createdBy: 'Mike Johnson', totalQuestions: 15 },
        { id: 3, title: 'History Quiz', createdBy: 'John Doe', totalQuestions: 12 }
    ]
};

// Dashboard statistics
function updateDashboardStats() {
    const totalUsers = dummyData.users.length;
    const totalTeachers = dummyData.users.filter(user => user.role === 'teacher').length;
    const totalStudents = dummyData.users.filter(user => user.role === 'student').length;
    const totalQuizzes = dummyData.quizzes.length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalTeachers').textContent = totalTeachers;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalQuizzes').textContent = totalQuizzes;
}

// User management functions
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    dummyData.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${user.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}">
                    ${user.role}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editUser(${user.id})" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button onclick="deleteUser(${user.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editUser(userId) {
    const user = dummyData.users.find(u => u.id === userId);
    if (!user) return;

    // Populate edit modal
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserId').value = user.id;

    // Show modal
    document.getElementById('editUserModal').classList.remove('hidden');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        dummyData.users = dummyData.users.filter(user => user.id !== userId);
        displayUsers();
        updateDashboardStats();
    }
}

// Quiz management functions
function displayQuizzes() {
    const tbody = document.getElementById('quizzesTableBody');
    tbody.innerHTML = '';

    dummyData.quizzes.forEach(quiz => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${quiz.title}</td>
            <td class="px-6 py-4 whitespace-nowrap">${quiz.createdBy}</td>
            <td class="px-6 py-4 whitespace-nowrap">${quiz.totalQuestions}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="deleteQuiz(${quiz.id})" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        dummyData.quizzes = dummyData.quizzes.filter(quiz => quiz.id !== quizId);
        displayQuizzes();
        updateDashboardStats();
    }
}

// Add User Modal functions
function showAddUserModal() {
    document.getElementById('addUserModal').classList.remove('hidden');
}

function hideAddUserModal() {
    document.getElementById('addUserModal').classList.add('hidden');
    document.getElementById('addUserForm').reset();
}

// Add new user form submission
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('newUserName').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role = document.getElementById('newUserRole').value;
    
    if (!name || !email || !role) {
        alert('Please fill in all fields');
        return;
    }

    // Check if email already exists
    if (dummyData.users.some(user => user.email === email)) {
        alert('A user with this email already exists');
        return;
    }

    // Add new user
    const newUser = {
        id: dummyData.users.length + 1,
        name,
        email,
        role
    };

    dummyData.users.push(newUser);
    
    // Update UI
    displayUsers();
    updateDashboardStats();
    hideAddUserModal();
    
    alert('User added successfully!');
});

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    updateDashboardStats();
    displayUsers();
    displayQuizzes();
}); 