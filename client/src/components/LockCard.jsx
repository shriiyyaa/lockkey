import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LockCard({ lock, index }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  const isActive = lock.status === 'active' || lock.status === 'unlocking';

  useEffect(() => {
    if (!isActive) return;

    const calculateTime = () => {
      const start = new Date(lock.lockStart).getTime();
      const end = new Date(lock.lockEnd).getTime();
      const now = new Date().getTime();

      if (now >= end) {
        setTimeLeft('Expired');
        setProgress(100);
        return;
      }

      const total = end - start;
      const elapsed = now - start;
      setProgress(Math.min((elapsed / total) * 100, 100));

      const diff = end - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m left`);
      else setTimeLeft(`${mins}m left`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, [lock, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`geometric-card relative flex flex-col ${
        !isActive ? 'opacity-50 grayscale hover:grayscale-0' : ''
      }`}
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="sub-heading text-mono-950 mb-1">
              {lock.platform}
            </h3>
            <span className={`inline-block px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest border-2 ${
              lock.status === 'completed' ? 'bg-green-100 text-green-700 border-green-700/30' :
              lock.status === 'unlocking' ? 'bg-yellow-100 text-yellow-700 border-yellow-700/30' :
              'bg-mono-200 text-mono-600 border-mono-300'
            }`}>
              {lock.status}
            </span>
          </div>
          <div className="text-[10px] font-black text-mono-300 uppercase tracking-widest pt-1">
            {isActive ? 'LOCKED' : 'CLEARED'}
          </div>
        </div>

        {isActive ? (
          <div className="mt-8 pt-4 border-t-2 border-mono-100">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-mono-400 mb-2">
              <span>TIME LEFT</span>
              <span className="text-mono-800">{timeLeft}</span>
            </div>
            <div className="h-4 bg-mono-100 rounded-none border-2 border-mono-950 overflow-hidden">
              <motion.div 
                className="h-full bg-mono-900"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <p className="text-sm font-bold text-mono-500 italic">
              Completed on {new Date(lock.lockEnd).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-mono-100 border-t-2 border-mono-950 mt-auto">
        <Link 
          to={`/unlock/${lock.id}`}
          className={`block w-full text-center py-2 rounded-none text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-200 ${
            lock.status === 'completed' 
              ? 'bg-ivory text-mono-950 border-mono-950 shadow-[3px_3px_0_0_#3f3f46] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3f3f46]'
              : 'bg-mono-200 text-mono-500 border-mono-300 hover:border-mono-950 hover:text-mono-950'
          }`}
        >
          {lock.status === 'completed' ? 'DECIPHER PASSWORD' : 'MANAGE ENCRYPTION'}
        </Link>
      </div>
    </motion.div>
  );
}
