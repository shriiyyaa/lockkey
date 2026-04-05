import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import CognitiveChallenge from '../components/CognitiveChallenge';
import CountdownTimer from '../components/CountdownTimer';
import GuiltTrip from '../components/GuiltTrip';

export default function UnlockFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States
  const [showChallenge, setShowChallenge] = useState(false);
  const [showGuilt, setShowGuilt] = useState(false);
  const [decryptedPassword, setDecryptedPassword] = useState('');

  useEffect(() => {
    fetchLock();
  }, [id]);

  const fetchLock = async () => {
    try {
      const res = await api.get(`/locks/${id}`);
      setLock(res.data);
    } catch (err) {
      setError('Could not load lock details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/request-unlock`, { delayMinutes: 15 });
      // Reload lock state
      await fetchLock();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request unlock');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/reveal`);
      setDecryptedPassword(res.data.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reveal password');
    } finally {
      setLoading(false);
    }
  };

  const handleFuckIt = () => {
    setShowGuilt(true);
  };

  const handleGuiltComplete = async () => {
    setShowGuilt(false);
    setLoading(true);
    setError('');
    try {
      await api.post(`/locks/${id}/fuck-it`);
      await fetchLock();
      handleRevealPassword();
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency bypass failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/locks/${id}`);
      navigate('/');
    } catch (err) {
      setError('Failed to delete lock');
    }
  };

  const isCompleted = lock?.status === 'completed';
  const isUnlocking = lock?.status === 'unlocking';
  const unlockAvailableAt = lock?.earlyUnlockRequestedAt 
    ? new Date(new Date(lock.earlyUnlockRequestedAt).getTime() + lock.earlyUnlockDelay * 60000)
    : null;
    
  useEffect(() => {
    if (isUnlocking && unlockAvailableAt && new Date() >= unlockAvailableAt && !lock?.challengeCompleted && !showChallenge) {
      setShowChallenge(true);
    }
  }, [isUnlocking, unlockAvailableAt, lock?.challengeCompleted, showChallenge]);

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

      <AnimatePresence mode="popLayout">
        {/* State 1: Password Revealed */}
        {decryptedPassword && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">
              DECRYPTION SUCCESSFUL
            </h2>
            <p className="text-[10px] font-black text-mono-400 mb-8 uppercase tracking-widest">
              TRANSFER KEY SECURELY
            </p>
            
            <div className="bg-mono-100 border-2 border-mono-950 p-6 mb-8 relative group">
              <code className="text-base sm:text-lg font-mono text-mono-950 font-black select-all break-all tracking-normal">
                {decryptedPassword}
              </code>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(decryptedPassword);
              }}
              className="btn-primary"
            >
              COPY TO CLIPBOARD
            </button>
          </motion.div>
        )}

        {/* State 2: Ready to Reveal */}
        {!decryptedPassword && isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">
              PROTOCOL EXPIRED
            </h2>
            <p className="text-[10px] font-bold text-mono-400 mb-8 uppercase tracking-widest">
              COMMITMENT DURATION COMPLETED.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleRevealPassword} className="btn-primary">
                REVEAL ACCESS KEY
              </button>
              <button onClick={handleDelete} className="btn-danger">
                PURGE LOCK
              </button>
            </div>
          </motion.div>
        )}

        {/* State 3: Challenge Time */}
        {!decryptedPassword && !isCompleted && showChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CognitiveChallenge 
              lockId={lock.id} 
              onComplete={async (challengeType, answer, extra) => {
                try {
                  setLoading(true);
                  const payload = { challengeType, answer };
                  if (challengeType === 'typing') payload.targetSentence = extra;
                  if (challengeType === 'math') payload.correctAnswer = extra;
                  
                  await api.post(`/locks/${lock.id}/complete-challenge`, payload);
                  setShowChallenge(false);
                  await fetchLock();
                  handleRevealPassword();
                } catch (err) {
                  setError(err.response?.data?.message || 'Challenge validation failed');
                } finally {
                  setLoading(false);
                }
              }}
            />
          </motion.div>
        )}

        {/* State 4: Unlocking (Delay) */}
        {!decryptedPassword && !isCompleted && isUnlocking && !showChallenge && unlockAvailableAt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="geometric-card p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-6 uppercase">
              FORCE UNLOCK SEQUENCE
            </h2>
            
            <div className="mb-10 p-6 bg-mono-100 border-2 border-mono-950 shadow-[4px_4px_0_0_#3f3f46]">
              <CountdownTimer 
                targetDate={unlockAvailableAt} 
                onComplete={() => setShowChallenge(true)}
              />
            </div>

            {lock.futureMessage && (
              <div className="bg-mono-50 p-6 border-2 border-mono-950 text-left mt-8">
                <span className="block text-[8px] font-black text-mono-400 uppercase tracking-widest mb-2 border-b-2 border-mono-100 pb-2">
                  ARCHIVED PROTOCOL NOTE:
                </span>
                <p className="text-mono-950 font-black italic">"{lock.futureMessage.toUpperCase()}"</p>
              </div>
            )}
            
            <p className="text-mono-400 font-bold mt-8 text-sm uppercase tracking-widest">
              Close this window, take a deep breath. A puzzle awaits at the end.
            </p>

            <div className="mt-12 pt-8 border-t border-ivory/5">
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
                  FUCK IT — I CAN'T WAIT
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* State 5: Active */}
        {!decryptedPassword && !isCompleted && !isUnlocking && (
          <motion.div
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

            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <h3 className="sub-heading text-mono-950 mb-4">
                ABORT SEQUENCE?
              </h3>
              <p className="text-[10px] font-bold text-mono-500 mb-6 max-w-xs mx-auto">
                EARLY TERMINATION REQUIRES COGNITIVE CHALLENGE AND 15M DELAY.
              </p>
              <button
                onClick={handleRequestUnlock}
                disabled={loading}
                className="btn-danger w-full sm:w-auto px-10 border"
                id="btn-request-unlock"
              >
                Trigger Early Unlock Sequence
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

      {showGuilt && (
        <GuiltTrip 
          lockId={lock.id}
          onComplete={handleGuiltComplete}
          onCancel={() => setShowGuilt(false)}
        />
      )}
    </div>
  );
}
