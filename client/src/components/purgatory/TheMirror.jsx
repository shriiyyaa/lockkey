import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Phase 3: THE MIRROR ─────────────────────────────────────────────────────
// Write a 500-char essay. Then confirm each sentence. Then a final 60-sec cooldown.

export function TheMirror({ futureMessage, onProceed, onRetreat }) {
  const [phase, setPhase] = useState('write'); // write | confirm | cooldown | choice
  const [essay, setEssay] = useState('');
  const [sentences, setSentences] = useState([]);
  const [confirmIdx, setConfirmIdx] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  const MIN_CHARS = 500;
  const MIN_UNIQUE_WORDS = 25;

  const isEssayValid = useMemo(() => {
    const words = essay.trim().split(/\s+/).filter(w => w.length > 2);
    const unique = new Set(words);
    const noJunk = !/(.)\\1{4,}/.test(essay);
    return essay.length >= MIN_CHARS && unique.size >= MIN_UNIQUE_WORDS && noJunk;
  }, [essay]);

  const handleSubmitEssay = () => {
    // Split into sentences
    const rawSentences = essay
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
    setSentences(rawSentences.length > 0 ? rawSentences : [essay]);
    setPhase('confirm');
  };

  const handleConfirm = (isTrue) => {
    if (!isTrue) {
      // User admitted a sentence was false — retreat
      onRetreat();
      return;
    }
    if (confirmIdx + 1 >= sentences.length) {
      // All confirmed — start cooldown
      setPhase('cooldown');
      let secs = 60;
      const t = setInterval(() => {
        secs--;
        setCooldownSeconds(secs);
        if (secs <= 0) {
          clearInterval(t);
          setPhase('choice');
        }
      }, 1000);
    } else {
      setConfirmIdx(i => i + 1);
    }
  };

  const charsLeft = Math.max(0, MIN_CHARS - essay.length);

  return (
    <div className="fixed inset-0 z-50 bg-mono-100 flex flex-col items-center justify-center p-6 overflow-y-auto">
      <div className="absolute top-8 text-mono-400 text-[9px] font-black uppercase tracking-[0.5em]">
        PHASE 3 / 3 — THE MIRROR
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* ── WRITE PHASE ── */}
          {phase === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="geometric-card p-8"
            >
              <h2 className="sub-heading text-mono-950 mb-2">THE MIRROR</h2>
              <p className="text-[9px] font-black text-mono-500 uppercase tracking-widest mb-6">
                WHY DO YOU NEED ACCESS RIGHT NOW? BE COMPLETELY HONEST. MINIMUM {MIN_CHARS} CHARACTERS.
              </p>

              {futureMessage && (
                <div className="bg-mono-950 p-4 mb-6 border-l-4 border-mono-700">
                  <p className="text-ivory text-xs font-black italic">"{futureMessage}"</p>
                  <p className="text-mono-400 text-[8px] uppercase tracking-widest mt-1">— YOU WROTE THIS TO YOURSELF</p>
                </div>
              )}

              <textarea
                value={essay}
                onChange={e => setEssay(e.target.value)}
                className="input-field min-h-[200px] resize-none mb-4"
                placeholder="Be brutally honest. Why this moment? Why can't it wait? What will happen if you don't get access right now? Write like your future self is reading this..."
                autoFocus
              />

              <div className="flex justify-between items-center mb-4">
                <div className="text-[8px] font-black uppercase tracking-widest text-mono-400">
                  {essay.length} / {MIN_CHARS} chars
                </div>
                {charsLeft > 0 && (
                  <div className="text-[8px] font-black text-red-500 uppercase tracking-widest">
                    {charsLeft} MORE CHARACTERS NEEDED
                  </div>
                )}
              </div>

              {/* Char progress */}
              <div className="h-1 bg-mono-200 mb-6 border border-mono-300">
                <motion.div
                  className={`h-full transition-colors ${isEssayValid ? 'bg-green-600' : 'bg-mono-950'}`}
                  animate={{ width: `${Math.min((essay.length / MIN_CHARS) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <button
                onClick={handleSubmitEssay}
                disabled={!isEssayValid}
                className="btn-primary w-full disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isEssayValid ? 'FACE THE MIRROR →' : `KEEP WRITING (${charsLeft} chars left)`}
              </button>
            </motion.div>
          )}

          {/* ── CONFIRM PHASE ── */}
          {phase === 'confirm' && (
            <motion.div
              key={`confirm-${confirmIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="geometric-card p-8 text-center"
            >
              <div className="text-[8px] font-black text-mono-400 uppercase tracking-widest mb-2">
                SENTENCE {confirmIdx + 1} / {sentences.length}
              </div>
              <div className="h-1 bg-mono-200 mb-6 border border-mono-300">
                <div
                  className="h-full bg-mono-950"
                  style={{ width: `${((confirmIdx) / sentences.length) * 100}%` }}
                />
              </div>

              <p className="text-[9px] font-black text-mono-400 uppercase tracking-widest mb-4">
                YOU WROTE:
              </p>
              <blockquote className="text-mono-950 font-black text-sm italic leading-relaxed bg-mono-50 border-l-4 border-mono-950 px-4 py-3 text-left mb-8">
                "{sentences[confirmIdx]}"
              </blockquote>

              <p className="text-[10px] font-black text-mono-950 uppercase tracking-widest mb-6">
                IS THIS COMPLETELY AND HONESTLY TRUE?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleConfirm(true)}
                  className="btn-primary flex-1 py-4"
                >
                  YES, THIS IS TRUE
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  className="flex-1 py-4 border-2 border-mono-950 font-black text-[10px] uppercase tracking-widest bg-ivory text-red-600 hover:bg-red-50 transition-colors"
                >
                  NO, I WAS LYING
                </button>
              </div>
              <p className="text-[8px] text-mono-400 uppercase tracking-widest mt-4">
                LYING ENDS THE PROCESS AND LOCKS YOU OUT.
              </p>
            </motion.div>
          )}

          {/* ── COOLDOWN PHASE ── */}
          {phase === 'cooldown' && (
            <motion.div
              key="cooldown"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="geometric-card p-8 text-center"
            >
              <div className="text-[8px] font-black text-mono-400 uppercase tracking-widest mb-6">
                FINAL 60 SECONDS
              </div>

              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e4e4e7" strokeWidth="8" />
                  <motion.circle
                    cx="60" cy="60" r="50"
                    fill="none" stroke="#0a0a0a" strokeWidth="8"
                    strokeLinecap="square"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    animate={{ strokeDashoffset: (2 * Math.PI * 50) * (1 - (60 - cooldownSeconds) / 60) }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-black text-3xl text-mono-950">{cooldownSeconds}</span>
                </div>
              </div>

              {futureMessage && (
                <div className="bg-mono-950 p-4 mb-6 text-left">
                  <p className="text-[8px] text-mono-400 uppercase tracking-widest mb-2">YOUR MESSAGE TO YOURSELF:</p>
                  <p className="text-ivory font-black italic text-xs leading-relaxed">"{futureMessage}"</p>
                </div>
              )}

              <p className="text-[10px] font-black text-mono-500 uppercase tracking-widest">
                SIT WITH THIS. DO YOU STILL NEED IT?
              </p>
            </motion.div>
          )}

          {/* ── FINAL CHOICE PHASE ── */}
          {phase === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="geometric-card p-8 text-center"
            >
              <div className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em] mb-4 border border-red-300 bg-red-50 inline-block px-3 py-1">
                ⚠ PURGATORY COMPLETE
              </div>
              <h2 className="text-xl font-black text-mono-950 uppercase mb-3">YOU MADE IT THROUGH</h2>
              <p className="text-[10px] font-black text-mono-500 uppercase tracking-widest mb-8">
                15 MINUTES. THE QUESTION REMAINS: WHO ARE YOU GOING TO BE?
              </p>

              {futureMessage && (
                <div className="bg-mono-950 p-4 mb-8 text-left">
                  <p className="text-[8px] text-mono-400 uppercase tracking-widest mb-2">✉ YOU WROTE THIS:</p>
                  <p className="text-ivory font-black italic text-sm">"{futureMessage}"</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={onRetreat}
                  className="btn-primary w-full py-4"
                >
                  I AM STRONGER — LOCK IT BACK
                </button>
                <button
                  onClick={onProceed}
                  className="w-full py-3 text-[10px] font-black text-red-500/50 hover:text-red-600 uppercase tracking-[0.3em] transition-colors"
                >
                  I still need it — Proceed anyway
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
