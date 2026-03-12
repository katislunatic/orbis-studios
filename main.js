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

// ===================== DISCORD OAUTH =====================
const DISCORD_CLIENT_ID = '1412560943493419070';
const DISCORD_REDIRECT   = 'https://orbis-studios.netlify.app/#';
const DISCORD_SCOPE      = 'identify';

function discordLogin() {
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('discord_state', state);
    const url = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT)}&response_type=token&scope=${DISCORD_SCOPE}&state=${state}`;
    window.location.href = url;
}

function discordLogout() {
    sessionStorage.removeItem('discord_token');
    sessionStorage.removeItem('discord_state');
    document.getElementById('discordLoginBtn').style.display = '';
    document.getElementById('discordUser').style.display = 'none';
}

async function fetchDiscordUser(token) {
    try {
        const res = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const user = await res.json();
        const avatar = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || 0) % 5}.png`;
        document.getElementById('discordAvatar').src = avatar;
        document.getElementById('discordUsername').textContent = user.global_name || user.username;
        document.getElementById('discordLoginBtn').style.display = 'none';
        document.getElementById('discordUser').style.display = 'flex';
    } catch(e) { console.warn('Discord user fetch failed', e); }
}

// Handle OAuth callback — token is in the URL hash
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

// ===================== MODAL =====================
function openPrivacy() { document.getElementById('privacyModal').style.display = 'block'; }
function closePrivacy() { document.getElementById('privacyModal').style.display = 'none'; }
window.addEventListener('click', e => {
    if (e.target === document.getElementById('privacyModal')) closePrivacy();
});
