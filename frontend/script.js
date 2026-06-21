// State variables
let appData = {
    summary: {
        total_fetched: 0,
        spam_filtered: 0,
        category_counts: {
            question: 0,
            positive: 0,
            complaint: 0,
            funny: 0,
            other: 0
        }
    },
    worth_replying: [],
    all_comments: []
};

let activeTab = 'dashboard'; // 'dashboard', 'worth-replying', 'all-comments'
let activeFilter = 'all';

// Dynamic backend URL resolution (uses localhost/127.0.0.1 for local dev, relative for Hugging Face)
const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? (window.location.port === '8001' ? '' : 'http://localhost:8001')
    : '';

// DOM Elements
const welcomeView = document.getElementById('welcome-view');
const loadingView = document.getElementById('loading-view');
const errorView = document.getElementById('error-view');
const resultsView = document.getElementById('results-view');
const urlForm = document.getElementById('url-form');
const videoUrlInput = document.getElementById('video-url');
const loadingStatus = document.getElementById('loading-status');
const commentsListContainer = document.getElementById('comments-list-container');
const filterControls = document.getElementById('filter-controls');
const sectionTitle = document.getElementById('section-title');

// Sidebar Tabs
const navButtons = document.querySelectorAll('.nav-btn');
const tabSections = document.querySelectorAll('.tab-content');
const badgeWorthReplying = document.getElementById('badge-worth-replying');

// Statistics Elements
const statTotal = document.getElementById('stat-total');
const statSpam = document.getElementById('stat-spam');
const statWorth = document.getElementById('stat-worth');
const categoryBarsContainer = document.getElementById('category-bars');

// Filter counts elements
const cntAll = document.getElementById('cnt-all');
const cntQuestion = document.getElementById('cnt-question');
const cntPositive = document.getElementById('cnt-positive');
const cntComplaint = document.getElementById('cnt-complaint');
const cntFunny = document.getElementById('cnt-funny');
const cntOther = document.getElementById('cnt-other');

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // URL Form Submission
    urlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = videoUrlInput.value.trim();
        if (url) {
            analyzeVideo(url);
        }
    });

    // Examples Buttons
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            videoUrlInput.value = url;
            analyzeVideo(url);
        });
    });

    // Navigation Tabs Switching
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Category Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter');
            renderCommentsList();
        });
    });
});

// Switch Sidebar tabs
function switchTab(tabId) {
    activeTab = tabId;
    
    // Update active class on buttons
    navButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (tabId === 'dashboard') {
        document.getElementById('dashboard-section').classList.add('active');
        document.getElementById('comments-section').classList.remove('active');
    } else {
        document.getElementById('dashboard-section').classList.remove('active');
        document.getElementById('comments-section').classList.add('active');
        
        // Reset category filter on comments section change
        resetFilters();
        
        if (tabId === 'worth-replying') {
            sectionTitle.textContent = 'Top Worth Replying Comments';
            // Show only relevant filter categories if any
            renderCommentsList();
        } else if (tabId === 'all-comments') {
            sectionTitle.textContent = 'All Categorized Comments';
            renderCommentsList();
        }
    }
}

