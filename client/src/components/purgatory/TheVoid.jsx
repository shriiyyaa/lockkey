import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Phase 1: THE VOID ──────────────────────────────────────────────────────
// User must hold a button for 5 minutes. Releasing or switching tabs resets.
export function TheVoid({ futureMessage, onComplete }) {
  const DURATION = 5 * 60; // 5 minutes in seconds
  const [secondsHeld, setSecondsHeld] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [tabWarning, setTabWarning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const intervalRef = useRef(null);
  const completedRef = useRef(false);

  // Breathing animation cycle
  useEffect(() => {
    const phases = ['inhale', 'hold', 'exhale', 'rest'];
    const durations = [4000, 2000, 4000, 2000];
    let idx = 0;
    const cycle = () => {
      setBreathPhase(phases[idx]);
      idx = (idx + 1) % phases.length;
    };
    cycle();
    let timeout;
    const run = (i) => {
      timeout = setTimeout(() => {
        i = (i + 1) % phases.length;
        setBreathPhase(phases[i]);
        run(i);
      }, durations[i]);
    };
    run(0);
    return () => clearTimeout(timeout);
  }, []);

  // Tab visibility — reset on leave
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setIsHolding(false);
        setSecondsHeld(0);
        setTabWarning(true);
        setTimeout(() => setTabWarning(false), 4000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Hold timer
  useEffect(() => {
    if (isHolding) {
      intervalRef.current = setInterval(() => {
        setSecondsHeld(prev => {
          const next = prev + 1;
          if (next >= DURATION && !completedRef.current) {
            completedRef.current = true;
            clearInterval(intervalRef.current);
            setTimeout(onComplete, 800);
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHolding, onComplete, DURATION]);

  const startHold = useCallback((e) => {
    e.preventDefault();
    setIsHolding(true);
  }, []);

  const stopHold = useCallback(() => {
    if (isHolding) {
      setIsHolding(false);
      setSecondsHeld(0);
    }
  }, [isHolding]);

  const progress = (secondsHeld / DURATION) * 100;
  const minsLeft = Math.floor((DURATION - secondsHeld) / 60);
  const secsLeft = (DURATION - secondsHeld) % 60;

  const breathLabels = {
    inhale: 'BREATHE IN...',
    hold: 'HOLD...',
    exhale: 'BREATHE OUT...',
    rest: 'REST...',
  };
  const breathScales = { inhale: 1.4, hold: 1.4, exhale: 0.8, rest: 0.8 };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Ambient particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/10"
          style={{ left: `${8 + i * 8}%`, top: `${10 + (i % 4) * 20}%` }}
          animate={{ y: [-10, 10, -10], opacity: [0.05, 0.2, 0.05] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Tab-switch warning */}
      <AnimatePresence>
        {tabWarning && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-900/80 border border-red-500 px-6 py-3 text-red-300 text-[10px] font-black uppercase tracking-[0.3em] z-10"
          >
            ⚠ TAB_SWITCH DETECTED — TIMER RESET
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase label */}
      <div className="absolute top-8 text-white/20 text-[9px] font-black uppercase tracking-[0.5em]">
        PHASE 1 / 3 — THE VOID
      </div>

      {/* Breathing circle */}
      <motion.div
        className="relative flex items-center justify-center mb-10"
        animate={{ scale: breathScales[breathPhase] }}
        transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'exhale' ? 4 : 2, ease: 'easeInOut' }}
      >
        <div className="w-40 h-40 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/30" />
          </div>
        </div>
        <div className="absolute text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
          {breathLabels[breathPhase]}
        </div>
      </motion.div>

      {/* Future message */}
      {futureMessage && (
        <motion.p
          className="text-white/15 text-xs font-black italic text-center max-w-sm mb-10 px-6 leading-relaxed"
          animate={{ opacity: [0.08, 0.2, 0.08] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          "{futureMessage}"
        </motion.p>
      )}

      {/* Progress */}
      <div className="w-72 mb-6">
        <div className="flex justify-between text-white/20 text-[8px] font-black uppercase tracking-widest mb-2">
          <span>HOLDING</span>
          <span>{minsLeft}:{secsLeft.toString().padStart(2, '0')} REMAINING</span>
        </div>
        <div className="h-1 bg-white/5 w-full">
          <motion.div
            className="h-full bg-white/30"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Hold button */}
      <motion.button
        id="void-hold-btn"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={e => e.preventDefault()}
        className={`relative w-40 h-40 rounded-full border-2 flex items-center justify-center cursor-pointer touch-none transition-all duration-300 ${
          isHolding
            ? 'border-white/60 bg-white/10 shadow-[0_0_60px_rgba(255,255,255,0.15)]'
            : 'border-white/20 bg-transparent'
        }`}
        whileActive={{ scale: 0.95 }}
      >
        <div className="text-center pointer-events-none">
          <div className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isHolding ? 'text-white/80' : 'text-white/30'}`}>
            {isHolding ? 'HOLDING' : 'HOLD'}
          </div>
          <div className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-colors ${isHolding ? 'text-white/50' : 'text-white/15'}`}>
            {isHolding ? 'DO NOT RELEASE' : 'PRESS & HOLD'}
          </div>
        </div>
        {isHolding && (
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {!isHolding && secondsHeld === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 text-white/20 text-[9px] font-black uppercase tracking-[0.3em] text-center px-8"
        >
          HOLD THE BUTTON. DON'T THINK. JUST BREATHE. LEAVE AND IT RESETS.
        </motion.p>
      )}
    </div>
  );
}
