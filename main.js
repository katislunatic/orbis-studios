// ===================== iOS LIQUID GLASS DETECTION =====================
(function() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
        document.body.classList.add('ios-glass');
    }
})();

// ===================== NAV SLIDER =====================
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const allLinks = document.querySelectorAll('.nav-center a');
const slider = document.getElementById('navSlider');

function moveSlider(link) {
    const navRect = navLinks.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    slider.style.left = (linkRect.left - navRect.left) + 'px';
    slider.style.width = linkRect.width + 'px';
}

window.addEventListener('load', () => {
    const active = document.querySelector('.nav-center a.active');
    if (active) moveSlider(active);
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('mobile-active');
});

allLinks.forEach(link => {
    link.addEventListener('click', () => {
        allLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        moveSlider(link);
        hamburger.classList.remove('open');
        navLinks.classList.remove('mobile-active');

        // Pause ScrollSpy so it doesn't fight the click during smooth scroll
        spyPaused = true;
        clearTimeout(window._spyResumeTimer);
        window._spyResumeTimer = setTimeout(() => { spyPaused = false; }, 1000);
    });
});

// ===================== SCROLL REVEAL + PROGRESS BARS =====================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            e.target.querySelectorAll('.progress-fill').forEach(bar => {
                setTimeout(() => { bar.style.width = bar.dataset.progress + '%'; }, 200);
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===================== ANIMATED STAT COUNTERS =====================
function animateCounter(el, target, suffix, duration) {
    const startTime = performance.now();
    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
        const current = Math.floor(ease * target);
        let display;
        if (target >= 1000000000)      display = Math.floor(current / 1000000000) + 'B';
        else if (target >= 1000000)    display = Math.floor(current / 1000000) + 'M';
        else                           display = current.toString();
        el.textContent = display + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const numEl = e.target.querySelector('.stat-num');
        if (!numEl || numEl.dataset.animated) return;
        numEl.dataset.animated = 'true';
        animateCounter(numEl, parseFloat(numEl.dataset.value), numEl.dataset.suffix || '', 2000);
        statObserver.unobserve(e.target);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(el => statObserver.observe(el));



// ===================== SETTINGS & THEME =====================
const settingsBtn = document.getElementById('settingsBtn');
const settingsDropdown = document.getElementById('settingsDropdown');
const themeFlash = document.getElementById('themeFlash');

settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsBtn.classList.toggle('open');
    settingsDropdown.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
        settingsBtn.classList.remove('open');
        settingsDropdown.classList.remove('open');
    }
});

function setTheme(mode) {
    const isLight = mode === 'light';
    themeFlash.style.background = isLight ? 'rgba(240,242,245,0.3)' : 'rgba(5,5,7,0.4)';
    themeFlash.classList.add('active');
    setTimeout(() => {
        document.body.classList.toggle('light-mode', isLight);
        setTimeout(() => themeFlash.classList.remove('active'), 200);
    }, 130);
    document.getElementById('themeLight').classList.toggle('active', isLight);
    document.getElementById('themeDark').classList.toggle('active', !isLight);
    localStorage.setItem('orbis-theme', mode);
}

// Restore saved theme
const savedTheme = localStorage.getItem('orbis-theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeLight').classList.add('active');
    document.getElementById('themeDark').classList.remove('active');
}

// ===================== SCROLLSPY =====================
const spySections = [
    { id: '',         el: document.querySelector('header') },
    { id: 'services', el: document.getElementById('services') },
    { id: 'works',    el: document.getElementById('works') },
    { id: 'about',    el: document.getElementById('about') },
    { id: 'pipeline', el: document.getElementById('pipeline') },
    { id: 'team',     el: document.getElementById('team') },
];

let spyPaused = false;