function resetFilters() {
    activeFilter = 'all';
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Call backend comments endpoint
async function analyzeVideo(url) {
    // Show loading
    welcomeView.classList.add('hidden');
    resultsView.classList.add('hidden');
    errorView.classList.add('hidden');
    loadingView.classList.remove('hidden');
    
    loadingStatus.textContent = "Connecting to API key & fetching comments from YouTube...";
    
    const limit = 200;
    
    try {
        const response = await fetch(`${BACKEND_URL}/comments?video_url=${encodeURIComponent(url)}&limit=${limit}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Save state
        appData = data;
        
        // Hide loading and show results
        loadingView.classList.add('hidden');
        resultsView.classList.remove('hidden');
        
        // Update DOM elements
        updateDashboard();
        switchTab('dashboard'); // start on dashboard view
        
    } catch (error) {
        console.error("Error fetching comments:", error);
        loadingView.classList.add('hidden');
        errorView.classList.remove('hidden');
        document.getElementById('error-message').textContent = `Could not analyze video: ${error.message}. Please check if the FastAPI backend is running at ${BACKEND_URL} and your internet connection is active.`;
    }
}

// Update all statistic items
function updateDashboard() {
    // Overview Metrics
    statTotal.textContent = appData.summary.total_fetched || 0;
    statSpam.textContent = appData.summary.spam_filtered || 0;
    
    const worthCount = appData.worth_replying ? appData.worth_replying.length : 0;
    statWorth.textContent = worthCount;
    badgeWorthReplying.textContent = worthCount;
    badgeWorthReplying.style.display = worthCount > 0 ? 'inline-block' : 'none';
    
    // Category distribution bars
    categoryBarsContainer.innerHTML = '';
    const counts = appData.summary.category_counts;
    const totalProcessed = appData.all_comments ? appData.all_comments.length : 1;
    
    // Render progress bars
    const categories = [
        { key: 'question', name: 'Questions', color: 'var(--color-question)' },
        { key: 'positive', name: 'Positive Support', color: 'var(--color-positive)' },
        { key: 'complaint', name: 'Complaints', color: 'var(--color-complaint)' },
        { key: 'funny', name: 'Funny / Jokes', color: 'var(--color-funny)' },
        { key: 'other', name: 'Other', color: 'var(--color-other)' }
    ];
    
    categories.forEach(cat => {
        const count = counts[cat.key] || 0;
        const percentage = Math.round((count / totalProcessed) * 100) || 0;
        
        const barHtml = `
            <div class="cat-bar-item">
                <div class="cat-info">
                    <span class="cat-label"><i class="fa-solid ${getCategoryIcon(cat.key)}" style="color: ${cat.color}"></i> ${cat.name}</span>
                    <span class="cat-count"><strong>${count}</strong> (${percentage}%)</span>
                </div>
                <div class="progress-track">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${cat.color}"></div>
                </div>
            </div>
        `;
        categoryBarsContainer.insertAdjacentHTML('beforeend', barHtml);
    });
}

// Helper icons mapping
function getCategoryIcon(category) {
    switch (category) {
        case 'question': return 'fa-question';
        case 'positive': return 'fa-heart';
        case 'complaint': return 'fa-circle-exclamation';
        case 'funny': return 'fa-face-laugh';
        default: return 'fa-comments';
    }
}

// Render filtered lists of comments
function renderCommentsList() {
    commentsListContainer.innerHTML = '';
    
    // Determine which dataset to use
    let dataset = activeTab === 'worth-replying' ? appData.worth_replying : appData.all_comments;
    
    // Apply filters
    if (activeFilter !== 'all') {
        dataset = dataset.filter(c => c.category === activeFilter);
    }
    
    // Update badge numbers in filters header
    updateFilterCounts();
    
    if (!dataset || dataset.length === 0) {
        commentsListContainer.innerHTML = `
            <div class="center-state" style="min-height: 200px;">
                <div style="text-align: center; color: var(--text-secondary);">
                    <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No comments found in this category.</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Render list
    dataset.forEach(comment => {
        const avatarLetter = comment.author ? comment.author.charAt(0).toUpperCase() : 'U';
        const formattedDate = comment.published_at ? new Date(comment.published_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }) : 'Recent';
        
        let replyWidgetHtml = '';
        if (comment.suggested_reply) {
            replyWidgetHtml = `
                <div class="reply-widget">
                    <div class="reply-header">
                        <i class="fa-solid fa-sparkles"></i> AI Suggested Draft Reply
                    </div>
                    <div class="reply-body">
                        "${comment.suggested_reply}"
                    </div>
                    <div class="reply-actions">
                        <button class="btn-copy" onclick="copyReply(this, \`${escapeHtml(comment.suggested_reply)}\`)">
                            <i class="fa-solid fa-copy"></i> Copy Reply
                        </button>
                    </div>
                </div>
            `;
        }

        const commentHtml = `
            <div class="comment-card">
                <div class="comment-header">
                    <div class="author-info">
                        <div class="author-avatar">${avatarLetter}</div>
                        <div class="author-details">
                            <span class="author-name">${escapeHtml(comment.author || 'Anonymous')}</span>
                            <span class="comment-date">${formattedDate}</span>
                        </div>
                    </div>
                    
                    <div class="comment-badges">
                        <div class="like-badge">
                            <i class="fa-regular fa-thumbs-up"></i> ${comment.likes || 0}
                        </div>
                        <div class="category-pill ${comment.category || 'other'}">
                            <i class="fa-solid ${getCategoryIcon(comment.category)}"></i> ${comment.category || 'other'}
                        </div>
                    </div>
                </div>
                
                <div class="comment-body">
                    ${escapeHtml(comment.text)}
                </div>
                
                ${replyWidgetHtml}
            </div>
        `;
        commentsListContainer.insertAdjacentHTML('beforeend', commentHtml);
    });
}

// Calculate badge totals for filter headers
function updateFilterCounts() {
    let dataset = activeTab === 'worth-replying' ? appData.worth_replying : appData.all_comments;
    
    cntAll.textContent = dataset.length;
    cntQuestion.textContent = dataset.filter(c => c.category === 'question').length;
    cntPositive.textContent = dataset.filter(c => c.category === 'positive').length;
    cntComplaint.textContent = dataset.filter(c => c.category === 'complaint').length;
    cntFunny.textContent = dataset.filter(c => c.category === 'funny').length;
    cntOther.textContent = dataset.filter(c => c.category === 'other').length;
}

// Copy reply draft to clipboard
async function copyReply(button, text) {
    try {
        await navigator.clipboard.writeText(text);
        
        // Show success animation
        button.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        button.classList.add('success');
        
        setTimeout(() => {
            button.innerHTML = `<i class="fa-solid fa-copy"></i> Copy Reply`;
            button.classList.remove('success');
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

// HTML escape helper to prevent scripting injections
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
