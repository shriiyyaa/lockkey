import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import api from '../utils/api';
import LockCard from '../components/LockCard';
import StatsPanel from '../components/StatsPanel';

// Skeleton card shown while data loads in the background
function SkeletonCard() {
  return (
    <div className="geometric-card animate-pulse">
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-mono-200 w-2/3 border border-mono-300" />
            <div className="h-3 bg-mono-100 w-1/4 border border-mono-200" />
          </div>
          <div className="h-3 bg-mono-100 w-12 border border-mono-200" />
        </div>
        <div className="pt-4 border-t-2 border-mono-100 space-y-2">
          <div className="flex justify-between">
            <div className="h-2 bg-mono-100 w-16" />
            <div className="h-2 bg-mono-100 w-12" />
          </div>
          <div className="h-4 bg-mono-100 border-2 border-mono-200" />
        </div>
      </div>
      <div className="p-4 bg-mono-100 border-t-2 border-mono-200">
        <div className="h-8 bg-mono-200 border border-mono-300" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // INSTANT: Initialize from cache — renders immediately, no waiting
  const [locks, setLocks] = useState(() => {
    try {
      const saved = localStorage.getItem('lockkey_dashboard_locks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('lockkey_dashboard_stats');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  // NEVER block the UI. Only show skeletons if we truly have zero cached data
  const hasCachedData = useRef(!!localStorage.getItem('lockkey_dashboard_locks'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [locksRes, statsRes] = await Promise.all([
        api.get('/locks'),
        api.get('/locks/stats')
      ]);
      setLocks(locksRes.data);
      setStats(statsRes.data);
      localStorage.setItem('lockkey_dashboard_locks', JSON.stringify(locksRes.data));
      localStorage.setItem('lockkey_dashboard_stats', JSON.stringify(statsRes.data));
      hasCachedData.current = true;
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLockDelete = (id) => {
    setLocks(prev => prev.filter(lock => lock.id !== id));
  };

  const filteredLocks = locks.filter(lock => {
    if (filter === 'active') return lock.status === 'active' || lock.status === 'unlocking';
    if (filter === 'completed') return lock.status === 'completed';
    return true;
  });

  const activeLockCount = locks.filter(l => l.status === 'active' || l.status === 'unlocking').length;
  const completedLockCount = locks.filter(l => l.status === 'completed').length;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="heading-primary mb-1">
            USER: {user?.name?.toUpperCase()}
          </h1>
          <p className="sub-heading text-mono-400">
            {activeLockCount > 0
              ? `STATUS: ${activeLockCount} ACTIVE LOCKS`
              : 'STATUS: NO ACTIVE LOCKS'
            }
            {/* Subtle sync indicator */}
            {isRefreshing && (
              <span className="ml-3 text-[8px] text-mono-600 tracking-[0.2em] animate-pulse">
                SYNCING...
              </span>
            )}
          </p>
        </div>
        <Link to="/create" id="btn-new-lock" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap shadow-[2px_2px_0_0_#000]">
          NEW LOCK
        </Link>
      </motion.div>

      {/* Stats */}
      <StatsPanel stats={stats} />

      {/* Locks Section */}
      <div className="pt-4">
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b-2 border-mono-900 pb-4">
          {[
            { key: 'all', label: 'ALL', count: locks.length },
            { key: 'active', label: 'ACTIVE', count: activeLockCount },
            { key: 'completed', label: 'CLEARED', count: completedLockCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              id={`filter-${tab.key}`}
              className={`px-4 py-2 rounded-none text-[10px] font-black tracking-widest transition-all duration-200 border-2 ${
                filter === tab.key
                  ? 'bg-ivory border-mono-950 text-mono-950 shadow-[2px_2px_0_0_#3f3f46] -translate-y-0.5'
                  : 'bg-transparent border-transparent text-mono-500 hover:text-ivory'
              }`}
            >
              {tab.label} <span className="opacity-50 ml-1">[{tab.count}]</span>
            </button>
          ))}
        </div>

        {/* Lock Cards — show skeletons only if zero cached data and still refreshing */}
        <AnimatePresence mode="popLayout">
          {!hasCachedData.current && isRefreshing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredLocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocks.map((lock, index) => (
                <LockCard 
                  key={lock.id} 
                  lock={lock} 
                  index={index} 
                  onDelete={handleLockDelete} 
                />
              ))}
            </div>
          ) : (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-mono-900/20 backdrop-blur-md border border-dashed border-ivory/10 rounded-2xl"
            >
              <div className="text-5xl mb-4 grayscale mix-blend-multiply">
                {/* Removed emoji placeholder */}
              </div>
              <h3 className="sub-heading text-ivory mb-2">
                {filter === 'completed' ? 'NO DATA FOUND' : 'VAULT EMPTY'}
              </h3>
              <p className="text-mono-500 font-bold mb-6">
                {filter === 'all' || filter === 'active'
                  ? "INITIATE FOCUS SEQUENCE TO BEGIN."
                  : 'COMPLETE A CHALLENGE TO ACCESS LOGS.'
                }
              </p>
              {(filter === 'all' || filter === 'active') && (
                <Link to="/create" className="btn-primary inline-flex items-center gap-2">
                  START YOUR FOCUS JOURNEY
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
