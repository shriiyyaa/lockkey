import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import GuiltTrip from '../components/GuiltTrip';
import SecurePasswordDisplay from '../components/SecurePasswordDisplay';
import CountdownTimer from '../components/CountdownTimer';

export default function UnlockFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showGuilt, setShowGuilt] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');

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

  const isCompleted = lock?.status === 'completed';
  const isUnlocking = lock?.status === 'unlocking';

  useEffect(() => {
    fetchLock();
  }, [fetchLock]);

  // ── Password reveal ─────────────────────────────────────────────────────
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

  // ── Unlocking state actions ──────────────────────────────────────────────
  const handleCompleteWait = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/locks/${id}/bypass-success`);
      await handleRevealPassword();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete unlock. Try again.');
      setLoading(false);
    }
  };

  const handleCancelUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/cancel-unlock`);
      setLock(res.data.lock);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel unlock. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // ── Request early unlock ───────────────────────────────────────────────
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

  // ── Emergency Fuck-It bypass ────────────────────────────────────────────
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
      setDecryptedPassword('');
      await api.delete(`/locks/${id}`);
      navigate('/');
    } catch {
      setError('Failed to delete lock. Please try again.');
    }
  };

  // ─── Loading / Error gates ───────────────────────────────────────────────
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

  // ─── Passive fullscreen overlay (removed Purgatory) ──────────────────────

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary flex flex-wrap items-center gap-2">
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
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">DECRYPTION SUCCESSFUL</h2>
            <p className="text-[10px] font-black text-mono-400 mb-8 uppercase tracking-widest">
              TRANSFER KEY SECURELY. DO NOT SCREENSHOT.
            </p>
            <SecurePasswordDisplay password={decryptedPassword} />
            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <p className="text-[10px] font-black text-mono-500 mb-4 uppercase tracking-[0.2em]">
                DID YOU SUCCESSFULLY RETRIEVE THE KEY?
              </p>
              <div className="flex gap-4">
                <button onClick={handleDelete} className="btn-danger flex-1">YES, PURGE THIS LOCK</button>
                <button onClick={() => navigate('/')} className="btn-secondary flex-1 opacity-70">NOT YET, KEEP IT</button>
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
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">PROTOCOL EXPIRED</h2>
            <p className="text-[10px] font-bold text-mono-400 mb-8 uppercase tracking-widest">
              COMMITMENT DURATION COMPLETED. YOU EARNED THIS.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleRevealPassword} disabled={loading} className="btn-primary">
                {loading ? '[ DECRYPTING... ]' : 'REVEAL ACCESS KEY'}
              </button>
              <button onClick={handleDelete} disabled={loading} className="btn-danger">PURGE LOCK</button>
            </div>
          </motion.div>
        )}

        {/* STATE 3: Active — main encryption screen */}
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
              <h3 className="sub-heading text-mono-950 mb-2">ABORT SEQUENCE?</h3>

              {/* Early unlock warning callout */}
              <div className="bg-yellow-50 border-2 border-yellow-200 p-4 mb-6 text-left">
                <p className="text-[9px] font-black text-yellow-700 uppercase tracking-widest mb-1">⚠ EARLY UNLOCK PENALTY</p>
                <p className="text-[8px] font-bold text-yellow-600 uppercase tracking-widest">
                  INITIATING AN EARLY UNLOCK REQUIRES A MANDATORY 15-MINUTE PASSIVE WAIT.
                </p>
              </div>

              <button
                onClick={handleRequestUnlock}
                disabled={loading || lock.isBypassFailed}
                className={`btn-primary w-full sm:w-auto px-10 border ${
                  loading || lock.isBypassFailed ? 'cursor-not-allowed opacity-50' : ''
                }`}
                id="btn-request-unlock"
              >
                {loading ? '[ PROCESSING... ]' : lock.isBypassFailed ? 'EARLY UNLOCK DISABLED' : 'REQUEST EARLY UNLOCK'}
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
                    FUCK IT — EMERGENCY BYPASS (GAUNTLET)
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STATE 4: Passive Unlocking Wait */}
        {!decryptedPassword && isUnlocking && (
          <motion.div
            key="unlocking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-6 uppercase">
              EARLY UNLOCK INITIATED
            </h2>

            <div className="bg-mono-100 border-2 border-mono-950 p-8 shadow-[4px_4px_0_0_#3f3f46] mb-10 mx-auto max-w-xs">
              <span className="block text-mono-400 font-black uppercase tracking-[0.2em] text-[8px] mb-4">
                PASSIVE WAIT COUNTDOWN
              </span>
              <CountdownTimer
                targetDate={new Date(new Date(lock.earlyUnlockRequestedAt).getTime() + lock.earlyUnlockDelay * 60 * 1000)}
                onComplete={() => fetchLock()}
              />
            </div>
            
            <p className="text-[10px] font-bold text-mono-500 mb-8 uppercase tracking-widest">
              PLEASE WAIT UNTIL THE TIMER EXPIRES TO REVEAL YOUR PASSWORD.
            </p>

            <button 
              onClick={handleCompleteWait}
              disabled={loading || new Date() < new Date(new Date(lock.earlyUnlockRequestedAt).getTime() + lock.earlyUnlockDelay * 60 * 1000)}
              className="btn-primary w-full"
            >
              {loading ? '[ PROCESSING... ]' : 'COMPLETE UNLOCK'}
            </button>
            
            <div className="mt-4">
              <button 
                onClick={handleCancelUnlock}
                disabled={loading}
                className="text-[10px] font-black text-mono-400 hover:text-mono-950 uppercase tracking-[0.2em] transition-colors py-2"
              >
                CANCEL & RETURN TO ACTIVE LOCK
              </button>
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
            await fetchLock();
          }}
          isEmergency={true}
        />
      )}
    </div>
  );
}
