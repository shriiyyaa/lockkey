import { useState } from 'react';
import { motion } from 'framer-motion';

const SENTENCES = [
  "I am choosing focus over distraction right now.",
  "My goals are more important than a quick scroll.",
  "I have the strength to wait a little longer.",
  "This moment of patience is building my discipline.",
  "I am in control of my attention and my time.",
  "Every minute of focus brings me closer to my goals.",
  "I choose to be present and productive right now.",
  "Distractions can wait but my dreams cannot."
];

export default function TypingChallenge({ onComplete }) {
  const [targetSentence] = useState(
    () => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]
  );
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');

  const isCorrect = typed === targetSentence;
  const progress = typed.length / targetSentence.length;

  // Check character-by-character correctness for highlighting
  const getCharStatus = (index) => {
    if (index >= typed.length) return 'pending';
    return typed[index] === targetSentence[index] ? 'correct' : 'wrong';
  };

  const handleSubmit = () => {
    if (isCorrect) {
      onComplete(targetSentence);
    } else {
      setError('Text doesn\'t match exactly. Check for typos and try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h3 className="heading-primary mb-1">TYPE_CHALLENGE</h3>
        <p className="sub-heading text-mono-400">TYPE_EXACT_STRING_BELOW</p>
      </div>

      {/* Target sentence */}
      <div className="rounded-none p-5 bg-mono-100 border-2 border-mono-950 shadow-[4px_4px_0_0_#3f3f46]">
        <p className="text-mono-950 text-sm leading-relaxed font-mono tracking-normal font-black uppercase">
          {targetSentence.split('').map((char, i) => (
            <span
              key={i}
              className={
                getCharStatus(i) === 'correct' ? 'bg-mono-950 text-ivory mr-[1px]' :
                getCharStatus(i) === 'wrong' ? 'bg-red-600 text-ivory mr-[1px]' :
                'text-mono-400'
              }
            >
              {char}
            </span>
          ))}
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-mono-100 rounded-none overflow-hidden border-2 border-mono-950">
        <motion.div
          className="h-full bg-mono-950"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.3 }}
          layout
        />
      </div>

      {/* Input */}
      <textarea
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="input-field min-h-[80px] font-mono text-sm resize-none"
        placeholder="Start typing here..."
        id="typing-challenge-input"
      />

      {error && (
        <p className="text-accent-rose text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isCorrect}
        id="btn-submit-typing"
        className={`w-full py-4 rounded-none font-black uppercase tracking-[0.2em] transition-all duration-200 border-2 ${
          isCorrect
            ? 'bg-ivory border-mono-950 text-mono-950 shadow-[4px_4px_0_0_#3f3f46] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#3f3f46] active:translate-x-1 active:translate-y-1 active:shadow-none'
            : 'bg-mono-200 border-mono-300 text-mono-400 cursor-not-allowed opacity-50 shadow-none'
        }`}
      >
        {isCorrect ? 'VERIFY_IDENTITY' : `BUFFERING [${Math.round(progress * 100)}%]`}
      </button>
    </motion.div>
  );
}
