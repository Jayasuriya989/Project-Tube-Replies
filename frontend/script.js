/* ============================================================
   TubeReplies — Frontend Logic (No Backend / Mock Data)
   ============================================================ */

// ─────────────────────────────────────────
//  LANDING INTERACTIVE DEMO DATA & LOGIC
// ─────────────────────────────────────────

const DEMO_REPLY_TEMPLATES = [
    "AWS deployment guide is in the works! I'll cover IAM, EC2, and setting up Nginx with HTTPS. Stay tuned! 🚀",
    "Yes! Planning to release a 45-minute deep-dive on AWS EC2/RDS setup next Tuesday. Click notifications to get notified! 🔔",
    "Deploying to AWS is a highly requested topic! I am scripting the ECS and Docker deployment video today. Will notify you! 💻",
    "Absolutely! I will be using Docker & Terraform for the AWS setup to make it easy for you guys. Thanks for the support! ❤️"
];

let currentDemoIndex = 0;

function handleDemoRegen() {
    const btn = document.getElementById('demo-btn-regen');
    const postBtn = document.getElementById('demo-btn-post');
    const textEl = document.getElementById('demo-ai-text');
    const area = document.getElementById('demo-typing-area');
    if (!textEl || !area) return;

    if (btn) {
        btn.innerHTML = '<span class="spinner-sm"></span> Generating…';
        btn.style.pointerEvents = 'none';
    }

    // Hide original text, show dots
    textEl.style.display = 'none';
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.id = 'demo-dots';
    dots.innerHTML = '<span></span><span></span><span></span>';
    area.appendChild(dots);

    setTimeout(() => {
        // Remove dots, show text element empty
        const d = document.getElementById('demo-dots');
        if (d) d.remove();
        textEl.style.display = 'block';
        textEl.textContent = '';

        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Regenerate';
            btn.style.pointerEvents = '';
        }

        // Restore post button state
        if (postBtn) {
            postBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Post Reply';
            postBtn.disabled = false;
            postBtn.style.pointerEvents = '';
            postBtn.style.background = 'var(--red)';
            postBtn.style.color = '#fff';
            postBtn.style.boxShadow = '0 0 12px var(--red-dim)';
        }

        // Pick next response
        currentDemoIndex = (currentDemoIndex + 1) % DEMO_REPLY_TEMPLATES.length;
        const targetText = DEMO_REPLY_TEMPLATES[currentDemoIndex];

        // Typewriter effect
        let i = 0;
        const interval = setInterval(() => {
            if (i < targetText.length) {
                textEl.textContent += targetText[i++];
            } else {
                clearInterval(interval);
            }
        }, 15);

    }, 1200);
}

function handleDemoPost() {
    const btn = document.getElementById('demo-btn-post');
    if (!btn) return;

    btn.innerHTML = '<span class="spinner-sm"></span> Posting…';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Posted!';
        btn.style.background = '#1a3a1a';
        btn.style.color = 'var(--green)';
        btn.style.boxShadow = 'none';
        btn.disabled = true;

        showToast('✅ Demo reply posted successfully (simulated)!', 'success');
        triggerConfetti('demo-preview-card');
    }, 1000);
}

