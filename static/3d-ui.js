
// 3D Tilt Effect for Cards and Panels
document.addEventListener('DOMContentLoaded', () => {
    const tiltElements = document.querySelectorAll('.card, .project-card, .bio-panel, .timeline-item');

    tiltElements.forEach(el => {
        el.addEventListener('mousemove', handleTilt);
        el.addEventListener('mouseleave', resetTilt);
    });

    function handleTilt(e) {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top; // y position within the element

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        // Add subtle scale
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    function resetTilt(e) {
        const el = e.currentTarget;
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }

    // enhance initial load animation
    // Target both .fade-in (index) and .fade-in-auto (work/about) and sections
    const fadeElems = document.querySelectorAll('.fade-in, .fade-in-auto, section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) rotateX(0)';
            }
        });
    }, { threshold: 0.1 });

    fadeElems.forEach(el => {
        // Only apply if it's meant to be animated and not already visible
        // We set initial state here
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px) rotateX(10deg)';
        el.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(el);
    });
});
