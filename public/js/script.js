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

    // --- Book Catalog & Filtering Logic ---
    const fullCatalogGrid = document.querySelector('#full-catalog .book-grid');
    let allBooks = []; // To store the master list of books

    const renderBookGrid = (books) => {
        if (!fullCatalogGrid) return;
        if (books.length === 0) {
            fullCatalogGrid.innerHTML = '<p>No novels match your criteria. Try adjusting the filters.</p>';
            return;
        }

        const bookCardsHTML = books.map(book => `
            <a href="book.html?id=${book.id}" class="book-card-link">
                <div class="book-card">
                    <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                </div>
            </a>
        `).join('');
        fullCatalogGrid.innerHTML = bookCardsHTML;
    };

    const fetchAndDisplayBooks = async () => {
        try {
            const res = await fetch('/api/books');
            if (!res.ok) throw new Error('Could not fetch the library catalog.');
            allBooks = await res.json();
            renderBookGrid(allBooks);
        } catch (err) {
            if (fullCatalogGrid) {
                fullCatalogGrid.innerHTML = `<p style="color: var(--accent-burgundy);">${err.message}</p>`;
            }
        }
    };

    if (fullCatalogGrid) {
        fetchAndDisplayBooks().then(() => {
            // This runs after books are fetched
            populateStaffPicks();
            initializeSwiper();
        });
    }

    // --- Staff Picks Carousel ---
    const populateStaffPicks = () => {
        const wrapper = document.getElementById('staff-picks-wrapper');
        if (!wrapper || allBooks.length === 0) return;

        const staffPicks = allBooks.slice(0, 6); // Pick first 6 books as staff picks

        const slidesHTML = staffPicks.map(book => `
            <div class="swiper-slide">
                <div class="staff-pick-card">
                    <div class="staff-pick-badge">Staff Pick</div>
                    <img src="${book.cover_image}" alt="${book.title}" class="book-cover">
                    <div class="staff-pick-card-content">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <p class="staff-pick-comment">"A truly magical read that you won't be able to put down."</p>
                        <a href="book.html?id=${book.id}" class="btn btn-secondary" style="margin-top: 1rem;">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

        wrapper.innerHTML = slidesHTML;
    };

    const initializeSwiper = () => {
        if (document.querySelector('.staff-picks-slider')) {
            new Swiper('.staff-picks-slider', {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 30,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 40,
                    },
                }
            });
        }
    };

    // --- Filter Sidebar Interactivity ---
    const filterSidebar = document.getElementById('filter-sidebar');
    const openFiltersBtn = document.getElementById('open-filters-btn');
    const closeFiltersBtn = document.getElementById('close-filters-btn');

    if (filterSidebar && openFiltersBtn && closeFiltersBtn) {
        openFiltersBtn.addEventListener('click', () => {
            filterSidebar.classList.add('open');
        });

        closeFiltersBtn.addEventListener('click', () => {
            filterSidebar.classList.remove('open');
        });
    }

    // --- Price Slider Initialization ---
    const priceSlider = document.getElementById('price-slider');
    if (priceSlider) {
        const minPriceDisplay = document.getElementById('min-price-display');
        const maxPriceDisplay = document.getElementById('max-price-display');

        noUiSlider.create(priceSlider, {
            start: [0, 100],
            connect: true,
            range: {
                'min': 0,
                'max': 100
            },
            format: {
                to: function (value) {
                    return '$' + value.toFixed(0);
                },
                from: function (value) {
                    return Number(value.replace('$', ''));
                }
            }
        });

        priceSlider.noUiSlider.on('update', (values, handle) => {
            minPriceDisplay.innerHTML = values[0];
            maxPriceDisplay.innerHTML = values[1];
        });
    }

    // --- Genre Filter Population ---
    const genreFilterContainer = document.querySelector('.filter-group-content');
    if (genreFilterContainer) {
        const populateGenres = async () => {
            try {
                const res = await fetch('/api/books');
                const books = await res.json();
                const genres = [...new Set(books.map(book => book.category.main))];

                genreFilterContainer.innerHTML = genres.map(genre =>
                    `<button class="genre-chip" data-genre="${genre}">${genre}</button>`
                ).join('');

                genreFilterContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('genre-chip')) {
                        e.target.classList.toggle('active');
                    }
                });

            } catch (err) {
                genreFilterContainer.innerHTML = '<p class="text-sm text-muted">Could not load genres.</p>';
            }
        };
        populateGenres();
    }

    // --- Filter Data Collection & Application ---
    const applyFiltersBtn = document.querySelector('.filter-buttons .btn-primary');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            // Get selected genres
            const selectedGenres = [...document.querySelectorAll('.genre-chip.active')].map(chip => chip.dataset.genre);

            // Get price range
            const priceRange = priceSlider.noUiSlider.get();
            const minPrice = Number(priceRange[0].replace('$', ''));
            const maxPrice = Number(priceRange[1].replace('$', ''));

            // Filter the master list of books
            const filteredBooks = allBooks.filter(book => {
                const genreMatch = selectedGenres.length === 0 || selectedGenres.includes(book.category.main);
                const priceMatch = book.price.final >= minPrice && book.price.final <= maxPrice;
                // Rating filter can be added here in the future
                return genreMatch && priceMatch;
            });

            renderBookGrid(filteredBooks);
            filterSidebar.classList.remove('open'); // Close sidebar after applying
        });
    }

    // --- Filter Reset Logic ---
    const resetFiltersBtn = document.querySelector('.filter-buttons .btn-secondary');
    if (resetFiltersBtn && priceSlider) {
        resetFiltersBtn.addEventListener('click', () => {
            // Reset genre chips
            document.querySelectorAll('.genre-chip.active').forEach(chip => {
                chip.classList.remove('active');
            });

            // Reset price slider
            priceSlider.noUiSlider.set([0, 100]);

            // Re-render the grid with all books
            renderBookGrid(allBooks);

            filterSidebar.classList.remove('open'); // Close sidebar after resetting
        });
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

    // --- Intersection Observer for Animations ---
    const animatedElements = document.querySelectorAll('main > section, .card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible-animation');
                entry.target.classList.remove('hidden-for-animation');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    animatedElements.forEach(el => {
        el.classList.add('hidden-for-animation');
        observer.observe(el);
    });

    // --- Hamburger Menu Toggle ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (hamburgerBtn && mobileNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('is-open');
            mobileNav.classList.toggle('open');
        });
    }
});
