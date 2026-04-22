import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('lockkey_token');
    localStorage.removeItem('lockkey_user');
    setUser(null);
  }, []);

  useEffect(() => {
    // PRE-WARM PROTOCOL: Wake up the server as soon as the app loads to mitigate cold starts
    fetch('https://lockkey-h8ib.onrender.com/api/locks/stats', { mode: 'no-cors' }).catch(() => {});

    const token = localStorage.getItem('lockkey_token');
    const savedUser = localStorage.getItem('lockkey_user');

    // RECOVERY MODE: If we have a token, we can ALWAYS try to fetch the user profile
    // even if the cached 'lockkey_user' is missing or corrupted.
    if (token) {
      let isCached = false;
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setLoading(false); // OPTIMISTIC LOADING: Show the app instantly!
          isCached = true;
        } catch {
          console.error("AuthContext: Cached user corrupted, fetching fresh...");
        }
      }

      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('lockkey_user', JSON.stringify(res.data));
        })
        .catch(() => {
          logout(); // Clear invalid token
        })
        .finally(() => {
          if (!isCached) setLoading(false);
        });
    } else {
      setLoading(false);
    }
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
