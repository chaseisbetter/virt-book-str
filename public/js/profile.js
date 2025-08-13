document.addEventListener('DOMContentLoaded', async () => {
    const profileInfoDiv = document.getElementById('profile-info');
    const logoutBtn = document.getElementById('logout-btn');

    // 1. Check for user in localStorage (protect the route)
    const user = JSON.parse(localStorage.getItem('eternalInkUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Fetch profile data from protected endpoint
    try {
        // In a real app, we would send a token in the header
        // const res = await fetch('/api/users/profile', {
        //     headers: { 'Authorization': `Bearer ${token}` }
        // });

        // For now, the endpoint is not truly protected, so we just call it
        const res = await fetch('/api/users/profile');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Could not fetch profile');
        }

        // 3. Display the data
        profileInfoDiv.innerHTML = `
            <p><strong>Username:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>User ID:</strong> ${data.id}</p>
        `;

    } catch (err) {
        profileInfoDiv.innerHTML = `<p style="color: var(--burgundy);">${err.message}</p>`;
        // Also clear storage if the profile fetch fails, as something is wrong
        localStorage.removeItem('eternalInkUser');
    }

    // 4. Handle Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('eternalInkUser');
        window.location.href = 'index.html';
    });
});
