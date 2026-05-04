import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../iphone.css';

gsap.registerPlugin(ScrollTrigger);

const Iphone = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;

        document.body.id = "body-bg";

        
        
        
        const scene = new THREE.Scene();

        const cameraGroup = new THREE.Group();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        cameraGroup.add(camera);
        scene.add(cameraGroup);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
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

        const canvas = canvasRef.current;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        
        
        
        const loader = new GLTFLoader();

        let mixer = null;
        let gltfAction = null;
        let model = null;

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

                    const box = new THREE.Box3().setFromObject(model);
                    const center = new THREE.Vector3();
                    if (!box.isEmpty()) {
                        box.getCenter(center);
                        model.position.sub(center);

                        const size = box.getSize(new THREE.Vector3()).length();
                        if (size > 0.001) {
                            const scaleFactor = 10 / size;
                            model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                        }
                    }

                    modelRotationGroup.add(model);
                    const isMobile = window.innerWidth <= 768;
                    modelPositionGroup.position.set(0, 0, -5);

                    modelRotationGroup.rotation.set(0.15, Math.PI / 4, -0.05);

                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(model);
                        gltfAction = mixer.clipAction(gltf.animations[0]);
                        gltfAction.play();
                        gltfAction.paused = true;
                    }

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
                undefined,
                (e) => console.error('Error loading model:', e)
            );
        }

        loadModel('/3d_models/Iphone.glb');

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        
        
        
        function initScrollAnimations(isMobile) {

            const tlIntro = gsap.timeline();
            tlIntro.fromTo('.apple-nav', { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 1, ease: 'power3.out' });
            tlIntro.fromTo('.reveal-hero', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' }, "-=0.5");

            tlIntro.fromTo(modelPositionGroup.scale,
                { x: 0, y: 0, z: 0 },
                { x: 1, y: 1, z: 1, duration: 2, ease: 'elastic.out(1, 0.7)' },
                "-=1.5"
            );

            ScrollTrigger.create({
                trigger: "#smooth-wrapper",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    if (gltfAction && mixer) {
                        mixer.setTime(self.progress * gltfAction.getClip().duration);
                    }

                    if (internalParts.length > 0) {
                        let cycle = self.progress * 1.35;
                        if (cycle > 1) cycle = 1;

                        const intensity = Math.sin(cycle * Math.PI);
                        internalParts.forEach(part => {
                            part.mesh.position.lerpVectors(part.startPos, part.explodedPos, intensity);
                        });
                    }
                }
            });

            const masterTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#smooth-wrapper",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1.5
                }
            });

            masterTl.to(modelRotationGroup.rotation, { x: 0.35, y: Math.PI / 1.5, z: -0.1, ease: 'power2.inOut', duration: 1 }, 0)
                .to(camera.position, { z: 7, y: 1.5, ease: 'power2.inOut', duration: 1 }, 0)
                .to(rimLight, { intensity: 3.5, ease: 'power2.inOut', duration: 1 }, 0)
                .to(keyLight.position, { x: -5, y: 8, z: -5, ease: 'power2.inOut', duration: 1 }, 0);

            masterTl.to(modelRotationGroup.rotation, { x: 0.25, y: -Math.PI / 5, z: 0.1, ease: 'power2.inOut', duration: 1 }, 1)
                .to(camera.position, { x: isMobile ? 0 : -1.5, z: 5, y: 1.2, ease: 'power2.inOut', duration: 1 }, 1)
                .to(rimLight, { intensity: 2.5, ease: 'power2.inOut', duration: 1 }, 1)
                .to(keyLight.position, { x: 0, y: 5, z: 0, ease: 'power2.inOut', duration: 1 }, 1);

            masterTl.to(modelRotationGroup.rotation, { x: 0.2, y: Math.PI / 4, z: -0.05, ease: 'power2.inOut', duration: 1 }, 2)
                .to(camera.position, { x: isMobile ? 0 : 1.5, z: 8, y: 0.8, ease: 'power2.inOut', duration: 1 }, 2)
                .to(rimLight, { intensity: 1.5, ease: 'power2.inOut', duration: 1 }, 2);

            masterTl.to(modelRotationGroup.rotation, { x: 0.12, y: Math.PI * 2 + Math.PI / 6, z: 0.05, ease: 'power2.inOut', duration: 1 }, 3)
                .to(camera.position, { x: 0, y: 0, z: 10, ease: 'power2.inOut', duration: 1 }, 3)
                .to(keyLight.position, { x: 5, y: 5, z: 5, ease: 'power2.inOut', duration: 1 }, 3);

            masterTl.to(document.body, { backgroundColor: '#0a0a0c', ease: 'none', duration: 4 }, 0);

            gsap.utils.toArray('.reveal-text').forEach((element) => {
                gsap.set(element, { opacity: 0, y: 30 }); 
                gsap.to(element, {
                    scrollTrigger: { trigger: element, start: "top 85%", end: "bottom center", toggleActions: "play none none reverse" },
                    opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'
                });
            });

            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 100);
        }

        
        
        
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);

            if (modelRotationGroup) {
                modelRotationGroup.position.y = Math.sin(clock.getElapsedTime() * 1.5) * 0.1;
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
                <section id="section-hero" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="hero-text text-center mx-auto w-100 mt-5">
                            <h1 className="hero-title reveal-hero">iPhone 17 Pro Max</h1>
                            <h2 className="hero-subtitle reveal-hero">Designed to push boundaries.</h2>
                            <div className="hero-buttons mt-5 reveal-hero">
                                <Link to="/store" className="btn btn-apple-primary">Buy</Link>
                                <a href="#section-disassembly"
                                    className="btn btn-apple-link ms-4 text-white text-decoration-none fw-bold">Learn more <i
                                        className="bi bi-chevron-down fs-6"></i></a>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-disassembly" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 feature-text text-start">
                                <h2 className="display-3 fw-bold mb-3 reveal-text">Engineered.<br />Inside and out.</h2>
                                <p className="lead reveal-text">
                                    A masterclass in thermal architecture and structural integrity. Every component is
                                    rigorously optimized for absolute performance.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-exploration" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 offset-md-6 feature-text text-start text-md-end">
                                <h2 className="display-3 fw-bold mb-3 reveal-text">The cutting edge.</h2>
                                <p className="lead reveal-text">
                                    Pro-class camera systems. Next-generation Silicon processors. A display that defies logic.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-reassembly" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-7 feature-text text-start">
                                <h2 className="display-3 fw-bold mb-3 reveal-text">Forged in Titanium.</h2>
                                <p className="lead reveal-text">
                                    By bringing it all together, we've created the lightest and strongest Pro model ever
                                    designed.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-final" className="scroll-section d-flex align-items-center justify-content-center text-center">
                    <div className="container px-4 px-md-5">
                        <h2 className="display-2 fw-bold mb-4 reveal-text gradient-text">Pro beyond limits.</h2>
                        <p className="fs-4 mx-auto reveal-text text-white" style={{ maxWidth: '600px' }}>
                            Experience the raw power.
                        </p>
                        <div className="mt-5 reveal-text">
                            <Link to="/store" className="btn btn-apple-primary px-5 py-3 fs-5">Buy iPhone Pro</Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Iphone;
