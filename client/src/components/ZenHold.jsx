import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ZenHold({ onComplete }) {
  const [holding, setHolding] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  useEffect(() => {
    if (holding && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            clearInterval(timerRef.current);
            onComplete();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
      if (!holding && timeLeft > 0) {
        setTimeLeft(15); // Reset to 15 if released
      }
    }

    return () => clearInterval(timerRef.current);
  }, [holding, timeLeft, onComplete]);

  const handleStart = (e) => {
    e.preventDefault();
    setHolding(true);
  };

  const handleEnd = () => {
    setHolding(false);
  };

  const progress = ((15 - timeLeft) / 15) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-6">
      <div className="text-center">
        <h3 className="text-xl font-black text-mono-950 uppercase tracking-tighter mb-2">
          STAGE 3: ZEN_HOLD
        </h3>
        <p className="text-[10px] text-mono-500 font-bold uppercase tracking-widest leading-loose">
          DO NOT RELEASE UNTIL THE VOID ACCEPTS YOUR PATIENCE.
        </p>
      </div>

      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Progress ring background */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            className="fill-none stroke-mono-100 stroke-[10]"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            className="fill-none stroke-mono-950 stroke-[10]"
            strokeDasharray="100 100"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 100 - progress }}
            transition={{ type: 'tween', ease: 'linear' }}
          />
        </svg>

        {/* The Hold Button */}
        <button
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className={`relative z-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-mono-950 flex flex-col items-center justify-center transition-all duration-300 font-black uppercase text-xs tracking-widest select-none ${
            holding 
              ? 'bg-mono-950 text-ivory scale-95 shadow-inner' 
              : 'bg-ivory text-mono-950 shadow-[0_8px_0_0_#3f3f46] hover:shadow-[0_4px_0_0_#3f3f46] active:translate-y-1 active:shadow-none'
          }`}
        >
          {holding ? (
            <>
              <span className="text-2xl mb-1">{Math.ceil(timeLeft)}</span>
              <span className="text-[10px]">HOLDING...</span>
            </>
          ) : (
            <span>HOLD_TO_CALM</span>
          )}
        </button>
      </div>

      <div className="max-w-[200px] text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${
          holding ? 'text-green-600 animate-pulse' : 'text-red-500'
        }`}>
          {holding ? 'CALMING_OSCILLATION_DETECTED...' : 'RELEASE_DETECTED: TIMER_REBOOTED.'}
        </p>
      </div>
    </div>
  );
}
