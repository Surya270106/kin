import React, { useState, useRef } from 'react';
import Scene from './components/Scene';
import Questionnaire from './components/Questionnaire';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [score, setScore] = useState(50);
  const [inAtmosphere, setInAtmosphere] = useState(false);
  
  const sunnyRef = useRef();
  const rainyRef = useRef();

  const handleScrollState = (offset) => {
    if (offset > 0.1 && !inAtmosphere) {
      setInAtmosphere(true);
    } else if (offset <= 0.1 && inAtmosphere) {
      setInAtmosphere(false);
    }
  };

  return (
    <>
      {/* Deep Space Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#000000',
        zIndex: -5
      }} />

      {/* Sunny Background (iOS Weather Style) */}
      <div ref={sunnyRef} style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #1d62c5 0%, #63a1ea 100%)',
        opacity: 0, // Managed by useFrame in Scene
        transition: 'opacity 0.1s linear',
        zIndex: -4
      }} />

      {/* Rainy Background (iOS Weather Style) */}
      <div ref={rainyRef} style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #2a313a 0%, #5c6874 100%)',
        opacity: 0, // Managed by useFrame in Scene
        transition: 'opacity 0.1s linear',
        zIndex: -3
      }} />

      <Scene 
        score={score} 
        onScrollStateChange={handleScrollState} 
        sunnyRef={sunnyRef} 
        rainyRef={rainyRef} 
      />
      
      <AnimatePresence>
        {inAtmosphere && (
          <Questionnaire score={score} setScore={setScore} />
        )}
      </AnimatePresence>

      <div style={{
        position: 'absolute',
        top: '30px',
        left: '30px',
        color: `hsl(${score * 1.2}, 100%, 70%)`,
        letterSpacing: '8px',
        fontSize: '18px',
        fontWeight: 300,
        transition: 'color 1s ease',
        zIndex: 10
      }}>
        KIN
      </div>
    </>
  );
}

export default App;
