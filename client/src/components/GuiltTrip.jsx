import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WordleGame from './WordleGame';
import StroopTest from './StroopTest';
import DigitsGame from './DigitsGame';
import ConnectionsGame from './ConnectionsGame';

export default function GuiltTrip({ lockId, onComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: Reflect, 2: TicTacToe, 3: Wordle, 4: Digits, 5: Connections, 6: Stroop, 7: Rationalize
  
  // TicTacToe State
  const [ticTacToeState, setTicTacToeState] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameMessage, setGameMessage] = useState("YOU CANNOT WIN.");
  
  // Rationale State
  const [rationalMessage, setRationalMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Extreme Life Limit
  const [lives, setLives] = useState(5);
  const [isLockedOut, setIsLockedOut] = useState(false);

  const handleLoss = () => {
    setLives(prev => {
      const next = prev - 1;
      if (next <= 0) {
        setIsLockedOut(true);
        // Persist the failure to the backend
        if (lockId) {
          import('../utils/api').then(m => {
            m.default.post(`/locks/${lockId}/fail-bypass`).catch(console.error);
          });
        }
      }
      return next;
    });
  };

  // --- TIC TAC TOE LOGIC ---
  const checkWinner = (board) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes(null) ? null : 'draw';
  };

  const minimax = (board, depth, isMaximizing) => {
    const result = checkWinner(board);
    if (result === 'O') return 10 - depth;
    if (result === 'X') return depth - 10;
    if (result === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  useEffect(() => {
    if (step !== 2) return;
    
    const winner = checkWinner(ticTacToeState);
    if (winner === 'O') {
      setGameMessage("I TOLD YOU. SURRENDER. REBOOTING...");
      handleLoss(); // Consume life on loss
      const timer = setTimeout(resetTicTacToe, 2000);
      return () => clearTimeout(timer);
    } else if (winner === 'X') {
        setGameMessage("SYSTEM DEFEATED. PROCEEDING TO VERBAL PROTOCOL...");
        const timer = setTimeout(() => setStep(3), 2000);
        return () => clearTimeout(timer);
    } else if (winner === 'draw') {
        setGameMessage("STALEMATE DETECTED. YOU MUST *DEFEAT* ME. REBOOTING...");
        handleLoss(); // Consume life on draw (failure to beat system)
        const timer = setTimeout(resetTicTacToe, 2000);
        return () => clearTimeout(timer);
    }

    if (currentPlayer === 'O') {
      const timer = setTimeout(() => {
        let move = -1;
        
        // 30% "Human Error" Factor for 70% Difficulty
        const shouldMakeError = Math.random() < 0.3;
        const availableMoves = [];
        ticTacToeState.forEach((val, i) => { if (val === null) availableMoves.push(i); });

        if (shouldMakeError && availableMoves.length > 0) {
          move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        } else {
          // Use perfect Minimax if no error is made
          let bestScore = -Infinity;
          for (let i = 0; i < 9; i++) {
            if (ticTacToeState[i] === null) {
              let board = [...ticTacToeState];
              board[i] = 'O';
              let score = minimax(board, 0, false);
              board[i] = null;
              if (score > bestScore) {
                bestScore = score;
                move = i;
              }
            }
          }
        }

        if (move !== -1) {
          const newState = [...ticTacToeState];
          newState[move] = 'O';
          setTicTacToeState(newState);
          setCurrentPlayer('X');
        }
      }, 600); 
      
      return () => clearTimeout(timer);
    }
  }, [ticTacToeState, currentPlayer, step]);

  const handleUserMove = (index) => {
    if (currentPlayer !== 'X' || ticTacToeState[index] || checkWinner(ticTacToeState)) return;
    const newState = [...ticTacToeState];
    newState[index] = 'X';
    setTicTacToeState(newState);
    setCurrentPlayer('O');
  };

  const resetTicTacToe = () => {
    setTicTacToeState(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameMessage("YOU CANNOT WIN.");
  };

  // --- FINAL ANALYSIS ---
  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      onComplete();
    }, 3000); // 3 second mandatory "reflection" wait
  };

  const validateRationale = (text) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 2);
    const uniqueWords = new Set(words);
    const hasRepetitiveJunk = /(.)\1{4,}/.test(text); // e.g. "aaaaa"
    
    return text.length >= 400 && uniqueWords.size >= 20 && !hasRepetitiveJunk;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="geometric-card max-w-lg w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] sm:max-h-[92vh] flex flex-col justify-center relative"
      >
        {/* Extreme Barrier UI */}
        {!isLockedOut && (
          <div className="absolute top-2 right-4 flex gap-1 items-center">
            <span className="text-[8px] font-black text-mono-400 uppercase tracking-widest">SYSTEM_STAMINA:</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 border border-mono-950 ${i < lives ? 'bg-red-600 shadow-[1px_1px_0_0_#000]' : 'bg-mono-200'}`} />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLockedOut ? (
            <motion.div 
              key="lockout"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <h2 className="heading-primary text-red-600 mb-4 animate-pulse">ACCESS_DENIED</h2>
              <p className="text-sm font-black text-mono-950 mb-8 uppercase tracking-tighter leading-relaxed">
                "YOU HAVE EXHAUSTED ALL DECRYPTION ATTEMPTS. YOUR DISCIPLINE HAS FAILED. SYSTEM PERMANENTLY LOCKED FOR THIS SESSION."
              </p>
              <button onClick={onCancel} className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.3em]">
                EXIT_SHAMEFULLY
              </button>
            </motion.div>
          ) : step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="heading-primary text-red-600 mb-6">EMERGENCY_OVERRIDE_REQUESTED</h2>
              <p className="text-sm font-black text-mono-950 mb-8 leading-relaxed uppercase tracking-tighter">
                "YOU ARE ABOUT TO DESTROY YOUR OWN PROGRESS. THIS MOMENT OF WEAKNESS WILL DEFINE YOUR DAY. IS YOUR DISCIPLINE REALLY THIS FRAGILE?"
              </p>
              <div className="space-y-4">
                <button onClick={() => setStep(2)} className="btn-danger w-full">
                  YES, I AM WEAK
                </button>
                <button onClick={onCancel} className="btn-secondary w-full">
                  NO, WAIT. I CAN DO THIS.
                </button>
              </div>
            </motion.div>
          ) : !isLockedOut && step === 2 ? (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">SYSTEM_STRUGGLE (1/5)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">DEFEAT THE SYSTEM TO PROCEED.</p>
              
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-6">
                {ticTacToeState.map((cell, i) => (
                  <button
                    key={i}
                    onClick={() => handleUserMove(i)}
                    disabled={currentPlayer !== 'X' || cell !== null || checkWinner(ticTacToeState) !== null}
                    className="h-16 border-2 border-mono-950 flex items-center justify-center text-2xl font-black transition-colors bg-mono-50 hover:bg-mono-100 disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    {cell}
                  </button>
                ))}
              </div>
              
              <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${
                checkWinner(ticTacToeState) === 'X' ? 'text-green-600 animate-pulse' : 'text-red-600'
              }`}>{gameMessage}</p>
              
              <div className="flex gap-4">
                <button onClick={resetTicTacToe} className="btn-secondary flex-1 py-2 text-[10px]">
                  RESTART ALGORITHM
                </button>
              </div>
            </motion.div>
          ) : !isLockedOut && step === 3 ? (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">VERBAL PROTOCOL (2/5)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">DECIPHER THE MASTER WORD TO CONTINUE.</p>
              
              <WordleGame 
                onWin={() => setStep(4)} 
                onLose={handleLoss} 
              />
            </motion.div>
          ) : !isLockedOut && step === 4 ? (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">DIGITS_CONVERGENCE (3/5)</h2>
              <DigitsGame onWin={() => setStep(5)} onLose={handleLoss} />
            </motion.div>
          ) : !isLockedOut && step === 5 ? (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">LOGIC_LINKS (4/5)</h2>
              <ConnectionsGame onWin={() => setStep(6)} onLose={handleLoss} />
            </motion.div>
          ) : !isLockedOut && step === 6 ? (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">COGNITIVE_CONFLICT (5/5)</h2>
              <StroopTest onComplete={() => setStep(7)} onLose={handleLoss} />
            </motion.div>
          ) : !isLockedOut && step === 7 ? (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">INTEGRITY_CHECK (FINAL)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">EXPLAIN THE RATIONALE FOR THIS FAILURE.</p>
              
              <textarea
                value={rationalMessage}
                onChange={(e) => setRationalMessage(e.target.value)}
                className="input-field min-h-[120px] mb-6 resize-none"
                placeholder="BE HONEST. WHY DO YOU NEED TO BREAK YOUR ENCRYPTION RIGHT NOW?..."
              />
              
              {isAnalyzing ? (
                <div className="py-4">
                  <p className="text-[10px] font-black text-mono-500 uppercase tracking-[0.3em] mb-4 animate-pulse text-center">FINAL_PSYCHOLOGICAL_REVIEW_IN_PROGRESS...</p>
                  <div className="h-2 bg-mono-100 border-2 border-mono-950 overflow-hidden">
                    <motion.div 
                      className="h-full bg-red-600"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                  <p className="text-[8px] text-mono-400 mt-4 text-center uppercase tracking-widest">DO NOT CLOSE. REFLECT ON YOUR FAILURE.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <button 
                    disabled={!validateRationale(rationalMessage)}
                    onClick={runAnalysis}
                    className={`w-full py-4 rounded-none font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 ${
                      validateRationale(rationalMessage)
                        ? 'bg-red-600 border-mono-950 text-ivory shadow-[4px_4px_0_0_#991b1b] hover:-translate-x-0.5 hover:-translate-y-0.5'
                        : 'bg-mono-100 border-mono-200 text-mono-400 opacity-50'
                    }`}
                  >
                    SUBMIT_FINAL_RATIONALE
                  </button>
                  
                  {!validateRationale(rationalMessage) && rationalMessage.length > 0 && (
                    <div className="text-[8px] text-left space-y-1 font-bold text-red-500 uppercase tracking-widest">
                      {rationalMessage.length < 400 && <p>• MINIMUM 400 CHARACTERS ({400 - rationalMessage.length} REMAINING)</p>}
                      {new Set(rationalMessage.trim().split(/\s+/).filter(w => w.length > 2)).size < 20 && <p>• MINIMUM 20 UNIQUE SUBSTANTIVE WORDS</p>}
                      {/(.)\1{4,}/.test(rationalMessage) && <p>• GIBBERISH/REPETITIVE TEXT DETECTED</p>}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
