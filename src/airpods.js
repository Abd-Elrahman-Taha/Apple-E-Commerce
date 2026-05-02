import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// 1. Scene Setup
// ---------------------------------------------------------
const scene = new THREE.Scene();

// Lights setup to allow dynamic adjustments per section
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
fillLight.position.set(-5, 5, -7);
scene.add(fillLight);

const spotLight = new THREE.SpotLight(0xffffff, 2, 0, Math.PI / 6, 0.8, 2);
spotLight.position.set(0, 5, -10);
spotLight.target.position.set(0, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

// Renderer
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------
// 2. Load Model & Setup Animations
// ---------------------------------------------------------
const loader = new GLTFLoader();
let mixer = null;
let model = null;
let gltfAction = null;

const modelGroup = new THREE.Group();
scene.add(modelGroup);

loader.load(
    '/3d_models/airpods.glb', 
    (gltf) => {
        model = gltf.scene;
        
        // Setup initial state
        model.scale.set(0, 0, 0); 
        
        // Center model geometrically
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        // Initial responsive positioning for Hero
        const isMobile = window.innerWidth <= 768;
        modelGroup.add(model);
        modelGroup.position.set(0, isMobile ? -2 : -1, 0);

        console.log("✅ AirPods loaded successfully!");

        // Setup the built-in animation
        if (gltf.animations && gltf.animations.length > 0) {
            console.log("Found animations inside GLB.");
            mixer = new THREE.AnimationMixer(model);
            gltfAction = mixer.clipAction(gltf.animations[0]);
            gltfAction.play();
            gltfAction.paused = true; // Handing control over to ScrollTrigger
        }

        // Initialize GSAP Animations
        initAnimations(isMobile);
    },
    (progress) => console.log('Loading: ' + (progress.loaded / progress.total * 100).toFixed(1) + '%'),
    (error) => {
        console.error('Error loading model. Attempting alternative path...', error);
        // Fallback relative path in case Vite mounts public differently
        loader.load('../3d_models/airpods.glb', gltf => {
           // Same logic injected if the first path failed...
           model = gltf.scene;
           model.scale.set(0,0,0);
           const box = new THREE.Box3().setFromObject(model);
           const center = box.getCenter(new THREE.Vector3());
           model.position.sub(center);
           const isMobile = window.innerWidth <= 768;
           modelGroup.add(model);
           modelGroup.position.set(0, isMobile ? -2 : -1, 0);
           if (gltf.animations && gltf.animations.length > 0) {
               mixer = new THREE.AnimationMixer(model);
               gltfAction = mixer.clipAction(gltf.animations[0]);
               gltfAction.play();
               gltfAction.paused = true;
           }
           initAnimations(isMobile);
        });
    }
);

// ---------------------------------------------------------
// 3. Resize Handler
// ---------------------------------------------------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------
// 4. GSAP Animation Logic
// ---------------------------------------------------------
function initAnimations(isMobile) {
    // A) Intro Timeline (Hero Load)
    const tlIntro = gsap.timeline();

    tlIntro.fromTo('.apple-nav', 
        { y: '-100%', opacity: 0 }, 
        { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' }
    );

    tlIntro.fromTo('.reveal-hero', 
        { opacity: 0, y: 30, filter: 'blur(10px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'power3.out' },
        "-=0.5"
    );

    // Initial scale-in of the 3D AirPods
    tlIntro.to(model.scale, {
        x: 1.5, y: 1.5, z: 1.5,
        duration: 2,
        ease: 'elastic.out(1, 0.7)'
    }, "-=1.5");


    // B) Master ScrollTrigger controlling the GLB Animation Mixer
    if (gltfAction) {
        ScrollTrigger.create({
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                // Scrub the animation based on scroll progress (0 to 1) 
                // multiplied by the total duration of the clip
                gltfAction.time = self.progress * gltfAction.getClip().duration;
                // Force an update to the mixer state
                mixer.update(0); 
            }
        });
    }

    // C) Section-Specific Scene Animations (Lights, Background, Position)

    // Section 2: Noise Cancellation (Dark, focused light)
    const tlANC = gsap.timeline({
        scrollTrigger: {
            trigger: "#section-anc",
            start: "top bottom",
            end: "center center",
            scrub: 1
        }
    });

    tlANC.to(modelGroup.position, {
        x: isMobile ? 0 : 4,
        y: 0,
        z: 2,
        ease: 'power1.inOut'
    }, 0);
    
    // Dim lights to simulate noise cancellation environment
    tlANC.to(ambientLight, { intensity: 0.1 }, 0);
    tlANC.to(dirLight, { intensity: 0.5 }, 0);


    // Section 3: Transparency Mode (Brighter, wider light, gray bg)
    const tlTrans = gsap.timeline({
        scrollTrigger: {
            trigger: "#section-transparency",
            start: "top bottom",
            end: "center center",
            scrub: 1
        }
    });

    tlTrans.to(modelGroup.position, {
        x: isMobile ? 0 : -4,
        y: 0,
        z: 0,
        ease: 'power1.inOut'
    }, 0);

    // Brighten lights and shift background for "transparency"
    tlTrans.to(ambientLight, { intensity: 0.7 }, 0);
    tlTrans.to(dirLight, { intensity: 1.5 }, 0);
    tlTrans.to('#body-bg', { backgroundColor: '#18181a' }, 0);


    // Section 4: Battery (Calm, stable)
    const tlBattery = gsap.timeline({
        scrollTrigger: {
            trigger: "#section-battery",
            start: "top bottom",
            end: "center center",
            scrub: 1
        }
    });

    tlBattery.to(modelGroup.position, {
        x: isMobile ? 0 : 3,
        y: 0,
        z: 4,
        ease: 'power1.inOut'
    }, 0);

    tlBattery.to('#body-bg', { backgroundColor: '#0a0a0c' }, 0);


    // Section 5: Design (Center focus, cinematic lighting)
    const tlDesign = gsap.timeline({
        scrollTrigger: {
            trigger: "#section-design",
            start: "top bottom",
            end: "center center",
            scrub: 1
        }
    });

    tlDesign.to(modelGroup.position, {
        x: 0,
        y: 0,
        z: 6,
        ease: 'power1.inOut'
    }, 0);

    // Fade back down to pure darkness for final cinematic close
    tlDesign.to('#body-bg', { backgroundColor: '#000000' }, 0);

    // D) CSS Text Reveals on Scroll
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

    // We no longer call mixer.update(delta) automatically here because 
    // we want its timeline purely controlled by the scroll scrub mechanism above.

    // Add subtle ambient floating so it never feels completely frozen
    if (modelGroup) {
        modelGroup.position.y += Math.sin(clock.getElapsedTime() * 1.5) * 0.001; 
        modelGroup.rotation.y += 0.005 ; // extremely tiny spin
    }

    renderer.render(scene, camera);
};

animate();
