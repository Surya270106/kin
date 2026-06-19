import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sky, useScroll } from '@react-three/drei';
import * as THREE from 'three';

export default function AtmosphereView({ score }) {
  const rainRef = useRef();
  const waterRef = useRef();
  const scroll = useScroll();
  const groupRef = useRef();
  
  // Load highly realistic water normal map
  const waterNormalMap = useLoader(THREE.TextureLoader, 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg');
  waterNormalMap.wrapS = waterNormalMap.wrapT = THREE.RepeatWrapping;

  const particleCount = 2000;
  const particles = useMemo(() => {
    const temp = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10; // X spread
      temp[i * 3 + 1] = Math.random() * 5; // Y (height)
      temp[i * 3 + 2] = Math.random() * 5 - 2; // Z depth
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    const offset = scroll.offset;
    
    // Only show atmosphere group when we get close to the Earth
    if (groupRef.current) {
      groupRef.current.visible = offset > 0.4;
    }

    // Animate Rain
    if (rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= delta * 4.0;
        if (positions[i * 3 + 1] < -0.5) { // Reset above water
          positions[i * 3 + 1] = 5; 
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate Water ripples
    if (waterRef.current) {
      waterRef.current.material.normalMap.offset.x += delta * 0.05;
      waterRef.current.material.normalMap.offset.y += delta * 0.05;
    }
  });

  // Score mapping (0 = damaged, 100 = healthy)
  const isHealthy = score / 100;

  // Rain opacity: fades out when score > 50
  const rainOpacity = Math.max(0, 1.0 - (score / 50));
  
  // Sun position: low on horizon when damaged, high when healthy
  const sunElevation = THREE.MathUtils.lerp(0, 45, isHealthy);
  const azimuth = 180;
  const sunPosition = new THREE.Vector3().setFromSphericalCoords(
    1, 
    THREE.MathUtils.degToRad(90 - sunElevation), 
    THREE.MathUtils.degToRad(azimuth)
  );

  // Sky turbidity (murkiness): high when damaged
  const turbidity = THREE.MathUtils.lerp(20, 2, isHealthy);
  // Rayleigh (sky scattering): high when damaged for gray/reddish sky
  const rayleigh = THREE.MathUtils.lerp(5, 0.5, isHealthy);

  // Water color
  const waterColor = new THREE.Color().lerpColors(
    new THREE.Color('#0a1118'), // dark murky stormy water
    new THREE.Color('#0066ff'), // vibrant blue ocean
    isHealthy
  );

  return (
    <group ref={groupRef} position={[0, -1, 1.05]}> 
      {/* Positioned right where the camera lands */}
      
      {/* Physical Sky */}
      <Sky 
        sunPosition={sunPosition} 
        turbidity={turbidity} 
        rayleigh={rayleigh} 
        mieCoefficient={0.005} 
        mieDirectionalG={0.8} 
      />

      {/* Lighting for the ground scene */}
      <directionalLight position={sunPosition} intensity={isHealthy * 2} color="#ffffff" castShadow />
      <ambientLight intensity={0.2 + isHealthy * 0.5} />

      {/* Realistic Water Plane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[100, 100, 128, 128]} />
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

      {/* Rain Particles */}
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
