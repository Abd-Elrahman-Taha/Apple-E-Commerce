import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;

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
        const canvas = canvasRef.current;
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
            '/3d_models/apple_logo.glb',
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
        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

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

            // 2. Hero Text fades & slides up (unified .reveal-hero pattern)
            tlIntro.fromTo('.reveal-hero',
                { opacity: 0, y: 30, filter: 'blur(10px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, stagger: 0.2, ease: 'power3.out' },
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

            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        // ---------------------------------------------------------
        // 5. Render Loop
        // ---------------------------------------------------------
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            // Constant slow float/spin independent of scroll
            if (modelGroup) {
                modelGroup.position.y += Math.sin(clock.getElapsedTime()) * 0.002;
            }

            if (mixer) mixer.update(delta);

            renderer.render(scene, camera);
        };

        animate();

        // ---------------------------------------------------------
        // Cleanup
        // ---------------------------------------------------------
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(reqId);

            // Kill all GSAP animations and ScrollTriggers
            ScrollTrigger.getAll().forEach(t => t.kill());
            gsap.killTweensOf('*');

            // Reset body background if it was changed
            document.body.style.backgroundColor = '';

            // Dispose Three.js objects
            scene.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    if (child.material.isMaterial) {
                        cleanMaterial(child.material);
                    } else {
                        for (const material of child.material) cleanMaterial(material);
                    }
                }
            });
            renderer.dispose();
        };

        function cleanMaterial(material) {
            material.dispose();
            for (const key of Object.keys(material)) {
                const value = material[key];
                if (value && typeof value === 'object' && 'minFilter' in value) {
                    value.dispose();
                }
            }
        }
    }, []);

    return (
        <>
            {/* Three.js Canvas */}
            <div className="canvas-container">
                <canvas ref={canvasRef} id="webgl"></canvas>
            </div>

            {/* Scroll Container */}
            <main id="smooth-wrapper">
                {/* Hero Section */}
                <section id="section-hero" className="hero-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="hero-text text-center mx-auto">
                            <h1 className="hero-title reveal-hero">Think Different.</h1>
                            <h2 className="hero-subtitle reveal-hero">Not Just a Product. An Experience.</h2>
                            <div className="hero-buttons mt-5 reveal-hero">
                                <Link to="/store" className="btn btn-apple-primary">Buy Now</Link>
                                <a href="#explore" className="btn btn-apple-link ms-4">Learn more</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Scroll Details Section */}
                <section id="explore" className="details-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 offset-md-6 feature-text text-white">
                                <h2 className="display-4 fw-bold mb-4 reveal-text">Engineered for<br />the future.</h2>
                                <p className="lead  reveal-text">
                                    A seamless blend of power and beauty. The new architecture is designed to give you
                                    unprecedented performance without compromising on battery life.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Section */}
                <section className="specs-section d-flex align-items-center justify-content-center text-center">
                    <div className="container">
                        <h2 className="display-3 fw-bold text-white mb-4 reveal-text">Pro to the core.</h2>
                        <p className="lead2 fs-4 text-white-50 mx-auto mb-5 reveal-text" style={{ maxWidth: '600px' }}>
                            Experience the magic from every angle.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Home;