function handleDemoCopy(btn) {
    const textEl = document.getElementById('demo-ai-text');
    if (!textEl) return;
    
    navigator.clipboard.writeText(textEl.textContent).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('copied');
        btn.style.pointerEvents = 'none';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
            btn.style.pointerEvents = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// ─────────────────────────────────────────
//  MOCK DATA
// ─────────────────────────────────────────

const AVATAR_COLORS = [
    '#ef4444','#f97316','#eab308','#22c55e',
    '#14b8a6','#3b82f6','#8b5cf6','#ec4899'
];

function avatarColor(name) {
    let h = 5381;
    for (let c of name) h = ((h << 5) + h) ^ c.charCodeAt(0);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const VIDEOS = [
    { id:'v1', yt:'dQw4w9WgXcQ', title:'Building a Full Stack App with Python & FastAPI', views:'284K', likes:'12.4K', commentCount:892,  date:'2 days ago',   dur:'18:42',  type:'video' },
    { id:'v2', yt:'9bZkp7q19f0', title:'Top 10 VS Code Extensions for Python Devs in 2025', views:'156K', likes:'8.7K',  commentCount:423,  date:'1 week ago',  dur:'12:18',  type:'video' },
    { id:'v3', yt:'JGwWNGJdvx8', title:'Python Tutorial for Beginners | Complete Course',     views:'892K', likes:'34.1K', commentCount:2841, date:'2 months ago', dur:'6:12:04', type:'video' },
    { id:'v4', yt:'kJQP7kiw5Fk', title:'How I Got My First Developer Job in 6 Months',       views:'341K', likes:'18.9K', commentCount:1204, date:'3 weeks ago',  dur:'22:31',  type:'video' },
    { id:'v5', yt:'OPf0YbXqDm0', title:'React vs Vue in 2025 — Which Should You Learn First?', views:'198K', likes:'9.2K', commentCount:687,  date:'1 month ago',  dur:'15:47',  type:'video' },
    { id:'v6', yt:'RgKAFK5djSk', title:'CSS Grid vs Flexbox — The Complete Guide',            views:'127K', likes:'7.3K',  commentCount:312,  date:'6 weeks ago',  dur:'20:15',  type:'video' },
    { id:'v7', yt:'CevxZvSJLk8', title:'JavaScript One-Liners That Will Blow Your Mind 🤯',  views:'445K', likes:'21.6K', commentCount:1893, date:'2 months ago', dur:'11:23',  type:'video' },
    { id:'v8', yt:'YQHsXMglC9A', title:'Deploy Your Web App to AWS EC2 — Step by Step',       views:'89K',  likes:'5.4K',  commentCount:234,  date:'3 months ago', dur:'28:44',  type:'video' },
    { id:'s1', yt:'hT_nvWreIhg', title:'🐍 This Python trick saves HOURS of work #python',  views:'1.2M', likes:'89K',   commentCount:4321, date:'5 days ago',   dur:'0:58',   type:'short' },
    { id:'s2', yt:'fRh_vgS2dFE', title:"CSS trick that 99% of devs don't know 🤯 #css",     views:'876K', likes:'67K',   commentCount:2134, date:'2 weeks ago',  dur:'0:45',   type:'short' },
    { id:'s3', yt:'e-ORhEE9VVg', title:'The Git command that saves you every time 💻 #git',  views:'654K', likes:'54K',   commentCount:1876, date:'1 month ago',  dur:'0:52',   type:'short' },
    { id:'s4', yt:'3JZ_D3ELwOQ', title:'Why useCallback is OVERUSED in React ⚛️ #react',    views:'432K', likes:'38K',   commentCount:1243, date:'6 weeks ago',  dur:'0:59',   type:'short' }
];

const COMMENTS = [
    {
        id:'c1', author:'TechEnthusiast99', time:'3 hours ago', category:'question',
        text:"This tutorial is absolutely amazing! Can you please make a follow-up video on deploying this to AWS? I've been struggling with that part for weeks.",
        likes:234, replies:45,
        aiReply:"Hey! So glad the tutorial helped! 😊 Yes, AWS deployment is definitely on my roadmap — planning a full series starting with EC2, then ECS and Lambda. Should drop within the next 2 weeks. Subscribe and hit the bell so you don't miss it! 🔔"
    },
    {
        id:'c2', author:'CodeWithSarah', time:'5 hours ago', category:'positive',
        text:"I've watched hundreds of programming tutorials and this is genuinely the best explanation I've ever seen. The way you break down complex concepts is incredible!",
        likes:189, replies:32,
        aiReply:"Thank you so much Sarah, that genuinely made my day! 🙏 Comments like this are what keep me motivated to create more content. I put a lot of effort into making things as clear as possible, so hearing this means everything! ❤️"
    },
    {
        id:'c3', author:'PythonNewbie2024', time:'8 hours ago', category:'question',
        text:"What's the difference between async/await and regular functions in Python? I'm still confused even after watching this twice 😅",
        likes:156, replies:28,
        aiReply:"Great question! 🎯 Async/await is for I/O-bound tasks (like API calls, file reads) — they let your program keep doing other things while waiting. Regular functions block execution until they finish. For CPU-heavy work, use multiprocessing instead. I'll do a dedicated deep-dive video on this soon!"
    },
    {
        id:'c4', author:'AngryDev007', time:'12 hours ago', category:'complaint',
        text:"The audio quality in the first 10 minutes is really bad. There's a lot of background noise and it's hard to follow along properly.",
        likes:87, replies:21,
        aiReply:"Hey, I'm genuinely sorry about the audio! 😔 I had a microphone issue that day and noticed it too late in editing. I've since upgraded my entire audio setup and recent videos are much cleaner. Thank you for the honest feedback — it really helps me improve the quality for everyone!"
    },
    {
        id:'c5', author:'DevDreamer', time:'1 day ago', category:'question',
        text:"Which Python version are you using in this tutorial? I'm getting a syntax error on line 47 when running with Python 3.12.",
        likes:134, replies:19,
        aiReply:"Hey! This was recorded on Python 3.11. The issue in 3.12 is the updated exception group syntax — try `except* ValueError` instead of `except ValueError`. I'll pin a comment with the full 3.12-compatible code snippet! 📌"
    },
    {
        id:'c6', author:'HiredBecauseOfYou', time:'1 day ago', category:'positive',
        text:"Just wanted to share — I just landed my first job as a Python developer and your channel was a HUGE part of my preparation. Thank you for everything you do for this community! 🎉",
        likes:312, replies:17,
        aiReply:"WOW. This literally made me emotional! 🥹 Congratulations on landing your first dev job — that is an incredible achievement and you should be SO proud! You put in all the hard work, I just provided some resources. I can't wait to see what you build next! Welcome to the dev family! 🎉"
    },
    {
        id:'c7', author:'MidnightCoder42', time:'2 days ago', category:'funny',
        text:'Me at 2 AM: "Just one more tutorial and then I\'ll sleep" *immediately hits play on the 6-hour Python course* 💀',
        likes:678, replies:15,
        aiReply:"You've completely exposed me AND my entire audience with one comment 😂 At least you're learning productive things during those sleepless nights! Pro tip: watch at 1.5x speed = technically getting to sleep 33% sooner. You're welcome for this premium life hack 🙏"
    },
    {
        id:'c8', author:'MacOSUser', time:'2 days ago', category:'question',
        text:"Is this tutorial compatible with Mac? Some of the commands seem Windows-specific and I'm hitting different errors on my M2 MacBook Pro.",
        likes:98, replies:12,
        aiReply:"Yes, it works great on Mac! 🍎 Main differences: use `python3` instead of `python`, and paths use `/` not `\\`. For M2 chip architecture issues with packages, try: `arch -x86_64 pip install [package-name]`. Let me know which specific error you're hitting and I'll help you debug it!"
    },
    {
        id:'c9', author:'ClearExplanations', time:'3 days ago', category:'positive',
        text:"Your teaching style is so clear and easy to follow. I've already recommended your channel to all my classmates. Keep up the truly amazing work!",
        likes:145, replies:9,
        aiReply:"That means so much, thank you! 🙏 And thank you for recommending the channel to your classmates — that's honestly the biggest compliment a creator can receive. I really hope it helps everyone on their coding journeys! ✨"
    },
    {
        id:'c10', author:'Python312User', time:'4 days ago', category:'complaint',
        text:"The code on GitHub doesn't work with Python 3.12. Getting `TypeError: cannot unpack non-iterable NoneType object`. Please update the repo.",
        likes:67, replies:7,
        aiReply:"Thanks for reporting this! 🙏 The issue is in the `parse_response()` function — it needs a None check before unpacking. I've just pushed a fix to the repo (commit: `fix/python312-compat`). Key change: add `if result is None: return None, None` before the unpack line. Let me know if that resolves it!"
    }
];

const CAT_META = {
    question:  { icon:'❓', label:'Question',  cls:'question' },
    positive:  { icon:'❤️', label:'Positive',  cls:'positive' },
    complaint: { icon:'⚠️', label:'Complaint', cls:'complaint' },
    funny:     { icon:'😂', label:'Funny',     cls:'funny' },
    other:     { icon:'💬', label:'Other',     cls:'other' }
};

// ─────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────

const state = {
    currentPage: 'landing',
    selectedVideo: null,
    videoFilter: 'all',
    videoSearch: '',
    commentFilter: 'all',
    commentSort: 'replies',
    posted: new Set(),
    generated: new Set()
};

// ─────────────────────────────────────────
//  PAGE NAVIGATION
// ─────────────────────────────────────────

function showPage(pageId) {
    const current = document.querySelector('.page.active');
    if (current) {
        current.classList.add('exit');
        current.classList.remove('active');
    }

    setTimeout(() => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('exit'));
        const next = document.getElementById('page-' + pageId);
        if (!next) return;
        next.classList.add('active');
        state.currentPage = pageId;

        if (pageId === 'videos')   initVideosPage();
        if (pageId === 'comments') initCommentsPage();
    }, 180);
}

