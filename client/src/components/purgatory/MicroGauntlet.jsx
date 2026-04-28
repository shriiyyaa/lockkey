import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Challenge generators ────────────────────────────────────────────────────
function genReverseType() {
  const sentences = [
    'discipline beats motivation every single time',
    'you are stronger than this craving right now',
    'future you is watching what you do here',
    'every lock you break makes the next one weaker',
    'the discomfort you feel is the growth happening',
    'close the tab and go drink a glass of water',
    'your goals deserve more than five minutes of patience',
    'the algorithm wants your attention more than you know',
  ];
  const s = sentences[Math.floor(Math.random() * sentences.length)];
  return {
    type: 'reverse',
    prompt: s,
    target: s.split('').reverse().join(''),
    display: s.split('').reverse().join(''),
  };
}

function genMath() {
  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random() * 90 + 10); b = Math.floor(Math.random() * 90 + 10); answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 90 + 50); b = Math.floor(Math.random() * 50 + 10); answer = a - b; }
  else { a = Math.floor(Math.random() * 12 + 3); b = Math.floor(Math.random() * 12 + 3); answer = a * b; }
  return { type: 'math', prompt: `${a} ${op === '*' ? '×' : op} ${b} = ?`, answer: String(answer) };
}

function genStroop() {
  const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];
  const colorMap = { RED: '#ef4444', BLUE: '#3b82f6', GREEN: '#22c55e', YELLOW: '#eab308', PURPLE: '#a855f7', ORANGE: '#f97316' };
  const word = colors[Math.floor(Math.random() * colors.length)];
  let ink = colors[Math.floor(Math.random() * colors.length)];
  while (ink === word) ink = colors[Math.floor(Math.random() * colors.length)];
  return { type: 'stroop', word, ink, inkColor: colorMap[ink], answer: ink };
}

function genMemory() {
  const seq = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9) + 1);
  return { type: 'memory', sequence: seq, answer: seq.join('') };
}

function generateChallenge() {
  const gens = [genReverseType, genMath, genStroop, genMemory];
  return gens[Math.floor(Math.random() * gens.length)]();
}

// ── Memory Challenge sub-component ─────────────────────────────────────────
function MemoryChallenge({ challenge, onAnswer }) {
  const [phase, setPhase] = useState('show'); // show | input
  const [input, setInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setPhase('input'), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-4">
      {phase === 'show' ? (
        <div>
          <p className="text-[9px] text-mono-400 uppercase tracking-widest mb-3">MEMORIZE THIS SEQUENCE:</p>
          <div className="flex gap-3 justify-center">
            {challenge.sequence.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2 }}
                className="w-10 h-10 border-2 border-mono-950 bg-mono-100 flex items-center justify-center font-black text-lg text-mono-950"
              >
                {n}
              </motion.div>
            ))}
          </div>
          <p className="text-[8px] text-mono-400 uppercase tracking-widest mt-3 animate-pulse">DISAPPEARS IN 3 SECONDS...</p>
        </div>
      ) : (
        <div>
          <p className="text-[9px] text-mono-400 uppercase tracking-widest mb-3">TYPE THE SEQUENCE YOU SAW:</p>
          <input
            autoFocus
            type="text"
            maxLength={5}
            value={input}
            onChange={e => setInput(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && input.length === 5 && onAnswer(input)}
            className="input-field text-center text-2xl font-black tracking-[0.5em]"
            placeholder="_ _ _ _ _"
          />
          <button
            onClick={() => onAnswer(input)}
            disabled={input.length !== 5}
            className="btn-primary w-full mt-3 disabled:opacity-30"
          >SUBMIT</button>
        </div>
      )}
    </div>
  );
}

// ── Main MicroGauntlet ──────────────────────────────────────────────────────
const TOTAL_CHALLENGES = 20;

