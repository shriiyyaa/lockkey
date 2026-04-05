import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

function generatePuzzle() {
  const ops = [
    () => {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 30) + 5;
      const c = Math.floor(Math.random() * 20) + 1;
      return { question: `${a} × ${b} + ${c}`, answer: a * b + c };
    },
    () => {
      const a = Math.floor(Math.random() * 100) + 50;
      const b = Math.floor(Math.random() * 40) + 10;
      const c = Math.floor(Math.random() * 15) + 2;
      return { question: `${a} + ${b} × ${c}`, answer: a + b * c };
    },
    () => {
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 20) + 5;
      const c = Math.floor(Math.random() * 30) + 10;
      return { question: `(${a} + ${b}) × ${c}`, answer: (a + b) * c };
    },
    () => {
      const a = Math.floor(Math.random() * 500) + 100;
      const b = Math.floor(Math.random() * 200) + 50;
      const c = Math.floor(Math.random() * 50) + 10;
      return { question: `${a} - ${b} + ${c}`, answer: a - b + c };
    }
  ];

  return ops[Math.floor(Math.random() * ops.length)]();
}

export default function MathPuzzle({ onComplete }) {
  const puzzle = useMemo(() => generatePuzzle(), []);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = () => {
    const userAnswer = parseInt(answer);
    if (isNaN(userAnswer)) {
      setError('Please enter a number');
      return;
    }

    if (userAnswer === puzzle.answer) {
      onComplete(puzzle.answer);
    } else {
      setAttempts(prev => prev + 1);
      setError(`That's not right. ${attempts >= 1 ? 'Take your time and try again.' : 'Try again!'}`);
      setAnswer('');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h3 className="heading-primary mb-1">MATH_CHALLENGE</h3>
        <p className="sub-heading text-mono-400">RESOLVE_EXPRESSION_BELOW</p>
      </div>

      {/* Puzzle */}
      <div className="rounded-none p-8 text-center bg-mono-100 border-2 border-mono-950 shadow-[4px_4px_0_0_#3f3f46]">
        <p className="text-[8px] text-mono-500 font-black uppercase tracking-[0.2em] mb-4">COMPUTE_CAREFULLY</p>
        <p className="text-3xl sm:text-4xl font-black text-mono-950 font-mono tracking-tighter">
          {puzzle.question}
        </p>
        <p className="sub-heading text-mono-500 mt-5 uppercase"> = ?</p>
      </div>

      {/* Answer input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-field text-center text-xl font-mono w-full sm:flex-1"
          placeholder="Your answer"
          id="math-challenge-input"
        />
        <button
          onClick={handleSubmit}
          id="btn-submit-math"
          className="btn-primary w-full sm:flex-1 py-4"
        >
          VERIFY
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-accent-rose text-sm text-center"
        >
          {error}
        </motion.p>
      )}

      {attempts > 0 && (
        <p className="text-mono-500 text-[10px] font-black uppercase tracking-widest text-center">
          Attempts: {attempts} • Mental Math Only
        </p>
      )}
    </motion.div>
  );
}
