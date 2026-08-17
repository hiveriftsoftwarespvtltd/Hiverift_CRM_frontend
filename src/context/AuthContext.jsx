import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import Swal from 'sweetalert2';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hiverift_token');
    if (token) {
      authAPI.me()
        .then(({ data }) => setUser(data.data))
        .catch(() => { localStorage.clear(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user: userData } = data.data;
    localStorage.setItem('hiverift_token', accessToken);
    localStorage.setItem('hiverift_refresh', refreshToken);
    localStorage.setItem('hiverift_userId', userData._id);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    const result = await Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#016139',
      cancelButtonColor: '#9AA7A3',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try { await authAPI.logout(); } catch {}
      localStorage.clear();
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