// ─────────────────────────────────────────
//  AUTH (MOCK)
// ─────────────────────────────────────────

function handleGoogleLogin(evt) {
    const btn = evt.currentTarget;
    const originalHTML = btn.innerHTML;

    btn.style.pointerEvents = 'none';
    btn.innerHTML = '<span class="spinner-sm"></span>&nbsp; Connecting to YouTube…';

    // Simulate OAuth handshake delay
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.pointerEvents = '';
        showPage('videos');
    }, 1800);
}

function handleLogout() {
    state.selectedVideo = null;
    state.posted.clear();
    state.generated.clear();
    showPage('landing');
}

// ─────────────────────────────────────────
//  VIDEOS PAGE
// ─────────────────────────────────────────

function initVideosPage() {
    renderVideoSkeletons();
    setTimeout(() => {
        renderVideos();
    }, 750);
}

function renderVideoSkeletons() {
    const grid = document.getElementById('videos-grid');
    if (!grid) return;
    let html = '';
    for (let i = 0; i < 8; i++) {
        html += `
        <div class="video-card">
            <div class="skeleton skeleton-thumb"></div>
            <div class="vid-card-body">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-meta"></div>
            </div>
        </div>`;
    }
    grid.innerHTML = html;
}

function renderVideos() {
    const grid = document.getElementById('videos-grid');
    if (!grid) return;

    const q = state.videoSearch.toLowerCase().trim();
    const filtered = VIDEOS.filter(v => {
        const matchType = state.videoFilter === 'all' || v.type === state.videoFilter;
        const matchQ    = !q || v.title.toLowerCase().includes(q);
        return matchType && matchQ;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state">
            <i class="fa-solid fa-magnifying-glass"></i>
            <p>No videos found. Try a different search term.</p>
        </div>`;
        return;
    }

    grid.innerHTML = filtered.map(v => buildVideoCard(v)).join('');

    grid.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => openVideo(card.dataset.id));
    });
}

function buildVideoCard(v) {
    const thumb = `https://img.youtube.com/vi/${v.yt}/mqdefault.jpg`;
    const needsN = Math.max(1, Math.floor(v.commentCount * 0.08));

    return `
    <div class="video-card" data-id="${v.id}" data-type="${v.type}">
        <div class="vid-thumb-wrap">
            <img class="vid-thumb" src="${thumb}" alt="${v.title}"
                 onerror="this.src='https://placehold.co/320x180/111/6366f1?text=Video'">
            <div class="thumb-overlay">
                <div class="play-btn"><i class="fa-solid fa-play"></i></div>
            </div>
            <span class="duration-badge">${v.dur}</span>
            <span class="type-badge ${v.type}">${v.type === 'short' ? '⚡ Short' : '🎬 Video'}</span>
        </div>
        <div class="vid-card-body">
            <h3 class="vid-title">${v.title}</h3>
            <div class="vid-meta">
                <span><i class="fa-solid fa-eye"></i> ${v.views}</span>
                <span><i class="fa-solid fa-heart"></i> ${v.likes}</span>
                <span><i class="fa-solid fa-comments"></i> ${formatNum(v.commentCount)}</span>
            </div>
            <div class="vid-footer">
                <span class="vid-date"><i class="fa-regular fa-clock"></i> ${v.date}</span>
                <span class="needs-reply">${needsN} need reply</span>
            </div>
        </div>
    </div>`;
}

function openVideo(id) {
    state.selectedVideo = VIDEOS.find(v => v.id === id) || null;
    if (state.selectedVideo) showPage('comments');
}

function filterVideos(type, btn) {
    state.videoFilter = type;
    document.querySelectorAll('#page-videos .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderVideos();
}

function searchVideos(q) {
    state.videoSearch = q;
    renderVideos();
}

// ─────────────────────────────────────────
//  COMMENTS PAGE
// ─────────────────────────────────────────

function initCommentsPage() {
    const v = state.selectedVideo;
    if (!v) return;

    // Update header
    setText('cmt-vid-title', v.title);
    setText('cmt-vid-stats', `${v.views} views  ·  ${formatNum(v.commentCount)} comments  ·  ${v.date}`);
    const mini = document.getElementById('vid-thumb-mini');
    if (mini) mini.style.backgroundImage = `url(https://img.youtube.com/vi/${v.yt}/mqdefault.jpg)`;

    // Category counts
    const counts = { all:0, question:0, positive:0, complaint:0, funny:0 };
    COMMENTS.forEach(c => {
        counts.all++;
        if (c.category in counts) counts[c.category]++;
    });
    Object.keys(counts).forEach(k => setText('cnt-' + k, counts[k]));

    // Reset tab
    document.querySelectorAll('#page-comments .tab').forEach((b,i) => b.classList.toggle('active', i===0));
    state.commentFilter = 'all';

    renderCommentSkeletons();
    setTimeout(() => {
        renderComments();
    }, 750);
}

function renderCommentSkeletons() {
    const list = document.getElementById('comments-list');
    if (!list) return;
    let html = '';
    for (let i = 0; i < 3; i++) {
        html += `
        <div class="skeleton-card">
            <div class="cmt-head" style="margin-bottom: 12px;">
                <div class="skeleton skeleton-avatar"></div>
                <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div class="skeleton skeleton-text" style="width: 120px;"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            </div>
            <div class="skeleton skeleton-text long" style="margin-left: 52px; height: 12px;"></div>
            <div class="skeleton skeleton-text medium" style="margin-left: 52px; height: 12px;"></div>
        </div>`;
    }
    list.innerHTML = html;
}

function renderComments() {
    const list = document.getElementById('comments-list');
    if (!list) return;

    let rows = COMMENTS.filter(c =>
        state.commentFilter === 'all' || c.category === state.commentFilter
    );

    if (state.commentSort === 'replies') rows.sort((a,b) => b.replies - a.replies);
    else if (state.commentSort === 'likes') rows.sort((a,b) => b.likes - a.likes);

    if (rows.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fa-solid fa-comments"></i><p>No comments in this category.</p></div>`;
        updateReplyProgress();
        return;
    }

    list.innerHTML = rows.map(c => buildCommentCard(c)).join('');

    // Bind button events
    list.querySelectorAll('.btn-gen-reply').forEach(btn =>
        btn.addEventListener('click', () => genReply(btn.dataset.id)));

    list.querySelectorAll('.btn-regen').forEach(btn =>
        btn.addEventListener('click', () => regenReply(btn.dataset.id)));

    list.querySelectorAll('.btn-post-reply').forEach(btn =>
        btn.addEventListener('click', () => postReply(btn.dataset.id)));

    list.querySelectorAll('.reply-textarea').forEach(ta => {
        ta.addEventListener('input', () => {
            const cc = document.getElementById('chars-' + ta.dataset.id);
            if (cc) cc.textContent = `${ta.value.length} / 500`;
        });
    });

    // Restore generated / posted states
    state.generated.forEach(id => showReplyPanel(id));
    state.posted.forEach(id => applyPostedStyle(id));

    // Update progress bar & count
    updateReplyProgress();
}

function buildCommentCard(c) {
    const color = avatarColor(c.author);
    const initial = c.author[0].toUpperCase();
    const meta = CAT_META[c.category] || CAT_META.other;
    const isPosted = state.posted.has(c.id);
    const isGenerated = state.generated.has(c.id);

    return `
    <div class="comment-card" id="card-${c.id}" data-cat="${c.category}">
        ${isPosted ? `<div class="posted-banner"><i class="fa-solid fa-check-circle"></i> Reply posted to YouTube</div>` : ''}
        <div class="cmt-head">
            <div class="cmt-avatar" style="background:${color}">${initial}</div>
            <div class="cmt-author-col">
                <div class="cmt-name">${c.author}</div>
                <div class="cmt-time">${c.time}</div>
            </div>
            <span class="cat-badge ${meta.cls}">${meta.icon} ${meta.label}</span>
        </div>
        <p class="cmt-text">${c.text}</p>
        <div class="cmt-stats">
            <span class="stat-pill"><i class="fa-solid fa-heart"></i> ${c.likes}</span>
            <span class="stat-pill replies"><i class="fa-solid fa-reply"></i> ${c.replies} replies</span>
        </div>
        <div class="cmt-action-row">
            <button class="btn-gen-reply" data-id="${c.id}" ${isPosted ? 'disabled' : ''}>
                <i class="fa-solid fa-robot"></i>
                ${isGenerated ? 'Re-generate AI Reply' : 'Generate AI Reply'}
            </button>
        </div>
        <div class="reply-section ${isGenerated ? '' : 'hidden'}" id="reply-${c.id}">
            <div class="reply-head">
                <span class="ai-label"><i class="fa-solid fa-sparkles"></i>&nbsp; AI Generated Reply</span>
                <div class="reply-actions-row">
                    <button class="btn-copy-reply" data-id="${c.id}" onclick="copyReplyText('${c.id}', this)"><i class="fa-regular fa-copy"></i> Copy</button>
                    <button class="btn-regen" data-id="${c.id}"><i class="fa-solid fa-rotate"></i> Regenerate</button>
                </div>
            </div>
            <div id="typing-area-${c.id}">
                <textarea
                    class="reply-textarea"
                    id="ta-${c.id}"
                    data-id="${c.id}"
                    rows="3"
                    ${isPosted ? 'disabled' : ''}
                >${isGenerated ? c.aiReply : ''}</textarea>
            </div>
            <div class="reply-post-row">
                <span class="char-count" id="chars-${c.id}">${c.aiReply.length} / 500</span>
                <button class="btn-post-reply ${isPosted ? 'posted' : ''}" data-id="${c.id}" ${isPosted ? 'disabled' : ''}>
                    ${isPosted
                        ? '<i class="fa-solid fa-check"></i> Posted!'
                        : '<i class="fa-solid fa-paper-plane"></i> Post Reply'
                    }
                </button>
            </div>
        </div>
    </div>`;
}

function filterComments(cat, btn) {
    state.commentFilter = cat;
    document.querySelectorAll('#page-comments .tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderComments();
}

function sortComments(val) {
    state.commentSort = val;
    renderComments();
}

// ─────────────────────────────────────────
//  AI REPLY (MOCK)
// ─────────────────────────────────────────

function genReply(id) {
    const genBtn = document.querySelector(`.btn-gen-reply[data-id="${id}"]`);
    const panel  = document.getElementById('reply-' + id);
    const taArea = document.getElementById('typing-area-' + id);
    const ta     = document.getElementById('ta-' + id);
    const charEl = document.getElementById('chars-' + id);
    if (!panel || !taArea || !ta) return;

    const comment = COMMENTS.find(c => c.id === id);
    const replyText = comment ? comment.aiReply : 'Thank you for your comment! 😊';

    // Show panel + loading dots
    panel.classList.remove('hidden');
    if (genBtn) {
        genBtn.innerHTML = '<span class="spinner-sm"></span> Generating…';
        genBtn.style.pointerEvents = 'none';
    }

    // Replace textarea with typing dots temporarily
    ta.classList.add('hidden');
    
    // Prevent duplicate dots
    let dots = document.getElementById('dots-' + id);
    if (!dots) {
        dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.id = 'dots-' + id;
        dots.innerHTML = '<span></span><span></span><span></span>';
        taArea.appendChild(dots);
    }

    setTimeout(() => {
        // Remove dots, show textarea
        const d = document.getElementById('dots-' + id);
        if (d) d.remove();
        ta.classList.remove('hidden');
        ta.value = '';

        if (genBtn) {
            genBtn.innerHTML = '<i class="fa-solid fa-robot"></i> Re-generate AI Reply';
            genBtn.style.pointerEvents = '';
        }

        state.generated.add(id);
        updateReplyProgress();

        // Typewriter effect
        let i = 0;
        const interval = setInterval(() => {
            if (i < replyText.length) {
                ta.value += replyText[i++];
                ta.scrollTop = ta.scrollHeight;
                if (charEl) charEl.textContent = `${ta.value.length} / 500`;
            } else {
                clearInterval(interval);
            }
        }, 15);

    }, 1600);
}

function regenReply(id) {
    state.generated.delete(id);
    const ta = document.getElementById('ta-' + id);
    if (ta) ta.value = '';
    genReply(id);
}

function showReplyPanel(id) {
    const panel = document.getElementById('reply-' + id);
    if (panel) panel.classList.remove('hidden');
}

// ─────────────────────────────────────────
//  POST REPLY (MOCK)
// ─────────────────────────────────────────

function postReply(id) {
    const ta  = document.getElementById('ta-' + id);
    const btn = document.querySelector(`.btn-post-reply[data-id="${id}"]`);
    if (!ta || !btn) return;

    const text = ta.value.trim();
    if (!text) {
        showToast('Please generate or write a reply first.', 'error');
        return;
    }

    btn.innerHTML = '<span class="spinner-sm"></span> Posting…';
    btn.style.pointerEvents = 'none';

    // Simulate API call
    setTimeout(() => {
        state.posted.add(id);

        applyPostedStyle(id);
        showToast('✅ Reply posted to YouTube!', 'success');
        triggerConfetti('card-' + id);
    }, 1200);
}

function applyPostedStyle(id) {
    const btn  = document.querySelector(`.btn-post-reply[data-id="${id}"]`);
    const ta   = document.getElementById('ta-' + id);
    const genB = document.querySelector(`.btn-gen-reply[data-id="${id}"]`);
    const card = document.getElementById('card-' + id);

    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Posted!';
        btn.classList.add('posted');
        btn.disabled = true;
        btn.style.pointerEvents = '';
    }
    if (ta) { ta.disabled = true; }
    if (genB) { genB.disabled = true; }

    // Add posted banner if not already there
    if (card && !card.querySelector('.posted-banner')) {
        const banner = document.createElement('div');
        banner.className = 'posted-banner';
        banner.innerHTML = '<i class="fa-solid fa-check-circle"></i> Reply posted to YouTube';
        card.prepend(banner);
    }

    updateReplyProgress();
}

// ─────────────────────────────────────────
//  UI UTILITIES
// ─────────────────────────────────────────

function showToast(msg, type = 'success') {
    const toast  = document.getElementById('toast');
    const msgEl  = document.getElementById('toast-msg');
    const icon   = toast.querySelector('.toast-icon');

    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    toast.className = `toast show ${type}`;
    icon.className = `toast-icon fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`;

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function toggleSidebar(id) {
    const sb = document.getElementById(id);
    if (sb) sb.classList.toggle('collapsed');
}

function setActiveLink(el) {
    el.closest('nav').querySelectorAll('.sb-link').forEach(a => a.classList.remove('active'));
    el.classList.add('active');
}

function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
}

function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

// ─────────────────────────────────────────
//  INTERSECTION OBSERVER (scroll animations)
// ─────────────────────────────────────────

function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.step-card, .feat-card').forEach(el => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(24px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ─────────────────────────────────────────
//  SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior:'smooth', block:'start' });
        });
    });
}

