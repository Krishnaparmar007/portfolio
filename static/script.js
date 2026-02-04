// --- 3D BACKGROUND: "THE DEEP LEARNING FLOW" ---
const scene = new THREE.Scene();
// Add subtle fog for depth perception
scene.fog = new THREE.FogExp2(0x030303, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 10;

// --- COMPONENT 1: CONVOLUTIONAL LAYERS (Feature Maps) ---
// A series of square grids representing layers of a neural network
const layerCount = 6;
const layerGap = 10;
const layers = [];

const layerGeometry = new THREE.PlaneGeometry(30, 30, 20, 20);
const layerMaterial = new THREE.LineBasicMaterial({
    color: 0x306998, // Python Blue
    transparent: true,
    opacity: 0.15
});

for (let i = 0; i < layerCount; i++) {
    const layer = new THREE.LineSegments(new THREE.WireframeGeometry(layerGeometry), layerMaterial);
    layer.position.z = -i * layerGap;
    layer.rotation.z = Math.PI / 4; // Diamond / Neural shape
    scene.add(layer);
    layers.push(layer);
}

// --- COMPONENT 2: THE DATA STREAM (Tensors) ---
// Particles moving forward through the layers
const particleCount = 400;
const pGeometry = new THREE.BufferGeometry();
const pPositions = new Float32Array(particleCount * 3);
const pSpeeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 40; // x
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
    pPositions[i * 3 + 2] = -Math.random() * 60; // z (Start deep)
    pSpeeds[i] = Math.random() * 0.2 + 0.05; // Different speeds
}

pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

const pMaterial = new THREE.PointsMaterial({
    color: 0x00f3ff, // Neon Cyan
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(pGeometry, pMaterial);
scene.add(particleSystem);


// --- INTERACTION: ULTRA-SMOOTH MOUSE TRACKING ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// --- SCROLL WARP EFFECT: DATA SURGE ON SECTION CHANGE ---
// Variables to control the speed of the flow
let baseSpeed = 0.1;
let warpSpeed = 0;
let activeSection = '';

function triggerWarp() {
    warpSpeed = 1.5; // Instant surge
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Decay warp speed back to 0 smoothy
    warpSpeed *= 0.95;
    const currentSpeed = baseSpeed + warpSpeed;

    // 1. Smooth Camera Movement (Lerp)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    // Very small interpolation factor (0.03) for "heavy" smooth feel
    camera.rotation.y += 0.03 * (-targetX - camera.rotation.y);
    camera.rotation.x += 0.03 * (-targetY - camera.rotation.x);

    // 2. Animate Layers (Pulse + Flow towards camera)
    layers.forEach((layer, index) => {
        // Gentle rotation
        layer.rotation.z += 0.002 * (index % 2 === 0 ? 1 : -1);
        // Subtle breathing
        const scale = 1 + Math.sin(time + index) * 0.02;
        layer.scale.set(scale, scale, 1);

        // Move layers forward to simulate passing through them
        layer.position.z += currentSpeed;
        if (layer.position.z > 10) {
            layer.position.z -= 60; // Loop back
        }
    });

    // 3. Animate Data Stream (Flow Forward)
    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        // Move forward (Z-axis) with warp speed
        positions[i * 3 + 2] += pSpeeds[i] + currentSpeed;

        // Reset if passed camera
        if (positions[i * 3 + 2] > 10) {
            positions[i * 3 + 2] = -60; // Reset to deep back
            positions[i * 3] = (Math.random() - 0.5) * 40; // New X
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // New Y
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

// Responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- UI INTERACTION LOGIC ---

// 1. Loading Screen
window.addEventListener('load', () => {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// 2. Scroll Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    const scrollBar = document.getElementById('scrollProgress');
    if (scrollBar) scrollBar.style.width = scrolled + "%";
});

// 3. Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('nav a');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('active');
        });
    });
}

// 4. Section Transition Observer (Triggers 3D Warp) & Fade In
const observerConfig = {
    threshold: 0.2 // Trigger earlier for warp effect
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Trigger Warp Effect if switching to a new section
            if (entry.target.id && entry.target.id !== activeSection) {
                activeSection = entry.target.id;
                triggerWarp();
            }
            entry.target.classList.add('visible'); // Fade-in CSS
        }
    });
}, observerConfig);

document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});
