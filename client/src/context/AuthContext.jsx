import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lockkey_token');
    const savedUser = localStorage.getItem('lockkey_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        api.get('/auth/me')
          .then(res => {
            setUser(res.data);
            localStorage.setItem('lockkey_user', JSON.stringify(res.data));
          })
          .catch(() => {
            localStorage.removeItem('lockkey_token');
            localStorage.removeItem('lockkey_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch (e) {
        // If JSON.parse fails, clear corrupted config
        localStorage.removeItem('lockkey_token');
        localStorage.removeItem('lockkey_user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const res = await api.post('/auth/signup', { name: cleanName, email: cleanEmail, password: cleanPassword });
    localStorage.setItem('lockkey_token', res.data.token);
    localStorage.setItem('lockkey_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
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
