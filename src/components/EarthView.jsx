import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function EarthView({ score }) {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const lightsRef = useRef();

  // Load textures from common CDN
  const [colorMap, bumpMap, lightsMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame((state, delta) => {
    // Rotate slowly in real-time
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.02;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.025; // Clouds move slightly faster
    if (lightsRef.current) lightsRef.current.rotation.y += delta * 0.02;
  });

  // Green emissive color for lights, intensity based on score
  const emissiveOpacity = (score / 100) * 1.5; // Very bright at 100, completely off at 0
  
  // Atmosphere color changes based on score
  const atmosphereColor = new THREE.Color().lerpColors(
    new THREE.Color('#441100'), // polluted
    new THREE.Color('#00aaff'), // clean
    score / 100
  );

  // Tint the actual Earth texture so it visibly changes from dry/polluted to lush green!
  const earthTint = new THREE.Color().lerpColors(
    new THREE.Color('#ffaaaa'), // reddish brown tint (dry/dead)
    new THREE.Color('#aaffaa'), // lush bright green tint (healthy)
    score / 100
  );

  return (
    <group>
      {/* Base Earth */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshStandardMaterial 
          map={colorMap}
          color={earthTint}
          bumpMap={bumpMap}
          bumpScale={0.015}
          roughness={0.6}
          metalness={0.1}
        />
      </Sphere>

      {/* Night Lights Overlay (Green) */}
      <Sphere ref={lightsRef} args={[1.001, 64, 64]}>
        <meshBasicMaterial 
          map={lightsMap}
          blending={THREE.AdditiveBlending}
          transparent={true}
          opacity={emissiveOpacity}
          color="#00ff44" 
        />
      </Sphere>

      {/* Clouds */}
      <Sphere ref={cloudsRef} args={[1.005, 64, 64]}>
        <meshLambertMaterial 
          map={cloudsMap}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Atmospheric Glow */}
      <Sphere args={[1.02, 64, 64]}>
        <meshBasicMaterial 
          color={atmosphereColor}
          transparent={true}
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}