function updateActiveNav() {
    if (spyPaused) return;
    let current = '';
    spySections.forEach(({ id, el }) => {
        if (el && el.getBoundingClientRect().top <= 80) current = id;
    });
    allLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        const matches = href === current;
        link.classList.toggle('active', matches);
        if (matches) moveSlider(link);
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ===================== DISCORD LIVE MEMBER COUNT =====================
function animateBadgeCount(el, target, suffix, duration = 1200) {
    const start = performance.now();
    function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

(function fetchGTICCount() {
    const GUILD_ID = '1385408756464226414';
    const TOTAL_MEMBERS = 700; // ← Update manually when needed
    const membersEl = document.getElementById('gtic-members-text');
    const onlineEl  = document.getElementById('gtic-online-text');
    if (!membersEl || !onlineEl) return;

    animateBadgeCount(membersEl, TOTAL_MEMBERS, ' Members');

    fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`)
        .then(r => r.json())
        .then(data => {
            const online = typeof data.presence_count === 'number' ? data.presence_count : null;
            if (online !== null) {
                animateBadgeCount(onlineEl, online, ' Online');
            } else {
                onlineEl.textContent = '— Online';
            }
        })
        .catch(() => { onlineEl.textContent = '— Online'; });
})();

// ===================== DISCORD OAUTH =====================
const DISCORD_CLIENT_ID = '1481772391049728061';
const DISCORD_REDIRECT  = 'https://orbis-studios.netlify.app/#';
const DISCORD_SCOPE     = 'identify connections email';

function discordLogin() {
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('discord_state', state);
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT)}&response_type=token&scope=${encodeURIComponent(DISCORD_SCOPE)}&state=${state}`;
    window.location.href = url;
}

function discordLogout() {
    sessionStorage.removeItem('discord_token');
    sessionStorage.removeItem('discord_user');
    sessionStorage.removeItem('discord_state');
    document.getElementById('discordLoginBtn').style.display = '';
    document.getElementById('discordUser').style.display = 'none';
    document.getElementById('discordLoginBtnMobile').style.display = '';
    document.getElementById('discordUserMobile').style.display = 'none';
    closeProfile();
    showToast('Logged out successfully.', 'info');
}

const CONNECTION_ICONS = {
    twitch:    'https://cdn.cdnlogo.com/logos/t/68/twitch.svg',
    youtube:   'https://cdn.cdnlogo.com/logos/y/57/youtube-icon.svg',
    twitter:   'https://cdn.cdnlogo.com/logos/t/96/twitter-icon.svg',
    spotify:   'https://cdn.cdnlogo.com/logos/s/89/spotify.svg',
    steam:     'https://cdn.cdnlogo.com/logos/s/56/steam.svg',
    reddit:    'https://cdn.cdnlogo.com/logos/r/7/reddit-icon.svg',
    github:    'https://cdn.cdnlogo.com/logos/g/15/github-icon.svg',
    xbox:      'https://cdn.cdnlogo.com/logos/x/19/xbox.svg',
    playstation: 'https://cdn.cdnlogo.com/logos/p/20/playstation.svg',
    tiktok:    'https://cdn.cdnlogo.com/logos/t/75/tiktok-icon.svg',
};

async function fetchDiscordUser(token) {
    try {
        // Fetch user + connections in parallel
        const [userRes, connRes] = await Promise.all([
            fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${token}` } }),
            fetch('https://discord.com/api/users/@me/connections', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const user = await userRes.json();
        const connections = connRes.ok ? await connRes.json() : [];

        const avatar = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;
        const banner = user.banner
            ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${user.banner.startsWith('a_') ? 'gif' : 'png'}?size=480`
            : null;

        // Store everything
        sessionStorage.setItem('discord_user', JSON.stringify({ user, connections, avatar, banner }));

        // Update nav pill (desktop)
        document.getElementById('discordAvatar').src = avatar;
        document.getElementById('discordUsername').textContent = user.global_name || user.username;
        document.getElementById('discordLoginBtn').style.display = 'none';
        document.getElementById('discordUser').style.display = 'flex';

        // Update nav (mobile)
        document.getElementById('discordAvatarMobile').src = avatar;
        document.getElementById('discordUsernameMobile').textContent = user.global_name || user.username;
        document.getElementById('discordLoginBtnMobile').style.display = 'none';
        document.getElementById('discordUserMobile').style.display = 'flex';
        showToast(`Welcome, ${user.global_name || user.username}!`, 'success');
    } catch(e) { console.warn('Discord fetch failed', e); showToast('Login failed. Please try again.', 'error'); }
}

function openProfile() {
    const stored = sessionStorage.getItem('discord_user');
    if (!stored) return;
    const { user, connections, avatar, banner } = JSON.parse(stored);

    // Banner
    const bannerEl = document.getElementById('profileBanner');
    bannerEl.style.background = banner
        ? `url('${banner}') center/cover no-repeat`
        : `linear-gradient(135deg, #5865F2, #3b2fcf)`;

    // Avatar + name
    document.getElementById('profileAvatar').src = avatar;
    document.getElementById('profileDisplayName').textContent = user.global_name || user.username;
    document.getElementById('profileUsername').textContent = `@${user.username}`;

    // Email — spoiler reveal
    const emailEl = document.getElementById('profileEmail');
    emailEl.innerHTML = '';
    const spoiler = document.createElement('span');
    spoiler.className = 'email-spoiler';
    spoiler.dataset.revealed = 'false';
    spoiler.innerHTML = `<span class="email-blur">${user.email || 'Not available'}</span><span class="email-hint">Click to reveal</span>`;
    spoiler.addEventListener('click', () => {
        if (spoiler.dataset.revealed === 'false') {
            spoiler.dataset.revealed = 'true';
            spoiler.classList.add('revealed');
        }
    });
    emailEl.appendChild(spoiler);

    // Connections
    const connWrap = document.getElementById('profileConnections');
    connWrap.innerHTML = '';
    if (connections && connections.length) {
        connections.forEach(conn => {
            const pill = document.createElement('div');
            pill.className = 'conn-pill';
            const icon = CONNECTION_ICONS[conn.type];
            pill.innerHTML = `${icon ? `<img src="${icon}" alt="${conn.type}">` : ''}${conn.name}`;
            connWrap.appendChild(pill);
        });
    } else {
        connWrap.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem;">No connections found</span>';
    }

    document.getElementById('profileModal').style.display = 'block';
}

function closeProfile() { document.getElementById('profileModal').style.display = 'none'; }

(function handleDiscordCallback() {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const state = params.get('state');
    if (token && state && state === sessionStorage.getItem('discord_state')) {
        sessionStorage.setItem('discord_token', token);
        history.replaceState(null, '', window.location.pathname);
        fetchDiscordUser(token);
    } else {
        const saved = sessionStorage.getItem('discord_token');
        if (saved) fetchDiscordUser(saved);
    }
})();

// ===================== TOAST NOTIFICATIONS =====================
function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container') || (() => {
        const el = document.createElement('div');
        el.id = 'toast-container';
        document.body.appendChild(el);
        return el;
    })();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };

    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-show')));

    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

// ===================== GAME MODAL =====================
function openGame() {
    const modal = document.getElementById('gameModal');
    document.getElementById('gameFrame').src = 'https://floor-lied.netlify.app/';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeGame() {
    document.getElementById('gameModal').style.display = 'none';
    document.getElementById('gameFrame').src = '';
    document.body.style.overflow = '';
}

// ===================== MODAL =====================
function openPrivacy() { document.getElementById('privacyModal').style.display = 'block'; }
function closePrivacy() { document.getElementById('privacyModal').style.display = 'none'; }
window.addEventListener('click', e => {
    if (e.target === document.getElementById('privacyModal')) closePrivacy();
    if (e.target === document.getElementById('profileModal')) closeProfile();
    if (e.target === document.getElementById('gameModal')) closeGame();
});
