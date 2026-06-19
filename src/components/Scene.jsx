import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Stars } from '@react-three/drei';
import EarthView from './EarthView';
import AtmosphereView from './AtmosphereView';
import * as THREE from 'three';

function CameraManager({ onScrollStateChange }) {
  const scroll = useScroll();

  useFrame((state) => {
    // Scroll ranges from 0 to 1
    const offset = scroll.offset;
    
    // Pass scroll state up to show/hide UI
    if (onScrollStateChange) {
      onScrollStateChange(offset);
    }

    // Outer space camera Z starts at 5, moves closer to 1.05 as you scroll down
    let targetZ = THREE.MathUtils.lerp(5, 1.05, offset);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    
    // Add a slight tilt to the camera to look along the horizon as we get close
    let targetRotX = THREE.MathUtils.lerp(0, 0.2, offset);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);
  });

  return null;
}

export default function Scene({ score, onScrollStateChange }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45, near: 0.01, far: 100 }}>
      <color attach="background" args={['#000000']} />
      
      <ambientLight intensity={0.05} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <ScrollControls pages={2} damping={0.2}>
        <CameraManager onScrollStateChange={onScrollStateChange} />
        
        <React.Suspense fallback={null}>
          <group>
            {/* Earth is at 0,0,0 with radius 1 */}
            <EarthView score={score} />
            
            {/* Atmosphere effects kick in when camera is close */}
            <AtmosphereView score={score} />
          </group>
        </React.Suspense>
      </ScrollControls>
    </Canvas>
  );
}
