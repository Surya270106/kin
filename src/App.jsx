import React, { useState } from 'react';
import Scene from './components/Scene';
import Questionnaire from './components/Questionnaire';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [score, setScore] = useState(50);
  const [scrollOffset, setScrollOffset] = useState(0);

  const isHealthy = score / 100;

  return (
    <>
      {/* Deep Space Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: '#000000',
        zIndex: -5
      }} />

      {/* Sunny Background (iOS Weather Style) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #1d62c5 0%, #63a1ea 100%)',
        opacity: Math.min(scrollOffset * 3, 1) * isHealthy,
        transition: 'opacity 1s ease',
        zIndex: -4
      }} />

      {/* Rainy Background (iOS Weather Style) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, #2a313a 0%, #5c6874 100%)',
        opacity: Math.min(scrollOffset * 3, 1) * (1 - isHealthy),
        transition: 'opacity 1s ease',
        zIndex: -3
      }} />

      <Scene score={score} onScrollStateChange={setScrollOffset} />
      
      <AnimatePresence>
        {scrollOffset > 0.1 && (
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
