import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sky, useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function AtmosphereView({ score }) {
  const rainRef = useRef();
  const waterRef = useRef();
  const scroll = useScroll();
  const groupRef = useRef();
  
  const waterNormalMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg');
  waterNormalMap.wrapS = waterNormalMap.wrapT = THREE.RepeatWrapping;

  const particleCount = 3000;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 1] = Math.random() * 5;
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
        positions[i * 3 + 1] -= delta * 4.0;
        if (positions[i * 3 + 1] < -0.5) {
          positions[i * 3 + 1] = 5; 
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    if (waterRef.current) {
      waterRef.current.material.normalMap.offset.x += delta * 0.05;
      waterRef.current.material.normalMap.offset.y += delta * 0.05;
    }
  });

  const isHealthy = score / 100;

  const rainOpacity = score < 60
    ? THREE.MathUtils.lerp(0.9, 0, score / 60)
    : 0;
  
  const sunPosition = useMemo(() => {
    const sunElevation = THREE.MathUtils.lerp(0, 45, isHealthy);
    return new THREE.Vector3().setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(90 - sunElevation),
      THREE.MathUtils.degToRad(180)
    );
  }, [isHealthy]);

  const turbidity = THREE.MathUtils.lerp(20, 2, isHealthy);
  const rayleigh = THREE.MathUtils.lerp(5, 0.5, isHealthy);

  const waterColor = new THREE.Color().lerpColors(
    new THREE.Color('#0a1118'),
    new THREE.Color('#0066ff'),
    isHealthy
  );

  return (
    <group ref={groupRef} position={[0, -1, 1.05]}> 
      <Sky 
        sunPosition={sunPosition} 
        turbidity={turbidity} 
        rayleigh={rayleigh} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />

      <directionalLight position={sunPosition} intensity={isHealthy * 2} color="#ffffff" castShadow />
      <ambientLight intensity={0.2 + isHealthy * 0.5} />

      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100, 1, 1]} />
        <meshPhysicalMaterial 
          color={waterColor}
          metalness={0.9}
          roughness={0.1}
          normalMap={waterNormalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          envMapIntensity={1.0}
          transmission={0.5}
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
          color="#ffffff"
          size={3}
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
