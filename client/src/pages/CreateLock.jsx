import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const PLATFORMS = [
  { name: 'Twitter / X', icon: '🐦' },
  { name: 'Instagram', icon: '📸' },
  { name: 'TikTok', icon: '🎵' },
  { name: 'YouTube', icon: '▶️' },
  { name: 'Reddit', icon: '🔶' },
  { name: 'Facebook', icon: '👤' },
  { name: 'Snapchat', icon: '👻' },
  { name: 'Discord', icon: '🎮' },
  { name: 'LinkedIn', icon: '💼' },
  { name: 'Twitch', icon: '🟣' },
];

export default function CreateLock() {
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [durationVal, setDurationVal] = useState('1');
  const [durationUnit, setDurationUnit] = useState('hours');
  const [futureMessage, setFutureMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const selectedPlatform = platform === 'custom' ? customPlatform : platform;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPlatform.trim()) {
      setError('Please select or enter a platform name');
      return;
    }
    if (!password) {
      setError('Please enter the password to lock');
      return;
    }

    setLoading(true);
    try {
      const val = parseInt(durationVal);
      if (isNaN(val) || val < 1) {
        setError('Please enter a valid lock duration');
        setLoading(false);
        return;
      }
      
      const multipliers = { minutes: 1, hours: 60, days: 1440, weeks: 10080 };
      const durationMinutes = val * multipliers[durationUnit];

      if (durationMinutes < 30) {
        setError('Minimum lock duration is 30 minutes. Shorter locks defeat the purpose.');
        setLoading(false);
        return;
      }

      if (durationMinutes > 129600) { // 90 days
        setError('Maximum lock duration is 90 days. Contact support for longer commitments.');
        setLoading(false);
        return;
      }

      await api.post('/locks', {
        platform: selectedPlatform.trim(),
        password,
        durationMinutes,
        futureMessage: futureMessage.trim()
      });

      // Clear clipboard for security
      try {
        await navigator.clipboard.writeText('');
      } catch (err) {
        console.error('Failed to clear clipboard:', err);
      }

      setPassword(''); // Clear memory
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 text-center sm:text-left">
          <h1 className="heading-primary mb-1">USER: INITIATE LOCK</h1>
          <p className="text-subtle">ESTABLISH A NEW FOCUS COMMITMENT.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-100 border-2 border-red-600 text-red-600 font-bold px-3 py-2 rounded-none shadow-[3px_3px_0_0_#991b1b]"
            >
              [!] ERROR: {error.toUpperCase()}
            </motion.div>
          )}

          {/* Platform Selection */}
          <div className="geometric-card p-6 sm:p-8">
            <label className="sub-heading text-mono-950 mb-4 block">
              01. TARGET SYSTEM
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
              {PLATFORMS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setPlatform(p.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-none text-[9px] border-2 transition-all duration-200 ${
                    platform === p.name
                      ? 'bg-mono-950 border-mono-950 text-ivory shadow-[2px_2px_0_0_#3f3f46] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-mono-100 border-mono-200 text-mono-500 hover:border-mono-950 hover:text-mono-950'
                  }`}
                >
                  <span className="font-black uppercase tracking-widest">{p.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPlatform('custom')}
              className={`w-full p-2 rounded-none text-[9px] font-black uppercase tracking-widest border-2 transition-all duration-200 ${
                platform === 'custom'
                  ? 'bg-mono-950 text-ivory border-mono-950'
                  : 'bg-mono-50 text-mono-400 border-dashed border-mono-300 hover:border-solid hover:border-mono-950 hover:text-mono-950'
              }`}
            >
              + SPECIFY CUSTOM TARGET
            </button>
            {platform === 'custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                <input
                  type="text"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="input-field"
                  placeholder="Enter platform name..."
                  id="input-custom-platform"
                />
              </motion.div>
            )}
          </div>

          {/* Password */}
          <div className="geometric-card p-6 sm:p-8">
             <label htmlFor="input-lock-password" className="sub-heading text-mono-950 mb-1 block">
              02. ACCESS KEY
            </label>
            <p className="text-[10px] font-bold text-mono-400 mb-4 uppercase tracking-widest">
              THIS DATA WILL BE ENCRYPTED. ACCESS DENIED UNTIL EXPIRY.
            </p>
            <div className="relative">
              <input
                id="input-lock-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-16 text-lg"
                placeholder="Paste the target password here"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-950 text-[10px] font-black transition-colors uppercase tracking-widest bg-ivory pl-2"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="geometric-card p-6 sm:p-8">
            <label className="sub-heading text-mono-950 mb-4 block">
              03. LOCK DURATION
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                min="1"
                value={durationVal}
                onChange={(e) => setDurationVal(e.target.value)}
                className="input-field w-1/3 text-center text-3xl font-extrabold pb-3"
                id="input-duration-val"
              />
              <select
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
                className="input-field flex-1 bg-mono-900/40 text-white font-black text-xl tracking-wide uppercase cursor-pointer"
                id="select-duration-unit"
              >
                <option value="minutes">MINS</option>
                <option value="hours">HOURS</option>
                <option value="days">DAYS</option>
                <option value="weeks">WEEKS</option>
              </select>
            </div>
          </div>

          {/* Future Me Message */}
          <div className="geometric-card p-6 sm:p-8">
            <label htmlFor="input-future-message" className="sub-heading text-mono-950 mb-1 block">
              04. PROTOCOL NOTE
            </label>
            <p className="text-[10px] font-black text-mono-400 mb-4 uppercase tracking-widest">
              MESSAGE TO YOUR FUTURE SELF. (OPTIONAL)
            </p>
            <textarea
              id="input-future-message"
              value={futureMessage}
              onChange={(e) => setFutureMessage(e.target.value)}
              className="input-field min-h-[120px] resize-none"
              placeholder="e.g. I need to finish reading that book before scrolling again..."
              maxLength={500}
            />
            <div className="text-right mt-2">
              <span className="text-xs font-bold text-mono-400 uppercase tracking-widest">{futureMessage.length}/500</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary w-1/3"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !selectedPlatform.trim() || !password}
              id="btn-create-lock"
              className="btn-primary w-2/3 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? (
                <span className="animate-spin">LOADING...</span>
              ) : (
                <>EXECUTE LOCK SEQUENCE</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
