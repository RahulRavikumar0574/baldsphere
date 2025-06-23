"use client";

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveBrain({ isMobile }: { isMobile: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/blue_brain.glb');
  const [autoRotate, setAutoRotate] = useState(true);
  const { viewport } = useThree();

  const clonedScene = scene.clone();

  // Responsive scaling based on viewport and device type
  const getResponsiveScale = () => {
    if (isMobile) {
      return Math.min(viewport.width * 0.008, 0.045); // Smaller on mobile
    }
    return Math.min(viewport.width * 0.006, 0.05); // Larger on desktop
  };

  // Responsive position based on viewport
  const getResponsivePosition = (): [number, number, number] => {
    if (isMobile) {
      return [0, -2.0, 0]; // Higher position on mobile
    }
    return [0, -2.3, 0]; // Lower position on desktop
  };

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
      <group
        ref={meshRef}
        scale={getResponsiveScale()}
        position={getResponsivePosition()}
      >
        <primitive object={clonedScene} />
      </group>
      <OrbitControls
        enableDamping
        dampingFactor={0.25}
        enableZoom={true}
        enablePan={false}
        minDistance={isMobile ? 2.5 : 3}
        maxDistance={isMobile ? 6 : 8}
        onStart={() => setAutoRotate(false)}
        onEnd={() => setAutoRotate(true)}
        autoRotate={autoRotate}
        autoRotateSpeed={isMobile ? 0.3 : 0.5}
      />
    </>
  );
}

export default function HomeBrainModel() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Responsive camera settings
  const getCameraSettings = () => {
    if (isMobile) {
      return {
        position: [0, 0, 4] as [number, number, number],
        fov: 60
      };
    }
    return {
      position: [0, 0, 5] as [number, number, number],
      fov: 50
    };
  };

  return (
    <div className="w-full max-w-xs h-48 xs:max-w-sm xs:h-56 sm:max-w-md sm:h-64 md:max-w-lg md:h-72 lg:max-w-xl lg:h-80 xl:max-w-2xl xl:h-96 mx-auto mb-6 sm:mb-8">
      <Canvas
        camera={getCameraSettings()}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]} // Responsive pixel ratio
      >
        <ambientLight intensity={isMobile ? 0.9 : 0.8} />
        <directionalLight
          position={[2, 2, 2]}
          intensity={isMobile ? 0.6 : 0.5}
        />

        <InteractiveBrain isMobile={isMobile} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/blue_brain.glb');
