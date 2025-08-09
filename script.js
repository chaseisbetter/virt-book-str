document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to Mystic Pages!');

    // Smooth Scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Floating menu bar logic
    let lastScrollTop = 0;
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scroll Down
            header.style.top = `-${header.offsetHeight}px`;
        } else {
            // Scroll Up
            header.style.top = '0';
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });

    // Add subtle floating effect to category cards
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        card.style.animation = `float 6s ease-in-out ${index * 0.4}s infinite`;
    });
});

// We need to add the @keyframes for the float animation in the CSS file.
// I will do that in the next step.
