import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../mac.css';

gsap.registerPlugin(ScrollTrigger);

const Mac = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;

        // Change body id for styling
        document.body.id = "body-bg";

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

        const canvas = canvasRef.current;
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

                    // Prevent Three.js view-frustum culling bugs
                    model.traverse((node) => {
                        if (node.isMesh) {
                            node.frustumCulled = false;
                        }
                    });

                    modelRotationGroup.add(model);
                    modelRotationGroup.updateMatrixWorld(true);

                    // SAFE GEOMETRY LOGIC FOR LID DETECT
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
                        let groupsWithStats = mainGroups.map(g => {
                            let gBox = new THREE.Box3().setFromObject(g);
                            let gSize = gBox.getSize(new THREE.Vector3());
                            return { group: g, volume: gSize.x * gSize.y * gSize.z };
                        });
                        groupsWithStats.sort((a, b) => b.volume - a.volume);
                        baseNode = groupsWithStats[0].group;
                        lidNode = groupsWithStats[1].group;
                    } else {
                        model.traverse((child) => {
                            if (child.name === 'VCQqxpxkUlzqcJI_62') lidNode = child;
                            if (child.name === 'BoBvWqDHZjAeVrp_44') baseNode = child;
                        });
                    }

                    // BUILD THE PROPER HINGE PIVOT SYSTEM
                    if (baseNode && lidNode) {
                        const baseBox = new THREE.Box3().setFromObject(baseNode);
                        const lidBox = new THREE.Box3().setFromObject(lidNode);

                        const hingeX = baseBox.getCenter(new THREE.Vector3()).x;
                        const hingeY = baseBox.max.y;
                        const hingeZ = baseBox.min.z + (baseBox.max.z - baseBox.min.z) * 0.05;

                        lidPivot.position.set(hingeX, hingeY, hingeZ);
                        modelRotationGroup.add(lidPivot);
                        lidPivot.add(screenGlow);

                        lidPivot.attach(lidNode);

                        const baseHeight = baseBox.getSize(new THREE.Vector3()).y;
                        const lidHeight = lidBox.getSize(new THREE.Vector3()).y;

                        if (lidHeight > baseHeight) {
                            closedAngle = Math.PI * 0.6;
                            openAngle = 0;
                        } else {
                            closedAngle = 0;
                            openAngle = -Math.PI * 0.6;
                        }

                        lidPivot.rotation.x = closedAngle;

                        lidPivot.updateMatrixWorld(true);
                        modelRotationGroup.updateMatrixWorld(true);
                        const closedBox = new THREE.Box3().setFromObject(modelRotationGroup);
                        const closedCenter = closedBox.getCenter(new THREE.Vector3());
                        modelRotationGroup.position.y -= closedCenter.y;
                    }

                    modelPositionGroup.position.set(0, 0, 0);
                    modelPositionGroup.scale.set(1, 1, 1);
                    modelRotationGroup.rotation.set(Math.PI * 0.05, -Math.PI * 0.15, 0);

                    const isMobile = window.innerWidth <= 768;
                    initScrollAnimations(isMobile);
                },
                undefined,
                (e) => {
                    console.error('Error loading model:', e);
                }
            );
        }

        loadModel('/3d_models/mac.glb');

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        // ---------------------------------------------------------
        // 3. GSAP SCROLL STORYTELLING
        // ---------------------------------------------------------
        function initScrollAnimations(isMobile) {

            const tlIntro = gsap.timeline();
            tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
            tlIntro.to('.reveal-hero', { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");

            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#smooth-wrapper",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5
                }
            });

            masterTl.addLabel("scenePerformance")
                .to(lidPivot.rotation, { x: openAngle, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(modelRotationGroup.rotation, { x: 0.05, y: Math.PI / 6, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(camera.position, { x: 0, z: 18, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(screenGlow, { intensity: 4, ease: 'power2.out', duration: 2 }, "scenePerformance+=1");

            masterTl.addLabel("sceneDisplay")
                .to(modelRotationGroup.rotation, { x: 0.02, y: -Math.PI / 6, z: 0.02, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
                .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
                .to(keyLight.position, { x: -5, y: 8, z: 5, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

            masterTl.addLabel("sceneBattery")
                .to(lidPivot.rotation, { x: openAngle, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(modelRotationGroup.rotation, { x: 0.05, y: Math.PI / 6, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(camera.position, { x: 0, z: 18, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(screenGlow, { intensity: 4, ease: 'power2.out', duration: 2 }, "scenePerformance+=1");

            masterTl.addLabel("sceneDesign")
                .to(modelRotationGroup.rotation, { x: 0.08, y: Math.PI / 2.2, z: 0.05, ease: 'power2.inOut', duration: 3 }, "sceneDesign")
                .to(camera.position, { x: 0, z: 14, y: 1.5, ease: 'power2.inOut', duration: 3 }, "sceneDesign");

            masterTl.addLabel("sceneDisplayFinal") // renamed to avoid duplicate label
                .to(modelRotationGroup.rotation, { x: 0.02, y: -Math.PI / 6, z: 0.02, ease: 'power2.inOut', duration: 3 }, "sceneDisplayFinal")
                .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDisplayFinal")
                .to(keyLight.position, { x: -5, y: 8, z: 5, ease: 'power2.inOut', duration: 3 }, "sceneDisplayFinal");

            gsap.to(document.body, {
                backgroundColor: '#000000',
                scrollTrigger: { trigger: "#smooth-wrapper", start: "bottom 150%", end: "bottom bottom", scrub: true }
            });

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

            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        // ---------------------------------------------------------
        // 4. CONTINUOUS LOOP
        // ---------------------------------------------------------
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);

            if (modelPositionGroup) {
                modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.12;
            }

            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(reqId);
            document.body.id = "";
            document.body.style.backgroundColor = '';

            ScrollTrigger.getAll().forEach(t => t.kill());
            gsap.killTweensOf('*');

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
            <div className="canvas-container">
                <canvas ref={canvasRef} id="webgl"></canvas>
            </div>

            <main id="smooth-wrapper">
                {/* 1. HERO (Center) */}
                <section id="section-hero" className="hero-section scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="hero-text">
                            <h1 className="hero-title reveal-hero">MacBook Pro</h1>
                            <p className="hero-subtitle reveal-hero">Mind-blowing. Head-turning.</p>
                            <div className="hero-buttons reveal-hero">
                                <Link to="/store" className="btn btn-apple btn-apple-primary">Buy</Link>
                                <a href="#section-performance" className="btn btn-apple btn-apple-link text-white">Learn more <i className="bi bi-chevron-down"></i></a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. PERFORMANCE (LEFT) */}
                <section id="section-performance" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-left">Incredible power.<br />Incredibly thin.</h2>
                                <p className="lead gsap-reveal from-left">
                                    The ultimate pro laptop. With extreme performance, a stunning Liquid Retina XDR display, and battery life that defies logic.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. DISPLAY (RIGHT) */}
                <section id="section-display" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 offset-md-7 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-right">Liquid Retina XDR.<br />Brilliant.</h2>
                                <p className="lead gsap-reveal from-right">
                                    Extreme dynamic range brings refined specular highlights and incredible detail in shadows. It’s the best display ever in a notebook.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. BATTERY (BOTTOM / CENTERED) */}
                <section id="section-battery" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 mx-auto feature-text text-center text-md-center" style={{ marginTop: '30vh' }}>
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-bottom">We can do this<br />all day.</h2>
                                <p className="lead gsap-reveal from-bottom text-start">
                                    Up to 22 hours of battery life. Apple silicon delivers exceptional power efficiency so you can keep rendering and compiling far from a plug.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. DESIGN & PORTS (LEFT) */}
                <section id="section-design" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-left">Ports of call.</h2>
                                <p className="lead gsap-reveal from-left">
                                    Transfer data at lightning speed, connect to high-resolution displays, and work without limits thanks to three Thunderbolt/USB 4 ports.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. FINAL HERO */}
                <section id="section-final" className="scroll-section d-flex align-items-center justify-content-center text-center">
                    <div className="container px-4 px-md-5">
                        <h2 className="gradient-text display-2 fw-bold gsap-reveal from-bottom">Pro anywhere.</h2>
                        <p className="gsap-reveal from-bottom mt-3" style={{ color: 'var(--mac-muted)', fontSize: '1.25rem', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Unleash the full potential of Apple Silicon.
                        </p>
                        <div className="mt-5 gsap-reveal from-bottom">
                            <Link to="/store" className="btn btn-apple btn-apple-primary px-5 py-3 fs-5">Buy MacBook Pro</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Mac;
