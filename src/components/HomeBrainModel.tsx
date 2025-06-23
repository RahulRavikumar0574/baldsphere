"use client";

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function RotatingBrain() {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/blue_brain.glb');

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

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  if (!clonedScene) return null;

  return (
    <group ref={meshRef} scale={0.04} position={[0, -2.3, 0]}>
      <primitive object={clonedScene} />
    </group>
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

        <RotatingBrain />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/blue_brain.glb');
