import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, useScroll, Stars, Html } from '@react-three/drei';
import EarthView from './EarthView';
import AtmosphereView from './AtmosphereView';
import * as THREE from 'three';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'Inter, sans-serif', letterSpacing: '4px'
        }}>
          KIN — Loading environment...
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingScreen = () => (
  <Html fullscreen>
    <div style={{
      position: 'absolute', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Inter, sans-serif',
      gap: '20px', zIndex: 9999
    }}>
      <div style={{ fontSize: '28px', letterSpacing: '8px', fontWeight: 200 }}>KIN</div>
      <div style={{ fontSize: '11px', letterSpacing: '3px', opacity: 0.4, textTransform: 'uppercase' }}>
        Loading Earth...
      </div>
    </div>
  </Html>
);

function CameraManager({ onScrollStateChange, score, sunnyRef, rainyRef }) {
  const scroll = useScroll();
  const fogRef = useRef(new THREE.FogExp2('#000000', 0));
  
  // These must perfectly match the BOTTOM colors of the App.jsx CSS gradients
  const rainyBottom = useRef(new THREE.Color('#5c6874'));
  const sunnyBottom = useRef(new THREE.Color('#63a1ea'));
  const blackColor = useRef(new THREE.Color('#000000'));
  const targetFogColor = useRef(new THREE.Color());

  useEffect(() => {
    fogRef.current = new THREE.FogExp2('#000000', 0);
  }, []);

  useFrame((state) => {
    const offset = scroll.offset;
    if (onScrollStateChange) onScrollStateChange(offset);

    const isHealthy = score / 100;
    
    // Smoothly update CSS background opacities without triggering React re-renders!
    if (sunnyRef && sunnyRef.current) {
      sunnyRef.current.style.opacity = Math.min(offset * 3, 1) * isHealthy;
    }
    if (rainyRef && rainyRef.current) {
      rainyRef.current.style.opacity = Math.min(offset * 3, 1) * (1 - isHealthy);
    }

    targetFogColor.current.lerpColors(rainyBottom.current, sunnyBottom.current, isHealthy);
    targetFogColor.current.lerp(blackColor.current, Math.max(0, 1 - (offset - 0.5) * 2));

    const targetZ = THREE.MathUtils.lerp(5, 1.05, offset);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.1);
    const targetRotX = THREE.MathUtils.lerp(0, 0.1, offset);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, targetRotX, 0.1);

    let fogDensity = 0;
    if (offset > 0.4) {
      const settleDensity = THREE.MathUtils.lerp(0.08, 0.01, isHealthy);
      fogDensity = THREE.MathUtils.lerp(0.0, settleDensity, (offset - 0.4) * 1.6);
    }

    if (!state.scene.fog) {
      state.scene.fog = fogRef.current;
    }
    state.scene.fog.color.copy(targetFogColor.current);
    state.scene.fog.density = fogDensity;
    
    // IMPORTANT: Make canvas background transparent so CSS gradient shows through!
    state.scene.background = null; 
  });

  return null;
}

export default function Scene({ score, onScrollStateChange, sunnyRef, rainyRef }) {
  return (
    <ErrorBoundary>
      <Canvas gl={{ alpha: true }} camera={{ position: [0, 0, 5], fov: 45, near: 0.01, far: 1000 }}>
        <ambientLight intensity={0.02} />
        <directionalLight position={[-5, 5, 5]} intensity={3.0} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ScrollControls pages={2} damping={0.2}>
          <CameraManager 
            onScrollStateChange={onScrollStateChange} 
            score={score} 
            sunnyRef={sunnyRef} 
            rainyRef={rainyRef} 
          />
          
          <React.Suspense fallback={<LoadingScreen />}>
            <EarthView score={score} />
          </React.Suspense>
          <React.Suspense fallback={null}>
            <AtmosphereView score={score} />
          </React.Suspense>
        </ScrollControls>
      </Canvas>
    </ErrorBoundary>
  );
}
