
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

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

document.addEventListener('mousemove', onDocumentMouseMove);

// --- GYROSCOPE SUPPORT FOR MOBILE ---
function onDeviceOrientation(event) {
    if (window.innerWidth < 768) { // Only enable on mobile/tablet
        // Limit range and smoothing
        const beta = Math.min(Math.max(event.beta, -45), 45); // X-axis tilt (-180 to 180)
        const gamma = Math.min(Math.max(event.gamma, -45), 45); // Y-axis tilt (-90 to 90)

        // Map to mouse coordinate space
        mouseX = gamma * 15;
        mouseY = beta * 15;
    }
}

// Request permission for iOS 13+ devices
if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    // Permission must be requested in response to a user action (click), 
    // so we'll add a one-time listener to the body or an overlay if strictly needed.
    // For now, we will try to attach it, but on iOS it might need a specific tap.
    // A common pattern is to ask on the first interaction.
    document.body.addEventListener('click', function () {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', onDeviceOrientation);
                }
            })
            .catch(console.error);
    }, { once: true });
} else {
    // Non-iOS or older devices
    window.addEventListener('deviceorientation', onDeviceOrientation);
}

// --- SCROLL TRANSFORM EFFECT ---
// Define states for different sections
const SECTION_STATES = {
    'home': {
        rotationSpeed: 0.002,
        layerTilt: 0,
        color: 0x306998,
        particleColor: 0x00f3ff,
        cameraZ: 10
    },
    'about': {
        rotationSpeed: 0.005,
        layerTilt: 0.5, // Tilted layers
        color: 0xff00cc, // Magenta
        particleColor: 0x00f3ff,
        cameraZ: 15 // Pull back
    },
    'skills': {
        rotationSpeed: 0.01,
        layerTilt: Math.PI / 2, // Vertical walls
        color: 0x00ff00, // Matrix Green
        particleColor: 0xffffff,
        cameraZ: 5 // Zoom in
    },
    'projects': {
        rotationSpeed: -0.005,
        layerTilt: Math.PI / 4,
        color: 0xffd700, // Gold
        particleColor: 0xff4500, // Orange
        cameraZ: 12
    },
    'contact': {
        rotationSpeed: 0,
        layerTilt: 0,
        color: 0xffffff,
        particleColor: 0x00f3ff,
        cameraZ: 20 // Far view
    }
};

let currentState = SECTION_STATES['home']; // Default
let targetState = SECTION_STATES['home'];

// Interpolation helper
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Color interpolation helper
function lerpColor(color1, color2, t) {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    c1.lerp(c2, t);
    return c1;
}

// Variables to control the speed of the flow
let baseSpeed = 0.1;
let warpSpeed = 0;
let activeSection = '';

function triggerWarp() {
    warpSpeed = 2.0; // Stronger surge on transition
}

function updateState(sectionId) {
    if (SECTION_STATES[sectionId]) {
        targetState = SECTION_STATES[sectionId];
        triggerWarp();
    }
}

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smoothly transition current state to target state
    currentState.rotationSpeed = lerp(currentState.rotationSpeed, targetState.rotationSpeed, 0.05);
    currentState.layerTilt = lerp(currentState.layerTilt, targetState.layerTilt, 0.05);
    currentState.cameraZ = lerp(currentState.cameraZ, targetState.cameraZ, 0.05);

    // Lerp colors
    const currentLayerColor = lerpColor(layerMaterial.color, targetState.color, 0.05);
    layerMaterial.color.set(currentLayerColor);

    const currentParticleColor = lerpColor(pMaterial.color, targetState.particleColor, 0.05);
    pMaterial.color.set(currentParticleColor);

    // Update Camera Position
    camera.position.z = lerp(camera.position.z, currentState.cameraZ, 0.05);


    // Decay warp speed back to 0 smoothy
    warpSpeed *= 0.95;
    const currentSpeed = baseSpeed + warpSpeed;

    // 1. Smooth Camera Movement (Lerp)
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    camera.rotation.y += 0.03 * (-targetX - camera.rotation.y);
    camera.rotation.x += 0.03 * (-targetY - camera.rotation.x);

    // 2. Animate Layers
    layers.forEach((layer, index) => {
        // Rotation based on state
        layer.rotation.z += currentState.rotationSpeed * (index % 2 === 0 ? 1 : -1);

        // Tilt transition (rotate X to change structure)
        layer.rotation.x = lerp(layer.rotation.x, currentState.layerTilt, 0.05);

        // Subtle breathing
        const scale = 1 + Math.sin(time + index) * 0.02;
        layer.scale.set(scale, scale, 1);

        // Move layers forward
        layer.position.z += currentSpeed;
        if (layer.position.z > 10) {
            layer.position.z -= 60; // Loop back
        }
    });

    // 3. Animate Data Stream
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

// 4. Section Transition Observer
const observerConfig = {
    threshold: 0.2 // Trigger earlier for warp effect
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Trigger Warp Effect if switching to a new section
            if (entry.target.id && entry.target.id !== activeSection) {
                activeSection = entry.target.id;
                // Update 3D State
                updateState(activeSection);
            }
            entry.target.classList.add('visible'); // Fade-in CSS
        }
    });
}, observerConfig);

document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

// 5. Contact Form Handler (AJAX)
// Using FormSubmit.co for backend-free email handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.form-submit-btn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(this);

        fetch(this.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    submitBtn.innerText = 'Sent!';
                    submitBtn.style.background = '#00ff00'; // Green success
                    submitBtn.style.color = '#000';
                    this.reset();
                    setTimeout(() => {
                        submitBtn.innerText = originalText;
                        submitBtn.style.background = ''; // Reset
                        submitBtn.style.color = '';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitBtn.innerText = 'Failed';
                submitBtn.style.background = '#ff0000'; // Red error
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            });
    });
}
