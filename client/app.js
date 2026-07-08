// Configuration
const API_URL = 'http://localhost:5000/api';
const socket = io('http://localhost:5000');

// State
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const logoutBtn = document.querySelector('.logout-btn');
const pageTitle = document.getElementById('page-title');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadDashboard();
    setupPageNavigation();
});

// Event Listeners
function setupEventListeners() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });

    logoutBtn.addEventListener('click', logout);
}

// Navigation
function setupPageNavigation() {
    const pageNames = {
        dashboard: 'لوحة التحكم',
        players: 'اللاعبون',
        server: 'إعدادات السيرفر',
        resources: 'الموارد',
        logs: 'السجلات'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show page
            showPage(page);
            
            // Update title
            pageTitle.textContent = pageNames[page];
        });
    });
}

function showPage(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }

    // Load page specific data
    switch(pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'players':
            loadPlayers();
            break;
        case 'server':
            loadServerStats();
            break;
        case 'resources':
            loadResources();
            break;
    }
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Dashboard
async function loadDashboard() {
    // Load server info
    const serverInfo = await apiCall('/server/info');
    if (serverInfo) {
        document.getElementById('player-count').textContent = serverInfo.players;
        document.getElementById('uptime').textContent = serverInfo.uptime;
        document.getElementById('fps').textContent = serverInfo.fps;
        document.getElementById('server-status').textContent = serverInfo.status;
    }

    // Load resources
    const resources = await apiCall('/server/resources');
    if (resources) {
        const resourcesList = document.getElementById('resources-list');
        resourcesList.innerHTML = resources.resources.map(r => `
            <div class="resource-item">
                <span>${r.name}</span>
                <span class="status ${r.status === 'started' ? 'active' : ''}">${r.status}</span>
            </div>
        `).join('');
    }
}

// Players
async function loadPlayers() {
    const response = await apiCall('/players');
    if (response) {
        const tbody = document.getElementById('players-tbody');
        tbody.innerHTML = response.players.map(player => `
            <tr>
                <td>${player.id}</td>
                <td>${player.name}</td>
                <td>${player.level}</td>
                <td>${player.playtime} دقيقة</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn kick" onclick="kickPlayer(${player.id})">طرد</button>
                        <button class="action-btn ban" onclick="banPlayer(${player.id})">بان</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function kickPlayer(playerId) {
    const reason = prompt('السبب:');
    if (reason) {
        apiCall(`/players/${playerId}/kick`, 'POST', { reason });
        alert('تم طرد اللاعب');
        loadPlayers();
    }
}

function banPlayer(playerId) {
    const reason = prompt('السبب:');
    const duration = prompt('المدة (ساعات):');
    if (reason && duration) {
        apiCall(`/players/${playerId}/ban`, 'POST', { reason, duration });
        alert('تم بان اللاعب');
        loadPlayers();
    }
}

// Server Stats
async function loadServerStats() {
    const stats = await apiCall('/server/stats');
    if (stats) {
        const memoryPercent = Math.round(stats.memory);
        const cpuPercent = Math.round(stats.cpu);
        
        document.getElementById('memory-progress').style.width = memoryPercent + '%';
        document.getElementById('memory-percent').textContent = memoryPercent + '%';
        
        document.getElementById('cpu-progress').style.width = cpuPercent + '%';
        document.getElementById('cpu-percent').textContent = cpuPercent + '%';
    }
}

// Resources
async function loadResources() {
    const response = await apiCall('/server/resources');
    if (response) {
        const container = document.getElementById('resources-management');
        container.innerHTML = response.resources.map(resource => `
            <div class="resource-card">
                <h4>${resource.name}</h4>
                <div class="status ${resource.status}">${resource.status}</div>
                <div class="controls">
                    <button class="btn btn-success" onclick="startResource('${resource.name}')">تشغيل</button>
                    <button class="btn btn-danger" onclick="stopResource('${resource.name}')">إيقاف</button>
                </div>
            </div>
        `).join('');
    }
}

function startResource(name) {
    apiCall(`/server/resources/${name}/start`, 'POST');
    alert(`تم تشغيل ${name}`);
    loadResources();
}

function stopResource(name) {
    apiCall(`/server/resources/${name}/stop`, 'POST');
    alert(`تم إيقاف ${name}`);
    loadResources();
}

// Authentication
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    window.location.href = 'login.html';
}

// Socket.IO Events
socket.on('connect', () => {
    console.log('✅ Connected to server');
});

socket.on('players-update', (data) => {
    console.log('👥 Players update:', data);
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

// Auto-refresh dashboard every 10 seconds
setInterval(() => {
    if (document.getElementById('dashboard').classList.contains('active')) {
        loadDashboard();
    }
}, 10000);