// ─────────────────────────────────────────
//  NEW ENHANCED UTILITIES
// ─────────────────────────────────────────

function copyReplyText(id, btn) {
    const ta = document.getElementById('ta-' + id);
    if (!ta) return;

    navigator.clipboard.writeText(ta.value).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.classList.add('copied');
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove('copied');
            btn.style.pointerEvents = '';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function updateReplyProgress() {
    const textEl = document.getElementById('progress-text');
    const fillEl = document.getElementById('progress-fill');
    if (!textEl || !fillEl) return;

    const activeCat = state.commentFilter;
    const currentComments = COMMENTS.filter(c => activeCat === 'all' || c.category === activeCat);
    const total = currentComments.length;
    
    let postedCount = 0;
    currentComments.forEach(c => {
        if (state.posted.has(c.id)) postedCount++;
    });

    textEl.textContent = `${postedCount} of ${total} Replied`;
    const percent = total > 0 ? (postedCount / total) * 100 : 0;
    fillEl.style.width = `${percent}%`;

    const bulkBtn = document.getElementById('btn-bulk-gen');
    if (bulkBtn) {
        let genCount = 0;
        currentComments.forEach(c => {
            if (state.generated.has(c.id)) genCount++;
        });
        bulkBtn.disabled = (genCount === total || postedCount === total);
    }
}

function handleBulkGenerate() {
    const activeCat = state.commentFilter;
    const visibleComments = COMMENTS.filter(c => activeCat === 'all' || c.category === activeCat);
    
    let delay = 0;
    let anyTriggered = false;
    visibleComments.forEach(c => {
        if (!state.generated.has(c.id) && !state.posted.has(c.id)) {
            anyTriggered = true;
            setTimeout(() => {
                genReply(c.id);
            }, delay);
            delay += 400;
        }
    });

    if (anyTriggered) {
        showToast('🪄 Staggered AI Reply generation started!', 'success');
    }
}

function triggerConfetti(parentId) {
    const parent = document.getElementById(parentId);
    if (!parent) return;

    const colors = ['#ff2233', '#7c3aed', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899'];
    const count = 40;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-piece';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        parent.appendChild(p);

        // Position at relative right bottom or center depending on comment or landing card
        const isDemo = parentId === 'demo-preview-card';
        p.style.left = isDemo ? '80%' : '85%';
        p.style.top = isDemo ? '88%' : '85%';
        p.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;

        const angle = Math.random() * Math.PI * 2;
        const velocity = 50 + Math.random() * 80;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 20;
        
        p.animate([
            { transform: 'translate(-50%, -50%) translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
            { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.5) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
            fill: 'forwards'
        }).onfinish = () => p.remove();
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('.app-main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
}

function initScrollToTop() {
    const btn = document.getElementById('btn-scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    const mainEl = document.querySelector('.app-main');
    if (mainEl) {
        mainEl.addEventListener('scroll', () => {
            if (mainEl.scrollTop > 300) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
        });
    }
}

function animateCounters() {
    const speedEl = document.getElementById('stat-speed');
    const spamEl = document.getElementById('stat-spam');
    
    const animate = (el, target, suffix = '') => {
        if (!el) return;
        let current = 0;
        const step = target / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                el.textContent = Math.round(target) + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.round(current) + suffix;
            }
        }, 25);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(speedEl, 10, '×');
                animate(spamEl, 98, '%');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const statsRow = document.querySelector('.hero-stats');
    if (statsRow) observer.observe(statsRow);
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    showPage('landing');
    initSmoothScroll();
    initScrollToTop();
    animateCounters();

    // Delay scroll animations until DOM is fully visible
    setTimeout(initScrollAnimations, 300);
});
