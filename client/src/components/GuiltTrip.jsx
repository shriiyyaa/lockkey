import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WordleGame from './WordleGame';

export default function GuiltTrip({ onComplete, onCancel }) {
  const [step, setStep] = useState(1); // 1: Reflect, 2: TicTacToe, 3: Wordle, 4: Rationalize
  
  // TicTacToe State
  const [ticTacToeState, setTicTacToeState] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameMessage, setGameMessage] = useState("YOU CANNOT WIN.");
  
  // Rationale State
  const [rationalMessage, setRationalMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      setGameMessage("I TOLD YOU. SURRENDER.");
      return;
    } else if (winner === 'draw') {
        // Automatically progress after drawing. Unbeatable AI means Draw is a success.
        setGameMessage("STALEMATE DETECTED. PROCEEDING TO VERBAL PROTOCOL...");
        const timer = setTimeout(() => setStep(3), 2000);
        return () => clearTimeout(timer);
    }

    if (currentPlayer === 'O') {
      // AI's turn! Wait slightly for fairness UX
      const timer = setTimeout(() => {
        let bestScore = -Infinity;
        let move = -1;
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
        if (move !== -1) {
          const newState = [...ticTacToeState];
          newState[move] = 'O';
          setTicTacToeState(newState);
          setCurrentPlayer('X');
        }
      }, 600); // 600ms AI thought process
      
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
    }, 4000); // 4 second "analysis"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-mono-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="geometric-card max-w-lg w-full p-4 sm:p-8 overflow-y-auto max-h-[95vh]"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
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
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">SYSTEM_STRUGGLE (1/3)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">FORCE A STALEMATE TO PROCEED.</p>
              
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
                checkWinner(ticTacToeState) === 'draw' ? 'text-green-600 animate-pulse' : 'text-red-600'
              }`}>{gameMessage}</p>
              
              <div className="flex gap-4">
                <button onClick={resetTicTacToe} className="btn-secondary flex-1 py-2 text-[10px]">
                  RESTART ALGORITHM
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">VERBAL PROTOCOL (2/3)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">DECIPHER THE MASTER WORD TO CONTINUE.</p>
              
              <WordleGame 
                onWin={() => setStep(4)} 
                onLose={() => {
                  // Re-start from Wordle if they fail, or punt them to step 1!
                  setStep(1); 
                  resetTicTacToe();
                }} 
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="sub-heading text-mono-950 mb-2">INTEGRITY_CHECK (3/3)</h2>
              <p className="text-[10px] text-mono-400 font-bold mb-6 uppercase tracking-widest">EXPLAIN THE RATIONALE FOR THIS FAILURE.</p>
              
              <textarea
                value={rationalMessage}
                onChange={(e) => setRationalMessage(e.target.value)}
                className="input-field min-h-[120px] mb-6 resize-none"
                placeholder="BE HONEST. WHY DO YOU NEED TO BREAK YOUR ENCRYPTION RIGHT NOW?..."
              />
              
              {isAnalyzing ? (
                <div className="py-4">
                  <p className="text-[10px] font-black text-mono-500 uppercase tracking-[0.3em] mb-4 animate-pulse">ANALYZING_ANXIETY_LEVELS...</p>
                  <div className="h-2 bg-mono-100 border-2 border-mono-950 overflow-hidden">
                    <motion.div 
                      className="h-full bg-mono-950"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4 }}
                    />
                  </div>
                </div>
              ) : (
                <button 
                  disabled={rationalMessage.length < 50}
                  onClick={runAnalysis}
                  className={`w-full py-4 rounded-none font-black uppercase tracking-[0.2em] border-2 transition-all duration-200 ${
                    rationalMessage.length >= 50
                      ? 'bg-red-600 border-mono-950 text-ivory shadow-[4px_4px_0_0_#991b1b] hover:-translate-x-0.5 hover:-translate-y-0.5'
                      : 'bg-mono-100 border-mono-200 text-mono-400 opacity-50'
                  }`}
                >
                  SUBMIT_RATIONALE ({Math.max(0, 50 - rationalMessage.length)} MORE CHARS)
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
