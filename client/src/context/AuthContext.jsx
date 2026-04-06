import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        } catch (e) {
          console.error("AuthContext: Cached user corrupted, fetching fresh...");
        }
      }

      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('lockkey_user', JSON.stringify(res.data));
        })
        .catch(err => {
          console.error("AuthContext: Session verification failed:", err.message);
          logout(); // Clear invalid token
        })
        .finally(() => {
          if (!isCached) setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
    
    // Set immediate state for perceived speed
    setUser(res.data.user);
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    
    return res.data;
  };

  const signup = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const res = await api.post('/auth/signup', { name: cleanName, email: cleanEmail, password: cleanPassword });
    
    // Set immediate state for perceived speed
    setUser(res.data.user);
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('lockkey_token');
    localStorage.removeItem('lockkey_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
