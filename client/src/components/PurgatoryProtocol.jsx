import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { TheVoid } from './purgatory/TheVoid';
import { MicroGauntlet } from './purgatory/MicroGauntlet';
import { TheMirror } from './purgatory/TheMirror';

// ─── Purgatory Protocol Orchestrator ────────────────────────────────────────
// Three sequential phases that replace the old 15-minute passive countdown.
// Phase 1: The Void (5 min hold) → Phase 2: The Gauntlet (20 challenges) → Phase 3: The Mirror (essay + reflection)
// At any point the user can retreat and the lock goes back to active.

const PHASES = [
  { id: 1, name: 'THE VOID', desc: '5 MIN ACTIVE HOLD' },
  { id: 2, name: 'THE GAUNTLET', desc: '20 CHALLENGES' },
  { id: 3, name: 'THE MIRROR', desc: 'REFLECTION' },
];

export default function PurgatoryProtocol({ lock, onProceed, onRetreat }) {
  const [phase, setPhase] = useState(1); // 1, 2, 3
  const [gauntletFails, setGauntletFails] = useState(0);

  // Phase transition screen shown between phases
  const [transitioning, setTransitioning] = useState(false);
  const [nextPhase, setNextPhase] = useState(null);

  const recordPhaseCompletion = async (completedPhase) => {
    try {
      await api.post(`/locks/${lock.id}/purgatory-phase`, { phase: completedPhase });
    } catch (err) {
      console.warn('Failed to record phase completion on server', err);
      // We still let them continue locally in case of network blips, 
      // but server might reject final bypass if they skipped.
    }
  };

  const advancePhase = async (to) => {
    setTransitioning(true);
    setNextPhase(to);
    
    // Record the phase that just completed (to - 1)
    await recordPhaseCompletion(to - 1);

    setTimeout(() => {
      setPhase(to);
      setTransitioning(false);
      setNextPhase(null);
    }, 1500);
  };

  const handleVoidComplete = () => advancePhase(2);
  const handleGauntletComplete = () => advancePhase(3);
  const handleGauntletFail = () => setGauntletFails(f => f + 1);

  const handleProceed = async () => {
    // Record phase 3 completion before proceeding
    await recordPhaseCompletion(3);
    onProceed();
  };

  if (transitioning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-mono-950 flex flex-col items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-ivory/30 text-[9px] font-black uppercase tracking-[0.5em] mb-4">PHASE CLEARED</div>
          <div className="text-ivory text-2xl font-black uppercase tracking-widest mb-2">
            PHASE {nextPhase} INITIALIZING
          </div>
          <div className="text-ivory/40 text-[10px] font-black uppercase tracking-widest">
            {PHASES.find(p => p.id === nextPhase)?.name}
          </div>
          <motion.div
            className="mt-8 h-0.5 bg-ivory/20 w-40 mx-auto"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 1 && (
        <TheVoid
          key="void"
          futureMessage={lock?.futureMessage}
          onComplete={handleVoidComplete}
        />
      )}
      {phase === 2 && (
        <MicroGauntlet
          key="gauntlet"
          onComplete={handleGauntletComplete}
          onFail={handleGauntletFail}
        />
      )}
      {phase === 3 && (
        <TheMirror
          key="mirror"
          futureMessage={lock?.futureMessage}
          onProceed={handleProceed}
          onRetreat={onRetreat}
        />
      )}
    </AnimatePresence>
  );
}
