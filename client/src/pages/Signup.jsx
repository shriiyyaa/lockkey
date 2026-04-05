import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          setError('PROTOCOL_WARMUP: SYSTEM INITIALIZING. PLEASE WAIT 30s AND RETRY.');
        } else {
          setError('SERVER_OFFLINE: UNABLE TO CONNECT TO PROTOCOL');
        }
      } else {
        setError(err.response.data.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mono-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2352525b\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <motion.div
           initial={{ y: -10, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.4 }}
        >
          <h2 className="heading-primary mt-4 mb-1">
            lockkey
          </h2>
          <p className="sub-heading text-mono-400">
            CREATE_IDENTITY SEQUENCE.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="geometric-card py-8 px-4 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="bg-red-100 border-2 border-red-600 text-red-600 text-[10px] font-black px-4 py-2 rounded-none shadow-[3px_3px_0_0_#991b1b] uppercase tracking-widest" 
                id="error-message"
              >
                [!] REG_ERROR: {error.toUpperCase()}
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-black text-mono-950 uppercase tracking-[0.2em] mb-2">
                01. FULL_NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="John Doe"
                id="input-signup-name"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-mono-950 uppercase tracking-[0.2em] mb-2">
                02. EMAIL_ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                id="input-signup-email"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-mono-950 uppercase tracking-[0.2em] mb-2">
                03. ACCESS_KEY
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Min 6 characters"
                  minLength={6}
                  id="input-signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mono-400 hover:text-mono-950 transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                id="btn-signup"
                className="btn-primary w-full"
              >
                {loading ? 'REGISTERING...' : 'INITIALIZE ACCOUNT'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-mono-200 text-center">
            <p className="font-black text-[10px] text-mono-500 uppercase tracking-[0.15em]">
              EXISTING IDENTITY FOUND?{' '}
              <Link to="/login" className="text-mono-950 underline decoration-2 hover:bg-mono-950 hover:text-ivory transition-all px-1">
                ACCESS_SYSTEM
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
