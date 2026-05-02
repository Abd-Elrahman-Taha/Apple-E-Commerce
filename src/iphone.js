import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------
// 1. Scene Setup & Camera 
// ---------------------------------------------------------
const scene = new THREE.Scene();

// Cinematic Camera: Positioned much closer for an immersive Apple-style shot
const cameraGroup = new THREE.Group();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10); // Start intimate and close
camera.lookAt(0, 0, 0); 
cameraGroup.add(camera);
scene.add(cameraGroup);

// Premium Lighting System (Enhanced for visibility)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // High base visibility so it never turns black
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.5); 
rimLight.position.set(-5, 0, -5);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xe0e0e0, 1.0);
fillLight.position.set(0, -5, 5);
scene.add(fillLight);

// Renderer setup
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------------------------------------------------------
// 2. Safe Disassembly Engine & Loading
// ---------------------------------------------------------
const loader = new GLTFLoader();

let mixer = null;
let gltfAction = null;
let model = null;

// Isolate rotation control from scroll translations
const modelRotationGroup = new THREE.Group();
const modelPositionGroup = new THREE.Group();
modelPositionGroup.add(modelRotationGroup);
scene.add(modelPositionGroup);

const internalParts = []; 

function loadModel(path) {
    loader.load(
        path, 
        (gltf) => {
            model = gltf.scene;

            // Geometry Centering safely
            const box = new THREE.Box3().setFromObject(model);
            const center = new THREE.Vector3();
            if (!box.isEmpty()) {
                box.getCenter(center);
                model.position.sub(center); 
                
                // Keep the phone large and proud on standard screens
                const size = box.getSize(new THREE.Vector3()).length();
                if (size > 0.001) {
                    const scaleFactor = 10 / size; 
                    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                }
            }

            modelRotationGroup.add(model);
            const isMobile = window.innerWidth <= 768;
            modelPositionGroup.position.set(0, 0, -5); // Always center

            // CINEMATIC START POSE: Device angled, showing back + side
            modelRotationGroup.rotation.set(0.15, Math.PI / 4, -0.05);

            console.log("✅ iPhone GLB loaded successfully!");

            if (gltf.animations && gltf.animations.length > 0) {
                console.log("Found inner animations.");
                mixer = new THREE.AnimationMixer(model);
                gltfAction = mixer.clipAction(gltf.animations[0]);
                gltfAction.play();
                gltfAction.paused = true;
            }
            
            console.log("Initializing SAFE Procedural Disassembly Engine logic...");
            // Gentle controlled offsets mapping every child mesh
            model.traverse((child) => {
                if (child.isMesh) {
                    const startPos = child.position.clone();
                    
                    child.geometry.computeBoundingBox();
                    const childCenter = new THREE.Vector3();
                    if (child.geometry.boundingBox) {
                        child.geometry.boundingBox.getCenter(childCenter);
                    }
                    
                    let dir = childCenter.clone();
                    if (dir.lengthSq() > 0.00001) {
                        dir.normalize();
                    } else {
                        dir.set(0, 0, 1); 
                    }
                    
                    // Ultra-subtle precision engineering separation limit
                    // "Breathing apart" effect instead of an explosion
                    const explodedPos = startPos.clone().add(dir.multiplyScalar(0.04));

                    internalParts.push({
                        mesh: child,
                        startPos: startPos,
                        explodedPos: explodedPos
                    });
                }
            });

            initScrollAnimations(isMobile);
        },
        (p) => {},
        (e) => {
            if(path === '../3d_models/Iphone.glb') {
                loadModel('/3d_models/Iphone.glb'); 
            }
        }
    );
}

