import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function AtmosphereView({ score }) {
  const rainRef = useRef();
  
  // Create a particle system for rain
  const particleCount = 2000;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // Keep X and Y spread out
      temp[i * 3] = (Math.random() - 0.5) * 5; // X
      temp[i * 3 + 1] = (Math.random() - 0.5) * 5; // Y
      // Place strictly between the Earth's surface (1.0) and the camera (1.05)
      temp[i * 3 + 2] = 0.5 + Math.random() * 0.54; 
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!rainRef.current) return;
    
    // Animate rain falling (Y axis down)
    const positions = rainRef.current.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] -= delta * 3.0; // Fall speed (faster)
      if (positions[i * 3 + 1] < -2.5) {
        positions[i * 3 + 1] = 2.5; // Reset to top
      }
    }
    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Rain opacity: fades out completely as score approaches 100
  const rainOpacity = Math.max(0, 1.0 - (score / 100));
  
  // Smog (brownish pollution overlay)
  const smogOpacity = Math.max(0, 1.0 - (score / 40)) * 0.5;

  // Global lighting boost when score is high
  const sunIntensity = Math.max(0, (score - 40) / 60) * 2.0;

  return (
    <group>
      {/* Extra ambient light when things are good to simulate sun instead of a yellow plane */}
      <ambientLight intensity={sunIntensity} color="#fffacd" />

      {/* Rain Particles */}
      <points ref={rainRef}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            count={particleCount}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#ffffff" // Bright white so it's visible against the dark earth
          size={0.03} // Larger size to prevent invisibility
          transparent={true}
          opacity={rainOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Smog overlay (when score is low) */}
      <mesh position={[0, 0, 1.01]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial 
          color="#221100"
          transparent={true}
          opacity={smogOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
