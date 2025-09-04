document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to Eternal Ink Books!');

    // --- Particle Animation (for homepage) ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        const setCanvasSize = () => {
            const hero = document.getElementById('hero');
            if (hero) {
                canvas.width = hero.offsetWidth;
                canvas.height = hero.offsetHeight;
            }
        };

        const createParticles = () => {
            particles = [];
            const particleCount = Math.floor(canvas.width / 40);
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() * 0.5 - 0.25),
                    speedY: (Math.random() * -0.5 - 0.2),
                    color: 'rgba(212, 175, 55, ' + (Math.random() * 0.5 + 0.3) + ')' // Using the new gold color
                });
            }
        };

        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                if (p.y < 0 || p.x < 0 || p.x > canvas.width) {
                    p.y = canvas.height + 10;
                    p.x = Math.random() * canvas.width;
                }
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        };

        setCanvasSize();
        createParticles();
        animateParticles();
        window.addEventListener('resize', () => {
            setCanvasSize();
            createParticles();
        });
    }

    // --- Smooth Scrolling (for homepage nav) ---
    const homeNavLinks = document.querySelectorAll('#main-header nav a[href*="#"]');
    if (homeNavLinks.length > 0) {
        homeNavLinks.forEach(anchor => {
            if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });
    }

    // --- Full Catalog Loading ---
    const fullCatalogGrid = document.querySelector('#full-catalog .book-grid');
    if (fullCatalogGrid) {
        const fetchAllBooks = async () => {
            try {
                const res = await fetch('/api/books');
                if (!res.ok) throw new Error('Could not fetch the library catalog.');
                const books = await res.json();

                if (books.length === 0) {
                    fullCatalogGrid.innerHTML = '<p>No tomes found in the library. Please check back later.</p>';
                    return;
                }

                let bookCardsHTML = '';
                books.forEach(book => {
                    bookCardsHTML += `
                        <a href="book.html?id=${book.id}" class="book-card-link">
                            <div class="book-card">
                                <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover">
                                <h3 class="book-title">${book.title}</h3>
                                <p class="book-author">${book.author}</p>
                            </div>
                        </a>
                    `;
                });
                fullCatalogGrid.innerHTML = bookCardsHTML;
            } catch (err) {
                fullCatalogGrid.innerHTML = `<p style="color: var(--accent-burgundy);">${err.message}</p>`;
            }
        };
        fetchAllBooks();
    }

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
