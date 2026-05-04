import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../watch.css';

gsap.registerPlugin(ScrollTrigger);

const Watch = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;
        let isAtEnd = false;

        document.body.id = "body-bg";

        
        
        
        const scene = new THREE.Scene();

        const cameraGroup = new THREE.Group();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        const Z_FRAMING = 14;
        camera.position.set(0, 0, Z_FRAMING);
        camera.lookAt(0, 0, 0);
        cameraGroup.add(camera);
        scene.add(cameraGroup);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
        keyLight.position.set(5, 10, 8);
        scene.add(keyLight);

        const rimLight = new THREE.DirectionalLight(0xffc1a0, 4.0);
        rimLight.position.set(-8, 5, -10);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xe0e0e0, 2.0);
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

                    const trueBox = new THREE.Box3().setFromObject(modelRotationGroup);
                    const trueCenter = trueBox.getCenter(new THREE.Vector3());
                    modelRotationGroup.position.y -= trueCenter.y;
                    modelRotationGroup.position.x -= trueCenter.x;
                    modelRotationGroup.position.z -= trueCenter.z;

                    modelPositionGroup.position.set(0, -3, 0);
                    modelPositionGroup.scale.set(0.01, 0.01, 0.01);

                    modelRotationGroup.rotation.set(Math.PI / 12, -Math.PI / 8, 0);

                    const isMobile = window.innerWidth <= 768;
                    initScrollAnimations(isMobile);
                },
                undefined,
                (e) => console.error('Error loading model:', e)
            );
        }

        loadModel('/3d_models/apple_watch_ultra_2.glb');

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

            masterTl.addLabel("sceneHealth")
                .to(modelRotationGroup.rotation, { x: Math.PI / 15, y: Math.PI / 3.5, z: 0.1, ease: 'power2.inOut', duration: 3 }, "sceneHealth")
                .to(camera.position, { x: 0, z: Z_FRAMING, y: 0.5, ease: 'power2.inOut', duration: 3 }, "sceneHealth")
                .to(rimLight, { intensity: 6.0, ease: 'power2.inOut', duration: 3 }, "sceneHealth");

            masterTl.addLabel("sceneDisplay")
                .to(modelRotationGroup.rotation, { x: 0, y: -Math.PI / 6, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay")
                .to(camera.position, { x: 0, z: Z_FRAMING, y: 1.0, ease: 'power2.inOut', duration: 3 }, "sceneDisplay");

            masterTl.addLabel("sceneDurability")
                .to(modelRotationGroup.rotation, { x: Math.PI / 10, y: -Math.PI / 1.8, z: 0, ease: 'power2.inOut', duration: 3 }, "sceneDurability")
                .to(camera.position, { x: 0, z: Z_FRAMING + 1, y: 0.5, ease: 'power2.inOut', duration: 3 }, "sceneDurability");

            masterTl.addLabel("sceneFinal")
                .to(modelRotationGroup.rotation, { x: Math.PI / 15, y: Math.PI / 8, z: 0, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
                .to(camera.position, { x: 0, y: 1.5, z: Z_FRAMING, ease: 'power3.inOut', duration: 3 }, "sceneFinal")
                .to(rimLight, { intensity: 4.0, ease: 'power3.inOut', duration: 3 }, "sceneFinal");

            gsap.to(document.body, {
                backgroundColor: '#050505',
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
                modelPositionGroup.position.y = Math.sin(clock.getElapsedTime() * 1.8) * 0.15;

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
                <section id="section-hero" className="hero-section scroll-section d-flex align-items-start pt-5 mt-4">
                    <div className="container px-4 px-md-5">
                        <div className="hero-text text-center mx-auto">
                            <h1 className="hero-title reveal-hero">Apple Watch</h1>
                            <h2 className="hero-subtitle reveal-hero">Next level adventure.</h2>
                            <div className="hero-buttons mt-4 reveal-hero">
                                <Link to="/store" className="btn btn-apple-primary">Buy</Link>
                                <a href="#section-health" className="btn btn-apple-link ms-4">Learn more <i className="bi bi-chevron-down fs-6"></i></a>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-health" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 feature-text text-start gsap-reveal from-left">
                                <h2 className="display-3 fw-bold mb-3 text-white">Vital statistics.</h2>
                                <p className="lead">
                                    Advanced sensors for incredibly deep insights into your health and fitness.
                                    Your ultimate workout partner.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-display" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-5 offset-md-7 feature-text text-start text-md-end gsap-reveal from-right">
                                <h2 className="display-3 fw-bold mb-3 text-white">Our brightest display.</h2>
                                <p className="lead">
                                    An always-on Retina display pushes 3000 nits, making it easily readable even in the harshest sunlight.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-durability" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100 justify-content-center text-center">
                            <div className="col-md-6 feature-text gsap-reveal from-bottom">
                                <h2 className="display-3 fw-bold mx-auto mb-3 text-white">Tougher than tough.</h2>
                                <p className="lead mx-auto">
                                    Forged from aerospace-grade titanium for the perfect balance of weight, ruggedness, and corrosion resistance.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-final" className="scroll-section d-flex align-items-center justify-content-center text-center">
                    <div className="container px-4 px-md-5">
                        <h2 className="hero-title reveal-text" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>Adventure awaits.</h2>
                        <div className="hero-buttons mt-5 reveal-text">
                            <Link to="/store" className="btn btn-apple-primary px-5 py-3 fs-5">Buy Apple Watch</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Watch;
