import React, { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  {
    id: 1,
    text: "How did you travel today?",
    goodText: "Public Transport / Bike",
    badText: "Drove Alone",
    goodImpact: 20,
    badImpact: -20
  },
  {
    id: 2,
    text: "Did you use single-use plastics?",
    goodText: "No, used reusables",
    badText: "Yes, plastic bags/cups",
    goodImpact: 15,
    badImpact: -15
  },
  {
    id: 3,
    text: "What was your main meal today?",
    goodText: "Plant-based meal",
    badText: "Heavy meat-based meal",
    goodImpact: 25,
    badImpact: -25
  }
];

export default function Questionnaire({ score, setScore }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);

  if (currentQIndex >= questions.length) {
    return (
      <motion.div 
        className="overlay-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="questionnaire">
          <h2>Thank you for checking in.</h2>
          <p style={{marginBottom: "30px", opacity: 0.7}}>Your environment reflects your choices. Scroll up to see the global view.</p>
          <button className="btn" onClick={() => {
            setCurrentQIndex(0);
            setScore(50);
          }}>Reset Journey</button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQIndex];

  const handleAnswer = (impact) => {
    setScore(prev => Math.max(0, Math.min(100, prev + impact)));
    setCurrentQIndex(prev => prev + 1);
  };

  return (
    <motion.div 
      className="overlay-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      key={q.id}
    >
      <div className="questionnaire">
        <h2>{q.text}</h2>
        <div className="btn-container">
          <button 
            className="btn good" 
            autoFocus
            onClick={() => handleAnswer(q.goodImpact)}
            aria-label={`Choose: ${q.goodText} — positive environmental impact`}
          >
            {q.goodText}
          </button>
          <button 
            className="btn bad" 
            onClick={() => handleAnswer(q.badImpact)}
            aria-label={`Choose: ${q.badText} — negative environmental impact`}
          >
            {q.badText}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
