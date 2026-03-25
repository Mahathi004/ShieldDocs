document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('shieldDocsToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userProfileBtn = document.getElementById('userProfileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // Fetch and display user data
    try {
        const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const user = await res.json();
            // Display only First Name in the sidebar as per user request
            if (userName) userName.innerText = user.firstName;
            
            if (userAvatar) {
                const initials = (user.firstName[0] + (user.lastName[0] || '')).toUpperCase();
                userAvatar.innerText = initials;
            }

            // Dashboard Specific Personalization
            const welcomeTitle = document.getElementById('welcomeTitle');
            const welcomeSubtitle = document.getElementById('welcomeSubtitle');
            if (welcomeTitle) {
                welcomeTitle.innerText = `Welcome back, ${user.firstName}!`;
                if (welcomeSubtitle) {
                    welcomeSubtitle.innerText = "Your personal document security mission control.";
                }
            }
        } else if (res.status === 401) {
            localStorage.removeItem('shieldDocsToken');
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Error fetching user data:', err);
    }

    // Dropdown Toggle
    if (userProfileBtn && profileDropdown) {
        userProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('active');
        });
    }

    // Logout Logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('http://127.0.0.1:5000/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error('Logout error:', err);
            }
            localStorage.removeItem('shieldDocsToken');
            window.location.href = 'login.html';
        });
    }
});
