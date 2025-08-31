document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to Eternal Ink Books!');



    // --- Signup Form Logic ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        const messageElement = document.getElementById('form-message');
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageElement.textContent = '';

            const username = signupForm.username.value;
            const email = signupForm.email.value;
            const password = signupForm.password.value;

            if (!username || !email || !password) {
                messageElement.textContent = 'All fields are required.';
                messageElement.style.color = 'var(--burgundy)';
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'An error occurred.');

                messageElement.textContent = 'Registration successful! Redirecting to login...';
                messageElement.style.color = 'var(--gold)';
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            } catch (err) {
                messageElement.textContent = err.message;
                messageElement.style.color = 'var(--burgundy)';
            }
        });
    }

    // --- Login Form Logic ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const messageElement = document.getElementById('form-message');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageElement.textContent = '';

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            if (!email || !password) {
                messageElement.textContent = 'All fields are required.';
                messageElement.style.color = 'var(--burgundy)';
                return;
            }

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'An error occurred.');

                localStorage.setItem('eternalInkUser', JSON.stringify(data.user));

                messageElement.textContent = 'Login successful! Redirecting...';
                messageElement.style.color = 'var(--gold)';
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            } catch (err) {
                messageElement.textContent = err.message;
                messageElement.style.color = 'var(--burgundy)';
            }
        });
    }


    // --- Search Autocomplete & Debouncing ---
    const searchInput = document.querySelector('.search-input');
    const autocompleteBox = document.querySelector('.autocomplete-box');

    if (searchInput && autocompleteBox) {
        const debounce = (func, delay) => {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        };

        const handleSearchInput = async (event) => {
            const query = event.target.value;

            if (query.length < 2) {
                autocompleteBox.innerHTML = '';
                autocompleteBox.style.display = 'none';
                return;
            }

            try {
                const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
                if (!res.ok) {
                    autocompleteBox.style.display = 'none';
                    return;
                }
                const suggestions = await res.json();

                if (suggestions.length > 0) {
                    const suggestionsHTML = suggestions.map(suggestion =>
                        `<a href="${suggestion.url}" class="autocomplete-item">${suggestion.title}</a>`
                    ).join('');
                    autocompleteBox.innerHTML = suggestionsHTML;
                    autocompleteBox.style.display = 'block';
                } else {
                    autocompleteBox.style.display = 'none';
                }
            } catch (err) {
                console.error('Autocomplete fetch failed:', err);
                autocompleteBox.style.display = 'none';
            }
        };

        // Hide box when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-form')) {
                autocompleteBox.style.display = 'none';
            }
        });

        searchInput.addEventListener('input', debounce(handleSearchInput, 300));
    }

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const body = document.body;

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
            themeToggleBtn.textContent = '🌙';
        } else {
            body.classList.remove('light-mode');
            themeToggleBtn.textContent = '☀️';
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        let newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Apply saved theme on initial load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
});
