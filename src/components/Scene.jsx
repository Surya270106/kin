import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Stars } from '@react-three/drei';
import EarthView from './EarthView';
import AtmosphereView from './AtmosphereView';
import * as THREE from 'three';

function CameraManager({ onScrollStateChange, score }) {
  const scroll = useScroll();

  useFrame((state) => {
    const offset = scroll.offset;
    if (onScrollStateChange) onScrollStateChange(offset);

    // Camera dive: Z starts at 5 (Space), ends at 1.05 (Ocean Level)
    let targetZ = THREE.MathUtils.lerp(5, 1.05, offset);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    
    // Look along the horizon as we land
    let targetRotX = THREE.MathUtils.lerp(0, 0.1, offset);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);

    // Dynamic Fog & Background color based on score
    const isHealthy = score / 100;
    
    // Base fog color depends on health
    const targetFogColor = new THREE.Color().lerpColors(
      new THREE.Color('#11151a'), // dark stormy grey
      new THREE.Color('#aaccff'), // bright healthy blue
      isHealthy
    );

    // Fade to black when in space (offset < 0.5)
    const finalFogColor = new THREE.Color('#000000').lerp(targetFogColor, Math.max(0, (offset - 0.5) * 2));

    // Fog density spikes as we go through the clouds (offset ~0.5), then settles
    let fogDensity = 0;
    if (offset > 0.4) {
      const settleDensity = THREE.MathUtils.lerp(0.08, 0.01, isHealthy); // Thicker fog when damaged
      fogDensity = THREE.MathUtils.lerp(0.0, settleDensity, (offset - 0.4) * 1.6);
    }

    state.scene.background = finalFogColor;
    state.scene.fog = new THREE.FogExp2(finalFogColor, fogDensity);
  });

  return null;
}

export default function Scene({ score, onScrollStateChange }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45, near: 0.01, far: 1000 }}>
      {/* Space ambient lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 3, 5]} intensity={2.5} color="#ffffff" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ScrollControls pages={2} damping={0.2}>
        <CameraManager onScrollStateChange={onScrollStateChange} score={score} />
        
        <React.Suspense fallback={null}>
          <group>
            <EarthView score={score} />
            <AtmosphereView score={score} />
          </group>
        </React.Suspense>
      </ScrollControls>
    </Canvas>
  );
}