loadModel('/3d_models/Iphone.glb');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// ---------------------------------------------------------
// 3. Narrative Cinematic Timelines (Strictly controlled)
// ---------------------------------------------------------
function initScrollAnimations(isMobile) {

    // A) Intro Start
    const tlIntro = gsap.timeline();
    tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
    tlIntro.fromTo('.reveal-hero', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");
    
    // Satisfying drop in
    tlIntro.fromTo(modelPositionGroup.scale, 
        {x: 0, y: 0, z: 0},
        {x: 1, y: 1, z: 1, duration: 2, ease: 'elastic.out(1, 0.7)'}, 
        "-=1.5"
    );


    // B) Master Engine Trigger
    ScrollTrigger.create({
        trigger: "#smooth-wrapper",
        start: "top top",
        end: "bottom bottom",
        scrub: 1, 
        onUpdate: (self) => {
            // Path A: Prebaked Internal Animations
            if (gltfAction && mixer) {
                mixer.setTime(self.progress * gltfAction.getClip().duration);
            } 
            
            // Path B: Safe Procedural Engine (Blend SIMULTANEOUSLY)
            if (internalParts.length > 0) {
                // Accelerate the scroll cycle: peak disassembly happens earlier, 
                // and it fully reassembles before reaching the very end of the page.
                let cycle = self.progress * 1.35; 
                if (cycle > 1) cycle = 1;

                const intensity = Math.sin(cycle * Math.PI); 
                internalParts.forEach(part => {
                    part.mesh.position.lerpVectors(part.startPos, part.explodedPos, intensity);
                });
            }
        }
    });

    // C) Continuous Master Timeline (Replaces fragmented snapping timelines)
    // By locking all camera and rotation movements to a single page-length timeline,
    // we guarantee buttery smooth interpolation with zero snapping.

    const masterTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#smooth-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Added heavy cinematic smoothing to the scrub
        }
    });

    // 1. Hero -> Disassembly
    masterTl.to(modelRotationGroup.rotation, { x: 0.35, y: Math.PI / 1.5, z: -0.1, ease: 'power2.inOut', duration: 1 }, 0)
            .to(camera.position, { z: 7, y: 1.5, ease: 'power2.inOut', duration: 1 }, 0)
            .to(rimLight, { intensity: 3.5, ease: 'power2.inOut', duration: 1 }, 0)
            .to(keyLight.position, { x: -5, y: 8, z: -5, ease: 'power2.inOut', duration: 1 }, 0);

    // 2. Disassembly -> Exploration (Extreme Close Up)
    masterTl.to(modelRotationGroup.rotation, { x: 0.25, y: -Math.PI / 5, z: 0.1, ease: 'power2.inOut', duration: 1 }, 1)
            .to(camera.position, { x: isMobile ? 0 : -1.5, z: 5, y: 1.2, ease: 'power2.inOut', duration: 1 }, 1)
            .to(rimLight, { intensity: 2.5, ease: 'power2.inOut', duration: 1 }, 1)
            .to(keyLight.position, { x: 0, y: 5, z: 0, ease: 'power2.inOut', duration: 1 }, 1);

    // 3. Exploration -> Reassembly
    masterTl.to(modelRotationGroup.rotation, { x: 0.2, y: Math.PI / 4, z: -0.05, ease: 'power2.inOut', duration: 1 }, 2)
            .to(camera.position, { x: isMobile ? 0 : 1.5, z: 8, y: 0.8, ease: 'power2.inOut', duration: 1 }, 2)
            .to(rimLight, { intensity: 1.5, ease: 'power2.inOut', duration: 1 }, 2);

    // 4. Reassembly -> Final Hero
    // Instead of flat 0,0,0, end on a premium angled cinematic showcase highlighting depth
    masterTl.to(modelRotationGroup.rotation, { x: 0.12, y: Math.PI * 2 + Math.PI / 6, z: 0.05, ease: 'power2.inOut', duration: 1 }, 3)
            .to(camera.position, { x: 0, y: 0, z: 10, ease: 'power2.inOut', duration: 1 }, 3)
            .to(keyLight.position, { x: 5, y: 5, z: 5, ease: 'power2.inOut', duration: 1 }, 3);

    // Continuous dramatic background color shift organically mixed over entire scroll
    masterTl.to('#body-bg', { backgroundColor: '#0a0a0c', ease: 'none', duration: 4 }, 0);

    // Revealing UI Texts cleanly
    gsap.utils.toArray('.reveal-text').forEach((element) => {
        gsap.to(element, {
            scrollTrigger: { trigger: element, start: "top 85%", end: "bottom center", toggleActions: "play none none reverse" },
            opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'
        });
    });
}

// ---------------------------------------------------------
// 4. Render Loop
// ---------------------------------------------------------
const clock = new THREE.Clock();

const animate = () => {
    requestAnimationFrame(animate);

    // Ultra smooth cinematic ambient rotation (subtle breathing effect)
    if (modelRotationGroup) {
        modelRotationGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
    }

    // CRITICAL: Always force camera to lock onto the center of the phone.
    // As GSAP moves the camera x/y/z above, this creates natural cinematic tilting.
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
};

animate();
