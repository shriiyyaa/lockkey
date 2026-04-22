import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import CountdownTimer from '../components/CountdownTimer';
import GuiltTrip from '../components/GuiltTrip';
import SecurePasswordDisplay from '../components/SecurePasswordDisplay';

// --- Final Resistance Protocol ---
// Shown after the 15-minute early unlock timer expires.
// Forces a 60-second reflection period before the user can proceed.
function FinalResistanceProtocol({ lock, onProceed, onRetreat, isLoading }) {
  // Store the target once — prevents re-render from resetting the timer
  const [reflectionTarget] = useState(() => new Date(Date.now() + 60000));
  const [reflectionDone, setReflectionDone] = useState(false);

  return (
    <motion.div
      key="final-resistance"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="geometric-card p-6 sm:p-10 text-center"
    >
      <div className="mb-6">
        <span className="inline-block text-[9px] font-black text-red-500 uppercase tracking-[0.4em] border border-red-300 bg-red-50 px-3 py-1">
          ⚠ FINAL_RESISTANCE_PROTOCOL INITIATED
        </span>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-3 uppercase">
        WAIT PERIOD ENDED
      </h2>
      <p className="text-[10px] font-bold text-mono-500 mb-8 uppercase tracking-widest max-w-sm mx-auto">
        YOU WAITED 15 MINUTES. BUT THE QUESTION REMAINS: DO YOU ACTUALLY NEED THIS?
      </p>

      {/* Future message — the anchor */}
      {lock?.futureMessage && (
        <div className="bg-mono-950 p-6 border-2 border-mono-950 text-left mb-8 shadow-[6px_6px_0_0_#3f3f46]">
          <span className="block text-[8px] font-black text-mono-400 uppercase tracking-[0.3em] mb-3">
            ✉ YOU WROTE THIS TO YOURSELF:
          </span>
          <p className="text-ivory font-black italic text-sm leading-relaxed">
            "{lock.futureMessage}"
          </p>
        </div>
      )}

      {/* 60-second reflection countdown */}
      {!reflectionDone ? (
        <div className="mb-8">
          <p className="text-[10px] font-black text-mono-400 uppercase tracking-widest mb-4">
            REFLECT FOR 60 SECONDS. YOUR CHOICE REVEALS WHO YOU ARE.
          </p>
          <div className="max-w-[200px] mx-auto">
          <CountdownTimer
              targetDate={reflectionTarget}
              onComplete={() => setReflectionDone(true)}
            />
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[10px] font-black text-mono-950 uppercase tracking-widest mb-6">
              60 SECONDS OF REFLECTION COMPLETE. YOUR CALL.
            </p>
            <button
              onClick={onRetreat}
              disabled={isLoading}
              className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.2em]"
            >
              I'M STRONGER — LOCK IT BACK UP
            </button>
            <button
              onClick={onProceed}
              disabled={isLoading}
              className="w-full py-3 text-[10px] font-black text-red-500/50 hover:text-red-600 uppercase tracking-[0.3em] transition-colors"
            >
              {isLoading ? '[ DECRYPTING... ]' : 'I still need it — Proceed anyway'}
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

export default function UnlockFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showGuilt, setShowGuilt] = useState(false);
  const [showFinalResistance, setShowFinalResistance] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');
  const [waitExpired, setWaitExpired] = useState(false);

  const fetchLock = useCallback(async () => {
    try {
      const res = await api.get(`/locks/${id}`);
      setLock(res.data);
      return res.data;
    } catch {
      setError('Could not load lock details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Derived lock state — declared before useEffects that depend on them
  const isCompleted = lock?.status === 'completed';
  const isUnlocking = lock?.status === 'unlocking';
  const unlockAvailableAt = React.useMemo(() => {
    return lock?.earlyUnlockRequestedAt
      ? new Date(new Date(lock.earlyUnlockRequestedAt).getTime() + lock.earlyUnlockDelay * 60000)
      : null;
  }, [lock?.earlyUnlockRequestedAt, lock?.earlyUnlockDelay]);

  useEffect(() => {
    fetchLock();
  }, [fetchLock]);

  // Reactively track when the 15-min wait expires (fixes stale waitExpired variable)
  useEffect(() => {
    if (!isUnlocking || !unlockAvailableAt) {
      setWaitExpired(false);
      return;
    }
    const now = new Date();
    if (now >= unlockAvailableAt) {
      setWaitExpired(true);
      return;
    }
    const diff = unlockAvailableAt - now;
    const timer = setTimeout(() => setWaitExpired(true), diff);
    return () => clearTimeout(timer);
  }, [isUnlocking, unlockAvailableAt]);

  // Reveal password — fully sequential, properly awaited
  const handleRevealPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/reveal`);
      setDecryptedPassword(res.data.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reveal password. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  // User confirms they still want the password after Final Resistance
  const handleProceedAfterResistance = async () => {
    setShowFinalResistance(false);
    setLoading(true);
    setError('');
    try {
      await api.post(`/locks/${id}/bypass-success`);
      await handleRevealPassword();
    } catch (err) {
      setError(err.response?.data?.message || 'Bypass validation failed.');
      setLoading(false);
    }
  };

  // User retreats — lock is restored to active
  const handleRetreat = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/cancel-unlock`);
      setShowFinalResistance(false);
      setLock(res.data.lock);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel unlock. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/request-unlock`, { delayMinutes: 15 });
      setLock(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request unlock');
    } finally {
      setLoading(false);
    }
  };

  // Emergency Fuck-It bypass — still requires full GuiltTrip gauntlet
  const handleFuckIt = () => setShowGuilt(true);

  const handleGuiltComplete = async () => {
    setShowGuilt(false);
    setLoading(true);
    setError('');
    try {
      await api.post(`/locks/${id}/fuck-it`);
      await handleRevealPassword();
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency bypass failed');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDecryptedPassword(''); // Clear from memory before navigating
      await api.delete(`/locks/${id}`);
      navigate('/');
    } catch {
      setError('Failed to delete lock. Please try again.');
    }
  };


  if (loading && !lock) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-ivory font-black text-sm tracking-[0.2em] uppercase animate-pulse">
          INITIALIZING DECRYPTION...
        </div>
      </div>
    );
  }

  if (error && !lock) {
    return (
      <div className="text-center py-20">
        <h2 className="heading-primary text-red-600 mb-4 uppercase">ACCESS DENIED</h2>
        <p className="text-mono-500 font-bold mb-8 uppercase tracking-widest">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">
          RETURN TO MAIN TERMINAL
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary flex items-center gap-2">
          {lock.platform.toUpperCase()}
          <span className={`px-2 py-0.5 rounded-none text-[8px] border-2 font-black tracking-[0.2em] uppercase ${
            isCompleted ? 'bg-ivory text-mono-950 border-mono-950' : 'bg-transparent border-mono-700 text-mono-500'
          }`}>
            {lock.status}
          </span>
        </h1>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-2 border-red-500 text-red-600 text-[10px] font-black px-4 py-3 shadow-[3px_3px_0_0_#ef4444] tracking-[0.1em]"
        >
          [!] {error.toUpperCase()}
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {/* STATE 1: Password Revealed */}
        {decryptedPassword && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">
              DECRYPTION SUCCESSFUL
            </h2>
            <p className="text-[10px] font-black text-mono-400 mb-8 uppercase tracking-widest">
              TRANSFER KEY SECURELY. DO NOT SCREENSHOT.
            </p>

            <SecurePasswordDisplay password={decryptedPassword} />

            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <p className="text-[10px] font-black text-mono-500 mb-4 uppercase tracking-[0.2em]">
                DID YOU SUCCESSFULLY RETRIEVE THE KEY?
              </p>
              <div className="flex gap-4">
                <button onClick={handleDelete} className="btn-danger flex-1">
                  YES, PURGE THIS LOCK
                </button>
                <button onClick={() => navigate('/')} className="btn-secondary flex-1 opacity-70">
                  NOT YET, KEEP IT
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 2: Natural completion — Ready to Reveal */}
        {!decryptedPassword && isCompleted && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">
              PROTOCOL EXPIRED
            </h2>
            <p className="text-[10px] font-bold text-mono-400 mb-8 uppercase tracking-widest">
              COMMITMENT DURATION COMPLETED. YOU EARNED THIS.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleRevealPassword} disabled={loading} className="btn-primary">
                {loading ? '[ DECRYPTING... ]' : 'REVEAL ACCESS KEY'}
              </button>
              <button onClick={handleDelete} disabled={loading} className="btn-danger">
                PURGE LOCK
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE 3: Final Resistance Protocol — after 15-min wait */}
        {!decryptedPassword && !isCompleted && showFinalResistance && (
          <FinalResistanceProtocol
            key="resistance"
            lock={lock}
            onProceed={handleProceedAfterResistance}
            onRetreat={handleRetreat}
            isLoading={loading}
          />
        )}

        {/* STATE 4: Unlocking — 15-minute countdown in progress */}
        {!decryptedPassword && !isCompleted && isUnlocking && !showFinalResistance && unlockAvailableAt && (
          <motion.div
            key="unlocking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-6 uppercase">
              FORCE UNLOCK SEQUENCE
            </h2>

            <div className="mb-10 p-6 bg-mono-100 border-2 border-mono-950 shadow-[4px_4px_0_0_#3f3f46]">
              {waitExpired ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowFinalResistance(true)}
                  className="btn-danger w-full py-4 font-black uppercase tracking-[0.2em]"
                >
                  PROCEED TO FINAL RESISTANCE
                </motion.button>
              ) : (
                <CountdownTimer
                  targetDate={unlockAvailableAt}
                  onComplete={() => setShowFinalResistance(true)}
                />
              )}
            </div>

            {lock.futureMessage && (
              <div className="bg-mono-50 p-6 border-2 border-mono-950 text-left mt-8">
                <span className="block text-[8px] font-black text-mono-400 uppercase tracking-widest mb-2 border-b-2 border-mono-100 pb-2">
                  ARCHIVED PROTOCOL NOTE:
                </span>
                <p className="text-mono-950 font-black italic">"{lock.futureMessage}"</p>
              </div>
            )}

            <p className="text-mono-400 font-bold mt-8 text-sm uppercase tracking-widest">
              Close this. Take a walk. Ask yourself if you really need this.
            </p>

            <div className="mt-12 pt-8 border-t border-mono-200">
              {lock.isBypassFailed ? (
                <p className="text-[10px] font-black text-red-600/40 uppercase tracking-[0.2em] italic">
                  BYPASS_PROTOCOL: PERMANENT_LOCKOUT_ACTIVE. NO SHORTCUTS REMAIN.
                </p>
              ) : (
                <button
                  onClick={handleFuckIt}
                  disabled={loading}
                  className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.3em] transition-colors"
                  id="btn-fuck-it-unlocking"
                >
                  FUCK IT — I CAN'T WAIT EVEN 15 MINUTES
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* STATE 5: Active — main encryption screen */}
        {!decryptedPassword && !isCompleted && !isUnlocking && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-6 uppercase">
              SYSTEM ENCRYPTION: ACTIVE
            </h2>

            <div className="bg-mono-100 border-2 border-mono-950 p-8 shadow-[4px_4px_0_0_#3f3f46] mb-10 mx-auto max-w-xs">
              <span className="block text-mono-400 font-black uppercase tracking-[0.2em] text-[8px] mb-4">
                PROTOCOL EXPIRY COUNTDOWN
              </span>
              <CountdownTimer
                targetDate={new Date(lock.lockEnd)}
                onComplete={() => fetchLock()}
              />
            </div>

            {lock.futureMessage && (
              <div className="bg-mono-50 p-6 border-2 border-mono-950 text-left mb-8">
                <span className="block text-[8px] font-black text-mono-400 uppercase tracking-widest mb-2 border-b-2 border-mono-100 pb-2">
                  YOUR NOTE TO YOURSELF:
                </span>
                <p className="text-mono-950 font-black italic">"{lock.futureMessage}"</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <h3 className="sub-heading text-mono-950 mb-4">ABORT SEQUENCE?</h3>
              <p className="text-[10px] font-bold text-mono-500 mb-6 max-w-xs mx-auto">
                EARLY TERMINATION REQUIRES 15-MINUTE WAIT + FINAL REFLECTION.
              </p>
              <button
                onClick={handleRequestUnlock}
                disabled={loading}
                className={`btn-danger w-full sm:w-auto px-10 border ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                id="btn-request-unlock"
              >
                {loading ? '[ PROCESSING_SEQUENCE... ]' : 'Trigger Early Unlock Sequence'}
              </button>

              <div className="mt-8">
                {lock.isBypassFailed ? (
                  <p className="text-[10px] font-black text-red-600/40 uppercase tracking-[0.2em] italic">
                    BYPASS_PROTOCOL: PERMANENT_LOCKOUT_ACTIVE. NO SHORTCUTS REMAIN.
                  </p>
                ) : (
                  <button
                    onClick={handleFuckIt}
                    disabled={loading}
                    className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.3em] transition-colors"
                    id="btn-fuck-it-active"
                  >
                    FUCK IT — EMERGENCY BYPASS
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Bypass Gauntlet overlay */}
      {showGuilt && (
        <GuiltTrip
          lockId={lock.id}
          onComplete={handleGuiltComplete}
          onCancel={async () => {
            setShowGuilt(false);
            await fetchLock(); // Re-sync isBypassFailed from DB immediately
          }}
          isEmergency={true}
        />
      )}
    </div>
  );
}
