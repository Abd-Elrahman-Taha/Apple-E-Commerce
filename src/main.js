import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// 1. Scene Setup
// ---------------------------------------------------------
const scene = new THREE.Scene();

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.6);
fillLight.position.set(-5, 5, -7);
scene.add(fillLight);

const spotLight = new THREE.SpotLight(0xffffff, 2.5, 0, Math.PI / 6, 0.8, 2);
spotLight.position.set(0, 5, -15);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20); // Move closer to origin, handle positioning via GSAP

// Renderer
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true // Allow transparent background so CSS can shine through
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------
// 2. Load Model & Animations
// ---------------------------------------------------------
const loader = new GLTFLoader();
let mixer = null;
let model = null;

// Temporary holder group to decouple scroll rotations from base orientation
const modelGroup = new THREE.Group();
scene.add(modelGroup);

loader.load(
    '../3d_models/apple_logo.glb',
    (gltf) => {
        model = gltf.scene;
        // Base setup
        model.scale.set(0, 0, 0); // Start at 0 for load animation

        // Center the model in its local space
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center); // Align geometric center to origin

        modelGroup.add(model);

        // Position group for hero section
        const isMobile = window.innerWidth <= 768;
        modelGroup.position.set(isMobile ? 0 : 8, isMobile ? -5 : 0, 0);
        modelGroup.rotation.y = Math.PI * 0.5; // Start showing the side maybe

        console.log("✅ Apple logo loaded successfully!");

        if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        // Initialize GSAP Animations now that model is loaded
        initAnimations(isMobile);
    },
    (progress) => console.log('Loading: ' + (progress.loaded / progress.total * 100).toFixed(1) + '%'),
    (error) => console.error('Error loading model:', error)
);

// ---------------------------------------------------------
// 3. Resize Handler
// ---------------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Quick repositioning on resize
    if (modelGroup) {
        const isMobile = window.innerWidth <= 768;
        // Don't override completely if ScrollTrigger is controlling it,
        // but set responsive base values if needed.
        // ScrollTrigger.refresh() is called automatically via GSAP.
    }
});

// ---------------------------------------------------------
// 4. GSAP Animation Logic
// ---------------------------------------------------------
function initAnimations(isMobile) {
    // A) Intro Timeline (Page Load)
    const tlIntro = gsap.timeline();

    // 1. Navbar drops in
    tlIntro.fromTo('.apple-nav',
        { y: '-100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' }
    );

    // 2. Hero Text fades & slides up
    tlIntro.fromTo('.hero-title',
        { autoAlpha: 0, y: 50, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        "-=0.5"
    );
    tlIntro.fromTo('.hero-subtitle',
        { autoAlpha: 0, y: 30, filter: 'blur(10px)' },
        { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' },
        "-=0.7"
    );

    // Buttons
    tlIntro.fromTo(['.btn-apple-primary', '.btn-apple-link'],
        { autoAlpha: 0, scale: 0.9 },
        { autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.5)' },
        "-=0.5"
    );

    // 3. Model scales up and spins to position
    tlIntro.to(model.scale, {
        x: 2.2, y: 2.2, z: 2.2,
        duration: 2,
        ease: 'elastic.out(1, 0.7)'
    }, "-=1.5");

    tlIntro.to(modelGroup.rotation, {
        y: 0, // Face forward
        duration: 2,
        ease: 'power3.out'
    }, "-=2");


    // B) Scroll Animations
    // 1. Hero to Details section (Section 2)
    const tlScroll1 = gsap.timeline({
        scrollTrigger: {
            trigger: "#explore",
            start: "top bottom", // when top of trigger hits bottom of viewport
            end: "center center",
            scrub: 1, // smooth scrubbing
        }
    });

    // Move model to the left side and rotate
    tlScroll1.to(modelGroup.position, {
        x: isMobile ? 0 : -6,
        y: isMobile ? 5 : 0,
        z: 5,
        ease: 'power1.inOut'
    }, 0);

    tlScroll1.to(modelGroup.rotation, {
        x: Math.PI * -0.1,
        y: Math.PI * 1.5, // show the back / other side
        z: Math.PI * 0.1,
        ease: 'power1.inOut'
    }, 0);

    // Change background to purely dark gray
    tlScroll1.to('body', {
        backgroundColor: '#0a0a0a',
        ease: 'none'
    }, 0);


    // 2. Details to Final section (Section 3)
    const tlScroll2 = gsap.timeline({
        scrollTrigger: {
            trigger: ".specs-section",
            start: "top bottom",
            end: "center center",
            scrub: 1,
        }
    });

    // Move model to center and huge scale
    tlScroll2.to(modelGroup.position, {
        x: 0,
        y: 0,
        z: 10,
        ease: 'power1.inOut'
    }, 0);

    tlScroll2.to(modelGroup.rotation, {
        x: Math.PI * 0.2,
        y: Math.PI * 2, // Full spin
        z: 0,
        ease: 'power1.inOut'
    }, 0);

    tlScroll2.to('body', {
        backgroundColor: '#000000',
        ease: 'none'
    }, 0);

    // CSS Text Reveals on Scroll
    gsap.utils.toArray('.reveal-text').forEach((element) => {
        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                end: "bottom center",
                toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        });
    });
}

// ---------------------------------------------------------
// 5. Render Loop
// ---------------------------------------------------------
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Constant slow float/spin independent of scroll
    if (modelGroup) {
        modelGroup.position.y += Math.sin(clock.getElapsedTime()) * 0.002;
    }

    if (mixer) mixer.update(delta);

    renderer.render(scene, camera);
};

animate();