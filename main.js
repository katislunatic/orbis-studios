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

// ===================== MODAL =====================
function openPrivacy() { document.getElementById('privacyModal').style.display = 'block'; }
function closePrivacy() { document.getElementById('privacyModal').style.display = 'none'; }
window.addEventListener('click', e => {
    if (e.target === document.getElementById('privacyModal')) closePrivacy();
});
