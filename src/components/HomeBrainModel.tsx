"use client";

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveBrain() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/blue_brain.glb');
  const [autoRotate, setAutoRotate] = useState(true);

  const clonedScene = scene.clone();

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.visible = true;
          const mesh = child;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.transparent = false;
            material.opacity = 1;
          }
        }
      });
    }
  }, [clonedScene]);

  // Auto-rotate only when not being manually controlled
  useFrame((state) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  if (!clonedScene) return null;

  return (
    <>
      <group ref={meshRef} scale={0.04} position={[0, -2.3, 0]}>
        <primitive object={clonedScene} />
      </group>
      <OrbitControls
        enableDamping
        dampingFactor={0.25}
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        onStart={() => setAutoRotate(false)}
        onEnd={() => setAutoRotate(true)}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function HomeBrainModel() {
  return (
    <div className="w-80 h-64 sm:w-96 sm:h-72 md:w-[28rem] md:h-80 lg:w-[32rem] lg:h-96 mx-auto mb-8">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[2, 2, 2]}
          intensity={0.5}
        />

        <InteractiveBrain />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/blue_brain.glb');
