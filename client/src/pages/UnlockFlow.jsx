import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import SecurePasswordDisplay from '../components/SecurePasswordDisplay';
import CountdownTimer from '../components/CountdownTimer';

export default function UnlockFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lock, setLock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decryptedPassword, setDecryptedPassword] = useState('');

  const fetchLock = useCallback(async () => {
    try {
      const res = await api.get(`/locks/${id}`);
      setLock(res.data);
    } catch {
      setError('Could not load lock details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const isCompleted = lock?.status === 'completed';
  const isUnlocking = lock?.status === 'unlocking';

  useEffect(() => { fetchLock(); }, [fetchLock]);

  const handleRevealPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/reveal`);
      setDecryptedPassword(res.data.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reveal password.');
    } finally {
      setLoading(false);
    }
  };

  const handleCountdownComplete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/locks/${id}/bypass-success`);
      await handleRevealPassword();
    } catch (err) {
      setError(err.response?.data?.message || 'Unlock failed.');
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
      setError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUnlock = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/locks/${id}/request-unlock`, { delayMinutes: 1 });
      setLock(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request unlock');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDecryptedPassword('');
      await api.delete(`/locks/${id}`);
      navigate('/');
    } catch {
      setError('Failed to delete lock.');
    }
  };

  if (loading && !lock) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-ivory font-black text-sm tracking-[0.2em] uppercase animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  if (error && !lock) {
    return (
      <div className="text-center py-20">
        <h2 className="heading-primary text-red-600 mb-4 uppercase">ERROR</h2>
        <p className="text-mono-500 font-bold mb-8 uppercase tracking-widest">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary">BACK</button>
      </div>
    );
  }

  const unlockTargetDate = isUnlocking && lock.earlyUnlockRequestedAt && lock.earlyUnlockDelay
    ? new Date(new Date(lock.earlyUnlockRequestedAt).getTime() + lock.earlyUnlockDelay * 60 * 1000)
    : null;

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
        {/* Password Revealed */}
        {decryptedPassword && (
          <motion.div key="revealed" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="geometric-card p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">DECRYPTION SUCCESSFUL</h2>
            <p className="text-[10px] font-black text-mono-400 mb-8 uppercase tracking-widest">TRANSFER KEY SECURELY.</p>
            <SecurePasswordDisplay password={decryptedPassword} />
            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <p className="text-[10px] font-black text-mono-500 mb-4 uppercase tracking-[0.2em]">DONE?</p>
              <div className="flex gap-4">
                <button onClick={handleDelete} className="btn-danger flex-1">YES, PURGE LOCK</button>
                <button onClick={() => navigate('/')} className="btn-secondary flex-1 opacity-70">KEEP IT</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Completed — reveal available */}
        {!decryptedPassword && isCompleted && (
          <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="geometric-card p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-1">LOCK EXPIRED</h2>
            <p className="text-[10px] font-bold text-mono-400 mb-8 uppercase tracking-widest">YOU EARNED THIS.</p>
            <div className="flex justify-center gap-4">
              <button onClick={handleRevealPassword} disabled={loading} className="btn-primary">
                {loading ? '[ DECRYPTING... ]' : 'REVEAL PASSWORD'}
              </button>
              <button onClick={handleDelete} disabled={loading} className="btn-danger">DELETE</button>
            </div>
          </motion.div>
        )}

        {/* Unlocking — 1 min countdown */}
        {!decryptedPassword && isUnlocking && unlockTargetDate && (
          <motion.div key="unlocking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="geometric-card p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-2 uppercase">COOLDOWN</h2>
            <p className="text-[10px] font-bold text-mono-400 mb-8 uppercase tracking-widest">WAIT FOR IT...</p>
            <div className="bg-mono-100 border-2 border-mono-950 p-8 shadow-[4px_4px_0_0_#3f3f46] mb-10 mx-auto max-w-xs">
              <CountdownTimer targetDate={unlockTargetDate} onComplete={handleCountdownComplete} />
            </div>
            <button onClick={handleCancelUnlock} disabled={loading} className="btn-secondary text-[10px]">
              {loading ? '[ ... ]' : 'CANCEL'}
            </button>
          </motion.div>
        )}

        {/* Active — show timer + early unlock CTA */}
        {!decryptedPassword && !isCompleted && !isUnlocking && (
          <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="geometric-card p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-mono-950 mb-6 uppercase">LOCKED</h2>

            <div className="bg-mono-100 border-2 border-mono-950 p-8 shadow-[4px_4px_0_0_#3f3f46] mb-10 mx-auto max-w-xs">
              <span className="block text-mono-400 font-black uppercase tracking-[0.2em] text-[8px] mb-4">EXPIRES IN</span>
              <CountdownTimer targetDate={new Date(lock.lockEnd)} onComplete={() => fetchLock()} />
            </div>

            {lock.futureMessage && (
              <div className="bg-mono-50 p-6 border-2 border-mono-950 text-left mb-8">
                <span className="block text-[8px] font-black text-mono-400 uppercase tracking-widest mb-2 border-b-2 border-mono-100 pb-2">YOUR NOTE:</span>
                <p className="text-mono-950 font-black italic">"{lock.futureMessage}"</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t-2 border-dashed border-mono-200">
              <button
                onClick={handleRequestUnlock}
                disabled={loading}
                className={`btn-danger w-full sm:w-auto px-10 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                id="btn-request-unlock"
              >
                {loading ? '[ PROCESSING... ]' : 'UNLOCK EARLY (1 MIN WAIT)'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
