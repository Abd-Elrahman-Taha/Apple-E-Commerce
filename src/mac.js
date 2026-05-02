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
camera.position.set(0, 0, 16);
camera.lookAt(0, 0, 0);
cameraGroup.add(camera);
scene.add(cameraGroup);

// Premium Apple-Style Studio Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
keyLight.position.set(5, 10, 8);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xa0c4ff, 3.0); // Cool premium edge glow
rimLight.position.set(-8, 5, -10);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xe0e0e0, 1.2);
fillLight.position.set(0, -5, 5);
scene.add(fillLight);

// Screen glow point light
const screenGlow = new THREE.PointLight(0xffffff, 0, 15);
screenGlow.position.set(0, 2, 2);

const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------
// 2. MACBOOK LOADER & HINGE ALGORITHM
// ---------------------------------------------------------
const loader = new GLTFLoader();

let model = null;
const modelRotationGroup = new THREE.Group();
const modelPositionGroup = new THREE.Group();
modelPositionGroup.add(modelRotationGroup);
scene.add(modelPositionGroup);

let lidPivot = new THREE.Group();
let closedAngle = 0;
let openAngle = -Math.PI * 0.6; // ~108 degrees open

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

            // ==========================================
            // CRITICAL FIX: DO NOT LET IT DISAPPEAR
            // ==========================================
            // Prevent Three.js view-frustum culling bugs resulting from 
            // massive scalar and positional group reorganizations.
            model.traverse((node) => {
                if (node.isMesh) {
                    node.frustumCulled = false;
                }
            });

            modelRotationGroup.add(model);
            modelRotationGroup.updateMatrixWorld(true);

            // ==========================================
            // SAFE GEOMETRY LOGIC FOR LID DETECT
            // ==========================================
            let mainGroups = [];
            model.traverse((child) => {
                if (child.isGroup && child.children && child.children.length >= 2) {
                    let hasLargeChildren = child.children.filter(c => {
                        let meshCount = 0;
                        c.traverse(n => { if (n.isMesh) meshCount++; });
                        return meshCount >= 2;
                    });
                    if (hasLargeChildren.length >= 2 && mainGroups.length === 0) {
                        mainGroups = hasLargeChildren;
                    }
                }
            });

            let baseNode = null;
            let lidNode = null;

            if (mainGroups.length >= 2) {
                // Determine base vs lid using bounding box volume (base is denser/larger)
                let groupsWithStats = mainGroups.map(g => {
                    let gBox = new THREE.Box3().setFromObject(g);
                    let gSize = gBox.getSize(new THREE.Vector3());
                    return { group: g, volume: gSize.x * gSize.y * gSize.z };
                });
                groupsWithStats.sort((a, b) => b.volume - a.volume);
                baseNode = groupsWithStats[0].group;
                lidNode = groupsWithStats[1].group;
            } else {
                // Fallbacks if node parser fails
                model.traverse((child) => {
                    if (child.name === 'VCQqxpxkUlzqcJI_62') lidNode = child;
                    if (child.name === 'BoBvWqDHZjAeVrp_44') baseNode = child;
                });
            }

            // ==========================================
            // BUILD THE PROPER HINGE PIVOT SYSTEM
            // ==========================================
            if (baseNode && lidNode) {
                const baseBox = new THREE.Box3().setFromObject(baseNode);
                const lidBox = new THREE.Box3().setFromObject(lidNode);

                // Math: Pivot is typically at the absolute back (minZ) and top (maxY) of the base 
                const hingeX = baseBox.getCenter(new THREE.Vector3()).x;
                const hingeY = baseBox.max.y;
                const hingeZ = baseBox.min.z + (baseBox.max.z - baseBox.min.z) * 0.05;

                lidPivot.position.set(hingeX, hingeY, hingeZ);
                modelRotationGroup.add(lidPivot);
                lidPivot.add(screenGlow);

                // Re-parent cleanly for hinge physics 
                lidPivot.attach(lidNode);

                // Detect native model rest state (is it exported open or closed?)
                const baseHeight = baseBox.getSize(new THREE.Vector3()).y;
                const lidHeight = lidBox.getSize(new THREE.Vector3()).y;

                if (lidHeight > baseHeight) {
                    closedAngle = Math.PI * 0.6;
                    openAngle = 0;
                } else {
                    closedAngle = 0;
                    openAngle = -Math.PI * 0.6;
                }

                // Stage 1: Enforce initial fully closed state
                lidPivot.rotation.x = closedAngle;

                // RE-CENTER EXACTLY ON SCREEN AFTER CLOSING
                // (Closing the lid alters the bounding box, dragging visual mass downward)
                lidPivot.updateMatrixWorld(true);
                modelRotationGroup.updateMatrixWorld(true);
                const closedBox = new THREE.Box3().setFromObject(modelRotationGroup);
                const closedCenter = closedBox.getCenter(new THREE.Vector3());
                // Perfect vertical center adjustment
                modelRotationGroup.position.y -= closedCenter.y;
            }

            // Initial Pose Setup (Centered, tilted, instantly visible)
            modelPositionGroup.position.set(0, 0, 0);
            modelPositionGroup.scale.set(1, 1, 1);
            modelRotationGroup.rotation.set(Math.PI * 0.05, -Math.PI * 0.15, 0); // Slight cinematic tilt

            const isMobile = window.innerWidth <= 768;
            initScrollAnimations(isMobile);
        },
        undefined,
        (e) => {
            if (path === '../3d_models/mac.glb') {
                loadModel('/3d_models/mac.glb');
            }
        }
    );

}

