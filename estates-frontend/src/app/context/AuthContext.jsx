import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);