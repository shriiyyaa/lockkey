import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = [
  { name: 'RED', hex: '#ef4444' },
  { name: 'BLUE', hex: '#3b82f6' },
  { name: 'GREEN', hex: '#22c55e' },
  { name: 'YELLOW', hex: '#eab308' },
  { name: 'PURPLE', hex: '#a855f7' }
];

export default function StroopTest({ onComplete }) {
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ text: '', color: '' });
  const [status, setStatus] = useState('idle'); // idle, correct, wrong

  const generateRound = () => {
    const textColorIndex = Math.floor(Math.random() * COLORS.length);
    let fontColorIndex = Math.floor(Math.random() * COLORS.length);
    
    // Ensure text and color are different
    while (fontColorIndex === textColorIndex) {
      fontColorIndex = Math.floor(Math.random() * COLORS.length);
    }

    setTarget({
      text: COLORS[textColorIndex].name,
      color: COLORS[fontColorIndex].hex,
      colorName: COLORS[fontColorIndex].name
    });
  };

  useEffect(() => {
    generateRound();
  }, []);

  const handleChoice = (choiceName) => {
    if (choiceName === target.colorName) {
      const newScore = score + 1;
      setScore(newScore);
      setStatus('correct');
      if (newScore >= 5) {
        setTimeout(onComplete, 1000);
      } else {
        setTimeout(() => {
          setStatus('idle');
          generateRound();
        }, 500);
      }
    } else {
      setScore(0);
      setStatus('wrong');
      setTimeout(() => {
        setStatus('idle');
        generateRound();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-mono-950 uppercase tracking-tighter mb-2">
          STAGE 4: COLOR_CONFLICT
        </h3>
        <p className="text-[10px] text-mono-500 font-bold uppercase tracking-widest leading-loose">
          SELECT THE **FONT COLOR**, IGNORE THE TEXT MEANING.
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-3 h-3 border-2 border-mono-950 transition-colors ${
              score >= i ? 'bg-green-500' : 'bg-mono-100'
            }`}
          />
        ))}
      </div>

      {/* The Target Word */}
      <motion.div
        key={target.text + target.color}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-24 sm:h-32 flex items-center justify-center"
      >
        <span 
          style={{ color: target.color }}
          className="text-4xl sm:text-6xl font-black italic tracking-tighter"
        >
          {target.text}
        </span>
      </motion.div>

      {/* The Choices */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xs">
        {COLORS.map((c) => (
          <button
            key={c.name}
            onClick={() => handleChoice(c.name)}
            disabled={status !== 'idle'}
            className="btn-secondary py-3 text-[10px] font-black uppercase tracking-widest border-2 border-mono-950 hover:bg-mono-950 hover:text-ivory transition-colors"
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="h-6">
        <AnimatePresence>
          {status === 'wrong' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-[10px] font-black uppercase tracking-widest"
            >
              FAILURE_DETECTED: STREAK_REBOOTED.
            </motion.p>
          )}
          {status === 'correct' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 text-[10px] font-black uppercase tracking-widest"
            >
              ACCURATE_STREAK: {score}/5
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
