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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Simulate loading time for brain model
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  if (hasError) {
    return (
      <div className="w-full max-w-xs h-48 xs:max-w-sm xs:h-56 sm:max-w-md sm:h-64 md:max-w-lg md:h-72 lg:max-w-xl lg:h-80 xl:max-w-2xl xl:h-96 mx-auto mb-6 sm:mb-8 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-gray-600">
          <div className="text-4xl mb-2">🧠</div>
          <p className="text-sm">Brain model unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs h-48 xs:max-w-sm xs:h-56 sm:max-w-md sm:h-64 md:max-w-lg md:h-72 lg:max-w-xl lg:h-80 xl:max-w-2xl xl:h-96 mx-auto mb-6 sm:mb-8 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading brain model...</p>
          </div>
        </div>
      )}
      <Canvas
        camera={getCameraSettings()}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 2]} // Responsive pixel ratio
        onCreated={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
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
