import React, { useState } from 'react';
import Scene from './components/Scene';
import Questionnaire from './components/Questionnaire';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [score, setScore] = useState(50);
  const [inAtmosphere, setInAtmosphere] = useState(false);

  const handleScrollState = (offset) => {
    if (offset > 0.6 && !inAtmosphere) {
      setInAtmosphere(true);
    } else if (offset < 0.6 && inAtmosphere) {
      setInAtmosphere(false);
    }
  };

  return (
    <>
      <div
        className="title"
        style={{
          color: score > 60
            ? `rgba(100, 255, 150, ${0.7 + (score - 60) / 100})`
            : score < 40
            ? `rgba(180, 210, 255, ${0.5 + (40 - score) / 100})`
            : '#ffffff',
          transition: 'color 2s ease'
        }}
      >
        KIN
      </div>

      <Scene score={score} onScrollStateChange={handleScrollState} />
      
      <AnimatePresence>
        {inAtmosphere && (
          <Questionnaire score={score} setScore={setScore} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!inAtmosphere && (
          <div className="scroll-indicator">
            <div style={{ fontSize: '11px', letterSpacing: '3px', marginBottom: '8px' }}>
              SCROLL
            </div>
            <div style={{ fontSize: '20px', lineHeight: 1 }}>↓</div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
