import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer({ targetDate, onComplete, size = 'md' }) {
  const hasFired = useRef(false);

  function calculateTimeLeft() {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      total: diff
    };
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    hasFired.current = false;
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.total <= 0 && !hasFired.current) {
        hasFired.current = true;
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const totalDuration = new Date(targetDate) - Date.now();
  const progress = totalDuration > 0 ? Math.max(0, 1 - (timeLeft.total / Math.max(totalDuration, 1))) : 1;

  const isSmall = size === 'sm';
  const circleSize = isSmall ? 80 : 140;
  const strokeWidth = isSmall ? 4 : 6;
  const radius = (circleSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  if (timeLeft.total <= 0) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <span className={`text-green-400 font-black uppercase tracking-widest ${isSmall ? 'text-[10px]' : 'text-xs'}`}>
          Complete
        </span>
      </motion.div>
    );
  }

  const formatTime = () => {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0 || timeLeft.days > 0) parts.push(`${timeLeft.hours}h`);
    parts.push(`${timeLeft.minutes}m`);
    if (!timeLeft.days && !timeLeft.hours) parts.push(`${timeLeft.seconds}s`);
    return parts.join(' ');
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full text-center mb-2">
        <span className={`font-black text-mono-950 uppercase tracking-[0.2em] ${isSmall ? 'text-[8px]' : 'text-sm'}`}>
          {formatTime()}
        </span>
      </div>
      
      <div className={`w-full bg-mono-200 border-2 border-mono-950 rounded-none overflow-hidden ${isSmall ? 'h-3' : 'h-6'}`}>
        <motion.div
          className="h-full bg-mono-950 shadow-[inset_-2px_0_0_rgba(255,255,255,0.2)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
      
      {!isSmall && (
        <div className="mt-2 text-center">
          <span className="text-[8px] font-black text-mono-400 uppercase tracking-[0.3em]">
            TEMPORAL_LOCK_STATUS: ACTIVE
          </span>
        </div>
      )}
    </div>
  );
}
