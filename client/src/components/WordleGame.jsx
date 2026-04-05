import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

const WORDS = [
  'ABOVE', 'ALONE', 'AMUSE', 'ANGEL', 'ANGRY', 'APPLE', 'ASSET', 'AWAKE', 'BASIC', 'BEACH',
  'BEGUN', 'BERRY', 'BLACK', 'BLADE', 'BLOCK', 'BLOOM', 'BOARD', 'BRAVE', 'BREAD', 'BREAK',
  'BRICK', 'BRIDGE', 'BRIEF', 'BRIGHT', 'BROAD', 'BRUSH', 'BUILD', 'BURST', 'CABLE', 'CALM',
  'CANDY', 'CAUSE', 'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF',
  'CHILD', 'CHINA', 'CHOIR', 'CHUCK', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLIMB',
  'CLOCK', 'CLOSE', 'CLOUD', 'COACH', 'COAST', 'COINS', 'COLOR', 'COUNT', 'COURT', 'COVER',
  'CRAFT', 'CRASH', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CURVE', 'CYCLE', 'DAILY',
  'DANCE', 'DATER', 'DEATH', 'DEBIT', 'DELAY', 'DEPTH', 'DIRTY', 'DOUBT', 'DRAFT', 'DRAMA',
  'DREAM', 'DRESS', 'DRINK', 'DRIVE', 'EARLY', 'EARTH', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER',
  'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT',
  'FIELD', 'FIFTH', 'FIGHT', 'FINAL', 'FIRST', 'FLAME', 'FLASH', 'FLOAT', 'FLOOR', 'FLUID',
  'FOCUS', 'FORCE', 'FORUM', 'FOUND', 'FRAME', 'FRESH', 'FRONT', 'FRUIT', 'GLASS', 'GLOBE',
  'GLOVE', 'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRAPE', 'GRAPH', 'GRASS', 'GREAT', 'GREEN',
  'GREET', 'GROUP', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HABIT', 'HANDY', 'HAPPY', 'HEART',
  'HEAVY', 'HENCE', 'HONOR', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE', 'INDEX',
  'INNER', 'INPUT', 'ISSUE', 'JOINT', 'JUDGE', 'JUICE', 'KNIFE', 'LABEL', 'LABOR', 'LAYER',
  'LEASE', 'LEAST', 'LEMON', 'LEVEL', 'LIGHT', 'LIMIT', 'LOCAL', 'LOGIC', 'LOOSE', 'LUCKY',
  'LUNCH', 'LYRIC', 'MAGIC', 'MAJOR', 'MAKER', 'MANGO', 'MARCH', 'MATCH', 'METAL', 'METER',
  'MIDST', 'MIGHT', 'MINOR', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUSE', 'MOUTH',
  'MOVIE', 'MUSIC', 'NIGHT', 'NOBLE', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR',
  'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUTER', 'OWNER', 'PANEL', 'PAPER', 'PARTY',
  'PEACE', 'PEACH', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PIECE', 'PILOT', 'PITCH', 'PIXEL',
  'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE',
  'PRIDE', 'PRIME', 'PRINT', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET',
  'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'RELAX', 'REPLY',
  'RIGHT', 'RIVER', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE',
  'SCORE', 'SENSE', 'SERVE', 'SHAKE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT',
  'SHIRT', 'SHOCK', 'SHOOT', 'SHORE', 'SHORT', 'SHOUT', 'SIGHT', 'SINCE', 'SKILL', 'SLEEP',
  'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE', 'SOUND', 'SOUTH',
  'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPLIT', 'SPORT', 'STAFF', 'STAGE', 'STAKE',
  'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK', 'STILL', 'STOCK', 'STONE', 'STORE',
  'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER',
  'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERMS', 'THANK', 'THEFT',
  'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE',
  'THROW', 'TIGER', 'TIGHT', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER',
  'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRUCK', 'TRUST',
  'TRUTH', 'TWICE', 'UNCLE', 'UNDER', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN',
  'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE', 'WASTE',
  'WATCH', 'WATER', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WORLD', 'WORRY',
  'WORSE', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'YOUTH', 'ZONES'
];
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export default function WordleGame({ onWin, onLose }) {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameOver) return;

      if (e.key === 'Enter') {
        if (currentGuess.length !== WORD_LENGTH) return;
        
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === targetWord) {
          setGameOver(true);
          setTimeout(onWin, 1500);
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameOver(true);
          setTimeout(() => {
            setGuesses([]);
            setCurrentGuess('');
            setGameOver(false);
            setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
            if (onLose) onLose();
          }, 2500);
        }
      } else if (e.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => (prev + e.key).toUpperCase());
        }
      }
    },
    [currentGuess, gameOver, guesses, targetWord, onWin, onLose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const evaluateGuess = (guess) => {
    const result = Array(WORD_LENGTH).fill('gray');
    const targetChars = targetWord.split('');
    const guessChars = guess.split('');

    // First pass: locate exact matches (green)
    guessChars.forEach((char, i) => {
      if (targetChars[i] === char) {
        result[i] = 'green';
        targetChars[i] = null; // Mark as used
        guessChars[i] = null;
      }
    });

    // Second pass: locate partial matches (yellow)
    guessChars.forEach((char, i) => {
      if (char !== null && targetChars.includes(char)) {
        result[i] = 'yellow';
        targetChars[targetChars.indexOf(char)] = null;
      }
    });

    return result;
  };

  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      // Completed row
      const evaluations = evaluateGuess(guesses[i]);
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {guesses[i].split('').map((char, j) => {
            const status = evaluations[j];
            let bgColor = 'bg-mono-50';
            let textColor = 'text-mono-950';
            if (status === 'green') {
              bgColor = 'bg-green-500';
              textColor = 'text-white';
            } else if (status === 'yellow') {
              bgColor = 'bg-yellow-400';
              textColor = 'text-mono-950';
            } else if (status === 'gray') {
              bgColor = 'bg-mono-300';
              textColor = 'text-white';
            }
            return (
              <motion.div
                key={j}
                initial={{ rotateX: -90 }}
                animate={{ rotateX: 0 }}
                transition={{ delay: j * 0.1, duration: 0.3 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg sm:text-xl border-2 border-mono-950 ${bgColor} ${textColor} uppercase`}
              >
                {char}
              </motion.div>
            );
          })}
        </div>
      );
    } else if (i === guesses.length) {
      // Current active row
      const emptyCells = Array(WORD_LENGTH - currentGuess.length).fill('');
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {currentGuess.split('').map((char, j) => (
            <div key={j} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-black text-lg sm:text-xl border-2 border-mono-950 bg-mono-100 text-mono-950 uppercase shadow-[2px_2px_0_0_#3f3f46]">
              {char}
            </div>
          ))}
          {emptyCells.map((_, j) => (
            <div key={`empty-${j}`} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-mono-300 bg-transparent"></div>
          ))}
        </div>
      );
    } else {
      // Empty future rows
      rows.push(
        <div key={i} className="flex gap-2 justify-center mb-2">
          {Array(WORD_LENGTH).fill('').map((_, j) => (
            <div key={`blank-${j}`} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-mono-200 bg-transparent"></div>
          ))}
        </div>
      );
    }
  }

  // Virtual Keyboard Data
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
  ];

  const handleVirtualKey = (key) => {
    if (key === 'ENTER') handleKeyDown({ key: 'Enter' });
    else if (key === '⌫') handleKeyDown({ key: 'Backspace' });
    else handleKeyDown({ key });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        {rows}
      </div>

      {gameOver && guesses.includes(targetWord) && (
        <p className="text-[10px] font-black text-green-600 mb-6 uppercase tracking-widest animate-pulse">
          ACCESS CODE ACCEPTED.
        </p>
      )}

      {gameOver && !guesses.includes(targetWord) && (
        <p className="text-[10px] font-black text-red-600 mb-6 uppercase tracking-widest animate-pulse">
          TARGET WAS "{targetWord}". RESTARTING PARADIGM.
        </p>
      )}
      
      {/* Virtual Keyboard */}
      <div className="flex flex-col gap-1 w-full max-w-full sm:max-w-[320px]">
        {keyboardRows.map((row, i) => (
          <div key={i} className="flex gap-1 justify-center">
            {row.map(key => {
              // Determine if key was guessed
              let keyBg = 'bg-mono-200';
              let keyText = 'text-mono-950';

              guesses.forEach(g => {
                const evaluations = evaluateGuess(g);
                g.split('').forEach((char, idx) => {
                  if (char === key) {
                    if (evaluations[idx] === 'green') {
                      keyBg = 'bg-green-500';
                      keyText = 'text-white';
                    } else if (evaluations[idx] === 'yellow' && keyBg !== 'bg-green-500') {
                      keyBg = 'bg-yellow-400';
                      keyText = 'text-mono-950';
                    } else if (evaluations[idx] === 'gray' && keyBg === 'bg-mono-200') {
                      keyBg = 'bg-mono-400';
                      keyText = 'text-mono-100';
                    }
                  }
                });
              });

              const isAction = key === 'ENTER' || key === '⌫';

              return (
                <button
                  key={key}
                  onClick={() => handleVirtualKey(key)}
                  className={`h-9 sm:h-10 text-[9px] sm:text-[10px] font-black border-2 border-mono-950 flex items-center justify-center transition-colors active:translate-y-px 
                    ${isAction ? 'px-1 sm:px-2 min-w-[2.5rem] sm:min-w-[3rem]' : 'flex-1'}
                    ${keyBg} ${keyText}
                  `}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      <p className="text-[8px] text-mono-400 mt-6 font-bold uppercase tracking-[0.3em]">
        PHYSICAL KEYBOARD DETECTED
      </p>
    </div>
  );
}
