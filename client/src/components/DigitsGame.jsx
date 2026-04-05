import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OPERATORS = ['+', '-', '×', '÷'];

export default function DigitsGame({ onWin, onLose }) {
  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [selectedNumIndex, setSelectedNumIndex] = useState(null);
  const [selectedOp, setSelectedOp] = useState(null);
  const [history, setHistory] = useState([]);

  // Generate a solvable puzzle
  useEffect(() => {
    generatePuzzle();
  }, []);

  const generatePuzzle = () => {
    const nums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 15) + 3);
    let current = nums[0];
    const ops = ['+', '-', '*']; 
    
    for (let i = 1; i < nums.length; i++) {
      const op = ops[Math.floor(Math.random() * ops.length)];
      if (op === '+') current += nums[i];
      else if (op === '-') current -= nums[i];
      else if (op === '*') current *= nums[i];
    }

    if (current < 200 || current > 800) {
      generatePuzzle(); 
      return;
    }

    setTarget(current);
    setNumbers(nums.map((val, id) => ({ id, val, active: true })));
    setHistory([]);
    setSelectedNumIndex(null);
    setSelectedOp(null);
  };

  const handleNumClick = (index) => {
    if (!numbers[index].active) return;

    if (selectedNumIndex === null) {
      setSelectedNumIndex(index);
    } else if (selectedOp !== null) {
      // Perform operation
      const n1 = numbers[selectedNumIndex];
      const n2 = numbers[index];
      let result;
      
      const op = selectedOp;
      if (op === '+') result = n1.val + n2.val;
      else if (op === '-') result = n1.val - n2.val;
      else if (op === '×') result = n1.val * n2.val;
      else if (op === '÷') {
        if (n1.val % n2.val !== 0) return; // Only allow clean division
        result = n1.val / n2.val;
      }

      // Update state
      const nextNumbers = [...numbers];
      nextNumbers[selectedNumIndex] = { ...n1, active: false };
      nextNumbers[index] = { ...n2, val: result };
      
      setHistory([...history, [...numbers]]);
      setNumbers(nextNumbers);
      setSelectedNumIndex(null);
      setSelectedOp(null);

      // Check win
      if (result === target) {
        setTimeout(onWin, 1500);
      }
    } else {
      // Change selection
      setSelectedNumIndex(index);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setNumbers(prev);
    setHistory(history.slice(0, -1));
    setSelectedNumIndex(null);
    setSelectedOp(null);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-mono-950 uppercase tracking-tighter mb-1">
          STAGE 3: DIGITS_CONVERGENCE
        </h3>
        <p className="text-[9px] text-mono-500 font-bold uppercase tracking-widest leading-loose">
          USE ALL NUMBERS TO REACH THE TARGET.
        </p>
      </div>

      {/* Target display */}
      <div className="bg-mono-950 p-4 w-24 h-24 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-[0_6px_0_0_#3f3f46]">
        <span className="text-[8px] font-black text-mono-400 tracking-widest uppercase mb-0.5">TARGET</span>
        <span className="text-3xl sm:text-4xl font-black text-ivory font-mono">{target}</span>
      </div>

      {/* Numbers */}
      <div className="flex gap-2 sm:gap-4 flex-wrap justify-center max-w-[300px]">
        {numbers.map((n, i) => (
          <button
            key={n.id}
            onClick={() => handleNumClick(i)}
            disabled={!n.active}
            className={`w-12 h-12 sm:w-16 sm:h-16 border-2 font-black text-lg transition-all duration-200 flex items-center justify-center
              ${!n.active ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
              ${selectedNumIndex === i 
                ? 'bg-mono-950 text-ivory border-mono-950 shadow-none -translate-y-1' 
                : 'bg-ivory text-mono-950 border-mono-950 shadow-[3px_3px_0_0_#3f3f46] hover:bg-mono-50'}
            `}
          >
            {n.val}
          </button>
        ))}
      </div>

      {/* Operators */}
      <div className="flex gap-2">
        {OPERATORS.map(op => (
          <button
            key={op}
            onClick={() => setSelectedOp(op)}
            className={`w-10 h-10 border-2 font-black text-lg transition-all flex items-center justify-center
              ${selectedOp === op 
                ? 'bg-mono-950 text-ivory border-mono-950' 
                : 'bg-mono-100 text-mono-950 border-mono-400 hover:bg-mono-200'}
            `}
          >
            {op}
          </button>
        ))}
      </div>

      <div className="flex gap-4 w-full max-w-[280px]">
        <button onClick={undo} disabled={history.length === 0} className="btn-secondary flex-1 py-2 text-[10px] font-black uppercase tracking-widest opacity-80 disabled:opacity-30">
          UNDO_MOVE
        </button>
        <button onClick={() => {
          onLose();
          generatePuzzle();
        }} className="btn-secondary flex-1 py-2 text-[10px] font-black uppercase tracking-widest opacity-80">
          RECALIBRATE (-1 L)
        </button>
      </div>

      <AnimatePresence>
        {numbers.some(n => n.active && n.val === target) && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-600 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse"
          >
            REACHED_TARGET_ACCEPTED.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
