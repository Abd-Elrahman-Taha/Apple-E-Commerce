import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// 1. SCENE & CAMERA SETUP
// ---------------------------------------------------------
const scene = new THREE.Scene();

const cameraGroup = new THREE.Group();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Tightly lock the camera frame depth without clipping
const Z_FRAMING = 14; 
camera.position.set(0, 0, Z_FRAMING); 
camera.lookAt(0, 0, 0); 
cameraGroup.add(camera);
scene.add(cameraGroup);

// Premium Apple-Style Studio Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
keyLight.position.set(5, 10, 8);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffc1a0, 4.0); // Warm metallic accent for Titanium
rimLight.position.set(-8, 5, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xe0e0e0, 2.0);
fillLight.position.set(0, -5, 5);
scene.add(fillLight);

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------
// 2. WATCH LOADER & CENTERING LOGIC
// ---------------------------------------------------------
const loader = new GLTFLoader();

let model = null;
const modelRotationGroup = new THREE.Group();
const modelPositionGroup = new THREE.Group();
modelPositionGroup.add(modelRotationGroup);
scene.add(modelPositionGroup);

let isAtEnd = false; // Flag for infinite end rotation

function loadModel(path) {
    loader.load(
        path, 
        (gltf) => {
            model = gltf.scene;

            // Geometry Centering & Sizing
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            if (!box.isEmpty()) {
                box.getCenter(center);
                model.position.sub(center); 
                
                // Shrinking reference container volume to safely lock inside the Z_FRAMING
                const size = box.getSize(new THREE.Vector3()).length();
                if (size > 0.001) {
                    const scaleFactor = 12 / size; 
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }
            }

            model.traverse((node) => {
                if (node.isMesh) {
                    node.frustumCulled = false;
                }
            });

            modelRotationGroup.add(model);
            modelRotationGroup.updateMatrixWorld(true);

            // True precision local centering
            const trueBox = new THREE.Box3().setFromObject(modelRotationGroup);
            const trueCenter = trueBox.getCenter(new THREE.Vector3());
            modelRotationGroup.position.y -= trueCenter.y;
            modelRotationGroup.position.x -= trueCenter.x;
            modelRotationGroup.position.z -= trueCenter.z;

            // Setup the 'Drop-In' pre-animation state
            modelPositionGroup.position.set(0, -3, 0); 
            modelPositionGroup.scale.set(0.01, 0.01, 0.01); 
            
            // Initial tilt for presentation
            modelRotationGroup.rotation.set(Math.PI / 12, -Math.PI / 8, 0);

            const isMobile = window.innerWidth <= 768;
            initScrollAnimations(isMobile);
        },
        undefined,
        (e) => {
            if(path === '../3d_models/apple_watch_ultra_2.glb') {
                loadModel('/3d_models/apple_watch_ultra_2.glb'); 
            }
        }
    );
}

loadModel('../3d_models/apple_watch_ultra_2.glb');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------
// 3. GSAP SCROLL STORYTELLING
// ---------------------------------------------------------
function initScrollAnimations(isMobile) {

    // A. Intro Drop-in (Swoop dynamically up avoiding blank frames)
    const tlIntro = gsap.timeline();
    tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
    tlIntro.to('.reveal-hero', { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");
    
    tlIntro.to(modelPositionGroup.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' }, "-=1.0");
    tlIntro.to(modelPositionGroup.position, { y: 0, duration: 2.2, ease: 'power3.out' }, "-=2.2");

    // B. Master GSAP Scrub Engine
    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 
        }
    });

    // 1 -> 2: HEALTH (Text is LEFT, Watch rotates Right into view)
    masterTl.addLabel("sceneHealth")
            .to(modelRotationGroup.rotation, { x: Math.PI / 15, y: Math.PI / 3.5, z: 0.1, ease: 'power2.inOut', duration: 3 }, "sceneHealth")
            .to(camera.position, { x: 0, z: Z_FRAMING, y: 0.5, ease: 'power2.inOut', duration: 3 }, "sceneHealth")
            .to(rimLight, { intensity: 6.0, ease: 'power2.inOut', duration: 3 }, "sceneHealth");
            
    // 2 -> 3: DISPLAY (Text is RIGHT, Watch rotates completely Left facing directly)
    masterTl.addLabel("sceneDisplay")
            .to(modelRotationGroup.rotation, { x: 0, y: -Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
            .to(camera.position, { x: 0, z: Z_FRAMING, y: 1.0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

    // 3 -> 4: DURABILITY (Text is BOTTOM, Show off Titanium chassis framing natively)
    masterTl.addLabel("sceneDurability")
            .to(modelRotationGroup.rotation, { x: Math.PI / 10, y: -Math.PI / 1.8, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDurability")
            .to(camera.position, { x: 0, z: Z_FRAMING + 1, y: 0.5, ease: 'power2.inOut', duration: 3 }, "sceneDurability");

    // 4 -> 5: FINAL (Reset center showcase gently awaiting idle loop takeover)
    masterTl.addLabel("sceneFinal")
            .to(modelRotationGroup.rotation, { x: Math.PI / 15, y: Math.PI / 8, z: 0, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
            .to(camera.position, { x: 0, y: 1.5, z: Z_FRAMING, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
            .to(rimLight, { intensity: 4.0, ease: 'power3.inOut', duration: 3 }, "sceneFinal");

    // Seamlessly drop background to pure ultra space black when hitting bottom CTA
    gsap.to('#body-bg', {
        backgroundColor: '#050505',
        scrollTrigger: { trigger: "#smooth-wrapper", start: "bottom 150%", end: "bottom bottom", scrub: true }
    });

    // C. OMNIDIRECTIONAL ALTERNATING UI TEXT REVEALS
    gsap.utils.toArray('.gsap-reveal').forEach((element) => {
        let xOffset = 0;
        let yOffset = 0;
        
        if (element.classList.contains('from-left')) xOffset = -80;
        if (element.classList.contains('from-right')) xOffset = 80;
        if (element.classList.contains('from-bottom')) yOffset = 60;
        
        gsap.set(element, { x: xOffset, y: yOffset, opacity: 0, visibility: 'visible' });

        gsap.to(element, {
            scrollTrigger: { 
                trigger: element, 
                start: "top 80%", 
                end: "bottom center", 
                toggleActions: "play reverse play reverse"
            },
            opacity: 1, 
            x: 0, 
            y: 0, 
            duration: 1.2, 
            ease: 'power3.out'
        });
    });

    // Enable decoupled infinite rotation loop when Final phase is successfully entered
    ScrollTrigger.create({
        trigger: "#section-final",
        start: "top center",
        onEnter: () => isAtEnd = true,
        onLeaveBack: () => isAtEnd = false
    });
}

// ---------------------------------------------------------
// 4. CONTINUOUS IDLE PRE-RENDER LOOP
// ---------------------------------------------------------
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    if (modelPositionGroup) {
        // Continuous Math.sin breathing loop applies gravity float without disrupting GSAP rotations
        modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.15;

        // Decoupled infinite rotation explicitly triggers at end state
        if (isAtEnd) {
            modelPositionGroup.rotation.y += 0.0035;
        } else {
            modelPositionGroup.rotation.y = THREE.MathUtils.lerp(modelPositionGroup.rotation.y, 0, 0.05);
        }
    }

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
};

animate();
