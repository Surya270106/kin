import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function EarthView({ score }) {
  const earthRef = useRef();
  const lightsRef = useRef();
  const scroll = useScroll();

  const [colorMap, bumpMap, lightsMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg'
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.02;
    if (lightsRef.current) lightsRef.current.rotation.y += delta * 0.02;

    const offset = scroll.offset;
    // Earth fades out as we hit the atmosphere so the water/sky take over
    const fade = Math.max(0, 1.0 - Math.pow(offset * 1.5, 4)); 
    
    if (earthRef.current) {
      earthRef.current.material.opacity = fade;
      earthRef.current.material.transparent = true;
      earthRef.current.material.needsUpdate = true;
    }
    
    if (lightsRef.current) {
      // Base intensity based on score
      const baseEmissive = (score / 100) * 1.5;
      lightsRef.current.material.opacity = fade * baseEmissive;
      lightsRef.current.material.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Base Earth - Realistic Apple Style */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={colorMap}
          color="#ffffff" 
          bumpMap={bumpMap}
          bumpScale={0.015}
          roughness={0.6}
          metalness={0.1}
          depthWrite={true}
        />
      </Sphere>

      {/* Night Lights Overlay (Bioluminescent Green) */}
      <Sphere ref={lightsRef} args={[1.001, 64, 64]}>
        <meshBasicMaterial 
          map={lightsMap}
          blending={THREE.AdditiveBlending}
          transparent={true}
          color="#00ff44" 
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}
