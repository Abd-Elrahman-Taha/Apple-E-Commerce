import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../airpods.css';

gsap.registerPlugin(ScrollTrigger);

const Airpods = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        let reqId;

        document.body.id = "body-bg";

        
        
        
        const scene = new THREE.Scene();

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

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 15);

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
        let model = null;
        let gltfAction = null;

        const modelGroup = new THREE.Group();
        scene.add(modelGroup);

        function loadModel(path) {
            loader.load(
                path,
                (gltf) => {
                    model = gltf.scene;

                    model.scale.set(0, 0, 0);

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
                },
                undefined,
                (e) => {
                    console.error('Error loading model:', e);
                }
            );
        }

        loadModel('/3d_models/airpods.glb');

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);

        
        
        
        function initAnimations(isMobile) {
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

            tlIntro.to(model.scale, {
                x: 1.5, y: 1.5, z: 1.5,
                duration: 2,
                ease: 'elastic.out(1, 0.7)'
            }, "-=1.5");

            if (gltfAction) {
                ScrollTrigger.create({
                    trigger: "#smooth-wrapper",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                    onUpdate: (self) => {
                        gltfAction.time = self.progress * gltfAction.getClip().duration;
                        mixer.update(0);
                    }
                });
            }

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

            tlANC.to(ambientLight, { intensity: 0.1 }, 0);
            tlANC.to(dirLight, { intensity: 0.5 }, 0);

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

            tlTrans.to(ambientLight, { intensity: 0.7 }, 0);
            tlTrans.to(dirLight, { intensity: 1.5 }, 0);
            tlTrans.to(document.body, { backgroundColor: '#18181a' }, 0);

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

            tlBattery.to(document.body, { backgroundColor: '#0a0a0c' }, 0);

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

            tlDesign.to(document.body, { backgroundColor: '#000000' }, 0);

            gsap.utils.toArray('.reveal-text').forEach((element) => {
                gsap.set(element, { opacity: 0, y: 30 });
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

        
        
        
        const clock = new THREE.Clock();

        const animate = () => {
            reqId = requestAnimationFrame(animate);

            if (modelGroup) {
                modelGroup.position.y += Math.sin(clock.getElapsedTime() * 1.5) * 0.001;
                modelGroup.rotation.y += 0.005;
            }

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
                        <div className="hero-text text-center mx-auto">
                            <h1 className="hero-title reveal-hero">AirPods Pro</h1>
                            <h2 className="hero-subtitle reveal-hero">Immersive sound.<br />Zero distractions.</h2>
                            <div className="hero-buttons mt-5 reveal-hero">
                                <Link to="/store" className="btn btn-apple-primary">Buy Now</Link>
                                <a href="#section-anc" className="btn btn-apple-link ms-4">Explore <i
                                    className="bi bi-chevron-down fs-6"></i></a>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-anc" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 feature-text text-start">
                                <h2 className="display-3 fw-bold mb-3 reveal-text">Active Noise<br />Cancellation.</h2>
                                <p className="lead reveal-text">
                                    Silence the world. Advanced noise cancellation adapts continuously to your ear geometry,
                                    blocking out what you don't want to hear.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-transparency" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 offset-md-6 feature-text text-start text-md-end">
                                <h2 className="display-3 fw-bold mb-3 reveal-text text-dark-transition">Transparency<br />Mode.</h2>
                                <p className="lead reveal-text text-dark-transition">
                                    Hear the world around you when you need it. High-excursion drivers let outside sound in
                                    naturally.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-battery" className="scroll-section d-flex align-items-center">
                    <div className="container px-4 px-md-5">
                        <div className="row w-100">
                            <div className="col-md-6 feature-text text-start">
                                <h2 className="display-3 fw-bold mb-3 reveal-text text-dark-transition">All-day<br />battery life.
                                </h2>
                                <p className="lead reveal-text text-dark-transition">
                                    More listening, less charging. The MagSafe Charging Case provides hours of uninterrupted
                                    high-fidelity audio.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {}
                <section id="section-design"
                    className="scroll-section d-flex align-items-center justify-content-center text-center">
                    <div className="container px-4 px-md-5">
                        <h2 className="display-2 fw-bold mb-4 reveal-text text-dark-transition">As beautiful as they sound.</h2>
                        <p className="fs-4 mx-auto mb-5 reveal-text text-dark-transition" style={{ maxWidth: '600px', color: '#777' }}>
                            A masterclass in modern engineering. Contoured for comfort, designed to impress.
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Airpods;
