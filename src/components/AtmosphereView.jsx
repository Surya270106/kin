import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function AtmosphereView({ score }) {
  const rainRef = useRef();
  const waterRef = useRef();
  const sunRef = useRef();
  const scroll = useScroll();
  const groupRef = useRef();
  
  const waterNormalMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg');
  waterNormalMap.wrapS = waterNormalMap.wrapT = THREE.RepeatWrapping;

  const particleCount = 4000;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 1] = Math.random() * 10;
      temp[i * 3 + 2] = Math.random() * 5 - 2;
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    const offset = scroll.offset;
    
    if (groupRef.current) {
      const shouldBeVisible = offset > 0.4;
      if (groupRef.current.visible !== shouldBeVisible) {
        groupRef.current.visible = shouldBeVisible;
      }
    }

    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= delta * 12.0; // Falling much faster for realism
        if (positions[i * 3 + 1] < -0.5) {
          positions[i * 3 + 1] = 10; 
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (waterRef.current) {
      waterRef.current.material.normalMap.offset.x += delta * 0.03;
      waterRef.current.material.normalMap.offset.y += delta * 0.03;
    }

    // Softly pulse the sun
    if (sunRef.current) {
       sunRef.current.scale.setScalar(1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  const isHealthy = score / 100;

  const rainOpacity = score < 60
    ? THREE.MathUtils.lerp(0.8, 0, score / 60)
    : 0;
  
  const sunPosition = useMemo(() => {
    const sunElevation = THREE.MathUtils.lerp(10, 45, isHealthy);
    return new THREE.Vector3().setFromSphericalCoords(
      50, // Far away in the sky
      THREE.MathUtils.degToRad(90 - sunElevation),
      THREE.MathUtils.degToRad(180)
    );
  }, [isHealthy]);

  const waterColor = new THREE.Color().lerpColors(
    new THREE.Color('#1a242f'), // dark slate grey
    new THREE.Color('#2a6bad'), // rich blue
    isHealthy
  );

  return (
    <group ref={groupRef} position={[0, -1, 1.05]}> 
      
      {/* Sun glow sprite */}
      <mesh ref={sunRef} position={sunPosition}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isHealthy} fog={false} />
      </mesh>
      
      {/* Wide soft sun flare */}
      <mesh position={sunPosition}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={isHealthy * 0.2} blending={THREE.AdditiveBlending} fog={false} depthWrite={false} />
      </mesh>

      <directionalLight position={sunPosition} intensity={isHealthy * 3} color="#ffffff" castShadow />
      <ambientLight intensity={0.3 + isHealthy * 0.5} color={waterColor} />

      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100, 1, 1]} />
        <meshPhysicalMaterial 
          color={waterColor}
          metalness={0.95}
          roughness={0.1}
          normalMap={waterNormalMap}
          normalScale={new THREE.Vector2(0.3, 0.3)} // Softer ripples
          envMapIntensity={1.0}
          transmission={0.3}
          ior={1.33}
        />
      </mesh>

      <points ref={rainRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            count={particleCount}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#aaccff"
          size={1.2}
          sizeAttenuation={false}
          transparent={true}
          opacity={rainOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
