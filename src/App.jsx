import React, { useState } from 'react';
import Scene from './components/Scene';
import Questionnaire from './components/Questionnaire';
import { AnimatePresence } from 'framer-motion';

function App() {
  // Score starts neutral. 0 = worst (raining, dark), 100 = best (sunny, lush green)
  const [score, setScore] = useState(50);
  
  // To track which page/state we are in based on scroll position (passed up from Canvas)
  const [inAtmosphere, setInAtmosphere] = useState(false);

  const handleScrollState = (offset) => {
    // If offset > 0.5, we are inside the atmosphere
    if (offset > 0.6 && !inAtmosphere) {
      setInAtmosphere(true);
    } else if (offset < 0.6 && inAtmosphere) {
      setInAtmosphere(false);
    }
  };

  return (
    <>
      <div className="title">KIN</div>
      
      <div className="score-display">
        <div 
          className="dot" 
          style={{ 
            background: score > 60 ? '#00ff66' : score < 40 ? '#ff0033' : '#a0a0a0',
            boxShadow: `0 0 10px ${score > 60 ? '#00ff66' : score < 40 ? '#ff0033' : '#a0a0a0'}`
          }}
        />
        IMPACT: {score}
      </div>

      <Scene score={score} onScrollStateChange={handleScrollState} />
      
      <AnimatePresence>
        {inAtmosphere && (
          <Questionnaire score={score} setScore={setScore} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!inAtmosphere && (
          <div className="scroll-indicator">Scroll down to enter atmosphere</div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
