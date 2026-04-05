import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { theme: 'PALINDROMES', words: ['RADAR', 'KAYAK', 'CIVIC', 'LEVEL'] },
  { theme: 'GREEK LETTERS', words: ['DELTA', 'SIGMA', 'PI', 'OMEGA'] },
  { theme: 'US STATES (HOMOPHONES)', words: ['ALASKA', 'MAIN', 'OREGON', 'NEW'] },
  { theme: 'SILENT LETTERS', words: ['KNEAD', 'GNASH', 'WRATH', 'PITHY'] },
  { theme: 'PERIODIC TABLE', words: ['IRON', 'LEAD', 'GOLD', 'TIN'] },
  { theme: 'PLANETARY SYMBOLS', words: ['MARS', 'VENUS', 'CROSS', 'CRESCENT'] },
  { theme: 'HOMOPHONES OF NUMBERS', words: ['WON', 'TOO', 'FOR', 'ATE'] },
  { theme: 'CHESS PIECES', words: ['QUEEN', 'KING', 'ROOK', 'KNIGHT'] },
  { theme: 'PHONETIC ALPHABET', words: ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA'] },
  { theme: 'WORDS WITH SYMBOLS', words: ['DOLLAR', 'HASH', 'STAR', 'AT'] },
  { theme: 'NOBEL PRIZE CATS', words: ['PEACE', 'PHYSICS', 'ECON', 'MED'] },
  { theme: 'COMPUTER PORTS', words: ['USB', 'HDMI', 'SATA', 'VGA'] }
];

export default function ConnectionsGame({ onWin, onLose }) {
  const [currentSet, setCurrentSet] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [foundCategories, setFoundCategories] = useState([]);
  const [shuffleOrder, setShuffleOrder] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong

  useEffect(() => {
    generateNewSet();
  }, []);

  const generateNewSet = () => {
    // Pick 4 random categories for extreme difficulty
    const available = [...CATEGORIES];
    const cat1 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const cat2 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const cat3 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const cat4 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    
    const combined = [...cat1.words, ...cat2.words, ...cat3.words, ...cat4.words];
    const shuffled = combined.sort(() => Math.random() - 0.5);
    
    setCurrentSet([cat1, cat2, cat3, cat4]);
    setFoundCategories([]);
    setSelectedWords([]);
    setShuffleOrder(shuffled);
    setStatus('idle');
  };

  const handleWordClick = (word) => {
    if (status !== 'idle') return;
    if (foundCategories.some(c => c.words.includes(word))) return;

    setSelectedWords(prev => {
      if (prev.includes(word)) return prev.filter(w => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  };

  const checkSelection = () => {
    if (selectedWords.length !== 4) return;

    const matchedCat = currentSet.find(cat => 
      cat.words.every(w => selectedWords.includes(w))
    );

    if (matchedCat) {
      const nextFound = [...foundCategories, matchedCat];
      setFoundCategories(nextFound);
      setSelectedWords([]);
      setStatus('correct');
      setTimeout(() => setStatus('idle'), 1000);

      if (nextFound.length === 4) {
        setTimeout(onWin, 1500);
      }
    } else {
      setStatus('wrong');
      onLose();
      setTimeout(() => {
        setStatus('idle');
        setSelectedWords([]);
      }, 1000);
    }
  };

  const isWordFound = (word) => foundCategories.some(c => c.words.includes(word));

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-4">
      <div className="text-center">
        <h3 className="text-lg font-black text-mono-950 uppercase tracking-tighter mb-1">
          STAGE 4: LOGIC_LINKS
        </h3>
        <p className="text-[9px] text-mono-500 font-bold uppercase tracking-widest leading-loose">
          GROUP 16 WORDS INTO 4 CATEGORIES OF 4.
        </p>
      </div>

      {/* Found Categories */}
      <div className="w-full flex flex-col gap-1.5 mb-2">
        {foundCategories.map(cat => (
          <motion.div 
            key={cat.theme}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-mono-950 text-ivory p-3 border-2 border-mono-950 text-center font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0_0_#3f3f46]"
          >
            {cat.theme}: {cat.words.join(', ')}
          </motion.div>
        ))}
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full max-w-sm">
        {shuffleOrder.map(word => {
          const isSelected = selectedWords.includes(word);
          const isFound = isWordFound(word);

          if (isFound) return null;

          return (
            <button
              key={word}
              onClick={() => handleWordClick(word)}
              className={`h-14 sm:h-16 border-2 font-black text-[10px] sm:text-xs transition-all duration-200 uppercase tracking-tighter
                ${isSelected 
                  ? 'bg-mono-950 text-ivory border-mono-950 shadow-none' 
                  : 'bg-ivory text-mono-950 border-mono-950 shadow-[2px_2px_0_0_#3f3f46] hover:bg-mono-50'}
              `}
            >
              {word}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4 w-full max-w-[280px]">
        <button 
          onClick={checkSelection} 
          disabled={selectedWords.length !== 4 || status !== 'idle'} 
          className="btn-primary flex-1 py-3 text-[10px] font-black uppercase tracking-widest"
        >
          CHECK_GROUP
        </button>
        <button onClick={generateNewSet} className="btn-secondary flex-1 py-3 text-[10px] font-black uppercase tracking-widest opacity-80">
          SHUFFLE_SET
        </button>
      </div>

      <div className="h-6">
        <AnimatePresence>
          {status === 'wrong' && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-[10px] font-black uppercase tracking-widest"
            >
              INVALID_CONNECTION_DETECTED.
            </motion.p>
          )}
          {foundCategories.length === 2 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-green-600 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse"
            >
              LOGIC_SYNC_SUCCESSFUL.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
