import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("p2p_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.me(token)
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem("p2p_token"); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await authApi.login(email, password);
    localStorage.setItem("p2p_token", t);
    setToken(t); setUser(u);
    return u;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { token: t, user: u } = await authApi.register(username, email, password);
    localStorage.setItem("p2p_token", t);
    setToken(t); setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("p2p_token");
    setToken(null); setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
