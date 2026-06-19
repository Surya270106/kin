import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function EarthView({ score }) {
  const earthRef = useRef();
  const lightsRef = useRef();
  const cloudsRef = useRef();
  const scroll = useScroll();

  const [colorMap, normalMap, specularMap, lightsMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  ]);

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.02;
    if (lightsRef.current) lightsRef.current.rotation.y += delta * 0.02;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.025;

    const offset = scroll.offset;
    const fade = Math.max(0, 1.0 - Math.pow(offset * 1.5, 4)); 
    
    if (earthRef.current) {
      earthRef.current.material.opacity = fade;
      earthRef.current.material.transparent = true;
      earthRef.current.material.needsUpdate = true;
    }
    
    if (lightsRef.current) {
      const baseEmissive = (score / 100) * 1.5;
      lightsRef.current.material.opacity = fade * baseEmissive;
      lightsRef.current.material.needsUpdate = true;
    }

    if (cloudsRef.current) {
      cloudsRef.current.material.opacity = fade * 0.4;
      cloudsRef.current.material.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Base Earth - Realistic High Contrast */}
      <Sphere ref={earthRef} args={[1, 64, 64]}>
        <meshPhongMaterial 
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          specular={new THREE.Color('#224488')}
          shininess={10}
          bumpScale={0.015}
          depthWrite={true}
        />
      </Sphere>

      {/* Night Lights Overlay */}
      <Sphere ref={lightsRef} args={[1.001, 64, 64]}>
        <meshBasicMaterial 
          map={lightsMap}
          blending={THREE.AdditiveBlending}
          transparent={true}
          color="#ffdd88" 
          depthWrite={false}
        />
      </Sphere>

      {/* Clouds */}
      <Sphere ref={cloudsRef} args={[1.003, 64, 64]}>
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
          roughness={1}
          metalness={0}
        />
      </Sphere>
    </group>
  );
}
