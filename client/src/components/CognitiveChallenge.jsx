import { useState } from 'react';
import TypingChallenge from './TypingChallenge';
import MathPuzzle from './MathPuzzle';
import { motion, AnimatePresence } from 'framer-motion';

export default function CognitiveChallenge({ onComplete }) {
  const [challengeType, setChallengeType] = useState(null);

  const handleTypingComplete = (targetSentence) => {
    onComplete('typing', targetSentence, targetSentence);
  };

  const handleMathComplete = (correctAnswer) => {
    onComplete('math', String(correctAnswer), correctAnswer);
  };

  if (!challengeType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="text-center mb-6">
          <h3 className="heading-primary mb-1">COGNITIVE_CHALLENGE</h3>
          <p className="sub-heading text-mono-400">
            PROVE DELIBERATE INTENT THROUGH CALCULATION OR TRANSCRIPTION.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setChallengeType('typing')}
            id="btn-choose-typing"
            className="geometric-card p-6 text-left cursor-pointer group"
          >
            <h4 className="sub-heading text-mono-950 mb-1">TYPE_PROTOCOL</h4>
            <p className="text-[10px] text-mono-500 font-black uppercase tracking-widest leading-tight">ACCURATELY RETYPE SYSTEM MINDFULNESS STRING.</p>
          </button>

          <button
            onClick={() => setChallengeType('math')}
            id="btn-choose-math"
            className="geometric-card p-6 text-left cursor-pointer group"
          >
            <h4 className="sub-heading text-mono-950 mb-1">CALC_PUZZLE</h4>
            <p className="text-[10px] text-mono-500 font-black uppercase tracking-widest leading-tight">RESOLVE ARITHMETIC EXPRESSION TO PROCEED.</p>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {challengeType === 'typing' ? (
        <TypingChallenge key="typing" onComplete={handleTypingComplete} />
      ) : (
        <MathPuzzle key="math" onComplete={handleMathComplete} />
      )}
    </AnimatePresence>
  );
}
