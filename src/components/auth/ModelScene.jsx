import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ───────────────────────────────────────────
   Inner rotating model
   ─────────────────────────────────────────── */
const AppleModel = forwardRef(({ modelPath }, ref) => {
    const groupRef = useRef();
    const { scene } = useGLTF(modelPath);

    // Expose the group ref to parent
    useImperativeHandle(ref, () => groupRef.current);

    // Center the model geometry
    useEffect(() => {
        if (scene) {
            const box = new THREE.Box3().setFromObject(scene);
            const center = box.getCenter(new THREE.Vector3());
            scene.position.sub(center);
        }
    }, [scene]);

    // Continuous idle rotation
    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.3;
        }
    });

    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Push further back and scale down on mobile
    const modelScale = isMobile ? 1.6 : 2.5;
    const modelZ = isMobile ? -5 : -2;
    const modelX = isMobile ? 0 : -2; // Slightly off-center to the left on desktop

    return (
        <group ref={groupRef} scale={modelScale} position={[modelX, 0, modelZ]}>
            <primitive object={scene} />
        </group>
    );
});

AppleModel.displayName = 'AppleModel';

/* ───────────────────────────────────────────
   Glow light rig
   ─────────────────────────────────────────── */
const LightRig = () => {
    const pointLightRef = useRef();
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Subtle breathing glow, less intense on mobile
    const baseIntensity = isMobile ? 2 : 3;

    useFrame(({ clock }) => {
        if (pointLightRef.current) {
            const t = clock.getElapsedTime();
            pointLightRef.current.intensity = baseIntensity + Math.sin(t * 0.8) * 0.6;
        }
    });

    return (
        <>
            <ambientLight intensity={0.4} color="#b0c4ff" />
            <directionalLight position={[5, 8, 5]} intensity={1.0} color="#ffffff" />
            <directionalLight position={[-4, 3, -5]} intensity={0.4} color="#6e8efb" />
            <pointLight
                ref={pointLightRef}
                position={[0, 0, -3]}
                intensity={3}
                color="#7c6aff"
                distance={20}
                decay={2}
            />
            <pointLight
                position={[3, 2, 2]}
                intensity={1.5}
                color="#38bdf8"
                distance={15}
                decay={2}
            />
        </>
    );
};

/* ───────────────────────────────────────────
   Camera controller (positions camera nicely)
   ─────────────────────────────────────────── */
const CameraSetup = () => {
    const { camera } = useThree();

    useEffect(() => {
        // Move camera further away to reduce dominance
        camera.position.set(0, 0, 14);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    return null;
};

/* ───────────────────────────────────────────
   Exported Canvas Scene
   ─────────────────────────────────────────── */
const ModelScene = forwardRef((props, ref) => {
    const modelRef = useRef();

    // Forward the inner model ref
    useImperativeHandle(ref, () => ({
        getModel: () => modelRef.current,
    }));

    return (
        <Canvas
            className="auth-canvas"
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
        >
            <CameraSetup />
            <LightRig />
            <AppleModel ref={modelRef} modelPath="/3d_models/apple_logo.glb" />
            <Environment preset="night" />
        </Canvas>
    );
});

ModelScene.displayName = 'ModelScene';

export default ModelScene;