export function MicroGauntlet({ onComplete, onFail }) {
  const [challenges] = useState(() =>
    Array.from({ length: TOTAL_CHALLENGES }, generateChallenge)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [tabWarning, setTabWarning] = useState(false);
  const [restartCount, setRestartCount] = useState(0);
  const inputRef = useRef(null);

  const current = challenges[currentIdx];

  // Tab switch = restart
  useEffect(() => {
    const handle = () => {
      if (document.hidden) {
        setTabWarning(true);
        setTimeout(() => {
          setTabWarning(false);
          setCurrentIdx(0);
          setInput('');
          setFeedback(null);
          setRestartCount(c => c + 1);
        }, 2000);
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    setInput('');
  }, [currentIdx, restartCount]);

  const handleAnswer = useCallback((ans) => {
    const isCorrect = ans.trim().toLowerCase() === current.answer.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setTimeout(() => {
        setFeedback(null);
        if (currentIdx + 1 >= TOTAL_CHALLENGES) {
          onComplete();
        } else {
          setCurrentIdx(i => i + 1);
        }
      }, 500);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setCurrentIdx(0);
        setInput('');
        setRestartCount(c => c + 1);
        onFail();
      }, 1200);
    }
  }, [current, currentIdx, onComplete, onFail]);

  const progress = (currentIdx / TOTAL_CHALLENGES) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-mono-950 flex flex-col items-center justify-center p-6">
      <AnimatePresence>
        {tabWarning && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-900 border border-red-400 px-6 py-3 text-red-200 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            ⚠ TAB_SWITCH — RESTARTING FROM CHALLENGE 1
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-8 text-ivory/20 text-[9px] font-black uppercase tracking-[0.5em]">
        PHASE 2 / 3 — THE GAUNTLET
      </div>

      {restartCount > 0 && (
        <div className="absolute top-16 text-red-500/50 text-[8px] font-black uppercase tracking-widest">
          RESTART #{restartCount}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-ivory/30 text-[8px] font-black uppercase tracking-widest mb-2">
          <span>CHALLENGE {currentIdx + 1} / {TOTAL_CHALLENGES}</span>
          <span>{Math.round(progress)}% COMPLETE</span>
        </div>
        <div className="h-2 bg-ivory/5 w-full border border-ivory/10">
          <motion.div
            className="h-full bg-ivory/40"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Challenge card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIdx}-${restartCount}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className={`geometric-card w-full max-w-md p-8 transition-all duration-200 ${
            feedback === 'correct' ? 'border-green-500 shadow-[4px_4px_0_0_#16a34a]' :
            feedback === 'wrong' ? 'border-red-500 shadow-[4px_4px_0_0_#dc2626] animate-[shake_0.3s_ease]' : ''
          }`}
        >
          {/* Challenge type badge */}
          <div className="text-[8px] font-black text-mono-400 uppercase tracking-[0.3em] mb-4">
            {current.type === 'reverse' ? '⌨ REVERSE TYPE' :
             current.type === 'math' ? '🧮 MENTAL MATH' :
             current.type === 'stroop' ? '🎨 STROOP TEST' : '🧠 MEMORY'}
          </div>

          {/* Challenge content */}
          {current.type === 'reverse' && (
            <div className="space-y-4">
              <p className="text-[9px] text-mono-400 uppercase tracking-widest">TYPE THIS BACKWARDS:</p>
              <p className="font-black text-mono-950 text-sm break-all bg-mono-100 border-2 border-mono-950 px-3 py-2 leading-relaxed">
                {current.prompt}
              </p>
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && input.trim() && handleAnswer(input)}
                className="input-field font-mono tracking-widest"
                placeholder="type the reverse here..."
                disabled={!!feedback}
              />
              <button
                onClick={() => handleAnswer(input)}
                disabled={!input.trim() || !!feedback}
                className="btn-primary w-full disabled:opacity-30"
              >SUBMIT</button>
            </div>
          )}

          {current.type === 'math' && (
            <div className="space-y-4">
              <p className="text-[9px] text-mono-400 uppercase tracking-widest">SOLVE MENTALLY:</p>
              <p className="font-black text-mono-950 text-4xl text-center my-6">{current.prompt}</p>
              <input
                ref={inputRef}
                autoFocus
                type="number"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && input.trim() && handleAnswer(input)}
                className="input-field text-center text-xl font-black"
                placeholder="answer"
                disabled={!!feedback}
              />
              <button
                onClick={() => handleAnswer(input)}
                disabled={!input.trim() || !!feedback}
                className="btn-primary w-full disabled:opacity-30"
              >SUBMIT</button>
            </div>
          )}

          {current.type === 'stroop' && (
            <div className="space-y-4 text-center">
              <p className="text-[9px] text-mono-400 uppercase tracking-widest">CLICK THE COLOR OF THE INK (NOT THE WORD):</p>
              <p className="text-5xl font-black my-6" style={{ color: current.inkColor }}>{current.word}</p>
              <div className="grid grid-cols-3 gap-2">
                {['RED','BLUE','GREEN','YELLOW','PURPLE','ORANGE'].map(c => {
                  const cMap = { RED:'#ef4444',BLUE:'#3b82f6',GREEN:'#22c55e',YELLOW:'#eab308',PURPLE:'#a855f7',ORANGE:'#f97316' };
                  return (
                    <button
                      key={c}
                      onClick={() => handleAnswer(c)}
                      disabled={!!feedback}
                      className="py-2 border-2 border-mono-950 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50"
                      style={{ backgroundColor: cMap[c], color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >{c}</button>
                  );
                })}
              </div>
            </div>
          )}

          {current.type === 'memory' && (
            <MemoryChallenge
              key={`mem-${currentIdx}-${restartCount}`}
              challenge={current}
              onAnswer={handleAnswer}
            />
          )}

          {/* Feedback overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 flex items-center justify-center font-black text-2xl uppercase tracking-widest border-2 ${
                  feedback === 'correct'
                    ? 'bg-green-50/90 text-green-700 border-green-500'
                    : 'bg-red-50/90 text-red-700 border-red-500'
                }`}
              >
                {feedback === 'correct' ? '✓ CORRECT' : '✗ WRONG — RESTARTING'}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <p className="mt-6 text-ivory/15 text-[8px] font-black uppercase tracking-[0.3em] text-center">
        ONE WRONG ANSWER RESETS TO CHALLENGE 1. STAY FOCUSED.
      </p>
    </div>
  );
}
