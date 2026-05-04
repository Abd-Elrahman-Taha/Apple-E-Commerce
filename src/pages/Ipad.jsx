import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../ipad.css';

gsap.registerPlugin(ScrollTrigger);

const Ipad = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;
        let isAtEnd = false; 

        document.body.id = "body-bg";

        
        
        
        const scene = new THREE.Scene();

        const cameraGroup = new THREE.Group();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 20);
        camera.lookAt(0, 0, 0);
        cameraGroup.add(camera);
        scene.add(cameraGroup);

        
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
        keyLight.position.set(5, 10, 8);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xa0c4ff, 3.5); 
        rimLight.position.set(-8, 5, -10);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xe0e0e0, 1.5);
        fillLight.position.set(0, -5, 5);
        scene.add(fillLight);

        const canvas = canvasRef.current;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        
        
        
        const loader = new GLTFLoader();

        let model = null;
        const modelRotationGroup = new THREE.Group();
        const modelPositionGroup = new THREE.Group();
        modelPositionGroup.add(modelRotationGroup);
        scene.add(modelPositionGroup);

        function loadModel(path) {
            loader.load(
                path,
                (gltf) => {
                    model = gltf.scene;

                    
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

                    
                    model.traverse((node) => {
                        if (node.isMesh) {
                            node.frustumCulled = false;
                        }
                    });

                    modelRotationGroup.add(model);
                    modelRotationGroup.updateMatrixWorld(true);

                    
                    const trueBox = new THREE.Box3().setFromObject(modelRotationGroup);
                    const trueCenter = trueBox.getCenter(new THREE.Vector3());
                    modelRotationGroup.position.y -= trueCenter.y;
                    modelRotationGroup.position.x -= trueCenter.x;
                    modelRotationGroup.position.z -= trueCenter.z;

                    
                    modelPositionGroup.position.set(0, -3, 0);
                    modelPositionGroup.scale.set(0.01, 0.01, 0.01);

                    
                    modelRotationGroup.rotation.set(Math.PI * 0.45, -Math.PI * 0.1, 0);

                    const isMobile = window.innerWidth <= 768;
                    initScrollAnimations(isMobile);
                },
                undefined,
                (e) => {
                    console.error('Error loading model:', e);
                }
            );
        }

        loadModel('/3d_models/Ipad.glb');

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        
        
        
        function initScrollAnimations(isMobile) {

            
            const tlIntro = gsap.timeline();
            tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
            tlIntro.to('.reveal-hero', { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");

            
            tlIntro.to(modelPositionGroup.scale, { x: 1, y: 1, z: 1, duration: 2.2, ease: 'power3.out' }, "-=1.0");
            tlIntro.to(modelPositionGroup.position, { y: 0, duration: 2.2, ease: 'power3.out' }, "-=2.2");

            
            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#smooth-wrapper",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5
                }
            });

            masterTl.addLabel("scenePerformance")
                .to(modelRotationGroup.rotation, { x: Math.PI / 2.2, y: Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(camera.position, { x: 0, z: 20, y: 1.5, ease: 'power2.inOut', duration: 3 }, "scenePerformance")
                .to(rimLight, { intensity: 5.0, ease: 'power2.inOut', duration: 3 }, "scenePerformance");

            masterTl.addLabel("sceneDisplay")
                .to(modelRotationGroup.rotation, { x: Math.PI / 2.2, y: -Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
                .to(camera.position, { x: 0, z: 20, y: 1.5, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
                .to(rimLight, { intensity: 5.0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

            masterTl.addLabel("scenePencil")
                .to(modelRotationGroup.rotation, { x: 0, y: 0, z: 0, ease: 'power2.inOut', duration: 3 }, "scenePencil")
                .to(camera.position, { x: 0, z: 18, y: 8, ease: 'power2.inOut', duration: 3 }, "scenePencil")
                .to(rimLight, { intensity: 3.0, ease: 'power2.inOut', duration: 3 }, "scenePencil");

            masterTl.addLabel("sceneDesign")
                .to(modelRotationGroup.rotation, { x: Math.PI / 2, y: -Math.PI / 2.2, z: Math.PI / 12, ease: 'power2.inOut', duration: 3 }, "sceneDesign")
                .to(camera.position, { x: 0, z: 20, y: 1, ease: 'power2.inOut', duration: 3 }, "sceneDesign");

            masterTl.addLabel("sceneFinal")
                .to(modelRotationGroup.rotation, { x: Math.PI * 0.45, y: Math.PI * 0.1, z: 0, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
                .to(camera.position, { x: 0, y: 2, z: 22, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
                .to(rimLight, { intensity: 3.5, color: '#a0c4ff', ease: 'power3.inOut', duration: 3 }, "sceneFinal");

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

            ScrollTrigger.create({
                trigger: "#section-final",
                start: "top center",
                onEnter: () => isAtEnd = true,
                onLeaveBack: () => isAtEnd = false
            });

            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        
        
        
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);

            if (modelPositionGroup) {
                modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.2;

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
                {}
                <section id="section-hero" className="hero-section scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="hero-text">
                            <h1 className="hero-title reveal-hero">iPad Pro</h1>
                            <p className="hero-subtitle reveal-hero">Thinpossible.</p>
                            <div className="hero-buttons reveal-hero">
                                <Link to="/store" className="btn btn-apple btn-apple-primary">Buy</Link>
                                <a href="#section-performance" className="btn btn-apple text-white btn-apple-link">Learn more <i className="bi bi-chevron-down"></i></a>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-performance" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-left">Outrageous performance.</h2>
                                <p className="lead gsap-reveal from-left">
                                    The all-new Apple M4 chip enables an unimaginably thin and light design, delivering
                                    groundbreaking performance and an aggressive leap forward for Pro apps.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-display" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 offset-md-7 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-right">Liquid Retina XDR.</h2>
                                <p className="lead gsap-reveal from-right">
                                    Absolute brilliance. Tandem OLED arrays pump out extreme brightness with perfectly
                                    calibrated contrast, giving you pure visual perfection.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-pencil" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 mx-auto feature-text text-center text-md-center" style={{ marginTop: '30vh' }}>
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-bottom">Apple Pencil Pro.</h2>
                                <p className="lead gsap-reveal from-bottom text-start">
                                    Engineered for limitless creativity. New squeeze and barrel roll gestures let you bring your
                                    ideas to life instantly with magical precision.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-design" className="scroll-section">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 feature-text text-start text-md-start">
                                <h2 className="display-3 fw-bold mb-3 gsap-reveal from-left">Impossibly thin.</h2>
                                <p className="lead gsap-reveal from-left">
                                    Our thinnest product ever. Phenomenal power packed into a design so thin you have to see it
                                    to believe it. Portability taken to the extreme.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-final" className="scroll-section d-flex align-items-center justify-content-center text-center">
                    <div className="container px-4 px-md-5">
                        <h2 className="gradient-text display-2 fw-bold gsap-reveal from-bottom">Your next computer.</h2>
                        <p className="gsap-reveal from-bottom mt-3"
                            style={{ color: 'var(--ipad-muted)', fontSize: '1.25rem', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
                            Experience the magic of iPad.
                        </p>
                        <div className="mt-5 gsap-reveal from-bottom">
                            <Link to="/store" className="btn btn-apple btn-apple-primary px-5 py-3 fs-5">Buy iPad Pro</Link>
                        </div>
                    </div>
                </section>

            </main>
        </>
    );
};

export default Ipad;
