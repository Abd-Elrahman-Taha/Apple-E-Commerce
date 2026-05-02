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
camera.position.set(0, 0, 20);
camera.lookAt(0, 0, 0);
cameraGroup.add(camera);
scene.add(cameraGroup);

// Premium Apple-Style Studio Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(5, 10, 8);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xa0c4ff, 3.5); // Cool premium edge glow
rimLight.position.set(-8, 5, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xe0e0e0, 1.5);
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
// 2. IPAD LOADER & CENTERING LOGIC
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

                const size = box.getSize(new THREE.Vector3()).length();
                if (size > 0.001) {
                    const scaleFactor = 16 / size;
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }
            }

            // CRITICAL FIX: Disable frustum culling to prevent model from vanishing mid-scroll
            model.traverse((node) => {
                if (node.isMesh) {
                    node.frustumCulled = false;
                }
            });

            modelRotationGroup.add(model);
            modelRotationGroup.updateMatrixWorld(true);

            // Re-calc specific geometric center to perfectly lock iPad vertically over (0,0)
            const trueBox = new THREE.Box3().setFromObject(modelRotationGroup);
            const trueCenter = trueBox.getCenter(new THREE.Vector3());
            modelRotationGroup.position.y -= trueCenter.y;
            modelRotationGroup.position.x -= trueCenter.x;
            modelRotationGroup.position.z -= trueCenter.z;

            // Initial Pose Setup (Centered, tilted, ready for intro drop)
            modelPositionGroup.position.set(0, -3, 0); // Drop it below viewport initially
            modelPositionGroup.scale.set(0.01, 0.01, 0.01); // Hide dynamically for the fade-in scale

            // Native iPad models are usually flat, so we rotate X up to face camera
            modelRotationGroup.rotation.set(Math.PI * 0.45, -Math.PI * 0.1, 0);

            const isMobile = window.innerWidth <= 768;
            initScrollAnimations(isMobile);
        },
        undefined,
        (e) => {
            if (path === '../3d_models/Ipad.glb') {
                loadModel('/3d_models/Ipad.glb');
            }
        }
    );
}

loadModel('../3d_models/Ipad.glb');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------
// 3. GSAP SCROLL STORYTELLING
// ---------------------------------------------------------
function initScrollAnimations(isMobile) {

    // A. Intro Drop (Fires immediately upon GLB model load)
    const tlIntro = gsap.timeline();
    tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
    tlIntro.to('.reveal-hero', { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");

    // Graceful iPad cinematic drop-in reveal
    tlIntro.to(modelPositionGroup.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' }, "-=1.0");
    tlIntro.to(modelPositionGroup.position, { y: 0, duration: 2.2, ease: 'power3.out' }, "-=2.2");

    // B. Master 3D Timeline (Syncing to sections)
    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5
        }
    });

    // 1 -> 2: PERFORMANCE (Text is LEFT, iPad rotates right IN PLACE)
    masterTl.addLabel("scenePerformance")
        .to(modelRotationGroup.rotation, { x: Math.PI / 2.2, y: Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(camera.position, { x: 0, z: 20, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(rimLight, { intensity: 5.0, ease: 'power2.inOut', duration: 3 }, "scenePerformance");

    // 2 -> 3: DISPLAY (Text is RIGHT, iPad rotates left IN PLACE)
    masterTl.addLabel("sceneDisplay")
        .to(modelRotationGroup.rotation, { x: Math.PI / 2.2, y: -Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(camera.position, { x: 0, z: 20, y: 1.5, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(rimLight, { intensity: 5.0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

    // 3 -> 4: PENCIL (Text is BOTTOM, iPad lays completely flat showing screen head-on or deck)
    masterTl.addLabel("scenePencil")
        .to(modelRotationGroup.rotation, { x: 0, y: 0, z: 0, ease: 'power2.inOut', duration: 3 }, "scenePencil")
        .to(camera.position, { x: 0, z: 18, y: 8, ease: 'power2.inOut', duration: 3 }, "scenePencil")
        .to(rimLight, { intensity: 3.0, ease: 'power2.inOut', duration: 3 }, "scenePencil");

    // 4 -> 5: DESIGN (Text is LEFT, iPad rotates right IN PLACE to show impossibly thin profile)
    masterTl.addLabel("sceneDesign")
        .to(modelRotationGroup.rotation, { x: Math.PI / 2, y: -Math.PI / 2.2, z: Math.PI / 12, ease: 'power2.inOut', duration: 3 }, "sceneDesign")
        .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDesign");

    // 5 -> FINAL: HERO (Centered pristine hover, returned to starting pose approximately)
    masterTl.addLabel("sceneFinal")
        .to(modelRotationGroup.rotation, { x: Math.PI * 0.45, y: Math.PI * 0.1, z: 0, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
        .to(camera.position, { x: 0, y: 2, z: 22, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
        .to(rimLight, { intensity: 3.5, color: '#a0c4ff', ease: 'power3.inOut', duration: 3 }, "sceneFinal");

    // Seamlessly transition background to deep black at end
    gsap.to('#body-bg', {
        backgroundColor: '#000000',
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

    // D. INFINITE ROTATION TOGGLE
    ScrollTrigger.create({
        trigger: "#section-final",
        start: "top center",
        onEnter: () => isAtEnd = true,
        onLeaveBack: () => isAtEnd = false
    });
}

// ---------------------------------------------------------
// 4. CONTINUOUS IDLE LOOP
// ---------------------------------------------------------
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    if (modelPositionGroup) {
        // Continuous Math.sin breathing loop to simulate infinite hovering gravity
        modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.2;

        // Apply clean infinite rotation once at end section
        if (isAtEnd) {
            modelPositionGroup.rotation.y += 0.0035;
        } else {
            // Smoothly ease rotation back to exact 0 when user scrolls out of final section
            modelPositionGroup.rotation.y = THREE.MathUtils.lerp(modelPositionGroup.rotation.y, 0, 0.05);
        }
    }

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
};

animate();
