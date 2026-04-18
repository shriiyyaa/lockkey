import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTO_HIDE_SECONDS = 10;

export default function SecurePasswordDisplay({ password }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [warning, setWarning] = useState(null); // 'screenshot' | 'tab-switch'
  const [copied, setCopied] = useState(false);

  const revealTimeout = useRef(null);
  const countdownInterval = useRef(null);

  const blurPassword = useCallback((reason) => {
    setIsRevealed(false);
    setSecondsLeft(null);
    clearTimeout(revealTimeout.current);
    clearInterval(countdownInterval.current);
    if (reason) setWarning(reason);
  }, []);

  const startReveal = useCallback(() => {
    setIsRevealed(true);
    setWarning(null);
    setSecondsLeft(AUTO_HIDE_SECONDS);

    clearTimeout(revealTimeout.current);
    clearInterval(countdownInterval.current);

    // Auto-hide after AUTO_HIDE_SECONDS
    revealTimeout.current = setTimeout(() => {
      blurPassword(null);
    }, AUTO_HIDE_SECONDS * 1000);

    // Live countdown
    countdownInterval.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [blurPassword]);

  const stopReveal = useCallback(() => {
    blurPassword(null);
  }, [blurPassword]);

  // Re-blur when tab loses focus or window blurs
  useEffect(() => {
    const handleWindowBlur = () => blurPassword('tab-switch');
    const handleVisibility = () => {
      if (document.hidden) blurPassword('tab-switch');
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [blurPassword]);

  // Detect screenshot keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMacScreenshot = e.metaKey && e.shiftKey && ['3', '4', '5', 's', 'S'].includes(e.key);
      const isWinScreenshot =
        e.key === 'PrintScreen' ||
        (e.metaKey && e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && ['s', 'S'].includes(e.key)) ||
        (e.altKey && e.key === 'PrintScreen'); // Alt+PrtSc (active window)

      if (isMacScreenshot || isWinScreenshot) {
        e.preventDefault(); // Won't always work, but worth trying
        blurPassword('screenshot');
        setTimeout(() => setWarning(null), 3000);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [blurPassword]);

  // Disable right-click on the reveal area
  const handleContextMenu = (e) => e.preventDefault();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = password;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="relative select-none"
      style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
      onContextMenu={handleContextMenu}
    >
      {/* Warning overlay */}
      <AnimatePresence>
        {warning && (
          <motion.div
            key={warning}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center border-2 border-red-600"
            style={{ background: 'rgba(220, 38, 38, 0.97)' }}
          >
            {warning === 'screenshot' ? (
              <>
                <span className="text-2xl mb-2">⚠️</span>
                <p className="text-ivory font-black text-[11px] uppercase tracking-[0.3em] text-center px-4">
                  SCREENSHOT DETECTED
                </p>
                <p className="text-red-200 font-bold text-[9px] uppercase tracking-widest mt-1">
                  KEY CONCEALED FOR SECURITY
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl mb-2">🔒</span>
                <p className="text-ivory font-black text-[11px] uppercase tracking-[0.3em] text-center px-4">
                  FOCUS LOST — KEY CONCEALED
                </p>
                <p className="text-red-200 font-bold text-[9px] uppercase tracking-widest mt-1">
                  RETURN TO TAB TO CONTINUE
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password box */}
      <div
        className="bg-mono-100 border-2 border-mono-950 p-6 mb-5 overflow-hidden relative"
        style={{ minHeight: '80px' }}
      >
        {/* The actual password — blurred when hidden */}
        <div
          style={{
            filter: isRevealed ? 'none' : 'blur(10px)',
            transition: 'filter 0.25s ease',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <code className="text-base sm:text-xl font-mono text-mono-950 font-black break-all tracking-normal">
            {password}
          </code>
        </div>

        {/* Blur overlay hint */}
        {!isRevealed && !warning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-mono-500 font-black text-[10px] uppercase tracking-[0.3em]">
              HOLD BUTTON BELOW TO REVEAL
            </p>
          </div>
        )}

        {/* Live countdown badge */}
        {isRevealed && secondsLeft !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-2 right-2 bg-mono-950 text-ivory font-black text-[9px] px-2 py-0.5 uppercase tracking-widest"
          >
            AUTO-HIDE: {secondsLeft}s
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* HOLD TO REVEAL — requires sustained interaction */}
        <button
          onPointerDown={startReveal}
          onPointerUp={stopReveal}
          onPointerLeave={stopReveal}
          onPointerCancel={stopReveal}
          onTouchStart={(e) => { e.preventDefault(); startReveal(); }}
          onTouchEnd={stopReveal}
          onContextMenu={handleContextMenu}
          className={`py-4 border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-150 cursor-pointer select-none ${
            isRevealed
              ? 'bg-mono-950 text-ivory border-mono-950'
              : 'bg-ivory text-mono-950 border-mono-950 shadow-[3px_3px_0_0_#3f3f46] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3f3f46]'
          }`}
        >
          {isRevealed ? `▐ REVEALING (${secondsLeft}s)` : '▐ HOLD TO REVEAL'}
        </button>

        {/* COPY — doesn't require revealing */}
        <button
          onClick={handleCopy}
          className={`py-4 border-2 font-black text-[10px] uppercase tracking-widest transition-all duration-150 ${
            copied
              ? 'bg-green-600 text-ivory border-green-800 shadow-none'
              : 'bg-ivory text-mono-950 border-mono-950 shadow-[3px_3px_0_0_#3f3f46] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3f3f46]'
          }`}
        >
          {copied ? '✓ COPIED' : 'COPY KEY'}
        </button>
      </div>

      <p className="text-[8px] font-black text-mono-400 uppercase tracking-[0.25em] text-center">
        RELEASE = INSTANT CONCEAL • SCREENSHOTS MONITORED • TAB SWITCH = AUTO-HIDE
      </p>
    </div>
  );
}
