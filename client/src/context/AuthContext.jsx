import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

// INSTANT INIT: Parse cached user synchronously at module load time
function getCachedUser() {
  try {
    const saved = localStorage.getItem('lockkey_user');
    const token = localStorage.getItem('lockkey_token');
    if (saved && token) return JSON.parse(saved);
  } catch { /* corrupted cache — ignore */ }
  return null;
}

export function AuthProvider({ children }) {
  // ZERO-LATENCY: If we have a cached user + token, we're immediately "logged in"
  // No loading state, no spinner, no waiting for /auth/me
  const [user, setUser] = useState(getCachedUser);
  const [loading, setLoading] = useState(() => !getCachedUser() && !!localStorage.getItem('lockkey_token'));

  const logout = useCallback(() => {
    localStorage.removeItem('lockkey_token');
    localStorage.removeItem('lockkey_user');
    localStorage.removeItem('lockkey_dashboard_locks');
    localStorage.removeItem('lockkey_dashboard_stats');
    setUser(null);
  }, []);

  useEffect(() => {
    // PRE-WARM: Wake up the server in the background (non-blocking, fire-and-forget)
    fetch('https://lockkey-h8ib.onrender.com/api/health', { mode: 'no-cors' }).catch(() => {});

    const token = localStorage.getItem('lockkey_token');
    if (!token) {
      setLoading(false);
      return;
    }

    // BACKGROUND SYNC: Silently validate + refresh user data
    // The UI is ALREADY showing the cached user — this just keeps it fresh
    api.get('/auth/me')
      .then(res => {
        setUser(res.data);
        localStorage.setItem('lockkey_user', JSON.stringify(res.data));
      })
      .catch(() => {
        logout(); // Token expired/invalid — force re-login
      })
      .finally(() => {
        setLoading(false);
      });
  }, [logout]);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    // NOTE: Do NOT trim password — spaces in passwords are valid
    const res = await api.post('/auth/login', { email: cleanEmail, password });
    
    setUser(res.data.user);
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    
    return res.data;
  };

  const signup = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    // NOTE: Do NOT trim password — spaces in passwords are valid
    const res = await api.post('/auth/signup', { name: cleanName, email: cleanEmail, password });
    
    setUser(res.data.user);
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
