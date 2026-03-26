import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import lawyersApi from '../api/lawyersApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === 'admin') {
          setLoading(false);
          return;
        }
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        const cached = localStorage.getItem('user');
        if (cached) setUser(JSON.parse(cached));
        const res = await lawyersApi.getProfile(decoded.id);
        const lawyer = res.data.data.lawyer;
        setUser(lawyer);
        localStorage.setItem('user', JSON.stringify(lawyer));
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (lawyer, token) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(lawyer));
    setUser(lawyer);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedLawyer) => {
    setUser(updatedLawyer);
    localStorage.setItem('user', JSON.stringify(updatedLawyer));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
