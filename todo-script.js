// Local Storage Key
const STORAGE_KEY = 'fivem_tasks';

// State
let tasks = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    checkThemePreference();
    renderTasks();
    updateStats();
});

// Load Tasks from Local Storage
function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            tasks = JSON.parse(saved);
        } catch (error) {
            console.error('Error loading tasks:', error);
            tasks = [];
        }
    }
}

// Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add Task
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();

    if (!taskText) {
        showNotification('الرجاء إدخال مهمة', 'warning');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: 'low',
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    input.value = '';
    renderTasks();
    updateStats();
    showNotification('✅ تمت إضافة المهمة بنجاح', 'success');
}

// Handle Enter Key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addTask();
    }
}

// Toggle Task Completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    showNotification('🗑️ تم حذف المهمة', 'success');
}

// Clear Completed Tasks
function clearCompleted() {
    const completedCount = tasks.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('لا توجد مهام منجزة للحذف', 'warning');
        return;
    }

    if (confirm(`هل تريد حذف ${completedCount} مهمة منجزة؟`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('✅ تم حذف المهام المنجزة', 'success');
    }
}

// Clear All Tasks
function clearAll() {
    if (tasks.length === 0) {
        showNotification('لا توجد مهام للحذف', 'warning');
        return;
    }

    if (confirm(`هل تريد حذف جميع المهام (${tasks.length})؟`)) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
        showNotification('🗑️ تم حذف جميع المهام', 'success');
    }
}

// Filter Tasks
function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// Get Filtered Tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Render Tasks
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        tasksList.innerHTML = `
            <li class="empty-state">
                <p>📭 لا توجد مهام</p>
                <p class="small">
                    ${currentFilter === 'completed' ? 'لم تنجز أي مهام بعد' : 
                      currentFilter === 'active' ? 'لا توجد مهام قيد الانتظار' : 
                      'أضف مهمة جديدة للبدء'}
                </p>
            </li>
        `;
        return;
    }

    tasksList.innerHTML = filtered.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</span>
            <button class="btn-delete" onclick="deleteTask(${task.id})">❌</button>
        </li>
    `).join('');
}

// Update Statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent = pending;
}

// Get Priority Text
function getPriorityText(priority) {
    const texts = {
        'high': 'عالية',
        'medium': 'متوسطة',
        'low': 'منخفضة'
    };
    return texts[priority] || 'منخفضة';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Toggle Theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    showNotification(isDarkMode ? '🌙 الوضع الليلي' : '☀️ الوضع النهاري', 'info');
}

// Check Theme Preference
function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
        document.body.classList.add('dark-mode');
    }
}

// Export Tasks (Bonus)
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('✅ تم تصدير المهام', 'success');
}

// Import Tasks (Bonus)
function importTasks(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                tasks = imported;
                saveTasks();
                renderTasks();
                updateStats();
                showNotification('✅ تم استيراد المهام بنجاح', 'success');
            }
        } catch (error) {
            showNotification('❌ خطأ في استيراد الملف', 'error');
        }
    };
    reader.readAsText(file);
}
