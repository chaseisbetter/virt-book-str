document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) {
        console.error('Starfield canvas not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const setCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    const createParticles = () => {
        particles = [];
        const particleCount = Math.floor(canvas.width / 25); // More stars
        const trailCount = Math.floor(canvas.width / 150); // Fewer trails

        // Create stars
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                type: 'star',
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedY: Math.random() * 0.2 + 0.1,
                opacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleDirection: 1,
            });
        }

        // Create golden particle trails
        for (let i = 0; i < trailCount; i++) {
            particles.push({
                type: 'trail',
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 1,
                speedY: Math.random() * 0.5 + 0.3,
                opacity: Math.random() * 0.6 + 0.4,
                length: Math.floor(Math.random() * 10) + 5,
            });
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // Update position
            p.y += p.speedY;

            // Reset particle if it goes off-screen
            if (p.y > canvas.height) {
                p.y = -p.size;
                p.x = Math.random() * canvas.width;
            }

            // Draw particle based on type
            if (p.type === 'star') {
                // Twinkle effect
                p.opacity += p.twinkleSpeed * p.twinkleDirection;
                if (p.opacity > 0.8 || p.opacity < 0.2) {
                    p.twinkleDirection *= -1;
                }
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'trail') {
                ctx.beginPath();
                const gradient = ctx.createLinearGradient(p.x, p.y - p.length * p.size, p.x, p.y);
                gradient.addColorStop(0, `rgba(212, 175, 55, 0)`);
                gradient.addColorStop(1, `rgba(212, 175, 55, ${p.opacity})`);
                ctx.fillStyle = gradient;
                ctx.rect(p.x, p.y - p.length * p.size, p.size, p.length * p.size);
                ctx.fill();
            }
        });

        animationFrameId = requestAnimationFrame(animate);
    };

    const setup = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        setCanvasSize();
        createParticles();
        animate();
    };

    // Initial setup
    setup();

    // Re-setup on window resize (debounced for performance)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setup, 250);
    });

    // --- Parallax Scrolling Effect ---
    const backgroundContainer = document.getElementById('eternal-background');
    if (backgroundContainer) {
        let isTicking = false;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    backgroundContainer.style.transform = `translateY(${scrollY * 0.5}px)`;
                    isTicking = false;
                });
                isTicking = true;
            }
        });
    }
});
