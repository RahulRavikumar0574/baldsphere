
'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

export default function BrainModel({ highlightedRegions = [] }: { highlightedRegions?: string[] }) {
  const { scene } = useGLTF('/Brain.glb');

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.name && child.visible !== undefined) {
          const name = child.name.toLowerCase();

          const isArrowLike = name.includes('arrow') ||
                             name.includes('pointer') ||
                             name.includes('cone') ||
                             name.includes('cylinder') ||
                             name.includes('line') ||
                             name.includes('guide') ||
                             name.includes('marker') ||
                             name.includes('indicator') ||
                             name.includes('parital') ||
                             name.includes('parietal');

          if (isArrowLike) {
            child.visible = false;
          }
        }
      });
    }
  }, [scene]);

  if (!scene) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
    );
  }

  return (
    <group>
      <primitive object={scene} scale={0.1} position={[0, 0, 0]} />

      {highlightedRegions.includes('Parietal') && (
        <mesh position={[0, 0.15, 0]} scale={[0.025, 0.025, 0.025]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1, 3, 6]} />
          <meshStandardMaterial color={0xffff00} emissive={0x444400} emissiveIntensity={0.8} />
        </mesh>
      )}

      {highlightedRegions.includes('Frontal') && (
        <mesh position={[0, 0.02, 0.12]} scale={[0.02, 0.02, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1, 3, 6]} />
          <meshStandardMaterial color={0x0066ff} emissive={0x002244} emissiveIntensity={0.8} />
        </mesh>
      )}

      {highlightedRegions.includes('Temporal') && (
        <>
          <mesh position={[0.12, 0, 0]} scale={[0.02, 0.02, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[1, 3, 6]} />
            <meshStandardMaterial color={0x00ff66} emissive={0x004422} emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.12, 0, 0]} scale={[0.02, 0.02, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[1, 3, 6]} />
            <meshStandardMaterial color={0x00ff66} emissive={0x004422} emissiveIntensity={0.8} />
          </mesh>
        </>
      )}

      {highlightedRegions.includes('Occipital') && (
        <mesh position={[0, 0.02, -0.12]} scale={[0.02, 0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1, 3, 6]} />
          <meshStandardMaterial color={0xff3300} emissive={0x441100} emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload('/Brain.glb');