loadModel('../3d_models/mac.glb');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------------------------------------
// 3. GSAP SCROLL STORYTELLING
// ---------------------------------------------------------
function initScrollAnimations(isMobile) {

    // A. Intro Drop
    const tlIntro = gsap.timeline();
    tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
    tlIntro.to('.reveal-hero', { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");
    // Model scale-in removed so it is visibly present immediately.


    // B. Master 3D Timeline (Syncing to sections)
    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5
        }
    });

    // 1 -> 2: PERFORMANCE (Text is LEFT, MacBook rotates right IN PLACE)
    masterTl.addLabel("scenePerformance")
        .to(lidPivot.rotation, { x: openAngle, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(modelRotationGroup.rotation, { x: 0.05, y: Math.PI / 6, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(camera.position, { x: 0, z: 18, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(screenGlow, { intensity: 4, ease: 'power2.out', duration: 2 }, "scenePerformance+=1");

    // 2 -> 3: DISPLAY (Text is RIGHT, MacBook rotates left IN PLACE)
    masterTl.addLabel("sceneDisplay")
        .to(modelRotationGroup.rotation, { x: 0.02, y: -Math.PI / 6, z: 0.02, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(keyLight.position, { x: -5, y: 8, z: 5, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

    // 3 -> 4: BATTERY (Text is BOTTOM, MacBook tilts back showing keyboard deck perfectly centered)
    masterTl.addLabel("sceneBattery")
         .to(lidPivot.rotation, { x: openAngle, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(modelRotationGroup.rotation, { x: 0.05, y: Math.PI / 6, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(camera.position, { x: 0, z: 18, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
        .to(screenGlow, { intensity: 4, ease: 'power2.out', duration: 2 }, "scenePerformance+=1");

    // 4 -> 5: DESIGN (Text is LEFT, MacBook rotates right IN PLACE showing profile)
    masterTl.addLabel("sceneDesign")
        .to(modelRotationGroup.rotation, { x: 0.08, y: Math.PI / 2.2, z: 0.05, ease: 'power2.inOut', duration: 3 }, "sceneDesign")
        .to(camera.position, { x: 0, z: 14, y: 1.5, ease: 'power2.inOut', duration: 3 }, "sceneDesign");

    // 5 -> FINAL: HERO (Centered pristine hover)
      masterTl.addLabel("sceneDisplay")
        .to(modelRotationGroup.rotation, { x: 0.02, y: -Math.PI / 6, z: 0.02, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
        .to(keyLight.position, { x: -5, y: 8, z: 5, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

    // Seamlessly transition background to deep black at end
    gsap.to('#body-bg', {
        backgroundColor: '#000000',
        scrollTrigger: { trigger: "#smooth-wrapper", start: "bottom 150%", end: "bottom bottom", scrub: true }
    });

    // C. OMNIDIRECTIONAL ALTERNATING UI TEXT REVEALS
    // Using Stagger + Transform manipulations natively.
    gsap.utils.toArray('.gsap-reveal').forEach((element) => {
        // Setup default from classes
        let xOffset = 0;
        let yOffset = 0;

        if (element.classList.contains('from-left')) xOffset = -80;
        if (element.classList.contains('from-right')) xOffset = 80;
        if (element.classList.contains('from-bottom')) yOffset = 60;

        // Ensure starting coords are robustly set
        gsap.set(element, { x: xOffset, y: yOffset, opacity: 0, visibility: 'visible' });

        gsap.to(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 80%",
                end: "bottom center",
                toggleActions: "play reverse play reverse" // plays beautifully up and down
            },
            opacity: 1,
            x: 0,
            y: 0,
            duration: 1.2,
            ease: 'power3.out'
        });
    });
}

// ---------------------------------------------------------
// 4. CONTINUOUS LOOP
// ---------------------------------------------------------
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    // Continuous Math.sin breathing loop
    if (modelPositionGroup) {
        modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.12;
    }

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
};

animate();

